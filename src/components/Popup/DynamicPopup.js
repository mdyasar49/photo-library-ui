import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const DynamicPopup = (props) => {
  const {
    title,
    children,
    openPopup,
    onClose,
    maxWidth = "sm",
  } = props;

  return (
    <Dialog
      open={openPopup}
      fullWidth
      maxWidth={maxWidth}
      sx={{
        zIndex: 2100,
        mx: 2,
        '& .MuiDialog-paper': {
            margin: '10px auto',
            position: 'absolute',
            transform: 'none',
        },
        borderRadius: "10px",
      }}
    >
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white', pt: 0.5, pb: 0.1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mt: 1 }}
        >
          <Typography
            variant="primaryTitle"
            sx={{
              color: 'white',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              pr: 1,
              flex: 1,
            }}
          >
            {title}
          </Typography>

          <IconButton sx={{ color: 'white', p: 0, ml: 1 }} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mb: 1 }}>
        {children}
      </DialogContent>
    </Dialog>
  );
};

DynamicPopup.propTypes = {
  title: PropTypes.string,
  children: PropTypes.object,
  openPopup: PropTypes.bool,
  onClose: PropTypes.func,
  maxWidth: PropTypes.string,
};

export default DynamicPopup;