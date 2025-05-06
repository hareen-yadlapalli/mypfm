// src/screens/BillsScreen/IncomesScreen.jsx

import React, { useState, useEffect, useMemo } from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

export default function IncomesScreen() {
  const [propertyOptions, setPropertyOptions] = useState([{ label: 'None', value: 0 }]);
  const [accountOptions, setAccountOptions] = useState([{ label: 'None', value: 0 }]);

  // Fetch properties
  useEffect(() => {
    fetch('http://localhost:5000/api/properties')
      .then(r => r.json())
      .then(data =>
        setPropertyOptions([
          { label: 'None', value: 0 },
          ...data.map(p => ({
            label: `${p.address}, ${p.suburb}`,
            value: p.id,
          })),
        ])
      )
      .catch(console.error);
  }, []);

  // Fetch accounts
  useEffect(() => {
    fetch('http://localhost:5000/api/accounts')
      .then(r => r.json())
      .then(data =>
        setAccountOptions([
          { label: 'None', value: 0 },
          ...data.map(a => ({
            label: `${a.provider} – ${a.accountno}`,
            value: a.id,
          })),
        ])
      )
      .catch(console.error);
  }, []);

  // Build the form fields
  const fields = useMemo(
    () => [
      {
        label: 'Property',
        name: 'propertyid',
        type: 'select',
        options: propertyOptions,
      },
      {
        label: 'Account',
        name: 'accountid',
        type: 'select',
        options: accountOptions,
      },
      { label: 'Name', name: 'name', type: 'text' },
      { label: 'Category', name: 'category', type: 'text' },
      { label: 'Subcat1', name: 'subcategory1', type: 'text' },
      { label: 'Subcat2', name: 'subcategory2', type: 'text' },
      { label: 'Subcat3', name: 'subcategory3', type: 'text' },
      {
        label: 'Frequency',
        name: 'frequency',
        type: 'select',
        options: ['Weekly', 'Fortnightly', 'Monthly', 'Yearly'],
      },
      { label: 'Amount', name: 'amount', type: 'number' },
      { label: 'Start Date', name: 'startdate', type: 'date' },
      { label: 'End Date', name: 'enddate', type: 'date' },
    ],
    [propertyOptions, accountOptions]
  );

  // Columns: show the _label_ versions in the table
  const columns = useMemo(
    () => [
      { Header: 'Property', accessor: 'propertyLabel', canSort: true },
      { Header: 'Account', accessor: 'accountLabel', canSort: true },
      { Header: 'Name', accessor: 'name', canSort: true },
      { Header: 'Category', accessor: 'category', canSort: true },
      { Header: 'Subcat1', accessor: 'subcategory1' },
      { Header: 'Subcat2', accessor: 'subcategory2' },
      { Header: 'Subcat3', accessor: 'subcategory3' },
      { Header: 'Freq', accessor: 'frequency' },
      { Header: 'Amount', accessor: 'amount' },
      { Header: 'Start', accessor: 'startdate' },
      { Header: 'End', accessor: 'enddate' },
    ],
    []
  );

  // Annotate each row with propertyLabel & accountLabel
  const transformFetch = useMemo(
    () => data =>
      data.map(item => {
        const propOpt =
          propertyOptions.find(o => o.value === (item.propertyid ?? 0)) || {};
        const accOpt =
          accountOptions.find(o => o.value === (item.accountid ?? 0)) || {};
        return {
          ...item,
          propertyid: item.propertyid ?? 0,
          accountid: item.accountid ?? 0,
          propertyLabel: propOpt.label || 'None',
          accountLabel: accOpt.label || 'None',
        };
      }),
    [propertyOptions, accountOptions]
  );

  return (
    <CRUDScreen
      endpoint="http://localhost:5000/api/incomes"
      fields={fields}
      columns={columns}
      idField="id"
      transformFetch={transformFetch}
    />
  );
}
