import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import ReservationCard from './ReservationCard';

const ReservationsList = ({ 
  reservations, 
  loading, 
  error, 
  onViewDetails,
  onCancelReservation,
  onDownloadReceipt,
  emptyMessage = "No hay reservas para mostrar" 
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error al cargar las reservas. Por favor, intenta de nuevo.
      </Alert>
    );
  }

  if (!reservations || reservations.length === 0) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 6,
          px: 2,
          bgcolor: 'grey.50',
          borderRadius: 2
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation.id}
          reservation={reservation}
          onViewDetails={onViewDetails}
          onCancelReservation={onCancelReservation}
          onDownloadReceipt={onDownloadReceipt}
        />
      ))}
    </Box>
  );
};

export default ReservationsList;
