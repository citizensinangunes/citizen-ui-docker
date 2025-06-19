"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkFirstTimeSetup = async () => {
      try {
        // Temporarily always redirect to onboarding for testing
        router.replace('/onboarding');
        
        // Original logic (commented out for testing):
        // const response = await fetch('/api/setup/check-first-time');
        // const data = await response.json();
        // 
        // if (data.isFirstTime) {
        //   router.replace('/onboarding');
        // } else {
        //   router.replace('/auth');
        // }
      } catch (error) {
        console.error('Error checking first time setup:', error);
        // Fallback to auth page
        router.replace('/auth');
      } finally {
        setIsChecking(false);
      }
    };

    checkFirstTimeSetup();
  }, [router]);
  
  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'IBM Plex Sans, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    );
  }
  
  return null;
}