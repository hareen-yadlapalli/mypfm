import React from 'react';

// Utility to format a date string as DD-MMM-YYYY in Australia/Sydney
const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  // Use locale en-AU, then replace spaces with hyphens
  const parts = date.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Australia/Sydney'
  }).split(' ');
  // ["04", "Jun", "2025"]
  return parts.join('-');
};

const DataTable = ({ columns, data, onEdit, onDelete }) => (
  <table className="data-table">
    <thead>
      <tr>
        {columns.map((col) => (
          <th key={col.accessor}>{col.Header}</th>
        ))}
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {data.map((row) => (
        <tr key={row.id}>
          {columns.map((col) => (
            <td key={col.accessor}>
              {col.accessor === 'dob'
                ? formatDate(row.dob)
                : row[col.accessor]}
            </td>
          ))}
          <td>
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
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default DataTable;
