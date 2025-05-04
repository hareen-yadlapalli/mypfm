import React from 'react';

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
            <td key={col.accessor}>{row[col.accessor]}</td>
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
