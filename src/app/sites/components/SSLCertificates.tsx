import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  Tooltip,
  IconButton
} from '@mui/material';
import HttpsIcon from '@mui/icons-material/Https';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface SSLCertificatesProps {
  customDomains?: string[];
}

const SSLCertificates: React.FC<SSLCertificatesProps> = ({ 
  customDomains = [] 
}) => {
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
        SSL Certificates
      </Typography>
      
      <Box sx={{ mt: 2, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Secure your site with HTTPS using SSL certificates
        </Typography>
      </Box>
      
      {/* SSL Certificates Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          mb: 3
        }}
      >
        <Box 
          sx={{ 
            p: 0,  
            border: '1px solid #e0e0e0',
            borderRadius: 2
          }}
        >
          {/* SSL Certificates Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              bgcolor: 'rgba(0, 74, 173, 0.05)',
              borderBottom: '1px solid #e0e0e0',
              borderRadius: '2px 2px 0 0'
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={500}>
                SSL Certificates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage SSL certificates for your domains
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: '#004aad',
                color: 'white',
                '&:hover': { bgcolor: '#003a87' },
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              Configure SSL
            </Button>
          </Box>
          
          {/* SSL Certificates Content */}
          <Box sx={{ p: 3 }}>
            {customDomains.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {customDomains.map((domain, index) => (
                  <Box 
                    key={index} 
                    sx={{
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HttpsIcon sx={{ color: '#4caf50', mr: 1.5, fontSize: 20 }} />
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {domain}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Let's Encrypt (Auto-renews in 60 days)
                        </Typography>
                      </Box>
                    </Box>
                    <Tooltip title="Renewed automatically 30 days before expiration">
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" sx={{ color: '#666' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ 
                py: 4, 
                textAlign: 'center', 
                bgcolor: '#f9f9f9', 
                borderRadius: 1,
                border: '1px dashed #ccc'
              }}>
                <Typography variant="body1" color="text.secondary">
                  There are no SSL certificates configured on this application.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Set up SSL certificates to enable HTTPS for your site.
                </Typography>
              </Box>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              SSL certificates enable encrypted connections (HTTPS) to your site, protecting user data and improving your site's security rating in search engines.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SSLCertificates; 