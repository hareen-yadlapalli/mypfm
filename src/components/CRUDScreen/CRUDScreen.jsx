import React, { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import SearchBox from '../SearchBox/SearchBox';
import AdvancedSearch from '../AdvancedSearch/AdvancedSearch';
import DataTable from '../DataTable/DataTable';
import DataFormPopup from '../DataFormPopup/DataFormPopup';
import ActionButton from '../ActionButton/ActionButton';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './CRUDScreen.css';

const CRUDScreen = ({
  endpoint,
  fields,
  columns = [],      // screen-provided default visible columns (array of {Header,accessor,…})
  idField = 'id',
  transformFetch = d => d,
}) => {
  const location = useLocation();
  const storageKey = `crud-visible:${location.pathname}`;

  // 1) Build the full set of POSSIBLE columns:
  const fieldCols = useMemo(() => 
    fields.map(f => ({
      Header:    f.label,
      accessor:  f.name,
      canSort:   true,
      type:      f.type
    }))
  , [fields]);

  // Any computed columns the screen passed in (e.g. propertyLabel, accountLabel, etc.)
  const computedCols = useMemo(() =>
    columns.filter(c => !fieldCols.some(fc => fc.accessor === c.accessor))
  , [columns, fieldCols]);

  // All possible = fields + computed
  const possibleCols = useMemo(() =>
    [...fieldCols, ...computedCols]
  , [fieldCols, computedCols]);

  // 2) Visible columns state (accessors), initializer loads from localStorage or fallback to defaults
  const [visibleCols, setVisibleCols] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    // if screen provided `columns`, use those accessors; else show all by default
    return columns.length
      ? columns.map(c => c.accessor)
      : possibleCols.map(c => c.accessor);
  });

  // 3) Temp state for the columns-picker dialog
  const [tempCols, setTempCols]     = useState(visibleCols);
  const [showColsMenu, setShowColsMenu] = useState(false);
  const colsRef = useRef();

  // open / reset the menu
  const openColsMenu = () => {
    setTempCols(visibleCols);
    setShowColsMenu(true);
  };
  const closeColsMenu = () => setShowColsMenu(false);
  const applyCols = () => {
    setVisibleCols(tempCols);
    localStorage.setItem(storageKey, JSON.stringify(tempCols));
    closeColsMenu();
  };
  const selectAllCols = () => {
    setTempCols(possibleCols.map(c => c.accessor));
  };

  // --- FETCH & UI state (unchanged) ---
  const [items, setItems]               = useState([]);
  const [searchTerm, setSearchTerm]     = useState('');
  const [criteria, setCriteria]         = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData]         = useState({});
  const [editingItem, setEditingItem]   = useState(null);
  const [showPopup, setShowPopup]       = useState(false);
  const [mode, setMode]                 = useState('add');
  const [sortField, setSortField]       = useState(idField);
  const [sortOrder, setSortOrder]       = useState('asc');
  const [currentPage, setCurrentPage]   = useState(1);
  const [pageSize, setPageSize]         = useState(10);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef();

  // initial data load
  useEffect(() => {
    fetch(endpoint)
      .then(r => r.json())
      .then(data => setItems(transformFetch(data)))
      .catch(console.error);
  }, [endpoint, transformFetch]);

