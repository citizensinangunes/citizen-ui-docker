'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import theme from '@/theme/theme';

const globalStyles = (
  <GlobalStyles
    styles={{
      ':root': {
        '--max-width': '1200px',
        '--border-radius': '4px',
        '--font-mono': 'ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace',
      },
      '*': {
        boxSizing: 'border-box',
      },
      'html, body': {
        maxWidth: '100vw',
        overflowX: 'hidden',
        height: '100%',
        margin: 0,
        padding: 0,
      },
      body: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f5f5f0',
      },
      a: {
        color: 'inherit',
        textDecoration: 'none',
      },
    }}
  />
);

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      {children}
    </ThemeProvider>
  );
}