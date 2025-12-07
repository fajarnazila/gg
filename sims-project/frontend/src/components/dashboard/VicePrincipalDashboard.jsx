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
  Fab,
  LinearProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ExitToApp as LogoutIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const VicePrincipalDashboard = () => {
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
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/vice-principal' },
    { text: 'Student Affairs', icon: <PeopleIcon />, path: '/vice-principal/students' },
    { text: 'Discipline', icon: <WarningIcon />, path: '/vice-principal/discipline' },
    { text: 'Counseling', icon: <PsychologyIcon />, path: '/vice-principal/counseling' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/vice-principal/reports' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          SIMS Vice Principal
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
  const disciplineStats = [
    { title: 'Total Violations', value: '45', change: '+8%', color: 'error' },
    { title: 'Resolved Cases', value: '38', change: '+15%', color: 'success' },
    { title: 'Active Cases', value: '7', change: '-12%', color: 'warning' },
    { title: 'Counseling Sessions', value: '23', change: '+5%', color: 'info' },
  ];

  const recentViolations = [
    { id: 1, student: 'Ahmad Rahman', class: '10A', violation: 'Late to class', date: '2024-12-07', status: 'Resolved' },
    { id: 2, student: 'Siti Nurhaliza', class: '11B', violation: 'Incomplete homework', date: '2024-12-06', status: 'Active' },
    { id: 3, student: 'Budi Santoso', class: '9C', violation: 'Disruptive behavior', date: '2024-12-05', status: 'Under Review' },
  ];

  const upcomingCounseling = [
    { id: 1, student: 'Maya Sari', class: '10A', issue: 'Academic stress', date: '2024-12-10', time: '14:00' },
    { id: 2, student: 'Rizki Pratama', class: '11B', issue: 'Family issues', date: '2024-12-12', time: '10:00' },
    { id: 3, student: 'Lina Kusuma', class: '9C', issue: 'Peer pressure', date: '2024-12-15', time: '13:30' },
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
            School Information Management System - Vice Principal
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
          Vice Principal Dashboard
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Welcome back, {userProfile?.displayName || 'Vice Principal'}
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {disciplineStats.map((stat, index) => (
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
          {/* Recent Discipline Cases */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Discipline Cases
                  </Typography>
                  <Button variant="contained" startIcon={<AddIcon />}>
                    Add Case
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Violation</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentViolations.map((violation) => (
                        <TableRow key={violation.id}>
                          <TableCell>{violation.student}</TableCell>
                          <TableCell>{violation.class}</TableCell>
                          <TableCell>{violation.violation}</TableCell>
                          <TableCell>
                            <Chip
                              label={violation.status}
                              size="small"
                              color={
                                violation.status === 'Resolved' ? 'success' :
                                violation.status === 'Active' ? 'error' : 'warning'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Counseling Sessions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Upcoming Counseling Sessions
                  </Typography>
                  <Button variant="outlined">
                    Schedule Session
                  </Button>
                </Box>
                <List>
                  {upcomingCounseling.map((session) => (
                    <ListItem key={session.id} divider>
                      <ListItemIcon>
                        <PsychologyIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${session.student} - ${session.class}`}
                        secondary={`${session.issue} | ${session.date} at ${session.time}`}
                      />
                      <Chip label="Scheduled" color="info" size="small" />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Student Performance Overview */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Student Performance Overview
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Academic Excellence Rate
                  </Typography>
                  <LinearProgress variant="determinate" value={78} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    78% of students maintaining A/B grades
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Attendance Rate
                  </Typography>
                  <LinearProgress variant="determinate" value={92} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    92% average attendance this month
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Behavioral Incidents
                  </Typography>
                  <LinearProgress variant="determinate" value={15} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    15% decrease in behavioral incidents
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button variant="contained" color="primary" startIcon={<WarningIcon />}>
                    Report Violation
                  </Button>
                  <Button variant="contained" color="secondary" startIcon={<PsychologyIcon />}>
                    Start Counseling
                  </Button>
                  <Button variant="outlined" startIcon={<PeopleIcon />}>
                    Student Profiles
                  </Button>
                  <Button variant="outlined" startIcon={<AssessmentIcon />}>
                    Generate Reports
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Alerts
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="High absenteeism in Class 9B"
                      secondary="5 students absent today"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Monthly counseling report due"
                      secondary="Due in 3 days"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Discipline case escalation"
                      secondary="Case #2024-045 needs review"
                    />
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
                      primary="Discipline case resolved"
                      secondary="Ahmad Rahman's late arrival case closed with warning - 2 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Counseling session completed"
                      secondary="Maya Sari's academic stress session concluded successfully - 4 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="New violation reported"
                      secondary="Disruptive behavior case filed for Budi Santoso - 6 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Monthly discipline report generated"
                      secondary="November 2024 discipline summary completed - 1 day ago"
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

export default VicePrincipalDashboard;
