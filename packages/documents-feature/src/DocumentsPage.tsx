import { useCallback } from 'react';
import {
  Button,
  Card,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  Spinner,
  makeStyles,
} from '@fluentui/react-components';
import { navigate, useLocation, useRoute } from '@adaptivecash/router-lite';
import { DocumentsFilters } from './DocumentsFilters';
import { DocumentsTable } from './DocumentsTable';
import { DocumentDetails } from './DocumentDetails/DocumentDetails';
import { useDocumentFilters } from './useDocumentFilters';
import { useDebouncedValue } from './useDebouncedValue';
import { useDocumentStatusesQuery, useDocumentsQuery } from './queries';

export const DocumentsPage = () => {
  const styles = useStyles();
  const {
    filters: { search, status },
    setSearch,
    setStatus,
  } = useDocumentFilters();

  const debouncedSearch = useDebouncedValue(search, 300);
  const documents = useDocumentsQuery(debouncedSearch, status);
  const statuses = useDocumentStatusesQuery();

  const { search: params } = useLocation();
  const routeParams = useRoute('/documents/:documentId');
  const selectedId = routeParams?.documentId;
  const selected = documents.data?.find((item) => item.id === selectedId);

  const query = params.toString();
  const suffix = query ? `?${query}` : '';

  const openDocument = useCallback(
    (documentId: string) => navigate(`/documents/${encodeURIComponent(documentId)}${suffix}`),
    [suffix],
  );

  const closeDocument = useCallback(() => navigate(`/documents${suffix}`), [suffix]);

  const { refetch } = documents;
  const refresh = useCallback(() => void refetch(), [refetch]);

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <DocumentsFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          statuses={statuses.data ?? []}
          onStatusChange={setStatus}
        />

        <div aria-live="polite" aria-busy={documents.isPending}>
          {documents.isPending && <Spinner label="Loading documents" />}

          {documents.isError && (
            <MessageBar intent="error">
              <MessageBarBody>
                {documents.error instanceof Error
                  ? documents.error.message
                  : 'The documents could not be loaded.'}
              </MessageBarBody>
              <MessageBarActions>
                <Button onClick={refresh}>Retry</Button>
              </MessageBarActions>
            </MessageBar>
          )}

          {documents.isSuccess && (
            <DocumentsTable
              documents={documents.data}
              isFetching={documents.isFetching}
              dataUpdatedAt={documents.dataUpdatedAt}
              onRefresh={refresh}
              onOpen={openDocument}
            />
          )}
        </div>
      </Card>

      <DocumentDetails
        document={selected}
        open={Boolean(selectedId)}
        onClose={closeDocument}
      />
    </div>
  );
};

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderRadius: '8px',
  },
});
