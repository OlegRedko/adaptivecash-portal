import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
  Text,
  makeStyles
} from '@fluentui/react-components';
import { useMemo } from 'react';

type TableRowData = {
  id: string,
  title: string,
  status: string,
  signer: string,
  createdAt: Date,
  updatedAt: Date,
}

type Props = {
  documents: DocumentItem[];
  onRowClick: (id: string) => void;
}

const DocumentsTable = ({ documents, onRowClick }: Props) => {
  const styles = useStyles();

  const tableRows = useMemo((): TableRowData[] => {
    return documents.map((doc: DocumentItem) => {
      return {
        id: doc.id,
        title: doc.title,
        status: doc.status,
        signer: doc.signer,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      }
    })
  }, [documents]);

  const columns = [
    { columnKey: 'title', label: 'Number' },
    { columnKey: 'status', label: 'Status' },
    { columnKey: 'signer', label: 'Customer' },
    { columnKey: 'createdAt', label: 'Created' },
  ];

  return (
    <div>
      <Table arial-label="Default table" style={{ minWidth: '510px' }}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHeaderCell key={column.columnKey}>
                {column.label}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableRows.map((item: TableRowData) => (
            <TableRow key={item.id} className={styles.row} onClick={() => onRowClick(item.id)}>
              <TableCell>
                <Text>
                  {item.title}
                </Text>
              </TableCell>
              <TableCell>
                <Text>
                  {item.status}
                </Text>
              </TableCell>
              <TableCell>
                <Text>
                  {item.signer}
                </Text>
              </TableCell>
              <TableCell>
                <Text>
                  {item.createdAt.toLocaleDateString()}
                </Text>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentsTable;

const useStyles = makeStyles({
  row: {
    cursor: 'pointer',
  }
})