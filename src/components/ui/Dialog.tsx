import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { ShareIcon, CopyIcon, CheckIcon, CheckCircleIcon } from '@/components/ui/Icon';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  severity?: 'warning' | 'error' | 'info';
  responsive?: boolean;
}

export interface DeleteConfirmDialogProps {
  open: boolean;
  title?: string;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
  responsive?: boolean;
}

export interface ShareSiteModalProps {
  open: boolean;
  siteName: string;
  siteId: string;
  onClose: () => void;
  onNotification: (notification: {
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
    title: string;
    details: Record<string, number> | null;
  }) => void;
  responsive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'warning',
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const getConfirmButtonColor = () => {
    switch (severity) {
      case 'error':
        return '#d32f2f';
      case 'warning':
        return '#ed6c02';
      default:
        return '#004aad';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      fullScreen={shouldBeMobile}
      PaperProps={{
        sx: {
          borderRadius: shouldBeMobile ? 0 : 2,
          m: shouldBeMobile ? 0 : 2
        }
      }}
    >
      <DialogTitle sx={{ p: shouldBeMobile ? 2 : 3 }}>
        <Typography variant={shouldBeMobile ? "h6" : "h5"}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: shouldBeMobile ? 2 : 3, pt: shouldBeMobile ? 1 : 2 }}>
        <Typography sx={{ fontSize: shouldBeMobile ? '0.875rem' : '1rem' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ 
        p: shouldBeMobile ? 2 : 3, 
        pt: shouldBeMobile ? 1 : 2,
        gap: shouldBeMobile ? 1 : 2,
        flexDirection: shouldBeMobile ? 'column-reverse' : 'row'
      }}>
        <Button
          onClick={onCancel}
          fullWidth={shouldBeMobile}
          sx={{ fontSize: shouldBeMobile ? '0.875rem' : '1rem' }}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          fullWidth={shouldBeMobile}
          sx={{
            bgcolor: getConfirmButtonColor(),
            '&:hover': { 
              bgcolor: severity === 'error' ? '#b71c1c' : 
                       severity === 'warning' ? '#e65100' : '#003a87'
            },
            fontSize: shouldBeMobile ? '0.875rem' : '1rem'
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  title = "Delete Item",
  itemName,
  onConfirm,
  onCancel,
  loading = false,
  error = null,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      fullScreen={shouldBeMobile}
      PaperProps={{
        sx: {
          borderRadius: shouldBeMobile ? 0 : 2,
          m: shouldBeMobile ? 0 : 2
        }
      }}
    >
      <DialogTitle sx={{ p: shouldBeMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DeleteForeverIcon sx={{ mr: 1, color: '#d32f2f' }} />
          <Typography variant={shouldBeMobile ? "h6" : "h5"}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: shouldBeMobile ? 2 : 3, pt: shouldBeMobile ? 1 : 2 }}>
        <Typography sx={{ fontSize: shouldBeMobile ? '0.875rem' : '1rem', mb: 2 }}>
          Are you sure you want to delete <strong>"{itemName}"</strong>?
        </Typography>
        <Typography sx={{ fontSize: shouldBeMobile ? '0.875rem' : '1rem', color: 'text.secondary' }}>
          This action cannot be undone.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ 
        p: shouldBeMobile ? 2 : 3, 
        pt: shouldBeMobile ? 1 : 2,
        gap: shouldBeMobile ? 1 : 2,
        flexDirection: shouldBeMobile ? 'column-reverse' : 'row'
      }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          fullWidth={shouldBeMobile}
          sx={{ fontSize: shouldBeMobile ? '0.875rem' : '1rem' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          fullWidth={shouldBeMobile}
          sx={{
            bgcolor: '#d32f2f',
            '&:hover': { bgcolor: '#b71c1c' },
            fontSize: shouldBeMobile ? '0.875rem' : '1rem'
          }}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverIcon />}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const ShareSiteModal: React.FC<ShareSiteModalProps> = ({
  open,
  siteName,
  siteId,
  onClose,
  onNotification,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const [shareLoading, setShareLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  // Share Site handlers
  const handleShareSite = async () => {
    setShareLoading(true);
    setShareLink('');
    setShareLinkCopied(false);
    
    try {
      const response = await fetch(`/api/sites/${siteId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to create share link');
      }
      
      const data = await response.json();
      setShareLink(data.data.inviteLink);
    } catch (error) {
      console.error('Error creating share link:', error);
      onNotification({
        open: true,
        severity: 'error',
        title: 'Share Link Error',
        message: 'Failed to create share link. Please try again.',
        details: null
      });
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleClose = () => {
    setShareLink('');
    setShareLinkCopied(false);
    onClose();
  };

  // Generate share link when modal opens
  React.useEffect(() => {
    if (open && !shareLink && !shareLoading) {
      handleShareSite();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={shouldBeMobile}
      PaperProps={{
        sx: {
          borderRadius: shouldBeMobile ? 0 : 2,
          m: shouldBeMobile ? 0 : 2
        }
      }}
    >
      <DialogTitle
        sx={{
          p: shouldBeMobile ? 2 : 3,
          pb: shouldBeMobile ? 1 : 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ShareIcon sx={{ mr: 1, color: '#4caf50' }} />
          <Typography 
            variant={shouldBeMobile ? "h6" : "h5"}
            sx={{ fontSize: shouldBeMobile ? '1rem' : '1.25rem' }}
          >
            Share Site Access
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          p: shouldBeMobile ? 2 : 3,
          pt: shouldBeMobile ? 1 : 2
        }}
      >
        <Typography 
          variant="body1" 
          sx={{ 
            mb: shouldBeMobile ? 2 : 3,
            fontSize: shouldBeMobile ? '0.875rem' : '1rem',
            lineHeight: shouldBeMobile ? 1.4 : 1.5
          }}
        >
          Share this site with others by sending them an invitation link. 
          Anyone with this link can register and get viewer access to <strong>{siteName}</strong>.
        </Typography>
        
        {shareLoading ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            py: shouldBeMobile ? 3 : 4,
            flexDirection: shouldBeMobile ? 'column' : 'row',
            gap: shouldBeMobile ? 1 : 0
          }}>
            <CircularProgress size={shouldBeMobile ? 20 : 24} sx={{ mr: shouldBeMobile ? 0 : 2 }} />
            <Typography
              sx={{ fontSize: shouldBeMobile ? '0.875rem' : '1rem' }}
            >
              Generating share link...
            </Typography>
          </Box>
        ) : shareLink ? (
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1, 
                fontWeight: 500,
                fontSize: shouldBeMobile ? '0.75rem' : '0.875rem'
              }}
            >
              Invitation Link:
            </Typography>
            <TextField
              fullWidth
              value={shareLink}
              variant="outlined"
              size={shouldBeMobile ? "small" : "small"}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleCopyShareLink}
                      edge="end"
                      size={shouldBeMobile ? "small" : "medium"}
                      sx={{ 
                        color: shareLinkCopied ? '#4caf50' : '#666',
                        '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.1)' }
                      }}
                    >
                      {shareLinkCopied ? <CheckIcon /> : <CopyIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  fontSize: shouldBeMobile ? '0.75rem' : '0.875rem',
                  fontFamily: 'monospace'
                }
              }}
              sx={{ mb: shouldBeMobile ? 1.5 : 2 }}
            />
            
            {shareLinkCopied && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: shouldBeMobile ? 1.5 : 2,
                  '& .MuiAlert-message': {
                    fontSize: shouldBeMobile ? '0.75rem' : '0.875rem'
                  }
                }}
              >
                Link copied to clipboard!
              </Alert>
            )}
            
            <Alert 
              severity="info"
              sx={{
                '& .MuiAlert-message': {
                  fontSize: shouldBeMobile ? '0.75rem' : '0.875rem'
                }
              }}
            >
              <Typography 
                variant="body2"
                sx={{ fontSize: shouldBeMobile ? '0.75rem' : '0.875rem' }}
              >
                • This link expires in 24 hours<br/>
                • Recipients will get viewer access to this site<br/>
                • They need to register with their email to access the site
              </Typography>
            </Alert>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions
        sx={{
          p: shouldBeMobile ? 2 : 3,
          pt: shouldBeMobile ? 1 : 2,
          flexDirection: shouldBeMobile ? 'column-reverse' : 'row',
          gap: shouldBeMobile ? 1 : 0
        }}
      >
        <Button 
          onClick={handleClose}
          fullWidth={shouldBeMobile}
          sx={{
            fontSize: shouldBeMobile ? '0.875rem' : '1rem',
            minHeight: shouldBeMobile ? 40 : 36
          }}
        >
          Close
        </Button>
        {shareLink && (
          <Button 
            variant="contained" 
            onClick={handleCopyShareLink}
            startIcon={shareLinkCopied ? <CheckIcon /> : <CopyIcon />}
            fullWidth={shouldBeMobile}
            sx={{
              bgcolor: shareLinkCopied ? '#4caf50' : '#004aad',
              '&:hover': { 
                bgcolor: shareLinkCopied ? '#388e3c' : '#003a87' 
              },
              fontSize: shouldBeMobile ? '0.875rem' : '1rem',
              minHeight: shouldBeMobile ? 40 : 36
            }}
          >
            {shareLinkCopied ? 'Copied!' : 'Copy Link'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}; 