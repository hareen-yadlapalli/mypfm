// src/components/Header/Header.jsx
import React from 'react';

const Header = () => {
  return (
    <header style={headerStyle}>
      <h1>My React App</h1>
    </header>
  );
};

const headerStyle = {
  height: '60px', // Adjust the height as needed
  backgroundColor: '#333',
  color: '#fff',
  padding: '10px 20px',
  textAlign: 'center',
};

export default Header;
