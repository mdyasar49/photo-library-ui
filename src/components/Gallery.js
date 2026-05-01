import React, { useState } from "react";
import PhotoCard from "./PhotoCard";
import { Grid, Typography, CircularProgress, Box, Stack, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "../api";
import ConfirmDialog from "./Popup/ConfirmDialog";

export default function Gallery({ photos, loading, reload }) {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [directoryToDelete, setDirectoryToDelete] = useState(null);

    const handleDeleteDirectory = (dir) => {
        setDirectoryToDelete(dir);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!directoryToDelete) return;

        axios.delete(`/photos/directory/${encodeURIComponent(directoryToDelete)}`)
            .then(() => {
                reload();
            })
            .catch(() => {
                alert("Failed to delete directory");
            })
            .finally(() => {
                setDeleteConfirmOpen(false);
                setDirectoryToDelete(null);
            });
    };

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
                    <Stack direction="row" alignItems="center" sx={{ px: 2, py: 1.5, bgcolor: "rgba(255,255,255,0.05)", borderRadius: 2, borderLeft: '4px solid #38bdf8' }}>
                        <Typography variant="h6" sx={{ flexGrow: 1, color: "#e2e8f0" }}>
                            {directory}
                        </Typography>
                        <IconButton size="small" sx={{ color: "#ef4444" }} onClick={() => handleDeleteDirectory(directory)}>
                            <DeleteIcon />
                        </IconButton>
                    </Stack>

                    <Box>
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
                    </Box>
                </Stack>
            ))}

            <ConfirmDialog
                open={deleteConfirmOpen}
                title="Delete Directory?"
                message={`Are you sure you want to delete all photos in "${directoryToDelete}"? This cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </Box>
    );
}
