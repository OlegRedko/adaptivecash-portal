import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
  Text,
} from '@fluentui/react-components';

type TableRowData = {
  id: string,
  title: string,
  status: string,
  signer: string,
  createdAt: Date,
  updatedAt: Date,
}

export const tableRows: TableRowData[] = [
  {
    id: 'doc-903b-4f1a',
    title: 'Non-Disclosure Agreement - TechCorp',
    status: 'Pending',
    signer: 'Alice Johnson',
    createdAt: new Date('2026-07-28T09:30:00Z'),
    updatedAt: new Date('2026-07-28T09:30:00Z'),
  },
  {
    id: 'doc-112c-88d2',
    title: 'Employment Contract: Senior Engineer',
    status: 'Signed',
    signer: 'Michael Chang',
    createdAt: new Date('2026-07-20T14:15:00Z'),
    updatedAt: new Date('2026-07-22T10:05:00Z'),
  },
  {
    id: 'doc-55a1-9c3e',
    title: 'Q3 Vendor Service Agreement',
    status: 'Draft',
    signer: 'Sarah Jenkins',
    createdAt: new Date('2026-08-01T08:00:00Z'),
    updatedAt: new Date('2026-08-01T11:45:00Z'),
  },
  {
    id: 'doc-77f4-2b99',
    title: 'Office Lease Renewal - Building B',
    status: 'Rejected',
    signer: 'David Rodriguez',
    createdAt: new Date('2026-07-10T11:20:00Z'),
    updatedAt: new Date('2026-07-15T16:30:00Z'),
  },
  {
    id: 'doc-33e8-6d55',
    title: 'Software Licensing Enterprise Agreement',
    status: 'Signed',
    signer: 'Emma Watson',
    createdAt: new Date('2026-06-05T13:00:00Z'),
    updatedAt: new Date('2026-06-12T09:12:00Z'),
  },
  {
    id: 'doc-88d9-1a4c',
    title: 'Independent Contractor SOW',
    status: 'Pending',
    signer: 'James O\'Connor',
    createdAt: new Date('2026-07-30T15:45:00Z'),
    updatedAt: new Date('2026-07-31T08:20:00Z'),
  },
  {
    id: 'doc-22b7-5f6d',
    title: 'Data Processing Addendum (DPA)',
    status: 'Signed',
    signer: 'Priya Patel',
    createdAt: new Date('2026-07-01T10:10:00Z'),
    updatedAt: new Date('2026-07-03T14:55:00Z'),
  },
  {
    id: 'doc-44c6-0e11',
    title: 'Annual Compliance Audit Sign-off',
    status: 'Draft',
    signer: 'Robert Chen',
    createdAt: new Date('2026-08-01T10:00:00Z'),
    updatedAt: new Date('2026-08-01T10:00:00Z'),
  },
];

const DocumentsTable = () => {

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
            <TableRow key={item.title}>
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