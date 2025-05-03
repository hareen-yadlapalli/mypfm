import React, { useState, useEffect } from 'react';

function MembersScreen() {
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', dob: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Fetch members from the backend
  useEffect(() => {
    fetch('http://localhost:5000/api/members')
      .then((response) => response.json())
      .then((data) => setMembers(data));
  }, []);

  // Handle Add New Member
  const handleAddMember = () => {
    fetch('http://localhost:5000/api/members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMember),
    })
      .then((response) => response.json())
      .then((data) => {
        setMembers([...members, data]);
        setNewMember({ name: '', dob: '' });
      });
  };

  // Handle Delete Member
  const handleDeleteMember = (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      fetch(`http://localhost:5000/api/members/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          setMembers(members.filter((member) => member.id !== id));
        })
        .catch((err) => console.error('Error deleting member:', err));
    }
  };

  // Handle Edit Member
  const handleEditClick = (member) => {
    setIsEditing(true);
    setEditingMember({ ...member });
  };

  // Handle Save Edited Member
  const handleSaveEdit = () => {
    fetch(`http://localhost:5000/api/members/${editingMember.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editingMember),
    })
      .then((response) => response.json())
      .then((data) => {
        setMembers(
          members.map((member) =>
            member.id === data.id ? { ...data } : member
          )
        );
        setIsEditing(false);
        setEditingMember(null);
      });
  };

  return (
    <div>
      <h1>Members</h1>

      {/* Form for Adding a New Member */}
      <div>
        <h2>Add New Member</h2>
        <input
          type="text"
          placeholder="Name"
          value={newMember.name}
          onChange={(e) =>
            setNewMember({ ...newMember, name: e.target.value })
          }
        />
        <input
          type="date"
          value={newMember.dob}
          onChange={(e) =>
            setNewMember({ ...newMember, dob: e.target.value })
          }
        />
        <button onClick={handleAddMember}>Add Member</button>
      </div>

      {/* Displaying Members in a Table */}
      <h2>Member List</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date of Birth</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>{member.dob}</td>
              <td>
                <button onClick={() => handleEditClick(member)}>Edit</button>
                <button onClick={() => handleDeleteMember(member.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Member Form */}
      {isEditing && (
        <div>
          <h2>Edit Member</h2>
          <input
            type="text"
            value={editingMember.name}
            onChange={(e) =>
              setEditingMember({ ...editingMember, name: e.target.value })
            }
          />
          <input
            type="date"
            value={editingMember.dob}
            onChange={(e) =>
              setEditingMember({ ...editingMember, dob: e.target.value })
            }
          />
          <button onClick={handleSaveEdit}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default MembersScreen;
