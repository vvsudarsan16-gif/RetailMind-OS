import React, { useState } from 'react';
import { 
  Shield, User, Lock, ArrowRight, Briefcase, ShoppingBag, Terminal, 
  Sparkles, ShieldAlert, ArrowLeft, Eye, EyeOff, Laptop, HelpCircle, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';

interface LoginModuleProps {
  users: UserType[];
  onLogin: (role: 'admin' | 'manager' | 'cashier' | 'customer', userId: string) => void;
}

type PortalView = 'gateway' | 'admin' | 'manager' | 'cashier' | 'customer';

export default function LoginModule({ users, onLogin }: LoginModuleProps) {
  const [portal, setPortal] = useState<PortalView>('gateway');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Default credentials mapping for realistic and easy testing
  const defaultCredentials = {
    admin: { username: 'ceo_admin', label: 'CEO & Admin User' },
    manager: { username: 'alice_manager', label: 'Operations & Procurement Manager' },
    cashier: { username: 'john_cashier', label: 'POS Terminal Cashier' },
    customer: { username: 'johndoe', label: 'Standard Loyalty Customer' }
  };

  const handlePortalSelect = (selected: PortalView) => {
    setPortal(selected);
    setError('');
    setUsername(selected !== 'gateway' ? defaultCredentials[selected as keyof typeof defaultCredentials].username : '');
    setPassword('••••••••'); // Pre-populate mock password
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (portal === 'gateway') return;

    setLoading(true);
    setError('');

    setTimeout(() => {
      let matchedUser: UserType | undefined;

      if (portal === 'customer') {
        matchedUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.role === 'customer');
      } else {
        matchedUser = users.find(u => u.username === username && u.role === portal);
      }

      if (matchedUser) {
        onLogin(portal as 'admin' | 'manager' | 'cashier' | 'customer', matchedUser.id);
      } else {
        setError(`Invalid credentials. No active ${portal.toUpperCase()} profile matches "${username}".`);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex flex-col justify-between relative overflow-hidden font-sans select-none">
      
      {/* Background Matrix & Vector Glows */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/30 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      {/* Corporate Gateway Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10 border-b border-slate-800/60 bg-slate-950/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30 border border-blue-500/30">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase font-black text-blue-500">RetailMind OS v2.4</span>
            <h1 className="text-sm font-black tracking-tight text-white uppercase">Unified Gateway</h1>
          </div>
        </div>
        
        {portal !== 'gateway' && (
          <button
            onClick={() => handlePortalSelect('gateway')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800/90 rounded-lg border border-slate-700/50 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Gateway
          </button>
        )}
      </header>

      {/* Main Content Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-10 z-10">
        <AnimatePresence mode="wait">
          {portal === 'gateway' ? (
            /* =========================================================================
               PORTAL GATEWAY DIRECTORY
               ========================================================================= */
            <motion.div
              key="gateway"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-10"
            >
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold tracking-wider uppercase">
                  <Shield className="w-3.5 h-3.5" /> High-Performance Multi-Tenant Architecture
                </div>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                  Select Terminal Access Portal
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  RetailMind OS organizes operations into distinct workspace segments. Choose a secure login module below to simulate real-time operations as a CEO, Manager, POS Cashier, or Customer.
                </p>
              </div>

              {/* 4 Dedicated Portal Entry Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. ADMIN PORTAL */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-slate-900/60 border border-red-500/20 hover:border-red-500/50 rounded-2xl p-6 flex flex-col justify-between h-[300px] shadow-lg relative overflow-hidden group transition-all"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl group-hover:bg-red-600/15 transition-all" />
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-red-600 text-white flex items-center justify-center shadow-lg shadow-red-950/40 border border-red-400/20 mb-5">
                      <Shield className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono tracking-wider font-extrabold text-red-400 uppercase">System Root</span>
                    <h3 className="text-lg font-black text-white mt-1 group-hover:text-red-300 transition-colors">Admin Portal</h3>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed font-medium">
                      Oversee system audits, branch performance, regional employees, forecast inventory neural trends, and configure items.
                    </p>
                  </div>
                  <button
                    onClick={() => handlePortalSelect('admin')}
                    className="w-full mt-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs font-bold border border-red-500/20 hover:border-transparent transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Open Admin Portal <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>

                {/* 2. MANAGER PORTAL */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-slate-900/60 border border-violet-500/20 hover:border-violet-500/50 rounded-2xl p-6 flex flex-col justify-between h-[300px] shadow-lg relative overflow-hidden group transition-all"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl group-hover:bg-violet-600/15 transition-all" />
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-950/40 border border-violet-400/20 mb-5">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono tracking-wider font-extrabold text-violet-400 uppercase">Warehouse Log</span>
                    <h3 className="text-lg font-black text-white mt-1 group-hover:text-violet-300 transition-colors">Manager Portal</h3>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed font-medium">
                      Approve purchase logs, audit warehouse capacities, balance supplier risk reports, and authorize stock replenishments.
                    </p>
                  </div>
                  <button
                    onClick={() => handlePortalSelect('manager')}
                    className="w-full mt-4 py-2 bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white rounded-lg text-xs font-bold border border-violet-500/20 hover:border-transparent transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Open Manager Portal <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>

                {/* 3. CASHIER TERMINAL */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-slate-900/60 border border-emerald-500/20 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col justify-between h-[300px] shadow-lg relative overflow-hidden group transition-all"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-2xl group-hover:bg-emerald-600/15 transition-all" />
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-emerald-400/20 mb-5">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono tracking-wider font-extrabold text-emerald-400 uppercase">In-Store checkout</span>
                    <h3 className="text-lg font-black text-white mt-1 group-hover:text-emerald-300 transition-colors">Cashier Terminal</h3>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed font-medium">
                      Register high-speed offline checkout receipts, split payments across cards/UPI, scan virtual barcodes, and handle cash bins.
                    </p>
                  </div>
                  <button
                    onClick={() => handlePortalSelect('cashier')}
                    className="w-full mt-4 py-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg text-xs font-bold border border-emerald-500/20 hover:border-transparent transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Launch POS Terminal <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>

                {/* 4. CUSTOMER SHOPPER */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-slate-900/60 border border-blue-500/20 hover:border-blue-500/50 rounded-2xl p-6 flex flex-col justify-between h-[300px] shadow-lg relative overflow-hidden group transition-all"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/15 transition-all" />
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-950/40 border border-blue-400/20 mb-5">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono tracking-wider font-extrabold text-blue-400 uppercase">E-Commerce App</span>
                    <h3 className="text-lg font-black text-white mt-1 group-hover:text-blue-300 transition-colors">Customer Portal</h3>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed font-medium">
                      Browse stock, build carts, choose delivery time-slots, complete smart payments, log chats, and collect loyalty rewards.
                    </p>
                  </div>
                  <button
                    onClick={() => handlePortalSelect('customer')}
                    className="w-full mt-4 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-xs font-bold border border-blue-500/20 hover:border-transparent transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Enter Shopper App <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>

              </div>
            </motion.div>
          ) : (
            /* =========================================================================
               DEDICATED PORTAL LOGIN MODULE
               ========================================================================= */
            <motion.div
              key={portal}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 relative"
            >
              {/* Dynamic Theme Accents depending on active portal */}
              {portal === 'admin' && <div className="h-1.5 w-full bg-gradient-to-r from-rose-600 via-red-600 to-orange-600" />}
              {portal === 'manager' && <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600" />}
              {portal === 'cashier' && <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600" />}
              {portal === 'customer' && <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500" />}

              <div className="p-8 space-y-6">
                
                {/* Portal Branding Profile */}
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center text-white mb-2 shadow-inner">
                    {portal === 'admin' && (
                      <div className="w-12 h-12 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20 flex items-center justify-center">
                        <Shield className="w-6 h-6" />
                      </div>
                    )}
                    {portal === 'manager' && (
                      <div className="w-12 h-12 rounded-xl bg-violet-600/10 text-violet-500 border border-violet-500/20 flex items-center justify-center">
                        <Briefcase className="w-6 h-6" />
                      </div>
                    )}
                    {portal === 'cashier' && (
                      <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                        <Terminal className="w-6 h-6" />
                      </div>
                    )}
                    {portal === 'customer' && (
                      <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  
                  <span className={`text-[10px] font-mono tracking-wider font-extrabold uppercase ${
                    portal === 'admin' ? 'text-red-400' :
                    portal === 'manager' ? 'text-violet-400' :
                    portal === 'cashier' ? 'text-emerald-400' : 'text-blue-400'
                  }`}>
                    {portal === 'admin' ? 'Authorized Root Admin Portal' :
                     portal === 'manager' ? 'Regional Manager Portal' :
                     portal === 'cashier' ? 'POS Billing Terminal' : 'Consumer Shop Portal'}
                  </span>
                  
                  <h3 className="text-2xl font-black text-white tracking-tight capitalize">
                    {portal} Sign In
                  </h3>
                  
                  <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                    {portal === 'admin' && 'Root administrator credentials required for global operational controls.'}
                    {portal === 'manager' && 'Manage supplier listings, purchasing approvals & warehouse logs.'}
                    {portal === 'cashier' && 'Scan barcodes and process rapid checkout receipts instantly.'}
                    {portal === 'customer' && 'Browse, buy, and track orders inside your shopper membership account.'}
                  </p>
                </div>

                {/* Form Elements */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Username/ID Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {portal === 'cashier' ? 'Employee Badge ID' : 'Account Username / Email'}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-500" />
                      </span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={portal === 'cashier' ? 'Enter cashier ID' : 'Enter username'}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium placeholder-slate-600"
                      />
                    </div>
                  </div>

                  {/* Password/PIN Input */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        {portal === 'cashier' ? 'Terminal Passcode PIN' : 'Password / Pin Code'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] text-slate-500 hover:text-slate-300 font-bold tracking-wide flex items-center gap-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showPassword ? 'Hide PIN' : 'Reveal'}
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-500" />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono placeholder-slate-700"
                      />
                    </div>
                  </div>

                  {/* Operational Legal Banner for Corporate Portals */}
                  {portal !== 'customer' && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex gap-2.5 items-start text-[10px] text-slate-500 leading-normal">
                      <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-400 block">Secured Network Active</span>
                        This is an official business node. System actions will log to the corporate ledger automatically.
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-rose-950/40 border border-rose-900 text-rose-300 rounded-xl text-xs font-semibold leading-relaxed">
                      {error}
                    </div>
                  )}

                  {/* Authenticate Trigger */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 text-white rounded-xl text-sm font-black shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                      portal === 'admin' ? 'bg-red-600 hover:bg-red-700 shadow-red-950/20' :
                      portal === 'manager' ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-950/20' :
                      portal === 'cashier' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-950/20' :
                      'bg-blue-600 hover:bg-blue-700 shadow-blue-950/20'
                    }`}
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Load {portal.toUpperCase()} Profile <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Quick-Fill Demoloop Tooltips */}
                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed space-y-1.5">
                    <span className="font-black text-slate-400 block">💡 Quick Testing Mode:</span>
                    <p className="text-[10px]">
                      Username is auto-filled for fast switching. Standard password is: <code className="font-mono bg-slate-950 px-1 py-0.5 rounded text-blue-400">any</code>
                    </p>
                    <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-850 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <CheckCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-400">Pre-loaded Profile:</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-300 pl-5 block font-bold">
                        {defaultCredentials[portal as keyof typeof defaultCredentials].label}
                      </span>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Corporate Compliance Footer */}
      <footer className="w-full text-center py-6 px-4 z-10 border-t border-slate-800/40 text-xs text-slate-500 font-mono flex flex-col sm:flex-row sm:justify-between max-w-7xl mx-auto">
        <span>© 2026 RetailMind OS. All Rights Reserved.</span>
        <span className="flex items-center gap-1 mt-1.5 sm:mt-0 justify-center">
          <Laptop className="w-3.5 h-3.5" /> High-Density Container Host Node
        </span>
      </footer>
    </div>
  );
}
