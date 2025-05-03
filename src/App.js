// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Notice the change to Routes
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import HomeScreen from './screens/HomeScreen/HomeScreen';
import MembersScreen from './screens/MembersScreen/MembersScreen';
import PropertiesScreen from './screens/PropertiesScreen/PropertiesScreen';
import AccountsScreen from './screens/AccountsScreen/AccountsScreen';

const App = () => {
  return (
    <Router>
      <div style={appStyle}>
        <Header />
        <div style={mainContentStyle}>
          <Sidebar />
          <div style={contentStyle}>
            <Routes> {/* Change to Routes here */}
              <Route path="/" element={<HomeScreen />} />
              <Route path="/members" element={<MembersScreen />} />
              <Route path="/properties" element={<PropertiesScreen />} />
              <Route path="/accounts" element={<AccountsScreen />} />
            </Routes> {/* End Routes */}
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
};

const contentStyle = {
  marginLeft: '220px', // Adjusted for sidebar width
  padding: '20px',
  flex: 1,
};

export default App;
