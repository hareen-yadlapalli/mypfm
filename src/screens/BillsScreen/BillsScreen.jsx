// src/screens/BillsScreen/BillsScreen.jsx

import React, { useState, useEffect, useMemo } from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

export default function BillsScreen() {
  const [propsOpts, setPropsOpts] = useState([{ label: 'None', value: 0 }]);
  const [acctOpts,  setAcctOpts]  = useState([{ label: 'None', value: 0 }]);
  const [catRows,   setCatRows]   = useState([]); // full category rows

  // 1) properties
  useEffect(() => {
    fetch('http://localhost:5000/api/properties')
      .then(r => r.json())
      .then(data =>
        setPropsOpts([
          { label: 'None', value: 0 },
          ...data.map(p => ({
            label: `${p.address}, ${p.suburb}`,
            value: p.id,
          })),
        ])
      )
      .catch(console.error);
  }, []);

  // 2) accounts
  useEffect(() => {
    fetch('http://localhost:5000/api/accounts')
      .then(r => r.json())
      .then(data =>
        setAcctOpts([
          { label: 'None', value: 0 },
          ...data.map(a => ({
            label: `${a.provider} – ${a.accountno}`,
            value: a.id,
          })),
        ])
      )
      .catch(console.error);
  }, []);

  // 3) categories (only direction='Expense')
  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(r => r.json())
      .then(data =>
        setCatRows(data.filter(c => c.direction === 'Expense'))
      )
      .catch(console.error);
  }, []);

  // build form fields, using dynamic functions for subcats
  const fields = useMemo(() => {
    // top‐level category options
    const catOpts = Array.from(
      new Set(catRows.map(r => r.category))
    ).map(c => ({ label: c, value: c }));

    return [
      { label: 'Property', name: 'propertyid', type: 'select', options: propsOpts },
      { label: 'Account',  name: 'accountid',  type: 'select', options: acctOpts },
      { label: 'Name',     name: 'name',       type: 'text' },
      {
        label: 'Category',
        name: 'category',
        type: 'select',
        options: catOpts,
      },
      {
        label: 'Subcat1',
        name: 'subcategory1',
        type: 'select',
        options: formData =>
          Array.from(
            new Set(
              catRows
                .filter(r => r.category === formData.category)
                .map(r => r.subcategory1)
            )
          )
            .filter(v => v)
            .map(v => ({ label: v, value: v })),
      },
      {
        label: 'Subcat2',
        name: 'subcategory2',
        type: 'select',
        options: formData =>
          Array.from(
            new Set(
              catRows
                .filter(
                  r =>
                    r.category === formData.category &&
                    r.subcategory1 === formData.subcategory1
                )
                .map(r => r.subcategory2)
            )
          )
            .filter(v => v)
            .map(v => ({ label: v, value: v })),
      },
      {
        label: 'Subcat3',
        name: 'subcategory3',
        type: 'select',
        options: formData =>
          Array.from(
            new Set(
              catRows
                .filter(
                  r =>
                    r.category === formData.category &&
                    r.subcategory1 === formData.subcategory1 &&
                    r.subcategory2 === formData.subcategory2
                )
                .map(r => r.subcategory3)
            )
          )
            .filter(v => v)
            .map(v => ({ label: v, value: v })),
      },
      {
        label: 'Frequency',
        name: 'frequency',
        type: 'select',
        options: ['Weekly', 'Fortnightly', 'Monthly', 'Yearly'],
      },
      { label: 'Amount',     name: 'amount',    type: 'number' },
      { label: 'Start Date', name: 'startdate', type: 'date' },
      { label: 'End Date',   name: 'enddate',   type: 'date' },
    ];
  }, [propsOpts, acctOpts, catRows]);

  // table columns
  const columns = useMemo(
    () => [
      { Header: 'Property',   accessor: 'propertyLabel',  canSort: true },
      { Header: 'Account',    accessor: 'accountLabel',   canSort: true },
      { Header: 'Name',       accessor: 'name',           canSort: true },
      { Header: 'Category',   accessor: 'category',       canSort: true },
      { Header: 'Subcat1',    accessor: 'subcategory1' },
      { Header: 'Subcat2',    accessor: 'subcategory2' },
      { Header: 'Subcat3',    accessor: 'subcategory3' },
      { Header: 'Frequency',  accessor: 'frequency' },
      { Header: 'Amount',     accessor: 'amount',         canSort: true },
      { Header: 'Start',      accessor: 'startdate',      canSort: true },
      { Header: 'End',        accessor: 'enddate',        canSort: true },
    ],
    []
  );

  // annotate each row
  const transformFetch = useMemo(
    () => data =>
      data.map(item => {
        const p = propsOpts.find(o => o.value === (item.propertyid ?? 0)) || {};
        const a = acctOpts.find(o => o.value === (item.accountid  ?? 0)) || {};
        return {
          ...item,
          propertyLabel: p.label || 'None',
          accountLabel:  a.label || 'None',
        };
      }),
    [propsOpts, acctOpts]
  );

  return (
    <CRUDScreen
      endpoint="http://localhost:5000/api/bills"
      fields={fields}
      columns={columns}
      idField="id"
      transformFetch={transformFetch}
    />
  );
}
