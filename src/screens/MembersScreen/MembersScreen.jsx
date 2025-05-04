// src/screens/MembersScreen/MembersScreen.jsx

import React, { useState, useEffect, useMemo } from 'react';
import SearchBox from '../../components/SearchBox/SearchBox';
import AdvancedSearch from '../../components/AdvancedSearch/AdvancedSearch';
import DataTable from '../../components/DataTable/DataTable';
import DataFormPopup from '../../components/DataFormPopup/DataFormPopup';
import ActionButton from '../../components/ActionButton/ActionButton';

function MembersScreen() {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', dob: '' });
  const [editingMember, setEditingMember] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mode, setMode] = useState('add'); // 'add' or 'edit'

  // Fetch members on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/members')
      .then((res) => res.json())
      .then(setMembers)
      .catch(console.error);
  }, []);

  // Simple search filter
  const simpleFiltered = useMemo(() => {
    if (!searchTerm) return members;
    const lower = searchTerm.toLowerCase();
    return members.filter((m) =>
      Object.values(m).some((v) =>
        String(v || '').toLowerCase().includes(lower)
      )
    );
  }, [members, searchTerm]);

  // Advanced filter on top
  const filtered = useMemo(() => {
    if (!criteria.length) return simpleFiltered;
    return simpleFiltered.filter((m) =>
      criteria.every(({ field, operator, value }) => {
        if (!value) return true;
        const rec = m[field];
        if (field === 'dob') {
          const rd = new Date(rec).setHours(0,0,0,0);
          const qd = new Date(value).setHours(0,0,0,0);
          if (operator === 'on') return rd === qd;
          if (operator === 'before') return rd < qd;
          if (operator === 'after') return rd > qd;
        } else {
          const lowerRec = String(rec || '').toLowerCase();
          const lowerQ = value.toLowerCase();
          if (operator === 'contains') return lowerRec.includes(lowerQ);
          if (operator === 'equals') return lowerRec === lowerQ;
          if (operator === 'startsWith') return lowerRec.startsWith(lowerQ);
          if (operator === 'endsWith') return lowerRec.endsWith(lowerQ);
        }
        return true;
      })
    );
  }, [simpleFiltered, criteria]);

  const fields = [
    { label: 'Name', name: 'name', type: 'text' },
    { label: 'Date of Birth', name: 'dob', type: 'date' },
  ];

  // Add / Edit submit with validation
  const handleSave = () => {
    const payload = mode === 'add' ? newMember : editingMember;

    // Validation
    if (!payload.name.trim()) {
      alert('Please enter a Name.');
      return;
    }

    const url =
      mode === 'add'
        ? 'http://localhost:5000/api/members'
        : `http://localhost:5000/api/members/${editingMember.id}`;
    const method = mode === 'add' ? 'POST' : 'PUT';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setMembers((ms) =>
          mode === 'add'
            ? [...ms, data]
            : ms.map((m) => (m.id === data.id ? data : m))
        );
        setShowPopup(false);
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to save. Please try again.');
      });
  };

  // Delete handler
  const handleDelete = (id) => {
    if (!window.confirm('Delete this member?')) return;
    fetch(`http://localhost:5000/api/members/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        setMembers((ms) => ms.filter((m) => m.id !== id));
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to delete. Please try again.');
      });
  };

  const columns = [
    { Header: 'Name', accessor: 'name' },
    { Header: 'Date of Birth', accessor: 'dob' },
  ];

  return (
    <div className="main">
      <div className="button-container">
        <SearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search members..."
        />
        <button
          className="button button-secondary"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          {showAdvanced ? 'Hide Advanced' : 'Advanced Search'}
        </button>
        <ActionButton
          label="Add New Member"
          onClick={() => {
            setMode('add');
            setNewMember({ name: '', dob: '' });
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
        title={mode === 'add' ? 'Add New Member' : 'Edit Member'}
        formData={mode === 'add' ? newMember : editingMember}
        setFormData={mode === 'add' ? setNewMember : setEditingMember}
        fields={fields.map((f) => ({ ...f, placeholder: f.label }))}
      />

      <DataTable
        columns={columns}
        data={filtered}
        onEdit={(row) => {
          setMode('edit');
          setEditingMember(row);
          setShowPopup(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default MembersScreen;
