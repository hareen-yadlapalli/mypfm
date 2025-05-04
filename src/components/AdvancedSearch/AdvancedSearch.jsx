// src/components/AdvancedSearch/AdvancedSearch.jsx

import React, { useState } from 'react';
import './AdvancedSearch.css';

const operatorsByType = {
  text: [
    { label: 'contains', value: 'contains' },
    { label: 'equals', value: 'equals' },
    { label: 'starts with', value: 'startsWith' },
    { label: 'ends with', value: 'endsWith' },
  ],
  date: [
    { label: 'on', value: 'on' },
    { label: 'before', value: 'before' },
    { label: 'after', value: 'after' },
  ],
};

const getOperators = (type) => operatorsByType[type] || operatorsByType.text;

const AdvancedSearch = ({ fields, onSearch, onReset }) => {
  const [criteria, setCriteria] = useState([
    {
      field: fields[0].name,
      operator: getOperators(fields[0].type)[0].value,
      value: '',
    },
  ]);

  const addRow = () => {
    const first = fields[0];
    setCriteria((c) => [
      ...c,
      {
        field: first.name,
        operator: getOperators(first.type)[0].value,
        value: '',
      },
    ]);
  };

  const removeRow = (idx) => {
    setCriteria((c) => c.filter((_, i) => i !== idx));
  };

  const updateField = (idx, field) => {
    const def = fields.find((f) => f.name === field);
    const ops = getOperators(def.type);
    setCriteria((c) =>
      c.map((row, i) =>
        i === idx
          ? { field, operator: ops[0].value, value: '' }
          : row
      )
    );
  };

  const updateOperator = (idx, op) => {
    setCriteria((c) =>
      c.map((row, i) => (i === idx ? { ...row, operator: op } : row))
    );
  };

  const updateValue = (idx, val) => {
    setCriteria((c) =>
      c.map((row, i) => (i === idx ? { ...row, value: val } : row))
    );
  };

  return (
    <div className="advanced-search">
      {criteria.map((row, idx) => {
        const def = fields.find((f) => f.name === row.field);
        const ops = getOperators(def.type);
        return (
          <React.Fragment key={idx}>
            <select
              value={row.field}
              onChange={(e) => updateField(idx, e.target.value)}
            >
              {fields.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              value={row.operator}
              onChange={(e) => updateOperator(idx, e.target.value)}
            >
              {ops.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              type={def.type === 'date' ? 'date' : 'text'}
              value={row.value}
              onChange={(e) => updateValue(idx, e.target.value)}
            />
            {idx === criteria.length - 1 ? (
              <button
                className="button button-secondary small"
                onClick={addRow}
                style={{ gridColumn: 4 }}
              >
                ＋
              </button>
            ) : (
              <button
                className="button button-danger small"
                onClick={() => removeRow(idx)}
                style={{ gridColumn: 4 }}
              >
                ×
              </button>
            )}
          </React.Fragment>
        );
      })}

      {/* Footer row: Search under Field, Reset under Operator */}
      <React.Fragment>
        <button
          className="button button-primary"
          onClick={() => onSearch(criteria)}
          style={{ gridColumn: 1 }}
        >
          Search
        </button>
        <button
          className="button button-secondary"
          onClick={() => {
            setCriteria([
              {
                field: fields[0].name,
                operator: getOperators(fields[0].type)[0].value,
                value: '',
              },
            ]);
            onReset();
          }}
          style={{ gridColumn: 2 }}
        >
          Reset
        </button>
        <div />
        <div />
      </React.Fragment>
    </div>
  );
};

export default AdvancedSearch;
