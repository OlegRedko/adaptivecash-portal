import {
  Badge,
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { RequirePermission } from '@adaptivecash/platform-core';
import type { DocumentSummary } from '@adaptivecash/api-client';
import { DOCUMENTS_SIGN } from './permissions';

type Props = {
  document: DocumentSummary | undefined;
  open: boolean;
  onClose: () => void;
};

export const DocumentDetails = ({ document, open, onClose }: Props) => {
  const styles = useStyles();

  return (
    <OverlayDrawer
      as="aside"
      position="end"
      size="medium"
      open={open}
      onOpenChange={(_, data) => {
        if (!data.open) onClose();
      }}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<Dismiss24Regular />}
              onClick={onClose}
            />
          }
        >
          {document?.title ?? 'Document'}
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody>
        {document ? (
          <div className={styles.content}>
            <dl className={styles.details}>
              <Field label="Number" value={document.id} />
              <Field label="Type" value={document.title} />
              <Field label="Customer" value={document.signer} />
              <Field label="Created" value={new Date(document.createdAt).toLocaleString()} />
              <Field label="Updated" value={new Date(document.updatedAt).toLocaleString()} />
            </dl>

            <div className={styles.status}>
              <Text className={styles.label}>Status</Text>
              <Badge appearance="outline">{document.status}</Badge>
            </div>

            <div className={styles.actions}>
              <Button onClick={onClose}>Close</Button>
              <RequirePermission permission={DOCUMENTS_SIGN}>
                <Button appearance="primary" disabled>
                  Sign document
                </Button>
              </RequirePermission>
            </div>
          </div>
        ) : (
          <Text>This document is not in the current list.</Text>
        )}
      </DrawerBody>
    </OverlayDrawer>
  );
};

function Field({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <div className={styles.field}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value}</dd>
    </div>
  );
}

const useStyles = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    margin: 0,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  label: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  value: {
    margin: 0,
  },
  status: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    alignItems: 'flex-start',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    paddingTop: '8px',
  },
});
