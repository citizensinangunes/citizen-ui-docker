// Export all components for easy imports throughout the application
export { default as DashboardLayout } from './DashboardLayout';
export { default as NewSiteModal } from './NewSiteModal';

// Additional components can be exported here as they are created
// For example:
// export { default as SiteDetails } from './SiteDetails';
// export { default as DeploymentHistory } from './DeploymentHistory';
// export { default as SiteStats } from './SiteStats';
// export { default as SiteSettings } from './SiteSettings';
// export { default as SiteAnalytics } from './SiteAnalytics';
// export { default as AccessControl } from './AccessControl';
// export { default as NotificationSettings } from './NotificationSettings';

// This barrel file pattern allows for cleaner imports in other files
// Instead of:
//   import DashboardLayout from '@/components/DashboardLayout';
//   import NewSiteModal from '@/components/NewSiteModal';
// You can do:
//   import { DashboardLayout, NewSiteModal } from '@/components';