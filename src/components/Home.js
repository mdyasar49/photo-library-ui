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
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", py: 3 }}>
      {/* Main container */}
      <Stack
        direction="column"
        spacing={3}
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: 2,
        }}
      >
        <Paper elevation={5} sx={{ borderRadius: 2 }}>
          <AppBar
            position="static"
            color="primary"
            elevation={0}
            sx={{ borderRadius: 2 }}
          >
            <Toolbar>
              <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: "bold" }}>
                Photo Library
              </Typography>
            </Toolbar>
          </AppBar>
        </Paper>

        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, backgroundColor: "#ffffff" }}>
          <SearchBar
            photos={photos}
            setPhotos={setPhotos}
            setLoading={setLoading}
            onUpdated={loadPhotos}
          />
        </Paper>

        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, backgroundColor: "#ffffff", maxHeight: 850  }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}
          >
            Gallery
          </Typography>
          <Gallery photos={photos} loading={loading} reload={loadPhotos} />
        </Paper>
      </Stack>
    </Box>
  );
}
