// src/screens/TransactionsScreen/TransactionsScreen.jsx

import React, { useState, useEffect, useMemo } from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

// helper to format dates as DD-MMM-YYYY
const formatDate = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mns = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${dd}-${mns[d.getMonth()]}-${d.getFullYear()}`;
};

export default function TransactionsScreen() {
  const [propertyOptions, setPropertyOptions] = useState([{ label: 'None', value: 0 }]);
  const [accountOptions,  setAccountOptions]  = useState([{ label: 'None', value: 0 }]);
  const [catRows,         setCatRows]         = useState([]);
  const [bills,           setBills]           = useState([]);
  const [incomes,         setIncomes]         = useState([]);
  const [totals,          setTotals]          = useState({ income: 0, expense: 0, net: 0 });

  // ─── fetch lookups ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/properties')
      .then(r => r.json())
      .then(data =>
        setPropertyOptions([
          { label: 'None', value: 0 },
          ...data.map(p => ({ label: p.address, value: p.id }))
        ])
      );

    fetch('/api/accounts')
      .then(r => r.json())
      .then(data =>
        setAccountOptions([
          { label: 'None', value: 0 },
          ...data.map(a => ({
            label: `${a.provider} – ${a.accountno}`,
            value: a.id
          }))
        ])
      );

    fetch('/api/categories')
      .then(r => r.json())
      .then(setCatRows);

    fetch('/api/bills')
      .then(r => r.json())
      .then(setBills);

    fetch('/api/incomes')
      .then(r => r.json())
      .then(setIncomes);
  }, []);

  // ─── build the form fields ────────────────────────────────────────────────────
  const fields = useMemo(() => [
    {
      label: 'Direction',
      name: 'direction',
      type: 'select',
      options: ['Expense','Income']
    },
    {
      label: 'Reference',
      name: 'billid',  // always stored as billid
      type: 'select',
      options: fd => {
        const source = fd.direction === 'Expense' ? bills : fd.direction === 'Income' ? incomes : [];
        return source.map(x => {
          // collect name + category + any subcategories
          const parts = [ x.name ];
          if (x.category)      parts.push(x.category);
          if (x.subcategory1)  parts.push(x.subcategory1);
          if (x.subcategory2)  parts.push(x.subcategory2);
          if (x.subcategory3)  parts.push(x.subcategory3);
          return {
            label: parts.join(' - '),
            value: x.id
          };
        });
      }
    },
    { label: 'Purchase ID',      name: 'purchaseid',   type: 'number' },
    { label: 'Name',             name: 'name',         type: 'text'   },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      options: ['Scheduled','Paid','Due']
    },
    {
      label: 'Category',
      name: 'category',
      type: 'select',
      options: fd => Array.from(
        new Set(
          catRows
            .filter(c => c.direction === fd.direction)
            .map(c => c.category)
        )
      ).map(c => ({ label: c, value: c }))
    },
    {
      label: 'Subcat1',
      name: 'subcategory1',
      type: 'select',
      options: fd => {
        if (!fd.category) return [];
        return Array.from(
          new Set(
            catRows
              .filter(c =>
                c.direction === fd.direction &&
                c.category === fd.category
              )
              .map(c => c.subcategory1)
          )
        ).filter(v => v).map(v => ({ label: v, value: v }));
      }
    },
    {
      label: 'Subcat2',
      name: 'subcategory2',
      type: 'select',
      options: fd => {
        if (!fd.subcategory1) return [];
        return Array.from(
          new Set(
            catRows
              .filter(c =>
                c.direction === fd.direction &&
                c.category === fd.category &&
                c.subcategory1 === fd.subcategory1
              )
              .map(c => c.subcategory2)
          )
        ).filter(v => v).map(v => ({ label: v, value: v }));
      }
    },
    {
      label: 'Subcat3',
      name: 'subcategory3',
      type: 'select',
      options: fd => {
        if (!fd.subcategory2) return [];
        return Array.from(
          new Set(
            catRows
              .filter(c =>
                c.direction === fd.direction &&
                c.category === fd.category &&
                c.subcategory1 === fd.subcategory1 &&
                c.subcategory2 === fd.subcategory2
              )
              .map(c => c.subcategory3)
          )
        ).filter(v => v).map(v => ({ label: v, value: v }));
      }
    },
    {
      label: 'Provider',
      name: 'provider',
      type: 'select',
      options: fd => {
        const id = fd.billid;
        const src = fd.direction === 'Expense' ? bills : fd.direction === 'Income' ? incomes : [];
        const rec = src.find(x => x.id === id);
        return rec ? [{ label: rec.provider, value: rec.provider }] : [];
      }
    },
    { label: 'Amount',          name: 'amount',          type: 'number' },
    { label: 'Transaction Date',name: 'transactiondate', type: 'date'   },
    {
      label: 'Account',
      name: 'accountid',
      type: 'select',
      options: accountOptions
    },
    {
      label: 'Property',
      name: 'propertyid',
      type: 'select',
      options: propertyOptions
    }
  ], [
    bills, incomes, catRows,
    accountOptions, propertyOptions
  ]);

  // ─── table columns ────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      Header: 'Date',
      accessor: 'transactiondate',
      canSort: true,
      Cell: ({ value }) => formatDate(value)
    },
    { Header: 'Name',      accessor: 'name',      canSort: true },
    { Header: 'Direction', accessor: 'direction', canSort: true },
    { Header: 'Status',    accessor: 'status',    canSort: true },
    {
      Header: 'Amount',
      accessor: 'amount',
      canSort: true,
      Cell: ({ value, row }) => (
        <span style={{
          color: row.original.direction === 'Expense' ? 'red' : 'green'
        }}>
          ${Number(value).toFixed(2)}
        </span>
      )
    },
    { Header: 'Category',  accessor: 'category',  canSort: true },
    { Header: 'Subcat1',   accessor: 'subcategory1' },
    { Header: 'Subcat2',   accessor: 'subcategory2' },
    // { Header: 'Subcat3', accessor: 'subcategory3' },
    { Header: 'Provider',  accessor: 'provider',  canSort: true },
    {
      Header: 'Property',
      accessor: 'propertyLabel',
      canSort: true
    }
  ], []);

  // ─── map IDs → labels ─────────────────────────────────────────────────────────
  const transformFetch = useMemo(() => data =>
    data.map(item => {
      const acc  = accountOptions.find(o => o.value === (item.accountid ?? 0)) || {};
      const prop = propertyOptions.find(o => o.value === (item.propertyid ?? 0)) || {};
      return {
        ...item,
        accountLabel:  acc.label  || 'None',
        propertyLabel: prop.label || 'None'
      };
    })
  , [accountOptions, propertyOptions]);

  // ─── compute totals on every filter ──────────────────────────────────────────
  const handleFilteredData = filteredArray => {
    let income = 0, expense = 0;
    filteredArray.forEach(txn => {
      if (txn.direction === 'Income')  income  += Number(txn.amount);
      else                              expense += Number(txn.amount);
    });
    setTotals({ income, expense, net: income - expense });
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Totals bar */}
      <div style={{
        display: 'flex',
        gap: '24px',
        marginBottom: '16px',
        fontWeight: 'bold'
      }}>
        <div>Total Income:  ${totals.income.toFixed(2)}</div>
        <div>Total Expense: ${totals.expense.toFixed(2)}</div>
        <div>Net:            ${totals.net.toFixed(2)}</div>
      </div>

      <CRUDScreen
        endpoint="http://localhost:5000/api/transactions"
        fields={fields}
        columns={columns}
        idField="id"
        transformFetch={transformFetch}
        onFilteredData={handleFilteredData}
      />
    </div>
  );
}
