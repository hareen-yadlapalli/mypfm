import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => (
  <nav className="sidebar">
    <NavLink to="/"       className="nav-item">Home</NavLink>
    <NavLink to="/members"        className="nav-item">Members</NavLink>
    <NavLink to="/properties"     className="nav-item">Properties</NavLink>
    <NavLink to="/accounts"       className="nav-item">Accounts</NavLink>
    <NavLink to="/incomes"          className="nav-item">Incomes</NavLink>
    <NavLink to="/bills"          className="nav-item">Bills</NavLink>
    <NavLink to="/transactions"   className="nav-item">Transactions</NavLink>
    <NavLink to="/purchases"      className="nav-item">Purchases</NavLink>
    <NavLink to="/purchaseditems" className="nav-item">Purchased Items</NavLink>
    <NavLink to="/categories"     className="nav-item">Categories</NavLink>
    <NavLink to="/pocscreen"     className="nav-item">POC</NavLink>
  </nav>
);

export default Sidebar;
