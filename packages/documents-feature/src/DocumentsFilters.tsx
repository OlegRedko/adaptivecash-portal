import { makeStyles, Input, Dropdown, Option, useId } from '@fluentui/react-components';
import { SearchRegular } from "@fluentui/react-icons";

const ALL_STATUSES = 'All statuses';

type Props = {
  search: string;
  onSearchChange: (search: string) => void;
  status: string;
  statuses: string[];
  onStatusChange: (status: string) => void;
}

export const DocumentsFilters = ({ search, onSearchChange, status, statuses, onStatusChange }: Props) => {
  const styles = useStyles();
  const dropdownId = useId("dropdown-status");

  return (
    <div className={styles.container}>
      <Input
        className={styles.search}
        value={search}
        onChange={(_, data) => onSearchChange(data.value)}
        contentBefore={<SearchRegular />}
        placeholder="Search documents"
      />

      <Dropdown
        id={dropdownId}
        className={styles.status}
        placeholder="Select a status"
        value={status || ALL_STATUSES}
        selectedOptions={[status]}
        onOptionSelect={(_, data) => onStatusChange(data.optionValue ?? '')}
      >
        <Option value="">{ALL_STATUSES}</Option>
        {statuses.map((option) => (
          <Option key={option} value={option}>
            {option}
          </Option>
        ))}
      </Dropdown>
    </div>
  )
}

const useStyles = makeStyles({
  container: {
    display: "flex",
    gap: "8px",
  },
  search: {
    flexGrow: 1,
  },
  status: {
    minWidth: "180px",
  },
})
