import api from './api';

const activityService = {
  // Obtener actividades recientes del usuario
  async getUserActivities(limit = 15, offset = 0) {
    try {
      const response = await api.get('/activities', {
        params: { limit, offset }
      });
      // Verificar la estructura de la respuesta
      return response.data;
    } catch (error) {
      console.error('Error al obtener actividades:', error);
      return { activities: [] };
    }
  }
};

export default activityService;
