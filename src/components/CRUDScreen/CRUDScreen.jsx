// src/components/CRUDScreen/CRUDScreen.jsx

import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import SearchBox from '../SearchBox/SearchBox';
import AdvancedSearch from '../AdvancedSearch/AdvancedSearch';
import DataTable from '../DataTable/DataTable';
import DataFormPopup from '../DataFormPopup/DataFormPopup';
import ActionButton from '../ActionButton/ActionButton';

const CRUDScreen = ({
  title,
  endpoint,
  fields,
  idField = 'id',
  transformFetch = data => data,
}) => {
  // Data and filters
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form state
  const [formData, setFormData] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mode, setMode] = useState('add');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch items
  useEffect(() => {
    fetch(endpoint)
      .then(res => res.json())
      .then(data => setItems(transformFetch(data)))
      .catch(console.error);
  }, [endpoint, transformFetch]);

  // Simple filter
  const simpleFiltered = useMemo(() => {
    if (!searchTerm) return items;
    const lower = searchTerm.toLowerCase();
    return items.filter(item =>
      Object.values(item).some(v => String(v || '').toLowerCase().includes(lower))
    );
  }, [items, searchTerm]);

  // Advanced filter
  const filtered = useMemo(() => {
    if (!criteria.length) return simpleFiltered;
    return simpleFiltered.filter(item =>
      criteria.every(({ field, operator, value }) => {
        if (!value) return true;
        const rec = item[field];
        const def = fields.find(f => f.name === field);
        if (def.type === 'date') {
          const rd = new Date(rec).setHours(0,0,0,0);
          const qd = new Date(value).setHours(0,0,0,0);
          if (operator === 'on') return rd === qd;
          if (operator === 'before') return rd < qd;
          if (operator === 'after') return rd > qd;
        } else {
          const lowerRec = String(rec || '').toLowerCase();
          const lowerQ = value.toLowerCase();
          if (operator === 'contains') return lowerRec.includes(lowerQ);
          if (operator === 'equals') return lowerRec === lowerQ;
          if (operator === 'startsWith') return lowerRec.startsWith(lowerQ);
          if (operator === 'endsWith') return lowerRec.endsWith(lowerQ);
        }
        return true;
      })
    );
  }, [simpleFiltered, criteria, fields]);

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageNumbers = [];
  const startPage = Math.max(1, currentPage - 4);
  const endPage = Math.min(totalPages, startPage + 9);
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Save handler
  const handleSave = () => {
    const payload = mode === 'add' ? formData : editingItem;
    if (!payload[fields[0].name]) {
      alert(`${fields[0].label} is required.`);
      return;
    }
    const url = mode === 'add' ? endpoint : `${endpoint}/${editingItem[idField]}`;
    const method = mode === 'add' ? 'POST' : 'PUT';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        const updated = transformFetch(Array.isArray(data) ? data : [data])[0];
        setItems(list =>
          mode === 'add'
            ? [...list, updated]
            : list.map(i => i[idField] === updated[idField] ? updated : i)
        );
        setShowPopup(false);
      })
      .catch(() => alert('Failed to save.'));
  };

  // Delete handler
  const handleDelete = id => {
    if (!window.confirm(`Delete this ${title.slice(0, -1)}?`)) return;
    fetch(`${endpoint}/${id}`, { method: 'DELETE' })
      .then(res => res.ok ? setItems(list => list.filter(i => i[idField] !== id)) : Promise.reject())
      .catch(() => alert('Failed to delete.'));
  };

  const columns = fields.map(f => ({ Header: f.label, accessor: f.name }));

  return (
    <div className="main">
      <h2>{title}</h2>
      <div className="button-container" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder={`Search ${title.toLowerCase()}...`} />
          <button className="button button-secondary" onClick={() => setShowAdvanced(v => !v)}>
            {showAdvanced ? 'Hide Advanced' : 'Advanced Search'}
          </button>
          <ActionButton label={`Add New ${title.slice(0, -1)}`} onClick={() => {
            setMode('add');
            setFormData(fields.reduce((acc,f)=>({ ...acc, [f.name]: '' }), {}));
            setShowPopup(true);
          }} />
        </div>
        <div className="pagination" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="button" onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1}>Back</button>
          {pageNumbers.map(n => (
            <button key={n} className={`button ${n===currentPage?'button-primary':''}`} onClick={() => setCurrentPage(n)}>{n}</button>
          ))}
          <button className="button" onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages}>Next</button>
          <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value)); setCurrentPage(1);}}>
            {[5,10,25,50,100].map(n=> <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>
      {showAdvanced && <AdvancedSearch fields={fields} onSearch={setCriteria} onReset={() => setCriteria([])} />}

      <DataFormPopup
        isOpen={showPopup}
        onSave={handleSave}
        onCancel={() => setShowPopup(false)}
        title={mode === 'add' ? `Add New ${title.slice(0, -1)}` : `Edit ${title.slice(0, -1)}`}
        formData={mode === 'add' ? formData : editingItem}
        setFormData={mode === 'add' ? setFormData : setEditingItem}
        fields={fields.map(f => ({ ...f, placeholder: f.label }))}
      />

      <DataTable columns={columns} data={pagedData} onEdit={row => {
        setMode('edit');
        const copy = { ...row };
        fields.forEach(f => f.type === 'date' && copy[f.name] && (copy[f.name] = copy[f.name].split('T')[0]));
        setEditingItem(copy);
        setShowPopup(true);
      }} onDelete={handleDelete} />
    </div>
  );
};

CRUDScreen.propTypes = {
  title: PropTypes.string.isRequired,
  endpoint: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, name: PropTypes.string, type: PropTypes.string })).isRequired,
  idField: PropTypes.string,
  transformFetch: PropTypes.func,
};

export default CRUDScreen;
