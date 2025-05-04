import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/DataTable/DataTable';
import DataFormPopup from '../../components/DataFormPopup/DataFormPopup';
import ActionButton from '../../components/ActionButton/ActionButton';
import SearchBox from '../../components/SearchBox/SearchBox';

function MembersScreen() {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filter as user types
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    const lower = searchTerm.toLowerCase();
    return members.filter((m) =>
      Object.values(m).some((val) =>
        String(val || '').toLowerCase().includes(lower)
      )
    );
  }, [members, searchTerm]);

  // Add or edit save handler
  const handleSave = () => {
    const payload = mode === 'add' ? newMember : editingMember;
    if (!payload.name) {
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
      .then((r) => r.json())
      .then((data) => {
        setMembers((ms) =>
          mode === 'add' ? [...ms, data] : ms.map((x) => (x.id === data.id ? data : x))
        );
        setShowPopup(false);
      })
      .catch(() => alert('Failed to save'));
  };

  // Delete
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure?')) return;
    fetch(`http://localhost:5000/api/members/${id}`, { method: 'DELETE' })
      .then(() => setMembers((ms) => ms.filter((x) => x.id !== id)))
      .catch(console.error);
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
        data={filteredMembers}
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
