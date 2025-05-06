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
  const [accountOptions, setAccountOptions]   = useState([{ label: 'None', value: 0 }]);
  const [totals, setTotals] = useState({ income: 0, expense: 0, net: 0 });

  // fetch Properties
  useEffect(() => {
    fetch('http://localhost:5000/api/properties')
      .then(r => r.json())
      .then(data =>
        setPropertyOptions([
          { label: 'None', value: 0 },
          ...data.map(p => ({ label: p.address, value: p.id }))
        ])
      )
      .catch(console.error);
  }, []);

  // fetch Accounts
  useEffect(() => {
    fetch('http://localhost:5000/api/accounts')
      .then(r => r.json())
      .then(data =>
        setAccountOptions([
          { label: 'None', value: 0 },
          ...data.map(a => ({
            label: `${a.provider} – ${a.accountno}`,
            value: a.id
          }))
        ])
      )
      .catch(console.error);
  }, []);

  const fields = useMemo(() => [
    { label: 'Bill ID',          name: 'billid',           type: 'number' },
    { label: 'Purchase ID',      name: 'purchaseid',       type: 'number' },
    { label: 'Name',             name: 'name',             type: 'text'   },
    {
      label: 'Direction',
      name: 'direction',
      type: 'select',
      options: ['Expense','Income']
    },
    { label: 'Status',           name: 'status',           type: 'text'   },
    { label: 'Category',         name: 'category',         type: 'text'   },
    { label: 'Subcat1',          name: 'subcategory1',     type: 'text'   },
    { label: 'Subcat2',          name: 'subcategory2',     type: 'text'   },
    { label: 'Subcat3',          name: 'subcategory3',     type: 'text'   },
    { label: 'Provider',         name: 'provider',         type: 'text'   },
    { label: 'Amount',           name: 'amount',           type: 'number' },
    { label: 'Transaction Date', name: 'transactiondate',  type: 'date'   },
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
  ], [accountOptions, propertyOptions]);

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
        <span style={{ color: row.original.direction === 'Expense' ? 'red' : 'green' }}>
          ${Number(value).toFixed(2)}
        </span>
      )
    },
    { Header: 'Category',  accessor: 'category',  canSort: true },
    { Header: 'Subcat1',   accessor: 'subcategory1' },
    { Header: 'Subcat2',   accessor: 'subcategory2' },
    // { Header: 'Subcat3',   accessor: 'subcategory3' }, // hidden by choice
    { Header: 'Provider',  accessor: 'provider',  canSort: true },
    {
      Header: 'Property',
      accessor: 'propertyLabel',
      canSort: true
    }
  ], []);

  // transformFetch both decorates each row *and* calculates
  // totals over the full dataset
  const transformFetch = useMemo(() => data => {
    const arr = data
      .map(item => {
        const acc  = accountOptions.find(o => o.value === (item.accountid ?? 0)) || {};
        const prop = propertyOptions.find(o => o.value === (item.propertyid ?? 0)) || {};
        return {
          ...item,
          accountLabel:  acc.label  || 'None',
          propertyLabel: prop.label || 'None'
        };
      })
      .sort((a, b) =>
        new Date(a.transactiondate) - new Date(b.transactiondate)
      );

    // compute totals over *all* fetched records
    let income = 0, expense = 0;
    arr.forEach(txn => {
      if (txn.direction === 'Income')  income  += Number(txn.amount);
      if (txn.direction === 'Expense') expense += Number(txn.amount);
    });
    setTotals({
      income:  income,
      expense: expense,
      net:      income - expense
    });

    return arr;
  }, [accountOptions, propertyOptions]);

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
        initialSortField="transactiondate"
        initialSortOrder="asc"
      />
    </div>
  );
}
