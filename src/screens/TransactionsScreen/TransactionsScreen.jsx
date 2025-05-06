// src/screens/TransactionsScreen/TransactionsScreen.jsx

import React, { useState, useEffect, useMemo } from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

export default function TransactionsScreen() {
  const [propertyOptions, setPropertyOptions] = useState([{ label: 'None', value: 0 }]);
  const [accountOptions,  setAccountOptions]  = useState([{ label: 'None', value: 0 }]);

  // Fetch properties
  useEffect(() => {
    fetch('http://localhost:5000/api/properties')
      .then(r => r.json())
      .then(data => setPropertyOptions([
        { label: 'None', value: 0 },
        ...data.map(p => ({
          label: `${p.address}, ${p.suburb}`,
          value: p.id
        }))
      ]))
      .catch(console.error);
  }, []);

  // Fetch accounts
  useEffect(() => {
    fetch('http://localhost:5000/api/accounts')
      .then(r => r.json())
      .then(data => setAccountOptions([
        { label: 'None', value: 0 },
        ...data.map(a => ({
          label: `${a.provider} – ${a.accountno}`,
          value: a.id
        }))
      ]))
      .catch(console.error);
  }, []);

  // Build form fields
  const fields = useMemo(() => [
    {
      label: 'Property',
      name:  'propertyid',
      type:  'select',
      options: propertyOptions
    },
    {
      label: 'Account',
      name:  'accountid',
      type:  'select',
      options: accountOptions
    },
    { label: 'Bill ID',       name: 'billid',       type: 'number' },
    { label: 'Purchase ID',   name: 'purchaseid',   type: 'number' },
    {
      label: 'Status',
      name:  'status',
      type:  'select',
      options: ['Paid', 'Scheduled']
    },
    {
      label: 'Direction',
      name:  'direction',
      type:  'select',
      options: ['Expense', 'Income']
    },
    { label: 'Name',         name: 'name',         type: 'text'   },
    { label: 'Category',     name: 'category',     type: 'text'   },
    { label: 'Subcat1',      name: 'subcategory1', type: 'text'   },
    { label: 'Subcat2',      name: 'subcategory2', type: 'text'   },
    { label: 'Subcat3',      name: 'subcategory3', type: 'text'   },
    { label: 'Provider',     name: 'provider',     type: 'text'   },
    { label: 'Amount',       name: 'amount',       type: 'number' },
    { label: 'Date',         name: 'transactiondate', type: 'date' },
  ], [propertyOptions, accountOptions]);

  // Columns to display in table
  const columns = useMemo(() => [
    { Header: 'Property',        accessor: 'propertyLabel',    canSort: true },
    { Header: 'Account',         accessor: 'accountLabel',     canSort: true },
    { Header: 'Bill ID',         accessor: 'billid',           canSort: true },
    { Header: 'Purchase ID',     accessor: 'purchaseid',       canSort: true },
    { Header: 'Status',          accessor: 'status',           canSort: true },
    { Header: 'Direction',       accessor: 'direction',        canSort: true },
    { Header: 'Name',            accessor: 'name',             canSort: true },
    { Header: 'Category',        accessor: 'category',         canSort: true },
    { Header: 'Subcat1',         accessor: 'subcategory1' },
    { Header: 'Subcat2',         accessor: 'subcategory2' },
    { Header: 'Subcat3',         accessor: 'subcategory3' },
    { Header: 'Provider',        accessor: 'provider' },
    { Header: 'Amount',          accessor: 'amount',           canSort: true },
    { Header: 'Date',            accessor: 'transactiondate',  canSort: true },
  ], []);

  // Annotate each record with the label versions
  const transformFetch = useMemo(() => data => data.map(item => {
    const prop = propertyOptions.find(o => o.value === (item.propertyid ?? 0)) || {};
    const acc  = accountOptions.find(o => o.value === (item.accountid  ?? 0)) || {};
    return {
      ...item,
      propertyid:       item.propertyid ?? 0,
      accountid:        item.accountid  ?? 0,
      propertyLabel:    prop.label  || 'None',
      accountLabel:     acc.label   || 'None'
    };
  }), [propertyOptions, accountOptions]);

  return (
    <CRUDScreen
      endpoint="http://localhost:5000/api/transactions"
      fields={fields}
      columns={columns}
      idField="id"
      transformFetch={transformFetch}
    />
  );
}
