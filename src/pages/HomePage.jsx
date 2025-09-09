import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import {
  LocalTaxi as TaxiIcon,
  Login as LoginIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <TaxiIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom fontWeight="500">
          Reservas TaxiClass
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Sistema de gestión de reservas
        </Typography>
      </Box>

      {isAuthenticated ? (
        // Usuario autenticado - Mostrar opciones de gestión
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Bienvenido, {user?.name || 'Usuario'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            ¿Qué deseas hacer hoy?
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<TaxiIcon />}
                onClick={() => navigate('/new-reservation')}
                sx={{ py: 2 }}
              >
                Nueva Reserva
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{ py: 2 }}
              >
                Ver Mis Reservas
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        // Usuario no autenticado - Opciones de acceso
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Accede a tu cuenta
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Inicia sesión para gestionar tus reservas
          </Typography>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            sx={{ py: 1.5 }}
          >
            Iniciar Sesión
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            El registro está temporalmente deshabilitado
          </Typography>
        </Paper>
      )}

      {/* Información básica del sistema */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Sistema de reservas integrado con API Auriga
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;
