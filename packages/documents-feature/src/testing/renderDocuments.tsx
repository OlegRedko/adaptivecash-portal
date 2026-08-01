import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@adaptivecash/router-lite';
import { PortalProvider, type PortalConfig } from '@adaptivecash/platform-core';
import type { DocumentSummary } from '@adaptivecash/api-client';
import { DocumentsApiProvider } from '../api';
import { createTestApi, type TestApiController } from './createTestApi';

export const BRANCH_USER = ['Documents.View', 'Documents.Sign', 'documents.viewAmount'];
export const CUSTOMER_USER = ['Documents.View'];

export interface RenderOptions {
  documents?: DocumentSummary[];
  tenantId?: string;
  permissions?: string[];
  url?: string;
  api?: TestApiController;
}

export const documentFixture = (overrides: Partial<DocumentSummary> = {}): DocumentSummary => ({
  id: 'BR-DOC-001',
  title: 'Branch cash collection order',
  status: 'ReadyForSignature',
  signer: 'Olena Kovalenko',
  createdAt: '2026-07-01T09:00:00.000Z',
  updatedAt: '2026-07-30T08:30:00.000Z',
  ...overrides,
});

export function renderDocuments(children: ReactNode, options: RenderOptions = {}) {
  const {
    documents = [documentFixture()],
    tenantId = 'branch-demo',
    permissions = BRANCH_USER,
    url = '/documents',
    api = createTestApi(documents),
  } = options;

  window.history.replaceState(null, '', url);

  const config: PortalConfig = {
    portalName: 'Test Portal',
    tenantId,
    user: { displayName: 'Test User', permissions },
  };

  // retry: false keeps a failing query from masking assertions behind background retries.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <FluentProvider theme={webLightTheme}>
        <RouterProvider>
          <PortalProvider config={config}>
            <DocumentsApiProvider api={api.api}>{children}</DocumentsApiProvider>
          </PortalProvider>
        </RouterProvider>
      </FluentProvider>
    </QueryClientProvider>,
  );

  return { ...result, api, queryClient };
}
