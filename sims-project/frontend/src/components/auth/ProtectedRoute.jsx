import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && userProfile) {
    if (!allowedRoles.includes(userProfile.role)) {
      // Redirect to appropriate dashboard based on user role
      const roleRoutes = {
        admin: '/admin',
        teacher: '/teacher',
        student: '/student',
        parent: '/parent',
        vice_principal: '/vice-principal',
        treasurer: '/treasurer',
        exam_supervisor: '/exam-supervisor',
        school_health: '/school-health'
      };

      const redirectPath = roleRoutes[userProfile.role] || '/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
