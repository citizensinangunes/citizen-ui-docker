import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Button,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';

export interface ConfigurationContentAreaProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  minHeight?: string;
  responsive?: boolean;
}

export interface TeamAddFormProps {
  teams: Array<{ id: string; name: string; memberCount: number }>;
  excludeTeamIds?: string[];
  onSubmit: (teamId: string, accessLevel: string) => void;
  onCancel: () => void;
  responsive?: boolean;
}

export const ConfigurationContentArea: React.FC<ConfigurationContentAreaProps> = ({
  title,
  children,
  minHeight = '500px',
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <Box 
      sx={{ 
        p: shouldBeMobile ? 2 : 3, 
        borderRadius: 2,
        minHeight: shouldBeMobile ? '400px' : minHeight
      }}
    >
      {title && (
        <>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontSize: shouldBeMobile ? '1.125rem' : '1.25rem',
              mb: shouldBeMobile ? 1 : 2
            }}
          >
            {title}
          </Typography>
          <Divider sx={{ my: shouldBeMobile ? 1.5 : 2 }} />
        </>
      )}
      <Box>
        {children}
      </Box>
    </Box>
  );
};

export const TeamAddForm: React.FC<TeamAddFormProps> = ({
  teams,
  excludeTeamIds = [],
  onSubmit,
  onCancel,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const [selectedTeam, setSelectedTeam] = useState('');
  const [accessLevel, setAccessLevel] = useState('citizen');

  const availableTeams = teams.filter(team => !excludeTeamIds.includes(team.id));

  const handleSubmit = () => {
    if (selectedTeam) {
      onSubmit(selectedTeam, accessLevel);
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: shouldBeMobile ? 2 : 3,
        mb: shouldBeMobile ? 2 : 3
      }}
    >
      <Typography 
        variant="subtitle1" 
        fontWeight={500} 
        gutterBottom
        sx={{ fontSize: shouldBeMobile ? '1rem' : '1.125rem' }}
      >
        Add a team to this site
      </Typography>
      
      <Box sx={{ mb: shouldBeMobile ? 1.5 : 2 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 1,
            fontSize: shouldBeMobile ? '0.875rem' : '1rem'
          }}
        >
          Select Team
        </Typography>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{ 
            width: '100%', 
            padding: shouldBeMobile ? '8px' : '10px', 
            borderRadius: '4px',
            border: '1px solid #cccccc',
            fontSize: shouldBeMobile ? '14px' : '16px',
            backgroundColor: 'white'
          }}
        >
          <option value="" disabled>Select a team</option>
          {availableTeams.map(team => (
            <option key={team.id} value={team.id}>
              {team.name} ({team.memberCount} members)
            </option>
          ))}
        </select>
      </Box>
      
      <Box sx={{ mb: shouldBeMobile ? 2 : 3 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 1,
            fontSize: shouldBeMobile ? '0.875rem' : '1rem'
          }}
        >
          Access Level
        </Typography>
        <select
          value={accessLevel}
          onChange={(e) => setAccessLevel(e.target.value)}
          style={{ 
            width: '100%', 
            padding: shouldBeMobile ? '8px' : '10px', 
            borderRadius: '4px',
            border: '1px solid #cccccc',
            fontSize: shouldBeMobile ? '14px' : '16px',
            backgroundColor: 'white'
          }}
        >
          <option value="admin">Admin (Full access)</option>
          <option value="citizen">Citizen (Edit access)</option>
          <option value="viewer">Viewer (Read-only access)</option>
        </select>
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        gap: shouldBeMobile ? 1 : 2, 
        justifyContent: 'flex-end',
        flexDirection: shouldBeMobile ? 'column-reverse' : 'row'
      }}>
        <Button 
          variant="outlined"
          onClick={onCancel}
          fullWidth={shouldBeMobile}
          sx={{
            color: '#004aad',
            borderColor: '#004aad'
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedTeam}
          fullWidth={shouldBeMobile}
          sx={{
            bgcolor: '#004aad',
            color: 'white',
            '&:hover': { bgcolor: '#003a87' },
            fontWeight: 500
          }}
        >
          Add Team
        </Button>
      </Box>
    </Paper>
  );
}; 