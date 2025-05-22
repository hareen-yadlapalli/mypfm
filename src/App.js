// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';

import HomeScreen from './screens/HomeScreen/HomeScreen';
import MembersScreen from './screens/MembersScreen/MembersScreen';
import PropertiesScreen from './screens/PropertiesScreen/PropertiesScreen';
import AccountsScreen from './screens/AccountsScreen/AccountsScreen';
import TransactionsScreen from './screens/TransactionsScreen/TransactionsScreen';
import PurchasesScreen from './screens/PurchasesScreen/PurchasesScreen';
import PurchasedItemsScreen from './screens/PurchasedItemsScreen/PurchasedItemsScreen';
import BillsScreen from './screens/BillsScreen/BillsScreen';
import CategoriesScreen from './screens/CategoriesScreen/CategoriesScreen';
import IncomesScreen from './screens/IncomesScreen/IncomesScreen';
import POCScreen from './screens/POCScreen/POCScreen';

import './styles/global.css'; // Global grid & component styles

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <Sidebar />
        <div className="main">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/members" element={<MembersScreen />} />
            <Route path="/properties" element={<PropertiesScreen />} />
            <Route path="/accounts" element={<AccountsScreen />} />
            <Route path="/incomes" element={<IncomesScreen />} />
            <Route path="/transactions" element={<TransactionsScreen />} />
            <Route path="/purchases" element={<PurchasesScreen />} />
            <Route path="/purchaseditems" element={<PurchasedItemsScreen />} />
            <Route path="/bills" element={<BillsScreen />} />
            <Route path="/categories" element={<CategoriesScreen />} />
            <Route path="/pocscreen" element={<POCScreen />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
