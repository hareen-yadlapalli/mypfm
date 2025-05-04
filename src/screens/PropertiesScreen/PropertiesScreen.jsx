// src/screens/PropertiesScreen/PropertiesScreen.jsx

import React from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

const fields = [
  { label: 'Address', name: 'address', type: 'text' },
  { label: 'Suburb',  name: 'suburb',  type: 'text' },
  { label: 'Purpose', name: 'purpose', type: 'select', options: ['Residential', 'Investment'] },
];

export default function PropertiesScreen() {
  return (
    <CRUDScreen
      endpoint="http://localhost:5000/api/properties"
      fields={fields}
      idField="id"
    />
  );
}
