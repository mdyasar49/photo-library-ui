import React, { useEffect, useRef } from "react";
import { Stack, Typography, IconButton } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";

export default function FileUpload({ files = [], setFiles, label = "Upload Photos", viewOnly = false }) {
  const fileInputRef = useRef();

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file?.preview));
  }, [files]);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewOnly) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map((f) => Object.assign(f, { preview: URL.createObjectURL(f) }));
      setFiles([...files, ...newFiles]);
    }
  };

  const handleRemove = (index) => {
    if (viewOnly) return;
    const updated = [...files];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setFiles(updated);
  };

if (viewOnly && files.length === 0) {
    return (
      <Stack
        direction="column"
        spacing={1}
        sx={{
          border: "2px dashed #ccc",
          borderRadius: 2,
          p: 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="body2" color="text.secondary" textAlign="center">
          No files to display
        </Typography>
      </Stack>
    );
  }
  return (
    <Stack
      direction="column"
      spacing={1}
      sx={{
        border: "2px dashed #ccc",
        borderRadius: 2,
        p: 2,
        alignItems: "center",
        justifyContent: "center",
        cursor: viewOnly ? "default" : "pointer",
        position: "relative",
        "&:hover": { borderColor: viewOnly ? "#ccc" : "#1976d2" },
      }}
      onClick={() => !viewOnly && fileInputRef.current.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {files.length > 0 ? (
        <Stack direction="row" spacing={1} justifyContent="flex-start" sx={{ flexWrap: "wrap" }}>
          {files.map((file, i) => (
            <Stack key={i} spacing={1} sx={{ position: "relative" }}>
              <img
                src={file.preview}
                alt={file.name}
                style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4 }}
              />
              {!viewOnly && (
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleRemove(i); }}
                  sx={{ position: "absolute", top: 0, right: 0, bgcolor: "rgba(0,0,0,0.4)", "&:hover": { bgcolor: "rgba(0,0,0,0.6)" } }}
                >
                  <CloseIcon sx={{ color: "white" }} />
                </IconButton>
              )}
            </Stack>
          ))}
        </Stack>
      ) : (
        <>
          <UploadFileIcon fontSize="large" color="action" />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {label} <br /> Drag & Drop or Click to Upload
          </Typography>
        </>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        multiple
        onChange={(e) => {
          if (!viewOnly && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map((f) =>
              Object.assign(f, { preview: URL.createObjectURL(f) })
            );
            setFiles([...files, ...newFiles]);
          }
        }}
        style={{ display: "none" }}
        disabled={viewOnly}
      />
    </Stack>
  );
}

FileUpload.propTypes = {
  files: PropTypes.array.isRequired,
  setFiles: PropTypes.func.isRequired,
  label: PropTypes.string,
  viewOnly: PropTypes.bool,
};
