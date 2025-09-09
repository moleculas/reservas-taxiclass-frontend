import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { 
  LocationOn, 
  AccessTime, 
  Person, 
  MoreVert,
  FlightTakeoff,
  FlightLand,
  DirectionsCar,
  AirlineSeatReclineExtra,
  ChildCare,
  Visibility,
  ContentCopy,
  Download,
  Cancel,
  CheckCircle
} from '@mui/icons-material';
import { format, parseISO, isPast, isFuture, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const ReservationCard = ({ 
  reservation, 
  onViewDetails, 
  onCancelReservation,
  onDownloadReceipt 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  
  const bookingDate = parseISO(reservation.booking_date);
  const pickupAddress = reservation.pickup_address;
  const destinationAddress = reservation.destination_address;
  const passengersDetails = reservation.passengers_details;

  // Determinar el estado de la reserva
  const getReservationStatus = () => {
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

  const status = getReservationStatus();
  const isCancellable = isFuture(bookingDate) && reservation.status !== 'cancelled';

  // Manejar menú de opciones
  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Copiar referencia al portapapeles
  const handleCopyReference = () => {
    navigator.clipboard.writeText(reservation.booking_id_auriga)
      .then(() => {
        toast.success('Referencia copiada al portapapeles');
      })
      .catch(() => {
        toast.error('Error al copiar la referencia');
      });
    handleMenuClose();
  };

  // Ver detalles
  const handleViewDetails = () => {
    onViewDetails(reservation);
    handleMenuClose();
  };

  // Descargar comprobante
  const handleDownloadReceipt = () => {
    onDownloadReceipt(reservation);
    handleMenuClose();
  };

  // Abrir diálogo de cancelación
  const handleOpenCancelDialog = () => {
    setCancelDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
  };

  // Confirmar cancelación
  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await onCancelReservation(reservation);
      handleCloseCancelDialog();
    } catch (error) {
      console.error('Error al cancelar:', error);
    } finally {
      setCancelling(false);
    }
  };

  // Obtener icono según tipo de dirección
  const getLocationIcon = (type) => {
    if (type === 'airport') return <FlightTakeoff fontSize="small" />;
    if (type === 'train_station') return <DirectionsCar fontSize="small" />;
    return <LocationOn fontSize="small" />;
  };

  // Formatear dirección para mostrar
  const formatAddress = (address) => {
    if (!address) return 'Sin destino especificado';
    
    // Si es un lugar predefinido, mostrar su nombre
    if (address.type !== 'address' && address.address) {
      return address.address;
    }
    
    // Si no, construir la dirección
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.bldgNumber) parts.push(address.bldgNumber);
    if (address.locality && address.locality !== address.town) parts.push(address.locality);
    if (address.town) parts.push(address.town);
    
    return parts.join(', ') || address.address || 'Dirección';
  };

  return (
    <React.Fragment>
      <Card 
        sx={{ 
          mb: 2, 
          boxShadow: 2,
          transition: 'all 0.3s',
          cursor: 'pointer',
          opacity: reservation.status === 'cancelled' ? 0.7 : 1,
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)'
          }
        }}
        onClick={() => onViewDetails(reservation)}
      >
        <CardContent>
          {/* Header con fecha y estado */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTime color="action" />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {format(bookingDate, "EEEE d 'de' MMMM", { locale: es })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(bookingDate, 'HH:mm')} h
                  </Typography>
                </Box>
              </Box>
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
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary">
                #{reservation.booking_id_auriga}
              </Typography>
              <Tooltip title="Más opciones">
                <IconButton size="small" onClick={handleMenuClick}>
                  <MoreVert />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Trayecto */}
          <Box>
            {/* Origen */}
            <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
              <Box 
                sx={{ 
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 24
                }}
              >
                {getLocationIcon(pickupAddress.type)}
              </Box>
              <Box flex={1}>
                <Typography variant="body2" fontWeight="medium">
                  Recogida
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatAddress(pickupAddress)}
                </Typography>
                {pickupAddress.type === 'airport' && pickupAddress.terminal && (
                  <Typography variant="caption" color="text.secondary">
                    Terminal {pickupAddress.terminal}
                    {pickupAddress.flight_number && ` - Vuelo ${pickupAddress.flight_number}`}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Línea conectora */}
            {destinationAddress && (
              <Box 
                sx={{ 
                  ml: 1.5,
                  borderLeft: '2px dashed',
                  borderColor: 'divider',
                  height: 20,
                  mb: 1
                }} 
              />
            )}

            {/* Destino */}
            {destinationAddress && (
              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <Box 
                  sx={{ 
                    color: 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 24
                  }}
                >
                  {destinationAddress.type === 'airport' ? 
                    <FlightLand fontSize="small" /> : 
                    <LocationOn fontSize="small" />
                  }
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight="medium">
                    Destino
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatAddress(destinationAddress)}
                  </Typography>
                  {destinationAddress.type === 'airport' && destinationAddress.terminal && (
                    <Typography variant="caption" color="text.secondary">
                      Terminal {destinationAddress.terminal}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>

          {/* Detalles de pasajeros */}
          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Person fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {passengersDetails.number_of_passengers} pasajero{passengersDetails.number_of_passengers !== 1 ? 's' : ''}
              </Typography>
            </Box>
            
            {passengersDetails.child_seat && (
              <Tooltip title="Alzador infantil">
                <ChildCare fontSize="small" color="action" />
              </Tooltip>
            )}
            
            {(passengersDetails.vehicle_5_6_seats || passengersDetails.vehicle_7_seats) && (
              <Tooltip title={passengersDetails.vehicle_7_seats ? 'Vehículo 7 plazas' : 'Vehículo 5-6 plazas'}>
                <AirlineSeatReclineExtra fontSize="small" color="action" />
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Menú de opciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 180,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
            }
          }
        }}
      >
        {[
          {
            onClick: handleViewDetails,
            icon: <Visibility fontSize="small" />,
            text: 'Ver detalles'
          },
          {
            onClick: handleCopyReference,
            icon: <ContentCopy fontSize="small" />,
            text: 'Copiar referencia'
          },
          {
            onClick: handleDownloadReceipt,
            icon: <Download fontSize="small" />,
            text: 'Descargar comprobante'
          }
        ].map((item, index) => (
          <MenuItem key={index} onClick={item.onClick}>
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText>{item.text}</ListItemText>
          </MenuItem>
        ))}
        
        {isCancellable && [
          <Divider key="divider" />,
          <MenuItem key="cancel" onClick={handleOpenCancelDialog} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Cancel fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Cancelar reserva</ListItemText>
          </MenuItem>
        ]}
      </Menu>

      {/* Diálogo de confirmación de cancelación */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          ¿Cancelar reserva?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas cancelar la reserva <strong>#{reservation.booking_id_auriga}</strong>?
          </DialogContentText>
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              <strong>Fecha:</strong> {format(bookingDate, "d 'de' MMMM 'a las' HH:mm", { locale: es })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Trayecto:</strong> {formatAddress(pickupAddress)} → {formatAddress(destinationAddress) || 'Sin destino'}
            </Typography>
          </Box>
          <Box mt={2} p={2} bgcolor="warning.light" borderRadius={1}>
            <Typography variant="body2" color="warning.dark">
              Esta acción no se puede deshacer. La reserva será cancelada permanentemente.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} disabled={cancelling}>
            No, mantener
          </Button>
          <Button 
            onClick={handleConfirmCancel} 
            color="error" 
            variant="contained"
            disabled={cancelling}
          >
            {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default ReservationCard;
