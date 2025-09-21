import React, { useState, useEffect } from "react";
import {
  Stack,
  TextField,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "../api";
import { BASE_URL } from "../constants";
import DynamicPopup from "./Popup/DynamicPopup";
import ConfirmDialog from "./Popup/ConfirmDialog";
import FileUpload from "./fileupload/FileUpload";

export default function EditModal({ openPopup, photo, onClose, viewOnly=false, onEdit }) {
  const [tags, setTags] = useState((photo.tags || []).join(", "));
  const [description, setDescription] = useState(photo.description || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [directory, setDirectory] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview("");
    }
  }, [file]);

  const isUploadMode = photo.id === 0;

  /** ---------- Upload Mode ---------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!files.length) return alert("Select files first");

    const form = new FormData();
    for (const f of files) form.append("photos", f);
    form.append("directory", directory);
    form.append("tags", tags);
    form.append("description", description);

    setSaving(true);
    axios
      .post("/photos", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        alert("Uploaded");
        setFiles([]);
        setDirectory("");
        setTags("");
        setDescription("");
        onClose();
      })
      .catch((err) => {
        console.error(err);
        alert("Upload failed");
      })
      .finally(() => setSaving(false));
  };

  /** ---------- Reupload/Edit Mode ---------- */
  const save = () => {
    setSaving(true);
    const formData = new FormData();
    formData.append("tags", tags);
    formData.append("description", description);
    if (file) formData.append("photo", file);

    axios
      .put(`/photos/${photo.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => onClose())
      .catch((err) => {
        console.error(err);
        alert("Failed to save changes");
      })
      .finally(() => setSaving(false));
  };

  const handleRemove = () => setConfirmOpen(true);

  const handleConfirmRemove = () => {
    setFile(null);
    setPreview("");
    setConfirmOpen(false);
  };
 const poupTitle = isUploadMode ? "Upload Photo" : "Reupload Photo"
  return (
    <>
      <DynamicPopup
        title={viewOnly ? "View Upload" : poupTitle}
        openPopup={openPopup}
        onClose={onClose}
        maxWidth="md"
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* -------- Upload Mode -------- */}
          {isUploadMode && (
            <>
              <Typography variant="subtitle2">Select Files</Typography>
              <FileUpload
                files={files}
                setFiles={setFiles}
                label="Upload Photos"
                viewOnly={viewOnly}
              />
              {files.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {files.length} file(s) selected
                </Typography>
              )}

              <TextField
                label="Directory (e.g. uploaded/pic)"
                value={directory}
                onChange={(e) => setDirectory(e.target.value)}
                fullWidth
                disabled={viewOnly}
              />
            </>
          )}

          {/* -------- Reupload Mode -------- */}
          {!isUploadMode && (
            <Stack direction="row" spacing={2}>
              <Stack direction="column" spacing={1}>
                <Typography variant="subtitle2">Original Photo</Typography>
                <img
                  src={`${BASE_URL}${photo.url}`}
                  alt={description || "photo"}
                  style={{
                    width: "100%",
                    maxHeight: 160,
                    objectFit: "contain",
                    borderRadius: 4,
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${BASE_URL}/fallback.png`;
                  }}
                />
              </Stack>

              <Stack direction="column" spacing={1} sx={{ position: "relative" }}>
                <Typography variant="subtitle2">Reupload Photo</Typography>
                {!preview ? (
                  <FileUpload
                    file={file}
                    setFile={setFile}
                    preview={preview}
                    setPreview={setPreview}
                    label="Reupload Photo"
                    viewOnly={viewOnly}
                  />
                ) : (
                  <div style={{ position: "relative" }}>
                    <img
                      src={preview}
                      alt={description || "photo"}
                      style={{
                        width: "100%",
                        maxHeight: 160,
                        objectFit: "contain",
                        borderRadius: 4,
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleRemove}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        color: "white",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                )}
              </Stack>
            </Stack>
          )}

          <TextField
            label="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            fullWidth
            disabled={viewOnly}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            disabled={viewOnly}
            fullWidth
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            {viewOnly ? (
                <Button variant="contained" onClick={onEdit} disabled={saving}>
                  Edit
                </Button>
            ):(
              <>
                {isUploadMode ? (
                  <Button variant="contained" onClick={handleSubmit} disabled={saving}>
                    Upload
                  </Button>
                ) : (
                  <Button variant="contained" onClick={save} disabled={saving}>
                    Reupload
                  </Button>
                )}
              </>
            )}
          </Stack>
        </Stack>
      </DynamicPopup>

      {/* Confirm remove dialog for reupload */}
      <ConfirmDialog
        open={confirmOpen}
        title="Remove Reuploaded Photo?"
        message="Are you sure you want to remove the reuploaded photo and revert to the original?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmRemove}
        confirmText="Yes, Remove"
      />
    </>
  );
}
