import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, IconButton, AppBar, Toolbar, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Stack, Grid, Paper } from '@mui/material';
import { Search as SearchIcon, CloudUpload as CloudUploadIcon, DeleteOutline as DeleteIcon, Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material';
import api, { BASE_URL } from './api';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  
  const fetchPhotos = async (query = '') => {
    setLoading(true);
    try {
      const endpoint = query ? `/photos/search?q=${encodeURIComponent(query)}` : '/photos';
      const res = await api.get(endpoint);
      setPhotos(res.data);
    } catch (error) {
      console.error('Failed to fetch photos', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPhotos(searchQuery);
  }, [searchQuery]);

  const groupedPhotos = photos.reduce((acc, photo) => {
    const dir = photo.directory || "Library";
    if (!acc[dir]) acc[dir] = [];
    acc[dir].push(photo);
    return acc;
  }, {});

  const handleDeleteDirectory = async (dir) => {
    if (!window.confirm(`Delete entire directory '${dir}'?`)) return;
    try {
      const targetDir = dir === "Library" ? "others" : dir;
      await api.delete(`/photos/directory/${encodeURIComponent(targetDir)}`);
      fetchPhotos(searchQuery);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      {/* Apple-like Navbar */}
      <AppBar position="sticky" elevation={0} className="apple-blur" sx={{ borderBottom: '1px solid rgba(0,0,0,0.05)', top: 0, zIndex: 1000, background: 'transparent' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em' }}>
              Photos
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative', display: { xs: 'none', md: 'block' } }}>
                <SearchIcon sx={{ position: 'absolute', left: 12, top: 10, color: '#86868b', fontSize: 20 }} />
                <input 
                  type="text" 
                  placeholder="Search photos..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '8px 16px 8px 40px',
                    fontSize: '14px',
                    outline: 'none',
                    width: '256px',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #0071e3'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </Box>
              <Button 
                variant="contained" 
                startIcon={<CloudUploadIcon />}
                onClick={() => setUploadOpen(true)}
                disableElevation
                sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
              >
                Upload
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 6 }}>
        {/* Mobile Search */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4, position: 'relative' }}>
          <SearchIcon sx={{ position: 'absolute', left: 12, top: 12, color: '#86868b', fontSize: 20 }} />
          <input 
            type="text" 
            placeholder="Search photos..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'rgba(0,0,0,0.05)',
              border: 'none',
              borderRadius: '9999px',
              padding: '12px 16px 12px 40px',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #0071e3'}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress />
          </Box>
        ) : photos.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <Typography variant="h5" color="text.secondary" fontWeight={500}>No photos found</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>Upload some moments to get started.</Typography>
          </Box>
        ) : (
          Object.entries(groupedPhotos).map(([dir, dirPhotos]) => (
            <Box key={dir} sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {dir}
                </Typography>
                <IconButton size="small" onClick={() => handleDeleteDirectory(dir)} sx={{ color: '#ff3b30' }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
              
              <Grid container spacing={3}>
                {dirPhotos.map((photo) => (
                  <Grid key={photo.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <PhotoCard photo={photo} onUpdate={() => fetchPhotos(searchQuery)} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        )}
      </Container>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUpload={() => fetchPhotos(searchQuery)} />
    </Box>
  );
}

function PhotoCard({ photo, onUpdate }) {
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    if(!window.confirm('Delete this photo?')) return;
    try {
      await api.delete(`/photos/${photo.id}`);
      onUpdate();
    } catch (e) { console.error(e); }
  };

  return (
    <>
      <div className="apple-card group" style={{ position: 'relative', overflow: 'hidden', height: '256px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => setEditOpen(true)}>
        <Box sx={{ height: '75%', width: '100%', overflow: 'hidden', position: 'relative' }}>
          <img 
            src={`${BASE_URL}${photo.url}`} 
            alt={photo.description || 'photo'} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f5f5f7'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%2386868b'%3ENo Image%3C/text%3E%3C/svg%3E";
            }}
          />
        </Box>
        <Box sx={{ p: 2, height: '25%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {photo.tags && photo.tags.length > 0 && (
            <Typography variant="caption" sx={{ color: '#0071e3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
              {photo.tags.join(' • ')}
            </Typography>
          )}
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1d1d1f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {photo.description || photo.filename}
          </Typography>
        </Box>

        {/* Hover Actions */}
        <Box sx={{ position: 'absolute', top: 8, right: 8, opacity: 0.9, transition: 'opacity 0.3s', display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(); }} sx={{ bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', '&:hover': { bgcolor: 'rgba(255,59,48,0.1)', color: '#ff3b30' } }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </div>
      <EditModal photo={photo} open={editOpen} onClose={() => setEditOpen(false)} onUpdate={onUpdate} />
    </>
  );
}

function EditModal({ photo, open, onClose, onUpdate }) {
  const [tags, setTags] = useState(photo.tags ? photo.tags.join(', ') : '');
  const [description, setDescription] = useState(photo.description || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if(open) {
      setTags(photo.tags ? photo.tags.join(', ') : '');
      setDescription(photo.description || '');
    }
  }, [open, photo]);

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append('tags', tags);
    fd.append('description', description);
    try {
      await api.put(`/photos/${photo.id}`, fd);
      onUpdate();
      onClose();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>Edit Photo</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', maxHeight: 300, display: 'flex', justifyContent: 'center', bgcolor: '#f5f5f7' }}>
          <img src={`${BASE_URL}${photo.url}`} alt={photo.filename} style={{ maxHeight: 300, objectFit: 'contain' }} />
        </Box>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Tags (comma separated)" fullWidth value={tags} onChange={(e) => setTags(e.target.value)} variant="outlined" />
          <TextField label="Description" fullWidth multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} variant="outlined" />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} sx={{ color: '#86868b' }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving} disableElevation sx={{ borderRadius: 20 }}>Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
}

function UploadModal({ open, onClose, onUpload }) {
  const [files, setFiles] = useState([]);
  const [directory, setDirectory] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (!files.length) return alert('Select files to upload');
    setUploading(true);
    const fd = new FormData();
    files.forEach(f => fd.append('photos', f));
    fd.append('directory', directory);
    fd.append('tags', tags);
    fd.append('description', description);

    try {
      await api.post('/photos', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      setFiles([]);
      setDirectory('');
      setTags('');
      setDescription('');
      onUpload();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    }
    setUploading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>Upload Photos</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box sx={{ border: '2px dashed #d2d2d7', borderRadius: 3, p: 4, textAlign: 'center', bgcolor: '#fbfbfd', cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f7' } }} component="label">
            <CloudUploadIcon sx={{ fontSize: 48, color: '#0071e3', mb: 1 }} />
            <Typography variant="subtitle1" fontWeight={600}>Click to select photos</Typography>
            <Typography variant="body2" color="text.secondary">{files.length} file(s) selected</Typography>
            <input type="file" multiple hidden onChange={handleFileChange} accept="image/*" />
          </Box>
          <TextField label="Directory Name (optional)" fullWidth value={directory} onChange={(e) => setDirectory(e.target.value)} variant="outlined" />
          <TextField label="Tags (comma separated)" fullWidth value={tags} onChange={(e) => setTags(e.target.value)} variant="outlined" />
          <TextField label="Description" fullWidth multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} variant="outlined" />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} sx={{ color: '#86868b' }}>Cancel</Button>
        <Button variant="contained" onClick={handleUpload} disabled={uploading || files.length === 0} disableElevation sx={{ borderRadius: 20 }}>Upload</Button>
      </DialogActions>
    </Dialog>
  );
}
