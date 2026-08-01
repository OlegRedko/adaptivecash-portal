import { makeStyles, Input, Dropdown, Option, useId, Button } from '@fluentui/react-components';
import { SearchRegular, ArrowClockwiseRegular } from "@fluentui/react-icons";

export const DocumentsFilters = () => {
  const styles = useStyles();
  const dropdownId = useId("dropdown-default");

  const options = [
    "Cat",
    "Caterpillar",
    "Corgi",
    "Chupacabra",
    "Dog",
    "Ferret",
    "Fish",
    "Fox",
    "Hamster",
    "Snake",
  ];
  return (
    <div className={styles.container}>
      <Input
        contentBefore={<SearchRegular />}
        placeholder="Documents"
      />

      <Dropdown id={dropdownId} placeholder="Select an animal">
        {options.map((option) => (
          <Option key={option} disabled={option === "Ferret"}>
            {option}
          </Option>
        ))}
      </Dropdown>

      <Button className={styles.refreshButton}>
        <ArrowClockwiseRegular />
      </Button>
    </div>
  )
}

const useStyles = makeStyles({
  container: {
    display: "flex",
  },
  refreshButton: {
    flexShrink: 'initial'
  }
})