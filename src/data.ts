/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, User, Employee, Branch, Supplier, AuditLog, ChatMessage, StoreNotification, PurchaseOrder } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-milk',
    name: 'Farm Fresh Organic Milk 1L',
    category: 'Groceries',
    description: 'High-quality organic whole milk sourced from local dairy farms. Rich in Calcium and Vitamin D.',
    price: 3.49,
    cost: 1.80,
    stock: 14, // Low stock on purpose to trigger alerts
    minStockLevel: 25,
    maxStockLevel: 150,
    images: [
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=600'
    ],
    barcode: '8801092304812',
    qrCode: 'QR_MILK_FARM_FRESH_1L',
    specifications: {
      'Volume': '1 Litre',
      'Type': 'Whole Milk',
      'Source': '100% Organic Grass-fed Cow',
      'Lifespan': '14 days'
    },
    offers: ['Buy 2 Get 10% Off', '10% Cashback on Wallet'],
    reviews: [
      { user: 'Samanth G.', rating: 5, comment: 'Super fresh, best milk ever!', date: '2026-07-01' },
      { user: 'David K.', rating: 4, comment: 'Very rich flavor, but expires quickly.', date: '2026-07-05' }
    ],
    rating: 4.5,
    versions: [
      { version: 1, updatedAt: '2026-06-01T08:00:00Z', updatedBy: 'admin', price: 3.29, stock: 100, changeNotes: 'Initial pricing' },
      { version: 2, updatedAt: '2026-07-01T10:30:00Z', updatedBy: 'manager-1', price: 3.49, stock: 120, changeNotes: 'Price adjusted for inflation and logistics costs' }
    ],
    expiryDate: '2026-07-20',
    isApproved: true
  },
  {
    id: 'prod-eggs',
    name: 'Cage-Free Brown Eggs (12pk)',
    category: 'Groceries',
    description: 'Grade A farm brown eggs, completely cage-free and rich in protein and Omega-3.',
    price: 4.99,
    cost: 2.20,
    stock: 45,
    minStockLevel: 20,
    maxStockLevel: 100,
    images: [
      'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&q=80&w=600'
    ],
    barcode: '8801092304959',
    qrCode: 'QR_EGGS_BROWN_12PK',
    specifications: {
      'Quantity': '12 Pack',
      'Type': 'Grade A Large',
      'Farm Type': 'Cage-Free'
    },
    offers: ['Save $1.00 on Bakery item when bought together'],
    reviews: [
      { user: 'Evelyn P.', rating: 5, comment: 'Big size and yolk is very rich.', date: '2026-07-06' }
    ],
    rating: 5.0,
    versions: [
      { version: 1, updatedAt: '2026-06-01T08:00:00Z', updatedBy: 'admin', price: 4.99, stock: 80, changeNotes: 'Initial entry' }
    ],
    expiryDate: '2026-07-25',
    isApproved: true
  },
  {
    id: 'prod-laptop',
    name: 'AeroPro Elite Thin Notebook 14"',
    category: 'Electronics',
    description: 'Ultra-thin sleek productivity powerhouse with M3 core equivalent processor, 16GB RAM, and 512GB SSD.',
    price: 999.00,
    cost: 650.00,
    stock: 8,
    minStockLevel: 5,
    maxStockLevel: 30,
    images: [
      'https://images.unsplash.com/photo-1496181130204-755241544e3f?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600'
    ],
    barcode: '4901301213233',
    qrCode: 'QR_AEROPRO_ELITE_LAPTOP',
    specifications: {
      'Screen Size': '14.1 inches IPS',
      'Processor': '8-Core UltraChip v3',
      'RAM': '16GB LPDDR5',
      'Storage': '512GB NVMe SSD',
      'OS': 'RetailMind OS Core v12'
    },
    offers: ['No Cost EMI for 6 months', 'Free Elite Carry Case'],
    reviews: [
      { user: 'TechExpert', rating: 4, comment: 'Phenomenal build, keyboard is comfortable. Battery lasts 12 hours.', date: '2026-06-20' }
    ],
    rating: 4.0,
    versions: [
      { version: 1, updatedAt: '2026-05-15T09:00:00Z', updatedBy: 'admin', price: 1049.00, stock: 10, changeNotes: 'Launched product' },
      { version: 2, updatedAt: '2026-06-15T12:00:00Z', updatedBy: 'admin', price: 999.00, stock: 15, changeNotes: 'Competitive discount promotion' }
    ],
    isApproved: true
  },
  {
    id: 'prod-watch',
    name: 'PulseSync Active Smartwatch',
    category: 'Electronics',
    description: 'Premium fitness tracker and smartwatch with AMOLED displays, blood oxygen tracking, and 10-day battery life.',
    price: 189.00,
    cost: 110.00,
    stock: 22,
    minStockLevel: 10,
    maxStockLevel: 50,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'
    ],
    barcode: '4901301213455',
    qrCode: 'QR_PULSESYNC_SMARTWATCH',
    specifications: {
      'Waterproof': '5 ATM Rated',
      'Battery': '10 days typical use',
      'Sensors': 'Optical Heart Rate, SpO2, Accelerometer'
    },
    offers: ['Extra Strap Included'],
    reviews: [],
    rating: 4.2,
    versions: [
      { version: 1, updatedAt: '2026-06-10T11:00:00Z', updatedBy: 'admin', price: 189.00, stock: 30, changeNotes: 'Initial Stocking' }
    ],
    isApproved: true
  },
  {
    id: 'prod-tshirt',
    name: 'Minimalist Premium Cotton Tee',
    category: 'Fashion',
    description: '100% heavy organic combed cotton regular fit crew neck t-shirt. Pre-shrunk and double-stitched.',
    price: 29.99,
    cost: 12.00,
    stock: 85,
    minStockLevel: 15,
    maxStockLevel: 200,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600'
    ],
    barcode: '7101239084912',
    qrCode: 'QR_MINIMALIST_COTTON_TEE',
    specifications: {
      'Material': '100% Combed Cotton',
      'GSM': '240 GSM heavy fabric',
      'Origin': 'Made in Portugal'
    },
    offers: ['Buy 3 for $75 Special Deal'],
    reviews: [
      { user: 'Clara S.', rating: 5, comment: 'Super comfy fabric, holds up well in the wash.', date: '2026-07-02' }
    ],
    rating: 4.8,
    versions: [
      { version: 1, updatedAt: '2026-06-01T08:00:00Z', updatedBy: 'admin', price: 29.99, stock: 100, changeNotes: 'Initial rollout' }
    ],
    isApproved: true
  },
  {
    id: 'prod-apples',
    name: 'Crisp Honeycrisp Apples (1kg)',
    category: 'Groceries',
    description: 'Extra sweet, extra juicy, handpicked local orchard Honeycrisp apples. Perfectly crunchy.',
    price: 5.49,
    cost: 2.50,
    stock: 9, // Low stock alert
    minStockLevel: 25,
    maxStockLevel: 120,
    images: [
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=600'
    ],
    barcode: '8801092305017',
    qrCode: 'QR_HONEYCRISP_APPLES_1KG',
    specifications: {
      'Weight': '1.0 kg approx',
      'Source': 'Northwest Orchards',
      'Freshness': 'Delivered daily'
    },
    offers: [],
    reviews: [
      { user: 'Arthur P.', rating: 5, comment: 'Incredibly sweet and crisp. Will buy weekly!', date: '2026-07-08' }
    ],
    rating: 4.9,
    versions: [
      { version: 1, updatedAt: '2026-07-01T08:00:00Z', updatedBy: 'manager-1', price: 5.49, stock: 40, changeNotes: 'Restocked fresh crop' }
    ],
    expiryDate: '2026-07-18',
    isApproved: true
  },
  {
    id: 'prod-detergent',
    name: 'EcoMax Bio Liquid Detergent 2L',
    category: 'Household',
    description: 'Biodegradable plant-based ultra-concentrated laundry liquid. Hypoallergenic and highly effective.',
    price: 14.50,
    cost: 6.80,
    stock: 32,
    minStockLevel: 10,
    maxStockLevel: 80,
    images: [
      'https://images.unsplash.com/photo-1610557892470-76d74cd120a8?auto=format&fit=crop&q=80&w=600'
    ],
    barcode: '4901301213905',
    qrCode: 'QR_ECOMAX_DETERGENT_2L',
    specifications: {
      'Volume': '2.0 Litres',
      'Loads': '50 standard loads',
      'Scent': 'Lavender Breeze'
    },
    offers: ['Save $2.00 on subscription'],
    reviews: [],
    rating: 4.1,
    versions: [
      { version: 1, updatedAt: '2026-06-01T08:00:00Z', updatedBy: 'admin', price: 14.50, stock: 50, changeNotes: 'Standard stocking' }
    ],
    isApproved: true
  },
  {
    id: 'prod-bread',
    name: 'Artisan Sourdough Boule',
    category: 'Groceries',
    description: 'Hand-shaped, slow-fermented, stone-baked bakery fresh sourdough bread with a blistered crust.',
    price: 4.29,
    cost: 1.50,
    stock: 5, // Low stock!
    minStockLevel: 15,
    maxStockLevel: 50,
    images: [
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=600'
    ],
    barcode: '8801092305088',
    qrCode: 'QR_SOURDOUGH_ARTISAN',
    specifications: {
      'Weight': '500g',
      'Allergens': 'Gluten / Wheat',
      'Shelf Life': '3 Days'
    },
    offers: ['Get 50% Off at 8:00 PM for Bakery clearance!'],
    reviews: [],
    rating: 4.7,
    versions: [
      { version: 1, updatedAt: '2026-07-08T06:00:00Z', updatedBy: 'manager-1', price: 4.29, stock: 30, changeNotes: 'Daily fresh bakery log' }
    ],
    expiryDate: '2026-07-12',
    isApproved: true
  },
  {
    id: 'prod-pending-juice',
    name: 'SuperFoods Organic Pomegranate Juice',
    category: 'Groceries',
    description: '100% pure cold-pressed pomegranate juice. Sugar-free and antioxidant rich.',
    price: 6.99,
    cost: 3.50,
    stock: 0,
    minStockLevel: 20,
    maxStockLevel: 120,
    images: [
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600'
    ],
    barcode: '8801092305100',
    qrCode: 'QR_POMEGRANATE_JUICE_RAW',
    specifications: {
      'Volume': '750ml',
      'Process': 'Cold-Pressed, HPP Pasteurized'
    },
    offers: [],
    reviews: [],
    rating: 0,
    versions: [
      { version: 1, updatedAt: '2026-07-09T14:00:00Z', updatedBy: 'manager-1', price: 6.99, stock: 0, changeNotes: 'New Request submission' }
    ],
    isApproved: false // PENDING APPROVAL FOR THE INTERVIEWER WORKFLOW
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    username: 'ceo_admin',
    email: 'vvsudarsan.16@gmail.com',
    role: 'admin',
    status: 'active',
    loyaltyPoints: 1200,
    membership: 'Gold',
    walletBalance: 2500.00,
    addresses: ['101 Executive Tower, Tech City, TC 90210'],
    paymentMethods: ['Visa **** 9102', 'UPI (ceo@retailmind)']
  },
  {
    id: 'user-manager',
    username: 'alice_manager',
    email: 'alice.manager@retailmind.io',
    role: 'manager',
    status: 'active',
    loyaltyPoints: 340,
    membership: 'Silver',
    walletBalance: 150.00,
    addresses: ['45 Sector B, Warehouse Dist, TC 90211'],
    paymentMethods: ['Debit **** 5512']
  },
  {
    id: 'user-cashier',
    username: 'john_cashier',
    email: 'john.cashier@retailmind.io',
    role: 'cashier',
    status: 'active',
    loyaltyPoints: 80,
    membership: 'Bronze',
    walletBalance: 50.00,
    addresses: ['Apartment 3C, Oak Street, TC 90214'],
    paymentMethods: ['Cash']
  },
  {
    id: 'user-customer',
    username: 'johndoe',
    email: 'johndoe@gmail.com',
    role: 'customer',
    status: 'active',
    loyaltyPoints: 450,
    membership: 'Silver',
    walletBalance: 125.50,
    addresses: ['782 Maple Lane, Suburbia, TC 90220', 'Google Plex Annex, Mountain View, CA 94043'],
    paymentMethods: ['Visa **** 4492', 'Apple Pay', 'UPI (johndoe@okaxis)']
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    userId: 'user-manager',
    name: 'Alice Henderson',
    role: 'Floor & Warehouse Manager',
    branch: 'Downtown HQ Superstore',
    attendanceStatus: 'present',
    attendanceRate: 98.4,
    performanceScore: 4.8,
    salary: 6200,
    joinedDate: '2025-01-10'
  },
  {
    id: 'emp-2',
    userId: 'user-cashier',
    name: 'John Miller',
    role: 'Lead Checkout Specialist',
    branch: 'Downtown HQ Superstore',
    attendanceStatus: 'present',
    attendanceRate: 95.2,
    performanceScore: 4.4,
    salary: 3200,
    joinedDate: '2025-03-15'
  },
  {
    id: 'emp-3',
    userId: 'user-cashier-2',
    name: 'Sarah Jenkins',
    role: 'Junior Cashier',
    branch: 'Westside Outlet Branch',
    attendanceStatus: 'present',
    attendanceRate: 92.0,
    performanceScore: 4.1,
    salary: 2800,
    joinedDate: '2025-06-01'
  }
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-downtown',
    name: 'Downtown HQ Superstore',
    location: '101 Broadway Ave, City Center',
    revenue: 412500.00,
    profit: 144375.00,
    stockCount: 8450,
    employeeCount: 12
  },
  {
    id: 'branch-westside',
    name: 'Westside Express Outlet',
    location: '5540 Westside Blvd, Shopping Square',
    revenue: 185200.00,
    profit: 55560.00,
    stockCount: 3120,
    employeeCount: 5
  },
  {
    id: 'branch-northside',
    name: 'Northside Warehouse Depot',
    location: 'Warehouse District, Block D',
    revenue: 95000.00,
    profit: 19000.00,
    stockCount: 22000,
    employeeCount: 3
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supplier-freshfarm',
    name: 'FreshFarm Agricultural Co.',
    contact: 'supplier.farm@organic.com',
    category: 'Groceries',
    rating: 4.7,
    reliability: 98.0
  },
  {
    id: 'supplier-electra',
    name: 'ElectraTech Global Logistics',
    contact: 'sales@electratech.com',
    category: 'Electronics',
    rating: 4.3,
    reliability: 91.5
  },
  {
    id: 'supplier-dailygoods',
    name: 'DailyGoods Wholesale Inc.',
    contact: 'logistics@dailygoodswholesale.com',
    category: 'Household & General',
    rating: 4.1,
    reliability: 94.0
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-001',
    supplierId: 'supplier-freshfarm',
    supplierName: 'FreshFarm Agricultural Co.',
    items: [
      { productName: 'Farm Fresh Organic Milk 1L', quantity: 200, cost: 1.80 },
      { productName: 'Cage-Free Brown Eggs (12pk)', quantity: 150, cost: 2.20 }
    ],
    total: 690.00,
    status: 'delivered',
    expectedDelivery: '2026-07-01',
    createdAt: '2026-06-28'
  },
  {
    id: 'po-002',
    supplierId: 'supplier-electra',
    supplierName: 'ElectraTech Global Logistics',
    items: [
      { productName: 'PulseSync Active Smartwatch', quantity: 20, cost: 110.00 }
    ],
    total: 2200.00,
    status: 'shipped',
    expectedDelivery: '2026-07-15',
    createdAt: '2026-07-08'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    timestamp: '2026-07-10T09:12:00Z',
    userId: 'user-admin',
    username: 'ceo_admin',
    role: 'admin',
    action: 'PRICE_UPDATE',
    details: 'Adjusted Milk price from 3.29 to 3.49 for inflation',
    ip: '192.168.1.100',
    device: 'MacBook Pro 16"',
    browser: 'Chrome 125.0',
    location: 'CEO Office, Downtown HQ'
  },
  {
    id: 'audit-2',
    timestamp: '2026-07-10T11:22:00Z',
    userId: 'user-manager',
    username: 'alice_manager',
    role: 'manager',
    action: 'STOCK_TRANSFER',
    details: 'Transferred 30 units of Cotton Tee from Depot to DowntownHQ',
    ip: '192.168.1.102',
    device: 'iPad Pro 12"',
    browser: 'Safari Mobile',
    location: 'Warehouse Gate A'
  },
  {
    id: 'audit-3',
    timestamp: '2026-07-10T14:45:00Z',
    userId: 'user-cashier',
    username: 'john_cashier',
    role: 'cashier',
    action: 'POS_CHECKOUT',
    details: 'Processed Invoice #TX-29381. Cash Total: $45.20',
    ip: '192.168.1.150',
    device: 'POS Terminal Touch-7',
    browser: 'RetailMind POS Shell Chromium',
    location: 'Counter 01, Downtown HQ'
  }
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'chat-1',
    senderId: 'user-cashier',
    senderName: 'John Miller',
    senderRole: 'cashier',
    text: 'Hey Alice, we are running super low on Milk at Counter 01. Do we have more cases in the back cold room?',
    timestamp: '2026-07-10T15:00:00Z',
    targetRole: 'manager'
  },
  {
    id: 'chat-2',
    senderId: 'user-manager',
    senderName: 'Alice Henderson',
    senderRole: 'manager',
    text: 'On it, John! Just approved a restocking request. Bob is loading 3 cases into the aisle display right now.',
    timestamp: '2026-07-10T15:05:00Z',
    targetRole: 'all'
  },
  {
    id: 'chat-3',
    senderId: 'user-admin',
    senderName: 'CEO Admin',
    senderRole: 'admin',
    text: 'Excellent response time team. Remeber to log all stock shifts in the Warehouse module to sync with live demand charts.',
    timestamp: '2026-07-10T15:15:00Z',
    targetRole: 'all'
  }
];

export const INITIAL_NOTIFICATIONS: StoreNotification[] = [
  {
    id: 'notif-1',
    title: 'Low Stock Alert',
    message: 'Farm Fresh Organic Milk 1L is below minimum threshold (14 units remaining).',
    type: 'warning',
    createdAt: '2026-07-10T08:00:00Z',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Product Approval Request',
    message: 'Floor Manager submitted "SuperFoods Organic Pomegranate Juice" for verification.',
    type: 'info',
    createdAt: '2026-07-10T14:10:00Z',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Fraud Alert!',
    message: 'AI Flagged high refund rate customer user: johndoe (2 refund requests in last 4 days). Details in Fraud panel.',
    type: 'danger',
    createdAt: '2026-07-10T17:30:00Z',
    read: false
  }
];
