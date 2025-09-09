import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  CircularProgress,
  Fade,
  Link,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  LocalTaxi as TaxiIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  setTwoFactorRequired, 
  setTempToken,
  setTempCredentials,
  stopLoading 
} from '../store/slices/authSlice';
import authService from '../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, twoFactorRequired, tempToken, tempCredentials } = useSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      twoFactorCode: '',
    },
  });

  // Efecto para establecer los valores cuando hay credenciales temporales
  useEffect(() => {
    if (tempCredentials) {
      setValue('email', tempCredentials.email);
      setValue('password', tempCredentials.password);
    }
  }, [tempCredentials, setValue]);

  const onSubmit = async (data) => {
    dispatch(loginStart());
    
    try {
      if (!twoFactorRequired) {
        // Primer paso: login con email y contraseña
        
        // Guardar las credenciales en Redux ANTES de hacer el login
        dispatch(setTempCredentials({ email: data.email, password: data.password }));
        
        const result = await authService.login(data.email, data.password);
        
        if (result.requiresTwoFactor) {
          // Requiere 2FA
          
          // Actualizar Redux store
          dispatch(setTempToken(result.tempToken));
          dispatch(setTwoFactorRequired(true));
          dispatch(stopLoading());
          
          toast('Introduce el código de verificación enviado a tu email', {
            icon: '🔐',
            duration: 4000,
          });
        } else {
          // Login exitoso sin 2FA
          dispatch(loginSuccess(result.user));
          toast.success('¡Bienvenido de nuevo!');
          navigate('/dashboard');
        }
      } else {
        // Segundo paso: verificar código 2FA
        
        if (!tempToken) {
          throw new Error('Token temporal no encontrado. Por favor, intenta de nuevo.');
        }
        
        const result = await authService.verifyTwoFactor(tempToken, data.twoFactorCode);
        dispatch(loginSuccess(result.user));
        toast.success('¡Bienvenido de nuevo!');
        navigate('/dashboard');
      }
    } catch (err) {
      dispatch(loginFailure(err.message));
      toast.error(err.message || 'Error al iniciar sesión');
    }
  };

  // Valores a mostrar en los campos
  const emailValue = tempCredentials?.email || '';
  const passwordValue = tempCredentials?.password || '';

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: 'calc(100vh - 200px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Fade in timeout={600}>
          <Paper
            elevation={2}
            sx={{
              p: 4,
              width: '100%',
              maxWidth: 460,
              borderRadius: 2,
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <TaxiIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" fontWeight="600" gutterBottom>
                Iniciar Sesión
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accede a tu cuenta de TaxiClass
              </Typography>
            </Box>

            {/* Formulario */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Email - Visible siempre */}
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={twoFactorRequired ? emailValue : undefined}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isLoading}
                  InputProps={{
                    readOnly: twoFactorRequired,
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-input[readonly]': {
                      backgroundColor: 'action.hover',
                      cursor: 'default',
                    }
                  }}
                  {...register('email', {
                    required: !twoFactorRequired ? 'El email es obligatorio' : false,
                    pattern: !twoFactorRequired ? {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido',
                    } : undefined,
                  })}
                />

                {/* Password - Visible siempre */}
                <TextField
                  fullWidth
                  label="Contraseña"
                  type={showPassword && !twoFactorRequired ? 'text' : 'password'}
                  value={twoFactorRequired ? '••••••••' : undefined}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isLoading}
                  InputProps={{
                    readOnly: twoFactorRequired,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: !twoFactorRequired && (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-input[readonly]': {
                      backgroundColor: 'action.hover',
                      cursor: 'default',
                    }
                  }}
                  {...register('password', {
                    required: !twoFactorRequired ? 'La contraseña es obligatoria' : false,
                    minLength: !twoFactorRequired ? {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres',
                    } : undefined,
                  })}
                />

                {/* Two Factor Code - Solo visible cuando se requiere */}
                {twoFactorRequired && (
                  <Fade in>
                    <Box>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          Se ha enviado un código de verificación a tu email
                        </Typography>
                      </Alert>
                      <TextField
                        fullWidth
                        label="Código de verificación"
                        type="text"
                        autoFocus
                        error={!!errors.twoFactorCode}
                        helperText={errors.twoFactorCode?.message || 'Introduce el código de 6 dígitos enviado a tu email'}
                        disabled={isLoading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SecurityIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        {...register('twoFactorCode', {
                          required: twoFactorRequired ? 'El código es obligatorio' : false,
                          pattern: {
                            value: /^[0-9]{6}$/,
                            message: 'El código debe tener 6 dígitos',
                          },
                        })}
                      />
                    </Box>
                  </Fade>
                )}

                {/* Error message */}
                {error && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                  </Alert>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    position: 'relative',
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : twoFactorRequired ? (
                    'Verificar y Acceder'
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>

                {/* Links */}
                {!twoFactorRequired && (
                  <>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={(e) => {
                          e.preventDefault();
                          toast.info('Función no disponible temporalmente');
                        }}
                        sx={{ color: 'text.secondary', textDecoration: 'none' }}
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </Box>

                    <Divider sx={{ my: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        ¿No tienes cuenta?
                      </Typography>
                    </Divider>

                    <Typography variant="body2" color="text.secondary" align="center">
                      El registro está temporalmente deshabilitado
                    </Typography>
                  </>
                )}
              </Box>
            </form>
          </Paper>
        </Fade>
      </Box>
    </Container>
  );
};

export default LoginPage;