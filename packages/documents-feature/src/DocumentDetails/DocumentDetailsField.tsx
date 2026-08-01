import {
  makeStyles,
  tokens,
} from '@fluentui/react-components';

type Props = {
  label: string;
  value: string
}

export const DocumentDetailsField = ({ label, value }: Props)=> {
  const styles = useStyles();

  return (
    <div className={styles.field}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value}</dd>
    </div>
  );
}

const useStyles = makeStyles({
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
});