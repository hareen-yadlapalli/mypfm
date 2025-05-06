// src/screens/AccountsScreen/AccountsScreen.jsx

import React, { useState, useEffect, useMemo } from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

export default function AccountsScreen() {
  const [propertyOptions, setPropertyOptions] = useState([
    { label: 'None', value: 0 }
  ]);

  // Fetch properties for dropdown and label mapping
  useEffect(() => {
    fetch('http://localhost:5000/api/properties')
      .then(res => res.json())
      .then(data => {
        const opts = data.map(p => ({
          label: `${p.address}, ${p.suburb}`,
          value: p.id
        }));
        setPropertyOptions([{ label: 'None', value: 0 }, ...opts]);
      })
      .catch(console.error);
  }, []);

  const fields = useMemo(() => [
    { label: 'Property',    name: 'propertyid',   type: 'select', options: propertyOptions },
    { label: 'Type',        name: 'type',         type: 'select', options: ['Savings','Current','Loan','Credit Card'] },
    { label: 'Provider',    name: 'provider',     type: 'text' },
    { label: 'BSB',         name: 'bsb',          type: 'text' },
    { label: 'Account No.', name: 'accountno',    type: 'text' },
    { label: 'Product',     name: 'productname',  type: 'text' },
    { label: 'Balance',     name: 'balance',      type: 'number' },
    { label: 'Interest %',  name: 'interestrate', type: 'number' },
    { label: 'EMI',         name: 'emi',          type: 'number' }
  ], [propertyOptions]);

  // Build table columns including property label
  const columns = useMemo(() => [
    { Header: 'Property', accessor: 'propertyLabel', canSort: true },
    ...fields.slice(1).map(f => ({ Header: f.label, accessor: f.name, canSort: true }))
  ], [fields]);

  // transformFetch adds propertyLabel based on the latest propertyOptions
  const transformFetch = useMemo(() => data => data.map(item => {
    const option = propertyOptions.find(o => o.value === (item.propertyid ?? 0));
    return {
      ...item,
      propertyid: item.propertyid ?? 0,
      propertyLabel: option?.label ?? 'None'
    };
  }), [propertyOptions]);

  return (
    <CRUDScreen
      endpoint="http://localhost:5000/api/accounts"
      fields={fields}
      columns={columns}
      idField="id"
      transformFetch={transformFetch}
    />
  );
}
