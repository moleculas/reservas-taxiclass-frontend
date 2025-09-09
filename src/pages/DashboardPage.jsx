import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Tabs, 
  Tab,
  Paper,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Divider,
  Grid,
  Tooltip
} from '@mui/material';
import { 
  Add, 
  Close,
  LocationOn,
  AccessTime,
  Person,
  EventNote,
  AirlineSeatReclineExtra,
  ChildCare,
  DirectionsCar
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { parseISO, format, isPast, isFuture, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

import DashboardStats from '../components/dashboard/DashboardStats';
import ReservationsList from '../components/dashboard/ReservationsList';
import Pagination from '../components/common/Pagination';
import reservationService from '../services/reservationService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    upcoming: 0,
    today: 0,
    completed: 0,
    total: 0
  });
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10,
    has_next: false,
    has_previous: false
  });
  const [currentPages, setCurrentPages] = useState({
    upcoming: 1,
    past: 1,
    all: 1
  });

  // Cargar reservas cuando cambie el tab o la página
  useEffect(() => {
    loadReservations();
  }, [tabValue, currentPages]);

  // Cargar estadísticas generales al montar
  useEffect(() => {
    loadStats();
  }, []);

  const getFilterFromTab = (tab) => {
    switch (tab) {
      case 0: return 'upcoming';
      case 1: return 'past';
      case 2: return 'all';
      default: return 'all';
    }
  };

  const getCurrentPageKey = () => {
    return getFilterFromTab(tabValue);
  };

  // Función para determinar el estado de una reserva
  const getReservationStatus = (reservation) => {
    const bookingDate = parseISO(reservation.booking_date);
    
    if (reservation.status === 'cancelled') {
      return { label: 'Cancelada', color: 'error' };
    } else if (isPast(bookingDate)) {
      return { label: 'Completada', color: 'default' };
    } else if (isToday(bookingDate)) {
      return { label: 'Hoy', color: 'primary' };
    } else {
      return { label: 'Próxima', color: 'success' };
    }
  };

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filter = getFilterFromTab(tabValue);
      const currentPage = currentPages[filter];
      
      const response = await reservationService.getUserReservations(
        currentPage,
        10, // items por página
        filter
      );
      
      if (response.success) {
        setReservations(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Error cargando reservas:', err);
      setError(err.message);
      toast.error('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Cargar estadísticas de cada tipo
      const [upcomingRes, pastRes, allRes] = await Promise.all([
        reservationService.getUserReservations(1, 1, 'upcoming'),
        reservationService.getUserReservations(1, 1, 'past'),
        reservationService.getUserReservations(1, 1, 'all')
      ]);

      const now = new Date();
      let today = 0;
      let completed = pastRes.pagination.total_items;
      let upcoming = upcomingRes.pagination.total_items;
      
      // Contar las de hoy revisando las próximas
      if (upcomingRes.data.length > 0) {
        // Necesitaríamos una llamada específica para las de hoy
        // Por ahora estimamos basado en los datos disponibles
      }

      setStats({
        upcoming,
        today,
        completed,
        total: allRes.pagination.total_items
      });
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Resetear a página 1 al cambiar de tab si estamos en una página diferente
    const filter = getFilterFromTab(newValue);
    if (currentPages[filter] !== 1) {
      setCurrentPages(prev => ({
        ...prev,
        [filter]: 1
      }));
    }
  };

  const handlePageChange = (page) => {
    const filter = getCurrentPageKey();
    setCurrentPages(prev => ({
      ...prev,
      [filter]: page
    }));
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewReservation = () => {
    navigate('/new-reservation');
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setDetailsDialogOpen(true);
  };

  const handleCancelReservation = async (reservation) => {
    try {
      const response = await reservationService.cancelReservation(reservation.booking_id_auriga);
      if (response.success) {
        toast.success('Reserva cancelada exitosamente');
        // Recargar las reservas y estadísticas
        loadReservations();
        loadStats();
      }
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
      toast.error('Error al cancelar la reserva');
    }
  };

  const handleDownloadReceipt = async (reservation) => {
    try {
      const response = await reservationService.downloadReceipt(reservation.booking_id_auriga);
      if (response.success) {
        // Crear un blob con el HTML
        const blob = new Blob([response.html], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        
        // Crear un enlace temporal y hacer click
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename || `reserva_${reservation.booking_id_auriga}.html`;
        document.body.appendChild(a);
        a.click();
        
        // Limpiar
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Comprobante descargado');
      }
    } catch (error) {
      console.error('Error al descargar el comprobante:', error);
      toast.error('Error al descargar el comprobante');
    }
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setTimeout(() => setSelectedReservation(null), 300);
  };

  // Función auxiliar para formatear direcciones
  const formatAddress = (address) => {
    if (!address) return 'Sin especificar';
    
    if (address.type !== 'address' && address.address) {
      return address.address;
    }
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.bldgNumber) parts.push(address.bldgNumber);
    if (address.locality && address.locality !== address.town) parts.push(address.locality);
    if (address.town) parts.push(address.town);
    
    return parts.join(', ') || address.address || 'Dirección';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header con saludo */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Hola, {user?.name?.split(' ')[0]}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aquí puedes ver y gestionar todas tus reservas
        </Typography>
      </Box>

      {/* Estadísticas */}
      <Box mb={4}>
        <DashboardStats stats={stats} />
      </Box>

      {/* Tabs y lista de reservas */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Próximas (${stats.upcoming})`} />
            <Tab label={`Pasadas (${stats.completed})`} />
            <Tab label={`Todas (${stats.total})`} />
          </Tabs>
        </Box>

        <ReservationsList
          reservations={reservations}
          loading={loading}
          error={error}
          onViewDetails={handleViewDetails}
          onCancelReservation={handleCancelReservation}
          onDownloadReceipt={handleDownloadReceipt}
          emptyMessage={
            tabValue === 0 
              ? "No tienes reservas próximas" 
              : tabValue === 1 
              ? "No tienes reservas pasadas"
              : "No tienes reservas"
          }
        />
        
        {/* Paginación */}
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          totalItems={pagination.total_items}
          itemsPerPage={pagination.items_per_page}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </Paper>

      {/* Botón flotante para nueva reserva */}
      <Tooltip title="Nueva Reserva" placement="left">
        <Fab
          color="primary"
          aria-label="nueva reserva"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            boxShadow: 4
          }}
          onClick={handleNewReservation}
        >
          <Add />
        </Fab>
      </Tooltip>

      {/* Dialog de detalles de reserva */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
      >
        {selectedReservation && (() => {
          const status = getReservationStatus(selectedReservation);
          return (
            <>
              <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h6">
                      Detalles de la Reserva
                    </Typography>
                    <Chip 
                      label={status.label} 
                      color={status.color} 
                      size="small" 
                      sx={{ 
                        fontWeight: 'medium',
                        ...(status.color === 'success' && {
                          color: 'white'
                        })
                      }}
                    />
                  </Box>
                  <IconButton onClick={handleCloseDetails} size="small">
                    <Close />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                {/* Información de la reserva */}
                <Box mb={3}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <EventNote color="primary" />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Reserva #{selectedReservation.booking_id_auriga}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2">
                          {format(parseISO(selectedReservation.booking_date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" ml={4}>
                        {format(parseISO(selectedReservation.booking_date), 'HH:mm')} horas
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Trayecto */}
                <Box mb={3}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Trayecto
                  </Typography>
                  
                  {/* Origen */}
                  <Box display="flex" alignItems="flex-start" gap={1} mb={2}>
                    <LocationOn color="primary" />
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        Recogida
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatAddress(selectedReservation.pickup_address)}
                      </Typography>
                      {selectedReservation.pickup_address.type === 'airport' && (
                        <Box mt={0.5}>
                          {selectedReservation.pickup_address.terminal && (
                            <Chip 
                              label={`Terminal ${selectedReservation.pickup_address.terminal}`} 
                              size="small" 
                              sx={{ mr: 1 }}
                            />
                          )}
                          {selectedReservation.pickup_address.flight_number && (
                            <Chip 
                              label={`Vuelo ${selectedReservation.pickup_address.flight_number}`} 
                              size="small" 
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Destino */}
                  {selectedReservation.destination_address && (
                    <Box display="flex" alignItems="flex-start" gap={1}>
                      <LocationOn color="error" />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          Destino
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatAddress(selectedReservation.destination_address)}
                        </Typography>
                        {selectedReservation.destination_address.type === 'airport' && 
                         selectedReservation.destination_address.terminal && (
                          <Box mt={0.5}>
                            <Chip 
                              label={`Terminal ${selectedReservation.destination_address.terminal}`} 
                              size="small" 
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Detalles del servicio */}
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Detalles del Servicio
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2">
                          {selectedReservation.passengers_details.number_of_passengers} pasajero
                          {selectedReservation.passengers_details.number_of_passengers !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {selectedReservation.passengers_details.child_seat && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <ChildCare fontSize="small" color="action" />
                          <Typography variant="body2">
                            Alzador infantil
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {(selectedReservation.passengers_details.vehicle_5_6_seats || 
                      selectedReservation.passengers_details.vehicle_7_seats) && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AirlineSeatReclineExtra fontSize="small" color="action" />
                          <Typography variant="body2">
                            {selectedReservation.passengers_details.vehicle_7_seats 
                              ? 'Vehículo 7 plazas' 
                              : 'Vehículo 5-6 plazas'
                            }
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {selectedReservation.provider_name && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <DirectionsCar fontSize="small" color="action" />
                          <Typography variant="body2">
                            {selectedReservation.provider_name}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  {selectedReservation.special_instructions && (
                    <Box mt={2}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Observaciones:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedReservation.special_instructions}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDetails}>
                  Cerrar
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Container>
  );
};

export default DashboardPage;