import React from 'react';
import { 
  Box, 
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';

export interface BreadcrumbProps {
  items: Array<{ 
    label: string; 
    icon?: React.ReactNode;
    href?: string;
  }>;
  separator?: React.ReactNode;
  responsive?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const defaultSeparator = separator || <ChevronRightIcon sx={{ mx: 1, fontSize: '1.25rem' }} />;

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      flexWrap: shouldBeMobile ? 'wrap' : 'nowrap',
      gap: shouldBeMobile ? 0.5 : 0,
      mb: shouldBeMobile ? 2 : 3
    }}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            fontSize: shouldBeMobile ? '0.75rem' : '0.875rem',
            fontWeight: 500
          }}>
            {item.icon && (
              <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </Box>
            )}
            {item.href ? (
              <Box 
                component="a"
                href={item.href}
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {item.label}
              </Box>
            ) : (
              <Box sx={{ color: 'text.primary' }}>
                {item.label}
              </Box>
            )}
          </Box>
          {index < items.length - 1 && defaultSeparator}
        </React.Fragment>
      ))}
    </Box>
  );
}; 