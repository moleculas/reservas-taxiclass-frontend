import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#011850',
      light: '#334975',
      dark: '#000c2b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#05D9D9',
      light: '#5de7e7', 
      dark: '#00a8a8',
      contrastText: '#011850',
    },
    background: {
      default: '#f7f7f7',
      paper: '#ffffff',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      lighter: '#D1FAE5',
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
    },
    text: {
      primary: '#011850',
      secondary: '#4a5568',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: '16px',
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4, // Reducido de 8 a 4
            '& input': {
              padding: '14px 14px', // Aumentado para más altura
            },
            '&.MuiInputBase-sizeSmall': {
              '& input': {
                padding: '12px 14px', // También más alto para size="small"
              },
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          '& input': {
            padding: '14px 14px',
          },
          '&.MuiInputBase-sizeSmall': {
            '& input': {
              padding: '12px 14px',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: 4,
          padding: '14px 14px',
          '&.MuiInputBase-sizeSmall': {
            padding: '12px 14px',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
      },
    },
    // Overrides para los componentes de fecha y hora
    MuiPickersTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
          },
        },
      },
    },
    MuiDateTimePickerToolbar: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiPickersPopper: {
      styleOverrides: {
        paper: {
          borderRadius: 8, // Un poco más redondeado para el popup
        },
      },
    },
  },
});
