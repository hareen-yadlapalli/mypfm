// src/screens/BillsScreen/BillsScreen.jsx

import React from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

const fields = [
  { label: 'Name',         name: 'name',        type: 'text'  },
  { label: 'Category',     name: 'category',    type: 'text'  },
  { label: 'Subcategory1', name: 'subcategory1',type: 'text'  },
  { label: 'Subcategory2', name: 'subcategory2',type: 'text'  },
  { label: 'Subcategory3', name: 'subcategory3',type: 'text'  },
  { label: 'Provider',     name: 'provider',    type: 'text'  },
  { label: 'Frequency',    name: 'frequency',   type: 'text'  },
  { label: 'Amount',       name: 'amount',      type: 'number'},
  { label: 'Start Date',   name: 'startdate',   type: 'date'  },
  { label: 'End Date',     name: 'enddate',     type: 'date'  },
  { label: 'Account ID',   name: 'accountid',   type: 'number'},
  { label: 'Property ID',  name: 'propertyid',  type: 'number'},
];

export default function BillsScreen() {
  return (
    <CRUDScreen
      endpoint="http://localhost:5000/api/bills"
      fields={fields}
      idField="id"
      transformFetch={data => data.map(item => ({
        ...item,
        startdate: item.startdate?.split('T')[0] || '',
        enddate:   item.enddate?.split('T')[0]   || ''
      }))}
    />
  );
}
