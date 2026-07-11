import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Tag, Clock, ArrowRight, ShieldCheck, MapPin, 
  ThumbsUp, Star, Flame, Award, Percent, ShoppingCart
} from 'lucide-react';
import { Product, User } from '../../types';

interface CustomerHomeProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (category: string) => void;
  currentUser: User;
}

export default function CustomerHome({ 
  products, 
  onAddToCart, 
  onSelectProduct, 
  onSelectCategory,
  currentUser 
}: CustomerHomeProps) {
  const [activeBanner, setActiveBanner] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 45, seconds: 22 });
  const [selectedBranch, setSelectedBranch] = useState('branch-downtown');

  // Banner carousel logic
  const banners = [
    {
      title: "Super Saver Grocery Deals",
      subtitle: "Up to 50% off fresh farm produce and daily essentials",
      code: "FRESH10",
      bg: "from-emerald-700 to-teal-900",
      badge: "Grocery Fest"
    },
    {
      title: "Mega Electronics & Tech Sale",
      subtitle: "Flat $50 off premium laptops, headsets and smart wear",
      code: "SAVE50",
      bg: "from-indigo-800 to-blue-950",
      badge: "Tech Super-Deals"
    },
    {
      title: "Premium Gold Delivery Benefits",
      subtitle: "Activate your gold membership for free unlimited same-day dispatch",
      code: "GOLDMEMB",
      bg: "from-amber-600 to-orange-850",
      badge: "Loyalty Premium"
    }
  ];

  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 6000);

    // Flash sale countdown timer
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 1, minutes: 45, seconds: 22 }; // Reset
        }
      });
    }, 1000);

    return () => {
      clearInterval(bannerInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  const approvedProducts = products.filter(p => p.isApproved);
  const trendingProducts = [...approvedProducts].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const newArrivals = [...approvedProducts].reverse().slice(0, 4);
  const bestSellers = [...approvedProducts].filter(p => p.stock < 30).slice(0, 4);

  const formatTime = (t: typeof timeLeft) => {
    return `${String(t.hours).padStart(2, '0')}h : ${String(t.minutes).padStart(2, '0')}m : ${String(t.seconds).padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-8" id="customer-home-tab">
      
      {/* Sliding Offers Hero Banner */}
      <div className={`bg-gradient-to-r ${banners[activeBanner].bg} rounded-2xl p-6 md:p-8 text-white relative overflow-hidden transition-all duration-500 shadow-md`}>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold border border-white/20">
              <Tag className="w-3.5 h-3.5 text-amber-400" /> {banners[activeBanner].badge}
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight transition-all">{banners[activeBanner].title}</h2>
            <p className="text-slate-100 text-sm leading-relaxed">{banners[activeBanner].subtitle}</p>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="text-xs text-slate-200">Apply Code at checkout:</span>
              <span className="bg-white/20 hover:bg-white/30 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs font-mono border border-white/20 tracking-wider">
                {banners[activeBanner].code}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {banners.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveBanner(idx)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all ${activeBanner === idx ? 'bg-amber-400 scale-125' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Categories (Mobiles, Fashion, Grocery, Sports, Books, Medicine) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-[#0F172A] text-sm tracking-tight mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" /> Explore Top Categories
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {[
            { id: 'Grocery', label: 'Groceries', icon: '🍎', color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100 text-emerald-700' },
            { id: 'Electronics', label: 'Electronics', icon: '💻', color: 'bg-blue-50 hover:bg-blue-100 border-blue-100 text-blue-700' },
            { id: 'Fashion', label: 'Fashion', icon: '👕', color: 'bg-purple-50 hover:bg-purple-100 border-purple-100 text-purple-700' },
            { id: 'Sports', label: 'Sports & Gear', icon: '⚽', color: 'bg-amber-50 hover:bg-amber-100 border-amber-100 text-amber-700' },
            { id: 'Books', label: 'Books', icon: '📚', color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-100 text-indigo-700' },
            { id: 'Medicine', label: 'Medicine', icon: '💊', color: 'bg-rose-50 hover:bg-rose-100 border-rose-100 text-rose-700' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${cat.color}`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[11px] font-extrabold tracking-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Deals & Flash Sale Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Flash Sale Countdown Banner */}
        <div className="lg:col-span-1 bg-gradient-to-br from-rose-600 to-red-800 rounded-xl p-5 text-white flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-white/5 rounded-full blur-2xl" />
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" /> Live Flash Sale
            </span>
            <h4 className="text-xl font-extrabold tracking-tight">Hurry Up! Price Slits end in:</h4>
            <div className="text-lg sm:text-xl font-mono font-black bg-slate-950/40 p-3 rounded-lg border border-white/10 text-amber-300 text-center">
              {formatTime(timeLeft)}
            </div>
            <p className="text-xs text-rose-100">Limited quantities left. Check standard items to claim dynamic 50% discount triggers on electronics and fresh dairy.</p>
          </div>
          <button 
            onClick={() => onSelectCategory('All')} 
            className="mt-6 w-full py-2 bg-white hover:bg-rose-50 text-red-700 font-extrabold rounded-lg text-xs tracking-wide transition-colors cursor-pointer"
          >
            Shop Today's Deals <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
          </button>
        </div>

        {/* Dynamic Today's Deals Item Grid */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-bold text-[#0F172A] text-sm tracking-tight flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-red-500" /> Today's Lightning Deals
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">STOCK LEVEL COUNTERS ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trendingProducts.slice(0, 2).map(prod => (
              <div key={prod.id} className="flex gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs items-center hover:shadow-sm transition-shadow">
                <img src={prod.images[0]} alt={prod.name} referrerPolicy="no-referrer" className="w-16 h-16 object-cover rounded bg-white border border-slate-200" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 truncate">{prod.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="font-mono font-black text-red-600">${prod.price}</span>
                    <span className="font-mono text-[10px] text-slate-400 line-through">${(prod.price * 1.5).toFixed(2)}</span>
                  </div>
                  <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1 rounded">50% OFF DEAL</span>
                </div>
                <button
                  onClick={() => onAddToCart(prod)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg cursor-pointer transition-colors"
                  title="Quick Add"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bento Sections: Trending / New Arrivals / Nearby Store */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Trending Items */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-[#0F172A] text-xs uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
              🔥 Trending Products
            </h4>
            <div className="space-y-3">
              {trendingProducts.map(prod => (
                <div 
                  key={prod.id} 
                  onClick={() => onSelectProduct(prod)}
                  className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-all"
                >
                  <img src={prod.images[0]} alt={prod.name} referrerPolicy="no-referrer" className="w-9 h-9 object-cover rounded bg-slate-100 border border-slate-200" />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-800 block text-xs truncate">{prod.name}</span>
                    <span className="font-mono text-[10px] text-blue-600 font-bold">${prod.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. New Arrivals */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-[#0F172A] text-xs uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
              ⭐ New Arrivals
            </h4>
            <div className="space-y-3">
              {newArrivals.map(prod => (
                <div 
                  key={prod.id} 
                  onClick={() => onSelectProduct(prod)}
                  className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-all"
                >
                  <img src={prod.images[0]} alt={prod.name} referrerPolicy="no-referrer" className="w-9 h-9 object-cover rounded bg-slate-100 border border-slate-200" />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-800 block text-xs truncate">{prod.name}</span>
                    <span className="font-mono text-[10px] text-blue-600 font-bold">${prod.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Nearby Store Availability Checker */}
        <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" /> Nearby Store Stock
            </h4>
            <p className="text-[11px] text-slate-400">Select simulated local warehouse to compare physical shelf availability instantly before checkout.</p>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Selected Outlet Branch:</label>
              <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="branch-downtown">Downtown HQ Superstore</option>
                <option value="branch-westside">Westside Express Hub</option>
                <option value="branch-midtown">Midtown Commerce Depot</option>
              </select>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px] space-y-1">
              <div className="flex justify-between text-slate-400"><span>Store Delivery:</span><span className="text-emerald-400 font-bold">15-Minute Flash Active</span></div>
              <div className="flex justify-between text-slate-400"><span>Operating Hrs:</span><span className="text-slate-300">07:00 AM - 11:30 PM</span></div>
              <div className="flex justify-between text-slate-400"><span>Distance:</span><span className="text-blue-400 font-bold">1.2 miles away</span></div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Verified real-time inventory
          </div>
        </div>

      </div>

      {/* Featured Verified Customer Reviews Spotlight */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-[#0F172A] text-sm tracking-tight mb-4 flex items-center gap-1.5">
          <ThumbsUp className="w-4 h-4 text-emerald-600" /> Verified Shopper Spotlight
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          {[
            { user: "Sarah Jenkins", comment: "The AeroPro Notebook arrived within 18 hours in beautiful gift wrap! Mind-blowing retail speed.", rating: 5 },
            { user: "David Lopez", comment: "Smart grocery refill suggested organic milk exactly on the day I finished mine. Outstanding AI copilot!", rating: 5 },
            { user: "Emily Chen", comment: "Split payment using UPI + credit card works beautifully for big purchases! Best e-commerce UI.", rating: 5 }
          ].map((rev, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">{rev.user}</span>
                <div className="flex text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-[11px] leading-relaxed italic">"{rev.comment}"</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
