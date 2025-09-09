import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Chip,
  Alert,
  Grid,
  useTheme,
  useMediaQuery,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CalendarToday,
  LocationOn,
  Person,
  CheckCircle,
  Cancel,
  GetApp,
  ContentCopy,
  Dashboard,
  AccountCircle,
  Security,
  Help,
  Phone,
  Email,
  AccessTime,
  DirectionsCar,
  ChildCare,
  AirlineSeatReclineExtra,
  Warning,
  Info,
  ExpandMore,
} from '@mui/icons-material';

const HelpPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const sections = [
    'Primeros Pasos',
    'Hacer una Reserva',
    'Gestionar Reservas',
    'Mi Perfil',
    'Preguntas Frecuentes'
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          📚 Guía de Usuario
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Todo lo que necesitas saber para usar el sistema de reservas TaxiClass
        </Typography>
      </Box>

      {/* Tabs de navegación */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
            }
          }}
        >
          {sections.map((section, index) => (
            <Tab key={index} label={section} />
          ))}
        </Tabs>
      </Paper>

      {/* Contenido */}
      <Box>
        {/* Primeros Pasos */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <AccountCircle color="primary" fontSize="large" />
                    <Typography variant="h6" fontWeight="bold">
                      Iniciar Sesión
                    </Typography>
                  </Box>
                  <Typography paragraph>
                    Para acceder al sistema necesitas:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Email fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Tu correo electrónico registrado" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Security fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Tu contraseña" />
                    </ListItem>
                  </List>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Si tienes activada la verificación en dos pasos, recibirás un código en tu email
                  </Alert>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Dashboard color="primary" fontSize="large" />
                    <Typography variant="h6" fontWeight="bold">
                      Panel Principal
                    </Typography>
                  </Box>
                  <Typography paragraph>
                    Al entrar verás:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Resumen de tus reservas" 
                        secondary="Próximas, de hoy y completadas"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Lista de reservas" 
                        secondary="Organizadas por pestañas para fácil acceso"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Botón flotante azul (+)" 
                        secondary="En la esquina inferior derecha para crear nuevas reservas"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Hacer una Reserva */}
        {tabValue === 1 && (
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Cómo Hacer una Reserva
                </Typography>
                <Typography paragraph color="text.secondary">
                  Sigue estos pasos para crear una nueva reserva:
                </Typography>

                <Stepper orientation="vertical">
                  <Step active={true}>
                    <StepLabel>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarToday fontSize="small" />
                        Fecha y Hora
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>
                        1. Haz clic en el botón azul <Chip label="+" size="small" color="primary" sx={{ mx: 0.5 }} />
                      </Typography>
                      <Typography paragraph>
                        2. Selecciona la <strong>fecha</strong> del servicio
                      </Typography>
                      <Typography paragraph>
                        3. Elige la <strong>hora</strong> de recogida
                      </Typography>
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        <strong>Importante:</strong> Las reservas deben hacerse con al menos 3 horas de antelación
                      </Alert>
                    </StepContent>
                  </Step>

                  <Step active={true}>
                    <StepLabel>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOn fontSize="small" />
                        Detalles del Viaje
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Box mb={2}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Lugar de recogida:
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText primary="• Puedes elegir lugares predefinidos (Aeropuerto, Estación Sants, etc.)" />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="• O escribir una dirección específica" />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="• Si es el aeropuerto, indica la terminal y número de vuelo" />
                          </ListItem>
                        </List>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Destino (opcional):
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText primary="• Igual que la recogida, elige o escribe la dirección" />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="• Puedes dejar este campo vacío si prefieres indicarlo al conductor" />
                          </ListItem>
                        </List>
                      </Box>
                    </StepContent>
                  </Step>

                  <Step active={true}>
                    <StepLabel>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person fontSize="small" />
                        Pasajeros y Requerimientos
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>
                        1. <strong>Número de pasajeros:</strong> Selecciona de 1 a 7
                      </Typography>
                      <Typography paragraph>
                        2. <strong>Servicios especiales</strong> (marca si necesitas):
                      </Typography>
                      <Box ml={2} mb={2}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <ChildCare fontSize="small" color="action" />
                          <Typography variant="body2">Alzador infantil</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <DirectionsCar fontSize="small" color="action" />
                          <Typography variant="body2">Vehículo de 5-6 plazas</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AirlineSeatReclineExtra fontSize="small" color="action" />
                          <Typography variant="body2">Vehículo de 7 plazas</Typography>
                        </Box>
                      </Box>
                      <Typography>
                        3. <strong>Observaciones:</strong> Añade cualquier instrucción especial
                      </Typography>
                    </StepContent>
                  </Step>

                  <Step active={true}>
                    <StepLabel>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircle fontSize="small" />
                        Confirmación
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>
                        1. Revisa todos los datos de tu reserva
                      </Typography>
                      <Typography paragraph>
                        2. Haz clic en <Box component="span" sx={{ ml: 1.25, mr: 1.25, display: 'inline-block' }}><Button size="small" variant="contained" color="success">Realizar Reserva</Button></Box>
                      </Typography>
                      <Typography>
                        3. Recibirás una confirmación con el número de referencia
                      </Typography>
                    </StepContent>
                  </Step>
                </Stepper>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Gestionar Reservas */}
        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Gestionar mis Reservas
                  </Typography>
                  
                  <Box mt={3}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Acciones disponibles:
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Info color="primary" />
                              <Typography variant="subtitle2" fontWeight="bold">
                                Ver Detalles
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Haz clic sobre cualquier reserva para ver todos los detalles
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <GetApp color="primary" />
                              <Typography variant="subtitle2" fontWeight="bold">
                                Descargar Comprobante
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Menú ⋮ → "Descargar comprobante" → Se descarga un archivo HTML
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <ContentCopy color="primary" />
                              <Typography variant="subtitle2" fontWeight="bold">
                                Copiar Referencia
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Menú ⋮ → "Copiar referencia" → El número se copia al portapapeles
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Cancel color="error" />
                              <Typography variant="subtitle2" fontWeight="bold" color="error">
                                Cancelar Reserva
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Solo reservas futuras. Menú ⋮ → "Cancelar reserva"
                            </Typography>
                            <Alert severity="warning" sx={{ mt: 1 }}>
                              Las cancelaciones son permanentes
                            </Alert>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box mt={3}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Estados de las Reservas:
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Box sx={{ mr: 1.25 }}>
                            <Chip label="Próxima" size="small" sx={{ bgcolor: 'success.main', color: 'white' }} />
                          </Box>
                        </ListItemIcon>
                        <ListItemText primary="Reserva confirmada para fecha futura" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Chip label="Hoy" size="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Reserva para el día actual" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Box sx={{ mr: 1.25 }}>
                            <Chip label="Completada" size="small" color="default" />
                          </Box>
                        </ListItemIcon>
                        <ListItemText primary="Servicio ya realizado" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Box sx={{ mr: 1.25 }}>
                            <Chip label="Cancelada" size="small" color="error" />
                          </Box>
                        </ListItemIcon>
                        <ListItemText primary="Reserva anulada" />
                      </ListItem>
                    </List>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Mi Perfil */}
        {tabValue === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Person color="primary" fontSize="large" />
                    <Typography variant="h6" fontWeight="bold">
                      Información Personal
                    </Typography>
                  </Box>
                  <Typography paragraph>
                    Puedes actualizar:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="• Nombre completo" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="• Correo electrónico" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="• Teléfono" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="• Número de abonado" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Security color="primary" fontSize="large" />
                    <Typography variant="h6" fontWeight="bold">
                      Cambiar Contraseña
                    </Typography>
                  </Box>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="1. Haz clic en 'Cambiar Contraseña'" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="2. Introduce tu contraseña actual" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="3. Escribe la nueva contraseña" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="4. Confirma la nueva contraseña" />
                    </ListItem>
                  </List>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Mínimo 8 caracteres, con mayúsculas, minúsculas y números
                  </Alert>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Security color="primary" fontSize="large" />
                    <Typography variant="h6" fontWeight="bold">
                      Verificación en Dos Pasos
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Para activarla:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="1. Haz clic en 'Activar verificación'" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="2. Recibirás un código en tu email" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="3. Introduce el código para confirmar" />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Para desactivarla:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="1. Haz clic en 'Desactivar'" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="2. Introduce tu contraseña para confirmar" />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                  
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <strong>Recomendado:</strong> La verificación en dos pasos añade una capa extra de seguridad
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Preguntas Frecuentes */}
        {tabValue === 4 && (
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Preguntas Frecuentes
            </Typography>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight="medium">
                  ¿Con cuánta antelación puedo hacer una reserva?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Mínimo 3 horas antes del servicio.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight="medium">
                  ¿Puedo modificar una reserva?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  No, debes cancelar la reserva actual y crear una nueva.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight="medium">
                  ¿Qué hago si mi vuelo se retrasa?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Incluye esta información en las observaciones al hacer la reserva. 
                  El conductor verificará el estado del vuelo.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight="medium">
                  ¿Cómo sé que mi reserva está confirmada?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Aparecerá en tu panel principal con el estado "Próxima" y 
                  recibirás un número de referencia.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight="medium">
                  ¿Puedo reservar para otra persona?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Sí, solo asegúrate de incluir cualquier instrucción especial 
                  en las observaciones.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight="medium">
                  ¿Qué pasa si olvido mi contraseña?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Contacta con el administrador del sistema para restablecerla.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Box mt={4}>
              <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Phone fontSize="large" />
                    <Typography variant="h6" fontWeight="bold">
                      ¿Necesitas Ayuda?
                    </Typography>
                  </Box>
                  <Typography paragraph>
                    Si tienes dudas o problemas con el sistema, contacta con:
                  </Typography>
                  <Box ml={2}>
                    <Typography>
                      <strong>Soporte TaxiClass</strong>
                    </Typography>
                    <Typography>
                      📧 Email: info@taxiclassrent.com
                    </Typography>
                    <Typography>
                      📞 Teléfono: (+34) 933 070 707
                    </Typography>
                    <Typography>
                      🕐 Horario: De Lunes a Domingo - Atención 24/7
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default HelpPage;