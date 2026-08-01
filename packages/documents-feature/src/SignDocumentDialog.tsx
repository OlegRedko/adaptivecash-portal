import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Spinner,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import type { DocumentSummary } from '@adaptivecash/api-client';

type Props = {
  document: DocumentSummary;
  open: boolean;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const SignDocumentDialog = ({ document, open, isPending, onConfirm, onCancel }: Props) => {
  const styles = useStyles();

  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => {
        if (!data.open && !isPending) onCancel();
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Sign document?</DialogTitle>
          <DialogContent className={styles.content}>
            <Text>
              Confirm that you want to sign this document. The action may take a few seconds.
            </Text>
            <div className={styles.summary}>
              <Text weight="semibold">{document.id}</Text>
              <Text size={200} className={styles.muted}>
                {document.title} · {document.signer}
              </Text>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={onConfirm}
              disabled={isPending}
              icon={isPending ? <Spinner size="tiny" /> : undefined}
            >
              {isPending ? 'Signing' : 'Sign'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

const useStyles = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  summary: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
});
