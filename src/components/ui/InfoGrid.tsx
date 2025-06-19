import React from 'react';
import { Box, Typography } from '@mui/material';

interface InfoItem {
  label: string;
  value: React.ReactNode;
  monospace?: boolean;
  color?: string;
}

interface InfoGridProps {
  items: InfoItem[];
  columns?: string;
  gap?: number;
}

export function InfoGrid({ 
  items, 
  columns = '1fr 2fr', 
  gap = 3 
}: InfoGridProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: columns, gap, mb: 2 }}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            {item.label}:
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 500,
              fontFamily: item.monospace ? 'monospace' : 'inherit',
              color: item.color || 'inherit'
            }}
          >
            {item.value}
          </Typography>
        </React.Fragment>
      ))}
    </Box>
  );
}

export type { InfoGridProps, InfoItem }; 