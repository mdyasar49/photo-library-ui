import React from "react";
import { Stack, IconButton, Tooltip, Box } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { BASE_URL } from "../constants";

export default function Image({ photo, handleView, handleEdit, handleDownload, deletePhoto }) {
    return (
        <Stack
            sx={{
                position: "relative",
                width: "100%",
                height: 220,
                overflow: "hidden",
                "&:hover .overlay": {
                  opacity: 1,
                  backdropFilter: "blur(4px)"
                },
                "&:hover img": {
                  transform: "scale(1.05)"
                }
            }}
        >
            <Box sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
                <img
                    src={`${BASE_URL}${photo.url}`}
                    alt={photo.description || "photo"}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transition: "transform 0.4s ease"
                    }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/fallback.png";
                    }}
                />
            </Box>

            <Stack
                className="overlay"
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    bgcolor: "rgba(0,0,0,0.4)",
                    opacity: 0,
                    transition: "opacity 0.3s ease-in-out",
                }}
            >
                <Tooltip title="View">
                    <IconButton onClick={handleView} sx={{ color: "white" }}>
                        <VisibilityIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                    <IconButton onClick={handleEdit} sx={{ color: "white" }}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                    <IconButton onClick={handleDownload} sx={{ color: "white" }}>
                        <DownloadIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                    <IconButton onClick={deletePhoto} sx={{ color: "white" }}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Stack>
    );
}
