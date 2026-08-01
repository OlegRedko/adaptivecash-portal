import { PortalApiError, type DocumentSummary, type SigningSession } from '@adaptivecash/api-client';
import type { DocumentsFeatureApi } from '../api';

export interface TestApiController {
  api: DocumentsFeatureApi;
  /** Every createSigningSession call, in order, so tests can assert on idempotency keys. */
  createCalls: { documentId: string; idempotencyKey: string }[];
  listCalls: { tenantId: string; search?: string; status?: string }[];
  /** Number of signing-session polls, so tests can assert polling stopped. */
  sessionPolls: number;
  failNextCreateWith(status: number, problem?: Record<string, unknown>): void;
  failNextList(): void;
  setListLatency(search: string, ms: number): void;
  setSessionStatus(status: SigningSession['status']): void;
  activeSession: SigningSession | null;
}

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (ms <= 0) return resolve();
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });

export function createTestApi(documents: DocumentSummary[]): TestApiController {
  const latency = new Map<string, number>();
  const createCalls: TestApiController['createCalls'] = [];
  const listCalls: TestApiController['listCalls'] = [];
  const sessionsByKey = new Map<string, SigningSession>();

  let nextCreateFailure: { status: number; problem: Record<string, unknown> } | null = null;
  let listShouldFail = false;
  let sessionStatus: SigningSession['status'] = 'Pending';
  let sequence = 0;

  const controller: TestApiController = {
    createCalls,
    listCalls,
    activeSession: null,
    sessionPolls: 0,
    failNextCreateWith(status, problem = {}) {
      nextCreateFailure = { status, problem };
    },
    failNextList() {
      listShouldFail = true;
    },
    setListLatency(search, ms) {
      latency.set(search, ms);
    },
    setSessionStatus(status) {
      sessionStatus = status;
      if (controller.activeSession) controller.activeSession.status = status;
      for (const session of sessionsByKey.values()) session.status = status;
    },
    api: {
      async listDocuments(tenantId, filters, signal) {
        listCalls.push({ tenantId, search: filters.search, status: filters.status });
        await wait(latency.get(filters.search ?? '') ?? 0, signal);

        if (listShouldFail) {
          listShouldFail = false;
          throw new PortalApiError(503, { title: 'Unavailable', status: 503 });
        }

        return documents
          .filter((item) => !filters.status || item.status === filters.status)
          .filter(
            (item) =>
              !filters.search ||
              item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
              item.id.toLowerCase().includes(filters.search.toLowerCase()),
          )
          .map((item) => ({ ...item }));
      },

      async getDocument(_tenantId, documentId) {
        const document = documents.find((item) => item.id === documentId);
        if (!document) throw new PortalApiError(404, { title: 'Not found', status: 404 });
        return { ...document, contentType: 'application/pdf' };
      },

      async getActiveSigningSession() {
        return controller.activeSession;
      },

      async createSigningSession(_tenantId, request) {
        createCalls.push({ ...request });

        if (nextCreateFailure) {
          const { status, problem } = nextCreateFailure;
          nextCreateFailure = null;
          throw new PortalApiError(status, { status, title: `HTTP ${status}`, ...problem });
        }

        const existing = sessionsByKey.get(request.idempotencyKey);
        if (existing) return { ...existing };

        const session: SigningSession = {
          id: `SIGN-${++sequence}`,
          documentId: request.documentId,
          status: sessionStatus,
          provider: 'Fake Qualified Provider',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 300_000).toISOString(),
        };

        sessionsByKey.set(request.idempotencyKey, session);
        controller.activeSession = session;
        return { ...session };
      },

      async getSigningSession(_tenantId, sessionId) {
        controller.sessionPolls += 1;
        const session =
          [...sessionsByKey.values()].find((item) => item.id === sessionId) ??
          controller.activeSession;

        if (!session) throw new PortalApiError(404, { title: 'Not found', status: 404 });
        return { ...session, status: sessionStatus };
      },

      async listStatuses() {
        return ['Draft', 'ReadyForSignature', 'Signing', 'Verified', 'Failed'];
      },
    },
  };

  return controller;
}
