import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PortalApp, type PortalConfig } from '@adaptivecash/platform-core';
import { createDocumentsModule } from '@adaptivecash/documents-feature';
import '@adaptivecash/design-tokens/tokens.css';

const config: PortalConfig = {
  portalName: 'Customer Portal',
  tenantId: 'customer-demo',
  user: {
    displayName: 'Customer Operator',
    permissions: ['Documents.View'],
  },
};

const modules = [createDocumentsModule()];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortalApp config={config} modules={modules} />
  </StrictMode>,
);
