import { useState, type ReactNode } from 'react';
import { FluentProvider, type Theme } from '@fluentui/react-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { adaptiveCashLightTheme } from '@adaptivecash/design-tokens';
import { RouterProvider } from '@adaptivecash/router-lite';
import { ErrorBoundary } from './ErrorBoundary';
import { PortalProvider } from './PortalProvider';
import { PortalShell } from './PortalShell';
import type { PortalConfig } from './config';
import type { PortalModule } from './module';

export interface PortalAppProps {
  config: PortalConfig;
  modules: PortalModule[];
  theme?: Theme;
  homeHref?: string;
  errorFallback?: ReactNode;
}

export function PortalApp({
  config,
  modules,
  theme = adaptiveCashLightTheme,
  homeHref,
  errorFallback,
}: PortalAppProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <ErrorBoundary fallback={errorFallback}>
      <QueryClientProvider client={queryClient}>
        <FluentProvider theme={theme}>
          <RouterProvider>
            <PortalProvider config={config}>
              <PortalShell modules={modules} homeHref={homeHref} />
            </PortalProvider>
          </RouterProvider>
        </FluentProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  });
}
