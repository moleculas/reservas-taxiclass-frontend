import api from './api';

class AuthService {
  // Login normal (primer paso)
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      const { data } = response;
      
      // Si requiere 2FA, devolver indicador
      if (data.requiresTwoFactor) {
        return {
          success: false,
          requiresTwoFactor: true,
          tempToken: data.tempToken, // Token temporal para validar 2FA
        };
      }
      
      // Login exitoso sin 2FA
      this.setTokens(data.token, data.refreshToken);
      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Verificar código 2FA
  async verifyTwoFactor(tempToken, code) {
    try {
      const response = await api.post('/auth/verify-2fa', {
        tempToken,
        code,
      });
      
      const { data } = response;
      
      // Guardar tokens
      this.setTokens(data.token, data.refreshToken);
      
      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      // Limpiar tokens localmente sin importar si la petición fue exitosa
      this.clearTokens();
    }
  }
  
  // Obtener perfil del usuario actual
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Verificar si hay una sesión activa
  async verifySession() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { isValid: false };
    }
    
    try {
      const response = await api.get('/auth/verify');
      return {
        isValid: true,
        user: response.data.user,
      };
    } catch (error) {
      this.clearTokens();
      return { isValid: false };
    }
  }
  
  // Refrescar token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }
    
    try {
      const response = await api.post('/auth/refresh', {
        refreshToken,
      });
      
      const { token, refreshToken: newRefreshToken } = response.data;
      this.setTokens(token, newRefreshToken);
      
      return token;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }
  
  // Solicitar restablecimiento de contraseña
  async requestPasswordReset(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Restablecer contraseña con token
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Activar/desactivar 2FA
  async toggleTwoFactor(enable) {
    try {
      const endpoint = enable ? '/auth/2fa/enable' : '/auth/2fa/disable';
      const response = await api.post(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Helpers privados
  setTokens(token, refreshToken) {
    localStorage.setItem('authToken', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }
  
  clearTokens() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }
  
  handleAuthError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error('Error de autenticación');
  }
}

// Exportar instancia única
export default new AuthService();