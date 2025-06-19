"use client";

import React, { useState, useEffect } from 'react';
import { GridLegacy as Grid } from '@mui/material';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tooltip,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { 
  PersonAdd as InviteIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'citizen' | 'viewer';
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  expiresAt: string;
  invitedBy: string;
}

const InviteManagement: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'citizen' | 'viewer'>('citizen');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Mock data - replace with API calls
  useEffect(() => {
    const mockInvitations: Invitation[] = [
      {
        id: '1',
        email: 'john@example.com',
        role: 'citizen',
        token: 'inv_abc123def456',
        status: 'pending',
        createdAt: '2024-01-15T10:00:00Z',
        expiresAt: '2024-01-22T10:00:00Z',
        invitedBy: 'Admin User'
      },
      {
        id: '2',
        email: 'sarah@example.com',
        role: 'viewer',
        token: 'inv_xyz789uvw012',
        status: 'accepted',
        createdAt: '2024-01-10T14:30:00Z',
        expiresAt: '2024-01-17T14:30:00Z',
        invitedBy: 'Admin User'
      },
      {
        id: '3',
        email: 'mike@example.com',
        role: 'admin',
        token: 'inv_expired123',
        status: 'expired',
        createdAt: '2024-01-01T09:00:00Z',
        expiresAt: '2024-01-08T09:00:00Z',
        invitedBy: 'Admin User'
      }
    ];
    setInvitations(mockInvitations);
  }, []);

  const handleSendInvite = async () => {
    if (!inviteEmail) return;

    setLoading(true);
    try {
      // API call to create invitation
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole
        })
      });

      if (response.ok) {
        const newInvitation = await response.json();
        setInvitations(prev => [newInvitation, ...prev]);
        setSnackbar({ open: true, message: 'Invitation sent successfully!', severity: 'success' });
        setOpenInviteDialog(false);
        setInviteEmail('');
        setInviteRole('citizen');
      } else {
        throw new Error('Failed to send invitation');
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to send invitation', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteLink = (token: string) => {
    const inviteLink = `${window.location.origin}/auth?invite=${token}`;
    navigator.clipboard.writeText(inviteLink);
    setSnackbar({ open: true, message: 'Invite link copied to clipboard!', severity: 'success' });
  };

  const handleDeleteInvitation = async (id: string) => {
    try {
      const response = await fetch(`/api/invitations/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setInvitations(prev => prev.filter(inv => inv.id !== id));
        setSnackbar({ open: true, message: 'Invitation deleted', severity: 'success' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete invitation', severity: 'error' });
    }
  };

  const handleResendInvitation = async (id: string) => {
    try {
      const response = await fetch(`/api/invitations/${id}/resend`, {
        method: 'POST'
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Invitation resent successfully!', severity: 'success' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to resend invitation', severity: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'accepted': return '#4caf50';
      case 'expired': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const acceptedInvitations = invitations.filter(inv => inv.status === 'accepted');
  const expiredInvitations = invitations.filter(inv => inv.status === 'expired');

  return (
    <Box>
      {/* Header with Stats */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Team Invitations
          </Typography>
          <Button
            variant="contained"
            startIcon={<InviteIcon />}
            onClick={() => setOpenInviteDialog(true)}
            sx={{
              bgcolor: '#004aad',
              color: 'white',
              '&:hover': { bgcolor: '#003a87' },
              fontWeight: 500
            }}
          >
            Send Invitation
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={600} color="#ff9800">
                  {pendingInvitations.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Invitations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={600} color="#4caf50">
                  {acceptedInvitations.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Accepted Invitations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={600} color="#f44336">
                  {expiredInvitations.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expired Invitations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Invite-Only Access:</strong> Only users with valid invitation links can register. 
            Invitations expire after 7 days and can only be used once.
          </Typography>
        </Alert>
      </Box>

      {/* Invitations Table */}
      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle1" fontWeight={500}>
            All Invitations
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 500 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Expires</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon fontSize="small" sx={{ color: '#666', mr: 1 }} />
                      {invitation.email}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invitation.role}
                      size="small"
                      sx={{
                        bgcolor: invitation.role === 'admin' ? '#4caf5020' : 
                                invitation.role === 'citizen' ? '#ff980020' : '#90909020',
                        color: invitation.role === 'admin' ? '#4caf50' : 
                               invitation.role === 'citizen' ? '#ff9800' : '#909090',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invitation.status}
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(invitation.status)}20`,
                        color: getStatusColor(invitation.status),
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(invitation.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ScheduleIcon fontSize="small" sx={{ color: '#666', mr: 0.5 }} />
                      <Typography variant="body2">
                        {formatDate(invitation.expiresAt)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {invitation.status === 'pending' && (
                        <>
                          <Tooltip title="Copy invite link">
                            <IconButton
                              size="small"
                              onClick={() => handleCopyInviteLink(invitation.token)}
                              sx={{ color: '#004aad' }}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Resend invitation">
                            <IconButton
                              size="small"
                              onClick={() => handleResendInvitation(invitation.id)}
                              sx={{ color: '#ff9800' }}
                            >
                              <RefreshIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Delete invitation">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteInvitation(invitation.id)}
                          sx={{ color: '#f44336' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {invitations.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No invitations sent yet. Send your first invitation to get started.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Send Invitation Dialog */}
      <Dialog 
        open={openInviteDialog} 
        onClose={() => setOpenInviteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InviteIcon sx={{ color: '#004aad', mr: 1 }} />
            Send Team Invitation
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              sx={{ mb: 3 }}
            />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={inviteRole}
                label="Role"
                onChange={(e) => setInviteRole(e.target.value as 'admin' | 'citizen' | 'viewer')}
              >
                <MenuItem value="viewer">Viewer - Read-only access</MenuItem>
                <MenuItem value="citizen">Citizen - Edit access</MenuItem>
                <MenuItem value="admin">Admin - Full access</MenuItem>
              </Select>
            </FormControl>

            <Alert severity="info">
              The invitation will expire in 7 days and can only be used once. 
              The recipient will receive an email with a secure registration link.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenInviteDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendInvite}
            disabled={!inviteEmail || loading}
            sx={{
              bgcolor: '#004aad',
              '&:hover': { bgcolor: '#003a87' }
            }}
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InviteManagement; 