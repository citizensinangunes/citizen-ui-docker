"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SiteDetails as SiteDetailsType } from '@/types/site.types';

// Import UI components
import {
  PageContainer,
  LoadingState,
  ErrorState,
  DetailedNotificationAlert
} from '@/components/ui';

// Import the new refactored components
import SiteDetailsHeader from './SiteDetailsHeader';
import SiteDetailsTabs from './SiteDetailsTabs';

interface SiteDetailsProps {
  siteId: string;
}

export default function SiteDetails({ siteId }: SiteDetailsProps) {
  const router = useRouter();
  console.log("SiteDetails component received siteId:", siteId, "Type:", typeof siteId);
  
  // Notification states
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'info' | 'warning' | 'error',
    title: '',
    details: null as Record<string, number> | null
  });

  // New state for fetching site data from API
  const [siteData, setSiteData] = useState<SiteDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Fetch site data from API
  useEffect(() => {
    console.log("SiteDetails component - siteId:", siteId);
    const fetchSiteData = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        setError(null);
        
        const response = await fetch(`/api/sites/${siteId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
            throw new Error('Site bulunamadı');
          } else {
            throw new Error('Site details yüklenirken bir hata oluştu');
          }
        }
        
        const data = await response.json();
        if (data.site) {
          console.log("Fetched site data:", data.site.name, "with ID:", data.site.id);
          setSiteData(data.site);
        } else {
          throw new Error('API geçerli site verisi döndürmedi');
        }
      } catch (err) {
        console.error('Site details alınırken hata:', err);
        setError('Site details yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    if (siteId) {
      fetchSiteData();
    }
  }, [siteId]);

  // Update page title
  useEffect(() => {
    if (siteData?.name) {
      document.title = `${siteData.name} | Citizen UI`;
    } else {
      document.title = `Site Details | Citizen UI`;
    }

    // Cleanup
    return () => {
      document.title = 'Citizen UI';
    };
  }, [siteData?.name]);

  // Function to handle site deletion
  const handleDeleteSite = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      console.log(`[SITE-UI] Attempting to delete site with ID: ${siteId}`);
      console.log(`[SITE-UI] Token (truncated): ${token.substring(0, 15)}...`);
      
      // Create cookie with token just to be sure
      document.cookie = `auth_token=${token}; path=/;`;
      
      // Call the API to delete the site
      const response = await fetch(`/api/sites/${siteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include' // This ensures cookies are sent
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`[SITE-UI] Delete failed with status: ${response.status}`, data);
        throw new Error(data.error || 'Failed to delete site');
      }
      
      console.log(`[SITE-UI] Site successfully deleted: ${data.site?.name}`);
      
      // Show detailed information about deleted records
      if (data.deletedRecords) {
        console.log('[SITE-UI] Deleted records statistics:', data.deletedRecords);
        console.log(`[SITE-UI] Total records deleted: ${data.totalRecordsDeleted}`);
        
        // Update notification state
        setNotification({
          open: true,
          severity: 'success',
          title: 'Site Başarıyla Silindi',
          message: `Site "${data.site?.name}" ve ilişkili ${data.totalRecordsDeleted} kayıt başarıyla silindi.`,
          details: data.deletedRecords
        });
      } else {
        // Simple success notification
        setNotification({
          open: true,
          severity: 'success',
          title: 'Site Başarıyla Silindi',
          message: `Site "${data.site?.name}" başarıyla silindi.`,
          details: null
        });
      }
      
      // Navigate back to sites list after a short delay to show notification
      setTimeout(() => {
        router.push('/sites');
      }, 2000);
    } catch (error) {
      console.error('[SITE-UI] Error deleting site:', error);
      setError((error as Error).message || 'Failed to delete site. Please try again.');
      
      // Show error notification
      setNotification({
        open: true,
        severity: 'error',
        title: 'Silme İşlemi Başarısız',
        message: (error as Error).message || 'Site silinirken bir hata oluştu. Lütfen tekrar deneyin.',
        details: null
      });
      
      setLoading(false);
    }
  };
  
  // Notification close function
  const handleCloseNotification = () => {
    setNotification(prev => ({...prev, open: false}));
  };

  // Handle notification from child components
  const handleNotification = (newNotification: typeof notification) => {
    setNotification(newNotification);
  };

  return (
    <PageContainer padding={2} responsive>
      {/* Notification Alert */}
      <DetailedNotificationAlert
        open={notification.open}
        title={notification.title}
        message={notification.message}
        severity={notification.severity}
        details={notification.details}
        onClose={handleCloseNotification}
        autoHideDuration={6000}
        responsive
      />

      {loading ? (
        <LoadingState
          message="Site details are loading..."
          size={60}
          minHeight="60vh"
          responsive
        />
      ) : notFound ? (
        <ErrorState
          title="Site bulunamadı"
          message={`Aradığınız site bulunamadı. Site ID: ${siteId}`}
          buttonText="Tüm Sitelere Dön"
          onButtonClick={() => router.push('/sites')}
          buttonColor="#004aad"
          responsive
        />
      ) : error ? (
        <ErrorState
          title={error}
          buttonText="Tekrar Dene"
          onButtonClick={() => window.location.reload()}
          buttonColor="#004aad"
          responsive
        />
      ) : (
        <>
          {/* Site Header Component */}
          <SiteDetailsHeader 
            siteId={siteId} 
            siteData={siteData} 
            onNotification={handleNotification}
          />

          {/* Site Tabs Component */}
          <SiteDetailsTabs 
            siteId={siteId} 
            siteData={siteData} 
            onDeleteSite={handleDeleteSite}
            onNotification={handleNotification}
          />
        </>
      )}
    </PageContainer>
  );
}