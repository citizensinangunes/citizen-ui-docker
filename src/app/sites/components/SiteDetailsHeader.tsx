"use client";

import React, { useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import Link from 'next/link';
import { SiteDetails as SiteDetailsType } from '@/types/site.types';

// Import UI components
import {
  Breadcrumb,
  SiteHeaderCard,
  ShareSiteModal,
  Link as UILink
} from '@/components/ui';

interface SiteDetailsHeaderProps {
  siteId: string;
  siteData: SiteDetailsType | null;
  onNotification: (notification: {
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
    title: string;
    details: Record<string, number> | null;
  }) => void;
}

// Date formatting helper function
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}

export default function SiteDetailsHeader({ siteId, siteData, onNotification }: SiteDetailsHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Share Site Modal states
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Share Site handlers
  const handleShareSite = () => {
    setShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
  };

  // Prepare breadcrumb items
  const breadcrumbItems = [
    { 
      label: 'Sites',
      href: '/sites'
    },
    { 
      label: siteData?.name || `Site ${siteId}`
    }
  ];

  return (
    <>
      {/* Breadcrumbs Navigation */}
      <Breadcrumb
        items={breadcrumbItems}
        responsive
      />

      {/* Site Header Card */}
      {siteData && (
        <SiteHeaderCard
          siteName={siteData.name || 'Loading...'}
          subdomain={siteData.subdomain || 'Loading...'}
          status={siteData.status || 'inactive'}
          framework={siteData.framework?.name}
          repoName={siteData.repoName}
          lastDeployedAt={siteData.lastDeployedAt}
          onShareClick={handleShareSite}
          responsive
        />
      )}

      {/* Share Site Modal */}
      <ShareSiteModal
        open={shareModalOpen}
        siteName={siteData?.name || 'Site'}
        siteId={siteId}
        onClose={handleCloseShareModal}
        onNotification={onNotification}
        responsive
      />
    </>
  );
} 