export type Permission = string;

export interface CurrentUser {
  displayName: string;
  permissions: Permission[];
}

export interface PortalConfig {
  portalName: string;
  tenantId: string;
  user: CurrentUser;
  apiBaseUrl?: string;

  apiOverrides?: Record<string, unknown>;
}

export const DEFAULT_API_BASE_URL = '/api';
