import React from 'react';

const DataTable = ({ columns, data, onEdit, onDelete }) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.accessor}>{column.Header}</th>
          ))}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            {columns.map((column) => (
              <td key={column.accessor}>{row[column.accessor]}</td>
            ))}
            <td>
              <button className="edit-button" onClick={() => onEdit(row)}>
                Edit
              </button>
              <button className="delete-button" onClick={() => onDelete(row.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
