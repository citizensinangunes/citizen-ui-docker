"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SecurityPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the sites page since security scorecard has been removed
    router.push('/sites');
  }, [router]);
  
  return null;
} 