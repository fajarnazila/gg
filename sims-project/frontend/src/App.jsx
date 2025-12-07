import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import StudentDashboard from './components/dashboard/StudentDashboard';
import VicePrincipalDashboard from './components/dashboard/VicePrincipalDashboard';
import TreasurerDashboard from './components/dashboard/TreasurerDashboard';
import ExamSupervisorDashboard from './components/dashboard/ExamSupervisorDashboard';
import SchoolHealthDashboard from './components/dashboard/SchoolHealthDashboard';
import ParentDashboard from './components/dashboard/ParentDashboard';

// Styles
import './App.css';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/dashboard" /> : <Login />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/admin"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/teacher"
          element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/student"
          element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/vice-principal"
          element={<ProtectedRoute allowedRoles={['vice_principal']}><VicePrincipalDashboard /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/treasurer"
          element={<ProtectedRoute allowedRoles={['treasurer']}><TreasurerDashboard /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/exam-supervisor"
          element={<ProtectedRoute allowedRoles={['exam_supervisor']}><ExamSupervisorDashboard /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/school-health"
          element={<ProtectedRoute allowedRoles={['school_health']}><SchoolHealthDashboard /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/parent"
          element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>}
        />

        {/* Catch-all Route */}
        <Route
          path="/"
          element={currentUser ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
