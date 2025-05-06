// src/screens/AccountsScreen/AccountsScreen.jsx

import React, { useState, useEffect, useMemo } from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

export default function AccountsScreen() {
  const [propertyOptions, setPropertyOptions] = useState([{ label: 'None', value: 0 }]);

  // 1) Fetch properties once
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

  // 2) Build fields, injecting propertyOptions into the "Property" select
  const fields = useMemo(
    () => [
      {
        label: 'Property',
        name: 'propertyid',
        type: 'select',
        options: propertyOptions,
      },
      {
        label: 'Type',
        name: 'type',
        type: 'select',
        options: ['Savings', 'Current', 'Loan', 'Credit Card'],
      },
      { label: 'Provider', name: 'provider', type: 'text' },
      { label: 'BSB', name: 'bsb', type: 'text' },
      { label: 'Account No.', name: 'accountno', type: 'text' },
      { label: 'Product', name: 'productname', type: 'text' },
      { label: 'Balance', name: 'balance', type: 'number' },
      { label: 'Interest %', name: 'interestrate', type: 'number' },
      { label: 'EMI', name: 'emi', type: 'number' },
    ],
    [propertyOptions]
  );

  // 3) Columns: first column shows our computed propertyLabel
  const columns = useMemo(
    () => [
      { Header: 'Property', accessor: 'propertyLabel', canSort: true },
      ...fields
        .slice(1)
        .map(f => ({ Header: f.label, accessor: f.name, canSort: true })),
    ],
    [fields]
  );

  // 4) transformFetch: annotate each item with propertyLabel
  const transformFetch = useMemo(
    () => data =>
      data.map(item => {
        const opt =
          propertyOptions.find(o => o.value === (item.propertyid ?? 0)) || {};
        return {
          ...item,
          propertyid: item.propertyid ?? 0,
          propertyLabel: opt.label || 'None',
        };
      }),
    [propertyOptions]
  );

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
