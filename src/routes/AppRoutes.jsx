import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';

// Páginas (las crearemos después)
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import NewReservationPage from '../pages/NewReservationPage';
import HelpPage from '../pages/HelpPage';

// Componente de carga
const LoadingScreen = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: 'background.default'
    }}
  >
    <CircularProgress />
  </Box>
);

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || false);
  const isLoading = useSelector((state) => state.auth?.isLoading);
  
  // Si está cargando, mostrar spinner
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente para rutas públicas (redirige si ya está autenticado)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || false);
  const isLoading = useSelector((state) => state.auth?.isLoading);
  const twoFactorRequired = useSelector((state) => state.auth?.twoFactorRequired || false);
  
  // Si está cargando Y no estamos en proceso de 2FA, mostrar spinner
  if (isLoading && !twoFactorRequired) {
    return <LoadingScreen />;
  }
  
  // Si está autenticado Y no está en proceso de 2FA, redirigir al dashboard
  if (isAuthenticated && !twoFactorRequired) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } 
      />
      <Route path="/help" element={<HelpPage />} />
      
      {/* Rutas protegidas */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/new-reservation" 
        element={
          <ProtectedRoute>
            <NewReservationPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Ruta 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;