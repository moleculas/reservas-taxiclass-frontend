import api from './api';

const profileService = {
  // Activar 2FA - Paso 1: Solicitar código
  async requestEnable2FA(twoFactorEmail = null) {
    try {
      const data = twoFactorEmail ? { two_factor_email: twoFactorEmail } : {};
      const response = await api.post('/auth/enable-2fa', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Activar 2FA - Paso 2: Confirmar con código
  async confirmEnable2FA(code) {
    try {
      const response = await api.post('/auth/confirm-enable-2fa', { code });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Desactivar 2FA
  async disable2FA(password) {
    try {
      const response = await api.post('/auth/disable-2fa', { password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Actualizar perfil (para futuras funcionalidades)
  async updateProfile(data) {
    try {
      const response = await api.put('/auth/update-profile', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cambiar contraseña (para futuras funcionalidades)
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default profileService;
