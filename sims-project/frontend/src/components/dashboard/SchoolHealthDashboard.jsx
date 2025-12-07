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
  LocalHospital as LocalHospitalIcon,
  Healing as HealingIcon,
  MedicalServices as MedicalServicesIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Add as AddIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const SchoolHealthDashboard = () => {
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
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/school-health' },
    { text: 'Medical Records', icon: <MedicalServicesIcon />, path: '/school-health/records' },
    { text: 'Daily Checkups', icon: <PersonIcon />, path: '/school-health/checkups' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/school-health/inventory' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/school-health/reports' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          SIMS Health Unit
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
  const healthStats = [
    { title: 'Students Checked Today', value: '45', change: '+12', color: 'success' },
    { title: 'Active Medical Cases', value: '8', change: '-2', color: 'warning' },
    { title: 'Medicine Stock Level', value: '78%', change: '+5%', color: 'info' },
    { title: 'Emergency Responses', value: '2', change: '0', color: 'error' },
  ];

  const todayCheckups = [
    { id: 1, student: 'Ahmad Rahman', class: '10A', condition: 'Healthy', time: '08:30' },
    { id: 2, student: 'Siti Nurhaliza', class: '11B', condition: 'Fever', time: '09:15' },
    { id: 3, student: 'Budi Santoso', class: '9C', condition: 'Healthy', time: '10:00' },
  ];

  const activeCases = [
    { id: 1, student: 'Maya Sari', condition: 'Asthma', medication: 'Inhaler', followUp: '2024-12-15' },
    { id: 2, student: 'Rizki Pratama', condition: 'Allergy', medication: 'Antihistamine', followUp: '2024-12-12' },
    { id: 3, student: 'Lina Kusuma', condition: 'Dental Care', medication: 'Pain reliever', followUp: '2024-12-10' },
  ];

  const medicineStock = [
    { name: 'Paracetamol', current: 85, max: 100, status: 'Good' },
    { name: 'Antihistamine', current: 45, max: 100, status: 'Low' },
    { name: 'Bandages', current: 120, max: 150, status: 'Good' },
    { name: 'First Aid Kit', current: 8, max: 10, status: 'Good' },
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
            School Information Management System - Health Unit
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
          School Health Unit Dashboard
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Welcome back, {userProfile?.displayName || 'Health Officer'}
        </Typography>

        {/* Health Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {healthStats.map((stat, index) => (
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
          {/* Today's Health Checkups */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Today's Health Checkups
                  </Typography>
                  <Button variant="contained" startIcon={<AddIcon />}>
                    New Checkup
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Condition</TableCell>
                        <TableCell>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {todayCheckups.map((checkup) => (
                        <TableRow key={checkup.id}>
                          <TableCell>{checkup.student}</TableCell>
                          <TableCell>{checkup.class}</TableCell>
                          <TableCell>
                            <Chip
                              label={checkup.condition}
                              size="small"
                              color={checkup.condition === 'Healthy' ? 'success' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>{checkup.time}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Medical Cases */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Medical Cases
                </Typography>
                <List>
                  {activeCases.map((case_, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <LocalHospitalIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${case_.student} - ${case_.condition}`}
                        secondary={`Medication: ${case_.medication} | Follow-up: ${case_.followUp}`}
                      />
                      <Chip label="Active" color="warning" size="small" />
                    </ListItem>
                  ))}
                </List>
                <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                  View All Cases
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Medicine Inventory */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Medicine Inventory
                </Typography>
                <List dense>
                  {medicineStock.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={item.name}
                        secondary={`Stock: ${item.current}/${item.max} units`}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(item.current / item.max) * 100}
                          sx={{ width: 60, height: 6 }}
                        />
                        <Chip
                          label={item.status}
                          size="small"
                          color={item.status === 'Good' ? 'success' : 'warning'}
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
                <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                  Update Inventory
                </Button>
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
                  <Button variant="contained" color="primary" startIcon={<PersonIcon />}>
                    Health Checkup
                  </Button>
                  <Button variant="contained" color="secondary" startIcon={<MedicalServicesIcon />}>
                    Record Treatment
                  </Button>
                  <Button variant="outlined" startIcon={<InventoryIcon />}>
                    Manage Inventory
                  </Button>
                  <Button variant="outlined" startIcon={<AssessmentIcon />}>
                    Health Reports
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Health Alerts */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Health Alerts
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Low medicine stock"
                      secondary="Antihistamine running low (45/100)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocalHospitalIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Follow-up required"
                      secondary="3 students need follow-up checkups"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <HealingIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Monthly health check"
                      secondary="Grade 10 health screening due next week"
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
                  Recent Health Activities
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Emergency response handled"
                      secondary="Siti Nurhaliza treated for fever, sent home for rest - 2 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Medicine inventory updated"
                      secondary="Received new shipment of bandages and first aid supplies - 4 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Monthly health report generated"
                      secondary="November 2024 student health summary completed - 6 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Vaccination campaign completed"
                      secondary="Flu vaccination administered to 95% of students - 1 day ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="New medical case recorded"
                      secondary="Ahmad Rahman registered with asthma condition - 2 days ago"
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

export default SchoolHealthDashboard;
