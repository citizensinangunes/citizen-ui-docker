"use client";

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Link as MuiLink,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import Image from 'next/image';
import { TYPOGRAPHY, COLORS } from '@/theme';

export default function DomainsPage() {
  return (
    <DashboardLayout>
      <Box sx={{ p: 3, width: '100%' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          width: '100%'
        }}>
          <Typography variant={TYPOGRAPHY.COMPONENT_TITLE} color={COLORS.PRIMARY} gutterBottom>
            Domains
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            Add or register domain
          </Button>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 3, 
            borderRadius: 2,
            bgcolor: COLORS.BG_HIGHLIGHT,
            width: '100%'
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Typography variant={TYPOGRAPHY.SUBSECTION_TITLE} gutterBottom color={COLORS.PRIMARY}>
              Domain Configuration
            </Typography>
            
            <Typography variant={TYPOGRAPHY.SMALL_TITLE} sx={{ mb: 2 }}>
              Configure your existing domain to use Citizen DNS or purchase one right here and we'll set it up for you.
            </Typography>
            
            <Typography variant={TYPOGRAPHY.BODY_TEXT}>
              Citizen DNS is backed by NS1 – the best DNS service available. It is globally aware so that no matter where a request comes from, all requests are routed to the nearest nodes.
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <MuiLink 
                href="https://docs.citizen.com/dns" 
                target="_blank"
                sx={{ 
                  color: COLORS.PRIMARY,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Learn more about Citizen DNS in the docs
                <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
              </MuiLink>
            </Box>
          </Box>
        </Paper>

        <Paper 
          elevation={0} 
          sx={{ 
            py: 6, 
            px: 3,
            border: `1px solid ${COLORS.BORDER_LIGHT}`, 
            borderRadius: 2,
            textAlign: 'center',
            width: '100%'
          }}
        >
          <Box sx={{ maxWidth: 500, mx: 'auto' }}>
            <Image
              src="/globe.svg"
              width={80}
              height={80}
              alt="Globe Icon"
              style={{ margin: '0 auto 24px' }}
            />
            
            <Typography variant={TYPOGRAPHY.SMALL_TITLE} gutterBottom>
              You don't have any domains yet
            </Typography>
            
            <Typography variant={TYPOGRAPHY.BODY_TEXT} color="text.secondary" sx={{ mb: 3 }}>
              Add your own domain or purchase a new one to get started.
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ px: 3, py: 1 }}
            >
              Add or register domain
            </Button>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, width: '100%' }}>
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant={TYPOGRAPHY.SMALL_TITLE} gutterBottom>
            Domain FAQs
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant={TYPOGRAPHY.SECTION_DIVIDER} gutterBottom>
              What is a domain?
            </Typography>
            <Typography variant={TYPOGRAPHY.SECONDARY_TEXT} color="text.secondary" sx={{ mb: 2 }}>
              A domain name is your website's address on the internet. It's what users type in their browser to find your site (e.g., example.com).
            </Typography>
            
            <Typography variant={TYPOGRAPHY.SECTION_DIVIDER} gutterBottom>
              Can I use my existing domain?
            </Typography>
            <Typography variant={TYPOGRAPHY.SECONDARY_TEXT} color="text.secondary" sx={{ mb: 2 }}>
              Yes! You can connect any domain you own to Citizen by adding it here and following the DNS configuration steps.
            </Typography>
            
            <Typography variant={TYPOGRAPHY.SECTION_DIVIDER} gutterBottom>
              What is Citizen DNS?
            </Typography>
            <Typography variant={TYPOGRAPHY.SECONDARY_TEXT} color="text.secondary" sx={{ mb: 2 }}>
              Citizen DNS is our managed DNS service that provides fast global resolution, simple configuration, and advanced features like automatic SSL certificates for your domains.
            </Typography>
            
            <Typography variant={TYPOGRAPHY.SECTION_DIVIDER} gutterBottom>
              How much does a new domain cost?
            </Typography>
            <Typography variant={TYPOGRAPHY.SECONDARY_TEXT} color="text.secondary">
              Domain pricing varies based on the TLD (.com, .io, etc.). You can see pricing during the registration process. Most .com domains start at around $14/year.
            </Typography>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}