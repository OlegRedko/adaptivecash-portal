import type { ReactNode } from 'react';
import { usePermissions } from './PortalProvider';
import type { Permission } from './config';

export interface RequirePermissionProps {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

export function RequirePermission({ permission, fallback = null, children }: RequirePermissionProps) {
  const permissions = usePermissions();
  return <>{permissions.has(permission) ? children : fallback}</>;
}
