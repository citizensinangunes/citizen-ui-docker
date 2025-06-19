import React from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertTitle, 
  Typography, 
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';

export interface NotificationProps {
  message: string;
  severity?: 'success' | 'info' | 'warning' | 'error';
  autoHideDuration?: number;
}

export interface DetailedNotificationAlertProps {
  open: boolean;
  title: string;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  details?: Record<string, number> | null;
  onClose: () => void;
  autoHideDuration?: number;
  responsive?: boolean;
}

export const Notification: React.FC<NotificationProps> = ({ 
  message, 
  severity = 'info', 
  autoHideDuration = 4000 
}) => {
  return (
    <Alert severity={severity} sx={{ mb: 2 }}>
      {message}
    </Alert>
  );
};

export const DetailedNotificationAlert: React.FC<DetailedNotificationAlertProps> = ({
  open,
  title,
  message,
  severity,
  details,
  onClose,
  autoHideDuration = 6000,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        severity={severity}
        onClose={onClose}
        sx={{ 
          width: '100%', 
          maxWidth: shouldBeMobile ? '90vw' : '500px',
          mb: 2,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
        variant="filled"
      >
        <AlertTitle sx={{ fontSize: shouldBeMobile ? '1rem' : '1.125rem' }}>
          {title}
        </AlertTitle>
        <Typography sx={{ fontSize: shouldBeMobile ? '0.875rem' : '1rem' }}>
          {message}
        </Typography>
        
        {details && (
          <Box sx={{ 
            mt: shouldBeMobile ? 1.5 : 2, 
            fontSize: shouldBeMobile ? '0.75rem' : '0.85rem' 
          }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 'bold', 
                mb: shouldBeMobile ? 0.75 : 1,
                fontSize: shouldBeMobile ? '0.8rem' : '0.9rem'
              }}
            >
              Silinen kayıtlar:
            </Typography>
            <Box component="ul" sx={{ pl: shouldBeMobile ? 1.5 : 2, m: 0 }}>
              <Box component="li">Domainler: {details.domains}</Box>
              <Box component="li">Konfigürasyon değişkenleri: {details.configVars}</Box>
              <Box component="li">Deploymentlar: {details.deployments}</Box>
              <Box component="li">Site konfigürasyonları: {details.siteConfiguration}</Box>
              <Box component="li">Takım erişimleri: {details.teamAccess}</Box>
              <Box component="li">
                Metrik kayıtları: {
                  (details.metrics || 0) + (details.metricsHistory || 0)
                }
              </Box>
            </Box>
          </Box>
        )}
      </Alert>
    </Snackbar>
  );
}; 