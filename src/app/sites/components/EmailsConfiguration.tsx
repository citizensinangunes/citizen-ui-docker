import React, { useState } from 'react';
import { 
  MenuItem,
  Select,
  FormControl,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';

// Import UI components
import { 
  CollapsibleCard, 
  Button, 
  ActionButtons,
  Box,
  Typography,
  TextField,
  GridFormField,
  GridPasswordField
} from '@/components/ui';

const EmailsConfiguration: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [emailProvider, setEmailProvider] = useState('Mailgun');
  const [apiKey, setApiKey] = useState('••••••••••••');
  const [domain, setDomain] = useState('');
  const [region, setRegion] = useState('');
  const [directory, setDirectory] = useState('./emails');
  const [isEditing, setIsEditing] = useState(true);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const renderViewField = (label: string, value: string) => (
    <Box 
      sx={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', 
        gap: isMobile ? 1 : 3, 
        mb: 3 
      }}
    >
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: 500,
          fontSize: isMobile ? '0.875rem' : '1rem'
        }}
      >
        {label}
      </Typography>
      <Typography 
        variant="body2"
        sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
      >
        {value}
      </Typography>
    </Box>
  );

  const cardContent = (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0,
        mb: 3 
      }}>
        <Typography 
          variant="body1" 
          fontWeight={500}
          sx={{ fontSize: isMobile ? '1rem' : '1.125rem' }}
        >
          Provider Settings
        </Typography>
        {!isEditing && (
          <Button
            variant="outline"
            icon={<SettingsIcon />}
            iconPosition="left"
            onClick={handleEdit}
            responsive
          >
            Configure
          </Button>
        )}
      </Box>

      {isEditing ? (
        <Box sx={{ mb: 3 }}>
          <GridFormField label="Emails provider:" responsive>
            <FormControl fullWidth size="small">
              <Select
                value={emailProvider}
                onChange={(e) => setEmailProvider(e.target.value as string)}
                displayEmpty
                sx={{ 
                  bgcolor: 'white',
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }}
              >
                <MenuItem value="Mailgun">Mailgun</MenuItem>
                <MenuItem value="SendGrid">SendGrid</MenuItem>
                <MenuItem value="SMTP">SMTP</MenuItem>
                <MenuItem value="AWS SES">AWS SES</MenuItem>
              </Select>
            </FormControl>
          </GridFormField>

          <GridPasswordField
            label="Emails provider API key:"
            value={apiKey}
            onChange={setApiKey}
            responsive
          />

          {emailProvider === 'Mailgun' && (
            <>
              <Box sx={{ mb: 1 }}>
                <Button
                  variant="ghost"
                  icon={<ArrowForwardIcon />}
                  iconPosition="right"
                  onClick={() => {}}
                  responsive
                  sx={{ 
                    color: '#2e7d32',
                    fontWeight: 500,
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    pl: 0,
                    mb: 2,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  How to get your API key
                </Button>
              </Box>

              <GridFormField label="Mailgun domain:" responsive>
                <TextField
                  fullWidth
                  size="small"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  sx={{ 
                    bgcolor: 'white',
                    '& .MuiInputBase-input': {
                      fontSize: isMobile ? '0.875rem' : '1rem'
                    }
                  }}
                />
              </GridFormField>

              <GridFormField label="Mailgun host region:" responsive>
                <FormControl fullWidth size="small">
                  <Select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as string)}
                    displayEmpty
                    sx={{ 
                      bgcolor: 'white',
                      fontSize: isMobile ? '0.875rem' : '1rem'
                    }}
                    renderValue={(selected) => {
                      if (selected === '') {
                        return <em>Select...</em>;
                      }
                      return selected;
                    }}
                  >
                    <MenuItem disabled value="">
                      <em>Select...</em>
                    </MenuItem>
                    <MenuItem value="US">US</MenuItem>
                    <MenuItem value="EU">EU</MenuItem>
                  </Select>
                </FormControl>
              </GridFormField>
            </>
          )}

          <GridFormField label="Emails directory:" responsive>
            <TextField
              fullWidth
              size="small"
              value={directory}
              onChange={(e) => setDirectory(e.target.value)}
              sx={{ 
                bgcolor: 'white',
                '& .MuiInputBase-input': {
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }
              }}
            />
          </GridFormField>
        </Box>
      ) : (
        <Box sx={{ mb: 3 }}>
          {renderViewField('Email provider:', emailProvider)}
          {renderViewField('API key:', 'Hidden')}
          {renderViewField('Emails directory:', directory)}
        </Box>
      )}

      <Button
        variant="ghost"
        icon={<ArrowForwardIcon />}
        iconPosition="right"
        onClick={() => {}}
        responsive
        sx={{ 
          color: '#2e7d32',
          fontWeight: 500,
          fontSize: isMobile ? '0.875rem' : '1rem',
          pl: 0,
          mt: 2,
          '&:hover': {
            backgroundColor: 'transparent',
            textDecoration: 'underline'
          }
        }}
      >
        Learn more about Email Extension in the docs
      </Button>

      {isEditing && (
        <Box sx={{ mt: 4 }}>
          <ActionButtons
            onCancel={handleCancel}
            onSave={handleSave}
            cancelText="Cancel"
            saveText="Save"
            responsive
          />
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 500, 
            mb: 1,
            fontSize: isMobile ? '1.125rem' : '1.25rem'
          }}
        >
          Emails
        </Typography>
        
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
          >
            Set up your email provider and configure your email settings
          </Typography>
        </Box>
      </Box>

      <CollapsibleCard
        title="Email Configuration"
        subtitle="Configure email provider settings"
        icon={<EmailIcon sx={{ color: '#004aad' }} />}
        defaultExpanded={true}
        responsive
      >
        {cardContent}
      </CollapsibleCard>
    </Box>
  );
};

export default EmailsConfiguration; 