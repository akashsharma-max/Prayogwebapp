import React from 'react';

export interface NavItem {
  title: string;
  path?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isHeader?: boolean;
  children?: NavItem[];
}

export type KycStatus = 'Completed' | 'Pending' | 'Not Started' | 'Rejected';

export interface KycDetails {
  status: KycStatus;
  documentType?: string;
  documentNumber?: string;
}

export interface WidgetData {
  title: string;
  total: number;
  percent: number;
  chartData: number[];
  color: 'primary' | 'info' | 'error';
  isCurrency?: boolean;
}

export interface ChartSeriesData {
  name: string;
  data: number[];
}

export interface ChartData {
  categories: string[];
  series: ChartSeriesData[];
}

export interface TopSubTenant {
  id: string;
  name: string;
  owner: string;
  revenue: number;
  profit: number;
  avatarUrl: string;
}

export interface RecentUser {
  id: string;
  name: string;
  avatarUrl: string;
  onboardedAt: string;
}

// Order History Page Types
export type OrderStatus = 
  | 'CONFIRMED' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'PENDING' 
  | 'PROCESSING'
  | 'FAILED'
  | 'READY_FOR_DISPATCH';

export interface OrderEntity {
  id: string;
  orderId: string;
  awbNumber: string;
  destinationPincode: string;
  deliveryPromise: string;
  weight: string;
  lbh: string;
  bookingDate: string;
  paymentMode: string;
  status: OrderStatus;
  parcelCategory: 'DOMESTIC' | 'INTERNATIONAL';
}

// Existing types (kept for other pages)
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export enum ActivityStatus {
  Completed = 'Completed',
  Pending = 'Pending',
  Failed = 'Failed',
}

export interface RecentActivity {
  id: string;
  user: {
    name: string;
    avatarUrl: string;
  };
  action: string;
  timestamp: string;
  status: ActivityStatus;
}

export enum RateCardStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Draft = 'Draft',
}

export interface RateCard {
  id: string;
  name: string;
  region: string;
  service: string;
  price: number;
  status: RateCardStatus;
}

// Toast Notification Types
export type ToastType = 'success' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

// Deprecated types from old dashboard (can be removed if not used elsewhere)
export interface StatCardData {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
}
export interface RevenueData {
  month: string;
  revenue: number;
}