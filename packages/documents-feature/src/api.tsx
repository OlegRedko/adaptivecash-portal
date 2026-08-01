import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { createDocumentsApi, type DocumentsApi } from '@adaptivecash/api-client';
import { useApiBaseUrl } from '@adaptivecash/platform-core';

export interface DocumentsFeatureApi extends DocumentsApi {
  listStatuses(tenantId: string, signal?: AbortSignal): Promise<string[]>;
}

export function createDocumentsFeatureApi(
  baseUrl = '/api',
  fetchImpl: typeof fetch = fetch,
): DocumentsFeatureApi {
  const base = createDocumentsApi(baseUrl, fetchImpl);

  return {
    ...base,
    async listStatuses(tenantId, signal) {
      const response = await fetchImpl(`${baseUrl}/documents/statuses`, {
        headers: { 'X-Tenant-Id': tenantId },
        signal,
      });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      return (await response.json()) as string[];
    },
  };
}

const DocumentsApiContext = createContext<DocumentsFeatureApi | null>(null);

export function DocumentsApiProvider({
  api,
  children,
}: PropsWithChildren<{ api?: DocumentsFeatureApi }>) {
  const baseUrl = useApiBaseUrl();
  const value = useMemo(() => api ?? createDocumentsFeatureApi(baseUrl), [api, baseUrl]);
  return <DocumentsApiContext.Provider value={value}>{children}</DocumentsApiContext.Provider>;
}

export function useDocumentsApi(): DocumentsFeatureApi {
  const api = useContext(DocumentsApiContext);
  if (!api) throw new Error('useDocumentsApi requires DocumentsApiProvider');
  return api;
}
