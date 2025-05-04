// src/components/CRUDScreen/CRUDScreen.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import SearchBox from '../SearchBox/SearchBox';
import AdvancedSearch from '../AdvancedSearch/AdvancedSearch';
import DataTable from '../DataTable/DataTable';
import DataFormPopup from '../DataFormPopup/DataFormPopup';
import ActionButton from '../ActionButton/ActionButton';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const CRUDScreen = ({
  title,
  endpoint,
  fields,
  idField = 'id',
  transformFetch = data => data,
}) => {
  // Data state
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form state
  const [formData, setFormData] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mode, setMode] = useState('add');

  // Sorting defaults to ID ascending
  const [sortField, setSortField] = useState(idField);
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Export menu
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef();

  // File input ref for import
  const fileInputRef = useRef();

  // Fetch items once
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
          const lr = String(rec || '').toLowerCase();
          const lq = value.toLowerCase();
          if (operator === 'contains') return lr.includes(lq);
          if (operator === 'equals') return lr === lq;
          if (operator === 'startsWith') return lr.startsWith(lq);
          if (operator === 'endsWith') return lr.endsWith(lq);
        }
        return true;
      })
    );
  }, [simpleFiltered, criteria, fields]);

  // Global sort
  const sortedData = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const def = fields.find(f => f.name === sortField);
      let aVal = a[sortField] ?? '';
      let bVal = b[sortField] ?? '';
      if (def?.type === 'date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (!isNaN(aVal) && !isNaN(bVal)) {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return arr;
  }, [filtered, sortField, sortOrder, fields]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pageNumbers = [];
  const startPage = Math.max(1, currentPage - 4);
  const endPage = Math.min(totalPages, startPage + 9);
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Handlers
  const handleSort = field => {
    if (sortField === field) setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleSave = () => {
    const payload = mode === 'add' ? formData : editingItem;
    if (!payload[fields[0].name]?.toString().trim()) return alert(`${fields[0].label} is required.`);
    const url = mode === 'add' ? endpoint : `${endpoint}/${editingItem[idField]}`;
    const method = mode === 'add' ? 'POST' : 'PUT';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data => {
        setItems(list => {
          let newList;
          if (mode === 'add') newList = [...list, data];
          else newList = list.map(i => (i[idField] === data[idField] ? data : i));
          // re-sort
          return [...newList].sort((a, b) => {
            const def = fields.find(f => f.name === sortField);
            let aVal = a[sortField] ?? '';
            let bVal = b[sortField] ?? '';
            if (def?.type === 'date') {
              aVal = new Date(aVal).getTime();
              bVal = new Date(bVal).getTime();
            }
            if (!isNaN(aVal) && !isNaN(bVal)) return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            return sortOrder === 'asc'
              ? String(aVal).localeCompare(String(bVal))
              : String(bVal).localeCompare(String(aVal));
          });
        });
        setShowPopup(false);
      })
      .catch(() => alert('Failed to save.'));
  };

  const handleDelete = id => {
    if (!window.confirm(`Delete this ${title.slice(0, -1)}?`)) return;
    fetch(`${endpoint}/${id}`, { method: 'DELETE' })
      .then(res => (res.ok ? setItems(list => list.filter(i => i[idField] !== id)) : Promise.reject()))
      .catch(() => alert('Failed to delete.'));
  };

  const exportCols = useMemo(() => [idField, ...fields.map(f => f.name)], [idField, fields]);

  const getExportArray = () => sortedData.map(item => {
    const obj = {};
    exportCols.forEach(col => (obj[col] = item[col]));
    return obj;
  });

  const handleExport = type => {
    const arr = getExportArray();
    const ws = XLSX.utils.json_to_sheet(arr, { header: exportCols });
    const colDefs = ws['!cols'] || [];
    colDefs[0] = { locked: true };
    ws['!cols'] = colDefs;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title);
    if (type === 'csv') XLSX.writeFile(wb, `${title}.csv`);
    else if (type === 'excel') XLSX.writeFile(wb, `${title}.xlsx`);
    else if (type === 'pdf') {
      const doc = new jsPDF();
      const headerLabels = exportCols.map(col => fields.find(f => f.name === col)?.label ?? col);
      const bodyData = arr.map(row => exportCols.map(col => row[col]));
      doc.autoTable({ head: [headerLabels], body: bodyData });
      doc.save(`${title}.pdf`);
    }
    setShowExportMenu(false);
  };

  const handleDownloadTemplate = () => {
    const headers = exportCols.reduce((acc, col) => ({ ...acc, [col]: '' }), {});
    const ws = XLSX.utils.json_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${title}_template.xlsx`);
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const wb = XLSX.read(evt.target.result, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      rows.forEach(row => {
        const id = row[idField];
        const url = id ? `${endpoint}/${id}` : endpoint;
        const method = id ? 'PUT' : 'POST';
        fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row),
        })
          .then(res => res.json())
          .then(data => setItems(list => {
            const exists = list.find(i => i[idField] === data[idField]);
            return exists
              ? list.map(i => (i[idField] === data[idField] ? data : i))
              : [...list, data];
          }))
          .catch(console.error);
      });
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  // Render
  return (
    <div className="main">
      <h2>{title}</h2>
      <div className="button-container" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder={`Search ${title.toLowerCase()}...`} />
          <button className="button button-secondary" onClick={() => setShowAdvanced(v => !v)}>
            {showAdvanced ? 'Hide Advanced' : 'Advanced Search'}
          </button>
          {/* Add/Edit popup trigger */}
          <ActionButton label={`Add New ${title.slice(0, -1)}`} onClick={() => {
            setMode('add');
            setFormData(fields.reduce((acc,f)=>({ ...acc, [f.name]: '' }), {}));
            setShowPopup(true);
          }} />
          {/* Export dropdown */}
          <div style={{ position: 'relative' }} ref={exportRef}>
            <ActionButton label="Export" onClick={() => setShowExportMenu(v => !v)} />
            {showExportMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', zIndex: 10 }}>
                {['csv', 'excel', 'pdf'].map(opt => (
                  <div key={opt} style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={() => handleExport(opt)}>
                    {opt.toUpperCase()}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Template download */}
          <ActionButton label="Template" onClick={handleDownloadTemplate} />
          {/* Import file */}
          <label className="button button-secondary" style={{ cursor: 'pointer' }}>
            Import
            <input type="file" accept=".xlsx,.csv" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        </div>
        {/* Pagination controls */}
        <div className="pagination" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="button" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
            Back
          </button>
          {pageNumbers.map(n => (
            <button key={n} className={`button ${n === currentPage ? 'button-primary' : ''}`} onClick={() => setCurrentPage(n)}>
              {n}
            </button>
          ))}
          <button className="button" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
            Next
          </button>
          <input
            type="number"
            min={1}
            value={pageSize}
            onChange={e => {
              const v = Number(e.target.value);
              if (v > 0) {
                setPageSize(v);
                setCurrentPage(1);
              }
            }}
            style={{ width: '60px' }}
            title="Results per page"
          />
        </div>
      </div>

      {showAdvanced && <AdvancedSearch fields={fields} onSearch={setCriteria} onReset={() => setCriteria([])} />}

      {/* Add/Edit form popup */}
      <DataFormPopup
        isOpen={showPopup}
        onSave={handleSave}
        onCancel={() => setShowPopup(false)}
        title={mode === 'add' ? `Add New ${title.slice(0, -1)}` : `Edit ${title.slice(0, -1)}`}
        formData={mode === 'add' ? formData : editingItem}
        setFormData={mode === 'add' ? setFormData : setEditingItem}
        fields={fields.map(f => ({ ...f, placeholder: f.label }))}
      />

      {/* Data table with scroll */}
      <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
        <DataTable
          columns={fields.map(f => ({ Header: f.label, accessor: f.name, canSort: true }))}
          data={pagedData}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={row => {
            setMode('edit');
            const copy = { ...row };
            fields.forEach(f => {
              if (f.type === 'date' && copy[f.name]) {
                copy[f.name] = copy[f.name].split('T')[0];
              }
            });
            setEditingItem(copy);
            setFormData(null);
            setShowPopup(true);
          }}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

CRUDScreen.propTypes = {
  title: PropTypes.string.isRequired,
  endpoint: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired,
  idField: PropTypes.string,
  transformFetch: PropTypes.func,
};

export default CRUDScreen;
