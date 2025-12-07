import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Fab
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const AdminDashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Academic Management', icon: <SchoolIcon />, path: '/admin/academic' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/admin/reports' },
    { text: 'System Settings', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          SIMS Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text}>
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <Divider />
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  // Sample data for demonstration
  const recentUsers = [
    { id: 1, name: 'Ahmad Rahman', role: 'Teacher', email: 'ahmad@school.com', status: 'Active' },
    { id: 2, name: 'Siti Nurhaliza', role: 'Student', email: 'siti@student.com', status: 'Active' },
    { id: 3, name: 'Budi Santoso', role: 'Treasurer', email: 'budi@school.com', status: 'Inactive' },
  ];

  const systemStats = [
    { title: 'Total Students', value: '1,250', change: '+5%', color: 'primary' },
    { title: 'Total Teachers', value: '85', change: '+2%', color: 'secondary' },
    { title: 'Active Classes', value: '42', change: '0%', color: 'success' },
    { title: 'Pending Payments', value: '156', change: '-12%', color: 'warning' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            School Information Management System - Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        <Toolbar />
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Welcome back, {userProfile?.displayName || 'Administrator'}
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {systemStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color={`${stat.color}.main`}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stat.title}
                  </Typography>
                  <Chip
                    label={stat.change}
                    size="small"
                    color={stat.change.startsWith('+') ? 'success' : stat.change.startsWith('-') ? 'error' : 'default'}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Recent Users */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Users
                  </Typography>
                  <Button variant="contained" startIcon={<AddIcon />}>
                    Add User
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2 }}>{user.name.charAt(0)}</Avatar>
                              {user.name}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={user.role} size="small" />
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.status}
                              color={user.status === 'Active' ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary">
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions & System Status */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button variant="outlined" startIcon={<AddIcon />}>
                    Create New Class
                  </Button>
                  <Button variant="outlined" startIcon={<PeopleIcon />}>
                    Manage Users
                  </Button>
                  <Button variant="outlined" startIcon={<AssessmentIcon />}>
                    Generate Reports
                  </Button>
                  <Button variant="outlined" startIcon={<SettingsIcon />}>
                    System Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Status
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Database"
                      secondary="Firestore: Connected"
                    />
                    <Chip label="OK" color="success" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Authentication"
                      secondary="Firebase Auth: Active"
                    />
                    <Chip label="OK" color="success" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="File Storage"
                      secondary="Firebase Storage: Ready"
                    />
                    <Chip label="OK" color="success" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="API Server"
                      secondary="Express: Running"
                    />
                    <Chip label="OK" color="success" size="small" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activities
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="New student registered"
                      secondary="Siti Nurhaliza joined Class 10A - 2 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Grade submitted"
                      secondary="Mathematics exam grades uploaded by Mr. Ahmad - 4 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Payment received"
                      secondary="SPP payment from student ID 2024001 - 6 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="New teacher onboarded"
                      secondary="Mrs. Sari joined as Physics teacher - 1 day ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="System backup completed"
                      secondary="Daily backup finished successfully - 2 days ago"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <AddIcon />
        </Fab>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
