import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Box, Stack, Paper } from "@mui/material";
import SearchBar from "./SearchBar";
import Gallery from "./Gallery";
import axios from "../api";

export default function Home() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPhotos = () => {
    setLoading(true);
    axios
      .get("/photos")
      .then((res) => setPhotos(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      <Stack
        direction="column"
        spacing={4}
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: 2,
        }}
      >
        <Paper elevation={0} sx={{ borderRadius: 4, p: 3, display: 'flex', alignItems: 'center', background: 'linear-gradient(90deg, rgba(15,23,42,0.6) 0%, rgba(51,65,85,0.6) 100%)', borderLeft: '4px solid #38bdf8' }}>
          <Typography variant="h4" sx={{ flexGrow: 1, background: '-webkit-linear-gradient(45deg, #38bdf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Photo Vault
          </Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
          <SearchBar
            photos={photos}
            setPhotos={setPhotos}
            setLoading={setLoading}
            onUpdated={loadPhotos}
          />
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, minHeight: 600 }}>
          <Typography
            variant="h5"
            sx={{ mb: 4, color: "#e2e8f0" }}
          >
            Your Gallery
          </Typography>
          <Gallery photos={photos} loading={loading} reload={loadPhotos} />
        </Paper>
      </Stack>
    </Box>
  );
}
