import { NavItem } from './types';
import * as Icons from './components/icons';

export const mainNav: NavItem[] = [
  { isHeader: true, title: 'Operations' },
  { title: 'Dashboard', path: '/dashboard', icon: Icons.HomeIcon },
  {
    title: 'Orders',
    path: '/orders',
    icon: Icons.OrderIcon,
    children: [
      { title: 'Create Order', path: '/orders/create' },
      { title: 'View Orders', path: '/orders/view' },
      { title: 'International Order', path: '/orders/international' },
    ],
  },
  { title: 'Tracking', path: '/tracking', icon: Icons.TrackingIcon },

  { isHeader: true, title: 'Network' },
  { title: 'Sub Tenants', path: '/network/sub-tenants', icon: Icons.NetworkIcon },
  { title: 'Users', path: '/network/users', icon: Icons.UsersIcon },
  
  { isHeader: true, title: 'Finance' },
  { title: 'Rate Cards', path: '/finance/rate-cards', icon: Icons.FinanceIcon },
  { title: 'Zone Management', path: '/finance/zone-management', icon: Icons.LocationPinIcon },
  { title: 'CA Calculator', path: '/finance/ca-calculator', icon: Icons.FinanceIcon },
  {
    title: 'Billings & Payments',
    path: '/finance/billing',
    icon: Icons.BillingIcon,
    children: [
      { title: 'Wallet', path: '/finance/billing/wallet' },
      { title: 'Recharge Request', path: '/finance/billing/recharge' },
      { title: 'Invoices', path: '/finance/billing/invoices' },
    ],
  },
  { title: 'Report & Analytics', path: '/finance/reports', icon: Icons.ReportIcon },

  { isHeader: true, title: 'Integration' },
  { title: 'Channels', path: '/integration/channels', icon: Icons.IntegrationIcon },
  {
    title: 'API & Webhook',
    path: '/integration/api',
    icon: Icons.ApiIcon,
    children: [
      { title: 'View API Keys', path: '/integration/api/view' },
      { title: 'Create API Key', path: '/integration/api/create' },
    ],
  },
  { title: 'Domains', path: '/integration/domains', icon: Icons.DomainIcon },
];


export const settingsNav: NavItem[] = [
    { isHeader: true, title: 'Accounts' },
    { title: 'Profile', path: '/settings/profile', icon: Icons.ProfileIcon },
  
    { isHeader: true, title: 'Permissions' },
    { title: 'Users & Roles', path: '/settings/permissions/users-roles', icon: Icons.PermissionIcon },
  
    { isHeader: true, title: 'Alerts' },
    { title: 'Notifications', path: '/settings/alerts/notifications', icon: Icons.NotificationIcon },
  
    { isHeader: true, title: 'Configuration' },
    { title: 'Admin Settings', path: '/settings/configuration/admin', icon: Icons.SettingsIcon },
];