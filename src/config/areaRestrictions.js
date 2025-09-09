// Configuración de restricción geográfica para lugares de recogida
export const PICKUP_AREA_RESTRICTION = {
  // Activar/desactivar la restricción (cambiar a false para desactivar)
  enabled: true,
  
  // Polígono que define el área permitida (Barcelona y alrededores)
  polygon: [
    { lat: 41.25322849693047, lng: 1.943571485535893 },
    { lat: 41.29265876908774, lng: 2.155491182032037 },
    { lat: 41.47922085325457, lng: 2.309771817622752 },
    { lat: 41.49375281232211, lng: 2.050943965662797 },
    { lat: 41.4311813291833, lng: 1.950990216372763 },
    { lat: 41.25322849693047, lng: 1.943571485535893 }
  ],
  
  // Bounds para Google Places (rectángulo que contiene el polígono)
  bounds: {
    north: 41.49375281232211,  // Latitud máxima
    south: 41.25322849693047,  // Latitud mínima
    east: 2.309771817622752,   // Longitud máxima
    west: 1.943571485535893    // Longitud mínima
  },
  
  // Mensaje de error cuando la dirección está fuera del área
  errorMessage: 'El lugar de recogida debe estar dentro del área de servicio de Barcelona y alrededores'
};

// Función para verificar si un punto está dentro del polígono
export function isPointInPolygon(point, polygon) {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    
    const intersect = ((yi > point.lat) !== (yj > point.lat))
        && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
        
    if (intersect) inside = !inside;
  }
  
  return inside;
}
