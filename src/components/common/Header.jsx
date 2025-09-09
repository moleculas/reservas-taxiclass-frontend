import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Container,
  Avatar,
  Divider,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  LocalTaxi as TaxiIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { logout } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // IMPORTANTE: Llamar al servicio de logout para limpiar tokens
      await authService.logout();
      
      // Actualizar el estado de Redux
      dispatch(logout());
      
      // Mostrar mensaje de éxito
      toast.success('Sesión cerrada correctamente');
      
      // Navegar a la página de inicio
      navigate('/login');
      
      // Cerrar el menú
      handleClose();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = isAuthenticated
    ? [
        { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
        { text: 'Nueva Reserva', path: '/new-reservation', icon: <TaxiIcon /> },
        { text: 'Mi Perfil', path: '/profile', icon: <AccountCircle /> },
        { text: 'Ayuda', path: '/help', icon: <HelpIcon /> },
      ]
    : [
        { text: 'Iniciar Sesión', path: '/login' },
        { text: 'Registrarse', path: '/register', disabled: true },
        { text: 'Ayuda', path: '/help', icon: <HelpIcon /> },
      ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, color: 'primary.main', fontWeight: 'bold' }}>
        TaxiClass
      </Typography>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemText>
              <Button
              fullWidth
              onClick={() => navigate(item.path)}
              startIcon={item.icon}
              disabled={item.disabled}
                sx={{ justifyContent: 'flex-start', px: 3 }}
              >
                {item.text}
                </Button>
            </ListItemText>
          </ListItem>
        ))}
        {isAuthenticated && (
          <>
            <Divider />
            <ListItem disablePadding>
              <ListItemText>
                <Button
                  fullWidth
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{ justifyContent: 'flex-start', px: 3, color: 'error.main' }}
                >
                  Cerrar Sesión
                </Button>
              </ListItemText>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 0.5, // Añadir padding vertical al AppBar
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Logo */}
            <Box 
              component={Link} 
              to="/"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none',
                flexGrow: { xs: 1, md: 0 },
              }}
            >
              <TaxiIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
              <Typography
                variant="h5"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  letterSpacing: '-0.5px',
                }}
              >
                Reservas TaxiClass
              </Typography>
            </Box>

            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                color="primary"
                edge="end"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Desktop menu */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                {isAuthenticated ? (
                  <>
                    <Button
                      onClick={() => navigate('/dashboard')}
                      sx={{ mx: 1 }}
                      startIcon={<DashboardIcon />}
                    >
                      Dashboard
                    </Button>
                    <Button
                      onClick={() => navigate('/new-reservation')}
                      sx={{ mx: 1 }}
                      startIcon={<TaxiIcon />}
                    >
                      Nueva Reserva
                    </Button>
                    <Button
                      onClick={() => navigate('/help')}
                      sx={{ mx: 1 }}
                      startIcon={<HelpIcon />}
                    >
                      Ayuda
                    </Button>
                    <IconButton
                      size="large"
                      onClick={handleMenu}
                      sx={{ ml: 2 }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: 'primary.main',
                          fontSize: '1rem',
                        }}
                      >
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      PaperProps={{
                        elevation: 0,
                        sx: {
                          overflow: 'visible',
                          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                          mt: 1.5,
                          '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                          },
                        },
                      }}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                        <ListItemIcon>
                          <AccountCircle fontSize="small" />
                        </ListItemIcon>
                        Mi Perfil
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <Typography color="error">Cerrar Sesión</Typography>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/login')}
                      sx={{ 
                        mx: 1,
                        py: 0.75,
                        px: 2.5,
                        fontSize: '0.925rem',
                      }}
                    >
                      Iniciar Sesión
                    </Button>
                    <Button
                      variant="contained"
                      disabled
                      onClick={() => navigate('/register')}
                      sx={{ 
                        mx: 1,
                        py: 0.75,
                        px: 2.5,
                        fontSize: '0.925rem',
                      }}
                    >
                      Registrarse
                    </Button>
                    <Button
                      onClick={() => navigate('/help')}
                      sx={{ 
                        mx: 1,
                        py: 0.75,
                        px: 2.5,
                        fontSize: '0.925rem',
                      }}
                      startIcon={<HelpIcon />}
                    >
                      Ayuda
                    </Button>
                  </>
                )}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;