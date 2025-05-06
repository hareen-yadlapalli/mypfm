// src/screens/AccountsScreen/AccountsScreen.jsx

import React, { useState, useEffect, useMemo } from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

export default function AccountsScreen() {
  // raw properties + popup options
  const [propertiesList, setPropertiesList] = useState([]);
  const [propertyOptions, setPropertyOptions] = useState([{ label: 'None', value: 0 }]);

  useEffect(() => {
    fetch('http://localhost:5000/api/properties')
      .then(r => r.json())
      .then(data => {
        setPropertiesList(data);
        const opts = data.map(p => ({
          label: `${p.address}, ${p.suburb}`,
          value: p.id
        }));
        setPropertyOptions([{ label: 'None', value: 0 }, ...opts]);
      })
      .catch(console.error);
  }, []);

  // build fields
  const fields = useMemo(() => [
    { label: 'Property',   name: 'propertyid',   type: 'select', options: propertyOptions },
    { label: 'Type',       name: 'type',         type: 'select', options: [
        { label: 'Savings',     value: 'Savings'     },
        { label: 'Current',     value: 'Current'     },
        { label: 'Loan',        value: 'Loan'        },
        { label: 'Credit Card', value: 'Credit Card' }
      ]
    },
    { label: 'Provider',   name: 'provider',     type: 'text'   },
    { label: 'BSB',        name: 'bsb',          type: 'text'   },
    { label: 'Account No.',name: 'accountno',    type: 'text'   },
    { label: 'Product',    name: 'productname',  type: 'text'   },
    { label: 'Balance',    name: 'balance',      type: 'number' },
    { label: 'Interest %', name: 'interestrate', type: 'number' },
    { label: 'EMI',        name: 'emi',          type: 'number' }
  ], [propertyOptions]);

  // table columns: only address for property
  const columns = useMemo(() => [
    { Header: 'Property', accessor: 'propertyLabel', canSort: true },
    ...fields.slice(1).map(f => ({
      Header: f.label,
      accessor: f.name,
      canSort: true
    }))
  ], [fields]);

  // transform fetch: inject address only
  const transformFetch = useMemo(() => data =>
    data.map(item => {
      const prop = propertiesList.find(p => p.id === (item.propertyid ?? 0));
      return {
        ...item,
        propertyid:    item.propertyid ?? 0,
        propertyLabel: prop ? prop.address : 'None'
      };
    })
  , [propertiesList]);

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
