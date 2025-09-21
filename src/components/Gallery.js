import React from "react";
import PhotoCard from "./PhotoCard";
import { Grid, Typography, CircularProgress, Box, Stack } from "@mui/material";

export default function Gallery({ photos, loading, reload }) {
    if (loading) {
        return <CircularProgress sx={{ display: "block", mx: "auto", mt: 5 }} />;
    }

    if (!photos.length) {
        return (
            <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 5 }}>
                No photos uploaded yet
            </Typography>
        );
    }

    // Group photos by directory
    const groupedPhotos = photos.reduce((acc, photo) => {
        const dir = photo.directory || "others";
        if (!acc[dir]) acc[dir] = [];
        acc[dir].push(photo);
        return acc;
    }, {});

    return (
        <Box sx={{ flexGrow: 1 }}>
            {Object.keys(groupedPhotos).map((directory) => (
                <Stack key={directory} spacing={1} sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ px: 2, py: 1, bgcolor: "#f0f0f0", borderRadius: 1 }}>
                        {directory}
                    </Typography>

                    <Grid container spacing={2} sx={{ px: 2 }}>
                        {groupedPhotos[directory].map((photo) => (
                            <PhotoCard
                                key={photo.id}
                                photos={[photo]}
                                onDeleted={reload}
                                onUpdated={reload}
                            />
                        ))}
                    </Grid>
                </Stack>
            ))}
        </Box>
    );
}
