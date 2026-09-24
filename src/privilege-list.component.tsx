import React, { useMemo, useState } from 'react';
import {
  DataTable,
  DataTableSkeleton,
  InlineNotification,
  Search,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { type Privilege } from './privileges.resource';

interface PrivilegeListProps {
  privileges: Array<Privilege>;
  isLoading: boolean;
  error: unknown;
}

const headers = [
  { key: 'name', header: 'Name' },
  { key: 'description', header: 'Description' },
];

const PrivilegeList: React.FC<PrivilegeListProps> = ({ privileges, isLoading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const rows = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return privileges
      .filter((p) => p.name.toLowerCase().includes(term) || (p.description ?? '').toLowerCase().includes(term))
      .map((p) => ({ id: p.uuid, name: p.name, description: p.description ?? '' }));
  }, [privileges, searchTerm]);

  if (isLoading) {
    return <DataTableSkeleton columnCount={2} rowCount={5} showHeader={false} showToolbar={false} />;
  }

  if (error) {
    return <InlineNotification kind="error" title="Could not load privileges" subtitle={String(error)} lowContrast />;
  }

  return (
    <div>
      <Search
        labelText="Search privileges"
        placeholder="Search by name or description"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="lg"
      />
      <p style={{ margin: '0.75rem 0' }}>
        Showing {rows.length} of {privileges.length} privileges
      </p>

      <DataTable rows={rows} headers={headers} size="sm" useZebraStyles>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })} key={header.key}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })} key={row.id}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
};

export default PrivilegeList;
