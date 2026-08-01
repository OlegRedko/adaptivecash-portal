import { useCallback } from 'react';
import { navigate, useLocation } from '@adaptivecash/router-lite';

export type DocumentFilters = {
  search: string;
  status: string;
}

export const useDocumentFilters = () => {
  const { pathname, search: params } = useLocation();

  const filters: DocumentFilters = {
    search: params.get('search') ?? '',
    status: params.get('status') ?? '',
  };

  const setFilter = useCallback((key: keyof DocumentFilters, value: string) => {
    const next = new URLSearchParams(params);

    if (value) next.set(key, value);
    else next.delete(key);

    const query = next.toString();

    navigate(query ? `${pathname}?${query}` : pathname, { replace: true });
  }, [pathname, params]);

  const setSearch = useCallback((value: string) => setFilter('search', value), [setFilter]);
  const setStatus = useCallback((value: string) => setFilter('status', value), [setFilter]);

  return { filters, setSearch, setStatus };
}
