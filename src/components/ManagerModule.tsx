/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Supplier, PurchaseOrder, StoreNotification } from '../types';
import { 
  Package, Truck, ArrowUpDown, ShieldAlert, Star, 
  Sparkles, CheckSquare, ListFilter, Plus, RefreshCw, Layers, Calendar, ChevronRight
} from 'lucide-react';

interface ManagerModuleProps {
  products: Product[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  onAddStock: (id: string, qty: number) => void;
  onUpdateProduct: (id: string, data: Partial<Product>) => void;
  onPlacePO: (poData: Partial<PurchaseOrder>) => void;
  onVerifyPO: (id: string, status: 'shipped' | 'delivered') => void;
  onSubmitNewProductRequest: (pData: any) => void;
}

export default function ManagerModule({ 
  products, suppliers, purchaseOrders, onAddStock, onUpdateProduct, onPlacePO, onVerifyPO, onSubmitNewProductRequest 
}: ManagerModuleProps) {
  const [activeTab, setActiveTab] = useState<'warehouse' | 'suppliers' | 'requests'>('warehouse');
  
  // Stock adjustments
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustQty, setAdjustQty] = useState(10);
  const [changeNotes, setChangeNotes] = useState('');

  // New PO states
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [poItemName, setPoItemName] = useState('');
  const [poItemQty, setPoItemQty] = useState(50);
  const [poItemCost, setPoItemCost] = useState(2.00);

  // New Product Request
  const [reqName, setReqName] = useState('');
  const [reqCat, setReqCat] = useState('Groceries');
  const [reqPrice, setReqPrice] = useState(5.99);
  const [reqCost, setReqCost] = useState(3.00);
  const [reqDesc, setReqDesc] = useState('');

