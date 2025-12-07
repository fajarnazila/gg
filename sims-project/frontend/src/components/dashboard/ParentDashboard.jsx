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
  ChildCare as ChildCareIcon,
  Message as MessageIcon,
  Assessment as AssessmentIcon,
  Payment as PaymentIcon,
  Event as EventIcon,
  ExitToApp as LogoutIcon,
  Add as AddIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const ParentDashboard = () => {
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
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/parent' },
    { text: 'Child Progress', icon: <ChildCareIcon />, path: '/parent/progress' },
    { text: 'Messages', icon: <MessageIcon />, path: '/parent/messages' },
    { text: 'Payments', icon: <PaymentIcon />, path: '/parent/payments' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/parent/reports' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          SIMS Parent Portal
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
  const childStats = [
    { title: 'Current Grade Average', value: 'A-', change: '+0.2', color: 'success' },
    { title: 'Attendance Rate', value: '95%', change: '+2%', color: 'primary' },
    { title: 'Outstanding Fees', value: 'Rp 250,000', change: '-Rp 500,000', color: 'warning' },
    { title: 'Unread Messages', value: '3', change: '+1', color: 'info' },
  ];

  const recentGrades = [
    { subject: 'Mathematics', score: '92', grade: 'A-', teacher: 'Mr. Ahmad' },
    { subject: 'English', score: '88', grade: 'B+', teacher: 'Mrs. Sari' },
    { subject: 'Science', score: '95', grade: 'A', teacher: 'Mr. Budi' },
    { subject: 'History', score: '85', grade: 'B', teacher: 'Mrs. Lina' },
  ];

  const upcomingEvents = [
    { event: 'Parent-Teacher Meeting', date: '2024-12-15', time: '14:00', type: 'Meeting' },
    { event: 'School Sports Day', date: '2024-12-20', time: '08:00', type: 'Event' },
    { event: 'Semester Report Distribution', date: '2024-12-22', time: '16:00', type: 'Academic' },
  ];

  const recentMessages = [
    { from: 'Mr. Ahmad (Math Teacher)', message: 'Great improvement in recent assignments!', time: '2 hours ago', unread: true },
    { from: 'Mrs. Sari (English Teacher)', message: 'Please review homework submission guidelines', time: '1 day ago', unread: true },
    { from: 'School Administration', message: 'Reminder: School fee payment due next week', time: '2 days ago', unread: false },
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
            School Information Management System - Parent Portal
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
          Parent Dashboard
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Welcome back, {userProfile?.displayName || 'Parent'}
        </Typography>

        {/* Child Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {childStats.map((stat, index) => (
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
          {/* Recent Grades */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Grades
                  </Typography>
                  <Button variant="outlined" size="small">
                    View Full Report
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Teacher</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentGrades.map((grade, index) => (
                        <TableRow key={index}>
                          <TableCell>{grade.subject}</TableCell>
                          <TableCell>{grade.score}</TableCell>
                          <TableCell>
                            <Chip
                              label={grade.grade}
                              size="small"
                              color={grade.grade.startsWith('A') ? 'success' : grade.grade.startsWith('B') ? 'primary' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>{grade.teacher}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Events */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming School Events
                </Typography>
                <List>
                  {upcomingEvents.map((event, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <EventIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={event.event}
                        secondary={`${event.date} at ${event.time}`}
                      />
                      <Chip label={event.type} color="info" size="small" />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Messages */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Messages
                  </Typography>
                  <Button variant="contained" startIcon={<AddIcon />}>
                    New Message
                  </Button>
                </Box>
                <List>
                  {recentMessages.map((message, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <EmailIcon color={message.unread ? 'primary' : 'disabled'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={message.from}
                        secondary={`${message.message} • ${message.time}`}
                      />
                      {message.unread && <Chip label="New" color="primary" size="small" />}
                    </ListItem>
                  ))}
                </List>
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
                  <Button variant="contained" color="primary" startIcon={<MessageIcon />}>
                    Message Teacher
                  </Button>
                  <Button variant="contained" color="secondary" startIcon={<PaymentIcon />}>
                    Pay School Fees
                  </Button>
                  <Button variant="outlined" startIcon={<AssessmentIcon />}>
                    View Report Card
                  </Button>
                  <Button variant="outlined" startIcon={<EventIcon />}>
                    Schedule Meeting
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Child Performance Overview */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Academic Performance
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Overall Progress
                  </Typography>
                  <LinearProgress variant="determinate" value={87} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    87% - Excellent progress this semester
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Homework Completion
                  </Typography>
                  <LinearProgress variant="determinate" value={92} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    92% - Very consistent
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Class Participation
                  </Typography>
                  <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    85% - Good engagement
                  </Typography>
                </Box>
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
                      primary="Grade posted for Mathematics"
                      secondary="Mr. Ahmad posted your child's latest math test score - 2 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="School fee payment reminder"
                      secondary="Outstanding balance of Rp 250,000 due by December 15 - 1 day ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Parent-teacher meeting scheduled"
                      secondary="Meeting with Mrs. Sari scheduled for December 15 at 14:00 - 2 days ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Homework submission notice"
                      secondary="English homework due tomorrow, please ensure completion - 3 days ago"
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

export default ParentDashboard;
