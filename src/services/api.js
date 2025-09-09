import axios from 'axios';
import toast from 'react-hot-toast';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';

// Configuración base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/reservas-taxiclass/backend';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Temporalmente false mientras solucionamos las sesiones
});

// Interceptor para añadir token a las peticiones
api.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    // Cualquier código de estado 2xx activa esta función
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 y no es una petición de login o cambio de contraseña
    if (error.response?.status === 401 && 
        !originalRequest.url.includes('/auth/login') && 
        !originalRequest.url.includes('/auth/change-password')) {
      // Si ya intentamos refrescar el token, hacer logout
      if (originalRequest._retry) {
        store.dispatch(logout());
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      
      // Intentar refrescar el token
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { token } = response.data;
          localStorage.setItem('authToken', token);
          
          // Reintentar la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si falla el refresh, hacer logout
        store.dispatch(logout());
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Manejo de otros errores
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const message = error.response.data?.message || 'Error en el servidor';
      
      // No mostrar toast para errores esperados (validación, etc)
      if (error.response.status >= 500) {
        toast.error('Error del servidor. Por favor, intenta más tarde.');
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      toast.error('No se pudo conectar con el servidor');
    } else {
      // Algo pasó al configurar la petición
      toast.error('Error al procesar la solicitud');
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Funciones helper para las peticiones más comunes
export const apiGet = (url, config = {}) => api.get(url, config);
export const apiPost = (url, data = {}, config = {}) => api.post(url, data, config);
export const apiPut = (url, data = {}, config = {}) => api.put(url, data, config);
export const apiDelete = (url, config = {}) => api.delete(url, config);
