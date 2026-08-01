import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PortalApp, type PortalConfig } from '@adaptivecash/platform-core';
import { createDocumentsModule } from '@adaptivecash/documents-feature';
import '@adaptivecash/design-tokens/tokens.css';

const config: PortalConfig = {
  portalName: 'Branch Portal',
  tenantId: 'branch-demo',
  user: {
    displayName: 'Olena Kovalenko',
    permissions: ['Documents.View', 'Documents.Sign', 'documents.viewAmount'],
  },
};

const modules = [createDocumentsModule()];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortalApp config={config} modules={modules} />
  </StrictMode>,
);
