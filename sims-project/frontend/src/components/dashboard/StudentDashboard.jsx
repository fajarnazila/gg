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
  LinearProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Class as ClassIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Message as MessageIcon,
  ExitToApp as LogoutIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const StudentDashboard = () => {
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
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/student' },
    { text: 'My Classes', icon: <ClassIcon />, path: '/student/classes' },
    { text: 'Grades', icon: <AssessmentIcon />, path: '/student/grades' },
    { text: 'Assignments', icon: <AssignmentIcon />, path: '/student/assignments' },
    { text: 'Attendance', icon: <PeopleIcon />, path: '/student/attendance' },
    { text: 'Messages', icon: <MessageIcon />, path: '/student/messages' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          SIMS Student
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
          Student Dashboard
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Welcome back, {userProfile?.displayName || 'Student'}
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
                      primary="Mathematics"
                      secondary="08:00 - 09:30 - Room 101"
                    />
                    <Chip label="Mr. Ahmad" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Physics"
                      secondary="10:00 - 11:30 - Lab 1"
                    />
                    <Chip label="Mrs. Sari" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="English"
                      secondary="13:00 - 14:30 - Room 102"
                    />
                    <Chip label="Mr. Budi" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Chemistry"
                      secondary="14:45 - 16:15 - Lab 2"
                    />
                    <Chip label="Mr. Rahman" size="small" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Grades */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Grades
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Mathematics Quiz"
                      secondary="Score: 85/100"
                    />
                    <Chip label="B" color="success" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Physics Lab Report"
                      secondary="Score: 92/100"
                    />
                    <Chip label="A-" color="success" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="English Essay"
                      secondary="Score: 78/100"
                    />
                    <Chip label="C+" color="warning" size="small" />
                  </ListItem>
                </List>
                <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                  View All Grades
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Current Semester Progress */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Semester Progress
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Current Semester: 2024/2025 - Semester 1
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Progress: 65% Complete
                </Typography>
                <LinearProgress variant="determinate" value={65} sx={{ mb: 2 }} />

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Days Left:</Typography>
                    <Typography variant="h6" color="primary">45</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Current GPA:</Typography>
                    <Typography variant="h6" color="secondary">3.7</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Assignments */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pending Assignments
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Mathematics Problem Set"
                      secondary="Due: Tomorrow - 5 questions"
                    />
                    <Chip label="1 day left" color="error" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Physics Lab Report"
                      secondary="Due: Friday - 2000 words"
                    />
                    <Chip label="3 days left" color="warning" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Chemistry Presentation"
                      secondary="Due: Next Monday - Group project"
                    />
                    <Chip label="5 days left" color="info" size="small" />
                  </ListItem>
                </List>
                <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                  View All Assignments
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Attendance Summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Attendance Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h4" color="success.main">
                      95%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      This Month
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" color="primary">
                      92%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      This Semester
                    </Typography>
                  </Grid>
                </Grid>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Total Present: 85/89 classes
                </Typography>
                <Typography variant="body2">
                  Total Absent: 4 classes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Events */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Events
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Parent-Teacher Meeting"
                      secondary="Tomorrow, 14:00 - School Hall"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Science Fair"
                      secondary="Next Friday, 09:00 - School Ground"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Sports Day"
                      secondary="Next Month - School Field"
                    />
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
                    Submit Assignment
                  </Button>
                  <Button variant="contained" color="secondary">
                    Download Materials
                  </Button>
                  <Button variant="outlined">
                    View Grades
                  </Button>
                  <Button variant="outlined">
                    Contact Teacher
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

export default StudentDashboard;
