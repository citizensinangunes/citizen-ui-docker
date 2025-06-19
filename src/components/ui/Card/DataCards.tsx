import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export interface DataCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down';
    value: number;
    label?: string;
  };
  subtitle?: string;
  color?: string;
  type?: 'default' | 'circular-progress';
  progressValue?: number;
  children?: React.ReactNode;
  responsive?: boolean;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down';
    value: number;
    label?: string;
  };
  color?: string;
  variant?: 'default' | 'horizontal';
  responsive?: boolean;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = '#004aad',
  type = 'default',
  progressValue,
  children,
  responsive = true
}) => {
  const renderContent = () => {
    if (type === 'circular-progress' && typeof value === 'number') {
      return (
        <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', justifyContent: 'center', my: 2 }}>
          <CircularProgress 
            variant="determinate" 
            value={value} 
            size={80}
            thickness={5}
            sx={{ color }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body1" fontWeight="bold" sx={{ color }}>
              {`${value}%`}
            </Typography>
          </Box>
        </Box>
      );
    }

    if (icon) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 4 }}>
          <Box sx={{ fontSize: '3rem', color, mr: 2 }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                {trend.direction === 'down' ? (
                  <TrendingDownIcon sx={{ fontSize: '1rem', color: '#2e7d32', mr: 0.5 }} />
                ) : (
                  <TrendingUpIcon sx={{ fontSize: '1rem', color: '#d32f2f', mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: trend.direction === 'down' ? '#2e7d32' : '#d32f2f',
                    fontWeight: 500
                  }}
                >
                  {trend.value}% {trend.label || (trend.direction === 'down' ? 'better' : 'worse')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      );
    }

    return (
      <Box sx={{ textAlign: 'center', my: 2 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color }}>
          {value}
        </Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
            {trend.direction === 'up' ? (
              <TrendingUpIcon sx={{ fontSize: '1rem', color: '#2e7d32', mr: 0.5 }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: '1rem', color: '#d32f2f', mr: 0.5 }} />
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: trend.direction === 'up' ? '#2e7d32' : '#d32f2f',
                fontWeight: 500
              }}
            >
              {trend.value}% {trend.label || 'vs yesterday'}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {renderContent()}
      {subtitle && (
        <Typography variant="body2" color="text.secondary" align="center">
          {subtitle}
        </Typography>
      )}
      {children}
    </Box>
  );
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = '#004aad',
  variant = 'default',
  responsive = true
}) => {
  if (variant === 'horizontal') {
    return (
      <Box sx={{ 
        p: 2, 
        bgcolor: '#f5f5f5', 
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center'
      }}>
        <Box sx={{ color, fontSize: '2rem', mr: 2 }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight="bold" sx={{ color }}>
            {value}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 2, 
      bgcolor: '#f5f5f5', 
      borderRadius: 2,
      height: '100%'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ color, mr: 1 }}>
          {icon}
        </Box>
        <Typography variant="body2" fontWeight={500}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" fontWeight="bold" sx={{ color }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Typography>
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          {trend.direction === 'up' ? (
            <TrendingUpIcon sx={{ fontSize: '1rem', color: '#2e7d32', mr: 0.5 }} />
          ) : (
            <TrendingDownIcon sx={{ fontSize: '1rem', color: '#d32f2f', mr: 0.5 }} />
          )}
          <Typography 
            variant="body2" 
            sx={{ 
              color: trend.direction === 'up' ? '#2e7d32' : '#d32f2f',
              fontWeight: 500
            }}
          >
            {trend.value}% {trend.label || 'vs yesterday'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}; 