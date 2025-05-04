// src/screens/MembersScreen/MembersScreen.jsx

import React from 'react';
import CRUDScreen from '../../components/CRUDScreen/CRUDScreen';

const memberFields = [
  { label: 'Name', name: 'name', type: 'text' },
  { label: 'Date of Birth', name: 'dob', type: 'date' },
];

export default function MembersScreen() {
  return (
    <CRUDScreen
      title="Members"
      endpoint="http://localhost:5000/api/members"
      fields={memberFields}
    />
  );
}
