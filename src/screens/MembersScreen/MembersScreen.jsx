// src/screens/MembersScreen/MembersScreen.jsx

import React, { useState, useEffect, useMemo } from 'react';
import SearchBox from '../../components/SearchBox/SearchBox';
import AdvancedSearch from '../../components/AdvancedSearch/AdvancedSearch';
import DataTable from '../../components/DataTable/DataTable';
import DataFormPopup from '../../components/DataFormPopup/DataFormPopup';
import ActionButton from '../../components/ActionButton/ActionButton';

const MembersScreen = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', dob: '' });
  const [editingMember, setEditingMember] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mode, setMode] = useState('add'); // 'add' or 'edit'

  // Fetch members on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/members')
      .then(res => res.json())
      .then(setMembers)
      .catch(console.error);
  }, []);

  // Define searchable fields for advanced search
  const fields = [
    { label: 'Name', name: 'name', type: 'text' },
    { label: 'Date of Birth', name: 'dob', type: 'date' },
  ];

  // 1) Simple search across all fields
  const simpleFiltered = useMemo(() => {
    if (!searchTerm) return members;
    const lower = searchTerm.toLowerCase();
    return members.filter(m =>
      Object.values(m).some(val =>
        String(val || '').toLowerCase().includes(lower)
      )
    );
  }, [members, searchTerm]);

  // 2) Apply advanced criteria to the simpleFiltered set
  const filteredMembers = useMemo(() => {
    if (!criteria.length) return simpleFiltered;
    return simpleFiltered.filter(member =>
      criteria.every(cond => {
        const { field, operator, value } = cond;
        const recordValue = member[field] || '';
        if (!value) return true;

        if (field === 'dob') {
          const rd = new Date(recordValue).setHours(0,0,0,0);
          const qd = new Date(value).setHours(0,0,0,0);
          if (operator === 'on')      return rd === qd;
          if (operator === 'before')  return rd < qd;
          if (operator === 'after')   return rd > qd;
        } else {
          const rec = String(recordValue).toLowerCase();
          const q   = value.toLowerCase();
          if (operator === 'contains')    return rec.includes(q);
          if (operator === 'equals')      return rec === q;
          if (operator === 'startsWith')  return rec.startsWith(q);
          if (operator === 'endsWith')    return rec.endsWith(q);
        }
        return true;
      })
    );
  }, [simpleFiltered, criteria]);

  // Add / Edit save handler
  const handleSave = () => {
    const payload = mode === 'add' ? newMember : editingMember;
    if (!payload.name.trim()) {
      alert('Name is required.');
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
      .then(r => r.json())
      .then(data => {
        setMembers(ms =>
          mode === 'add'
            ? [...ms, data]
            : ms.map(m => (m.id === data.id ? data : m))
        );
        setShowPopup(false);
      })
      .catch(() => alert('Failed to save member'));
  };

  // Delete handler
  const handleDelete = id => {
    if (!window.confirm('Delete this member?')) return;
    fetch(`http://localhost:5000/api/members/${id}`, { method: 'DELETE' })
      .then(() => setMembers(ms => ms.filter(m => m.id !== id)))
      .catch(console.error);
  };

  // Table columns definition
  const columns = [
    { Header: 'Name', accessor: 'name' },
    { Header: 'Date of Birth', accessor: 'dob' },
  ];

  return (
    <div className="main">
      {/* Simple Search + Add Button */}
      <div className="button-container" style={{ alignItems: 'center' }}>
        <SearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search members..."
        />
        <ActionButton
          label="Add New Member"
          className="button-primary"
          onClick={() => {
            setMode('add');
            setNewMember({ name: '', dob: '' });
            setShowPopup(true);
          }}
        />
      </div>

      {/* Advanced Search */}
      <AdvancedSearch
        fields={fields}
        onSearch={setCriteria}
        onReset={() => setCriteria([])}
      />

      {/* Add/Edit Popup */}
      <DataFormPopup
        isOpen={showPopup}
        onSave={handleSave}
        onCancel={() => setShowPopup(false)}
        title={mode === 'add' ? 'Add New Member' : 'Edit Member'}
        formData={mode === 'add' ? newMember : editingMember}
        setFormData={mode === 'add' ? setNewMember : setEditingMember}
        fields={[
          { label: 'Name', name: 'name', type: 'text', placeholder: 'Enter name' },
          { label: 'Date of Birth', name: 'dob', type: 'date', placeholder: '' },
        ]}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredMembers}
        onEdit={member => {
          setMode('edit');
          setEditingMember(member);
          setShowPopup(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default MembersScreen;
