import React, { useState } from "react";
import { Stack, Paper, Grid, Typography } from "@mui/material";
import EditModal from "./EditModal";
import Image from "./Image";
import axios from "../api";
import ConfirmDialog from "./Popup/ConfirmDialog";

export default function PhotoCard({ photos, onDeleted, onUpdated, viewOnly = false }) {
    const [showEdit, setShowEdit] = useState(false);
    const [editData, setEditData] = useState({});
    const [isViewOnly, setIsViewOnly] = useState(false);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState(null);

    const handleView = (photo) => {
        setEditData(photo);
        setIsViewOnly(true);
        setShowEdit(true);
    };

    const handleEdit = (photo) => {
        setEditData(photo);
        setIsViewOnly(false);
        setShowEdit(true);
    };

    const handleDeleteClick = (photo) => {
        setPhotoToDelete(photo);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!photoToDelete) return;
        axios
            .delete(`/photos/${photoToDelete.id}`)
            .then(() => {
                onDeleted && onDeleted();
                setDeleteConfirmOpen(false);
                setPhotoToDelete(null);
            })
            .catch(() => {
                alert("Failed to delete photo");
                setDeleteConfirmOpen(false);
                setPhotoToDelete(null);
            });
    };

    return (
        <>
            {photos.map((p) => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Stack
                        direction="column"
                        component={Paper}
                        spacing={0}
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            backgroundColor: "rgba(30, 41, 59, 0.6)",
                            position: "relative",
                            overflow: "hidden",
                            transition: "all 0.3s ease",
                            border: "1px solid rgba(255,255,255,0.05)",
                            "&:hover": {
                                transform: "translateY(-6px)",
                                boxShadow: "0 12px 24px rgba(0,0,0,0.4), 0 0 15px rgba(56, 189, 248, 0.2)",
                                borderColor: "rgba(56, 189, 248, 0.5)"
                            },
                        }}
                    >
                        {/* <Typography
                            variant="subtitle2"
                            sx={{
                                backgroundColor: "#1976d2",
                                color: "white",
                                px: 1,
                                py: 0.5,
                                textAlign: "center",
                                fontWeight: "bold",
                            }}
                        >
                            {p.directory ? p.directory : "others"}
                        </Typography> */}

                        <Image
                            photo={p}
                            handleView={() => handleView(p)}
                            handleEdit={() => handleEdit(p)}
                            handleDownload={() => {
                                const link = document.createElement("a");
                                link.href = p.url;
                                link.download = p.filename;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            deletePhoto={() => handleDeleteClick(p)}
                        />

                        <Stack sx={{ alignItems: "flex-start", p: 2 }}>
                            {p.tags && p.tags.length > 0 && (
                                <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: 600, mb: 0.5, letterSpacing: 0.5 }}>
                                    {p.tags.join(" • ").toUpperCase()}
                                </Typography>
                            )}
                            {p.description && (
                                <Typography variant="body2" sx={{ color: "#cbd5e1", lineHeight: 1.4 }}>
                                    {p.description}
                                </Typography>
                            )}
                        </Stack>
                    </Stack>
                </Grid>
            ))}

            {showEdit && (
                <EditModal
                    openPopup={showEdit}
                    photo={editData}
                    viewOnly={isViewOnly}
                    onEdit={() => {
                        setIsViewOnly(false);
                        setShowEdit(true);
                    }}
                    onClose={() => {
                        setShowEdit(false);
                        onUpdated && onUpdated();
                    }}
                />
            )}

            <ConfirmDialog
                open={deleteConfirmOpen}
                title="Delete Photo?"
                message="Are you sure you want to delete this photo? This action cannot be undone."
                onCancel={() => setDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </>
    );
}
