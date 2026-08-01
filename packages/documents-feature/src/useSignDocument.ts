import { useCallback, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PortalApiError, type SigningSession } from '@adaptivecash/api-client';
import { useTenant } from '@adaptivecash/platform-core';
import { useDocumentsApi } from './api';
import { documentKeys } from './queries';

export type SignFailure = {
  kind: 'unavailable' | 'timeout' | 'conflict' | 'unknown';
  message: string;
};

const newIdempotencyKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function useSignDocument(documentId: string) {
  const tenantId = useTenant();
  const api = useDocumentsApi();
  const queryClient = useQueryClient();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [failure, setFailure] = useState<SignFailure | null>(null);

  const idempotencyKey = useRef<string | null>(null);
  const inFlight = useRef(false);

  const mutation = useMutation<SigningSession, unknown, string>({
    mutationFn: (key) =>
      api.createSigningSession(tenantId, { documentId, idempotencyKey: key }, undefined),
    onSuccess: (session) => {
      setSessionId(session.id);
      setFailure(null);
      queryClient.invalidateQueries({ queryKey: documentKeys.all(tenantId) });
    },
    onError: (error) => setFailure(classify(error, setSessionId)),
    onSettled: () => {
      inFlight.current = false;
    },
  });

  const sign = useCallback(() => {
    if (inFlight.current) return;
    inFlight.current = true;

    idempotencyKey.current ??= newIdempotencyKey();
    setFailure(null);
    mutation.mutate(idempotencyKey.current);
  }, [mutation]);

  const startNewAttempt = useCallback(() => {
    idempotencyKey.current = null;
    setSessionId(null);
    setFailure(null);
  }, []);

  return {
    sign,
    startNewAttempt,
    sessionId,
    failure,
    isPending: mutation.isPending,
    canRetryWithSameKey: failure?.kind === 'unavailable' || failure?.kind === 'timeout',
  };
}

function classify(error: unknown, setSessionId: (id: string) => void): SignFailure {
  if (!(error instanceof PortalApiError)) {
    return { kind: 'unknown', message: 'The signing request could not be sent.' };
  }

  if (error.status === 409) {
    const existing = error.problem.existingSessionId;
    if (typeof existing === 'string') {
      setSessionId(existing);
      return {
        kind: 'conflict',
        message: 'This document already has an active signing session. Tracking that one.',
      };
    }
    return {
      kind: 'unknown',
      message: error.problem.title ?? 'The signing request conflicted with an earlier one.',
    };
  }

  if (error.status === 503) {
    return {
      kind: 'unavailable',
      message: 'The signature provider is unavailable. Retry to send the same request again.',
    };
  }

  if (error.status === 504) {
    return {
      kind: 'timeout',
      message:
        'The provider did not answer in time. It may already have accepted the request — retry to reconcile.',
    };
  }

  return { kind: 'unknown', message: error.message };
}
