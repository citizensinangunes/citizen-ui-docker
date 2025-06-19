"use client";

import React from 'react';
import { SiteDetails as SiteDetailsType } from '@/types/site.types';

// Import UI components
import { Tabs, TabItem } from '@/components/ui';

// Import tab content components
import Dashboard from './Dashboard';
import SiteConfiguration from './SiteConfiguration';
import DeploysList from './DeploysList';
import PreviewServers from './PreviewServers';
import LogViewer from './LogViewer';
import DockerManagement from './DockerManagement';

interface SiteDetailsTabsProps {
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

export default function SiteDetailsTabs({ siteId, siteData, onDeleteSite, onNotification }: SiteDetailsTabsProps) {
  // Define tabs configuration
  const tabs: TabItem[] = [
    {
      label: 'Overview',
      shortLabel: 'Overview',
      content: <Dashboard siteName={siteData?.name || `Site ${siteId}`} />
    },
    {
      label: 'Site Configuration',
      shortLabel: 'Config',
      content: (
        <SiteConfiguration 
          siteId={siteId} 
          siteData={siteData} 
          onDeleteSite={onDeleteSite}
          onNotification={onNotification}
        />
      )
    },
    {
      label: 'Deploys',
      shortLabel: 'Deploys',
      content: <DeploysList siteName={siteData?.name || `Site ${siteId}`} />
    },
    {
      label: 'DevServers',
      shortLabel: 'Servers',
      content: <PreviewServers siteName={siteData?.name || `Site ${siteId}`} />
    },
    {
      label: 'View Logs',
      shortLabel: 'Logs',
      content: <LogViewer siteName={siteData?.name || `Site ${siteId}`} />
    },
    {
      label: 'Docker Management',
      shortLabel: 'Docker',
      content: <DockerManagement siteName={siteData?.name || `Site ${siteId}`} />
    }
  ];

  return (
    <Tabs 
      tabs={tabs}
      defaultValue={0}
      responsive={true}
      bordered={true}
      elevation={0}
      sx={{ mb: 3 }}
    />
  );
} 