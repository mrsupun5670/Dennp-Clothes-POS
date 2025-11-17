import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages - to be implemented
const Dashboard = () => <div>Dashboard - To be implemented</div>;
const AllShops = () => <div>All Shops - To be implemented</div>;
const ShopDetail = () => <div>Shop Detail - To be implemented</div>;
const Reports = () => <div>Reports - To be implemented</div>;
const Users = () => <div>Users - To be implemented</div>;
const Inventory = () => <div>Inventory - To be implemented</div>;
const Settings = () => <div>Settings - To be implemented</div>;
const Login = () => <div>Login - To be implemented</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/shops" element={<AllShops />} />
        <Route path="/shops/:shopId" element={<ShopDetail />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<Users />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
