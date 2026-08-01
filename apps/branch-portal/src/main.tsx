import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { adaptiveCashLightTheme } from '@adaptivecash/design-tokens';
import '@adaptivecash/design-tokens/tokens.css';
import { RouterProvider } from '@adaptivecash/router-lite';
import { DocumentsPage } from '@adaptivecash/documents-feature';
import { ErrorBoundary } from '@adaptivecash/platform-core';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30000 } } });

createRoot(document.getElementById('root')!)
  .render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <FluentProvider theme={adaptiveCashLightTheme}>
            <RouterProvider>
              <DocumentsPage />
            </RouterProvider>
          </FluentProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
