import api from './api';

const locationService = {
  // Obtener todas las localizaciones predefinidas
  async getPredefinedLocations() {
    try {
      const response = await api.get('/locations');
      return response.data;
    } catch (error) {
      console.error('Error al obtener localizaciones:', error);
      throw error;
    }
  },

  // Buscar localizaciones predefinidas
  async searchPredefinedLocations(query) {
    try {
      const response = await api.get('/locations/search', {
        params: { q: query }
      });
      return response.data.locations || [];
    } catch (error) {
      console.error('Error al buscar localizaciones:', error);
      return [];
    }
  }
};

export default locationService;
