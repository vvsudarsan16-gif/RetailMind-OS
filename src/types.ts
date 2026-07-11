/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProductVersion {
  version: number;
  updatedAt: string;
  updatedBy: string;
  price: number;
  stock: number;
  changeNotes: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  cost: number; // For profit calculation
  stock: number;
  minStockLevel: number; // For low stock alerts
  maxStockLevel: number; // For over stock warnings
  images: string[];
  barcode: string;
  qrCode: string;
  specifications: Record<string, string>;
  offers: string[];
  reviews: Array<{
    user: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  rating: number;
  versions: ProductVersion[];
  expiryDate?: string; // For expiry management
  isApproved: boolean; // Product approval request workflow
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier' | 'customer';
  status: 'active' | 'suspended';
  loyaltyPoints: number;
  membership: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  walletBalance: number;
  addresses: string[];
  paymentMethods: string[];
}

export interface Employee {
  id: string;
  userId: string;
  name: string;
  role: string;
  branch: string;
  attendanceStatus: 'present' | 'absent' | 'late' | 'leave';
  attendanceRate: number;
  performanceScore: number; // Rating out of 5
  salary: number;
  joinedDate: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  revenue: number;
  profit: number;
  stockCount: number;
  employeeCount: number;
}

export interface SplitPaymentDetail {
  method: string;
  amount: number;
}

export interface Order {
  id: string;
  type: 'online' | 'offline' | 'pickup' | 'return';
  customerId?: string;
  customerName?: string;
  branchId: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  couponCode?: string;
  paymentMethod: string; // 'cash' | 'upi' | 'card' | 'split' etc.
  splitDetails?: SplitPaymentDetail[];
  status: 'pending' | 'processing' | 'completed' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
  address?: string;
  giftWrap?: boolean;
  deliverySlot?: string;
  trackingStep?: number; // 0: Placed, 1: Processed, 2: Shipped, 3: Delivered
  createdAt: string;
  cashierId?: string;
  transactionId?: string;
  invoiceId?: string;
  fraudScore?: number;
  fraudReason?: string;
  offlineSynced?: boolean;
  loyaltyEarned?: number;
  loyaltySpent?: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: Array<{
    productName: string;
    quantity: number;
    cost: number;
  }>;
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
  expectedDelivery: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  category: string;
  rating: number; // 1-5
  reliability: number; // %
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  role: string;
  action: string;
  details: string;
  ip: string;
  device: string;
  browser: string;
  location: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
  targetRole: 'all' | 'admin' | 'manager' | 'cashier';
}

export interface StoreNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  createdAt: string;
  read: boolean;
}
