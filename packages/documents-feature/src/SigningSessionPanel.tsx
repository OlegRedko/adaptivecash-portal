import {
  Badge,
  Button,
  Spinner,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import type { SigningSessionStatus } from '@adaptivecash/api-client';
import { useSigningSessionQuery } from './queries';
import { isRetryableSigningStatus, isTerminalSigningStatus } from './signingSessionStatus';
import { formatCountdown, useCountdown } from './useCountdown';

type Props = {
  sessionId: string;
  onStartNewAttempt: () => void;
};

const intentFor = (status: SigningSessionStatus | undefined) => {
  if (status === 'Verified') return 'success' as const;
  if (status === 'Failed' || status === 'Expired') return 'danger' as const;
  return 'informative' as const;
};

export const SigningSessionPanel = ({ sessionId, onStartNewAttempt }: Props) => {
  const styles = useStyles();
  const session = useSigningSessionQuery(sessionId);

  const status = session.data?.status;
  const awaitingProvider = status === 'AwaitingProvider';
  const remaining = useCountdown(session.data?.expiresAt, awaitingProvider);

  return (
    <div className={styles.panel} aria-live="polite">
      <div className={styles.headline}>
        <Text className={styles.label}>Signing session</Text>
        <Text size={200}>{sessionId}</Text>
      </div>

      {session.isPending && <Spinner size="tiny" label="Loading session" labelPosition="after" />}

      {session.isError && (
        <Text className={styles.error}>The session status could not be read. Retrying.</Text>
      )}

      {status && (
        <div className={styles.statusRow}>
          <Badge appearance="outline" color={intentFor(status)}>
            {status}
          </Badge>
          {!isTerminalSigningStatus(status) && <Spinner size="extra-tiny" />}
        </div>
      )}

      {awaitingProvider && (
        <Text size={200} className={styles.countdown}>
          {remaining > 0
            ? `Expires in ${formatCountdown(remaining)}`
            : 'Expired — waiting for the server to confirm'}
        </Text>
      )}

      {isRetryableSigningStatus(status) && (
        <div>
          <Button onClick={onStartNewAttempt}>Start a new attempt</Button>
        </div>
      )}
    </div>
  );
};

const useStyles = makeStyles({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  headline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  label: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  countdown: {
    color: tokens.colorNeutralForeground3,
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
  },
});
