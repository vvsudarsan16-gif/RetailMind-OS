/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Order, User } from '../types';
import { 
  Calculator, Search, Wifi, WifiOff, Users, ArrowRight, ShieldAlert,
  Printer, DollarSign, RefreshCw, LogOut, Check, ShoppingCart, Tag, Clock, UserCheck, Trash2
} from 'lucide-react';

interface CashierModuleProps {
  products: Product[];
  users: User[];
  orders: Order[];
  onCheckout: (orderData: Partial<Order>) => void;
  onRefund: (orderId: string, action: 'refund' | 'exchange') => void;
  offlineMode: boolean;
  onToggleOffline: () => void;
}

export default function CashierModule({ 
  products, users, orders, onCheckout, onRefund, offlineMode, onToggleOffline 
}: CashierModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [posCart, setPosCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(users.find(u => u.role === 'customer') || null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'split'>('cash');
  const [splitCash, setSplitCash] = useState(0);
  const [splitCard, setSplitCard] = useState(0);
  const [offlineBills, setOfflineBills] = useState<any[]>([]);

  // Shift logs
  const [shiftActive, setShiftActive] = useState(true);
  const [shiftStartCash, setShiftStartCash] = useState(250.00);
  const [refundOrderId, setRefundOrderId] = useState('');

  // Search filter
  const approvedProducts = products.filter(p => p.isApproved);
  const searchResults = approvedProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.barcode.includes(searchQuery)
  );

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    const existingIndex = posCart.findIndex(item => item.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...posCart];
      if (updated[existingIndex].quantity < product.stock) {
        updated[existingIndex].quantity += 1;
        setPosCart(updated);
      }
    } else {
      setPosCart([...posCart, { product, quantity: 1 }]);
    }
  };

  const updateQty = (id: string, qty: number) => {
    const existingIndex = posCart.findIndex(item => item.product.id === id);
    if (existingIndex === -1) return;
    const item = posCart[existingIndex];
    const newQty = item.quantity + qty;
    if (newQty <= 0) {
      setPosCart(posCart.filter(i => i.product.id !== id));
    } else if (newQty <= item.product.stock) {
      const updated = [...posCart];
      updated[existingIndex].quantity = newQty;
      setPosCart(updated);
    }
  };

  const removeCartItem = (id: string) => {
    setPosCart(posCart.filter(item => item.product.id !== id));
  };

  // Pricing calculations
  const subtotal = posCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const discountVal = couponCode.toUpperCase() === 'SAVE50' ? 50 : discountAmount;
  const total = Math.max(0, subtotal + tax - discountVal);

  const handlePOSCheckout = () => {
    if (!posCart.length) return;

    const itemsPayload = posCart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));

    const billId = `TX-${Math.floor(10000 + Math.random() * 90000)}`;

    const checkoutData: Partial<Order> = {
      id: billId,
      type: 'offline',
      customerId: selectedUser?.id || undefined,
      customerName: selectedUser?.username || 'Walk-in Customer',
      items: itemsPayload,
      discount: discountVal,
      couponCode: couponCode || undefined,
      paymentMethod,
      splitDetails: paymentMethod === 'split' ? [
        { method: 'Cash', amount: splitCash },
        { method: 'Card', amount: splitCard }
      ] : undefined,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    if (offlineMode) {
      // Offline POS continues billing seamlessly, autosync later! Connected workflows!
      setOfflineBills([...offlineBills, checkoutData]);
      alert(`OFFLINE POS ACTIVE: Invoice ${billId} saved locally in memory queue. Autorecovery is primed.`);
    } else {
      onCheckout(checkoutData);
    }

    setPosCart([]);
    setDiscountAmount(0);
    setCouponCode('');
  };

  const syncOfflineBills = () => {
    if (offlineBills.length === 0) return;
    offlineBills.forEach(bill => {
      onCheckout(bill);
    });
    alert(`Auto-Syncing Complete! Successfully pushed ${offlineBills.length} offline transactions to cloud database.`);
    setOfflineBills([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="supermarket-checkout-terminal">
      {/* Left panel: Barcode search & item selector */}
      <div className="lg:col-span-8 space-y-6">
        {/* Connection status header */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`p-2 rounded-lg flex items-center justify-center ${offlineMode ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {offlineMode ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5 animate-pulse" />}
            </span>
            <div>
              <h3 className="font-bold text-[#0F172A] text-sm tracking-tight flex items-center gap-2">
                POS Terminal #01 (Amazon Fresh Mode)
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${offlineMode ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                  {offlineMode ? 'Offline Billing Enabled' : 'Cloud Sync'}
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Automated cash reconciliation and multi-branch inventory tracking</p>
            </div>
          </div>

          <div className="flex gap-2">
            {offlineMode && offlineBills.length > 0 && (
              <button 
                onClick={syncOfflineBills}
                className="bg-[#3B82F6] hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sync Queue ({offlineBills.length})
              </button>
            )}
            <button 
              onClick={onToggleOffline}
              className={`font-semibold px-3 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                offlineMode 
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500' 
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-[#E2E8F0]'
              }`}
            >
              Toggle Offline Mode
            </button>
          </div>
        </div>

        {/* Catalog quick look */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Barcode scanner scan / enter product name or barcode (e.g. 8801092304812)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg pl-9.5 pr-4 py-2 text-xs focus:outline-none focus:border-[#3B82F6] focus:bg-white shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[200px] overflow-y-auto pr-1">
            {searchResults.map(p => {
              const isLow = p.stock <= 0;
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={isLow}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isLow 
                      ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed' 
                      : 'bg-white border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-sm active:scale-95'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 block font-mono">CODE: {p.barcode.substr(-4)}</span>
                  <h4 className="font-bold text-[#0F172A] text-xs truncate mt-0.5">{p.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-[#3B82F6] font-bold text-xs">${p.price}</span>
                    <span className={`text-[9px] font-bold ${p.stock <= p.minStockLevel ? 'text-rose-500' : 'text-slate-400'}`}>
                      Qty: {p.stock}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Refund & returns module */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
          <h3 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider mb-3">Refund & Customer Returns Exchange</h3>
          <div className="flex gap-2 text-xs">
            <input 
              type="text" 
              placeholder="Enter Invoice Transaction ID (e.g. TX-29381)..." 
              value={refundOrderId}
              onChange={(e) => setRefundOrderId(e.target.value)}
              className="flex-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#3B82F6]"
            />
            <button 
              onClick={() => { onRefund(refundOrderId, 'refund'); setRefundOrderId(''); }}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 px-3.5 py-1.5 rounded-lg font-bold cursor-pointer"
            >
              Refund Cash
            </button>
            <button 
              onClick={() => { onRefund(refundOrderId, 'exchange'); setRefundOrderId(''); }}
              className="bg-blue-50 hover:bg-blue-100 text-[#3B82F6] border border-[#BFDBFE] px-3.5 py-1.5 rounded-lg font-bold cursor-pointer"
            >
              Exchange Stock
            </button>
          </div>
        </div>
      </div>

      {/* Right side: POS Cart Billing summary */}
      <div className="lg:col-span-4 bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800 flex flex-col justify-between">
        <div>
          {/* Active Customer profile */}
          <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#DBEAFE]/10 text-blue-400 rounded-lg">
                <Users className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-[11px] text-slate-200">Customer Membership Profile</h4>
                <select
                  value={selectedUser?.id || ''}
                  onChange={(e) => setSelectedUser(users.find(u => u.id === e.target.value) || null)}
                  className="bg-transparent border-none text-xs text-white focus:outline-none p-0 cursor-pointer font-semibold"
                >
                  <option value="" className="text-slate-800">Walk-in Checkout</option>
                  {users.filter(u => u.role === 'customer').map(u => (
                    <option key={u.id} value={u.id} className="text-slate-800">
                      {u.username} (Lvl: {u.membership}, Points: {u.loyaltyPoints})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedUser && (
              <span className="bg-[#1E3A8A]/40 text-blue-300 border border-blue-800 text-[8px] font-bold uppercase px-2 py-0.5 rounded">
                {selectedUser.membership}
              </span>
            )}
          </div>

          {/* POS Cart list */}
          <div className="space-y-3.5 min-h-[160px] max-h-[220px] overflow-y-auto pr-1">
            {posCart.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No products loaded. Scan barcodes or select items on the left grid.
              </div>
            ) : (
              posCart.map(item => (
                <div key={item.product.id} className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                  <div className="min-w-0 pr-2">
                    <h5 className="font-bold text-slate-200 truncate">{item.product.name}</h5>
                    <span className="text-[10px] text-slate-500 font-mono">${item.product.price} each</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded">
                      <button onClick={() => updateQty(item.product.id, -1)} className="text-slate-400 hover:text-white font-bold font-mono cursor-pointer">-</button>
                      <span className="font-mono font-bold">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.id, 1)} className="text-slate-400 hover:text-white font-bold font-mono cursor-pointer">+</button>
                    </div>
                    <span className="font-mono font-bold text-slate-200 min-w-[45px] text-right">${(item.product.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeCartItem(item.product.id)} className="text-rose-400 hover:text-rose-300 ml-1 cursor-pointer">×</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invoice calculations and payment instruments */}
        <div className="border-t border-slate-800 pt-4 mt-4 space-y-4">
          <div className="space-y-1.5 text-xs text-slate-400 font-mono">
            <div className="flex justify-between"><span>Aisle Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax (8%):</span><span>${tax.toFixed(2)}</span></div>
            {discountVal > 0 && <div className="flex justify-between text-emerald-400"><span>Loyalty Discount:</span><span>-${discountVal.toFixed(2)}</span></div>}
            <div className="flex justify-between text-sm font-extrabold text-slate-100 border-t border-slate-800 pt-2">
              <span>Checkout Total:</span><span className="text-[#60A5FA] text-base">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method picker */}
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-slate-500 uppercase">Payment Method:</span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {['cash', 'upi', 'card', 'split'].map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method as any)}
                  className={`py-1.5 rounded-lg border font-bold capitalize transition-all cursor-pointer ${
                    paymentMethod === method 
                      ? 'bg-[#3B82F6] border-[#2563EB] text-white' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-755'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {paymentMethod === 'split' && (
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-500 block">Split Cash:</span>
                  <input 
                    type="number" 
                    value={splitCash} 
                    onChange={(e) => setSplitCash(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-0.5"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Split Card:</span>
                  <input 
                    type="number" 
                    value={splitCard} 
                    onChange={(e) => setSplitCard(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-0.5"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handlePOSCheckout}
            disabled={posCart.length === 0}
            className={`w-full font-bold py-3 rounded-lg text-center text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              posCart.length === 0 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800' 
                : 'bg-[#10B981] hover:bg-emerald-600 text-white'
            }`}
          >
            <Printer className="w-4 h-4" /> Finalize POS Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
