import React from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Home from "./components/Home";

export default function App() {
  const theme = createTheme({
    customShadows: {
      z20: '0px 4px 20px rgba(0,0,0,0.2)',
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <Home />
    </ThemeProvider>
  );
}
