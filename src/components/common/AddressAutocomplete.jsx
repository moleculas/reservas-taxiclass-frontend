import { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  Typography,
  Chip,
  CircularProgress,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Tooltip,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import {
  LocationOn,
  Flight,
  Train,
  Business,
  Place,
  Hotel,
  LocalHospital,
  School,
  ShoppingCart,
  Restaurant,
  LocalParking,
  DirectionsBus,
  Apartment,
  Home,
  Work,
  Stadium
} from '@mui/icons-material';
import { useLoadScript } from '@react-google-maps/api';
import { toast } from 'react-hot-toast';
import locationService from '../../services/locationService';
import { PICKUP_AREA_RESTRICTION, isPointInPolygon } from '../../config/areaRestrictions';

const libraries = ['places'];

const AddressAutocomplete = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  required = false,
  error = false,
  helperText = '',
  restrictToArea = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [predefinedLocations, setPredefinedLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usePredefined, setUsePredefined] = useState(false); // Estado para el switch
  const googleInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Cargar Google Maps
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
    language: 'es'
  });

  // Cargar localizaciones predefinidas
  useEffect(() => {
    loadPredefinedLocations();
  }, []);

  // Sincronizar inputValue con value cuando cambia externamente
  useEffect(() => {
    if (value) {
      setInputValue(value.address || value.name || '');
    } else {
      setInputValue('');
    }
  }, [value]);

  const loadPredefinedLocations = async () => {
    try {
      const response = await locationService.getPredefinedLocations();
      setPredefinedLocations(response.locations || []);
    } catch (error) {
      console.error('Error cargando localizaciones:', error);
    }
  };

  // Mapa de iconos disponibles
  const iconMap = {
    Flight: Flight,
    Train: Train,
    Business: Business,
    Place: Place,
    Hotel: Hotel,
    LocalHospital: LocalHospital,
    School: School,
    ShoppingCart: ShoppingCart,
    Restaurant: Restaurant,
    LocalParking: LocalParking,
    DirectionsBus: DirectionsBus,
    Apartment: Apartment,
    Home: Home,
    Work: Work,
    Stadium: Stadium,
    LocationOn: LocationOn
  };

  // Obtener icono dinámicamente
  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || Place;
    return <IconComponent sx={{ color: 'action.active' }} />;
  };

  // Configurar Google Autocomplete cuando se carga
  useEffect(() => {
    if (isLoaded && googleInputRef.current && !usePredefined) {
      const autocompleteOptions = {
        componentRestrictions: { country: ["FR", "DE", "IT", "ES", "CH"] },
        fields: ['address_components', 'geometry', 'formatted_address', 'place_id']
      };
      
      // Agregar restricción de bounds si está activada
      if (restrictToArea && PICKUP_AREA_RESTRICTION.enabled) {
        autocompleteOptions.bounds = new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(PICKUP_AREA_RESTRICTION.bounds.south, PICKUP_AREA_RESTRICTION.bounds.west),
          new window.google.maps.LatLng(PICKUP_AREA_RESTRICTION.bounds.north, PICKUP_AREA_RESTRICTION.bounds.east)
        );
        autocompleteOptions.strictBounds = true;
      }
      
      const googleAutocomplete = new window.google.maps.places.Autocomplete(
        googleInputRef.current,
        autocompleteOptions
      );

      googleAutocomplete.addListener('place_changed', () => {
        const place = googleAutocomplete.getPlace();
        if (place.geometry) {
          const coordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          
          // Verificar si está dentro del área permitida
          if (restrictToArea && PICKUP_AREA_RESTRICTION.enabled) {
            if (!isPointInPolygon(coordinates, PICKUP_AREA_RESTRICTION.polygon)) {
              toast.error(PICKUP_AREA_RESTRICTION.errorMessage);
              setInputValue('');
              onChange(null);
              return;
            }
          }
          
          const locationData = {
            type: 'google',
            address: place.formatted_address,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            placeId: place.place_id,
            googlePlace: place,
            address_components: place.address_components,
            geometry: {
              location: {
                lat: () => place.geometry.location.lat(),
                lng: () => place.geometry.location.lng()
              }
            }
          };
          onChange(locationData);
          setInputValue(place.formatted_address);
        }
      });

      autocompleteRef.current = googleAutocomplete;

      // Cleanup
      return () => {
        if (autocompleteRef.current) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
      };
    }
  }, [isLoaded, onChange, restrictToArea, usePredefined]);

  // Manejar cambio de switch
  const handleSwitchChange = (event) => {
    setUsePredefined(event.target.checked);
    // Limpiar el valor actual al cambiar de modo
    onChange(null);
    setInputValue('');
  };

  // Manejar selección de lugar predefinido
  const handlePredefinedChange = (event) => {
    const selectedId = event.target.value;
    const location = predefinedLocations.find(loc => loc.id === selectedId);
    
    if (location) {
      const locationData = {
        type: 'predefined',
        id: location.id,
        name: location.name,
        address: location.address,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        googlePlace: {
          formatted_address: location.address,
          geometry: {
            location: {
              lat: () => parseFloat(location.latitude),
              lng: () => parseFloat(location.longitude)
            }
          },
          address_components: [
            {
              long_name: location.address.split(',')[0] || location.address,
              short_name: location.address.split(',')[0] || location.address,
              types: ['route']
            },
            {
              long_name: 'Barcelona',
              short_name: 'Barcelona',
              types: ['locality']
            },
            {
              long_name: 'Barcelona',
              short_name: 'Barcelona',
              types: ['administrative_area_level_2']
            },
            {
              long_name: 'Spain',
              short_name: 'ES',
              types: ['country']
            }
          ]
        }
      };
      onChange(locationData);
      setInputValue(location.address);
    } else {
      onChange(null);
      setInputValue('');
    }
  };

  // Renderizar el componente según el modo
  if (usePredefined) {
    // Modo desplegable de lugares predefinidos
    return (
      <Box sx={{ position: 'relative' }}>
        <FormControl fullWidth required={required} error={error}>
          <InputLabel>{label}</InputLabel>
          <Select
            value={value?.id || ''}
            onChange={handlePredefinedChange}
            label={label}
            endAdornment={
              <InputAdornment position="end" sx={{ mr: 1 }}>
                <Tooltip 
                  title="Cambiar a búsqueda de direcciones" 
                  placement="left"
                >
                  <Switch
                    checked={usePredefined}
                    onChange={handleSwitchChange}
                    size="small"
                    color="primary"
                  />
                </Tooltip>
              </InputAdornment>
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px',
              },
            }}
          >
            <MenuItem value="">
              <em>Selecciona un lugar frecuente</em>
            </MenuItem>
            {predefinedLocations.map((location) => (
              <MenuItem key={location.id} value={location.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getIcon(location.icon)}
                  </ListItemIcon>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {location.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {location.address}
                    </Typography>
                  </Box>
                  <Chip 
                    label="Lugar frecuente" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ ml: 2 }}
                  />
                </Box>
              </MenuItem>
            ))}
          </Select>
          {helperText && (
            <FormHelperText error={error}>
              {helperText}
            </FormHelperText>
          )}
        </FormControl>
      </Box>
    );
  }

  // Modo Google Maps (por defecto)
  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        inputRef={googleInputRef}
        label={label}
        placeholder={placeholder || "Busca una dirección..."}
        required={required}
        error={error}
        helperText={helperText}
        fullWidth
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (!e.target.value || e.target.value.trim() === '') {
            onChange(null);
          }
        }}
        onBlur={(e) => {
          if (!e.target.value || e.target.value.trim() === '') {
            onChange(null);
            setInputValue('');
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip 
                title="Cambiar a lugares frecuentes" 
                placement="left"
              >
                <Switch
                  checked={usePredefined}
                  onChange={handleSwitchChange}
                  size="small"
                  color="primary"
                />
              </Tooltip>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
          },
        }}
      />
    </Box>
  );
};

export default AddressAutocomplete;