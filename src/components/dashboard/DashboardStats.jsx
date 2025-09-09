import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { 
  EventAvailable, 
  CheckCircle, 
  Schedule,
  DirectionsCar 
} from '@mui/icons-material';

const DashboardStats = ({ stats }) => {
  const statItems = [
    {
      icon: <Schedule sx={{ fontSize: 40 }} />,
      value: stats.upcoming || 0,
      label: 'Próximas',
      color: 'primary.main',
      bgColor: 'primary.light'
    },
    {
      icon: <EventAvailable sx={{ fontSize: 40 }} />,
      value: stats.today || 0,
      label: 'Hoy',
      color: 'info.main',
      bgColor: 'info.light'
    },
    {
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      value: stats.completed || 0,
      label: 'Completadas',
      color: 'success.main',
      bgColor: 'success.light'
    },
    {
      icon: <DirectionsCar sx={{ fontSize: 40 }} />,
      value: stats.total || 0,
      label: 'Total',
      color: 'secondary.main',
      bgColor: 'secondary.light'
    }
  ];

  return (
    <Grid container spacing={2}>
      {statItems.map((item, index) => (
        <Grid item xs={6} sm={3} key={index}>
          <Paper
            sx={{
              p: 2.5,
              height: '100%',
              background: `linear-gradient(135deg, ${item.bgColor}15 0%, ${item.bgColor}30 100%)`,
              border: '1px solid',
              borderColor: item.bgColor,
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3
              }
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography 
                  variant="h4" 
                  fontWeight="bold" 
                  sx={{ color: item.color }}
                >
                  {item.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {item.label}
                </Typography>
              </Box>
              <Box sx={{ color: item.color, opacity: 0.3 }}>
                {item.icon}
              </Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardStats;
