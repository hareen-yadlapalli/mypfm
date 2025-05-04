import React from 'react';

const ActionButton = ({ label, onClick, className = 'button button-primary' }) => (
  <button className={className} onClick={onClick}>
    {label}
  </button>
);

export default ActionButton;
