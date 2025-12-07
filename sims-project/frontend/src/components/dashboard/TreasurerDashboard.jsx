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
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  ExitToApp as LogoutIcon,
  Add as AddIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const TreasurerDashboard = () => {
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
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/treasurer' },
    { text: 'Payments', icon: <PaymentIcon />, path: '/treasurer/payments' },
    { text: 'Outstanding', icon: <ReceiptIcon />, path: '/treasurer/outstanding' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/treasurer/reports' },
    { text: 'Financial Settings', icon: <AccountBalanceIcon />, path: '/treasurer/settings' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          SIMS Treasurer
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
  const financialStats = [
    { title: 'Monthly Revenue', value: 'Rp 125M', change: '+8%', color: 'success' },
    { title: 'Outstanding Payments', value: 'Rp 15.5M', change: '-12%', color: 'warning' },
    { title: 'This Month Collections', value: 'Rp 98.2M', change: '+15%', color: 'primary' },
    { title: 'Payment Rate', value: '87%', change: '+3%', color: 'info' },
  ];

  const recentPayments = [
    { id: 1, student: 'Ahmad Rahman', amount: 'Rp 500,000', type: 'SPP', date: '2024-12-07', status: 'Paid' },
    { id: 2, student: 'Siti Nurhaliza', amount: 'Rp 750,000', type: 'SPP + Building', date: '2024-12-06', status: 'Paid' },
    { id: 3, student: 'Budi Santoso', amount: 'Rp 500,000', type: 'SPP', date: '2024-12-05', status: 'Overdue' },
  ];

  const outstandingPayments = [
    { id: 1, student: 'Maya Sari', amount: 'Rp 500,000', type: 'SPP', dueDate: '2024-12-10', daysOverdue: 0 },
    { id: 2, student: 'Rizki Pratama', amount: 'Rp 1,250,000', type: 'SPP + Building', dueDate: '2024-11-15', daysOverdue: 22 },
    { id: 3, student: 'Lina Kusuma', amount: 'Rp 500,000', type: 'SPP', dueDate: '2024-12-01', daysOverdue: 6 },
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
            School Information Management System - Treasurer
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
          Treasurer Dashboard
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Welcome back, {userProfile?.displayName || 'Treasurer'}
        </Typography>

        {/* Financial Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {financialStats.map((stat, index) => (
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
          {/* Recent Payments */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Payments
                  </Typography>
                  <Button variant="contained" startIcon={<AddIcon />}>
                    Record Payment
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.student}</TableCell>
                          <TableCell>{payment.amount}</TableCell>
                          <TableCell>{payment.type}</TableCell>
                          <TableCell>
                            <Chip
                              label={payment.status}
                              size="small"
                              color={payment.status === 'Paid' ? 'success' : 'error'}
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

          {/* Outstanding Payments */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Outstanding Payments
                  </Typography>
                  <Button variant="outlined" startIcon={<PrintIcon />}>
                    Generate Notices
                  </Button>
                </Box>
                <List>
                  {outstandingPayments.map((payment) => (
                    <ListItem key={payment.id} divider>
                      <ListItemIcon>
                        <WarningIcon color={payment.daysOverdue > 0 ? 'error' : 'warning'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${payment.student} - ${payment.amount}`}
                        secondary={`${payment.type} | Due: ${payment.dueDate} ${payment.daysOverdue > 0 ? `(${payment.daysOverdue} days overdue)` : ''}`}
                      />
                      <Chip
                        label={payment.daysOverdue > 0 ? 'Overdue' : 'Due Soon'}
                        color={payment.daysOverdue > 0 ? 'error' : 'warning'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue Chart Placeholder */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Revenue Trend
                </Typography>
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body1" color="textSecondary">
                    Revenue Chart Placeholder
                  </Typography>
                  <TrendingUpIcon sx={{ ml: 1 }} />
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Monthly revenue has increased by 8% compared to last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button variant="contained" color="primary" startIcon={<PaymentIcon />}>
                    Record Payment
                  </Button>
                  <Button variant="contained" color="secondary" startIcon={<ReceiptIcon />}>
                    Generate Receipt
                  </Button>
                  <Button variant="outlined" startIcon={<AssessmentIcon />}>
                    Financial Reports
                  </Button>
                  <Button variant="outlined" startIcon={<PrintIcon />}>
                    Print Statements
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Summary (This Month)
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    SPP Collection Progress
                  </Typography>
                  <LinearProgress variant="determinate" value={87} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    87% of expected SPP collected
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Building Fund Progress
                  </Typography>
                  <LinearProgress variant="determinate" value={72} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    72% of building fund collected
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Other Fees Progress
                  </Typography>
                  <LinearProgress variant="determinate" value={95} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    95% of other fees collected
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
                  Recent Financial Activities
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="SPP payment received"
                      secondary="Ahmad Rahman paid Rp 500,000 via bank transfer - 2 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Overdue payment notice sent"
                      secondary="Payment reminders sent to 15 students - 4 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Monthly financial report generated"
                      secondary="November 2024 financial summary completed - 6 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Building fund payment received"
                      secondary="Siti Nurhaliza paid Rp 250,000 building fund - 1 day ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Payment gateway integration updated"
                      secondary="Bank integration updated for better transaction processing - 2 days ago"
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

export default TreasurerDashboard;
