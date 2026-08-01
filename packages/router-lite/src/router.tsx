import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type PropsWithChildren,
} from 'react';

export interface RouteLocation {
  pathname: string;
  search: URLSearchParams;
}

const RouterContext = createContext<RouteLocation | null>(null);

function snapshot(): RouteLocation {
  return {
    pathname: window.location.pathname,
    search: new URLSearchParams(window.location.search),
  };
}

export function RouterProvider({ children }: PropsWithChildren) {
  const [location, setLocation] = useState(snapshot);

  useEffect(() => {
    const onPopState = () => setLocation(snapshot());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return <RouterContext.Provider value={location}>{children}</RouterContext.Provider>;
}

export function useLocation(): RouteLocation {
  const value = useContext(RouterContext);
  if (!value) throw new Error('useLocation requires RouterProvider');
  return value;
}

export function navigate(to: string, { replace = false }: { replace?: boolean } = {}) {
  if (replace) history.replaceState(null, '', to);
  else history.pushState(null, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      href={href}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        navigate(href);
      }}
    />
  );
}

export function useRoute(pattern: string) {
  const { pathname } = useLocation();
  return useMemo(() => matchRoute(pattern, pathname), [pattern, pathname]);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function matchRoute(pattern: string, pathname: string): Record<string, string> | null {
  const parameterNames: string[] = [];
  const source = pattern
    .split('/')
    .map((part) => {
      if (part.startsWith(':')) {
        parameterNames.push(part.slice(1));
        return '([^/]+)';
      }
      return escapeRegex(part);
    })
    .join('/');

  const match = pathname.match(new RegExp(`^${source}/?$`));
  if (!match) return null;

  return Object.fromEntries(
    parameterNames.map((name, index) => [name, decodeURIComponent(match[index + 1])]),
  );
}
