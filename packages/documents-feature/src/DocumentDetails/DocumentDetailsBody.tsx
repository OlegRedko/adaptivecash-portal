import { useState } from 'react';
import {
  Badge,
  Button,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { usePermissions } from '@adaptivecash/platform-core';
import type { DocumentSummary } from '@adaptivecash/api-client';
import { DOCUMENTS_SIGN } from '../permissions';
import { SignDocumentDialog } from '../SignDocumentDialog';
import { SigningSessionPanel } from '../SigningSessionPanel';
import { isSignableDocumentStatus } from '../signingSessionStatus';
import { useSignDocument } from '../useSignDocument';
import { DocumentDetailsField } from './DocumentDetailsField';

type Props = {
  document: DocumentSummary;
  onClose: () => void;
}

export const DocumentDetailsBody = ({ document, onClose, }: Props) => {
  const styles = useStyles();
  const permissions = usePermissions();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const signing = useSignDocument(document.id);
  const canSign = permissions.has(DOCUMENTS_SIGN) && isSignableDocumentStatus(document.status);

  const confirm = () => {
    signing.sign();
    setConfirmOpen(false);
  };

  return (
    <div className={styles.content}>
      <dl className={styles.details}>
        <DocumentDetailsField label="Number" value={document.id} />
        <DocumentDetailsField label="Type" value={document.title} />
        <DocumentDetailsField label="Customer" value={document.signer} />
        <DocumentDetailsField label="Created" value={new Date(document.createdAt).toLocaleString()} />
        <DocumentDetailsField label="Updated" value={new Date(document.updatedAt).toLocaleString()} />
      </dl>

      <div className={styles.status}>
        <Text className={styles.label}>Status</Text>
        <Badge appearance="outline">{document.status}</Badge>
      </div>

      {signing.sessionId && (
        <SigningSessionPanel
          sessionId={signing.sessionId}
          onStartNewAttempt={signing.startNewAttempt}
        />
      )}

      {signing.failure && (
        <MessageBar intent={signing.failure.kind === 'conflict' ? 'warning' : 'error'}>
          <MessageBarBody>{signing.failure.message}</MessageBarBody>
          {signing.canRetryWithSameKey && (
            <MessageBarActions>
              <Button onClick={signing.sign} disabled={signing.isPending}>
                Retry
              </Button>
            </MessageBarActions>
          )}
        </MessageBar>
      )}

      <div className={styles.actions}>
        <Button onClick={onClose}>Close</Button>
        {canSign && (
          <Button
            appearance="primary"
            disabled={signing.isPending || Boolean(signing.sessionId)}
            onClick={() => setConfirmOpen(true)}
          >
            Sign document
          </Button>
        )}
      </div>

      <SignDocumentDialog
        document={document}
        open={confirmOpen}
        isPending={signing.isPending}
        onConfirm={confirm}
        onCancel={() => setConfirmOpen(false)}
      />
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
  label: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  }
});