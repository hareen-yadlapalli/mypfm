import React, { useState, useEffect, useMemo } from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

// same date formatter
const formatDate = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mns = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${dd}-${mns[d.getMonth()]}-${d.getFullYear()}`;
};

export default function BillsScreen() {
  const [propertyOptions, setPropertyOptions] = useState([{ label: 'None', value: 0 }]);
  const [accountOptions, setAccountOptions]   = useState([{ label: 'None', value: 0 }]);
  const [catRows, setCatRows]                 = useState([]);

  useEffect(() => {
    fetch('/api/properties')
      .then(r => r.json())
      .then(data => setPropertyOptions([
        { label: 'None', value: 0 },
        ...data.map(p => ({ label: `${p.address}, ${p.suburb}`, value: p.id }))
      ]));
    fetch('/api/accounts')
      .then(r => r.json())
      .then(data => setAccountOptions([
        { label: 'None', value: 0 },
        ...data.map(a => ({ label: `${a.provider} – ${a.accountno}`, value: a.id }))
      ]));
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCatRows(data.filter(c => c.direction === 'Expense')));
  }, []);

  const fields = useMemo(() => {
    const catOpts = Array.from(new Set(catRows.map(r => r.category)))
      .map(c => ({ label: c, value: c }));
    return [
      { label: 'Property', name: 'propertyid',   type: 'select', options: propertyOptions },
      { label: 'Account',  name: 'accountid',    type: 'select', options: accountOptions },
      { label: 'Name',     name: 'name',         type: 'text' },
      { label: 'Category', name: 'category',     type: 'select', options: catOpts },
      { 
        label: 'Subcat1',  name: 'subcategory1', type: 'select',
        options: fd => Array.from(new Set(
          catRows.filter(r => r.category === fd.category).map(r => r.subcategory1)
        )).filter(v=>v).map(v=>({label:v,value:v}))
      },
      { 
        label: 'Subcat2',  name: 'subcategory2', type: 'select',
        options: fd => Array.from(new Set(
          catRows
            .filter(r => r.category===fd.category && r.subcategory1===fd.subcategory1)
            .map(r => r.subcategory2)
        )).filter(v=>v).map(v=>({label:v,value:v}))
      },
      { 
        label: 'Subcat3',  name: 'subcategory3', type: 'select',
        options: fd => Array.from(new Set(
          catRows
            .filter(r =>
              r.category===fd.category &&
              r.subcategory1===fd.subcategory1 &&
              r.subcategory2===fd.subcategory2
            )
            .map(r => r.subcategory3)
        )).filter(v=>v).map(v=>({label:v,value:v}))
      },
      { label: 'Frequency', name: 'frequency', type: 'select',
        options: ['Weekly','Fortnightly','Monthly','Yearly'] },
      { label: 'Amount',    name: 'amount',    type: 'number' },
      { label: 'Start Date',name: 'startdate', type: 'date' },
      { label: 'End Date',  name: 'enddate',   type: 'date' },
    ];
  }, [propertyOptions, accountOptions, catRows]);

  const columns = useMemo(() => [
    { Header: 'Property', accessor: 'propertyLabel', canSort: true },
    { Header: 'Account',  accessor: 'accountLabel',  canSort: true },
    { Header: 'Name',     accessor: 'name',          canSort: true },
    { Header: 'Category', accessor: 'category',      canSort: true },
    { Header: 'Subcat1',  accessor: 'subcategory1' },
    { Header: 'Subcat2',  accessor: 'subcategory2' },
    { Header: 'Subcat3',  accessor: 'subcategory3' },
    { Header: 'Frequency',accessor: 'frequency' },
    {
      Header: 'Amount',
      accessor: 'amount',
      canSort: true,
      Cell: ({ value }) => `$${Number(value).toFixed(2)}`
    },
    {
      Header: 'Start',
      accessor: 'startdate',
      canSort: true,
      Cell: ({ value }) => formatDate(value)
    },
    {
      Header: 'End',
      accessor: 'enddate',
      canSort: true,
      Cell: ({ value }) => formatDate(value)
    },
  ], []);

  const transformFetch = useMemo(() => data => data.map(item => {
    const p = propertyOptions.find(o => o.value === (item.propertyid ?? 0)) || {};
    const a = accountOptions.find(o => o.value === (item.accountid  ?? 0)) || {};
    return {
      ...item,
      propertyLabel: p.label || 'None',
      accountLabel:  a.label || 'None',
    };
  }), [propertyOptions, accountOptions]);

  return (
    <CRUDScreen
      endpoint="http://localhost:5000/api/bills"
      fields={fields}
      columns={columns}
      idField="id"
      transformFetch={transformFetch}
    />
  );
}
