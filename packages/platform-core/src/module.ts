import type { ReactNode } from 'react';
import type { Permission } from './config';

export interface RouteDef {
  path: string;
  element: ReactNode;
  requiredPermission?: Permission;
}

export interface NavItem {
  label: string;
  href: string;
  requiredPermission?: Permission;
}

export interface PortalModule {
  id: string;
  navigation: NavItem[];
  routes: RouteDef[];
}
