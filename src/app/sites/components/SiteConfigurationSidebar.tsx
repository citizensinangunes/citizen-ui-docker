"use client";

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Configuration categories and subcategories
const configCategories = [
  {
    name: 'General',
    subcategories: [
      { name: 'Site details', content: 'Configure basic site information' },
      { name: 'Status badges', content: 'Manage status badges' },
      { name: 'Site members', content: 'Manage team members' },
      { name: 'Danger zone', content: 'Critical site operations' }
    ]
  },
  {
    name: 'Build & deploy',
    subcategories: [
      { name: 'Continuous deployment', content: 'Configure automatic deployments' },
      { name: 'Build plugins', content: 'Coming soon', disabled: true }
    ]
  },
  {
    name: 'Config Vars',
    subcategories: []
  },
  {
    name: 'Notifications',
    subcategories: [
      { name: 'Emails and webhooks', content: 'Set up email and webhook notifications' }
    ]
  },
  {
    name: 'Access & Certificates',
    subcategories: [
      { name: 'Auth', content: 'Configure authentication settings' },
      { name: 'SSL Certificates', content: 'Set up SSL certificates' },
    ]
  },
  {
    name: 'Emails',
    subcategories: [
      { name: 'Configuration', content: 'Configure email settings' }
    ]
  }
];

interface SiteConfigurationSidebarProps {
  configCategory: string;
  configSubcategory: string;
  openCategories: Record<string, boolean>;
  onCategoryClick: (categoryName: string) => void;
  onSubcategoryClick: (subcategoryName: string, categoryName?: string) => void;
}

export default function SiteConfigurationSidebar({
  configCategory,
  configSubcategory,
  openCategories,
  onCategoryClick,
  onSubcategoryClick
}: SiteConfigurationSidebarProps) {
  return (
    <Box sx={{ borderRadius: 2 }}>
      {configCategories.map((category) => (
        <Accordion 
          key={category.name}
          expanded={openCategories[category.name] || category.subcategories.length === 0}
          onChange={() => onCategoryClick(category.name)}
          disableGutters
          elevation={0}
          sx={{ 
            '&:before': { display: 'none' },
            borderBottom: '1px solid #f5f5f5',
            '&:last-child': { borderBottom: 'none' }
          }}
        >
          <AccordionSummary
            expandIcon={category.subcategories.length > 0 ? <ExpandMoreIcon /> : null}
            sx={{ 
              bgcolor: configCategory === category.name ? 'rgba(0, 74, 173, 0.05)' : 'transparent',
              minHeight: '48px',
              '& .MuiAccordionSummary-content': {
                margin: '12px 0'
              }
            }}
          >
            <Typography 
              sx={{ 
                fontWeight: configCategory === category.name ? 500 : 400,
                color: configCategory === category.name ? '#004aad' : 'inherit'
              }}
            >
              {category.name}
            </Typography>
          </AccordionSummary>
          
          {category.subcategories.length > 0 && (
            <AccordionDetails sx={{ padding: 0 }}>
              <List component="div" disablePadding>
                {category.subcategories.map((subcat) => (
                  <ListItemButton 
                    key={subcat.name}
                    sx={{ 
                      pl: 4,
                      bgcolor: configSubcategory === subcat.name ? 'rgba(0, 74, 173, 0.05)' : 'transparent',
                      color: subcat.disabled ? '#999' : 'inherit',
                      cursor: subcat.disabled ? 'default' : 'pointer',
                      '&:hover': {
                        bgcolor: subcat.disabled ? 'transparent' : (configSubcategory === subcat.name ? 'rgba(0, 74, 173, 0.05)' : 'rgba(0, 0, 0, 0.04)')
                      },
                      pointerEvents: subcat.disabled ? 'none' : 'auto'
                    }}
                    onClick={() => !subcat.disabled && onSubcategoryClick(subcat.name, category.name)}
                    selected={configSubcategory === subcat.name && !subcat.disabled}
                    disabled={subcat.disabled}
                  >
                    <ListItemText 
                      primary={subcat.name} 
                      secondary={subcat.disabled ? "Coming soon" : undefined}
                      primaryTypographyProps={{ 
                        fontSize: '0.875rem',
                        fontWeight: configSubcategory === subcat.name ? 500 : 400,
                        color: subcat.disabled ? '#999' : (configSubcategory === subcat.name ? '#004aad' : 'inherit')
                      }}
                      secondaryTypographyProps={{
                        fontSize: '0.75rem',
                        fontStyle: 'italic'
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </AccordionDetails>
          )}
        </Accordion>
      ))}
    </Box>
  );
}

// Export the config categories for use in other components
export { configCategories }; 