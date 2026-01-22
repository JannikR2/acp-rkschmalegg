import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import UserPage from './pages/UserPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/events" element={<AdminPage />} />
          <Route path="/admin/events/:eventId" element={<AdminPage />} />
          <Route path="/admin/events/:eventId/timeslots" element={<AdminPage />} />
          <Route path="/admin/events/:eventId/timeslots/:timeslotId" element={<AdminPage />} />
          <Route path="/admin/events/:eventId/timeslots/:timeslotId/participants" element={<AdminPage />} />
          <Route path="/admin/events/create" element={<AdminPage />} />
          <Route path="/admin/events/:eventId/edit" element={<AdminPage />} />
          <Route path="/admin/persons" element={<AdminPage />} />
          <Route path="/user/:userId" element={<UserPage />} />
          <Route path="/user/:userId/events" element={<UserPage />} />
          <Route path="/user/:userId/events/:eventId" element={<UserPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
