import { memo } from 'react';
import {
  Badge,
  Button,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { ArrowClockwiseRegular } from '@fluentui/react-icons';
import { usePermissions } from '@adaptivecash/platform-core';
import type { DocumentSummary } from '@adaptivecash/api-client';
import { DOCUMENTS_VIEW_AMOUNT } from './permissions';

type Props = {
  documents: DocumentSummary[];
  isFetching: boolean;
  dataUpdatedAt: number;
  onRefresh: () => void;
  onOpen: (documentId: string) => void;
};

const amountFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'EUR',
});

export const DocumentsTable = memo(function DocumentsTable({
  documents,
  isFetching,
  dataUpdatedAt,
  onRefresh,
  onOpen,
}: Props) {
  const styles = useStyles();
  const permissions = usePermissions();
  const canViewAmount = permissions.has(DOCUMENTS_VIEW_AMOUNT);

  return (
    <div>
      <div className={styles.scroll}>
        <Table aria-label="Documents" className={styles.table}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Number</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
              <TableHeaderCell>Customer</TableHeaderCell>
              {canViewAmount && <TableHeaderCell>Amount</TableHeaderCell>}
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Text weight="semibold">{item.id}</Text>
                </TableCell>
                <TableCell>
                  <Text>{item.title}</Text>
                </TableCell>
                <TableCell>
                  <Text>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </TableCell>
                <TableCell>
                  <Text>{item.signer}</Text>
                </TableCell>
                {canViewAmount && (
                  <TableCell>
                    <Text>{amountFormatter.format(0)}</Text>
                  </TableCell>
                )}
                <TableCell>
                  <Badge appearance="outline">{item.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    appearance="subtle"
                    size="small"
                    onClick={() => onOpen(item.id)}
                    aria-label={`Open ${item.id}`}
                  >
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {documents.length === 0 && (
        <div className={styles.empty}>
          <Text size={200}>No documents match the current filters.</Text>
        </div>
      )}

      <div className={styles.footer}>
        <Text size={200}>
          {documents.length} {documents.length === 1 ? 'document' : 'documents'}
        </Text>

        <div className={styles.footerActions}>
          <Text size={200} className={styles.updatedAt} aria-live="polite">
            {isFetching
              ? 'Updating…'
              : dataUpdatedAt > 0
                ? `Updated at ${new Date(dataUpdatedAt).toLocaleTimeString()}`
                : ''}
          </Text>

          <Button
            appearance="subtle"
            icon={isFetching ? <Spinner size="tiny" /> : <ArrowClockwiseRegular />}
            disabled={isFetching}
            onClick={onRefresh}
          >
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
});

const useStyles = makeStyles({
  scroll: {
    overflowX: 'auto',
  },
  table: {
    minWidth: '760px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '8px',
  },
  footerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  updatedAt: {
    color: tokens.colorNeutralForeground3,
  },
  empty: {
    paddingTop: '12px',
    paddingBottom: '12px',
    color: tokens.colorNeutralForeground3,
  },
});
