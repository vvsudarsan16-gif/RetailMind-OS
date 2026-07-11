/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, User, Employee, Branch, Order, AuditLog } from '../types';
import { 
  BarChart as ChartIcon, Users, UserCheck, Shield, Clipboard, AlertOctagon, 
  Sparkles, Check, X, RefreshCw, Eye, Trash2, Download, Play, Cpu, ShieldAlert, TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AdminModuleProps {
  products: Product[];
  users: User[];
  employees: Employee[];
  branches: Branch[];
  orders: Order[];
  auditLogs: AuditLog[];
  onApproveProduct: (id: string) => void;
  onModifyUser: (id: string, data: Partial<User>) => void;
  onDeleteProduct: (id: string) => void;
}

export default function AdminModule({
  products, users, employees, branches, orders, auditLogs, onApproveProduct, onModifyUser, onDeleteProduct
}: AdminModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'rbac' | 'branches' | 'ai-core' | 'logs'>('dashboard');

  // AI Decision Simulator variables
  const [simProductId, setSimProductId] = useState(products[0]?.id || '');
  const [simPriceAdj, setSimPriceAdj] = useState(-10);
  const [simResult, setSimResult] = useState<any | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // AI Forecasting variables
  const [forecastProductId, setForecastProductId] = useState(products[0]?.id || '');
  const [forecastDays, setForecastDays] = useState(30);
  const [forecastResult, setForecastResult] = useState<any | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  // AI Dynamic Pricing variables
  const [pricingProductId, setPricingProductId] = useState(products[0]?.id || '');
  const [pricingResult, setPricingResult] = useState<any | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Business Copilot state
  const [copilotBriefing, setCopilotBriefing] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Fraud state
  const [fraudLogs, setFraudLogs] = useState<any[]>([]);
  const [fraudLoading, setFraudLoading] = useState(false);

  // Quick calculations
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'returned' ? sum + o.total : sum, 0) + branches.reduce((sum, b) => sum + b.revenue, 0);
  const totalProfit = orders.reduce((sum, o) => o.status !== 'returned' ? sum + (o.total * 0.4) : sum, 0) + branches.reduce((sum, b) => sum + b.profit, 0);
  const pendingApprovals = products.filter(p => !p.isApproved);

  // Simulated Analytics Chart Data
  const revenueChartData = [
    { name: 'Mon', Revenue: 4200, Profit: 1680 },
    { name: 'Tue', Revenue: 5100, Profit: 2040 },
    { name: 'Wed', Revenue: 4900, Profit: 1960 },
    { name: 'Thu', Revenue: 6200, Profit: 2480 },
    { name: 'Fri', Revenue: 7800, Profit: 3120 },
    { name: 'Sat', Revenue: 9500, Profit: 3800 },
    { name: 'Sun', Revenue: 11000, Profit: 4400 }
  ];

  // RBAC Controls
  const handleToggleUserStatus = (u: User) => {
    onModifyUser(u.id, { status: u.status === 'active' ? 'suspended' : 'active' });
  };

  const handleResetPassword = (u: User) => {
    alert(`Security override: Password for ${u.username} has been re-encrypted and reset to temporary: TempMind991!`);
  };

  // Run AI Decision Simulator
  const triggerSimulator = async () => {
    setSimLoading(true);
    try {
      const res = await fetch('/api/ai/decision-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: simProductId, priceAdjustmentPercent: simPriceAdj })
      });
      const data = await res.json();
      setSimResult(data);
    } catch (e) {
      alert('Error running simulation model.');
    } finally {
      setSimLoading(false);
    }
  };

  // Run AI Demand Forecasting
  const triggerForecaster = async () => {
    setForecastLoading(true);
    try {
      const res = await fetch('/api/ai/demand-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: forecastProductId, days: forecastDays })
      });
      const data = await res.json();
      setForecastResult(data);
    } catch (e) {
      alert('Error generating demand forecasting.');
    } finally {
      setForecastLoading(false);
    }
  };

  // Run AI Dynamic Pricing
  const triggerPricing = async () => {
    setPricingLoading(true);
    try {
      const res = await fetch('/api/ai/dynamic-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: pricingProductId })
      });
      const data = await res.json();
      setPricingResult(data);
    } catch (e) {
      alert('Error generating pricing index.');
    } finally {
      setPricingLoading(false);
    }
  };

  // Fetch Copilot Briefing
  const fetchCopilot = async () => {
    setCopilotLoading(true);
    try {
      const res = await fetch('/api/ai/copilot-briefing');
      const data = await res.json();
      setCopilotBriefing(data.briefing);
    } catch (e) {
      setCopilotBriefing('Error pulling briefing.');
    } finally {
      setCopilotLoading(false);
    }
  };

  // Fetch Fraud Logs
  const fetchFraud = async () => {
    setFraudLoading(true);
    try {
      const res = await fetch('/api/ai/fraud-detection');
      const data = await res.json();
      setFraudLogs(data);
    } catch (e) {
      alert('Error scanning fraud protocols.');
    } finally {
      setFraudLoading(false);
    }
  };

  // Trigger default loads on Tab focus
  useEffect(() => {
    if (activeSubTab === 'ai-core') {
      fetchCopilot();
      fetchFraud();
    }
  }, [activeSubTab]);

  // Visual File Exporter
  const simulateExport = (format: string) => {
    alert(`Generating certified corporate file export: RetailMind_ERP_Audited_Report.${format}. File successfully prepped for local download.`);
  };

  return (
    <div className="space-y-6" id="ceo-enterprise-portal">
      {/* Subnav links */}
      <div className="flex border-b border-[#E2E8F0]">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'dashboard' ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          CEO Executive Overview
        </button>
        <button
          onClick={() => setActiveSubTab('rbac')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'rbac' ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          RBAC User & Employee Controls
        </button>
        <button
          onClick={() => setActiveSubTab('branches')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'branches' ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Multi-Branch Performance
        </button>
        <button
          onClick={() => setActiveSubTab('ai-core')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'ai-core' ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          🛡️ Enterprise AI Dashboard
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'logs' ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Security Audit Logs & Health
        </button>
      </div>

      {/* SUB-TAB 1: CEO Dashboard */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Performance Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm">
              <span className="text-[12px] text-[#64748B] font-medium uppercase tracking-wider block">Audited Revenue</span>
              <span className="text-2xl font-bold text-[#0F172A] mt-1.5 block font-mono">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm">
              <span className="text-[12px] text-[#64748B] font-medium uppercase tracking-wider block">Gross Profit</span>
              <span className="text-2xl font-bold text-[#10B981] mt-1.5 block font-mono">${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm">
              <span className="text-[12px] text-[#64748B] font-medium uppercase tracking-wider block">Business Health Index</span>
              <span className="text-2xl font-bold text-[#3B82F6] mt-1.5 block font-mono">94%</span>
            </div>
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm">
              <span className="text-[12px] text-[#64748B] font-medium uppercase tracking-wider block">Staff & Branches</span>
              <span className="text-2xl font-bold text-[#0F172A] mt-1.5 block font-mono">{employees.length} Staff / {branches.length} Branches</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Recharts Area */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                <h3 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ChartIcon className="w-4 h-4 text-[#3B82F6]" /> Operational Sales Velocity
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => simulateExport('pdf')} className="text-[10px] text-[#64748B] hover:text-[#3B82F6] font-bold flex items-center gap-1 bg-[#F1F5F9] px-2.5 py-1 rounded border border-[#E2E8F0] cursor-pointer"><Download className="w-3.5 h-3.5" /> PDF</button>
                  <button onClick={() => simulateExport('xlsx')} className="text-[10px] text-[#64748B] hover:text-[#3B82F6] font-bold flex items-center gap-1 bg-[#F1F5F9] px-2.5 py-1 rounded border border-[#E2E8F0] cursor-pointer"><Download className="w-3.5 h-3.5" /> EXCEL</button>
                </div>
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="Revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Profit" stroke="#10B981" fillOpacity={1} fill="url(#colorProf)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inventory Listing Approval Queue (Manager Collaborative workflow) */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider pb-3 border-b border-[#E2E8F0] flex items-center gap-1.5 mb-3">
                  <Clipboard className="w-4 h-4 text-[#3B82F6]" /> Manager Approval Requests
                </h3>
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {pendingApprovals.length === 0 ? (
                    <p className="text-[#64748B] text-xs text-center py-12">No pending listing approvals. System synchronicity clean.</p>
                  ) : (
                    pendingApprovals.map(p => (
                      <div key={p.id} className="border border-[#E2E8F0] rounded-lg p-3.5 bg-[#F8FAFC] text-xs flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-[#0F172A]">{p.name}</h4>
                            <span className="text-[10px] font-semibold text-[#1E40AF] bg-[#DBEAFE] px-2 py-0.5 rounded">{p.category}</span>
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-1 font-mono">Suggested Base Retail: ${p.price}</p>
                          <p className="text-[10px] text-slate-400 leading-tight mt-1 truncate">{p.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onApproveProduct(p.id)}
                            className="flex-1 bg-[#3B82F6] hover:bg-blue-700 text-white font-bold py-1.5 rounded-lg text-center cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {pendingApprovals.length > 0 && (
                <div className="mt-4 text-[10px] text-slate-400 text-center font-semibold">
                  *Approvals instantly sync and authorize retail listing on the Customer storefront.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RBAC Users and Staff */}
      {activeSubTab === 'rbac' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* User management */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-[#0F172A] text-sm">Enterprise Users Registry & RBAC Permissions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-slate-400 font-bold uppercase text-[10px] bg-slate-50/50">
                    <th className="py-2.5 px-3">Username / Email</th>
                    <th className="py-2.5 px-3">Assigned Role</th>
                    <th className="py-2.5 px-3">Security status</th>
                    <th className="py-2.5 px-3">Privileges</th>
                    <th className="py-2.5 px-3 text-right">Actions Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <p className="font-bold text-[#0F172A]">{u.username}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'manager' ? 'bg-indigo-100 text-indigo-700' :
                          u.role === 'cashier' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className={`font-bold ${u.status === 'active' ? 'text-emerald-600' : 'text-rose-600 animate-pulse'}`}>
                          ● {u.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-semibold uppercase text-[9px]">{u.membership} Tier</td>
                      <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            u.status === 'active' 
                              ? 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100' 
                              : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleResetPassword(u)}
                          className="px-2 py-1 bg-[#F1F5F9] hover:bg-slate-200 text-slate-600 border border-[#E2E8F0] rounded text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Reset Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Employees rosters */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-[#0F172A] text-sm">Active Employee Performance Scoreboards</h3>
            <div className="space-y-3.5">
              {employees.map(emp => (
                <div key={emp.id} className="p-3.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[#0F172A]">{emp.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{emp.role}</p>
                    </div>
                    <span className="font-mono text-[#1E40AF] bg-[#DBEAFE] border border-[#BFDBFE] px-2 py-0.5 rounded text-[11px] font-bold">
                      ★ {emp.performanceScore}/5
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-[#E2E8F0]/60 text-slate-400">
                    <div>Attendance: <span className="font-semibold text-[#1E293B]">{emp.attendanceRate}%</span></div>
                    <div>Branch: <span className="font-semibold text-[#1E293B] truncate block">{emp.branch.split(' ')[0]}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Branches compare */}
      {activeSubTab === 'branches' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {branches.map(branch => (
            <div key={branch.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-3.5 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-[#1E40AF] bg-[#DBEAFE] px-2 py-0.5 rounded border border-[#BFDBFE]">ID: {branch.id}</span>
                <h3 className="font-bold text-[#0F172A] text-sm tracking-tight mt-1.5">{branch.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{branch.location}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#E2E8F0]">
                <div className="flex justify-between text-[#64748B]">
                  <span>Branch Revenue:</span>
                  <span className="font-mono font-semibold text-[#0F172A]">${branch.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Gross Profit Yield:</span>
                  <span className="font-mono font-semibold text-[#10B981]">${branch.profit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Store Shelf Items stock:</span>
                  <span className="font-mono font-semibold text-[#0F172A]">{branch.stockCount.toLocaleString()} units</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 4: Enterprise AI Modules USP */}
      {activeSubTab === 'ai-core' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* Executive Morning Copilot Briefing */}
          <div className="lg:col-span-8 bg-gradient-to-br from-white to-[#EFF6FF] text-[#1E293B] rounded-xl p-6 shadow-sm border border-[#BFDBFE] space-y-4">
            <div className="flex justify-between items-center border-b border-[#BFDBFE]/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#DBEAFE] text-[#1E40AF] rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm tracking-tight">AI Executive Morning Briefing Copilot</h3>
                  <p className="text-[10px] text-[#64748B]">Deep-learning analysis of weekly inventories and margins</p>
                </div>
              </div>
              <button 
                onClick={fetchCopilot}
                className="bg-[#3B82F6] hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-Analyze Briefing
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-1 text-[#1E293B] text-[11px] leading-relaxed font-sans space-y-3 whitespace-pre-wrap">
              {copilotLoading ? (
                <div className="py-24 text-center text-[#64748B] font-semibold flex items-center justify-center gap-2 animate-pulse">
                  <Cpu className="w-5 h-5 animate-spin text-[#3B82F6]" /> Computing Enterprise Neural Ratios...
                </div>
              ) : (
                copilotBriefing || "No morning briefing pulled. Click re-analyze above."
              )}
            </div>
          </div>

          {/* AI Refund Fraud Scanner */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider pb-3 border-b border-[#E2E8F0] flex items-center gap-1.5 mb-3">
                <ShieldAlert className="w-4 h-4 text-rose-500" /> AI RetailGuard Fraud Alerter
              </h3>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {fraudLoading ? (
                  <div className="py-12 text-center text-[#64748B] animate-pulse font-semibold">Scanning transaction hashes...</div>
                ) : (
                  fraudLogs.map((fl, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${fl.riskRating === 'high' ? 'border-rose-100 bg-rose-50/25' : 'border-[#E2E8F0] bg-slate-50/40'}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-slate-800">{fl.orderId}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          fl.riskRating === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          Risk Score: {fl.score}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{fl.reasoning}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {fl.anomalies.map((an: string, k: number) => (
                          <span key={k} className="bg-rose-100 text-rose-800 text-[8px] font-bold px-1.5 py-0.2 rounded">{an}</span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <button 
              onClick={fetchFraud}
              className="mt-4 w-full bg-[#F1F5F9] hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-center cursor-pointer border border-[#E2E8F0]"
            >
              Force Fraud Scan
            </button>
          </div>

          {/* AI Decision Simulator Stage */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#3B82F6]" /> Decision Simulator (What-If?)
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Target Product:</label>
                <select
                  value={simProductId}
                  onChange={(e) => setSimProductId(e.target.value)}
                  className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2 focus:outline-none text-slate-700 font-semibold cursor-pointer"
                >
                  {products.filter(p => p.isApproved).map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Price: ${p.price})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Simulated price Adjustment (%):</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={simPriceAdj}
                  onChange={(e) => setSimPriceAdj(parseInt(e.target.value))}
                  className="w-full accent-[#3B82F6] cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700 font-mono block text-right">{simPriceAdj > 0 ? '+' : ''}{simPriceAdj}% adjustment</span>
              </div>

              <button 
                onClick={triggerSimulator}
                disabled={simLoading}
                className="w-full bg-[#3B82F6] hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-center shadow-sm cursor-pointer"
              >
                {simLoading ? 'Simulating Market Elasticity...' : 'Run Decision Simulation'}
              </button>
            </div>

            {simResult && (
              <div className="p-3 bg-blue-50/30 border border-[#BFDBFE] rounded-lg space-y-2">
                <div className="flex justify-between items-center border-b border-[#BFDBFE]/60 pb-1.5">
                  <span className="font-bold text-slate-800 truncate">{simResult.productName}</span>
                  <span className="font-mono text-[#1E40AF] font-bold">${simResult.simulatedPrice}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
                  <div>Simulated Margin: <span className="font-bold text-slate-700">{simResult.simulatedMarginPercent}%</span></div>
                  <div>Vol Delta: <span className="font-bold text-emerald-600">+{simResult.projectedVolumeDeltaPercent}%</span></div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed pt-1 whitespace-pre-wrap">{simResult.aiSummary}</p>
              </div>
            )}
          </div>

          {/* AI Demand Forecaster Stage */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#3B82F6]" /> AI Demand Forecasting Engine
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Select Product:</label>
                <select
                  value={forecastProductId}
                  onChange={(e) => setForecastProductId(e.target.value)}
                  className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2 focus:outline-none text-slate-700 font-semibold cursor-pointer"
                >
                  {products.filter(p => p.isApproved).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Forecast Period Timeframe:</label>
                <select
                  value={forecastDays}
                  onChange={(e) => setForecastDays(parseInt(e.target.value))}
                  className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2 focus:outline-none text-slate-700 font-semibold cursor-pointer"
                >
                  <option value="7">7 Days Prediction</option>
                  <option value="30">30 Days Prediction</option>
                  <option value="90">90 Days Prediction</option>
                </select>
              </div>

              <button 
                onClick={triggerForecaster}
                disabled={forecastLoading}
                className="w-full bg-[#3B82F6] hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-center shadow-sm cursor-pointer"
              >
                {forecastLoading ? 'Predicting seasonal velocity...' : 'Generate Demand Forecast'}
              </button>
            </div>

            {forecastResult && (
              <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{forecastResult.days} Day Predicted Need:</span>
                  <span className="font-mono font-bold text-[#1E40AF] bg-[#DBEAFE] px-2 py-0.5 rounded">{forecastResult.predictedDemand} Units</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Model Confidence: {forecastResult.confidenceScore}%</div>
                <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-200/50 pt-1 whitespace-pre-wrap">{forecastResult.explanation}</p>
              </div>
            )}
          </div>

          {/* AI Dynamic Price Suggester Stage */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#10B981]" /> AI Dynamic Price Optimiser
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Target Product:</label>
                <select
                  value={pricingProductId}
                  onChange={(e) => setPricingProductId(e.target.value)}
                  className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-2 focus:outline-none text-slate-700 font-semibold cursor-pointer"
                >
                  {products.filter(p => p.isApproved).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={triggerPricing}
                disabled={pricingLoading}
                className="w-full bg-[#10B981] hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-center shadow-sm cursor-pointer"
              >
                {pricingLoading ? 'Calculating optimal markup...' : 'Suggest Dynamic Price'}
              </button>
            </div>

            {pricingResult && (
              <div className="p-3 bg-emerald-50/30 border border-[#A7F3D0] rounded-lg space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Suggested Price Point:</span>
                  <span className="font-mono font-bold text-[#065F46] bg-[#D1FAE5] px-2 py-0.5 rounded">${pricingResult.suggestedPrice}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
                  <div>Expected Profit: <span className="font-bold text-slate-700">+{pricingResult.expectedProfitPercent}%</span></div>
                  <div>Demand Delta: <span className="font-bold text-emerald-600">+{pricingResult.expectedDemandDeltaPercent}%</span></div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed border-t border-[#A7F3D0]/60 pt-1 whitespace-pre-wrap">{pricingResult.reasoning}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: Security logs & System monitor */}
      {activeSubTab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* Security Audit logs list */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-[#0F172A] text-sm">Corporate Security Auditing logs</h3>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {auditLogs.map(log => (
                <div key={log.id} className="border border-[#E2E8F0] rounded-lg p-3 bg-[#F8FAFC] flex flex-col md:flex-row justify-between gap-3 text-xs leading-normal">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[#1E40AF]">{log.action}</span>
                      <span className="bg-[#EFF6FF] text-[#1E40AF] text-[10px] font-bold px-1.5 py-0.2 rounded border border-[#BFDBFE]">{log.role.toUpperCase()}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[#1E293B]">{log.details}</p>
                  </div>
                  <div className="text-left md:text-right font-mono text-[9px] text-slate-400 whitespace-nowrap space-y-0.5">
                    <div>IP: {log.ip}</div>
                    <div>Agent: {log.device}</div>
                    <div>Loc: {log.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System status metrics */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-[#0F172A] text-sm">System Container Infrastructure Metrics</h3>
            <div className="space-y-3.5">
              <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#0F172A]">Database Microservice:</span>
                  <span className="text-emerald-500 font-bold font-mono">NOMINAL (100%)</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full w-[100%]" /></div>
              </div>

              <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#0F172A]">Cognitive AI Service (V2):</span>
                  <span className="text-emerald-500 font-bold font-mono">ONLINE (0.4s Latency)</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full w-[98%]" /></div>
              </div>

              <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#0F172A]">API Gateway Controller:</span>
                  <span className="text-emerald-500 font-bold font-mono">ONLINE (100%)</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full w-[100%]" /></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
