'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: true,

  palette: {
    mode: 'light',

    primary: {
      main: '#3D2312',
      light: '#56351F',
      dark: '#2B180D',
      contrastText: '#FFFFFF',
    },

    secondary: {
      main: '#B3832F',
      contrastText: '#3D2312',
    },

    success: {
      main: '#526344',
      contrastText: '#FFFFFF',
    },

    warning: {
      main: '#805A13',
    },

    error: {
      main: '#A33A32',
    },

    info: {
      main: '#355F72',
    },

    background: {
      default: '#FAF6EE',
      paper: '#FFFFFF',
    },

    text: {
      primary: '#3D2312',
      secondary: '#725C4A',
    },

    divider: '#D3C2A8',
  },

  shape: {
    borderRadius: 8,
  },

  typography: {
    fontFamily: 'Arial, Helvetica, sans-serif',

    h1: {
      fontWeight: 700,
    },

    h2: {
      fontWeight: 700,
    },

    h3: {
      fontWeight: 700,
    },

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 700,
    },

    h6: {
      fontWeight: 700,
    },

    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(61, 35, 18, 0.08)',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;