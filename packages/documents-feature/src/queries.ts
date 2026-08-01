import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTenant } from '@adaptivecash/platform-core';
import type { DocumentStatus } from '@adaptivecash/api-client';
import { useDocumentsApi } from './api';

export const documentKeys = {
  all: (tenantId: string) => ['documents', tenantId] as const,
  list: (tenantId: string, search: string, status: string) =>
    ['documents', tenantId, 'list', search, status] as const,
  detail: (tenantId: string, documentId: string) =>
    ['documents', tenantId, 'detail', documentId] as const,
  statuses: (tenantId: string) => ['documents', tenantId, 'statuses'] as const,
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

export function useDocumentStatusesQuery() {
  const tenantId = useTenant();
  const api = useDocumentsApi();

  return useQuery({
    queryKey: documentKeys.statuses(tenantId),
    queryFn: ({ signal }) => api.listStatuses(tenantId, signal),
    staleTime: 5 * 60 * 1000,
  });
}
