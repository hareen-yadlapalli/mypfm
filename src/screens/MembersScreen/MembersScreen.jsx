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

  // Save (Add or Update)
  const handleSave = () => {
    const payload = mode === 'add' ? newMember : editingMember;
    const url =
      mode === 'add'
        ? 'http://localhost:5000/api/members'
        : `http://localhost:5000/api/members/${editingMember.id}`;
    const method = mode === 'add' ? 'POST' : 'PUT';

    // Only require name
    if (!payload.name) return alert('Name is required.');

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (mode === 'add') {
          setMembers((m) => [...m, data]);
        } else {
          setMembers((m) => m.map((x) => (x.id === data.id ? data : x)));
        }
        setShowPopup(false);
      })
      .catch(() => alert('Failed to save'));
  };

  // Delete
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure?')) return;
    fetch(`http://localhost:5000/api/members/${id}`, {
      method: 'DELETE',
    })
      .then(() => setMembers((m) => m.filter((x) => x.id !== id)))
      .catch(console.error);
  };

  // Table columns
  const columns = [
    { Header: 'Name', accessor: 'name' },
    { Header: 'Date of Birth', accessor: 'dob' }, // formatted in DataTable
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
          {
            label: 'Name',
            name: 'name',
            type: 'text',
            placeholder: 'Enter name',
          },
          {
            label: 'Date of Birth',
            name: 'dob',
            type: 'date',
            placeholder: '',
          },
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
