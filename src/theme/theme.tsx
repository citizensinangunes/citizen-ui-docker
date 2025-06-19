import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#004aad', // Citizen mavi
    },
    secondary: {
      main: '#004aad', // Citizen mavi
    },
    background: {
      default: '#F8F8FF', // Kırık beyaz
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#004aad', // Citizen mavi
    },
  },
  typography: {
    fontFamily: [
      'IBM Plex Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    // Page titles
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01562em',
      lineHeight: 1.2,
      color: '#333333',
    },
    // Section titles
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.00833em',
      lineHeight: 1.2,
      color: '#333333',
    },
    // Card titles, important sections
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0em',
      lineHeight: 1.2,
      color: '#333333',
    },
    // Sub-section titles
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.00735em',
      lineHeight: 1.2,
      color: '#004aad',
    },
    // Component titles
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0em',
      lineHeight: 1.2,
      color: '#333333',
    },
    // Small section titles
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '0.0075em',
      lineHeight: 1.2,
      color: '#333333',
    },
    // Regular body text
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0.00938em',
      lineHeight: 1.5,
      color: '#555555',
    },
    // Secondary body text, captions
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.01071em',
      lineHeight: 1.5,
      color: '#666666',
    },
    // Interactive elements text
    button: {
      textTransform: 'none',
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.02857em',
      lineHeight: 1.75,
    },
    // Labels, chips, badges
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      letterSpacing: '0.03333em',
      lineHeight: 1.66,
      color: '#666666',
    },
    // Section dividers, tabs
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.00938em',
      lineHeight: 1.5,
      color: '#333333',
    },
    // Content headers
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.00714em',
      lineHeight: 1.57,
      color: '#4a4a4a',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          fontWeight: 500,
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#004aad',
          color: 'white',
          '&:hover': {
            backgroundColor: '#003a87',
          }
        },
        outlined: {
          borderColor: '#004aad',
          color: '#004aad',
          '&:hover': {
            backgroundColor: 'rgba(0, 74, 173, 0.04)',
            borderColor: '#003a87',
          }
        },
        text: {
          color: '#004aad',
          '&:hover': {
            backgroundColor: 'rgba(0, 74, 173, 0.04)',
          }
        }
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#f5f5f0', // Kırık beyaz
          border: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minWidth: 'auto',
          fontWeight: 500,
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;