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
    { Header: 'Subcat3',   accessor: 'subcategory3' },
    { Header: 'Provider',  accessor: 'provider',  canSort: true },
    {
      Header: 'Account',
      accessor: 'accountLabel',
      canSort: true
    },
    {
      Header: 'Property',
      accessor: 'propertyLabel',
      canSort: true
    }
  ], []);

  const transformFetch = useMemo(() => data => {
    return data
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
  }, [accountOptions, propertyOptions]);

  return (
    <CRUDScreen
      endpoint="http://localhost:5000/api/transactions"
      fields={fields}
      columns={columns}
      idField="id"
      transformFetch={transformFetch}
      initialSortField="transactiondate"
      initialSortOrder="asc"
    />
  );
}
