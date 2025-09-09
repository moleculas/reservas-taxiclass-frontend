import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Fade,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  DirectionsCar,
  LocationOn,
  DateRange,
  Payment,
  CheckCircle,
  InfoOutlined,
  People
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AddressAutocomplete from '../components/common/AddressAutocomplete';
import reservationService from '../services/reservationService';

const NewReservationPage = () => {
  const navigate = useNavigate();

  // Estados para el formulario
  const [activeStep, setActiveStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState([0]); // Track de pasos visitados
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);

  // Estados para campos del aeropuerto (recogida)
  const [pickupAirportDetails, setPickupAirportDetails] = useState({
    terminal: '',
    flightNumber: '',
    origin: ''
  });

  // Estado para terminal del aeropuerto (destino)
  const [destinationAirportTerminal, setDestinationAirportTerminal] = useState('');

  // Nuevos estados para el paso 3
  const [numberOfPassengers, setNumberOfPassengers] = useState('');
  const [vehicleRequirements, setVehicleRequirements] = useState({
    childSeat: false,
    vehicle5to6: false,
    vehicle7: false
  });
  const [observations, setObservations] = useState('');

  // Configurar dayjs en español
  dayjs.locale('es');

  // Función para verificar si una ubicación es aeropuerto
  const isAirportLocation = (location) => {
    if (!location) return false;
    // Verificar si es aeropuerto por el tipo predefinido o por el nombre
    return (location.type === 'predefined' && location.name && location.name.toLowerCase().includes('aeropuerto')) ||
      (location.address && location.address.toLowerCase().includes('aeropuerto'));
  };

  // Pasos del formulario
  const steps = [
    { label: 'Fecha y hora', icon: <DateRange /> },
    { label: 'Detalles del viaje', icon: <LocationOn /> },
    { label: 'Pasajeros y requerimientos', icon: <People /> },
    { label: 'Confirmación', icon: <CheckCircle /> }
  ];

  // Función para verificar si un paso está completo
  const isStepComplete = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return selectedDateTime !== null &&
          selectedDateTime.isAfter(dayjs().add(3, 'hours'));
      case 1:
        // Validar ubicaciones básicas
        const hasLocations = pickupLocation !== null &&
          destinationLocation !== null &&
          pickupLocation.address !== destinationLocation.address;

        // Si el lugar de recogida es aeropuerto, validar campos adicionales
        if (hasLocations && isAirportLocation(pickupLocation)) {
          // Ya no validamos terminal, solo vuelo y origen
          const pickupValid = pickupAirportDetails.flightNumber !== '' &&
            pickupAirportDetails.origin !== '';
          if (!pickupValid) return false;
        }

        // Ya no validamos terminal de destino
        return hasLocations;
      case 2:
        // Para el paso 3, verificar que el número de pasajeros esté seleccionado
        // y que si hay 5+ pasajeros, se haya seleccionado el vehículo apropiado
        if (!numberOfPassengers) return false;
        if (numberOfPassengers === 7 && !vehicleRequirements.vehicle7) return false;
        if ((numberOfPassengers === 5 || numberOfPassengers === 6) &&
          !vehicleRequirements.vehicle5to6 && !vehicleRequirements.vehicle7) return false;
        return true;
      case 3:
        return false; // Por ahora, hasta que implementemos la confirmación
      default:
        return false;
    }
  };

  // Manejador para click en pasos
  const handleStepClick = (stepIndex) => {
    // Permitir navegar a cualquier paso que haya sido visitado
    if (visitedSteps.includes(stepIndex)) {
      // Si el paso al que quiere ir es posterior al actual,
      // verificar que los pasos intermedios estén completos
      if (stepIndex > activeStep) {
        let canNavigate = true;
        for (let i = activeStep; i < stepIndex; i++) {
          if (!isStepComplete(i)) {
            canNavigate = false;
            break;
          }
        }
        if (canNavigate) {
          setActiveStep(stepIndex);
        } else {
          toast.error('Completa los pasos anteriores primero');
        }
      } else {
        // Si es un paso anterior, navegar directamente
        setActiveStep(stepIndex);
      }
    }
  };

  // Manejador para cambios en los checkboxes
  const handleRequirementChange = (event) => {
    setVehicleRequirements({
      ...vehicleRequirements,
      [event.target.name]: event.target.checked
    });
  };

  // Manejadores de navegación
  const handleNext = async () => {
    // Validación según el paso actual
    if (activeStep === 0) {
      // Validar fecha y hora
      if (!selectedDateTime) {
        toast.error('Por favor, selecciona una fecha y hora para el servicio');
        return;
      }

      // Validar que sea al menos 3 horas en el futuro
      const minimumDateTime = dayjs().add(3, 'hours');
      if (selectedDateTime.isBefore(minimumDateTime)) {
        toast.error('El servicio debe solicitarse con al menos 3 horas de antelación');
        return;
      }
    }

    if (activeStep === 1) {
      // Validar detalles del viaje
      if (!pickupLocation) {
        toast.error('Por favor, selecciona el lugar de recogida');
        return;
      }
      if (!destinationLocation) {
        toast.error('Por favor, selecciona el lugar de destino');
        return;
      }
      if (pickupLocation.address === destinationLocation.address) {
        toast.error('El lugar de recogida y destino no pueden ser iguales');
        return;
      }

      // Validar campos del aeropuerto si aplica
      if (isAirportLocation(pickupLocation)) {
        // Ya no validamos terminal
        if (!pickupAirportDetails.flightNumber) {
          toast.error('Por favor, introduce el número de vuelo');
          return;
        }
        if (!pickupAirportDetails.origin) {
          toast.error('Por favor, introduce la procedencia del vuelo');
          return;
        }
      }

      // Ya no validamos terminal del destino
    }

    if (activeStep === 2) {
      // Validar pasajeros y requerimientos
      if (!numberOfPassengers) {
        toast.error('Por favor, indica el número de pasajeros');
        return;
      }

      // Nueva validación: no se pueden seleccionar ambos tipos de vehículo
      if (vehicleRequirements.vehicle5to6 && vehicleRequirements.vehicle7) {
        toast.error('Por favor, selecciona solo un tipo de vehículo: 5-6 plazas O 7 plazas, no ambos');
        return;
      }

      // Validación lógica: si hay 7 pasajeros, debe seleccionar vehículo de 7 plazas
      if (numberOfPassengers === 7 && !vehicleRequirements.vehicle7) {
        toast.error('Para 7 pasajeros es necesario seleccionar un vehículo de 7 plazas');
        return;
      }

      // Validación lógica: si hay 5-6 pasajeros, debe seleccionar vehículo de 5-6 o 7 plazas
      if ((numberOfPassengers === 5 || numberOfPassengers === 6) &&
        !vehicleRequirements.vehicle5to6 && !vehicleRequirements.vehicle7) {
        toast.error('Para 5-6 pasajeros es necesario seleccionar un vehículo de 5-6 plazas o mayor');
        return;
      }
    }

    // Si estamos en el último paso (confirmación), crear la reserva
    if (activeStep === 3) {
      setIsSubmitting(true);

      try {
        // Verificar que la fecha sea futura
        const now = dayjs();
        if (selectedDateTime.isBefore(now)) {
          toast.error('La fecha seleccionada está en el pasado');
          setIsSubmitting(false);
          return;
        }

        // Preparar datos para enviar
        const reservationData = {
          // Simplemente añadir el offset de timezone a la fecha seleccionada
          // No hacer conversión, solo formatear correctamente
          // IMPORTANTE: Auriga espera el formato sin : en el timezone ('+0200' no '+02:00')
          bookingDate: selectedDateTime.format('YYYY-MM-DDTHH:mm:ss') + '+0200',

          // Datos de recogida con el objeto Google Places completo
          pickupAddress: {
            type: isAirportLocation(pickupLocation) ? 'airport' : 'address',
            googlePlace: pickupLocation.googlePlace || pickupLocation,
            address: pickupLocation.address,
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
            // Campos específicos de aeropuerto
            ...(isAirportLocation(pickupLocation) && {
              terminal: pickupAirportDetails.terminal,
              flightNumber: pickupAirportDetails.flightNumber,
              flightOrigin: pickupAirportDetails.origin
            })
          },

          // Datos de destino con el objeto Google Places completo
          destinationAddress: {
            type: isAirportLocation(destinationLocation) ? 'airport' : 'address',
            googlePlace: destinationLocation.googlePlace || destinationLocation,
            address: destinationLocation.address,
            latitude: destinationLocation.latitude,
            longitude: destinationLocation.longitude,
            // Campo específico de aeropuerto
            ...(isAirportLocation(destinationLocation) && {
              terminal: destinationAirportTerminal
            })
          },

          // Detalles de pasajeros
          numberOfPassengers: numberOfPassengers,
          childSeat: vehicleRequirements.childSeat,
          vehicle56Seats: vehicleRequirements.vehicle5to6,
          vehicle7Seats: vehicleRequirements.vehicle7,

          // Observaciones
          specialInstructions: observations
        };

        // Llamar al servicio para crear la reserva
        const response = await reservationService.createReservation(reservationData);

        if (response.success) {
          toast.success('¡Reserva creada con éxito!');
          setCreatedReservation(response);
          // Avanzar al paso final
          const nextStep = activeStep + 1;
          setActiveStep(nextStep);
          if (!visitedSteps.includes(nextStep)) {
            setVisitedSteps([...visitedSteps, nextStep]);
          }
        } else {
          toast.error(response.message || 'Error al crear la reserva');
        }
      } catch (error) {
        console.error('Error al crear reserva:', error);

        // Mostrar toda la información de debug en la consola
        if (error.response?.data?.debug) {
          console.log('=== DEBUG INFO FROM BACKEND ===');
          console.log('Logs:', error.response.data.debug.logs);
          console.log('Booking Data:', error.response.data.debug.booking_data);
          console.log('Signature Info:', error.response.data.debug.signature_generation);
          console.log('Request Info:', error.response.data.debug.request);
          console.log('Response Info:', error.response.data.debug.response);
        }

        // Si hay respuesta de Auriga, mostrarla
        if (error.response?.data?.auriga_response) {
          console.log('=== AURIGA RESPONSE ===');
          console.log(error.response.data.auriga_response);
        }

        if (error.response?.data?.raw_response) {
          console.log('=== AURIGA RAW RESPONSE ===');
          console.log(error.response.data.raw_response);
        }

        // Mostrar mensaje de error más específico
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Error al crear la reserva. Por favor, intenta de nuevo.');
        }
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    const nextStep = activeStep + 1;
    setActiveStep(nextStep);

    // Añadir el nuevo paso a los visitados si no está ya
    if (!visitedSteps.includes(nextStep)) {
      setVisitedSteps([...visitedSteps, nextStep]);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setVisitedSteps([0]); // Resetear pasos visitados
    // Resetear todos los estados
    setSelectedDateTime(null);
    setPickupLocation(null);
    setDestinationLocation(null);
    setPickupAirportDetails({
      terminal: '',
      flightNumber: '',
      origin: ''
    });
    setDestinationAirportTerminal('');
    setNumberOfPassengers('');
    setVehicleRequirements({
      childSeat: false,
      vehicle5to6: false,
      vehicle7: false
    });
    setObservations('');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in timeout={300}>
          <Box>
            {/* Header */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                background: 'linear-gradient(135deg, #011850 0%, #334975 100%)',
                color: 'white',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  Nueva Reserva
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Completa los siguientes pasos para crear tu reserva
                </Typography>
              </Box>

              {/* Decoración de fondo */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'rgba(5, 217, 217, 0.1)',
                  zIndex: 0
                }}
              />
            </Paper>

            {/* Stepper */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={{
                  '& .MuiStepConnector-root': {
                    top: 20, // Centrar con iconos de 40px de altura
                  },
                  '& .MuiStepConnector-line': {
                    borderColor: '#bdbdbd',
                    borderTopWidth: 2,
                  },
                  '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                    borderColor: 'primary.main',
                  },
                  '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                {steps.map((step, index) => {
                  const isVisited = visitedSteps.includes(index);
                  const isClickable = isVisited && index !== activeStep;

                  return (
                    <Step
                      key={step.label}
                      sx={{
                        cursor: isClickable ? 'pointer' : 'default',
                        '& .MuiStepLabel-root': {
                          cursor: isClickable ? 'pointer' : 'default',
                        },
                        '& .MuiStepLabel-label': {
                          cursor: isClickable ? 'pointer' : 'default',
                        },
                        '& .MuiStepLabel-iconContainer': {
                          cursor: isClickable ? 'pointer' : 'default',
                        },
                        '&:hover': isClickable ? {
                          '& .MuiStepLabel-label': {
                            color: 'primary.main',
                          },
                          '& .step-icon-box': {
                            transform: 'scale(1.1)',
                          }
                        } : {}
                      }}
                      onClick={() => handleStepClick(index)}
                    >
                      <StepLabel
                        sx={{
                          cursor: isClickable ? 'pointer' : 'default',
                        }}
                        StepIconComponent={() => (
                          <Box
                            className="step-icon-box"
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: isVisited ? 'primary.main' : 'grey.300',
                              color: 'white',
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              zIndex: 1,
                              backgroundColor: isVisited ? 'primary.main' : 'grey.300',
                            }}
                          >
                            {step.icon}
                          </Box>
                        )}
                      >
                        {step.label}
                      </StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </Paper>

            {/* Contenido del formulario */}
            <Paper elevation={0} sx={{ p: 4, minHeight: 400, borderRadius: 2 }}>
              {activeStep === steps.length ? (
                // Paso final - Confirmación completada
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    ¡Reserva creada con éxito!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Tu reserva ha sido confirmada. Recibirás un email con los detalles.
                  </Typography>

                  {createdReservation && (
                    <Box sx={{ mt: 3, mb: 4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          backgroundColor: 'grey.50',
                          borderRadius: 2,
                          display: 'inline-block'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Número de reserva:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          #{createdReservation.bookingIdAuriga}
                        </Typography>
                        {createdReservation.serviceId && (
                          <Typography variant="caption" color="text.secondary">
                            Servicio: {createdReservation.serviceId}
                          </Typography>
                        )}
                      </Paper>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/dashboard')}
                      sx={{ minWidth: 160 }}
                    >
                      Ir al Dashboard
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleReset}
                      sx={{ minWidth: 160 }}
                    >
                      Crear otra reserva
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  {/* Contenido de cada paso */}
                  <Box sx={{ minHeight: 300, mb: 4 }}>
                    {activeStep === 0 && (
                      <Box>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                          ¿Cuándo necesitas el servicio?
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                          Selecciona la fecha y hora para tu trayecto
                        </Typography>

                        <Box sx={{ maxWidth: 400 }}>
                          <DateTimePicker
                            label="Fecha y hora del trayecto"
                            value={selectedDateTime}
                            onChange={(newValue) => {
                              console.log('Nueva fecha seleccionada:', newValue?.format());
                              setSelectedDateTime(newValue);
                            }}
                            minDateTime={dayjs().add(3, 'hours')}
                            format="DD/MM/YYYY HH:mm"
                            ampm={false}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '4px',
                                '& fieldset': {
                                  borderRadius: '4px',
                                },
                              },
                              '& .MuiInputBase-root': {
                                borderRadius: '4px',
                              },
                            }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                required: true,
                                helperText: selectedDateTime
                                  ? `Fecha seleccionada: ${selectedDateTime.format('DD/MM/YYYY HH:mm')} - Debe ser al menos 3 horas en el futuro`
                                  : "Selecciona una fecha y hora (mínimo 3 horas en el futuro)",
                                error: selectedDateTime && selectedDateTime.isBefore(dayjs().add(3, 'hours')),
                                InputProps: {
                                  sx: {
                                    borderRadius: '4px',
                                  },
                                },
                                sx: {
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '4px',
                                    '& fieldset': {
                                      borderRadius: '4px',
                                    },
                                  },
                                },
                              },
                            }}
                          />
                        </Box>

                        {/* Nota informativa */}
                        <Alert
                          severity="info"
                          icon={<InfoOutlined />}
                          sx={{ mt: 3, maxWidth: 600 }}
                        >
                          <Typography variant="body2">
                            Los servicios deben solicitarse con un mínimo de <strong>3 horas de antelación</strong>.
                            Esto nos permite garantizar la disponibilidad y calidad del servicio.
                          </Typography>
                        </Alert>
                      </Box>
                    )}

                    {activeStep === 1 && (
                      <Box>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                          ¿Dónde necesitas el servicio?
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                          Indica los lugares de recogida y destino
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
                          {/* Lugar de recogida */}
                          <AddressAutocomplete
                            label="Lugar de recogida"
                            placeholder="Busca una dirección o selecciona un lugar frecuente"
                            value={pickupLocation}
                            onChange={(newLocation) => {
                              setPickupLocation(newLocation);
                              // Si no es aeropuerto, limpiar los detalles del aeropuerto
                              if (!isAirportLocation(newLocation)) {
                                setPickupAirportDetails({
                                  terminal: '',
                                  flightNumber: '',
                                  origin: ''
                                });
                              }
                            }}
                            required
                            helperText="Dirección donde te recogeremos"
                            restrictToArea={true}  // Activar restricción de área
                          />

                          {/* Campos adicionales para aeropuerto */}
                          {isAirportLocation(pickupLocation) && (
                            <Fade in timeout={300}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ml: 2, mb: 1 }}>
                                {/* Terminal - OCULTO */}
                                <FormControl
                                  sx={{
                                    display: 'none',  // OCULTO
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '4px',
                                    }
                                  }}
                                >
                                  <InputLabel id="pickup-terminal-label">Terminal</InputLabel>
                                  <Select
                                    labelId="pickup-terminal-label"
                                    id="pickup-terminal"
                                    value={pickupAirportDetails.terminal}
                                    label="Terminal"
                                    onChange={(e) => setPickupAirportDetails({
                                      ...pickupAirportDetails,
                                      terminal: e.target.value
                                    })}
                                    sx={{
                                      borderRadius: '4px',
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderRadius: '4px',
                                      }
                                    }}
                                  >
                                    <MenuItem value="">Selecciona terminal</MenuItem>
                                    <MenuItem value="T1">Terminal 1</MenuItem>
                                    <MenuItem value="PA">Puente Aéreo</MenuItem>
                                    <MenuItem value="T2A">Terminal 2A</MenuItem>
                                    <MenuItem value="T2B">Terminal 2B</MenuItem>
                                    <MenuItem value="T2C">Terminal 2C</MenuItem>
                                    <MenuItem value="TC">Terminal Corporativa</MenuItem>
                                  </Select>
                                </FormControl>

                                {/* Número de vuelo */}
                                <TextField
                                  required
                                  label="Número de vuelo"
                                  value={pickupAirportDetails.flightNumber}
                                  onChange={(e) => setPickupAirportDetails({
                                    ...pickupAirportDetails,
                                    flightNumber: e.target.value
                                  })}
                                  placeholder="Ej: IB3252"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '4px',
                                    },
                                  }}
                                />

                                {/* Procedencia */}
                                <TextField
                                  required
                                  label="Procedencia"
                                  value={pickupAirportDetails.origin}
                                  onChange={(e) => setPickupAirportDetails({
                                    ...pickupAirportDetails,
                                    origin: e.target.value
                                  })}
                                  placeholder="Ej: Madrid, París, Londres..."
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '4px',
                                    },
                                  }}
                                />
                              </Box>
                            </Fade>
                          )}

                          {/* Lugar de destino */}
                          <AddressAutocomplete
                            label="Lugar de destino"
                            placeholder="Busca una dirección o selecciona un lugar frecuente"
                            value={destinationLocation}
                            onChange={(newLocation) => {
                              setDestinationLocation(newLocation);
                              // Si no es aeropuerto, limpiar el terminal
                              if (!isAirportLocation(newLocation)) {
                                setDestinationAirportTerminal('');
                              }
                            }}
                            required
                            helperText="Dirección donde te llevaremos"
                          />

                          {/* Campo de terminal para destino aeropuerto - OCULTO */}
                          {isAirportLocation(destinationLocation) && (
                            <Fade in timeout={300}>
                              <Box sx={{ ml: 2, mb: 1, display: 'none' }}>  {/* OCULTO */}
                                <FormControl
                                  fullWidth
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '4px',
                                    }
                                  }}
                                >
                                  <InputLabel id="destination-terminal-label">Terminal</InputLabel>
                                  <Select
                                    labelId="destination-terminal-label"
                                    id="destination-terminal"
                                    value={destinationAirportTerminal}
                                    label="Terminal"
                                    onChange={(e) => setDestinationAirportTerminal(e.target.value)}
                                    sx={{
                                      borderRadius: '4px',
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderRadius: '4px',
                                      }
                                    }}
                                  >
                                    <MenuItem value="">Selecciona terminal</MenuItem>
                                    <MenuItem value="T1">Terminal 1</MenuItem>
                                    <MenuItem value="PA">Puente Aéreo</MenuItem>
                                    <MenuItem value="T2A">Terminal 2A</MenuItem>
                                    <MenuItem value="T2B">Terminal 2B</MenuItem>
                                    <MenuItem value="T2C">Terminal 2C</MenuItem>
                                    <MenuItem value="TC">Terminal Corporativa</MenuItem>
                                  </Select>
                                </FormControl>
                              </Box>
                            </Fade>
                          )}
                        </Box>

                        {/* Información adicional */}
                        <Alert
                          severity="info"
                          icon={<InfoOutlined />}
                          sx={{ mt: 3, maxWidth: 600 }}
                        >
                          <Typography variant="body2">
                            Puedes seleccionar lugares frecuentes como el Aeropuerto o buscar cualquier dirección.
                          </Typography>
                        </Alert>
                      </Box>
                    )}

                    {activeStep === 2 && (
                      <Box>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                          ¿Cuántos pasajeros y qué necesitas?
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                          Indica el número de pasajeros y cualquier requerimiento especial
                        </Typography>

                        <Box sx={{ maxWidth: 600 }}>
                          {/* Número de pasajeros */}
                          <FormControl
                            fullWidth
                            required
                            sx={{
                              mb: 4,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '4px',
                              }
                            }}
                          >
                            <InputLabel id="passengers-label">Número de pasajeros</InputLabel>
                            <Select
                              labelId="passengers-label"
                              id="passengers"
                              value={numberOfPassengers}
                              label="Número de pasajeros"
                              onChange={(e) => setNumberOfPassengers(e.target.value)}
                              sx={{
                                borderRadius: '4px',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderRadius: '4px',
                                }
                              }}
                            >
                              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                                <MenuItem key={num} value={num}>
                                  {num} {num === 1 ? 'pasajero' : 'pasajeros'}
                                </MenuItem>
                              ))}
                            </Select>
                            <FormHelperText>Incluye a todos los ocupantes del vehículo</FormHelperText>
                          </FormControl>

                          {/* Requerimientos del vehículo */}
                          <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
                              ¿Necesitas requerimientos del vehículo?
                            </Typography>
                            <FormGroup>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={vehicleRequirements.childSeat}
                                    onChange={handleRequirementChange}
                                    name="childSeat"
                                  />
                                }
                                label="Alzador infantil"
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={vehicleRequirements.vehicle5to6}
                                    onChange={handleRequirementChange}
                                    name="vehicle5to6"
                                  />
                                }
                                label="Vehículo 5-6 pax (Mercedes Clase V)"
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={vehicleRequirements.vehicle7}
                                    onChange={handleRequirementChange}
                                    name="vehicle7"
                                  />
                                }
                                label="Vehículo 7 pax (Mercedes Clase V)"
                              />
                            </FormGroup>
                          </Box>

                          {/* Observaciones */}
                          <Box>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
                              Observaciones
                            </Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={4}
                              placeholder="¿Hay algo que debamos saber?"
                              value={observations}
                              onChange={(e) => setObservations(e.target.value)}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '4px',
                                  '& fieldset': {
                                    borderRadius: '4px',
                                  },
                                },
                              }}
                            />
                            <FormHelperText>
                              Por ejemplo: equipaje extra, paradas adicionales, preferencias especiales...
                            </FormHelperText>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {activeStep === 3 && (
                      <Box>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                          Revisa y confirma tu reserva
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                          Por favor, verifica que todos los detalles sean correctos antes de confirmar
                        </Typography>

                        <Box sx={{ display: 'grid', gap: 3, maxWidth: 800 }}>
                          {/* Card de Fecha y Hora */}
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  bgcolor: 'primary.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 2
                                }}
                              >
                                <DateRange sx={{ color: 'white' }} />
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Fecha y hora del servicio
                              </Typography>
                            </Box>
                            <Box sx={{ ml: 7, position: 'relative' }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {selectedDateTime ? selectedDateTime.format('dddd, D [de] MMMM [de] YYYY') : ''}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {selectedDateTime ? selectedDateTime.format('HH:mm') : ''} horas
                              </Typography>
                            </Box>
                          </Paper>

                          {/* Card de Ubicaciones */}
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  bgcolor: 'secondary.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 2
                                }}
                              >
                                <LocationOn sx={{ color: 'white' }} />
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Detalles del trayecto
                              </Typography>
                            </Box>

                            <Box sx={{ ml: 7, position: 'relative' }}>
                              {/* Lugar de recogida */}
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                                {/* Punto de origen */}
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    left: -25,
                                    top: 8,
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    zIndex: 2
                                  }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    Lugar de recogida
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                                    {pickupLocation?.name || pickupLocation?.address || ''}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Línea conectora */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: -20,
                                  top: 13,  // Comienza justo después del centro del primer punto
                                  width: 2,
                                  height: 85,  // Aumentada para llegar exactamente al segundo punto
                                  bgcolor: 'grey.300',
                                  zIndex: 1
                                }}
                              />

                              {/* Lugar de destino */}
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', position: 'relative', mt: 3 }}>
                                {/* Punto de destino */}
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    left: -25,
                                    top: 8,
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: 'secondary.main',
                                    zIndex: 2
                                  }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    Lugar de destino
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {destinationLocation?.name || destinationLocation?.address || ''}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Paper>

                          {/* Card de Pasajeros y Requerimientos */}
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  bgcolor: 'info.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 2
                                }}
                              >
                                <People sx={{ color: 'white' }} />
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Detalles del servicio
                              </Typography>
                            </Box>

                            <Box sx={{ ml: 7 }}>
                              {/* Número de pasajeros */}
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {numberOfPassengers} {numberOfPassengers === 1 ? 'pasajero' : 'pasajeros'}
                                </Typography>
                              </Box>

                              {/* Requerimientos especiales */}
                              {(vehicleRequirements.childSeat || vehicleRequirements.vehicle5to6 || vehicleRequirements.vehicle7) && (
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                    Requerimientos especiales:
                                  </Typography>
                                  {vehicleRequirements.childSeat && (
                                    <Chip
                                      label="Alzador infantil"
                                      size="small"
                                      sx={{ mr: 1, mb: 1 }}
                                    />
                                  )}
                                  {vehicleRequirements.vehicle5to6 && (
                                    <Chip
                                      label="Vehículo 5-6 pax"
                                      size="small"
                                      sx={{ mr: 1, mb: 1 }}
                                    />
                                  )}
                                  {vehicleRequirements.vehicle7 && (
                                    <Chip
                                      label="Vehículo 7 pax"
                                      size="small"
                                      sx={{ mr: 1, mb: 1 }}
                                    />
                                  )}
                                </Box>
                              )}
                            </Box>
                          </Paper>

                          {/* Card de Observaciones (solo si hay) */}
                          {observations && observations.trim() !== '' && (
                            <Paper
                              elevation={0}
                              sx={{
                                p: 3,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                background: 'linear-gradient(135deg, #fffbf0 0%, #ffffff 100%)'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    bgcolor: 'warning.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2
                                  }}
                                >
                                  <InfoOutlined sx={{ color: 'white' }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    Observaciones adicionales
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {observations}
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          )}

                          {/* Nota informativa */}
                          <Alert
                            severity="info"
                            icon={<InfoOutlined />}
                            sx={{ mt: 2 }}
                          >
                            <Typography variant="body2">
                              Al confirmar la reserva, recibirás un email con todos los detalles y el conductor se pondrá en contacto contigo antes del servicio.
                            </Typography>
                          </Alert>
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Botones de navegación */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      sx={{ minWidth: 120 }}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={isSubmitting}
                      sx={{
                        minWidth: activeStep === steps.length - 1 ? 160 : 120,
                        bgcolor: activeStep === steps.length - 1 ? 'success.main' : 'primary.main',
                        '&:hover': {
                          bgcolor: activeStep === steps.length - 1 ? 'success.dark' : 'primary.dark',
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        activeStep === steps.length - 1 ? 'Realizar Reserva' : 'Siguiente'
                      )}
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Box>
        </Fade>
      </Container>
    </LocalizationProvider>
  );
};

export default NewReservationPage;