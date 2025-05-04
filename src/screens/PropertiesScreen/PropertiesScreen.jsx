// src/screens/PropertiesScreen/PropertiesScreen.jsx

import React, { useState, useEffect, useMemo } from 'react';
import SearchBox from '../../components/SearchBox/SearchBox';
import AdvancedSearch from '../../components/AdvancedSearch/AdvancedSearch';
import DataTable from '../../components/DataTable/DataTable';
import DataFormPopup from '../../components/DataFormPopup/DataFormPopup';
import ActionButton from '../../components/ActionButton/ActionButton';

const PropertiesScreen = () => {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [newProperty, setNewProperty] = useState({
    address: '',
    suburb: '',
    purpose: '',
  });
  const [editingProperty, setEditingProperty] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mode, setMode] = useState('add'); // 'add' or 'edit'

  // Fetch properties on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/properties')
      .then((res) => res.json())
      .then(setProperties)
      .catch(console.error);
  }, []);

  // Simple search across all fields
  const simpleFiltered = useMemo(() => {
    if (!searchTerm) return properties;
    const lower = searchTerm.toLowerCase();
    return properties.filter((p) =>
      ['address', 'suburb', 'purpose'].some((key) =>
        String(p[key] || '').toLowerCase().includes(lower)
      )
    );
  }, [properties, searchTerm]);

  // Advanced filter on top of simple filter
  const filtered = useMemo(() => {
    if (!criteria.length) return simpleFiltered;
    return simpleFiltered.filter((p) =>
      criteria.every(({ field, operator, value }) => {
        if (!value) return true;
        const rec = p[field] || '';
        const recLower = String(rec).toLowerCase();
        const q = value.toLowerCase();
        switch (operator) {
          case 'contains':
            return recLower.includes(q);
          case 'equals':
            return recLower === q;
          case 'startsWith':
            return recLower.startsWith(q);
          case 'endsWith':
            return recLower.endsWith(q);
          default:
            return true;
        }
      })
    );
  }, [simpleFiltered, criteria]);

  const fields = [
    { label: 'Address', name: 'address', type: 'text' },
    { label: 'Suburb', name: 'suburb', type: 'text' },
    { label: 'Purpose', name: 'purpose', type: 'text' },
  ];

  // Save (add or update)
  const handleSave = () => {
    const payload = mode === 'add' ? newProperty : editingProperty;
    if (!payload.address.trim()) {
      alert('Address is required.');
      return;
    }
    const url =
      mode === 'add'
        ? 'http://localhost:5000/api/properties'
        : `http://localhost:5000/api/properties/${editingProperty.id}`;
    const method = mode === 'add' ? 'POST' : 'PUT';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        setProperties((list) =>
          mode === 'add'
            ? [...list, data]
            : list.map((p) => (p.id === data.id ? data : p))
        );
        setShowPopup(false);
      })
      .catch(() => alert('Failed to save property'));
  };

  // Delete
  const handleDelete = (id) => {
    if (!window.confirm('Delete this property?')) return;
    fetch(`http://localhost:5000/api/properties/${id}`, { method: 'DELETE' })
      .then(() => setProperties((list) => list.filter((p) => p.id !== id)))
      .catch(console.error);
  };

  // Table columns
  const columns = [
    { Header: 'Address', accessor: 'address' },
    { Header: 'Suburb', accessor: 'suburb' },
    { Header: 'Purpose', accessor: 'purpose' },
  ];

  return (
    <div className="main">
      <div className="button-container">
        <SearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search properties..."
        />
        <button
          className="button button-secondary toggle-adv"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          {showAdvanced ? 'Hide Advanced' : 'Advanced Search'}
        </button>
        <ActionButton
          label="Add New Property"
          onClick={() => {
            setMode('add');
            setNewProperty({ address: '', suburb: '', purpose: '' });
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
        title={mode === 'add' ? 'Add New Property' : 'Edit Property'}
        formData={mode === 'add' ? newProperty : editingProperty}
        setFormData={mode === 'add' ? setNewProperty : setEditingProperty}
        fields={[
          { label: 'Address', name: 'address', type: 'text', placeholder: 'Enter address' },
          { label: 'Suburb', name: 'suburb', type: 'text', placeholder: 'Enter suburb' },
          { label: 'Purpose', name: 'purpose', type: 'text', placeholder: 'Enter purpose' },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        onEdit={(row) => {
          setMode('edit');
          setEditingProperty(row);
          setShowPopup(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default PropertiesScreen;
