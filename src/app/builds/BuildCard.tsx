import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  Avatar,
  Divider
} from '@mui/material';

interface Build {
  id: string;
  siteName: string;
  branch: string;
  commitMessage: string;
  author: string;
  authorAvatar: string;
  status: string;
  deployTime: string;
  deployDuration: string;
  files?: number;
  assetsChanged?: number;
  redirectRules?: number;
  deploymentUrl?: string;
  framework: string;
  error?: string;
}

interface BuildCardProps {
  build: Build;
  onViewDetails: () => void;
  isLast?: boolean;
  canManage?: boolean;
}

const BuildCard: React.FC<BuildCardProps> = ({ build, onViewDetails, isLast }) => {
  return (
    <Box 
      sx={{ 
        px: 3, 
        py: 2,
        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.01)' }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography 
              variant="body1" 
              component="span" 
              sx={{ 
                fontWeight: 500, 
                color: 'text.primary',
                mr: 1
              }}
            >
              {build.siteName}:
            </Typography>
            <Typography 
              variant="body2" 
              component="span" 
              sx={{ 
                color: '#004aad',
                fontFamily: 'monospace',
                fontWeight: 600,
                mr: 1
              }}
            >
              {build.branch}
            </Typography>
            <Typography 
              variant="body2" 
              component="span" 
              sx={{ 
                color: '#004aad',
                fontFamily: 'monospace',
                fontWeight: 600
              }}
            >
              {build.id}
            </Typography>
            <Chip 
              label={build.status} 
              size="small" 
              sx={{ 
                ml: 1.5,
                bgcolor: build.status === 'Completed' ? '#4caf5020' : 
                         build.status === 'Failed' ? '#f4433620' : '#ff980020',
                color: build.status === 'Completed' ? '#4caf50' : 
                       build.status === 'Failed' ? '#f44336' : '#ff9800',
                height: 20, 
                fontSize: '0.7rem',
                fontWeight: 500
              }} 
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.85rem'
                }}
              >
                By
              </Typography>
              <Avatar 
                sx={{ 
                  width: 20, 
                  height: 20, 
                  bgcolor: '#004aad',
                  fontSize: '0.7rem',
                  mx: 0.75
                }}
              >
                {build.authorAvatar}
              </Avatar>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.primary',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}
              >
                {build.author}:
              </Typography>
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.85rem'
              }}
            >
              {build.commitMessage}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.75rem',
                mr: 1.5
              }}
            >
              {build.deployTime}
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}
            >
              Deployed in {build.deployDuration}
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="outlined"
          size="small"
          onClick={onViewDetails}
          sx={{
            borderColor: '#e0e0e0',
            color: 'text.secondary',
            '&:hover': { bgcolor: '#f5f5f5', borderColor: '#d0d0d0' },
            fontSize: '0.8rem',
            py: 0.5
          }}
        >
          Go to deploy details
        </Button>
      </Box>
      
      {!isLast && <Divider sx={{ mt: 2 }} />}
    </Box>
  );
};

export default BuildCard;