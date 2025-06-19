"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExtensionsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the sites page since extensions have been removed
    router.push('/sites');
  }, [router]);
  
  return null;
} 