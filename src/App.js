import React from "react";
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Home from "./components/Home";

export default function App() {
  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#38bdf8', // Tailwind sky-400
      },
      secondary: {
        main: '#c084fc', // Tailwind purple-400
      },
      background: {
        paper: 'rgba(30, 41, 59, 0.7)',
        default: 'transparent'
      }
    },
    typography: {
      fontFamily: '"Outfit", sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 }
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            padding: '8px 24px',
          },
          contained: {
            boxShadow: '0 4px 14px 0 rgba(56, 189, 248, 0.39)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(56, 189, 248, 0.23)',
              transform: 'translateY(-1px)'
            }
          }
        }
      }
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Home />
    </ThemeProvider>
  );
}
