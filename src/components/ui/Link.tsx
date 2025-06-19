import React from 'react';
import { Link as MuiLink, Box } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  showArrow?: boolean;
  color?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  external?: boolean;
  style?: React.CSSProperties;
}

export function Link({ 
  href, 
  children, 
  showArrow = true, 
  color = '#2ebc4f',
  target,
  rel,
  onClick,
  external = false,
  style
}: LinkProps) {
  // If external is true, set target and rel automatically
  const linkTarget = external ? '_blank' : target;
  const linkRel = external ? 'noopener noreferrer' : rel;

  return (
    <MuiLink 
      href={href}
      target={linkTarget}
      rel={linkRel}
      onClick={onClick}
      style={style}
      sx={{ 
        display: 'flex',
        alignItems: 'center',
        color: color, 
        textDecoration: 'none',
        fontWeight: 500,
        '&:hover': { 
          textDecoration: 'underline'
        }
      }}
    >
      {children}
      {showArrow && <ArrowForwardIcon sx={{ ml: 0.5, fontSize: 18 }} />}
    </MuiLink>
  );
}

export type { LinkProps }; 