"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the sites page since billing has been removed
    router.push('/sites');
  }, [router]);
  
  return null;
}
