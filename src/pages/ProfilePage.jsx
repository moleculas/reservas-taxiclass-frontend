import { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Avatar, 
  Divider,
  Switch,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Chip,
  Grid,
  Card,
  CardContent,
  Fade,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Skeleton
} from '@mui/material';
import {
  PersonOutlineOutlined,
  EmailOutlined,
  PhoneOutlined,
  SecurityOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  CheckCircleOutline,
  WarningAmberOutlined,
  InfoOutlined,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Error as ErrorIcon,
  DevicesOther as DevicesIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import profileService from '../services/profileService';
import activityService from '../services/activityService';
import api from '../services/api';
import { updateUser } from '../store/slices/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  // Función para formatear la fecha de miembro
  const getMemberSince = () => {
    if (!user?.createdAt) {
      return 'Nuevo miembro';
    }
    
    const date = new Date(user.createdAt);
    const year = date.getFullYear();
    const month = date.toLocaleString('es-ES', { month: 'long' });
    
    // Si es del año actual (2025), mostrar mes + año
    const currentYear = new Date().getFullYear();
    if (year === currentYear) {
      return `Miembro desde ${month} ${year}`;
    }
    
    return `Miembro desde ${year}`;
  };
  
  // Función para calcular tiempo desde la última actualización de contraseña
  const getPasswordLastUpdate = () => {
    if (!user?.passwordUpdatedAt) {
      return 'Nunca actualizada';
    }
    
    const date = new Date(user.passwordUpdatedAt);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Actualizada hoy';
    } else if (diffDays === 1) {
      return 'Hace 1 día';
    } else if (diffDays < 30) {
      return `Hace ${diffDays} días`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
    }
  };
  
  // Estados para 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  // Estados para edición de perfil
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    account: ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Estados para cambio de contraseña (futuro)
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Estados para actividades recientes
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingMoreActivities, setLoadingMoreActivities] = useState(false);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);
  const [activitiesOffset, setActivitiesOffset] = useState(0);
  const ACTIVITIES_LIMIT = 10;

  useEffect(() => {
    if (user) {
      setTwoFactorEnabled(user.twoFactorEnabled || false);
      setTwoFactorEmail(user.email);
      
      // Cargar datos para edición
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        account: user.account || ''
      });
      
      // Si no tiene createdAt, recargar datos del usuario
      if (!user.createdAt) {
        loadUserData();
      }
      
      // Cargar actividades recientes
      loadActivities();
    }
  }, [user]);
  
  // Cargar datos actualizados del usuario
  const loadUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.user) {
        dispatch(updateUser(response.data.user));
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  };
  
  // Cargar actividades recientes
  const loadActivities = async (loadMore = false) => {
    if (loadMore) {
      setLoadingMoreActivities(true);
    } else {
      setLoadingActivities(true);
    }
    
    try {
      const offset = loadMore ? activitiesOffset : 0;
      const data = await activityService.getUserActivities(ACTIVITIES_LIMIT, offset);
      const activitiesList = data.activities || [];
      
      if (loadMore) {
        // Agregar las nuevas actividades a las existentes
        setActivities(prev => [...prev, ...activitiesList]);
        setActivitiesOffset(prev => prev + ACTIVITIES_LIMIT);
      } else {
        // Reemplazar todas las actividades (carga inicial)
        setActivities(activitiesList);
        setActivitiesOffset(ACTIVITIES_LIMIT);
      }
      
      // Si recibimos menos actividades que el límite, no hay más
      setHasMoreActivities(activitiesList.length === ACTIVITIES_LIMIT);
      
    } catch (error) {
      console.error('Error al cargar actividades:', error);
    } finally {
      setLoadingActivities(false);
      setLoadingMoreActivities(false);
    }
  };
  
  // Cargar más actividades
  const handleLoadMoreActivities = () => {
    loadActivities(true);
  };
  
  // Función para formatear fecha de actividad
  const formatActivityDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Hace un momento';
    } else if (diffMins < 60) {
      return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };
  
  // Obtener icono para el tipo de actividad
  const getActivityIcon = (type) => {
    const icons = {
      'login_success': <LoginIcon />,
      'login_failed': <ErrorIcon />,
      'logout': <LogoutIcon />,
      'password_changed': <LockIcon />,
      'profile_updated': <PersonIcon />,
      '2fa_enabled': <SecurityIcon />,
      '2fa_disabled': <SecurityIcon />,
      '2fa_failed': <ErrorIcon />
    };
    return icons[type] || <InfoOutlined />;
  };

  // Manejadores para edición de perfil
  const handleEditClick = () => {
    setEditMode(true);
    setEditErrors({});
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditErrors({});
    // Restaurar valores originales
    setEditData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      account: user.account || ''
    });
  };

  const handleEditChange = (field) => (event) => {
    setEditData({
      ...editData,
      [field]: event.target.value
    });
    // Limpiar error del campo
    if (editErrors[field]) {
      setEditErrors({
        ...editErrors,
        [field]: null
      });
    }
  };

  const validateEditData = () => {
    const errors = {};
    
    // Validar nombre
    if (!editData.name.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (editData.name.trim().length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!emailRegex.test(editData.email)) {
      errors.email = 'Email inválido';
    }
    
    // Validar teléfono (opcional)
    if (editData.phone.trim()) {
      const phoneRegex = /^[+]?[0-9\s-()]+$/;
      if (!phoneRegex.test(editData.phone) || editData.phone.replace(/\D/g, '').length < 9) {
        errors.phone = 'Teléfono inválido';
      }
    }
    
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateEditData()) {
      return;
    }
    
    setSavingProfile(true);
    try {
      const response = await profileService.updateProfile(editData);
      
      // Actualizar el estado del usuario
      dispatch(updateUser(response.user));
      
      setEditMode(false);
      toast.success('Perfil actualizado correctamente');
      
      // Recargar actividades para mostrar el cambio
      loadActivities();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      if (error.errors) {
        // Mostrar errores específicos del servidor
        const serverErrors = {};
        error.errors.forEach(err => {
          if (err.includes('nombre')) serverErrors.name = err;
          else if (err.includes('email')) serverErrors.email = err;
          else if (err.includes('teléfono')) serverErrors.phone = err;
          else toast.error(err);
        });
        setEditErrors(serverErrors);
      } else {
        toast.error(error.message || 'Error al actualizar el perfil');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // Manejadores para 2FA
  const handleToggle2FA = (event) => {
    if (event.target.checked) {
      setShowEnableDialog(true);
    } else {
      setShowDisableDialog(true);
    }
  };

  const handleRequestEnable2FA = async () => {
    setLoading(true);
    try {
      const emailToUse = twoFactorEmail !== user.email ? twoFactorEmail : null;
      const response = await profileService.requestEnable2FA(emailToUse);
      
      setPendingEmail(response.email);
      setShowEnableDialog(false);
      setShowVerifyDialog(true);
      
      toast.success('Código de verificación enviado a tu email');
    } catch (error) {
      toast.error(error.message || 'Error al enviar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEnable2FA = async () => {
    setLoading(true);
    try {
      const response = await profileService.confirmEnable2FA(verificationCode);
      
      // Actualizar el estado del usuario
      dispatch(updateUser({ 
        twoFactorEnabled: true,
        twoFactorEmail: response.twoFactorEmail 
      }));
      
      setTwoFactorEnabled(true);
      setShowVerifyDialog(false);
      setVerificationCode('');
      
      toast.success('Verificación de dos pasos activada correctamente');
      
      // Recargar actividades
      loadActivities();
    } catch (error) {
      toast.error(error.message || 'Código incorrecto');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    try {
      await profileService.disable2FA(disablePassword);
      
      // Actualizar el estado del usuario
      dispatch(updateUser({ 
        twoFactorEnabled: false,
        twoFactorEmail: null 
      }));
      
      setTwoFactorEnabled(false);
      setShowDisableDialog(false);
      setDisablePassword('');
      
      toast.success('Verificación de dos pasos desactivada');
      
      // Recargar actividades
      loadActivities();
    } catch (error) {
      toast.error(error.message || 'Contraseña incorrecta');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDialogs = () => {
    setShowEnableDialog(false);
    setShowDisableDialog(false);
    setShowVerifyDialog(false);
    setTwoFactorEmail(user.email);
    setVerificationCode('');
    setDisablePassword('');
  };

  // Manejadores para cambio de contraseña
  const handleChangePasswordClick = () => {
    setShowChangePasswordDialog(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordData({
      ...passwordData,
      [field]: event.target.value
    });
    // Limpiar error del campo
    if (passwordErrors[field]) {
      setPasswordErrors({
        ...passwordErrors,
        [field]: null
      });
    }
  };

  const validatePasswordData = () => {
    const errors = {};
    
    // Validar contraseña actual
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'La contraseña actual es requerida';
    }
    
    // Validar nueva contraseña
    if (!passwordData.newPassword) {
      errors.newPassword = 'La nueva contraseña es requerida';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'Debe contener mayúsculas, minúsculas y números';
    }
    
    // Validar confirmación
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Confirma la nueva contraseña';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePassword = async () => {
    if (!validatePasswordData()) {
      return;
    }
    
    setChangingPassword(true);
    try {
      await profileService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      // Solo cerrar el diálogo si fue exitoso
      setShowChangePasswordDialog(false);
      toast.success('Contraseña cambiada exitosamente');
      
      // Actualizar la fecha de última actualización de contraseña
      dispatch(updateUser({ 
        passwordUpdatedAt: new Date().toISOString() 
      }));
      
      // Recargar actividades para mostrar el cambio
      loadActivities();
      
      // Limpiar los datos del formulario
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 401 || error.message?.includes('incorrecta')) {
        setPasswordErrors({
          currentPassword: 'La contraseña actual es incorrecta'
        });
        toast.error('La contraseña actual es incorrecta');
      } else if (error.response?.status === 400) {
        // Errores de validación del backend
        const message = error.response?.data?.message || error.message;
        
        if (message.includes('8 caracteres')) {
          setPasswordErrors({
            newPassword: message
          });
        } else if (message.includes('mayúscula')) {
          setPasswordErrors({
            newPassword: message
          });
        } else if (message.includes('diferente')) {
          setPasswordErrors({
            newPassword: 'La nueva contraseña debe ser diferente a la actual'
          });
          toast.error('La nueva contraseña debe ser diferente a la actual');
        } else {
          toast.error(message || 'Error al cambiar la contraseña');
        }
      } else {
        toast.error('Error al cambiar la contraseña. Por favor, intenta nuevamente.');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setShowChangePasswordDialog(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in timeout={300}>
          <Box>
          {/* Header del perfil */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 3,
              background: 'linear-gradient(135deg, #011850 0%, #334975 100%)',
              color: 'white',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',              
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'secondary.main',
                    fontSize: '2rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 20px rgba(5, 217, 217, 0.3)'
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ ml: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {getMemberSince()}
                  </Typography>
                </Box>
              </Box>
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

          {/* Información del perfil */}
          <Grid container spacing={3}>
            {/* Información personal */}
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Card elevation={0} sx={{ borderRadius: 2, width: '100%', minHeight: 350 }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Información Personal
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, flex: 1 }}>
                    {/* Nombre */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonOutlineOutlined sx={{ mr: 2, color: 'text.secondary', mt: editMode ? 1 : 0 }} />
                      {editMode ? (
                        <Box sx={{ flex: 1, maxWidth: '50%' }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Nombre completo"
                            value={editData.name}
                            onChange={handleEditChange('name')}
                            error={!!editErrors.name}
                            helperText={editErrors.name}
                            sx={{ mb: 0.5 }}
                          />
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Nombre completo
                          </Typography>
                          <Typography variant="body1">
                            {user.name}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Email */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailOutlined sx={{ mr: 2, color: 'text.secondary', mt: editMode ? 1 : 0 }} />
                      {editMode ? (
                        <Box sx={{ flex: 1, maxWidth: '50%' }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="email"
                            label="Email"
                            value={editData.email}
                            onChange={handleEditChange('email')}
                            error={!!editErrors.email}
                            helperText={editErrors.email}
                            sx={{ mb: 0.5 }}
                          />
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body1">
                            {user.email}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Teléfono */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneOutlined sx={{ mr: 2, color: 'text.secondary', mt: editMode ? 1 : 0 }} />
                      {editMode ? (
                        <Box sx={{ flex: 1, maxWidth: '50%' }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Teléfono"
                            value={editData.phone}
                            onChange={handleEditChange('phone')}
                            error={!!editErrors.phone}
                            helperText={editErrors.phone}
                            placeholder="+34 600000000"
                            sx={{ mb: editMode ? 1.5 : 0 }}
                          />
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Teléfono
                          </Typography>
                          <Typography variant="body1">
                            {user.phone || 'No registrado'}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Número de abonado */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BadgeIcon sx={{ mr: 2, color: 'text.secondary', mt: editMode ? 1 : 0 }} />
                      {editMode ? (
                        <Box sx={{ flex: 1, maxWidth: '50%' }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Número de abonado"
                            value={editData.account}
                            onChange={handleEditChange('account')}
                            error={!!editErrors.account}
                            helperText={editErrors.account}
                            placeholder="C-308"
                            sx={{ mb: editMode ? 1.5 : 0 }}
                          />
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Número de abonado
                          </Typography>
                          <Typography variant="body1">
                            {user.account || 'No registrado'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Botones de acción - siempre al final */}
                  <Box sx={{ mt: 'auto', pt: 2 }}>
                    {editMode ? (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={handleCancelEdit}
                          disabled={savingProfile}
                          sx={{ minWidth: 140 }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                          sx={{ minWidth: 140 }}
                        >
                          {savingProfile ? <CircularProgress size={20} /> : 'Guardar cambios'}
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        onClick={handleEditClick}
                        sx={{ minWidth: 140 }}
                      >
                        Editar información
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Seguridad */}
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Card elevation={0} sx={{ borderRadius: 2, width: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Seguridad
                  </Typography>

                  {/* Verificación de dos pasos */}
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 1,
                      bgcolor: twoFactorEnabled ? 'success.lighter' : 'background.default',
                      border: '1px solid',
                      borderColor: twoFactorEnabled ? 'success.light' : 'divider',
                      mb: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SecurityOutlined 
                          sx={{ 
                            mr: 2, 
                            color: twoFactorEnabled ? 'success.main' : 'text.secondary' 
                          }} 
                        />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            Verificación de dos pasos
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {twoFactorEnabled 
                              ? 'Protección adicional activada' 
                              : 'Añade una capa extra de seguridad'}
                          </Typography>
                        </Box>
                      </Box>
                      <Switch
                        checked={twoFactorEnabled}
                        onChange={handleToggle2FA}
                        color="success"
                      />
                    </Box>
                    
                    {twoFactorEnabled && (
                      <Box sx={{ mt: 2, pl: 5 }}>
                        <Chip
                          size="small"
                          icon={<CheckCircleOutline />}
                          label="Activo"
                          color="success"
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Contraseña */}
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 1,
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LockOutlined sx={{ mr: 2, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            Contraseña
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Última actualización: {getPasswordLastUpdate()}
                          </Typography>
                        </Box>
                      </Box>
                      <Button 
                        size="small" 
                        variant="text"
                        onClick={handleChangePasswordClick}
                      >
                        Cambiar
                      </Button>
                    </Box>
                  </Box>

                  {/* Información adicional */}
                  <Alert 
                    severity="info" 
                    icon={<InfoOutlined />}
                    sx={{ mt: 3 }}
                  >
                    Mantén tu cuenta segura usando una contraseña única y activando la verificación de dos pasos.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>

            {/* Actividad reciente */}
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Card elevation={0} sx={{ borderRadius: 2, width: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Actividad Reciente
                  </Typography>
                  
                  {loadingActivities ? (
                    <Box>
                      {[...Array(3)].map((_, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', py: 1.5 }}>
                          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="40%" height={16} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : activities.length > 0 ? (
                    <List sx={{ p: 0 }}>
                      {activities.map((activity, index) => (
                        <ListItem 
                          key={activity.id} 
                          sx={{ 
                            px: 0,
                            borderBottom: index < activities.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider'
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 48 }}>
                            <Avatar
                              sx={{
                                width: 35,
                                height: 35,
                                bgcolor: `${activity.color || 'info'}.lighter`,
                                color: `${activity.color || 'info'}.main`
                              }}
                            >
                              {getActivityIcon(activity.type)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={activity.description}
                            secondary={
                              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>
                                  {formatActivityDate(activity.createdAt)}
                                </span>
                                {activity.userAgent && (
                                  <>
                                    <span>•</span>
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <DevicesIcon sx={{ fontSize: 14 }} />
                                      <span>
                                        {activity.userAgent}
                                      </span>
                                    </Box>
                                  </>
                                )}
                              </Box>
                            }
                            secondaryTypographyProps={{
                              component: 'div'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <Typography variant="body2">
                        No hay actividad reciente para mostrar
                      </Typography>
                    </Box>
                  )}
                  
                  {activities.length > 0 && hasMoreActivities && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Button 
                        size="small" 
                        color="primary"
                        onClick={handleLoadMoreActivities}
                        disabled={loadingMoreActivities}
                      >
                        {loadingMoreActivities ? (
                          <>
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                            Cargando...
                          </>
                        ) : (
                          'Cargar más actividad'
                        )}
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Diálogo para activar 2FA */}
          <Dialog 
            open={showEnableDialog} 
            onClose={handleCancelDialogs}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              Activar verificación de dos pasos
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Te enviaremos un código de verificación cada vez que inicies sesión. 
                  Puedes recibir el código en tu email actual o en uno diferente.
                </Typography>
                
                <TextField
                  fullWidth
                  type="email"
                  label="Email para códigos de verificación"
                  value={twoFactorEmail}
                  onChange={(e) => setTwoFactorEmail(e.target.value)}
                  helperText="Deja este campo con tu email actual o cambialo si prefieres usar otro"
                  sx={{ mb: 2 }}
                />

                <Alert severity="info" icon={<InfoOutlined />}>
                  Asegúrate de tener acceso a este email antes de continuar
                </Alert>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCancelDialogs} disabled={loading}>
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                onClick={handleRequestEnable2FA}
                disabled={loading || !twoFactorEmail}
              >
                {loading ? <CircularProgress size={20} /> : 'Enviar código'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Diálogo para verificar código */}
          <Dialog 
            open={showVerifyDialog} 
            onClose={handleCancelDialogs}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              Verificar código
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Hemos enviado un código de verificación a {pendingEmail}
                </Typography>
                
                <TextField
                  fullWidth
                  label="Código de verificación"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  inputProps={{ 
                    maxLength: 6,
                    style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem' }
                  }}
                  sx={{ mb: 2 }}
                />

                <Typography variant="caption" color="text.secondary">
                  El código expira en 10 minutos. Si no lo recibes, revisa tu carpeta de spam.
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCancelDialogs} disabled={loading}>
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                onClick={handleConfirmEnable2FA}
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? <CircularProgress size={20} /> : 'Verificar y activar'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Diálogo para desactivar 2FA */}
          <Dialog 
            open={showDisableDialog} 
            onClose={handleCancelDialogs}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningAmberOutlined sx={{ mr: 1, color: 'warning.main' }} />
                Desactivar verificación de dos pasos
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Tu cuenta será menos segura sin la verificación de dos pasos
                </Alert>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Por seguridad, ingresa tu contraseña para confirmar esta acción.
                </Typography>
                
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="Contraseña"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCancelDialogs} disabled={loading}>
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={handleDisable2FA}
                disabled={loading || !disablePassword}
              >
                {loading ? <CircularProgress size={20} /> : 'Desactivar'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Diálogo para cambiar contraseña */}
          <Dialog 
            open={showChangePasswordDialog} 
            onClose={handleCancelPasswordChange}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              Cambiar contraseña
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Por seguridad, ingresa tu contraseña actual y luego la nueva contraseña.
                </Typography>
                
                {/* Contraseña actual */}
                <TextField
                  fullWidth
                  type={showCurrentPassword ? 'text' : 'password'}
                  label="Contraseña actual"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange('currentPassword')}
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword}
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                {/* Nueva contraseña */}
                <TextField
                  fullWidth
                  type={showNewPassword ? 'text' : 'password'}
                  label="Nueva contraseña"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange('newPassword')}
                  error={!!passwordErrors.newPassword}
                  helperText={passwordErrors.newPassword || 'Mínimo 8 caracteres, con mayúsculas, minúsculas y números'}
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                {/* Confirmar nueva contraseña */}
                <TextField
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirmar nueva contraseña"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange('confirmPassword')}
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Alert severity="info" icon={<InfoOutlined />} sx={{ mt: 3 }}>
                  La contraseña debe contener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.
                </Alert>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCancelPasswordChange} disabled={changingPassword}>
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSavePassword}
                disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {changingPassword ? <CircularProgress size={20} /> : 'Cambiar contraseña'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </Container>
  );
};

export default ProfilePage;
