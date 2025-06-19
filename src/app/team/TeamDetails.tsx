import React from 'react';
import { GridLegacy as Grid } from '@mui/material';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Paper,
  Avatar,
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import { 
  Group as TeamIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  PersonAdd as InviteIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'citizen' | 'viewer';
  avatar: string;
  department?: string;
  status: 'active' | 'pending' | 'disabled';
  lastActive?: string;
}

interface Team {
  id: number;
  name: string;
  description: string;
  members: number[];
  createdAt: string;
  updatedAt: string;
}

interface TeamDetailsProps {
  open: boolean;
  onClose: () => void;
  team: Team;
  members: TeamMember[];
  canManage: boolean;
}

const TeamDetails: React.FC<TeamDetailsProps> = ({ 
  open, 
  onClose, 
  team, 
  members,
  canManage
}) => {
  // Calculate role counts
  const admins = members.filter(m => m.role === 'admin').length;
  const citizens = members.filter(m => m.role === 'citizen').length;
  const viewers = members.filter(m => m.role === 'viewer').length;
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #f0f0f0', p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TeamIcon sx={{ color: '#004aad', mr: 1 }} />
          <Typography variant="h6" fontWeight={500}>
            {team.name} Details
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Team Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Team Information
            </Typography>
            
            <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, mb: 3 }}>
              <Typography variant="body1" paragraph>
                {team.description}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Created</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {new Date(team.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {new Date(team.updatedAt).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Members</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {members.length}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Role Distribution
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`${admins} Admin${admins !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    bgcolor: '#4caf5020',
                    color: '#4caf50'
                  }}
                />
                <Chip
                  label={`${citizens} Citizen${citizens !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    bgcolor: '#ff980020',
                    color: '#ff9800'
                  }}
                />
                <Chip
                  label={`${viewers} Viewer${viewers !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    bgcolor: '#90909020',
                    color: '#909090'
                  }}
                />
              </Box>
            </Box>
            
            {canManage && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  size="small"
                  sx={{
                    borderColor: '#004aad',
                    color: '#004aad',
                    '&:hover': { borderColor: '#003a87', bgcolor: 'rgba(0, 74, 173, 0.04)' },
                  }}
                >
                  Edit Team
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  size="small"
                  sx={{
                    borderColor: '#f44336',
                    color: '#f44336',
                    '&:hover': { borderColor: '#d32f2f', bgcolor: 'rgba(244, 67, 54, 0.04)' },
                  }}
                >
                  Delete Team
                </Button>
              </Box>
            )}
          </Grid>
          
          {/* Team Members */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={500}>
                Team Members
              </Typography>
              
              {canManage && (
                <Button
                  variant="outlined"
                  startIcon={<InviteIcon />}
                  size="small"
                  sx={{
                    borderColor: '#004aad',
                    color: '#004aad',
                    '&:hover': { borderColor: '#003a87', bgcolor: 'rgba(0, 74, 173, 0.04)' },
                  }}
                >
                  Add Members
                </Button>
              )}
            </Box>
            
            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
              {members.length > 0 ? (
                members.map((member, index, arr) => (
                  <React.Fragment key={member.id}>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{ 
                            bgcolor: member.role === 'admin' ? '#004aad' : 
                                    member.role === 'citizen' ? '#ff9800' : '#9e9e9e',
                            mr: 2
                          }}
                        >
                          {member.avatar}
                        </Avatar>
                        
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {member.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label={member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          size="small"
                          sx={{
                            mr: 1,
                            bgcolor: member.role === 'admin' ? '#4caf5020' : 
                                    member.role === 'citizen' ? '#ff980020' : '#90909020',
                            color: member.role === 'admin' ? '#4caf50' : 
                                   member.role === 'citizen' ? '#ff9800' : '#909090'
                          }}
                        />
                        
                        {canManage && (
                          <IconButton size="small">
                            <MoreIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    {index < arr.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No members in this team
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, px: 3, borderTop: '1px solid #f0f0f0' }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamDetails;