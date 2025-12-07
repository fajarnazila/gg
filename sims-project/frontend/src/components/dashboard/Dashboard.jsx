import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to role-specific dashboard
    if (userProfile?.role) {
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

      const redirectPath = roleRoutes[userProfile.role];
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [userProfile, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to SIMS Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Information
              </Typography>
              <Typography variant="body2">
                Name: {userProfile?.displayName || 'N/A'}
              </Typography>
              <Typography variant="body2">
                Email: {userProfile?.email || 'N/A'}
              </Typography>
              <Typography variant="body2">
                Role: {userProfile?.role || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Redirecting to your role-specific dashboard...
              </Typography>
              <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                Logout
              </button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
