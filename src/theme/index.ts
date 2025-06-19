import theme from './theme';
import ThemeRegistry from './ThemeRegistry';
import { TypographyVariant } from '@mui/material';

// Typography constants - using actual variant types
export const TYPOGRAPHY = {
  // Title hierarchies
  PAGE_TITLE: 'h1' as TypographyVariant,
  SECTION_TITLE: 'h2' as TypographyVariant,
  CARD_TITLE: 'h3' as TypographyVariant,
  SUBSECTION_TITLE: 'h4' as TypographyVariant,
  COMPONENT_TITLE: 'h5' as TypographyVariant,
  SMALL_TITLE: 'h6' as TypographyVariant,
  
  // Text hierarchies
  BODY_TEXT: 'body1' as TypographyVariant,
  SECONDARY_TEXT: 'body2' as TypographyVariant,
  LABEL_TEXT: 'caption' as TypographyVariant,
  
  // Interactive text
  BUTTON_TEXT: 'button' as TypographyVariant,
  
  // Special text
  SECTION_DIVIDER: 'subtitle1' as TypographyVariant,
  CONTENT_HEADER: 'subtitle2' as TypographyVariant,
};

// Color constants
export const COLORS = {
  PRIMARY: '#004aad',
  PRIMARY_DARK: '#003a87',
  PRIMARY_LIGHT: 'rgba(0, 74, 173, 0.04)',
  
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#555555',
  TEXT_TERTIARY: '#666666',
  
  BG_DEFAULT: '#F8F8FF',
  BG_PAPER: '#ffffff',
  BG_HIGHLIGHT: 'rgba(0, 74, 173, 0.18)',
  
  BORDER_LIGHT: '#e0e0e0',
  BORDER_MEDIUM: '#d0d0d0',
  
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3',
};

export { theme, ThemeRegistry };
export default theme; 