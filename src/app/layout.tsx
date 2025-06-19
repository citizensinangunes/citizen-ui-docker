import React from 'react';
import { IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import ThemeRegistry from '../theme/ThemeRegistry';
import { RoleProvider } from '@/context/RoleContext';
import { AuthProvider } from '@/context/AuthContext';

const ibmPlexSans = IBM_Plex_Sans({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Citizen Dashboard',
  description: 'Citizen platform dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={ibmPlexSans.className}>
        <ThemeRegistry>
          <AuthProvider>
            <RoleProvider>
              {children}
            </RoleProvider>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}