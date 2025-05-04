// src/screens/CategoriesScreen/CategoriesScreen.jsx

import React from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

const fieldsCat = [
  { label: 'Category',    name: 'category',    type: 'text' },
  { label: 'Subcat1',     name: 'subcategory1',type: 'text' },
  { label: 'Subcat2',     name: 'subcategory2',type: 'text' },
  { label: 'Subcat3',     name: 'subcategory3',type: 'text' },
];

export default function CategoriesScreen() {
  return (
    <CRUDScreen
      endpoint="http://localhost:5000/api/categories"
      fields={fieldsCat}
      idField="id"
    />
  );
}