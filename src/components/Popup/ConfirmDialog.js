import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import PropTypes from "prop-types";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = "Yes", cancelText = "Cancel" }) {
  return (
      <Dialog
          open={open}
          onClose={onCancel}
          sx={{
            zIndex: 3100,
            mx: 2,
            '& .MuiDialog-paper': {
                margin: '10px auto',
                position: 'absolute',
                transform: 'none',
            },
            borderRadius: "10px",
      }}
      >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{cancelText}</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};
