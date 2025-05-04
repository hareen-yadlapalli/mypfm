import React, { useState, useMemo } from 'react';

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const parts = date
    .toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Australia/Sydney',
    })
    .split(' ');
  return parts.join('-');
};

const DataTable = ({ columns, data, onEdit, onDelete }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    const sorted = [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (sortConfig.key === 'dob') {
        aVal = aVal ? new Date(aVal) : new Date(0);
        bVal = bVal ? new Date(bVal) : new Date(0);
      }
      if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.accessor}
              className="sortable"
              onClick={() => requestSort(col.accessor)}
            >
              <div className="header-content">
                {col.Header}
                <span className="sort-indicator">{getIndicator(col.accessor)}</span>
              </div>
            </th>
          ))}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row) => (
          <tr key={row.id}>
            {columns.map((col) => (
              <td key={col.accessor}>
                {col.accessor === 'dob'
                  ? formatDate(row.dob)
                  : row[col.accessor]}
              </td>
            ))}
            <td>
              <div className="action-buttons">
                <button
                  className="button button-secondary"
                  onClick={() => onEdit(row)}
                >
                  Edit
                </button>
                <button
                  className="button button-danger"
                  onClick={() => onDelete(row.id)}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
