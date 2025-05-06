import React from 'react';
import PropTypes from 'prop-types';
import { useTable, useSortBy } from 'react-table';
import './DataTable.css';

export default function DataTable({
  columns,
  data,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      initialState: {
        sortBy: [
          {
            id: sortField,
            desc: sortOrder === 'desc',
          },
        ],
      },
    },
    useSortBy
  );

  return (
    <table className="data-table" {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(col => {
              const sortIcon = col.isSorted
                ? col.isSortedDesc
                  ? ' ↓'
                  : ' ↑'
                : '';
              return (
                <th
                  {...col.getHeaderProps(col.getSortByToggleProps())}
                  onClick={() => onSort(col.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {col.render('Header')}{sortIcon}
                </th>
              );
            })}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => (
                <td {...cell.getCellProps()}>
                  {cell.render('Cell')}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td>
                  {onEdit && (
                    <button className="button button-secondary" onClick={() => onEdit(row.original)}>
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button className="button button-danger" onClick={() => onDelete(row.original.id)}>
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

DataTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  sortField: PropTypes.string,
  sortOrder: PropTypes.oneOf(['asc', 'desc']),
  onSort: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};
