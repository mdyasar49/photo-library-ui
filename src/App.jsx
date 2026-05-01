import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, IconButton, AppBar, Toolbar, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  CircularProgress, Stack, Grid, Paper, Fade, Tooltip, Avatar, Chip
} from '@mui/material';
import { 
  Search as SearchIcon, CloudUpload as CloudUploadIcon, 
  DeleteOutline as DeleteIcon, Edit as EditIcon, Close as CloseIcon, 
  Refresh as RefreshIcon, Check as CheckIcon, CloudDownload as CloudDownloadIcon,
  Folder as FolderIcon, Dashboard as DashboardIcon, Settings as SettingsIcon,
  Storage as StorageIcon, PhotoLibrary as PhotoLibraryIcon
} from '@mui/icons-material';
import api, { BASE_URL } from './api';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [dbViewOpen, setDbViewOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [stats, setStats] = useState({ total_photos: 0, total_size: '0 KB', version: '3.0.0' });
  const [activeDir, setActiveDir] = useState('All');

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

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats');
      setStats(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchPhotos(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchStats();
  }, [photos]);

  const directories = ['All', ...new Set(photos.map(p => p.directory || 'Library'))];
  
  const filteredPhotos = activeDir === 'All' 
    ? photos 
    : photos.filter(p => (p.directory || 'Library') === activeDir);

  const groupedPhotos = filteredPhotos.reduce((acc, photo) => {
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
    } catch (err) { console.error(err); }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} photos?`)) return;
    try {
      await api.post('/photos/bulk-delete', { ids: selectedIds });
      setSelectedIds([]);
      fetchPhotos(searchQuery);
    } catch (e) { console.error(e); }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fbfbfd' }}>
      {/* Sidebar */}
      <Box sx={{ 
        width: 280, 
        bgcolor: '#fff', 
        borderRight: '1px solid rgba(0,0,0,0.05)', 
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 1100
      }}>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src="/logo.png" sx={{ width: 40, height: 40, bgcolor: 'transparent' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1d1d1f', lineHeight: 1.2 }}>Photo Lib</Typography>
            <Typography variant="caption" sx={{ color: '#0071e3', fontWeight: 700 }}>v{stats.version} Bytecode</Typography>
          </Box>
        </Box>

        <Stack spacing={0.5} sx={{ px: 2, mt: 2 }}>
          <SidebarItem icon={<DashboardIcon />} label="Dashboard" active={activeDir === 'All'} onClick={() => setActiveDir('All')} />
          <Typography variant="caption" sx={{ px: 2, mt: 3, mb: 1, color: '#86868b', fontWeight: 700, textTransform: 'uppercase' }}>Folders</Typography>
          {directories.filter(d => d !== 'All').map(dir => (
            <SidebarItem 
              key={dir} 
              icon={<FolderIcon />} 
              label={dir} 
              active={activeDir === dir} 
              onClick={() => setActiveDir(dir)} 
              onDelete={() => handleDeleteDirectory(dir)}
            />
          ))}
        </Stack>

        <Box sx={{ mt: 'auto', p: 3 }}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f7', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <StorageIcon sx={{ fontSize: 16, color: '#0071e3' }} />
              <Typography variant="caption" fontWeight={700}>Storage Usage</Typography>
            </Box>
            <Typography variant="h6" fontWeight={800}>{stats.total_size}</Typography>
            <Typography variant="caption" color="text.secondary">{stats.total_photos} Photos stored</Typography>
          </Paper>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, ml: { md: '280px' }, position: 'relative' }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <Container maxWidth="xl">
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1d1d1f' }}>
                  {activeDir}
                </Typography>
                {selectedIds.length > 0 && (
                  <Chip 
                    label={`${selectedIds.length} selected`} 
                    onDelete={() => setSelectedIds([])}
                    deleteIcon={<CloseIcon />}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ position: 'relative' }}>
                  <SearchIcon sx={{ position: 'absolute', left: 12, top: 10, color: '#86868b', fontSize: 20 }} />
                  <input 
                    type="text" 
                    placeholder="Search photos, tags..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="apple-search-input"
                  />
                </Box>
                {filteredPhotos.length > 0 && (
                  <Button 
                    size="small" 
                    variant="text" 
                    onClick={() => {
                      if (selectedIds.length === filteredPhotos.length) {
                        setSelectedIds([]);
                      } else {
                        setSelectedIds(filteredPhotos.map(p => p.id));
                      }
                    }}
                    sx={{ color: '#0071e3', fontWeight: 600, mr: 1 }}
                  >
                    {selectedIds.length === filteredPhotos.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
                {selectedIds.length > 0 ? (
                  <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleBulkDelete} disableElevation sx={{ borderRadius: 20 }}>Delete Selected</Button>
                ) : (
                  <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={() => setUploadOpen(true)} disableElevation sx={{ borderRadius: 20 }}>Upload</Button>
                )}
                <IconButton onClick={() => setDbViewOpen(true)}><SettingsIcon /></IconButton>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, pb: 10 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
          ) : filteredPhotos.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 15 }}>
              <PhotoLibraryIcon sx={{ fontSize: 80, color: '#d2d2d7', mb: 2 }} />
              <Typography variant="h5" fontWeight={700}>Your library is empty</Typography>
              <Typography variant="body1" color="text.secondary">Upload bytecode-secured photos to get started.</Typography>
            </Box>
          ) : activeDir === 'All' ? (
            /* Dashboard View: Consolidated Grid */
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Recently Added</Typography>
                <Typography variant="body2" color="text.secondary">{filteredPhotos.length} Total Assets</Typography>
              </Box>
              <Grid container spacing={3}>
                {filteredPhotos.map(photo => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                    <PhotoCard 
                      photo={photo} 
                      onUpdate={fetchPhotos}
                      selected={selectedIds.includes(photo.id)}
                      onSelect={() => setSelectedIds(prev => prev.includes(photo.id) ? prev.filter(x => x !== photo.id) : [...prev, photo.id])}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            /* Folder View: Grouped by Directory */
            Object.entries(groupedPhotos).map(([dir, dirPhotos]) => (
              <Box key={dir} sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{dir}</Typography>
                  <Button 
                    variant="text" 
                    startIcon={<CloudDownloadIcon />}
                    onClick={() => window.location.assign(`${BASE_URL}/api/photos/directory/${encodeURIComponent(dir)}/download`)}
                  >
                    Download ZIP
                  </Button>
                </Box>
                <Grid container spacing={3}>
                  {dirPhotos.map(photo => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                      <PhotoCard 
                        photo={photo} 
                        onUpdate={fetchPhotos}
                        selected={selectedIds.includes(photo.id)}
                        onSelect={() => setSelectedIds(prev => prev.includes(photo.id) ? prev.filter(x => x !== photo.id) : [...prev, photo.id])}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
          )}
        </Container>
      </Box>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUpload={fetchPhotos} />
      <DatabaseModal open={dbViewOpen} onClose={() => setDbViewOpen(false)} photos={photos} onSync={fetchPhotos} />
    </Box>
  );
}

function SidebarItem({ icon, label, active, onClick, onDelete }) {
  return (
    <Box 
      onClick={onClick}
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 1.5, 
        borderRadius: 2, 
        cursor: 'pointer',
        bgcolor: active ? 'rgba(0,113,227,0.1)' : 'transparent',
        color: active ? '#0071e3' : '#1d1d1f',
        '&:hover': { bgcolor: 'rgba(0,113,227,0.05)' }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {React.cloneElement(icon, { sx: { fontSize: 20 } })}
        <Typography variant="body2" fontWeight={active ? 700 : 500}>{label}</Typography>
      </Box>
      {onDelete && (
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(); }} sx={{ opacity: active ? 1 : 0 }}>
          <DeleteIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </Box>
  );
}

function PhotoCard({ photo, onUpdate, selected, onSelect }) {
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    if(!window.confirm('Delete photo?')) return;
    try {
      await api.delete(`/photos/${photo.id}`);
      onUpdate();
    } catch (e) { console.error(e); }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        borderRadius: 4, 
        overflow: 'hidden', 
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }
      }}
    >
      <Box sx={{ position: 'relative', pt: '100%', cursor: 'pointer' }} onClick={() => setEditOpen(true)}>
        <img 
          src={`${BASE_URL}${photo.url}`} 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          alt={photo.filename}
        />
        <Box 
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          sx={{ 
            position: 'absolute', top: 12, left: 12, zIndex: 10,
            width: 24, height: 24, borderRadius: '50%',
            bgcolor: selected ? '#0071e3' : 'rgba(255,255,255,0.8)',
            border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {selected && <CheckIcon sx={{ color: '#fff', fontSize: 16 }} />}
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" noWrap fontWeight={700}>{photo.description || photo.filename}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Chip label={(photo.mime_type || 'image/jpeg').split('/')[1].toUpperCase()} size="small" sx={{ height: 16, fontSize: '9px', fontWeight: 800, borderRadius: 1 }} />
          <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '10px' }}>{photo.filename}</Typography>
        </Box>
      </Box>

      <EditModal photo={photo} open={editOpen} onClose={() => setEditOpen(false)} onUpdate={onUpdate} />
    </Paper>
  );
}

function DatabaseModal({ open, onClose, photos, onSync }) {
  const [selectedHex, setSelectedHex] = useState(null);
  const [loadingHex, setLoadingHex] = useState(false);

  const fetchHex = async (id) => {
    setLoadingHex(true);
    try {
      const res = await api.get(`/photos/${id}/hex`);
      setSelectedHex(res.data.hex);
    } catch (e) { console.error(e); }
    setLoadingHex(false);
  };

  return (
    <Dialog open={open} onClose={() => { onClose(); setSelectedHex(null); }} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" fontWeight={700}>System Transparency View</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<RefreshIcon />} onClick={async () => { await api.post('/photos/sync'); onSync(); }} variant="outlined" sx={{ borderRadius: 2 }}>Sync Storage</Button>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <table className="modern-table">
              <thead>
                <tr><th>Preview</th><th>Filename</th><th>Storage Path</th><th>Bytes</th></tr>
              </thead>
              <tbody>
                {photos.map(p => (
                  <tr key={p.id} onClick={() => fetchHex(p.id)} style={{ cursor: 'pointer' }}>
                    <td><Avatar src={`${BASE_URL}${p.url}`} variant="rounded" sx={{ width: 40, height: 40 }} /></td>
                    <td><Typography variant="body2" fontWeight={600}>{p.filename}</Typography></td>
                    <td><Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#86868b' }}>{p.filepath}</Typography></td>
                    <td><Button size="small">Inspect</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Grid>
          <Grid item xs={12} lg={5}>
            <Box sx={{ bgcolor: '#1a1a1a', color: '#34c759', p: 3, borderRadius: 3, height: '100%', overflowY: 'auto', maxHeight: 500 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, mb: 2, display: 'block' }}>BYTECODE DUMP</Typography>
              <Box sx={{ fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all', lineHeight: 1.8 }}>
                {loadingHex ? <CircularProgress size={20} color="inherit" /> : selectedHex || "Select a row to inspect bytecode..."}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
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
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" fontWeight={700}>Photo Inspector</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', bgcolor: '#f5f5f7', p: 2 }}>
          <img src={`${BASE_URL}${photo.url}`} style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }} />
        </Box>
        <Stack spacing={2}>
          <TextField label="Tags" fullWidth value={tags} onChange={(e) => setTags(e.target.value)} />
          <TextField label="Description" fullWidth multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Button startIcon={<CloudDownloadIcon />} onClick={() => window.location.assign(`${BASE_URL}${photo.url}?download=true&t=${Date.now()}`)}>Download</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving} disableElevation sx={{ borderRadius: 20 }}>Save</Button>
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
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.some(f => !f.type.startsWith('image/'))) {
      return setError('Only images allowed');
    }
    setError('');
    setFiles(selected);
  };

  const handleUpload = async () => {
    if (!files.length) return setError('Select photos');
    setUploading(true);
    const fd = new FormData();
    files.forEach(f => fd.append('photos', f));
    fd.append('directory', directory);
    fd.append('tags', tags);
    fd.append('description', description);
    try {
      await api.post('/photos', fd);
      setFiles([]); setDirectory(''); setTags(''); setDescription('');
      onUpload(); onClose();
    } catch (e) { setError('Upload failed'); }
    setUploading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" fontWeight={700}>Secure Upload</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box sx={{ border: '2px dashed #d2d2d7', borderRadius: 3, p: 5, textAlign: 'center', bgcolor: '#fbfbfd', cursor: 'pointer' }} component="label">
            <CloudUploadIcon sx={{ fontSize: 40, color: '#0071e3', mb: 1 }} />
            <Typography variant="subtitle1" fontWeight={700}>Drop photos here</Typography>
            <Typography variant="caption" color="text.secondary">{files.length} selected</Typography>
            <input type="file" multiple hidden onChange={handleFileChange} />
          </Box>
          {error && <Typography color="error" variant="caption">{error}</Typography>}
          <TextField label="Folder Name" fullWidth value={directory} onChange={(e) => setDirectory(e.target.value)} placeholder="Library" />
          <TextField label="Tags" fullWidth value={tags} onChange={(e) => setTags(e.target.value)} />
          <TextField label="Description" fullWidth multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleUpload} disabled={uploading} disableElevation sx={{ borderRadius: 20, px: 4 }}>
          {uploading ? <CircularProgress size={24} color="inherit" /> : 'Start Secure Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
