import { useCallback, useMemo } from 'react';
import { Link, matchRoute, useLocation } from '@adaptivecash/router-lite';
import { Text, makeStyles, tokens } from '@fluentui/react-components';
import { usePermissions, usePortalConfig } from './PortalProvider';
import type { NavItem, PortalModule, RouteDef } from './module';

export interface PortalShellProps {
  modules: PortalModule[];
  homeHref?: string;
}

export function PortalShell({ modules, homeHref }: PortalShellProps) {
  const styles = useStyles();
  const { portalName, user } = usePortalConfig();
  const permissions = usePermissions();
  const { pathname } = useLocation();

  const allowed = useCallback(
    (item: { requiredPermission?: string }) =>
      !item.requiredPermission || permissions.has(item.requiredPermission),
    [permissions],
  );

  const routes = useMemo(
    () => modules.flatMap((module) => module.routes).filter(allowed),
    [modules, allowed],
  );

  const navigation = useMemo(
    () => modules.flatMap((module) => module.navigation).filter(allowed),
    [modules, allowed],
  );

  const home = homeHref ?? navigation[0]?.href;
  const active = resolveRoute(routes, pathname, home);

  const current = pathname === '/' && home ? home : pathname;
  const isActive = (href: string) => current === href || current.startsWith(`${href}/`);
  const activeLabel = navigation.find((item) => isActive(item.href))?.label;

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Text weight="bold">AdaptiveCash</Text>
        </div>
        <div className={styles.title}>
          <Text>{activeLabel ?? portalName}</Text>
        </div>
        <div className={styles.userDetails}>
          <Text>{user.displayName}</Text>
        </div>
      </header>

      <div className={styles.mainContainer}>
        <nav className={styles.sidebar} aria-label="Main">
          {navigation.map((item: NavItem) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? styles.navItemActive : styles.navItem}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className={styles.body}>{active ?? <NotFound />}</main>
      </div>
    </div>
  );
}

function resolveRoute(routes: RouteDef[], pathname: string, home: string | undefined) {
  const match = routes.find((route) => matchRoute(route.path, pathname));
  if (match) return match.element;

  if (pathname === '/' && home) {
    const fallback = routes.find((route) => matchRoute(route.path, home));
    if (fallback) return fallback.element;
  }

  return null;
}

function NotFound() {
  return <Text>This page does not exist, or you do not have access to it.</Text>;
}

const useStyles = makeStyles({
  shell: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    height: '70px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  logo: {
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: '15px 10px',
  },
  title: {
    paddingLeft: '20px',
  },
  userDetails: {
    marginLeft: 'auto',
    paddingRight: '20px',
  },
  mainContainer: {
    display: 'flex',
    flex: 1,
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '150px',
    padding: '15px',
  },
  navItem: {
    color: tokens.colorNeutralForeground2,
    textDecorationLine: 'none',
    padding: '6px 8px',
    borderRadius: tokens.borderRadiusMedium,
  },
  navItemActive: {
    color: tokens.colorNeutralForeground1,
    backgroundColor: tokens.colorNeutralBackground3,
    textDecorationLine: 'none',
    padding: '6px 8px',
    borderRadius: tokens.borderRadiusMedium,
    fontWeight: tokens.fontWeightSemibold,
  },
  body: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    padding: '20px',
  },
});
