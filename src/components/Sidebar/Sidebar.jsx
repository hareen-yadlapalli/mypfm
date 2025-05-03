// src/components/Sidebar/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div style={sidebarStyle}>
      <div style={navItemStyle}>
        <Link to="/" style={linkStyle}>Home</Link>
      </div>
      <div style={navItemStyle}>
        <Link to="/members" style={linkStyle}>Members</Link>
      </div>
      <div style={navItemStyle}>
        <Link to="/properties" style={linkStyle}>Properties</Link>
      </div>
      <div style={navItemStyle}>
        <Link to="/accounts" style={linkStyle}>Accounts</Link>
      </div>
      <div style={navItemStyle}>
        <Link to="/bills" style={linkStyle}>Bills</Link>
      </div>
      <div style={navItemStyle}>
        <Link to="/transactions" style={linkStyle}>Transactions</Link>
      </div>
      <div style={navItemStyle}>
        <Link to="/purchases" style={linkStyle}>Purchases</Link>
      </div>
      <div style={navItemStyle}>
        <Link to="/purchaseditems" style={linkStyle}>PurchasedItems</Link>
      </div>
      <div style={navItemStyle}>
        <Link to="/categories" style={linkStyle}>Categories</Link>
      </div>
    </div>
  );
};

const sidebarStyle = {
  width: '220px',
  background: '#f4f4f4',
  position: 'fixed',
  left: '0',
  height: 'calc(100vh - 60px)', // Sidebar takes full height minus the header height (hardcoded as 60px)
  borderTop: '2px solid #ccc', // Full-width border at the top
  borderBottom: '2px solid #ccc', // Full-width border at the bottom
  display: 'flex',
  flexDirection: 'column',
};

const navItemStyle = {
  borderBottom: '2px solid #ccc', // Border at the bottom of each item
  padding: '10px',
  backgroundColor: '#fff',
};

const linkStyle = {
  textDecoration: 'none',
  color: '#333',
  fontSize: '18px',
  display: 'block',
  textAlign: 'center',
};

export default Sidebar;
