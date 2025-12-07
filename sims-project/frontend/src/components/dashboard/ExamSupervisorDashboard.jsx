import React, { useState, useEffect } from 'react';
import { Container, Paper, Grid, Card, CardContent, CardHeader, Button, Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ExamSupervisorDashboard() {
  const [examData, setExamData] = useState([]);
  const [invigilationData, setInvigilationData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sampleExamData = [
    { exam: 'Midterm', scheduled: 10, completed: 8, pending: 2 },
    { exam: 'Monthly Test', scheduled: 15, completed: 14, pending: 1 },
    { exam: 'Final', scheduled: 10, completed: 0, pending: 10 },
  ];

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Exam Supervisor Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Exams
                </Typography>
                <Typography variant="h5">35</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completed
                </Typography>
                <Typography variant="h5">22</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  In Progress
                </Typography>
                <Typography variant="h5">3</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h5">10</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Exam Status Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <CardHeader title="Exam Status Overview" />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sampleExamData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="exam" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="scheduled" fill="#8884d8" />
                  <Bar dataKey="completed" fill="#82ca9d" />
                  <Bar dataKey="pending" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" color="primary">
                  Schedule Exam
                </Button>
                <Button variant="contained" color="primary">
                  Assign Invigilators
                </Button>
                <Button variant="contained" color="primary">
                  Mark Attendance
                </Button>
                <Button variant="contained" color="primary">
                  View Results
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default ExamSupervisorDashboard;
