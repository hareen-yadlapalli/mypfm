import React, { useState } from 'react';

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

/**
 * fields: [{ label, name, type }] 
 * onSearch(criteriaArray) 
 * onReset()
 */
const AdvancedSearch = ({ fields, onSearch, onReset }) => {
  const [criteria, setCriteria] = useState([
    { field: fields[0].name, operator: operatorsByType[fields[0].type][0].value, value: '' },
  ]);

  const addRow = () => {
    const first = fields[0];
    setCriteria(c => [
      ...c,
      { field: first.name, operator: operatorsByType[first.type][0].value, value: '' },
    ]);
  };

  const removeRow = idx => {
    setCriteria(c => c.filter((_, i) => i !== idx));
  };

  const updateField = (idx, newField) => {
    const type = fields.find(f => f.name === newField).type;
    setCriteria(c =>
      c.map((row, i) =>
        i === idx
          ? { field: newField, operator: operatorsByType[type][0].value, value: '' }
          : row
      )
    );
  };

  const updateOperator = (idx, newOp) => {
    setCriteria(c =>
      c.map((row, i) => (i === idx ? { ...row, operator: newOp } : row))
    );
  };

  const updateValue = (idx, val) => {
    setCriteria(c =>
      c.map((row, i) => (i === idx ? { ...row, value: val } : row))
    );
  };

  const handleSearch = () => onSearch(criteria);
  const handleReset = () => {
    setCriteria([
      { field: fields[0].name, operator: operatorsByType[fields[0].type][0].value, value: '' },
    ]);
    onReset();
  };

  return (
    <div className="advanced-search">
      {criteria.map((row, idx) => {
        const fieldDef = fields.find(f => f.name === row.field);
        const ops = operatorsByType[fieldDef.type];
        return (
          <div className="criteria-row" key={idx}>
            <select
              value={row.field}
              onChange={e => updateField(idx, e.target.value)}
            >
              {fields.map(f => (
                <option key={f.name} value={f.name}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              value={row.operator}
              onChange={e => updateOperator(idx, e.target.value)}
            >
              {ops.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              type={fieldDef.type === 'date' ? 'date' : 'text'}
              value={row.value}
              onChange={e => updateValue(idx, e.target.value)}
            />
            {criteria.length > 1 && (
              <button
                className="button button-danger"
                onClick={() => removeRow(idx)}
              >
                ✕
              </button>
            )}
          </div>
        );
      })}
      <div className="modal-buttons">
        <button className="button button-secondary" onClick={addRow}>
          + Add Condition
        </button>
        <button className="button button-primary" onClick={handleSearch}>
          Search
        </button>
        <button className="button button-secondary" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default AdvancedSearch;