  // Expiry details
  const expiringItems = products.filter(p => p.expiryDate);

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId) return;
    onAddStock(adjustProductId, adjustQty);
    setChangeNotes('');
  };

  const handlePlacePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || !poItemName) return;
    
    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    if (!supplier) return;

    onPlacePO({
      supplierId: selectedSupplierId,
      supplierName: supplier.name,
      items: [{ productName: poItemName, quantity: poItemQty, cost: poItemCost }],
      total: poItemQty * poItemCost
    });

    setPoItemName('');
    setPoItemQty(50);
  };

  const handleNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName) return;

    onSubmitNewProductRequest({
      name: reqName,
      category: reqCat,
      price: reqPrice,
      cost: reqCost,
      description: reqDesc,
      stock: 0,
      isApproved: false
    });

    setReqName('');
    setReqDesc('');
    alert('Request submitted! This product is now pending verification in the Admin CEO Dashboard approval queue.');
  };

  return (
    <div className="space-y-6" id="warehouse-erp-portal">
      {/* Sub tabs header */}
      <div className="flex border-b border-[#E2E8F0]">
        <button
          onClick={() => setActiveTab('warehouse')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'warehouse' ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Warehouse Stocks & Audits
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'suppliers' ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Suppliers & Purchase Orders
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'requests' ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          New Product Approval requests
        </button>
      </div>

      {/* TAB 1: Warehouse Stock */}
      {activeTab === 'warehouse' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stock list */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-[#0F172A] text-sm">Active Store Shelf Inventories</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-slate-400 font-bold uppercase text-[10px] bg-slate-50/50">
                    <th className="py-2.5 px-3">Product Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Current Stock</th>
                    <th className="py-2.5 px-3">Min Safe</th>
                    <th className="py-2.5 px-3">Expiry Date</th>
                    <th className="py-2.5 px-3">Approval status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(p => {
                    const isLow = p.stock <= p.minStockLevel;
                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/50 ${isLow ? 'bg-rose-50/10' : ''}`}>
                        <td className="py-3 px-3 font-semibold text-[#0F172A]">{p.name}</td>
                        <td className="py-3 px-3 text-slate-500">{p.category}</td>
                        <td className="py-3 px-3 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            isLow ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">{p.minStockLevel}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {p.expiryDate || 'N/A'}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {p.isApproved ? 'Approved' : 'Pending Verification'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action side: Audits & Expiry highlights */}
          <div className="space-y-6">
            {/* Quick stock adjustment form */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-[#3B82F6]" /> Manual Stock Audit Adjustment
              </h4>
              <form onSubmit={handleAdjustStock} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">Select Inventory Item:</label>
                  <select
                    value={adjustProductId}
                    onChange={(e) => setAdjustProductId(e.target.value)}
                    className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Qty: {p.stock})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 block mb-1">Qty Offset:</label>
                    <input
                      type="number"
                      value={adjustQty}
                      onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Notes / Audit Trail:</label>
                    <input
                      type="text"
                      placeholder="e.g. Broken packaging"
                      value={changeNotes}
                      onChange={(e) => setChangeNotes(e.target.value)}
                      className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2 focus:outline-none"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#3B82F6] hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-center shadow-sm cursor-pointer">
                  Apply Stock Audit Version
                </button>
              </form>
            </div>

            {/* AI restocking suggestions */}
            <div className="bg-gradient-to-br from-white to-[#EFF6FF] text-[#1E293B] rounded-xl p-5 shadow-sm border border-[#BFDBFE] space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-[#1E40AF]">
                <Sparkles className="w-4 h-4 text-[#3B82F6]" /> AI Refill Logistics Suggestion
              </h4>
              <div className="space-y-2 text-xs">
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Active algorithmic demand analysis recommends instant restocking logs for the following categories:
                </p>
                <div className="p-3 bg-white border border-[#BFDBFE]/60 rounded-lg space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between items-center text-rose-600">
                    <span>1. Farm Fresh Milk 1L</span>
                    <span className="font-bold">Order: +200 units</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-700">
                    <span>2. Artisan Sourdough Bread</span>
                    <span className="font-bold">Order: +50 units</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Suppliers & Purchase Orders */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* Purchase Orders List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-[#0F172A] text-sm">Corporate Purchase Orders directory</h3>
            <div className="space-y-3.5">
              {purchaseOrders.map(po => (
                <div key={po.id} className="border border-[#E2E8F0] rounded-lg p-4 bg-[#F8FAFC] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0F172A]">{po.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        po.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        po.status === 'shipped' ? 'bg-[#DBEAFE] text-[#1E40AF]' : 'bg-[#FEF3C7] text-[#92400E]'
                      }`}>
                        {po.status}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-600">{po.supplierName}</p>
                    <p className="text-[11px] text-slate-400">Items: {po.items.map(i => `${i.productName} (Qty: ${i.quantity})`).join(', ')}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">PO TOTAL</span>
                      <span className="font-mono font-bold text-[#0F172A]">${po.total}</span>
                    </div>

                    {po.status !== 'delivered' && (
                      <button
                        onClick={() => onVerifyPO(po.id, po.status === 'pending' ? 'shipped' : 'delivered')}
                        className="bg-[#3B82F6] hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-lg cursor-pointer"
                      >
                        {po.status === 'pending' ? 'Mark Shipped' : 'Confirm Delivered & Restock'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier Directory & PO Creation */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#3B82F6]" /> Issue Purchase Order (PO)
              </h4>
              <form onSubmit={handlePlacePO} className="space-y-3">
                <div>
                  <label className="text-slate-500 block mb-1">Select Wholesaler:</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2 focus:outline-none font-semibold text-slate-700 cursor-pointer"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Reliability: {s.reliability}%)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Item Title Description:</label>
                  <input
                    type="text"
                    placeholder="e.g. Farm Fresh Organic Milk 1L"
                    value={poItemName}
                    onChange={(e) => setPoItemName(e.target.value)}
                    className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 block mb-1">Quantity:</label>
                    <input
                      type="number"
                      value={poItemQty}
                      onChange={(e) => setPoItemQty(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Unit Supplier Cost ($):</label>
                    <input
                      type="number"
                      value={poItemCost}
                      onChange={(e) => setPoItemCost(parseFloat(e.target.value) || 1.0)}
                      className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#3B82F6] hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-center shadow-sm cursor-pointer">
                  Place Purchase Order
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: New Product Approval Requests */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm max-w-2xl mx-auto space-y-5 text-xs">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h3 className="font-bold text-[#0F172A] text-base">New Product Procurement Request</h3>
            <p className="text-slate-400 text-xs mt-1">Submit new catalog proposals to the CEO dashboard for listing approvals</p>
          </div>

          <form onSubmit={handleNewRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-500 block mb-1 font-semibold">Suggested Product Name:</label>
                <input
                  type="text"
                  placeholder="e.g. SuperFoods Raw Pomegranate Juice"
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2.5 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1 font-semibold">Target Product Category:</label>
                <select
                  value={reqCat}
                  onChange={(e) => setReqCat(e.target.value)}
                  className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="Groceries">Groceries / Food</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion / Clothing</option>
                  <option value="Household">Household Goods</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-500 block mb-1 font-semibold">Suggested Retail Price ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={reqPrice}
                  onChange={(e) => setReqPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2.5 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1 font-semibold">Estimated Wholesaler Cost ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={reqCost}
                  onChange={(e) => setReqCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2.5 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 block mb-1 font-semibold">Procurement Justification & Description:</label>
              <textarea
                rows={3}
                placeholder="Explain why this item has high market velocity demand..."
                value={reqDesc}
                onChange={(e) => setReqDesc(e.target.value)}
                className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2.5 focus:outline-none"
              />
            </div>

            <button type="submit" className="bg-[#3B82F6] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer">
              Submit Request Ticket
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
