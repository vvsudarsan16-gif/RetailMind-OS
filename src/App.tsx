/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, ShieldAlert, Cpu, Bell, MessageSquare, LayoutGrid, 
  HelpCircle, Sparkles, Check, AlertTriangle, ChevronRight, Menu, RefreshCw, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, User, Employee, Branch, Order, AuditLog, ChatMessage, StoreNotification, PurchaseOrder, Supplier } from './types';

// Import Modular Role Subcomponents
import DigitalTwin from './components/DigitalTwin';
import ChatWindow from './components/ChatWindow';
import CustomerModule from './components/CustomerModule';
import CashierModule from './components/CashierModule';
import ManagerModule from './components/ManagerModule';
import AdminModule from './components/AdminModule';
import LoginModule from './components/LoginModule';

// Import Mock Database Fallbacks
import {
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_BRANCHES,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CHAT,
  INITIAL_NOTIFICATIONS
} from './data';

// Local simulated orders
const INITIAL_ORDERS: Order[] = [
  {
    id: 'TX-29381',
    type: 'offline',
    customerId: 'user-customer',
    customerName: 'John Doe',
    branchId: 'branch-downtown',
    items: [
      { productId: 'prod-milk', name: 'Farm Fresh Organic Milk 1L', price: 3.49, quantity: 2 },
      { productId: 'prod-eggs', name: 'Cage-Free Brown Eggs (12pk)', price: 4.99, quantity: 1 }
    ],
    subtotal: 11.97,
    discount: 0,
    tax: 0.96,
    total: 12.93,
    paymentMethod: 'UPI (johndoe@okaxis)',
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'TX-29382',
    type: 'online',
    customerId: 'user-customer',
    customerName: 'John Doe',
    branchId: 'branch-downtown',
    items: [
      { productId: 'prod-laptop', name: 'AeroPro Elite Thin Notebook 14"', price: 999.00, quantity: 1 }
    ],
    subtotal: 999.00,
    discount: 50.00,
    tax: 75.92,
    total: 1024.92,
    couponCode: 'SAVE50',
    paymentMethod: 'split',
    splitDetails: [
      { method: 'UPI', amount: 500 },
      { method: 'Card', amount: 524.92 }
    ],
    status: 'processing',
    address: '782 Maple Lane, Suburbia, TC 90220',
    giftWrap: true,
    deliverySlot: 'Tomorrow 2:00 PM - 5:00 PM',
    trackingStep: 1,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Active Role Simulated session
  const [activeRole, setActiveRole] = useState<'admin' | 'manager' | 'cashier' | 'customer'>('admin');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('user-customer');
  
  // Database States
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<StoreNotification[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // UI state
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  // Synchronize state from the full-stack server
  const syncState = async () => {
    try {
      const [
        resProducts, resUsers, resEmployees, resBranches, 
        resOrders, resLogs, resChats, resNotifs, resPOs, resSuppliers
      ] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/users').then(r => r.json()),
        fetch('/api/employees').then(r => r.json()),
        fetch('/api/branches').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/audit-logs').then(r => r.json()),
        fetch('/api/chats').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json()),
        fetch('/api/purchase-orders').then(r => r.json()),
        fetch('/api/suppliers').then(r => r.json())
      ]);

      setProducts(resProducts);
      setUsers(resUsers);
      setEmployees(resEmployees);
      setBranches(resBranches);
      setOrders(resOrders);
      setAuditLogs(resLogs);
      setChats(resChats);
      setNotifications(resNotifs);
      setPurchaseOrders(resPOs);
      setSuppliers(resSuppliers);
      setIsRecoveryMode(false);
    } catch (e) {
      console.error('Connection to full-stack server timed out. Initializing local database recovery mode...');
      setIsRecoveryMode(true);
      // Initialize with local static data so the app stays functional even if the full-stack server is offline or restarting
      setProducts(prev => prev.length === 0 ? INITIAL_PRODUCTS : prev);
      setUsers(prev => prev.length === 0 ? INITIAL_USERS : prev);
      setEmployees(prev => prev.length === 0 ? INITIAL_EMPLOYEES : prev);
      setBranches(prev => prev.length === 0 ? INITIAL_BRANCHES : prev);
      setOrders(prev => prev.length === 0 ? INITIAL_ORDERS : prev);
      setAuditLogs(prev => prev.length === 0 ? INITIAL_AUDIT_LOGS : prev);
      setChats(prev => prev.length === 0 ? INITIAL_CHAT : prev);
      setNotifications(prev => prev.length === 0 ? INITIAL_NOTIFICATIONS : prev);
      setPurchaseOrders(prev => prev.length === 0 ? INITIAL_PURCHASE_ORDERS : prev);
      setSuppliers(prev => prev.length === 0 ? INITIAL_SUPPLIERS : prev);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncState();
    // Auto-sync status every 5 seconds to support real collaborative interactions!
    const interval = setInterval(syncState, 5000);
    return () => clearInterval(interval);
  }, []);

  // Post new action handlers
  const handleCheckoutPOS = async (orderData: Partial<Order>) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        const createdOrder = await res.json();
        await syncState();
        return createdOrder;
      } else {
        const errData = await res.json().catch(() => ({}));
        const serverErrorMsg = errData.error || `Server rejected order with status ${res.status}`;
        throw { isValidationError: true, message: serverErrorMsg };
      }
    } catch (err: any) {
      if (err?.isValidationError) {
        throw new Error(err.message);
      }
      console.error('Error placing checkout. Executing local checkout fallback...');
      const subtotal = (orderData.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.08;
      const total = Math.max(0, subtotal + tax - (orderData.discount || 0));
      const newOrder: Order = {
        id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
        type: orderData.type || 'online',
        customerId: orderData.customerId || 'user-customer',
        customerName: orderData.customerName || 'Walk-in Customer',
        branchId: orderData.branchId || 'branch-downtown',
        items: orderData.items || [],
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat((orderData.discount || 0).toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        couponCode: orderData.couponCode,
        paymentMethod: orderData.paymentMethod || 'UPI',
        splitDetails: orderData.splitDetails,
        status: orderData.type === 'offline' ? 'completed' : 'pending',
        address: orderData.address,
        giftWrap: orderData.giftWrap,
        deliverySlot: orderData.deliverySlot,
        trackingStep: orderData.type === 'offline' ? 3 : 0,
        createdAt: new Date().toISOString()
      };
      setOrders(prev => [...prev, newOrder]);
      // Update inventory locally
      setProducts(prev => prev.map(p => {
        const orderItem = (orderData.items || []).find(item => item.productId === p.id);
        if (orderItem) {
          return { ...p, stock: Math.max(0, p.stock - orderItem.quantity) };
        }
        return p;
      }));
      // Update loyalty points/wallet locally
      if (orderData.customerId) {
        setUsers(prev => prev.map(u => {
          if (u.id === orderData.customerId) {
            let nextWallet = u.walletBalance;
            if (orderData.paymentMethod === 'Wallet') {
              nextWallet = Math.max(0, parseFloat((u.walletBalance - total).toFixed(2)));
            }
            return {
              ...u,
              loyaltyPoints: u.loyaltyPoints + Math.floor(total * 0.1),
              walletBalance: nextWallet
            };
          }
          return u;
        }));
      }
      // Log local audit and notification
      const localLog: AuditLog = {
        id: `audit-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp: new Date().toISOString(),
        userId: orderData.customerId || 'cashier',
        username: orderData.customerName || 'Walk-in Customer',
        role: orderData.type === 'offline' ? 'cashier' : 'customer',
        action: 'ORDER_CREATED',
        details: `[LOCAL FALLBACK] Placed ${newOrder.type} order ${newOrder.id} total: $${newOrder.total}`,
        ip: '127.0.0.1',
        device: 'Local client fallback',
        browser: 'Local sandbox',
        location: 'Main Branch Gateway'
      };
      setAuditLogs(prev => [localLog, ...prev]);

      const localNotif: StoreNotification = {
        id: `notif-${Math.floor(10000 + Math.random() * 90000)}`,
        title: '[Local] New Order Received',
        message: `${newOrder.customerName} placed order ${newOrder.id} ($${newOrder.total})`,
        type: 'success',
        createdAt: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [localNotif, ...prev]);
      return newOrder;
    }
  };

  const handleRefund = async (orderId: string, action: 'refund' | 'exchange') => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'refund' ? 'returned' : 'completed' })
      });
      if (res.ok) {
        alert(`Successfully processed POS ${action.toUpperCase()} for order ID: ${orderId}. Stock inventory has updated.`);
        await syncState();
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.error('Error processing refund. Executing local refund fallback...');
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          const nextStatus = action === 'refund' ? 'returned' : 'completed';
          // Return items to stock locally
          if (nextStatus === 'returned') {
            setProducts(prods => prods.map(p => {
              const orderItem = o.items.find(item => item.productId === p.id);
              if (orderItem) {
                return { ...p, stock: p.stock + orderItem.quantity };
              }
              return p;
            }));
          }
          return { ...o, status: nextStatus };
        }
        return o;
      }));
      alert(`Successfully processed POS ${action.toUpperCase()} for order ID: ${orderId} [LOCAL RECOVERY MODE]. Stock inventory has updated.`);
    }
  };

  const handleApproveProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true })
      });
      if (res.ok) {
        await syncState();
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.error('Error approving product. Executing local fallback...');
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isApproved: true } : p));
    }
  };

  const handleModifyUser = async (id: string, data: Partial<User>) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await syncState();
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.error('Error modifying user profile. Executing local fallback...');
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await syncState();
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.error('Error deleting product. Executing local fallback...');
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAddStock = async (id: string, qty: number) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: prod.stock + qty, changeNotes: `Replenished stock by ${qty} units` })
      });
      if (res.ok) {
        await syncState();
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.error('Error updating stock level. Executing local fallback...');
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: p.stock + qty } : p));
    }
  };

  const handlePlacePO = async (poData: Partial<PurchaseOrder>) => {
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poData)
      });
      if (res.ok) {
        await syncState();
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.error('Error submitting purchase order. Executing local fallback...');
      const newPO: PurchaseOrder = {
        id: `po-${Math.floor(100 + Math.random() * 900)}`,
        supplierId: poData.supplierId || 'supplier-freshfarm',
        supplierName: poData.supplierName || 'FreshFarm Agricultural Co.',
        items: poData.items || [],
        total: poData.total || 0,
        status: 'pending',
        expectedDelivery: poData.expectedDelivery || new Date(Date.now() + 3600000 * 24 * 5).toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0]
      };
      setPurchaseOrders(prev => [...prev, newPO]);
    }
  };

  const handleVerifyPO = async (id: string, status: 'shipped' | 'delivered') => {
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await syncState();
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.error('Error updating purchase order status. Executing local fallback...');
      setPurchaseOrders(prev => prev.map(po => {
        if (po.id === id) {
          const oldStatus = po.status;
          // If delivered, automatically replenish stock levels locally!
          if (status === 'delivered' && oldStatus !== 'delivered') {
            po.items.forEach((poItem: any) => {
              setProducts(prods => prods.map(prod => {
                if (prod.name === poItem.productName || prod.id === poItem.productId) {
                  return { ...prod, stock: prod.stock + poItem.quantity };
                }
                return prod;
              }));
            });
            const localNotif: StoreNotification = {
              id: `notif-${Math.floor(10000 + Math.random() * 90000)}`,
              title: '[Local] Purchase Order Received',
              message: `Inventory for PO ${id} has been fully replenished.`,
              type: 'success',
              createdAt: new Date().toISOString(),
              read: false
            };
            setNotifications(notifs => [localNotif, ...notifs]);
          }
          return { ...po, status };
        }
        return po;
      }));
    }
  };

  const handleSubmitNewProductRequest = async (pData: any) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pData, isApproved: false })
      });
      if (res.ok) {
        await syncState();
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.error('Error submitting product request. Executing local fallback...');
      const newProduct: Product = {
        id: `prod-${Math.random().toString(36).substr(2, 9)}`,
        name: pData.name,
        category: pData.category,
        description: pData.description || '',
        price: parseFloat(pData.price) || 0,
        cost: parseFloat(pData.cost) || (parseFloat(pData.price) * 0.6),
        stock: parseInt(pData.stock) || 0,
        minStockLevel: parseInt(pData.minStockLevel) || 10,
        maxStockLevel: parseInt(pData.maxStockLevel) || 100,
        images: pData.images && pData.images.length ? pData.images : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'],
        barcode: pData.barcode || Math.floor(1000000000000 + Math.random() * 9000000000000).toString(),
        qrCode: `QR_${pData.name.toUpperCase().replace(/\s+/g, '_')}`,
        specifications: pData.specifications || {},
        offers: pData.offers || [],
        reviews: [],
        rating: 0,
        versions: [{
          version: 1,
          updatedAt: new Date().toISOString(),
          updatedBy: pData.createdBy || 'manager',
          price: parseFloat(pData.price) || 0,
          stock: parseInt(pData.stock) || 0,
          changeNotes: 'Initial Entry Request'
        }],
        expiryDate: pData.expiryDate || undefined,
        isApproved: false
      };
      setProducts(prev => [...prev, newProduct]);
    }
  };

  const handleSendMessage = async (text: string, targetRole: 'all' | 'admin' | 'manager' | 'cashier') => {
    const activeUser = users.find(u => u.role === activeRole) || users[0];
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: activeUser?.id,
          senderName: activeUser?.username,
          senderRole: activeRole,
          text,
          targetRole
        })
      });
      if (res.ok) {
        await syncState();
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.error('Error dispatching message. Executing local fallback...');
      const newChat: ChatMessage = {
        id: `chat-${Math.random().toString(36).substr(2, 9)}`,
        senderId: activeUser?.id || 'user-customer',
        senderName: activeUser?.username || 'Anonymous',
        senderRole: activeRole,
        text,
        timestamp: new Date().toISOString(),
        targetRole: targetRole || 'all'
      };
      setChats(prev => [...prev, newChat]);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await fetch('/api/notifications/mark-all-read', { method: 'PUT' });
      if (res.ok) {
        await syncState();
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      console.error('Error clearing notifications. Executing local fallback...');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  // Session user profile reference
  const currentSessionUser = activeRole === 'customer'
    ? (users.find(u => u.id === selectedCustomerId) || users.find(u => u.role === 'customer') || users[0] || {
        id: 'user-guest',
        username: 'Guest User',
        email: 'guest@retailmind.io',
        role: 'customer',
        status: 'active',
        loyaltyPoints: 0,
        membership: 'Bronze',
        walletBalance: 0,
        addresses: ['Default Address Suite 101'],
        paymentMethods: ['Cash']
      })
    : (users.find(u => u.role === activeRole) || {
        id: 'user-guest',
        username: 'Guest User',
        email: 'guest@retailmind.io',
        role: activeRole,
        status: 'active',
        loyaltyPoints: 0,
        membership: 'Bronze',
        walletBalance: 0,
        addresses: ['Default Address Suite 101'],
        paymentMethods: ['Cash']
      });

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  if (!isLoggedIn) {
    return (
      <LoginModule 
        users={users} 
        onLogin={(role, userId) => {
          setActiveRole(role);
          if (role === 'customer') {
            setSelectedCustomerId(userId);
          }
          setIsLoggedIn(true);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col antialiased">
      {/* Main Container Core */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-32 space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <h2 className="font-extrabold text-slate-700 tracking-tight text-sm">Synchronizing RetailMind Core Ratios...</h2>
          <p className="text-xs text-slate-400">Restoring in-memory transactional database logs</p>
        </div>
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
          {/* Header Dashboard context notification widgets */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-[#DBEAFE] text-[#1E40AF] rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-[#0F172A] tracking-tight uppercase flex items-center gap-2">
                  <span>
                    {activeRole === 'admin' && 'Enterprise CEO ERP Control Room'}
                    {activeRole === 'manager' && 'Operations & Stock logistics Command'}
                    {activeRole === 'cashier' && 'Supermarket Checkout Terminal'}
                    {activeRole === 'customer' && 'Smart Shopper Experience portal'}
                  </span>
                  {isRecoveryMode && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertTriangle className="w-2.5 h-2.5 animate-pulse text-amber-500" />
                      LOCAL RECOVERY
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeRole === 'admin' && 'Control branches, approve listings, monitor security logs, and run simulated forecasts.'}
                  {activeRole === 'manager' && 'Restock shelves, review suppliers tracking list, and issue purchase orders.'}
                  {activeRole === 'cashier' && 'Process walk-in checkouts, handle digital payments, return inventory logs, and sync offline.'}
                  {activeRole === 'customer' && 'Order items, schedule priority delivery slots, pay with UPI or card, and talk to personal assistant.'}
                </p>
              </div>
            </div>

            {/* Notification and Chat triggers */}
            <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
              {/* Authenticated Role Profile */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg">
                <div className="w-6 h-6 rounded-full bg-[#3B82F6] flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                  {currentSessionUser?.username?.substring(0, 2) || 'US'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[11px] font-bold text-slate-800 leading-none">{currentSessionUser?.username}</p>
                  <p className="text-[9px] text-slate-400 font-mono capitalize leading-none mt-0.5">{activeRole}</p>
                </div>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="ml-1 p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded border border-rose-100 transition-colors cursor-pointer"
                  title="Logout Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 bg-[#F1F5F9] hover:bg-slate-200 border border-[#E2E8F0] rounded-lg transition-all duration-150 relative cursor-pointer"
                  title="Alerter Center"
                >
                  <Bell className="w-4 h-4 text-[#64748B]" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-extrabold text-[8px] h-4 w-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Drawer */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2.5 w-80 bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xl z-50 text-xs space-y-3.5"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="font-bold text-slate-800">Operational Alerts</span>
                        {unreadNotifsCount > 0 && (
                          <button 
                            onClick={markAllNotificationsRead}
                            className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                          <p className="text-slate-400 text-center py-8">Clean health slate. No active alerts.</p>
                        ) : (
                          notifications.map(notif => (
                            <div key={notif.id} className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                              notif.type === 'danger' ? 'bg-rose-50/45 border-rose-100' :
                              notif.type === 'warning' ? 'bg-amber-50/45 border-amber-100' : 'bg-slate-50/45 border-slate-100'
                            }`}>
                              <span className="mt-0.5">
                                {notif.type === 'danger' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                                {notif.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                                {notif.type === 'success' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                {notif.type === 'info' && <Bell className="w-3.5 h-3.5 text-indigo-600" />}
                              </span>
                              <div className="space-y-0.5">
                                <h4 className="font-bold text-slate-800 text-[11px] leading-tight">{notif.title}</h4>
                                <p className="text-[10px] text-slate-400 leading-tight">{notif.message}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

               {/* Chat Drawer toggle */}
              <button
                onClick={() => setShowChatDrawer(!showChatDrawer)}
                className="p-2.5 bg-[#F1F5F9] hover:bg-slate-200 border border-[#E2E8F0] rounded-lg transition-all duration-150 relative flex items-center gap-1.5 text-[#64748B] font-semibold cursor-pointer"
                title="Internal Chat Link"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-[10px] font-bold">Team Chat</span>
              </button>
            </div>
          </div>

          {/* Active component switch */}
          <div className="space-y-6">
            {activeRole === 'admin' && (
              <AdminModule 
                products={products}
                users={users}
                employees={employees}
                branches={branches}
                orders={orders}
                auditLogs={auditLogs}
                onApproveProduct={handleApproveProduct}
                onModifyUser={handleModifyUser}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeRole === 'manager' && (
              <ManagerModule 
                products={products}
                suppliers={suppliers}
                purchaseOrders={purchaseOrders}
                onAddStock={handleAddStock}
                onUpdateProduct={handleApproveProduct}
                onPlacePO={handlePlacePO}
                onVerifyPO={handleVerifyPO}
                onSubmitNewProductRequest={handleSubmitNewProductRequest}
              />
            )}

            {activeRole === 'cashier' && (
              <CashierModule 
                products={products}
                users={users}
                orders={orders}
                onCheckout={handleCheckoutPOS}
                onRefund={handleRefund}
                offlineMode={offlineMode}
                onToggleOffline={() => setOfflineMode(!offlineMode)}
              />
            )}

            {activeRole === 'customer' && (
              <CustomerModule 
                products={products}
                myOrders={orders.filter(o => o.customerId === selectedCustomerId)}
                users={users}
                currentUser={currentSessionUser as any}
                onPlaceOrder={handleCheckoutPOS}
                onModifyUser={handleModifyUser}
                onSwitchUser={() => {
                  // Cycle to next available customer or open modal
                  const customerUsers = users.filter(u => u.role === 'customer');
                  const currentIdx = customerUsers.findIndex(u => u.id === selectedCustomerId);
                  const nextIdx = (currentIdx + 1) % customerUsers.length;
                  if (customerUsers[nextIdx]) {
                    setSelectedCustomerId(customerUsers[nextIdx].id);
                  }
                }}
                syncState={syncState}
              />
            )}

            {/* Display store layout digital twin for all roles underneath to show holistic integration! */}
            <div className="pt-4 border-t border-slate-200">
              <DigitalTwin 
                products={products}
                onSelectProduct={(p) => {
                  if (activeRole === 'customer') {
                    // Triggers customer page click!
                    alert(`Interlinked Event: Product ${p.name} loaded into personal shopping details panel below.`);
                  } else {
                    alert(`Digital Twin: Selected ${p.name}. Stock: ${p.stock}. Specifications: ${JSON.stringify(p.specifications)}`);
                  }
                }}
                onRestock={handleAddStock}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Team Chat side-pane widget */}
      <AnimatePresence>
        {showChatDrawer && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">Operations Chat Drawer</span>
                <button onClick={() => setShowChatDrawer(false)} className="text-slate-400 font-bold font-mono text-sm">×</button>
              </div>
              <div className="flex-1 p-4 overflow-hidden">
                <ChatWindow 
                  chats={chats}
                  currentUserId={currentSessionUser.id}
                  currentUsername={currentSessionUser.username}
                  currentUserRole={activeRole}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
