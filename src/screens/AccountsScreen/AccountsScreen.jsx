import React, { useState, useEffect } from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

export default function AccountsScreen() {
  const [propertyOptions, setPropertyOptions] = useState([
    { label: 'None', value: 0 }
  ]);
  
  // Fetch properties for dropdown
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

  const fields = [
    { label: 'Property', name: 'propertyid', type: 'select', options: propertyOptions },
    { label: 'Type',     name: 'type',        type: 'select', options: ['Savings','Current','Loan','Credit Card'] },
    { label: 'Provider', name: 'provider',    type: 'text' },
    { label: 'BSB',      name: 'bsb',         type: 'text' },
    { label: 'Account No.', name: 'accountno', type: 'text' },
    { label: 'Product',  name: 'productname', type: 'text' },
    { label: 'Balance',  name: 'balance',     type: 'number' },
    { label: 'Interest %', name: 'interestrate', type: 'number' },
    { label: 'EMI',      name: 'emi',         type: 'number' }
  ];

  return (
    <CRUDScreen
      endpoint="http://localhost:5000/api/accounts"
      fields={fields}
      idField="id"
      transformFetch={data =>
        data.map(item => ({
          ...item,
          propertyid: item.propertyid || 0
        }))
      }
    />
  );
}
