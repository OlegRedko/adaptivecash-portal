import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { DEFAULT_API_BASE_URL, type CurrentUser, type Permission, type PortalConfig } from './config';

const PortalContext = createContext<PortalConfig | null>(null);

export function PortalProvider({ config, children }: PropsWithChildren<{ config: PortalConfig }>) {
  return <PortalContext.Provider value={config}>{children}</PortalContext.Provider>;
}

export function usePortalConfig(): PortalConfig {
  const config = useContext(PortalContext);
  if (!config) throw new Error('usePortalConfig requires PortalProvider');
  return config;
}

export function useTenant(): string {
  return usePortalConfig().tenantId;
}

export function useCurrentUser(): CurrentUser {
  return usePortalConfig().user;
}

export function useApiBaseUrl(): string {
  return usePortalConfig().apiBaseUrl ?? DEFAULT_API_BASE_URL;
}

export interface PermissionCheck {
  has(permission: Permission): boolean;
  hasAll(...permissions: Permission[]): boolean;
}

export function usePermissions(): PermissionCheck {
  const { permissions } = useCurrentUser();

  return useMemo(() => {
    const granted = new Set(permissions);
    return {
      has: (permission) => granted.has(permission),
      hasAll: (...required) => required.every((permission) => granted.has(permission)),
    };
  }, [permissions]);
}
