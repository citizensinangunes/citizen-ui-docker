import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Paper
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { StatusIcon } from '@/components/ui';

interface Build {
  id: string;
  siteName: string;
  branch: string;
  commitMessage: string;
  author: string;
  authorAvatar: string;
  status: 'Published' | 'Error' | 'Building' | 'Waiting';
  deployTime: string;
  deployDuration: string;
  files?: number;
  assetsChanged?: number;
  redirectRules?: number;
  deploymentUrl?: string;
  framework: string;
  error?: string;
}

interface DeployCardProps {
  build: Build;
  onMenuClick?: (build: Build) => void;
}

export const DeployCard: React.FC<DeployCardProps> = ({ build, onMenuClick }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        border: '1px solid #e0e0e0',
        borderRadius: 1.5,
        '&:last-child': { mb: 0 }
      }}
    >
      {/* Status and Time Row */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1.5
      }}>
        <StatusIcon status={build.status} responsive />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {build.deployTime}
          </Typography>
          <IconButton 
            size="small" 
            sx={{ p: 0.5 }}
            onClick={() => onMenuClick?.(build)}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Commit Message */}
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: 500,
          fontSize: '0.875rem',
          lineHeight: 1.4,
          mb: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {build.commitMessage}
      </Typography>

      {/* Error Message */}
      {build.error && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#e53935', 
            fontSize: '0.75rem',
            lineHeight: 1.3,
            mb: 1.5,
            p: 1,
            bgcolor: 'rgba(229, 57, 53, 0.05)',
            borderRadius: 1,
            border: '1px solid rgba(229, 57, 53, 0.2)'
          }}
        >
          {build.error}
        </Typography>
      )}

      {/* Branch and Author Info */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1,
        mb: 1.5,
        flexWrap: 'wrap'
      }}>
        <GitHubIcon sx={{ color: '#333', fontSize: '0.875rem' }} />
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.75rem',
            fontWeight: 500
          }}
        >
          {build.branch}
        </Typography>
        <Chip 
          label={build.id.substring(0, 5)} 
          size="small"
          sx={{ 
            bgcolor: '#f0f0f0',
            height: '16px',
            fontSize: '0.6rem',
            fontFamily: 'monospace',
            '& .MuiChip-label': { px: 0.5 }
          }}
        />
      </Box>

      {/* Author and Duration */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Avatar 
            sx={{ 
              width: 16, 
              height: 16, 
              fontSize: '0.6rem',
              bgcolor: '#004aad'
            }}
          >
            {build.authorAvatar}
          </Avatar>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: '0.7rem' }}
          >
            {build.author}
          </Typography>
        </Box>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontSize: '0.7rem',
            fontWeight: 500
          }}
        >
          {build.deployDuration}
        </Typography>
      </Box>
    </Paper>
  );
}; 