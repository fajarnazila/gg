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
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Class as ClassIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Message as MessageIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const TeacherDashboard = () => {
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
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/teacher' },
    { text: 'My Classes', icon: <ClassIcon />, path: '/teacher/classes' },
    { text: 'Grades', icon: <AssessmentIcon />, path: '/teacher/grades' },
    { text: 'Attendance', icon: <PeopleIcon />, path: '/teacher/attendance' },
    { text: 'Messages', icon: <MessageIcon />, path: '/teacher/messages' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          SIMS Teacher
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
            School Information Management System
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
          Teacher Dashboard
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Welcome back, {userProfile?.displayName || 'Teacher'}
        </Typography>

        <Grid container spacing={3}>
          {/* Today's Schedule */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Today's Schedule
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Mathematics - Class 10A"
                      secondary="08:00 - 09:30"
                    />
                    <Chip label="Room 101" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Physics - Class 11B"
                      secondary="10:00 - 11:30"
                    />
                    <Chip label="Lab 1" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Mathematics - Class 9C"
                      secondary="13:00 - 14:30"
                    />
                    <Chip label="Room 102" size="small" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Stats
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h4" color="primary">
                      5
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Classes Today
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" color="secondary">
                      12
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Assignments Pending
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" color="success.main">
                      98%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Attendance
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" color="warning.main">
                      3
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Unread Messages
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activities
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Grade submitted for Mathematics Quiz"
                      secondary="Class 10A - 2 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Attendance marked for Physics class"
                      secondary="Class 11B - 4 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="New assignment uploaded"
                      secondary="Chemistry Lab Report - 1 day ago"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Deadlines */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Deadlines
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Mathematics Assignment"
                      secondary="Due: Tomorrow - Class 10A"
                    />
                    <Chip label="2 days left" color="warning" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Physics Lab Report"
                      secondary="Due: Friday - Class 11B"
                    />
                    <Chip label="4 days left" color="info" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Chemistry Quiz"
                      secondary="Due: Next Monday - Class 9C"
                    />
                    <Chip label="6 days left" color="success" size="small" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="contained" color="primary">
                    Mark Attendance
                  </Button>
                  <Button variant="contained" color="secondary">
                    Upload Material
                  </Button>
                  <Button variant="outlined">
                    Create Assignment
                  </Button>
                  <Button variant="outlined">
                    Send Message
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TeacherDashboard;
