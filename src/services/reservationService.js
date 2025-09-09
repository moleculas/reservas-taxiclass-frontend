import api from './api';

const reservationService = {
  // Obtener lista de reservas del usuario con paginación
  async getUserReservations(page = 1, limit = 10, filter = 'all') {
    try {
      const response = await api.get('/reservations/list', {
        params: {
          page,
          limit,
          filter
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reservas:', error);
      throw error;
    }
  },

  // Obtener detalles de una reserva específica
  async getReservationDetails(bookingIdAuriga) {
    try {
      const response = await api.get(`/reservations/detail/${bookingIdAuriga}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo detalles de reserva:', error);
      throw error;
    }
  },

  // Cancelar una reserva
  async cancelReservation(bookingIdAuriga) {
    try {
      const response = await api.post(`/reservations/cancel/${bookingIdAuriga}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      throw error;
    }
  },

  // Descargar comprobante de reserva
  async downloadReceipt(bookingIdAuriga) {
    try {
      const response = await api.get(`/reservations/receipt/${bookingIdAuriga}`);
      return response.data;
    } catch (error) {
      console.error('Error descargando comprobante:', error);
      throw error;
    }
  },

  // Crear nueva reserva
  async createReservation(reservationData) {
    try {
      const response = await api.post('/reservations/create', reservationData);
      return response.data;
    } catch (error) {
      console.error('Error creando reserva:', error);
      throw error;
    }
  }
};

export default reservationService;
