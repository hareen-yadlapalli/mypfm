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

  // Load members
  useEffect(() => {
    fetch('http://localhost:5000/api/members')
      .then((r) => r.json())
      .then(setMembers)
      .catch(console.error);
  }, []);

  // Unified save for add/edit
  const handleSave = () => {
    if (mode === 'add') {
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
        .catch(() => alert('Failed to add'));
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
        .catch(() => alert('Failed to update'));
    }
  };

  // Delete member
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure?')) return;
    fetch(`http://localhost:5000/api/members/${id}`, { method: 'DELETE' })
      .then(() => setMembers((m) => m.filter((x) => x.id !== id)))
      .catch(console.error);
  };

  const columns = [
    { Header: 'Name', accessor: 'name' },
    { Header: 'Date of Birth', accessor: 'dob' },
  ];

  return (
    <div className="main">
      <div className="button-container">
        <ActionButton
          label="Add New Member"
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
          { label: 'Name', name: 'name', type: 'text', placeholder: 'Enter name' },
          { label: 'Date of Birth', name: 'dob', type: 'date', placeholder: '' },
        ]}
      />

      <DataTable
        columns={columns}
        data={members}
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
