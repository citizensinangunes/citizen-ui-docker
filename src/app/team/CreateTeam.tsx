import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Typography, 
  Box
} from '@mui/material';

interface CreateTeamProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

const CreateTeam: React.FC<CreateTeamProps> = ({ open, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Reset form when dialog closes
  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };
  
  // Handle team creation
  const handleCreateTeam = () => {
    if (name.trim()) {
      onCreate(name.trim(), description.trim());
      handleClose();
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #f0f0f0', p: 3 }}>
        <Typography variant="h6" fontWeight={500}>
          Create New Team
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, pt: 4 }}>
        <TextField
          label="Team Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter team name"
          required
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Description"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the purpose of this team"
          multiline
          rows={3}
          sx={{ mb: 3 }}
        />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Initial Members:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You will be automatically added as an admin. You can add more members after team creation.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, px: 3, borderTop: '1px solid #f0f0f0' }}>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button 
          variant="contained"
          onClick={handleCreateTeam}
          sx={{
            bgcolor: '#004aad',
            color: 'white',
            '&:hover': { bgcolor: '#003a87' }
          }}
          disabled={!name.trim()}
        >
          Create Team
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTeam;