# TaxiClass - Frontend

Sistema de reservas de taxis con integración API Auriga - Aplicación Frontend

## 🚀 Tecnologías

- **React 19** con Vite
- **Redux Toolkit** para gestión de estado
- **Material-UI 5** + **Tailwind CSS** para estilos
- **React Router DOM** para navegación
- **Axios** para peticiones HTTP
- **React Hook Form** para formularios
- **React Hot Toast** para notificaciones
- **Google Maps API** para autocompletado de direcciones
- **dayjs** para manejo de fechas

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Clave API de Google Maps

## 🔧 Instalación

1. Clonar el repositorio:
```bash
git clone [url-del-repo]
cd reservas-taxiclass
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env` en la raíz con las variables de entorno:
```env
VITE_API_URL=http://localhost/reservas-taxiclass/backend
VITE_GOOGLE_MAPS_API_KEY=tu_clave_google_maps
```

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

### Producción
```bash
npm run build
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── auth/           # Componentes de autenticación
│   ├── common/         # Componentes reutilizables
│   ├── dashboard/      # Componentes del dashboard
│   └── reservations/   # Componentes de reservas
├── pages/              # Páginas principales
├── routes/             # Configuración de rutas
├── services/           # Servicios API
├── store/              # Redux store y slices
├── theme/              # Configuración de tema MUI
├── hooks/              # Custom hooks
├── utils/              # Utilidades
├── config/             # Configuraciones (área restrictions, etc)
└── constants/          # Constantes de la aplicación
```

## 🔐 Características de Seguridad

- Autenticación JWT con tokens
- Verificación de dos factores (2FA) por email
- Rutas protegidas
- Interceptores Axios para manejo de tokens
- Validación de áreas geográficas para recogidas

## 🎨 Diseño y Estilos

- **Colores principales:**
  - Primario: `#011850`
  - Secundario: `#05D9D9`
- **Tipografía:** Inter (inspirada en ChatGPT)
- **BorderRadius:** 4px en todos los inputs
- **Diseño responsive** con breakpoints de Material-UI

## 🚦 Páginas Disponibles

1. **HomePage** - Página de inicio
2. **LoginPage** - Login con 2FA
3. **RegisterPage** - Registro (deshabilitado en producción)
4. **DashboardPage** - Panel principal con reservas
5. **NewReservationPage** - Crear nueva reserva (4 pasos)
6. **ProfilePage** - Gestión del perfil de usuario
7. **HelpPage** - Documentación para usuarios

## 🔌 Integraciones Externas

### Google Maps
- Autocompletado de direcciones
- Restricción por países: FR, DE, IT, ES, CH
- Restricción de área para Barcelona (configurable)

### API Backend
- Base URL configurable vía variable de entorno
- Autenticación JWT
- Endpoints para reservas, perfil, actividades

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Vista previa de build
- `npm run lint` - Ejecuta ESLint

## 📝 Notas de Desarrollo

- El componente AddressAutocomplete soporta dos modos: Google Maps y lugares predefinidos
- El DateTimePicker está configurado en español con formato 24h
- Los toasts se usan para toda comunicación con el usuario
- El sistema de actividades registra todas las acciones importantes

## 🐛 Consideraciones

- En desarrollo, el código 2FA se muestra en la consola del navegador
- El botón de registro está deshabilitado intencionalmente
- withCredentials está en false para desarrollo (cambiar en producción)

## 📞 Soporte

Para soporte técnico o preguntas sobre el frontend, contactar al equipo de desarrollo.
