"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  Typography,
  Paper,
  TextField,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Code as GitLabIcon,
  QuestionAnswer as BitbucketIcon,
  CloudUpload as UploadIcon,
  FormatListBulleted as RemixIcon,
  WebAsset as NextIcon,
  ViewStream as SvelteIcon,
  FolderOpen as NuxtIcon,
  Extension as AstroIcon,
  Settings as HugoIcon,
  Palette as EleventyIcon,
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { GridLegacy as Grid } from '@mui/material';

interface NewSiteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (siteId: number) => void;
}

export default function NewSiteModal({ open, onClose, onSuccess }: NewSiteModalProps) {
  const { token } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [repoUrl, setRepoUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<number | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Reset error when changing tabs
    setError(null);
  };

  const handleSubmit = async () => {
    // Reset states
    setError(null);
    setLoading(true);
    
    // Basic validation
    if (!siteName.trim()) {
      setError('Site name is required');
      setLoading(false);
      return;
    }
    
    if (!subdomain.trim()) {
      setError('Subdomain is required');
      setLoading(false);
      return;
    }
    
    if (tabValue === 0 && !repoUrl.trim()) {
      setError('Repository URL is required');
      setLoading(false);
      return;
    }

    try {
      // Get token from state or localStorage
      const currentToken = token || localStorage.getItem('auth_token');
      
      if (!currentToken) {
        setError('Authentication error. Please log in again.');
        setLoading(false);
        return;
      }
      
      console.log('[SITE-CREATION] Starting site creation process');
      
      // Prepare payload based on selected tab
      let payload: any = {
        name: siteName,
        description: '',
        subdomain: subdomain,
        framework_id: selectedFramework || 1 // Default to Next.js if not selected
      };
      
      // Add repo_url only for import from Git
      if (tabValue === 0) {
        payload.repo_url = repoUrl;
      }
      
      console.log('[SITE-CREATION] Payload prepared:', payload);
      
      // Make API call to create site
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
          'X-Auth-Token': currentToken
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[SITE-CREATION] API error:', errorData);
        throw new Error(errorData.error || 'Failed to create site');
      }
      
      const data = await response.json();
      console.log('[SITE-CREATION] Site created successfully:', data);
      
      // Set success and call onSuccess callback if provided
      setSuccess(true);
      setLoading(false);

      // Reset form state
      resetForm();
      
      if (onSuccess && data.site?.id) {
        // Call onSuccess immediately
        console.log('[SITE-CREATION] Calling onSuccess with site ID:', data.site.id);
        onSuccess(data.site.id);
      }
      
      // Close modal after a delay
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
      
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setRepoUrl('');
    setSiteName('');
    setSubdomain('');
    setSelectedFramework(null);
    setTabValue(0);
    setError(null);
  };

  const templates = [
    { id: 1, name: 'Next.js', icon: <NextIcon />, description: 'React framework with server-side rendering' },
    { id: 2, name: 'Remix', icon: <RemixIcon />, description: 'Full stack web framework' },
    { id: 3, name: 'Svelte', icon: <SvelteIcon />, description: 'Cybernetically enhanced web apps' },
    { id: 4, name: 'Nuxt.js', icon: <NuxtIcon />, description: 'Intuitive Vue framework' },
    { id: 5, name: 'Astro', icon: <AstroIcon />, description: 'Framework for content-driven websites' },
    { id: 6, name: 'Hugo', icon: <HugoIcon />, description: 'Simpler static site generator' },
    { id: 7, name: 'Eleventy', icon: <EleventyIcon />, description: 'Simpler static site generator' }
  ];

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={loading ? undefined : onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600} color="#004aad">
              Add your site to Citizen
            </Typography>
            <IconButton edge="end" onClick={loading ? undefined : onClose} aria-label="close" disabled={loading}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ 
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTabs-indicator': {
                backgroundColor: '#004aad',
              }
            }}
          >
            <Tab label="Import Project" />
            <Tab label="Start from Template" />
            <Tab label="Upload Files" />
          </Tabs>
          
          {error && (
            <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Import an existing project from a Git repository
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper
                    elevation={0}
                    sx={{ 
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderColor: tabValue === 0 ? '#004aad' : '#e0e0e0',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#004aad',
                        boxShadow: '0px 2px 8px rgba(0, 74, 173, 0.15)'
                      }
                    }}
                  >
                    <GitHubIcon fontSize="large" sx={{ color: '#333', mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight={500}>GitHub</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Paper
                    elevation={0}
                    sx={{ 
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#fc6d26',
                        boxShadow: '0px 2px 8px rgba(252, 109, 38, 0.15)'
                      }
                    }}
                  >
                    <GitLabIcon fontSize="large" sx={{ color: '#fc6d26', mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight={500}>GitLab</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Paper
                    elevation={0}
                    sx={{ 
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#0052cc',
                        boxShadow: '0px 2px 8px rgba(0, 82, 204, 0.15)'
                      }
                    }}
                  >
                    <BitbucketIcon fontSize="large" sx={{ color: '#0052cc', mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight={500}>Bitbucket</Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Repository URL
                </Typography>
                <TextField
                  fullWidth
                  placeholder="https://github.com/username/repository"
                  variant="outlined"
                  size="small"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Site settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Site name"
                      placeholder="my-awesome-project"
                      variant="outlined"
                      size="small"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Subdomain"
                      placeholder="myproject"
                      variant="outlined"
                      size="small"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">.citizen.company.com</InputAdornment>,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
          
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Start from a template to create a new site
              </Typography>
              
              <TextField
                fullWidth
                placeholder="Search templates..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Grid container spacing={2}>
                {filteredTemplates.map(template => (
                  <Grid item xs={12} sm={6} md={4} key={template.id}>
                    <Paper
                      elevation={0}
                      onClick={() => setSelectedFramework(template.id)}
                      sx={{ 
                        p: 2,
                        border: '1px solid',
                        borderColor: selectedFramework === template.id ? '#004aad' : '#e0e0e0',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#004aad',
                          boxShadow: '0px 2px 8px rgba(0, 74, 173, 0.15)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ mr: 1, color: '#666' }}>{template.icon}</Box>
                        <Typography variant="subtitle1" fontWeight={500}>{template.name}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {template.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Site settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Site name"
                      placeholder="my-awesome-project"
                      variant="outlined"
                      size="small"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Subdomain"
                      placeholder="myproject"
                      variant="outlined"
                      size="small"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">.citizen.company.com</InputAdornment>,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
          
          {tabValue === 2 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 4 }}>
                Deploy by uploading your site's output folder directly
              </Typography>
              
              <Box 
                sx={{ 
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 5,
                  mb: 3,
                  bgcolor: 'rgba(0, 74, 173, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#004aad',
                    bgcolor: 'rgba(0, 74, 173, 0.05)'
                  }
                }}
              >
                <UploadIcon sx={{ fontSize: 40, color: '#666', mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Drag and drop your site files here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ 
                    mt: 2,
                    borderColor: '#004aad',
                    color: '#004aad',
                    '&:hover': {
                      borderColor: '#003a87',
                      bgcolor: 'rgba(0, 74, 173, 0.05)'
                    }
                  }}
                >
                  Browse files
                </Button>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Site name"
                      placeholder="my-awesome-project"
                      variant="outlined"
                      size="small"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Subdomain"
                      placeholder="myproject"
                      variant="outlined"
                      size="small"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">.citizen.company.com</InputAdornment>,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={onClose} sx={{ color: 'text.secondary' }} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ 
              bgcolor: '#004aad', 
              color: 'white',
              '&:hover': { bgcolor: '#003b8a' },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              tabValue === 0 ? 'Import Project' : tabValue === 1 ? 'Create Site' : 'Deploy Site'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={success}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Site created successfully!
        </Alert>
      </Snackbar>
    </>
  );
}