import React from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

const fieldsPurchases = [
  { label: 'Transaction ID', name: 'transactionid', type: 'number' },
  { label: 'Member ID',      name: 'memberid',      type: 'number' },
  { label: 'Provider',       name: 'provider',      type: 'text'   },
  { label: 'Address',        name: 'address',       type: 'text'   },
  { label: 'Category',       name: 'category',      type: 'text'   },
  { label: 'Subcat1',        name: 'subcategory1',  type: 'text'   },
  { label: 'Subcat2',        name: 'subcategory2',  type: 'text'   },
  { label: 'Subcat3',        name: 'subcategory3',  type: 'text'   },
  { label: 'Account ID',     name: 'accountid',     type: 'number' },
  { label: 'Purchase Date',  name: 'purchasedate',  type: 'date'   },
  { label: 'Amount',         name: 'amount',        type: 'number' },
];

export default function PurchasesScreen() {
  return (
    <CRUDScreen
      endpoint="http://localhost:5000/api/purchases"
      fields={fieldsPurchases}
      idField="id"
      transformFetch={data => data.map(item => ({
        ...item,
        purchasedate: item.purchasedate?.split('T')[0] || ''
      }))}
    />
  );
}
