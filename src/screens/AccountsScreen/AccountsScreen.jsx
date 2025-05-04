// src/screens/AccountsScreen/AccountsScreen.jsx

import React, { useState, useEffect, useMemo } from 'react';
import SearchBox from '../../components/SearchBox/SearchBox';
import AdvancedSearch from '../../components/AdvancedSearch/AdvancedSearch';
import DataTable from '../../components/DataTable/DataTable';
import DataFormPopup from '../../components/DataFormPopup/DataFormPopup';
import ActionButton from '../../components/ActionButton/ActionButton';

function AccountsScreen() {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [newAccount, setNewAccount] = useState({
    type: '',
    bsb: '',
    accountno: '',
    provider: '',
    productname: '',
    balance: '',
    interestrate: '',
    emi: ''
  });
  const [editingAccount, setEditingAccount] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mode, setMode] = useState('add'); // 'add' or 'edit'

  // Fetch accounts
  useEffect(() => {
    fetch('http://localhost:5000/api/accounts')
      .then(res => res.json())
      .then(setAccounts)
      .catch(console.error);
  }, []);

  // Simple global search
  const simpleFiltered = useMemo(() => {
    if (!searchTerm) return accounts;
    const lower = searchTerm.toLowerCase();
    return accounts.filter(acc =>
      Object.values(acc).some(val =>
        String(val || '').toLowerCase().includes(lower)
      )
    );
  }, [accounts, searchTerm]);

  // Advanced filter (treat all as text)
  const filtered = useMemo(() => {
    if (!criteria.length) return simpleFiltered;
    return simpleFiltered.filter(acc =>
      criteria.every(({ field, operator, value }) => {
        if (!value) return true;
        const rec = String(acc[field] ?? '').toLowerCase();
        const q = value.toLowerCase();
        switch (operator) {
          case 'contains':   return rec.includes(q);
          case 'equals':     return rec === q;
          case 'startsWith': return rec.startsWith(q);
          case 'endsWith':   return rec.endsWith(q);
          default:           return true;
        }
      })
    );
  }, [simpleFiltered, criteria]);

  const fields = [
    { label: 'Type',         name: 'type',         type: 'text'   },
    { label: 'BSB',          name: 'bsb',          type: 'text'   },
    { label: 'Account No.',  name: 'accountno',    type: 'text'   },
    { label: 'Provider',     name: 'provider',     type: 'text'   },
    { label: 'Product Name', name: 'productname',  type: 'text'   },
    { label: 'Balance',      name: 'balance',      type: 'number' },
    { label: 'Interest %',   name: 'interestrate', type: 'number' },
    { label: 'EMI',          name: 'emi',          type: 'number' }
  ];

  // Save (add or update)
  const handleSave = () => {
    const payload = mode === 'add' ? newAccount : editingAccount;
    const url =
      mode === 'add'
        ? 'http://localhost:5000/api/accounts'
        : `http://localhost:5000/api/accounts/${editingAccount.id}`;
    const method = mode === 'add' ? 'POST' : 'PUT';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Save failed');
        return res.json();
      })
      .then(data => {
        setAccounts(lst =>
          mode === 'add'
            ? [...lst, data]
            : lst.map(a => (a.id === data.id ? data : a))
        );
        setShowPopup(false);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to save account. Please try again.');
      });
  };

  // Delete
  const handleDelete = id => {
    if (!window.confirm('Delete this account?')) return;
    fetch(`http://localhost:5000/api/accounts/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Delete failed');
        setAccounts(lst => lst.filter(a => a.id !== id));
      })
      .catch(err => {
        console.error(err);
        alert('Failed to delete account.');
      });
  };

  const columns = [
    { Header: 'Type',        accessor: 'type' },
    { Header: 'BSB',         accessor: 'bsb' },
    { Header: 'Account No.', accessor: 'accountno' },
    { Header: 'Provider',    accessor: 'provider' },
    { Header: 'Product',     accessor: 'productname' },
    { Header: 'Balance',     accessor: 'balance' },
    { Header: 'Interest %',  accessor: 'interestrate' },
    { Header: 'EMI',         accessor: 'emi' },
  ];

  return (
    <div className="main">
      <div className="button-container">
        <SearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search accounts..."
        />
        <button
          className="button button-secondary"
          onClick={() => setShowAdvanced(v => !v)}
        >
          {showAdvanced ? 'Hide Advanced' : 'Advanced Search'}
        </button>
        <ActionButton
          label="Add New Account"
          onClick={() => {
            setMode('add');
            setNewAccount({
              type: '',
              bsb: '',
              accountno: '',
              provider: '',
              productname: '',
              balance: '',
              interestrate: '',
              emi: ''
            });
            setShowPopup(true);
          }}
        />
      </div>

      {showAdvanced && (
        <AdvancedSearch
          fields={fields}
          onSearch={setCriteria}
          onReset={() => setCriteria([])}
        />
      )}

      <DataFormPopup
        isOpen={showPopup}
        onSave={handleSave}
        onCancel={() => setShowPopup(false)}
        title={mode === 'add' ? 'Add New Account' : 'Edit Account'}
        formData={mode === 'add' ? newAccount : editingAccount}
        setFormData={mode === 'add' ? setNewAccount : setEditingAccount}
        fields={fields.map(f => ({ ...f, placeholder: f.label }))}
      />

      <DataTable
        columns={columns}
        data={filtered}
        onEdit={row => {
          setMode('edit');
          setEditingAccount({ ...row });
          setShowPopup(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default AccountsScreen;
