"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  TextField,
  Button,
  Alert
} from '@mui/material';

const GeneralSettings: React.FC = () => {
  const [teamName, setTeamName] = useState('My Team');
  const [teamDescription, setTeamDescription] = useState('A collaborative workspace for our projects');
  const [organizationName, setOrganizationName] = useState('My Organization');

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings...');
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          General Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure basic information about your team and organization
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            label="Team Description"
            multiline
            rows={3}
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            label="Organization Name"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            sx={{ mb: 3 }}
          />
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            These settings affect how your team and organization appear throughout the platform.
          </Typography>
        </Alert>

        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            bgcolor: '#004aad',
            color: 'white',
            '&:hover': { bgcolor: '#003a87' },
            fontWeight: 500
          }}
        >
          Save Changes
        </Button>
      </Paper>
    </Box>
  );
};

export default GeneralSettings; 