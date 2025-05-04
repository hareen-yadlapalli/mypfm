// src/screens/MembersScreen.jsx
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable/DataTable';
import DataFormPopup from '../../components/DataFormPopup/DataFormPopup';
import ActionButton from '../../components/ActionButton/ActionButton';

function MembersScreen() {
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', dob: '' });
  const [editingMember, setEditingMember] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mode, setMode] = useState('add'); // 'add' or 'edit'

  // Fetch members on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/members')
      .then((r) => r.json())
      .then(setMembers)
      .catch(console.error);
  }, []);

  // Unified save handler for both add and edit
  const handleSave = () => {
    if (mode === 'add') {
      if (!newMember.name || !newMember.dob) {
        return alert('Please fill out both fields.');
      }
      fetch('http://localhost:5000/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      })
        .then((r) => r.json())
        .then((data) => {
          setMembers((m) => [...m, data]);
          setShowPopup(false);
        })
        .catch(() => alert('Failed to add member'));
    } else {
      fetch(`http://localhost:5000/api/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMember),
      })
        .then((r) => r.json())
        .then((data) => {
          setMembers((m) => m.map((x) => (x.id === data.id ? data : x)));
          setShowPopup(false);
        })
        .catch(() => alert('Failed to update member'));
    }
  };

  // Delete handler
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    fetch(`http://localhost:5000/api/members/${id}`, { method: 'DELETE' })
      .then(() => setMembers((m) => m.filter((x) => x.id !== id)))
      .catch(console.error);
  };

  // Table column definitions
  const columns = [
    { Header: 'Name', accessor: 'name' },
    { Header: 'Date of Birth', accessor: 'dob' },
  ];

  return (
    <div className="screen-container">
      <h1 className="screen-header">Members</h1>

      <div className="button-container">
        <ActionButton
          label="Add New Member"
          className="add-button"
          onClick={() => {
            setMode('add');
            setNewMember({ name: '', dob: '' });
            setShowPopup(true);
          }}
        />
      </div>

      <DataFormPopup
        isOpen={showPopup}
        onSave={handleSave}
        onCancel={() => setShowPopup(false)}
        title={mode === 'add' ? 'Add New Member' : 'Edit Member'}
        formData={mode === 'add' ? newMember : editingMember}
        setFormData={mode === 'add' ? setNewMember : setEditingMember}
        fields={[
          { label: 'Name', name: 'name', type: 'text', placeholder: 'Enter Name' },
          { label: 'Date of Birth', name: 'dob', type: 'date', placeholder: '' },
        ]}
      />

      <DataTable
        columns={columns}
        data={members}
        onEdit={(member) => {
          setMode('edit');
          setEditingMember(member);
          setShowPopup(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default MembersScreen;
