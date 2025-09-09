import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Iniciar en true para la primera carga
  error: null,
  twoFactorRequired: false,
  tempToken: null, // Añadido para manejar el token temporal de 2FA
  tempCredentials: null, // Añadido para guardar credenciales durante 2FA
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      state.twoFactorRequired = false;
      state.tempToken = null; // Limpiar tempToken al login exitoso
      state.tempCredentials = null; // Limpiar credenciales temporales
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
      // No limpiar twoFactorRequired aquí para mantener el estado del formulario
    },
    logout: (state) => {
      // Restablecer COMPLETAMENTE el estado inicial
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.twoFactorRequired = false;
      state.tempToken = null;
      state.tempCredentials = null;
      state.isLoading = false; // Importante: no dejar loading en true
    },
    setTwoFactorRequired: (state, action) => {
      state.twoFactorRequired = action.payload;
    },
    setTempToken: (state, action) => {
      state.tempToken = action.payload;
    },
    setTempCredentials: (state, action) => {
      state.tempCredentials = action.payload;
    },
    clearTempToken: (state) => {
      state.tempToken = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    stopLoading: (state) => {
      state.isLoading = false;
    },
    updateUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload
      };
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setTwoFactorRequired,
  setTempToken,
  setTempCredentials,
  clearTempToken,
  clearError,
  stopLoading,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;