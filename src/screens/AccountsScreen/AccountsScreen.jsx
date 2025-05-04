// src/screens/AccountsScreen/AccountsScreen.jsx

import React from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

const fields = [
  { label: 'Type',        name: 'type',         type: 'text'   },
  { label: 'BSB',         name: 'bsb',          type: 'text'   },
  { label: 'Account No.', name: 'accountno',    type: 'text'   },
  { label: 'Provider',    name: 'provider',     type: 'text'   },
  { label: 'Product',     name: 'productname',  type: 'text'   },
  { label: 'Balance',     name: 'balance',      type: 'number' },
  { label: 'Interest %',  name: 'interestrate', type: 'number' },
  { label: 'EMI',         name: 'emi',          type: 'number' }
];

export default function AccountsScreen() {
  return (
    <CRUDScreen
      endpoint="http://localhost:5000/api/accounts"
      fields={fields}
      idField="id"
    />
  );
}
