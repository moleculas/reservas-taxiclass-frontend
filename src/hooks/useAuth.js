import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import authService from '../services/authService';
import { loginSuccess, loginStart, loginFailure } from '../store/slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        // Si no hay token, detener la carga
        dispatch(loginFailure(''));
        return;
      }

      // Mantener isLoading en true mientras verifica
      dispatch(loginStart());

      try {
        const result = await authService.verifySession();
        
        if (result.isValid && result.user) {
          dispatch(loginSuccess(result.user));
        } else {
          dispatch(loginFailure(''));
        }
      } catch (error) {
        dispatch(loginFailure(''));
        console.error('Error verificando sesión:', error);
      }
    };

    verifyAuth();
  }, [dispatch]);
};

export default useAuth;
