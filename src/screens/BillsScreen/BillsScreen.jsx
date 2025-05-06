// src/screens/BillsScreen/BillsScreen.jsx

import React, { useState, useEffect, useMemo } from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

export default function BillsScreen() {
  // raw property list + popup options
  const [propertiesList, setPropertiesList] = useState([]);
  const [propertyOptions, setPropertyOptions] = useState([{ label: 'None', value: 0 }]);

  // raw account list + popup options
  const [accountOptions, setAccountOptions] = useState([{ label: 'None', value: 0 }]);

  // expense‐direction categories for cascading subcats
  const [allCats, setAllCats] = useState([]);

  useEffect(() => {
    // Properties
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

    // Accounts
    fetch('http://localhost:5000/api/accounts')
      .then(r => r.json())
      .then(data => {
        const opts = data.map(a => ({
          label: `${a.provider} – ${a.accountno}`,
          value: a.id
        }));
        setAccountOptions([{ label: 'None', value: 0 }, ...opts]);
      })
      .catch(console.error);

    // Categories (only expenses)
    fetch('http://localhost:5000/api/categories')
      .then(r => r.json())
      .then(data => setAllCats(data.filter(c => c.direction === 'Expense')))
      .catch(console.error);
  }, []);

  const uniq = arr => Array.from(new Set(arr.filter(Boolean)));

  // Build fields (cascading subcats for Category)
  const fields = useMemo(() => [
    { label: 'Property',   name: 'propertyid',   type: 'select', options: propertyOptions },
    { label: 'Account',    name: 'accountid',    type: 'select', options: accountOptions },
    { label: 'Name',       name: 'name',         type: 'text' },
    { label: 'Category',   name: 'category',     type: 'select',
      options: uniq(allCats.map(c => c.category)).map(v => ({ label: v, value: v }))
    },
    { label: 'Subcat 1',   name: 'subcategory1', type: 'select',
      options: fd => uniq(
        allCats.filter(c => c.category === fd.category).map(c => c.subcategory1)
      ).map(v => ({ label: v, value: v }))
    },
    { label: 'Subcat 2',   name: 'subcategory2', type: 'select',
      options: fd => uniq(
        allCats
          .filter(c => c.category === fd.category && c.subcategory1 === fd.subcategory1)
          .map(c => c.subcategory2)
      ).map(v => ({ label: v, value: v }))
    },
    { label: 'Subcat 3',   name: 'subcategory3', type: 'select',
      options: fd => uniq(
        allCats
          .filter(c =>
            c.category === fd.category &&
            c.subcategory1 === fd.subcategory1 &&
            c.subcategory2 === fd.subcategory2
          )
          .map(c => c.subcategory3)
      ).map(v => ({ label: v, value: v }))
    },
    { label: 'Provider',   name: 'provider',     type: 'text' },
    { label: 'Frequency',  name: 'frequency',    type: 'select', options: [
        { label: 'Weekly',      value: 'Weekly'      },
        { label: 'Fortnightly', value: 'Fortnightly' },
        { label: 'Monthly',     value: 'Monthly'     },
        { label: 'Yearly',      value: 'Yearly'      },
      ]
    },
    { label: 'Amount',     name: 'amount',       type: 'number' },
    { label: 'Start Date', name: 'startdate',    type: 'date'   },
    { label: 'End Date',   name: 'enddate',      type: 'date'   },
  ], [propertyOptions, accountOptions, allCats]);

  // Columns show only address for property, full provider–no for account
  const columns = useMemo(() => [
    { Header: 'Property',   accessor: 'propertyLabel', canSort: true },
    { Header: 'Account',    accessor: 'accountLabel',  canSort: true },
    { Header: 'Name',       accessor: 'name' },
    { Header: 'Category',   accessor: 'category' },
    { Header: 'Subcat 1',   accessor: 'subcategory1' },
    { Header: 'Subcat 2',   accessor: 'subcategory2' },
    { Header: 'Subcat 3',   accessor: 'subcategory3' },
    { Header: 'Provider',   accessor: 'provider' },
    { Header: 'Frequency',  accessor: 'frequency' },
    { Header: 'Amount',     accessor: 'amount' },
    { Header: 'Start',      accessor: 'startdate' },
    { Header: 'End',        accessor: 'enddate' },
  ], []);

  // inject only the raw address into propertyLabel
  const transformFetch = useMemo(() => data =>
    data.map(item => {
      const prop = propertiesList.find(p => p.id === (item.propertyid ?? 0));
      const acc  = accountOptions.find(a => a.value === (item.accountid ?? 0));
      return {
        ...item,
        propertyid:    item.propertyid ?? 0,
        accountid:     item.accountid  ?? 0,
        propertyLabel: prop ? prop.address        : 'None',
        accountLabel:  acc  ? acc.label          : 'None',
      };
    })
  , [propertiesList, accountOptions]);

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
