// src/screens/TransactionsScreen/TransactionsScreen.jsx

import React from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

const fields = [
  { label: 'Bill ID',            name: 'billid',          type: 'number' },
  { label: 'Purchase ID',        name: 'purchaseid',      type: 'number' },
  { label: 'Name',               name: 'name',      type: 'number' },
  { label: 'Direction',               name: 'direction',      type: 'number' },

  { label: 'Status',             name: 'status',      type: 'number' },

  { label: 'Category',           name: 'category',        type: 'text'   },
  { label: 'Subcategory 1',      name: 'subcategory1',    type: 'text'   },
  { label: 'Subcategory 2',      name: 'subcategory2',    type: 'text'   },
  { label: 'Subcategory 3',      name: 'subcategory3',    type: 'text'   },
  { label: 'Provider',           name: 'provider',        type: 'text'   },
  { label: 'Amount',             name: 'amount',          type: 'number' },
  { label: 'Transaction Date',   name: 'transactiondate', type: 'date'   },
  { label: 'Account ID',         name: 'accountid',       type: 'number' },
  { label: 'Property ID',        name: 'propertyid',      type: 'number' },
];

export default function TransactionsScreen() {
  return (
    <CRUDScreen
      endpoint="http://localhost:5000/api/transactions"
      fields={fields}
      idField="id"
      transformFetch={data =>
        // format dates to YYYY-MM-DD for input compatibility
        data.map(item => ({
          ...item,
          transactiondate: item.transactiondate?.split('T')[0] || ''
        }))
      }
    />
  );
}
