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

// Order Detail Page Types
export interface OrderDetail {
  id: number;
  bookingType: string;
  orderId: string;
  referenceId: string;
  parcelCategory: string;
  orderDate: string;
  expectedDeliveryDate: string;
  orderType: string;
  returnable: boolean;
  deliveryMode: string;
  deliveryPromise: string;
  orderStatus: OrderStatus;
  metadata: {
    createdBy: string;
  };
  createdAt: string;
  updatedAt: string;
  addresses: Address[];
  documents: any[]; 
  shipments: Shipment[];
  vehicles: any[];
  slots: any[];
  payment: Payment;
  taxes: any[];
  discounts: any[];
  orderSource: {
    id: number;
  };
}

export interface Address {
  id: number;
  type: 'PICKUP' | 'DELIVERY' | string;
  zip: string;
  name: string;
  phone: string;
  email: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  hubId: number;
  latitude: number;
  longitude: number;
  addressName: string;
}

export interface Shipment {
  id: number;
  isChild?: boolean;
  isParent?: boolean;
  awbNumber: string;
  shipmentStatus: string;
  documentType: string;
  dimensions: {
    unit: string;
    width: number;
    height: number;
    length: number;
  };
  physicalWeight: number;
  volumetricWeight: number;
  note: string;
  packaging: Packaging;
  items: Item[];
}

export interface Packaging {
  id: number;
  type: string;
  materials: string[];
  fragileHandling: boolean;
  temperatureRange: {
    max: number;
    min: number;
    unit: string;
  };
}

export interface Item {
  id: number;
  name: string;
  quantity: number;
  weight: number;
  unitPrice: number;
  sku: string;
  hsnCode: string;
  dimensions: {
    unit: string;
    width: number;
    height: number;
    length: number;
  };
  description: string;
  taxes: Tax[];
  discounts: Discount[];
}

export interface Tax {
  id: number;
  name: string;
  type: string;
  value: number;
}

export interface Discount {
  id: number;
  name: string;
  type: string;
  value: number;
}

export interface OtherCharge {
  id: number;
  name: string;
  chargedAmount: number;
}

export interface Payment {
  id: number;
  finalAmount: number;
  breakdown: {
    id: number;
    subTotal: number;
    taxes: any[] | null;
    discounts: any[] | null;
    otherCharges: OtherCharge[] | null;
  };
  splitPayments: any[] | null;
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

// Font Size Type
export type FontSize = 'sm' | 'md' | 'lg';

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