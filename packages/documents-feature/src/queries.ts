import { useEffect } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@adaptivecash/platform-core';
import type { DocumentStatus } from '@adaptivecash/api-client';
import { useDocumentsApi } from './api';
import { isTerminalSigningStatus } from './signingSessionStatus';

const POLL_INTERVAL_MS = 2000;

export const documentKeys = {
  all: (tenantId: string) => ['documents', tenantId] as const,
  list: (tenantId: string, search: string, status: string) =>
    ['documents', tenantId, 'list', search, status] as const,
  detail: (tenantId: string, documentId: string) =>
    ['documents', tenantId, 'detail', documentId] as const,
  statuses: (tenantId: string) => ['documents', tenantId, 'statuses'] as const,
};

export const signingSessionKeys = {
  detail: (tenantId: string, sessionId: string) =>
    ['signing-sessions', tenantId, sessionId] as const,
};

export function useDocumentsQuery(search: string, status: string) {
  const tenantId = useTenant();
  const api = useDocumentsApi();

  return useQuery({
    queryKey: documentKeys.list(tenantId, search, status),
    queryFn: ({ signal }) =>
      api.listDocuments(
        tenantId,
        { search: search || undefined, status: (status || undefined) as DocumentStatus | undefined },
        signal,
      ),
    placeholderData: keepPreviousData,
  });
}

export function useDocumentQuery(documentId: string) {
  const tenantId = useTenant();
  const api = useDocumentsApi();

  return useQuery({
    queryKey: documentKeys.detail(tenantId, documentId),
    queryFn: ({ signal }) => api.getDocument(tenantId, documentId, signal),
    enabled: Boolean(documentId),
  });
}

/**
 * Polls one signing session until the server reports a terminal status.
 *
 * The query function only reads. Invalidating the document lists happens in an effect
 * once a terminal status arrives, so a refetch never triggers a hidden write.
 */
export function useSigningSessionQuery(sessionId: string | null) {
  const tenantId = useTenant();
  const api = useDocumentsApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: signingSessionKeys.detail(tenantId, sessionId ?? ''),
    queryFn: ({ signal }) => api.getSigningSession(tenantId, sessionId!, signal),
    enabled: Boolean(sessionId),
    refetchInterval: (query) =>
      isTerminalSigningStatus(query.state.data?.status) ? false : POLL_INTERVAL_MS,
  });

  const status = query.data?.status;

  useEffect(() => {
    if (!isTerminalSigningStatus(status)) return;
    queryClient.invalidateQueries({ queryKey: documentKeys.all(tenantId) });
  }, [status, tenantId, queryClient]);

  return query;
}

export function useDocumentStatusesQuery() {
  const tenantId = useTenant();
  const api = useDocumentsApi();

  return useQuery({
    queryKey: documentKeys.statuses(tenantId),
    queryFn: ({ signal }) => api.listStatuses(tenantId, signal),
    staleTime: 5 * 60 * 1000,
  });
}
