import React from 'react';

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const parts = date.toLocaleDateString('en-AU', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
    timeZone: 'Australia/Sydney'
  }).split(' ');
  return parts.join('-');
};

const DataTable = ({ columns, data, onEdit, onDelete }) => (
  <table className="data-table">
    <thead>
      <tr>
        {columns.map(col => (
          <th key={col.accessor}>{col.Header}</th>
        ))}
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {data.map(row => (
        <tr key={row.id}>
          {columns.map(col => (
            <td key={col.accessor}>
              {col.accessor === 'dob' ? formatDate(row.dob) : row[col.accessor]}
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

export default DataTable;
