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

const App = () => {
  const headerHeight = 60; // Set your header height (adjust accordingly)

  return (
    <Router>
      <div style={appStyle}>
        <Header />
        <div style={{ ...mainContentStyle, marginTop: `${headerHeight}px` }}>
          {/* Pass the header height to Sidebar */}
          <Sidebar headerHeight={headerHeight} />
          <div style={contentStyle}>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/members" element={<MembersScreen />} />
              <Route path="/properties" element={<PropertiesScreen />} />
              <Route path="/accounts" element={<AccountsScreen />} />
              <Route path="/transactions" element={<TransactionsScreen />} />
              <Route path="/purchases" element={<PurchasesScreen />} />
              <Route path="/purchaseditems" element={<PurchasedItemsScreen />} />
              <Route path="/bills" element={<BillsScreen />} />
              <Route path="/categories" element={<CategoriesScreen />} />

            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

const appStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
};

const mainContentStyle = {
  display: 'flex',
  flex: 1,
  transition: 'margin-top 0.3s ease-in-out',
};

const contentStyle = {
  marginLeft: '240px', // Adjusted for sidebar width
  padding: '20px',
  flex: 1,
};

export default App;
