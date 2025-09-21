import React, { useEffect, useRef } from "react";
import { Stack, Typography, IconButton } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";

export default function FileUpload({
  files = [],
  file,
  setFiles,
  setFile,
  label = "Upload Photos",
  viewOnly = false,
  multiple = true,
}) {
  const fileInputRef = useRef();

  useEffect(() => {
    if (multiple) {
      return () => files.forEach((f) => URL.revokeObjectURL(f?.preview));
    } else if (file) {
      return () => URL.revokeObjectURL(file.preview);
    }
  }, [files, file, multiple]);

  const handleFiles = (selectedFiles) => {
    if (multiple) {
      const newFiles = Array.from(selectedFiles).map((f) =>
        Object.assign(f, { preview: URL.createObjectURL(f) })
      );
      setFiles([...files, ...newFiles]);
    } else {
      const f = selectedFiles[0];
      setFile(Object.assign(f, { preview: URL.createObjectURL(f) }));
    }
  };

  const handleRemove = (index) => {
    if (viewOnly) return;
    if (multiple) {
      const updated = [...files];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      setFiles(updated);
    } else {
      URL.revokeObjectURL(file.preview);
      setFile(null);
    }
  };

  const currentFiles = multiple ? files : file ? [file] : [];

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
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewOnly) return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFiles(e.dataTransfer.files);
        }
      }}
    >
      {currentFiles.length > 0 ? (
        <Stack direction="row" spacing={1} justifyContent="flex-start" sx={{ flexWrap: "wrap" }}>
          {currentFiles.map((f, i) => (
            <Stack key={i} spacing={1} sx={{ position: "relative" }}>
              <img
                src={f.preview}
                alt={f.name}
                style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4 }}
              />
              {!viewOnly && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(i);
                  }}
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
        multiple={multiple}
        onChange={(e) => {
          if (!viewOnly && e.target.files.length > 0) {
            handleFiles(e.target.files);
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
