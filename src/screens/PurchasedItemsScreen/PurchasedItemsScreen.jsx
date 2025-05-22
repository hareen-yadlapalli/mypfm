// src/screens/PurchasedItemsScreen/PurchasedItemsScreen.jsx

import React from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

const fieldsItems = [
  { label: 'Purchase ID',  name: 'purchaseid', type: 'number' },
  { label: 'Item Name', name: 'itemname',    type: 'text'   },
  { label: 'Item Make', name: 'itemmake',    type: 'text'   },
  { label: 'Volume Units', name: 'volunits',    type: 'text'   },
  { label: 'Quantity',     name: 'qty',          type: 'number' },
  { label: 'Price',        name: 'price',        type: 'number' },
  { label: 'Cost/Unit',    name: 'costperunit',  type: 'number' },
];

export default function PurchasedItemsScreen() {
  return (
    <CRUDScreen
      endpoint="http://localhost:5000/api/purchaseditems"
      fields={fieldsItems}
      idField="id"
    />
  );
}