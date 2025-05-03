// src/components/Sidebar/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <nav style={sidebarStyle}>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/members">Members</Link></li>
        <li><Link to="/properties">Properties</Link></li>
        <li><Link to="/accounts">Accounts</Link></li>
      </ul>
    </nav>
  );
};

const sidebarStyle = {
  width: '200px',
  background: '#f4f4f4',
  padding: '20px',
  position: 'fixed',
  top: '0',
  left: '0',
  height: '100vh',
};

export default Sidebar;
