// src/components/CRUDScreen/CRUDScreen.jsx

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
  columns = [],
  idField = 'id',
  transformFetch = data => data,
  initialSortField,
  initialSortOrder,
  onFilteredData = () => {}
}) => {
  // Data & UI state
  const [items, setItems]           = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [criteria, setCriteria]     = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData]     = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [showPopup, setShowPopup]   = useState(false);
  const [mode, setMode]             = useState('add');
  const [sortField, setSortField]   = useState(initialSortField || idField);
  const [sortOrder, setSortOrder]   = useState(initialSortOrder || 'asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]     = useState(10);

  // Menus
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showColsMenu, setShowColsMenu]     = useState(false);

  // Refs
  const exportRef    = useRef();
  const fileInputRef = useRef();
  const colsRef      = useRef();

  const location = useLocation();

  // Build ALL possible columns
  const allCols = useMemo(() => {
    if (columns.length) return columns;
    return fields.map(f => ({
      Header: f.label,
      accessor: f.name,
      canSort: true
    }));
  }, [columns, fields]);

  // Which columns are visible?
  const [visibleCols, setVisibleCols] = useState(
    () => allCols.map(c => c.accessor)
  );

  // Fetch initial data
  useEffect(() => {
    fetch(endpoint)
      .then(res => res.json())
      .then(data => setItems(transformFetch(data)))
      .catch(console.error);
  }, [endpoint, transformFetch]);

  // Simple search filter
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
        if (def?.type === 'date') {
          const rd = new Date(rec).setHours(0,0,0,0);
          const qd = new Date(value).setHours(0,0,0,0);
          if (operator === 'on')     return rd === qd;
          if (operator === 'before') return rd < qd;
          return rd > qd;
        } else {
          const lr = String(rec || '').toLowerCase();
          const lq = value.toLowerCase();
          switch (operator) {
            case 'contains':   return lr.includes(lq);
            case 'equals':     return lr === lq;
            case 'startsWith': return lr.startsWith(lq);
            case 'endsWith':   return lr.endsWith(lq);
            default:           return true;
          }
        }
      })
    );
  }, [simpleFiltered, criteria, fields]);

  // Notify parent of filtered data **once per filter change** (no infinite loop)
  useEffect(() => {
    onFilteredData(filtered);
    // deliberately NOT including onFilteredData in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  // Global sorting
  const sortedData = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a,b) => {
      const def = fields.find(f => f.name === sortField);
      let aVal = a[sortField] ?? '';
      let bVal = b[sortField] ?? '';
      if (def?.type === 'date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (!isNaN(aVal) && !isNaN(bVal)) {
        return sortOrder==='asc' ? aVal - bVal : bVal - aVal;
      }
      return sortOrder==='asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return arr;
  }, [filtered, sortField, sortOrder, fields]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pageNumbers = [];
  const startPage = Math.max(1, currentPage - 4);
  const endPage   = Math.min(totalPages, startPage + 9);
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Sort handler
  const handleSort = field => {
    if (sortField === field) setSortOrder(o => o==='asc'?'desc':'asc');
    else { setSortField(field); setSortOrder('asc'); }
    setCurrentPage(1);
  };

  // Save (create/update)
  const handleSave = () => {
    const payload = mode==='add' ? formData : editingItem;
    const url     = mode==='add' ? endpoint : `${endpoint}/${editingItem[idField]}`;
    const method  = mode==='add' ? 'POST' : 'PUT';
    fetch(url, {
      method,
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setItems(list => {
          const updated = mode==='add'
            ? [...list, data]
            : list.map(i=>i[idField]===data[idField]?data:i);
          // re-sort after save
          return [...updated].sort((x,y)=>{
            const df = fields.find(f=>f.name===sortField);
            let xv = x[sortField]??'', yv=y[sortField]??'';
            if(df?.type==='date'){ xv=new Date(xv).getTime(); yv=new Date(yv).getTime(); }
            if(!isNaN(xv)&&!isNaN(yv)) return sortOrder==='asc'?xv-yv:yv-xv;
            return sortOrder==='asc'
              ? String(xv).localeCompare(String(yv))
              : String(yv).localeCompare(String(xv));
          });
        });
        setShowPopup(false);
      }).catch(()=>alert('Failed to save.'));
  };

  // Delete handler
  const handleDelete = id => {
    if(!window.confirm('Delete this record?')) return;
    fetch(`${endpoint}/${id}`,{method:'DELETE'})
      .then(res=>res.ok
        ? setItems(list=>list.filter(i=>i[idField]!==id))
        : Promise.reject()
      )
      .catch(()=>alert('Failed to delete.'));
  };

  // Export/import utilities
  const exportCols = useMemo(()=>[idField, ...fields.map(f=>f.name)], [idField, fields]);
  const getExportArray = ()=>sortedData.map(item=>{
    const obj={}; exportCols.forEach(c=>obj[c]=item[c]); return obj;
  });

  const handleExport = type=>{
    const arr=getExportArray();
    const ws=XLSX.utils.json_to_sheet(arr,{header:exportCols}); ws['!cols']=[{locked:true}];
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Data');
    const base=location.pathname.slice(1)||'data';
    if(type==='csv')   XLSX.writeFile(wb,`${base}.csv`);
    if(type==='excel') XLSX.writeFile(wb,`${base}.xlsx`);
    if(type==='pdf'){
      const doc=new jsPDF(); doc.autoTable({head:[exportCols],body:arr.map(r=>exportCols.map(c=>r[c]))}); doc.save(`${base}.pdf`);
    }
    setShowExportMenu(false);
  };

  const handleDownloadTemplate = ()=>{
    const headers = exportCols.reduce((o,c)=>(o[c]='',o),{});
    const ws=XLSX.utils.json_to_sheet([headers]);
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Template');
    const base=location.pathname.slice(1)||'data'; XLSX.writeFile(wb,`${base}_template.xlsx`);
  };

  const handleFileChange=e=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader(); reader.onload=evt=>{
      const wb=XLSX.read(evt.target.result,{type:'array'});
      const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});
      rows.forEach(row=>{
        const id=row[idField]; const url=id?`${endpoint}/${id}`:endpoint; const method=id?'PUT':'POST';
        fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(row)})
          .then(res=>res.json())
          .then(data=>setItems(list=>{
            const exists=list.find(i=>i[idField]===data[idField]);
            return exists?list.map(i=>i[idField]===data[idField]?data:i):[...list,data];
          }))
          .catch(console.error);
      });
    };
    reader.readAsArrayBuffer(file);
    e.target.value=null;
  };

  return (
    <div className="main">
      <div className="button-container">
        {/* Left controls */}
        <div className="left-controls">
          <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Search..." />
          <button className="button button-secondary" onClick={()=>setShowAdvanced(v=>!v)}>
            {showAdvanced?'Hide Advanced':'Advanced Search'}
          </button>
          <ActionButton
            label="Add New"
            onClick={()=>{
              setMode('add');
              const init={};
              fields.forEach(f=>{
                if(f.type==='select'){
                  const first=Array.isArray(f.options)&&f.options[0];
                  init[f.name]=typeof first==='object'?first.value:first||'';
                } else init[f.name]='';
              });
              setFormData(init);
              setShowPopup(true);
            }}
          />
          <div ref={exportRef} className="export-menu-wrapper">
            <ActionButton label="Export" onClick={()=>setShowExportMenu(v=>!v)} />
            {showExportMenu&&(
              <div className="export-menu">
                {['csv','excel','pdf'].map(opt=>(
                  <div key={opt} className="export-item" onClick={()=>handleExport(opt)}>
                    {opt.toUpperCase()}
                  </div>
                ))}
              </div>
            )}
          </div>
          <label className="button button-secondary import-label">
            Import
            <input ref={fileInputRef} type="file" accept=".xlsx,.csv" onChange={handleFileChange} hidden/>
          </label>
          <ActionButton label="Template" onClick={handleDownloadTemplate} />
        </div>

        {/* Right controls (Columns picker) */}
        <div ref={colsRef} className="right-controls">
          <ActionButton label="Columns" onClick={()=>setShowColsMenu(v=>!v)} />
          {showColsMenu&&(
            <div className="column-menu">
              <label>
                <input
                  type="checkbox"
                  checked={visibleCols.length===allCols.length}
                  onChange={()=>setVisibleCols(vc=>
                    vc.length===allCols.length
                      ? []
                      : allCols.map(c=>c.accessor)
                  )}
                />
                Select All
              </label>
              <hr/>
              {allCols.map(c=>(
                <label key={c.accessor}>
                  <input
                    type="checkbox"
                    checked={visibleCols.includes(c.accessor)}
                    onChange={()=>setVisibleCols(vc=>
                      vc.includes(c.accessor)
                        ? vc.filter(x=>x!==c.accessor)
                        : [...vc,c.accessor]
                    )}
                  />
                  {c.Header}
                </label>
              ))}
              <div className="column-buttons">
                <button className="button button-secondary" onClick={()=>setShowColsMenu(false)}>Cancel</button>
                <button className="button button-primary"  onClick={()=>setShowColsMenu(false)}>OK</button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button className="button" onClick={()=>setCurrentPage(p=>Math.max(p-1,1))} disabled={currentPage===1}>Back</button>
          {pageNumbers.map(n=>(
            <button key={n} className={`button ${n===currentPage?'button-primary':''}`} onClick={()=>setCurrentPage(n)}>{n}</button>
          ))}
          <button className="button" onClick={()=>setCurrentPage(p=>Math.min(p+1,totalPages))} disabled={currentPage===totalPages}>Next</button>
          <input
            type="number"
            min={1}
            value={pageSize}
            onChange={e=>{
              const v=Number(e.target.value);
              if(v>0){setPageSize(v);setCurrentPage(1);}
            }}
            className="search-box page-size"
            title="Results per page"
          />
        </div>
      </div>

      {showAdvanced&&(
        <AdvancedSearch fields={fields} onSearch={setCriteria} onReset={()=>setCriteria([])} />
      )}

      <DataFormPopup
        isOpen={showPopup}
        title={mode==='add'?'Add New':'Edit'}
        formData={mode==='add'?formData:editingItem}
        setFormData={mode==='add'?setFormData:setEditingItem}
        onSave={handleSave}
        onCancel={()=>setShowPopup(false)}
        fields={fields.map(f=>({...f,placeholder:f.label}))}
      />

      <div className="table-wrapper">
        <DataTable
          columns={allCols.filter(c=>visibleCols.includes(c.accessor))}
          data={pagedData}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={row=>{
            setMode('edit');
            const copy={...row};
            fields.forEach(f=>{
              if(f.type==='date'&&copy[f.name]){
                copy[f.name]=copy[f.name].split('T')[0];
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
  endpoint: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired,
  columns: PropTypes.array,
  idField: PropTypes.string,
  transformFetch: PropTypes.func,
  initialSortField: PropTypes.string,
  initialSortOrder: PropTypes.oneOf(['asc','desc']),
  onFilteredData: PropTypes.func
};

export default CRUDScreen;
