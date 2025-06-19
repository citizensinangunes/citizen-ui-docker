"use client";

import React, { useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { SiteDetails as SiteDetailsType } from '@/types/site.types';

// Import UI components
import {
  ConfigurationLayout,
  Breadcrumb,
  ConfigurationContentArea
} from '@/components/ui';

// Import the new refactored components
import SiteConfigurationSidebar from './SiteConfigurationSidebar';
import SiteConfigurationContent from './SiteConfigurationContent';

interface SiteConfigurationProps {
  siteId: string;
  siteData: SiteDetailsType | null;
  onDeleteSite: () => Promise<void>;
  onNotification: (notification: {
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
    title: string;
    details: Record<string, number> | null;
  }) => void;
}

export default function SiteConfiguration({ siteId, siteData, onDeleteSite, onNotification }: SiteConfigurationProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [configCategory, setConfigCategory] = useState('General');
  const [configSubcategory, setConfigSubcategory] = useState('Site details');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'General': true,
    'Build & deploy': false,
    'Config Vars': false,
    'Notifications': false,
    'Access & security': false,
    'Emails': false
  });

  const handleCategoryClick = (categoryName: string) => {
    setConfigCategory(categoryName);
    
    // Import configCategories to find the category
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
    
    const category = configCategories.find(cat => cat.name === categoryName);
    if (category && category.subcategories.length > 0) {
      setConfigSubcategory(category.subcategories[0].name);
    } else {
      setConfigSubcategory('');
    }
    
    // Toggle open state for this category
    setOpenCategories({
      ...openCategories,
      [categoryName]: !openCategories[categoryName]
    });
  };

  const handleSubcategoryClick = (subcategoryName: string, categoryName?: string) => {
    // If category name is specified, select and open that category
    if (categoryName) {
      setConfigCategory(categoryName);
      // Open the category
      setOpenCategories({
        ...openCategories,
        [categoryName]: true
      });
    }
    setConfigSubcategory(subcategoryName);
  };

  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: configCategory }
  ];
  
  if (configSubcategory) {
    breadcrumbItems.push({ label: configSubcategory });
  }

  return (
    <ConfigurationLayout
      responsive
      sidebar={
        <SiteConfigurationSidebar
          configCategory={configCategory}
          configSubcategory={configSubcategory}
          openCategories={openCategories}
          onCategoryClick={handleCategoryClick}
          onSubcategoryClick={handleSubcategoryClick}
        />
      }
    >
      <ConfigurationContentArea
        title={
          <Breadcrumb
            items={breadcrumbItems}
            responsive
          />
        }
        minHeight="500px"
        responsive
      >
        <SiteConfigurationContent
          siteId={siteId}
          siteData={siteData}
          configCategory={configCategory}
          configSubcategory={configSubcategory}
          onDeleteSite={onDeleteSite}
          onNotification={onNotification}
        />
      </ConfigurationContentArea>
    </ConfigurationLayout>
  );
} 