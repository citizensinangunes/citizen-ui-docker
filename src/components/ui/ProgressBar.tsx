import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

export interface ProgressBarProps {
  label: string;
  current: number;
  limit: number;
  unit?: string;
  color?: string;
  icon?: React.ReactNode;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  current,
  limit,
  unit = '',
  color = '#0288d1',
  icon,
  showPercentage = false
}) => {
  const percentage = (current / limit) * 100;
  
  const formatValue = (value: number) => {
    return unit ? `${value}${unit}` : `${value}%`;
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon && (
          <Box sx={{ color, mr: 1 }}>
            {icon}
          </Box>
        )}
        <Typography variant="body2" fontWeight={500}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {showPercentage 
            ? `${current}% of ${limit}%`
            : `${formatValue(current)} of ${formatValue(limit)}`
          }
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={percentage}
        sx={{ 
          height: 10, 
          borderRadius: 5,
          bgcolor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            bgcolor: color
          }
        }}
      />
    </Box>
  );
}; 