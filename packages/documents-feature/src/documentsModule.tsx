import type { ReactNode } from 'react';
import type { PortalModule } from '@adaptivecash/platform-core';
import { DocumentsApiProvider, type DocumentsFeatureApi } from './api';
import { DocumentsPage } from './DocumentsPage';
import { DOCUMENTS_VIEW } from './permissions';

export interface DocumentsModuleOptions {
  api?: DocumentsFeatureApi;
}

export function createDocumentsModule({ api }: DocumentsModuleOptions = {}): PortalModule {
  const withApi = (children: ReactNode) => (
    <DocumentsApiProvider api={api}>{children}</DocumentsApiProvider>
  );

  return {
    id: 'documents',
    navigation: [{ label: 'Documents', href: '/documents', requiredPermission: DOCUMENTS_VIEW }],
    routes: [
      {
        path: '/documents',
        requiredPermission: DOCUMENTS_VIEW,
        element: withApi(<DocumentsPage />),
      },
      {
        path: '/documents/:documentId',
        requiredPermission: DOCUMENTS_VIEW,
        element: withApi(<DocumentsPage />),
      },
    ],
  };
}
