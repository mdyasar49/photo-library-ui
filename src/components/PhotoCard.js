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
                <Grid item key={p.id} xs={12} sm={6} md={4} lg={3}>
                    <Stack
                        direction="column"
                        component={Paper}
                        spacing={0.5}
                        sx={{
                            borderRadius: 2,
                            backgroundColor: "#f4f4f4",
                            position: "relative",
                            overflow: "hidden",
                            "&:hover": {
                                bgcolor: "background.paper",
                                boxShadow: (theme) => theme.customShadows?.z20 || 5,
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

                        <Stack alignItems="center" sx={{ p: 1 }}>
                            {p.tags && p.tags.length > 0 && (
                                <span style={{ fontSize: 12, color: "#555" }}>
                                    {p.tags.join(", ")}
                                </span>
                            )}
                            {p.description && (
                                <span style={{ fontSize: 14, textAlign: "center", color: "#333" }}>
                                    {p.description}
                                </span>
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