// build the *full* list of possible columns (either props.columns, or one-per-field)
  const allCols = useMemo(() => {
    return columns.length
      ? columns
      : fields.map(f => ({
          Header:   f.label,
          accessor: f.name,
          canSort:  true
        }));
  }, [columns, fields]);

  // Simple filter
  const simpleFiltered = useMemo(() => {
    if (!searchTerm) return items;
    const low = searchTerm.toLowerCase();
    return items.filter(i =>
      Object.values(i).some(v => String(v||'').toLowerCase().includes(low))
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
        if (def?.type === 'date') {
          const rd = new Date(rec).setHours(0,0,0,0);
          const qd = new Date(value).setHours(0,0,0,0);
          if (operator === 'on')     return rd === qd;
          if (operator === 'before') return rd < qd;
          return rd > qd;
        }
        const lr = String(rec||'').toLowerCase();
        const lq = value.toLowerCase();
        switch (operator) {
          case 'contains':   return lr.includes(lq);
          case 'equals':     return lr === lq;
          case 'startsWith': return lr.startsWith(lq);
          case 'endsWith':   return lr.endsWith(lq);
          default:           return true;
        }
      })
    );
  }, [simpleFiltered, criteria, fields]);

  // Sorting
  const sortedData = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a,b) => {
      const def = fields.find(f => f.name === sortField);
      let av = a[sortField] ?? '';
      let bv = b[sortField] ?? '';
      if (def?.type === 'date') {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      }
      if (!isNaN(av) && !isNaN(bv)) {
        return sortOrder==='asc' ? av-bv : bv-av;
      }
      return sortOrder==='asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [filtered, sortField, sortOrder, fields]);

  // Pagination setup
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pageNumbers = [];
  const startP = Math.max(1, currentPage - 4);
  const endP   = Math.min(totalPages, startP + 9);
  for (let i = startP; i <= endP; i++) pageNumbers.push(i);
  const pagedData = useMemo(() => {
    const st = (currentPage - 1) * pageSize;
    return sortedData.slice(st, st + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Handlers
  const handleSort = field => {
    if (sortField === field) setSortOrder(o => o==='asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
    setCurrentPage(1);
  };
  const handleSave = () => {
    const payload = mode === 'add' ? formData : editingItem;
    const url     = mode==='add' ? endpoint : `${endpoint}/${editingItem[idField]}`;
    const method  = mode==='add' ? 'POST' : 'PUT';
    fetch(url, {
      method,
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setItems(list => {
          const updated = mode==='add'
            ? [...list, data]
            : list.map(i => i[idField]===data[idField] ? data : i);
          // re-sort
          return [...updated].sort((x,y)=>{
            const df = fields.find(f=>f.name===sortField);
            let xv = x[sortField] ?? '', yv = y[sortField] ?? '';
            if (df?.type==='date') {
              xv = new Date(xv).getTime();
              yv = new Date(yv).getTime();
            }
            if (!isNaN(xv) && !isNaN(yv)) {
              return sortOrder==='asc' ? xv-yv : yv-xv;
            }
            return sortOrder==='asc'
              ? String(xv).localeCompare(String(yv))
              : String(yv).localeCompare(String(xv));
          });
        });
        setShowPopup(false);
      })
      .catch(()=>alert('Failed to save.'));
  };
  const handleDelete = id => {
    if (!window.confirm('Delete this record?')) return;
    fetch(`${endpoint}/${id}`, { method:'DELETE' })
      .then(r => r.ok
        ? setItems(list => list.filter(i=>i[idField]!==id))
        : Promise.reject())
      .catch(()=>alert('Failed to delete.'));
  };

  // Export / Import (unchanged)...
  const exportCols = useMemo(() => [idField, ...fields.map(f=>f.name)], [idField, fields]);
  const getExportArray = () => sortedData.map(item => {
    const obj = {};
    exportCols.forEach(c => obj[c] = item[c]);
    return obj;
  });
  const handleExport = type => {
    const arr = getExportArray();
    const ws  = XLSX.utils.json_to_sheet(arr, { header: exportCols });
    ws['!cols'] = [{ locked: true }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    const base = location.pathname.slice(1) || 'data';
    if (type==='csv')   XLSX.writeFile(wb, `${base}.csv`);
    if (type==='excel') XLSX.writeFile(wb, `${base}.xlsx`);
    if (type==='pdf') {
      const doc = new jsPDF();
      doc.autoTable({ head: [exportCols], body: arr.map(r => exportCols.map(c=>r[c])) });
      doc.save(`${base}.pdf`);
    }
    setShowExportMenu(false);
  };
  const handleDownloadTemplate = () => {
    const headers = exportCols.reduce((o,c)=>(o[c]='',o), {});
    const ws = XLSX.utils.json_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const base = location.pathname.slice(1) || 'data';
    XLSX.writeFile(wb, `${base}_template.xlsx`);
  };
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const wb   = XLSX.read(evt.target.result, { type:'array' });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
      rows.forEach(row => {
        const id     = row[idField];
        const url    = id ? `${endpoint}/${id}` : endpoint;
        const method = id ? 'PUT' : 'POST';
        fetch(url, {
          method,
          headers: { 'Content-Type':'application/json' },
          body:   JSON.stringify(row)
        })
        .then(r=>r.json())
        .then(data=>{
          setItems(list=>{
            const exists = list.find(i=>i[idField]===data[idField]);
            return exists
              ? list.map(i=>i[idField]===data[idField]?data:i)
              : [...list,data];
          });
        })
        .catch(console.error);
      });
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  return (
    <div className="main">
      <div className="button-container">
        <div className="left-buttons">
          <SearchBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search..."
          />
          <button
            className="button button-secondary"
            onClick={()=>setShowAdvanced(v=>!v)}
          >
            {showAdvanced ? 'Hide Advanced' : 'Advanced Search'}
          </button>
          <ActionButton
            label="Add New"
            onClick={() => {
              setMode('add');
              // initialize formData
              const init = {};
              fields.forEach(f=>{
                if (f.type==='select') {
                  const opt = Array.isArray(f.options) && f.options[0];
                  init[f.name] = typeof opt==='object'
                    ? opt.value
                    : (opt||'');
                } else {
                  init[f.name] = '';
                }
              });
              setFormData(init);
              setShowPopup(true);
            }}
          />

          {/* Export */}
          <div style={{ position:'relative' }}>
            <ActionButton
              label="Export"
              onClick={()=>setShowExportMenu(v=>!v)}
            />
            {showExportMenu && (
              <div className="export-menu">
                {['csv','excel','pdf'].map(opt=>(
                  <div
                    key={opt}
                    className="export-menu-item"
                    onClick={()=>handleExport(opt)}
                  >
                    {opt.toUpperCase()}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Import */}
          <label className="button button-secondary import-btn">
            Import
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
            />
          </label>

          <ActionButton
            label="Template"
            onClick={handleDownloadTemplate}
          />

          {/* Columns picker */}
          <div className="columns-picker" ref={colsRef}>
            <ActionButton
              label="Columns"
              onClick={openColsMenu}
            />
            {showColsMenu && (
              <div className="column-menu">
                <div className="column-menu-header">
                  <button
                    className="button button-secondary small"
                    onClick={selectAllCols}
                  >
                    Select All
                  </button>
                </div>
                <div className="column-menu-list">
                  {possibleCols.map(col=>(
                    <label key={col.accessor}>
                      <input
                        type="checkbox"
                        checked={tempCols.includes(col.accessor)}
                        onChange={()=>{
                          setTempCols(tc=>
                            tc.includes(col.accessor)
                              ? tc.filter(x=>x!==col.accessor)
                              : [...tc, col.accessor]
                          );
                        }}
                      />
                      {col.Header}
                    </label>
                  ))}
                </div>
                <div className="column-menu-footer">
                  <button
                    className="button button-primary small"
                    onClick={applyCols}
                  >
                    OK
                  </button>
                  <button
                    className="button button-secondary small"
                    onClick={closeColsMenu}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pagination">
          <button
            className="button"
            onClick={()=>setCurrentPage(p=>Math.max(p-1,1))}
            disabled={currentPage===1}
          >Back</button>
          {pageNumbers.map(n=>(
            <button
              key={n}
              className={`button ${n===currentPage?'button-primary':''}`}
              onClick={()=>setCurrentPage(n)}
            >{n}</button>
          ))}
          <button
            className="button"
            onClick={()=>setCurrentPage(p=>Math.min(p+1,totalPages))}
            disabled={currentPage===totalPages}
          >Next</button>
          <input
            type="number"
            min={1}
            value={pageSize}
            onChange={e=>{
              const v = Number(e.target.value);
              if (v>0) {
                setPageSize(v);
                setCurrentPage(1);
              }
            }}
            className="search-box"
            title="Results per page"
          />
        </div>
      </div>

      {showAdvanced && (
        <AdvancedSearch
          fields={fields}
          onSearch={setCriteria}
          onReset={() => setCriteria([])}
        />
      )}

      <DataFormPopup
        isOpen={showPopup}
        onSave={handleSave}
        onCancel={() => setShowPopup(false)}
        title={mode==='add'?'Add New':'Edit'}
        formData={mode==='add'?formData:editingItem}
        setFormData={mode==='add'?setFormData:setEditingItem}
        fields={fields.map(f=>({...f, placeholder: f.label}))}
      />

      <div className="table-container">
        <DataTable
          columns={allCols.filter(c => visibleCols.includes(c.accessor))}
          data={pagedData}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={row=>{
            setMode('edit');
            const copy = {...row};
            fields.forEach(f=>{
              if (f.type==='date' && copy[f.name]){
                copy[f.name] = copy[f.name].split('T')[0];
              }
            });
            setEditingItem(copy);
            setShowPopup(true);
          }}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

CRUDScreen.propTypes = {
  endpoint:      PropTypes.string.isRequired,
  fields:        PropTypes.array.isRequired,
  columns:       PropTypes.array,
  idField:       PropTypes.string,
  transformFetch:PropTypes.func,
};

export default CRUDScreen;
