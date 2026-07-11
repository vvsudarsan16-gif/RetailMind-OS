import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Filter, ArrowUpDown, ChevronRight, Star, 
  Clock, Truck, Tag, Send, Sparkles, CreditCard, MapPin, Gift, AlertCircle, 
  ShoppingCart, Plus, Minus, Trash2, User as UserIcon, PlusCircle, CheckCircle, 
  XCircle, Wallet, RotateCcw, History, UserCheck, LogOut, BadgePercent, UserPlus, 
  ArrowRight, RefreshCw, Home, Heart, Calendar, HelpCircle, Camera, Mic, QrCode, 
  Download, FileText, Map, Phone, Share2, Eye, ShieldAlert
} from 'lucide-react';
import { Product, User, Order } from '../types';

// Import Custom Modular Subcomponents
import CustomerHome from './customer/CustomerHome';
import CustomerMapTracker from './customer/CustomerMapTracker';
import CustomerPayments from './customer/CustomerPayments';
import CustomerAiTools from './customer/CustomerAiTools';
import CustomerSupport from './customer/CustomerSupport';

interface CustomerModuleProps {
  currentUser: User;
  products: Product[];
  myOrders: Order[];
  onPlaceOrder: (orderData: Partial<Order>) => Promise<any>;
  onModifyUser: (userId: string, data: Partial<User>) => Promise<void>;
  onSwitchUser: () => void;
  users: User[];
  syncState: () => Promise<void>;
  offlineMode?: boolean;
  onToggleOffline?: () => void;
}

export default function CustomerModule({
  currentUser,
  products,
  myOrders,
  onPlaceOrder,
  onModifyUser,
  onSwitchUser,
  users,
  syncState,
  offlineMode = false,
  onToggleOffline
}: CustomerModuleProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'home' | 'browse' | 'wishlist' | 'orders' | 'profile' | 'subscriptions' | 'support' | 'ai-tools'>('home');

  // Browse catalog state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Simulated search modalities
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const [imageSearchActive, setImageSearchActive] = useState(false);
  const [barcodeScanActive, setBarcodeScanActive] = useState(false);

  // Cart & Wishlist state
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`wishlist_${currentUser.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState<number>(0);
  const [offlineOrders, setOfflineOrders] = useState<Order[]>([]);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [emailSentToast, setEmailSentToast] = useState(false);
  
  // Checkout flow state
  const [step, setStep] = useState<'browse' | 'cart' | 'checkout' | 'confirmation'>('browse');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser.addresses[0] || '782 Maple Lane, Suburbia, TC 90220');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [giftWrap, setGiftWrap] = useState(false);
  const [deliverySlot, setDeliverySlot] = useState('Tomorrow 10:00 AM - 1:00 PM');
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  // Live Map tracking overlay state
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Subscriptions schedule
  const [subscriptions, setSubscriptions] = useState<Array<{ id: string; product: Product; frequency: string; status: 'active' | 'paused' }>>([
    { id: 'sub-1', product: products.find(p => p.id === 'prod-milk') || products[0], frequency: 'Every 3 Days', status: 'active' }
  ]);

  // Review submission state
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // AI assistant state
  const [aiMessage, setAiMessage] = useState('');
  const [aiChat, setAiChat] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: 'Hi! I am your AI Shopping Copilot. I can suggest healthy breakfasts, recommend elite laptop gadgets, or search low-price bargains! Ask me anything.' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Profile Form state
  const [newAddress, setNewAddress] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardType, setNewCardType] = useState('Visa');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpSuccess, setTopUpSuccess] = useState('');

  // Save Wishlist to localStorage on change
  useEffect(() => {
    localStorage.setItem(`wishlist_${currentUser.id}`, JSON.stringify(wishlist));
  }, [wishlist, currentUser.id]);

  // Approved products only
  const approvedProducts = products.filter(p => p.isApproved);

  // Handle Search modalities
  const triggerVoiceSearch = () => {
    setVoiceSearchActive(true);
    setTimeout(() => {
      setSearchQuery('Organic Milk');
      setActiveTab('browse');
      setVoiceSearchActive(false);
    }, 2000);
  };

  const triggerImageSearch = () => {
    setImageSearchActive(true);
    setTimeout(() => {
      setSearchQuery('AeroPro Notebook');
      setActiveTab('browse');
      setImageSearchActive(false);
    }, 2000);
  };

  const triggerBarcodeScan = () => {
    setBarcodeScanActive(true);
    setTimeout(() => {
      const laptop = approvedProducts.find(p => p.id === 'prod-laptop');
      if (laptop) {
        setSelectedProduct(laptop);
      }
      setBarcodeScanActive(false);
    }, 2000);
  };

  // Cart operations
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === id) {
          const nQty = item.quantity + delta;
          return nQty > 0 ? { ...item, quantity: nQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  // Wishlist operations
  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const moveWishlistToCart = (product: Product) => {
    addToCart(product);
    setWishlist(prev => prev.filter(p => p.id !== product.id));
  };

  // Coupon Engine
  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'SAVE50') {
      setCouponDiscount(50);
      setCouponMessage('✓ Promocode SAVE50 applied! Flat $50 discount applied.');
    } else if (code === 'FRESH10') {
      setCouponDiscount(cartSubtotal * 0.1);
      setCouponMessage('✓ Promocode FRESH10 applied! 10% Grocery Fest discount applied.');
    } else {
      setCouponDiscount(0);
      setCouponMessage('❌ Invalid Promocode. Try "SAVE50" or "FRESH10".');
    }
  };

  // Cart totals calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const cartTax = cartSubtotal * 0.08; // 8% tax
  const couponDiscountAmount = couponDiscount;
  const loyaltyDiscountAmount = parseFloat((loyaltyPointsToRedeem / 10).toFixed(2));
  const cartTotal = Math.max(0, cartSubtotal + cartTax - couponDiscountAmount - loyaltyDiscountAmount);

  // Checkout handling
  const handleCheckout = () => {
    if (cart.length === 0) return;
    setStep('checkout');
  };

  // Auto-sync offline queued customer orders back to server when online connectivity is restored
  useEffect(() => {
    if (!offlineMode && offlineOrders.length > 0) {
      const syncOfflineOrders = async () => {
        for (const offOrder of offlineOrders) {
          try {
            // Send to database
            await onPlaceOrder({
              items: offOrder.items,
              customerId: offOrder.customerId,
              customerName: offOrder.customerName,
              branchId: offOrder.branchId,
              discount: offOrder.discount,
              couponCode: offOrder.couponCode,
              paymentMethod: offOrder.paymentMethod,
              address: offOrder.address,
              giftWrap: offOrder.giftWrap,
              deliverySlot: offOrder.deliverySlot,
              type: 'online'
            });
          } catch (e) {
            console.error("Error syncing offline order:", e);
          }
        }
        setOfflineOrders([]);
        await syncState();
      };
      syncOfflineOrders();
    }
  }, [offlineMode, offlineOrders, onPlaceOrder, syncState]);

  const submitOrder = async (method: string, splitDetails?: any[]) => {
    setCheckoutError('');
    try {
      if (method === 'Wallet' && currentUser.walletBalance < cartTotal) {
        setCheckoutError(`Prepaid store wallet has insufficient balance. Wallet balance is $${currentUser.walletBalance.toFixed(2)}.`);
        return;
      }

      // Compile Order ticket properties
      const orderData: any = {
        type: offlineMode ? 'offline' : 'online',
        customerId: currentUser.id,
        customerName: currentUser.username,
        branchId: 'branch-downtown',
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        })),
        subtotal: cartSubtotal,
        discount: couponDiscountAmount + parseFloat((loyaltyPointsToRedeem / 10).toFixed(2)),
        tax: cartTax,
        total: cartTotal,
        couponCode: couponCode || undefined,
        paymentMethod: method,
        splitDetails: splitDetails || undefined,
        address: deliveryAddress,
        giftWrap,
        deliverySlot,
        status: offlineMode ? 'completed' : 'pending',
        loyaltyPointsRedeemed: loyaltyPointsToRedeem
      };

      if (offlineMode) {
        // Step 20: Offline simulation checkout
        const stamp = new Date();
        const randNum = Math.floor(100000 + Math.random() * 900000);
        const transactionId = `TXN-OFFLINE-${stamp.getFullYear()}-${randNum}`;
        const invoiceId = `INV-OFFLINE-${stamp.getFullYear()}-${randNum}`;

        const offlineOrderObj: Order = {
          id: `TX-OFF-${Math.floor(10000 + Math.random() * 90000)}`,
          ...orderData,
          transactionId,
          invoiceId,
          fraudScore: 0,
          fraudReason: 'Offline POS Mode - Verified locally by Cashier',
          loyaltyEarned: Math.floor(cartTotal * 0.1),
          loyaltySpent: loyaltyPointsToRedeem,
          offlineSynced: false,
          createdAt: stamp.toISOString()
        };

        setOfflineOrders(prev => [...prev, offlineOrderObj]);
        setLastPlacedOrder(offlineOrderObj);
        setPlacedOrderId(offlineOrderObj.id);
        
        // Deduct wallet locally for immediate UX consistency
        if (method === 'Wallet') {
          currentUser.walletBalance = parseFloat((currentUser.walletBalance - cartTotal).toFixed(2));
        }
      } else {
        // Place order via parent controller
        const createdOrder = await onPlaceOrder(orderData);
        setLastPlacedOrder(createdOrder);
        setPlacedOrderId(createdOrder?.id || `TX-${Math.floor(10000 + Math.random() * 90000)}`);
      }

      setCart([]);
      setStep('confirmation');
      setCouponCode('');
      setCouponDiscount(0);
      setCouponMessage('');
      setLoyaltyPointsToRedeem(0);
    } catch (err) {
      setCheckoutError('Order transmission failed. Please try again.');
    }
  };

  // Order history updates
  const updateOrderStatus = async (orderId: string, status: 'cancelled' | 'returned') => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(`Successfully processed automated ${status.toUpperCase()} request. Database ledger has been adjusted.`);
        await syncState();
      }
    } catch (e) {
      console.error('Error updating order status');
    }
  };

  // Subscriptions
  const toggleSubscription = (id: string) => {
    setSubscriptions(prev => prev.map(sub => sub.id === id ? { ...sub, status: sub.status === 'active' ? 'paused' : 'active' } : sub));
  };

  const createSubscription = (product: Product, freq: string) => {
    const nSub = {
      id: `sub-${Math.random().toString(36).substr(2, 9)}`,
      product,
      frequency: freq,
      status: 'active' as const
    };
    setSubscriptions(prev => [...prev, nSub]);
    alert(`Successfully activated auto-delivery schedule of ${product.name} every ${freq}!`);
  };

  // Submit product reviews
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const newReview = {
        user: currentUser.username,
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toLocaleDateString()
      };

      const reviews = [...(selectedProduct.reviews || []), newReview];
      // Re-calculate average rating
      const rating = parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1));

      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews, rating })
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedProduct(updated);
        setReviewComment('');
        await syncState();
      }
    } catch (err) {
      console.error('Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Wallet and address profile top-ups
  const addShippingAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    const addresses = [...currentUser.addresses, newAddress];
    await onModifyUser(currentUser.id, { addresses });
    setNewAddress('');
    setDeliveryAddress(newAddress);
  };

  const addPaymentCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber.trim()) return;
    const paymentMethods = [...currentUser.paymentMethods, `${newCardType} (${newCardNumber.substr(newCardNumber.length - 4)})`];
    await onModifyUser(currentUser.id, { paymentMethods });
    setNewCardNumber('');
  };

  const topUpWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(topUpAmount);
    if (isNaN(amt) || amt <= 0) return;
    const walletBalance = parseFloat((currentUser.walletBalance + amt).toFixed(2));
    await onModifyUser(currentUser.id, { walletBalance });
    setTopUpAmount('');
    setTopUpSuccess(`✓ Successfully preloaded $${amt.toFixed(2)} to prepaid store ledger!`);
    setTimeout(() => setTopUpSuccess(''), 4000);
  };

  // AI assistant chat bot
  const submitAiQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const userText = aiMessage;
    setAiChat(prev => [...prev, { role: 'user', text: userText }]);
    setAiMessage('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, username: currentUser.username })
      });

      if (res.ok) {
        const data = await res.json();
        setAiChat(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        // Fallback simulated replies
        let mockReply = "I searched our shelves! We currently have Farm Fresh Organic Milk in stock for $3.49, Cage-Free eggs for $4.99, and AeroPro Notebooks for $999.00. Apply code SAVE50 at checkout for discount triggers.";
        if (userText.toLowerCase().includes('laptop') || userText.toLowerCase().includes('computer')) {
          mockReply = "We recommend our premium AeroPro Elite Thin Notebook 14\" ($999.00) under the Electronics segment. It contains 16GB RAM, an octa-core CPU, and is eligible for our SAVE50 coupon code!";
        } else if (userText.toLowerCase().includes('diet') || userText.toLowerCase().includes('healthy')) {
          mockReply = "For healthy diets, look at our Organic Farm Fresh Milk and Cage-Free eggs! Rich in proteins and sourced from local sustainable farms.";
        }
        setAiChat(prev => [...prev, { role: 'model', text: mockReply }]);
      }
    } catch (err) {
      setAiChat(prev => [...prev, { role: 'model', text: "I can suggest diets, laptops, or savings on our catalog! Try asking for healthy items." }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Filter and Sort Catalog products
  const filteredProducts = approvedProducts.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'price-asc') return a.price - b.price;
    if (sortOrder === 'price-desc') return b.price - a.price;
    if (sortOrder === 'rating') return b.rating - a.rating;
    return 0; // Default
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12" id="customer-portal">
      
      {/* Top Header Bar */}
      <header className="bg-slate-900 text-white py-4 px-6 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                RetailMind <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded uppercase font-mono tracking-wider">OS SHOPPER</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">Unified Enterprise Store Environment</p>
            </div>
          </div>

          {/* Quick Universal Search, with mic and camera triggers */}
          <div className="flex-1 max-w-md w-full relative">
            <div className="flex gap-2 bg-slate-800 rounded-xl border border-slate-700/60 p-1.5 items-center">
              <Search className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="Search products, brands or segment codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-white text-xs placeholder-slate-500 focus:outline-none flex-1 py-1"
              />
              <button 
                onClick={triggerVoiceSearch} 
                className={`p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer ${voiceSearchActive ? 'bg-red-600 text-white animate-pulse' : ''}`}
                title="Voice Search Speak"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={triggerImageSearch} 
                className={`p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer ${imageSearchActive ? 'bg-blue-600 text-white animate-pulse' : ''}`}
                title="Image Search Upload"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={triggerBarcodeScan} 
                className={`p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer ${barcodeScanActive ? 'bg-amber-600 text-white animate-pulse' : ''}`}
                title="Scan Item Barcode"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[9px] text-slate-400 block font-mono">SIGNED IN AS</span>
              <span className="text-xs font-bold text-slate-200">{currentUser.username}</span>
            </div>
            <button 
              onClick={onSwitchUser}
              className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg cursor-pointer text-slate-300 hover:text-white"
              title="Switch Accounts"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Network Connectivity Status Bar for Testing Offline POS Billing & Syncing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className={`p-3 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-semibold ${
          offlineMode 
            ? 'bg-amber-50 border-amber-200 text-amber-800 shadow-sm' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full block ${offlineMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <div>
              <span>Connection Status: <strong className="uppercase">{offlineMode ? 'OFFLINE SIMULATOR (Local Cache Active)' : 'ONLINE SECURE LEDGER'}</strong></span>
              {offlineOrders.length > 0 && (
                <span className="bg-amber-600 text-white font-bold font-mono px-2 py-0.5 rounded text-[10px] ml-2 animate-bounce inline-block">
                  {offlineOrders.length} Unsynced Offline Orders Queued
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono">Test Offline POS:</span>
            <button
              onClick={onToggleOffline}
              className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black cursor-pointer shadow-sm transition-all duration-150 ${
                offlineMode 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {offlineMode ? '🔌 Restore Network (Auto-Sync)' : '🔌 Simulate Offline Interruption'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Side Navigation, Right Side Core Panel Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Side Panel Navigation & AI chat helper bot */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-col gap-1.5 text-xs">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase px-3 py-1.5 tracking-wider block">Shopper Dashboard</span>
            
            {[
              { id: 'home', label: '🏠 Amazon Home Page', icon: Home },
              { id: 'browse', label: '🛍️ Browse Catalog', icon: ShoppingBag },
              { id: 'wishlist', label: '❤️ Wishlist Tracker', icon: Heart },
              { id: 'orders', label: '📋 Web Orders & GPS', icon: History, badge: myOrders.length },
              { id: 'subscriptions', label: '🔄 Recurring Deliveries', icon: Calendar },
              { id: 'ai-tools', label: '✨ AI Intelligent Tools', icon: Sparkles },
              { id: 'support', label: '💬 Customer Help Desk', icon: HelpCircle },
              { id: 'profile', label: '👤 Profile & Loyalty', icon: UserCheck }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setStep('browse'); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" /> {tab.label}
                  </span>
                  {tab.badge !== undefined && (
                    <span className="font-mono bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded text-[9px]">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Chat Assist */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 flex flex-col h-[340px]">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5 mb-3">
              <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              </span>
              <div>
                <h3 className="font-bold text-xs text-slate-100 uppercase tracking-wider">AI Copilot Chat</h3>
                <p className="text-[9px] text-slate-500">Ask about models, diet codes & discount rules</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1 scrollbar-thin">
              {aiChat.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] text-slate-500 mb-0.5">{msg.role === 'user' ? 'You' : 'Copilot AI'}</span>
                  <div className={`p-2 rounded-lg break-words max-w-[90%] text-[10.5px] ${
                    msg.role === 'user' ? 'bg-[#3B82F6] text-white rounded-tr-none' : 'bg-slate-800 text-slate-300 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && <div className="text-[10px] text-slate-400 italic font-mono animate-pulse">Copilot is researching stock catalogs...</div>}
            </div>

            <form onSubmit={submitAiQuestion} className="mt-3 flex gap-2 border-t border-slate-800 pt-3">
              <input
                type="text"
                placeholder="Ask e.g. recommend proteins..."
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                className="flex-1 bg-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none placeholder-slate-500 border border-transparent focus:border-blue-500"
              />
              <button type="submit" className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Right column: Active view page content frame */}
        <div className="lg:col-span-3 space-y-6">

          {/* TAB: AMAZON HOME PAGE */}
          {activeTab === 'home' && (
            <CustomerHome 
              products={products}
              onAddToCart={addToCart}
              onSelectProduct={setSelectedProduct}
              onSelectCategory={(cat) => { setSelectedCategory(cat); setActiveTab('browse'); }}
              currentUser={currentUser}
            />
          )}

          {/* TAB: CATALOG BROWSER AND SHOPPING CART BROWSE STEP */}
          {activeTab === 'browse' && (
            <>
              {step === 'browse' && (
                <div className="space-y-6">
                  
                  {/* Category badging */}
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                    {['All', 'Groceries', 'Electronics'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer border ${
                          selectedCategory.toLowerCase() === cat.toLowerCase() || (selectedCategory === 'All' && cat === 'All')
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Filter and Sort bar */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <span className="text-xs text-slate-500 font-mono font-bold">
                      DISPLAYING {sortedProducts.length} SYSTEM APPROVED ITEMS
                    </span>

                    <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer text-slate-600"
                      >
                        <option value="default">Default Catalog Sorting</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating">Top Rated Stars First</option>
                      </select>

                      <button 
                        onClick={() => setStep('cart')}
                        className="ml-auto sm:ml-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer text-xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-amber-400" /> Cart ({cart.reduce((a, c) => a + c.quantity, 0)})
                      </button>
                    </div>
                  </div>

                  {/* Product Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {sortedProducts.map(prod => {
                      const isWishlisted = wishlist.some(p => p.id === prod.id);
                      const isOrganic = prod.name.toLowerCase().includes('organic');
                      return (
                        <div key={prod.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                          
                          {/* Image container & badging */}
                          <div className="relative bg-slate-100 h-44 overflow-hidden group">
                            <img src={prod.images[0]} referrerPolicy="no-referrer" alt={prod.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            
                            <button
                              onClick={() => toggleWishlist(prod)}
                              className="absolute top-2.5 right-2.5 p-1.5 bg-white/80 backdrop-blur-xs rounded-full shadow-sm hover:bg-white text-rose-500 cursor-pointer"
                              title="Add to Wishlist"
                            >
                              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                            </button>

                            {isOrganic && (
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[8px] font-bold uppercase rounded flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-600 animate-pulse" /> Eco-Organic
                              </span>
                            )}
                          </div>

                          {/* Details */}
                          <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between text-xs">
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wide block font-mono">{prod.category}</span>
                              <h3 onClick={() => setSelectedProduct(prod)} className="font-bold text-slate-800 hover:text-blue-600 hover:underline cursor-pointer line-clamp-1">{prod.name}</h3>
                              <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">{prod.description}</p>
                            </div>

                            <div className="space-y-3 pt-2">
                              {/* Ratings */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                                  <span className="font-bold text-slate-700">{prod.rating}</span>
                                  <span className="text-[10px] text-slate-400">({prod.reviews ? prod.reviews.length : 0})</span>
                                </div>
                                <span className={`font-bold ${prod.stock < 10 ? 'text-red-500' : 'text-slate-400'} font-mono text-[10px]`}>
                                  {prod.stock < 10 ? `Only ${prod.stock} left!` : 'In stock'}
                                </span>
                              </div>

                              {/* Price & Buy triggers */}
                              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                                <span className="font-mono font-black text-slate-800 text-sm">${prod.price}</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setSelectedProduct(prod)}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer"
                                    title="View Specs"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => addToCart(prod)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* CHECKOUT CART BAG VIEW STEP */}
              {step === 'cart' && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                      <ShoppingCart className="w-4.5 h-4.5 text-blue-600" /> Secure Checkout Bag
                    </h2>
                    <button 
                      onClick={() => setStep('browse')}
                      className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
                    >
                      Back to Catalog
                    </button>
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto animate-bounce" />
                      <h4 className="font-bold text-slate-700 text-xs">Your bag is empty!</h4>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">Browse the shelves and load grocery ingredients or tech items into your cart.</p>
                      <button onClick={() => setStep('browse')} className="bg-blue-600 text-white text-[11px] px-4 py-2 rounded-lg font-bold cursor-pointer">Go Shopping</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                      
                      {/* Cart Items list */}
                      <div className="lg:col-span-2 space-y-4">
                        {cart.map(item => (
                          <div key={item.product.id} className="flex items-center gap-4 p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                            <img src={item.product.images[0]} referrerPolicy="no-referrer" alt={item.product.name} className="w-14 h-14 object-cover rounded-lg bg-white border border-slate-200" />
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-extrabold text-slate-800 truncate">{item.product.name}</h4>
                              <span className="text-[10px] text-slate-400 font-mono">${item.product.price} each</span>
                            </div>

                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
                              <button onClick={() => updateQty(item.product.id, -1)} className="p-0.5 text-slate-500 hover:bg-slate-100 rounded cursor-pointer"><Minus className="w-3 h-3" /></button>
                              <span className="font-mono font-bold text-slate-700 px-1">{item.quantity}</span>
                              <button onClick={() => updateQty(item.product.id, 1)} className="p-0.5 text-slate-500 hover:bg-slate-100 rounded cursor-pointer"><Plus className="w-3 h-3" /></button>
                            </div>

                            <span className="font-mono font-black text-slate-800 text-right min-w-[50px]">${(item.product.price * item.quantity).toFixed(2)}</span>
                            
                            <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-slate-400 hover:text-red-500 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Invoice totals & Coupon */}
                      <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 space-y-4 h-fit">
                        <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Order Pricing Summary</h3>
                        
                        <div className="space-y-2 border-b border-slate-200 pb-3 font-mono text-[11px] text-slate-500">
                          <div className="flex justify-between"><span>Items Subtotal:</span><span>${cartSubtotal.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>GST Sim Tax (8%):</span><span>${cartTax.toFixed(2)}</span></div>
                          {couponDiscountAmount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-bold">
                              <span>Promo discount:</span><span>-${couponDiscountAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-black text-slate-800 text-xs border-t border-slate-200/60 pt-2.5">
                            <span>Grand Total:</span><span className="text-blue-600">${cartTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Coupon entry */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Enter Promo Coupon:</span>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              placeholder="e.g. SAVE50"
                              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs flex-1 uppercase focus:outline-none focus:border-blue-500"
                            />
                            <button onClick={applyCoupon} className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer">Apply</button>
                          </div>
                          {couponMessage && <p className="text-[10px] text-blue-600 font-bold">{couponMessage}</p>}
                        </div>

                        {/* Loyalty points entry */}
                        {currentUser.loyaltyPoints > 0 && (
                          <div className="space-y-1.5 pt-3 border-t border-slate-200">
                            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                              <span>Redeem Loyalty Points:</span>
                              <span className="text-blue-600 font-extrabold">{currentUser.loyaltyPoints} Available</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex gap-1.5 items-center">
                                <input
                                  type="range"
                                  min={0}
                                  max={currentUser.loyaltyPoints}
                                  step={10}
                                  value={loyaltyPointsToRedeem}
                                  onChange={(e) => setLoyaltyPointsToRedeem(parseInt(e.target.value) || 0)}
                                  className="flex-1 accent-blue-600 cursor-pointer"
                                />
                                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                                  {loyaltyPointsToRedeem} pts
                                </span>
                              </div>
                              <p className="text-[9.5px] text-slate-400">
                                Converts to <strong className="text-emerald-600">-${(loyaltyPointsToRedeem / 10).toFixed(2)}</strong> discount (10 pts = $1).
                              </p>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleCheckout}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg tracking-wider transition-colors shadow-xs cursor-pointer"
                        >
                          Proceed to secure payment
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* SECURED MULTI-STEP CHECKOUT (ADDRESS & PAYMENTS CHANNELS) */}
              {step === 'checkout' && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3">Secured Direct Checkout Settlement</h2>
                  
                  {checkoutError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg text-xs font-semibold flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>{checkoutError}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    
                    {/* Deliver and Slot pickers */}
                    <div className="md:col-span-1 space-y-4 border-r border-slate-100 pr-3">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-500 uppercase text-[9px] block">Shipping Address:</label>
                        <select
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer"
                        >
                          {currentUser.addresses.map((addr, idx) => (
                            <option key={idx} value={addr}>{addr}</option>
                          ))}
                          <option value="Self Pickup - Downtown Branch">Self Pickup - Downtown HQ Superstore</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-500 uppercase text-[9px] block">Delivery Slot Selection:</label>
                        <select
                          value={deliverySlot}
                          onChange={(e) => setDeliverySlot(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="Today 4:00 PM - 7:00 PM">Today (4:00 PM - 7:00 PM)</option>
                          <option value="Tomorrow 10:00 AM - 1:00 PM">Tomorrow Morning (10:00 AM - 1:00 PM)</option>
                          <option value="Tomorrow 2:00 PM - 5:00 PM">Tomorrow Afternoon (2:00 PM - 5:00 PM)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="giftWrap"
                          checked={giftWrap}
                          onChange={(e) => setGiftWrap(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded"
                        />
                        <label htmlFor="giftWrap" className="font-bold text-slate-600 cursor-pointer flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5 text-pink-500" /> Premium Gift Wrapping (Free Trial)
                        </label>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-[11px] font-mono space-y-1">
                        <span className="font-bold text-slate-500 uppercase text-[9px] block">Pricing:</span>
                        <div className="flex justify-between"><span>Subtotal:</span><span>${cartSubtotal.toFixed(2)}</span></div>
                        {couponDiscountAmount > 0 && <div className="flex justify-between text-emerald-600"><span>Coupon Disc:</span><span>-${couponDiscountAmount.toFixed(2)}</span></div>}
                        <div className="flex justify-between font-bold text-slate-700 border-t border-slate-200 pt-1"><span>Combined Due:</span><span className="text-blue-600">${cartTotal.toFixed(2)}</span></div>
                      </div>
                    </div>

                    {/* Interactive Payments Gateway */}
                    <div className="md:col-span-2">
                      <CustomerPayments 
                        cartTotal={cartTotal}
                        currentUser={currentUser}
                        onCancel={() => setStep('cart')}
                        onPaymentComplete={(method, splitDetails) => submitOrder(method, splitDetails)}
                      />
                    </div>

                  </div>
                </div>
              )}

              {/* CONFIRMATION INVOICE STEP */}
              {step === 'confirmation' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-md max-w-lg mx-auto space-y-6">
                  
                  {/* Success Header */}
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-800">Direct Checkout Successful!</h2>
                      <p className="text-slate-400 text-[11px]">Your transaction has posted and validated successfully through RetailMind gateway.</p>
                    </div>
                    
                    {offlineMode ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                        ⚠️ OFFLINE POS MODE QUEUED (LOCAL MEMORY CACHE)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ⚡ SECURE ONLINE TRANSACTION COMPLETED
                      </span>
                    )}
                  </div>

                  {/* Dynamic Interactive Email sent banner */}
                  {emailSentToast && (
                    <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-[11px] font-semibold flex items-center justify-between animate-fade-in">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600 animate-pulse" />
                        <span>Receipt successfully mailed to registered customer mailbox!</span>
                      </div>
                      <button onClick={() => setEmailSentToast(false)} className="font-bold text-blue-500 hover:text-blue-700">×</button>
                    </div>
                  )}

                  {/* Complete Commercial Billing Paper Invoice */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 font-mono text-left text-[11px] space-y-3 relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500" />
                    
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-[12px] uppercase tracking-wide">RETAILMIND OS CORP</h4>
                        <span className="text-[9px] text-slate-400 block">Downtown Mega Superstore Branch</span>
                      </div>
                      <span className="text-[10px] bg-slate-200/80 text-slate-700 px-2.5 py-0.5 rounded font-black uppercase">
                        {lastPlacedOrder?.paymentMethod || 'UPI'}
                      </span>
                    </div>

                    <div className="space-y-1.5 border-b border-slate-200/60 pb-3">
                      <div className="flex justify-between text-slate-500">
                        <span>Invoice Number:</span>
                        <span className="text-slate-800 font-bold">{lastPlacedOrder?.invoiceId || 'INV-2026-PENDING'}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Transaction Hash:</span>
                        <span className="text-slate-800 font-bold truncate max-w-[180px]">{lastPlacedOrder?.transactionId || 'TXN-PENDING-LEDGER'}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Date Timestamp:</span>
                        <span className="text-slate-800">{lastPlacedOrder ? new Date(lastPlacedOrder.createdAt).toLocaleString() : new Date().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Target Address:</span>
                        <span className="text-slate-800 font-semibold truncate max-w-[180px]">{lastPlacedOrder?.address || deliveryAddress}</span>
                      </div>
                    </div>

                    {/* Bought Items list on receipt */}
                    <div className="space-y-1.5 py-1 border-b border-slate-200/60">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">BILLABLE ITEMS</span>
                      {lastPlacedOrder?.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-700">
                          <span>{item.name} <span className="text-slate-400">x{item.quantity}</span></span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Totals and GST tax */}
                    <div className="space-y-1.5 pt-2 border-b border-slate-200/60 pb-3">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal:</span>
                        <span>${lastPlacedOrder?.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>GST Commercial Tax (8.00%):</span>
                        <span>${lastPlacedOrder?.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discounts Deduct:</span>
                        <span>-${lastPlacedOrder?.discount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-black text-slate-900 text-xs pt-1">
                        <span>NET TOTAL PAID:</span>
                        <span className="text-blue-600 font-mono">${lastPlacedOrder?.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Connected state indicators: Loyalty earned, AI Fraud Pass */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded p-2 text-center">
                        <span className="text-slate-400 block text-[8px] uppercase font-bold">Loyalty Points Accrued</span>
                        <strong className="text-emerald-700 text-[11px] font-black">+{lastPlacedOrder?.loyaltyEarned || 0} pts</strong>
                      </div>
                      <div className="bg-blue-50/50 border border-blue-100 rounded p-2 text-center">
                        <span className="text-slate-400 block text-[8px] uppercase font-bold">AI Fraud Heuristics</span>
                        <span className="inline-flex items-center gap-1 text-blue-700 text-[10px] font-black">
                          🛡️ {lastPlacedOrder?.fraudScore || 5}% Risk [SAFE]
                        </span>
                      </div>
                    </div>

                    {/* Barcode Mock */}
                    <div className="pt-3 border-t border-slate-200/60 flex flex-col items-center gap-1">
                      <div className="flex gap-0.5 h-6 w-full max-w-[150px] items-stretch justify-center opacity-70">
                        {Array.from({ length: 28 }).map((_, i) => (
                          <div key={i} className={`bg-slate-900 ${i % 3 === 0 ? 'w-[1px]' : i % 5 === 0 ? 'w-[3px]' : 'w-[2px]'}`} />
                        ))}
                      </div>
                      <span className="text-[8px] text-slate-400 font-bold">TX-{lastPlacedOrder?.invoiceId?.split('-')[2] || '4421'}</span>
                    </div>
                  </div>

                  {/* Actions row: Download Invoice, Mail Receipt, Track, Return */}
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <button 
                        onClick={() => {
                          if (!lastPlacedOrder) return;
                          const itemsText = lastPlacedOrder.items.map(it => ` - ${it.name} x ${it.quantity} @ $${it.price}`).join('\n');
                          const receiptContent = `=============================================\n             RETAILMIND OS RECEIPT           \n=============================================\nInvoice ID:       ${lastPlacedOrder.invoiceId || lastPlacedOrder.id}\nTransaction ID:   ${lastPlacedOrder.transactionId || 'N/A'}\nDate Created:     ${new Date(lastPlacedOrder.createdAt).toLocaleString()}\nPayment Method:   ${lastPlacedOrder.paymentMethod}\nConnection Mode:  ${lastPlacedOrder.type.toUpperCase()}\n---------------------------------------------\nITEMS:\n${itemsText}\n---------------------------------------------\nSubtotal:         $${lastPlacedOrder.subtotal.toFixed(2)}\nGST Sim Tax (8%): $${lastPlacedOrder.tax.toFixed(2)}\nDiscount:         -$${lastPlacedOrder.discount.toFixed(2)}\nTOTAL PAID:       $${lastPlacedOrder.total.toFixed(2)}\n---------------------------------------------\nLoyalty Earned:   +${lastPlacedOrder.loyaltyEarned || 0} Points\nAI Fraud Rating:  ${lastPlacedOrder.fraudScore || 5}% [SAFE]\n---------------------------------------------\nThank you for shopping with RetailMind!\n=============================================\n`;
                          const element = document.createElement("a");
                          const file = new Blob([receiptContent], {type: 'text/plain'});
                          element.href = URL.createObjectURL(file);
                          element.download = `invoice-${lastPlacedOrder.invoiceId || lastPlacedOrder.id}.txt`;
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                        }}
                        className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-lg border border-slate-200 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Receipt (.TXT)
                      </button>
                      <button 
                        onClick={() => {
                          setEmailSentToast(true);
                          setTimeout(() => setEmailSentToast(false), 5000);
                        }}
                        className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-lg border border-slate-200 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" /> Email PDF Invoice
                      </button>
                    </div>

                    <div className="flex justify-center gap-2 pt-1 text-xs">
                      <button 
                        onClick={() => { setActiveTab('orders'); setStep('browse'); }}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        Track Route Map <ArrowRight className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setStep('browse')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Buy More Products
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </>
          )}

          {/* TAB: WISHLIST TRACKER */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Heart className="w-4.5 h-4.5 text-rose-500 fill-current" /> Saved Wishlist Items
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Products you saved for later purchase or comparison.</p>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Wishlist link successfully generated! Copied to clipboard.');
                  }}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share List
                </button>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-xs">Your wishlist is empty!</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">Click the heart button on any product in our browser catalog to save it here.</p>
                  <button onClick={() => setActiveTab('browse')} className="bg-blue-600 text-white text-[11px] px-4 py-2 rounded-lg font-bold cursor-pointer">Explore Catalog</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {wishlist.map(prod => (
                    <div key={prod.id} className="flex gap-4 p-3 border border-slate-100 rounded-lg bg-slate-50/40 items-center hover:shadow-xs transition-shadow">
                      <img src={prod.images[0]} alt={prod.name} referrerPolicy="no-referrer" className="w-16 h-16 object-cover rounded bg-white border border-slate-200" />
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-extrabold text-slate-800 truncate">{prod.name}</h4>
                        <span className="font-mono font-black text-blue-600 block">${prod.price}</span>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => moveWishlistToCart(prod)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded font-bold cursor-pointer text-[10px] flex items-center gap-1"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                        </button>
                        <button
                          onClick={() => toggleWishlist(prod)}
                          className="text-slate-400 hover:text-red-500 font-semibold text-[10px] text-center"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ORDERS, RETURNS, DEFECTIVE CLAIMS, MAP OVERLAYS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              
              {/* If active tracking map overlay is visible */}
              {trackingOrder && (
                <CustomerMapTracker 
                  order={trackingOrder}
                  onClose={() => setTrackingOrder(null)}
                />
              )}

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-1.5">
                      <History className="w-4.5 h-4.5 text-blue-600" /> Web Orders & GPS Tracker
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Track shipping routes, request automated refunds, or file defective claims.</p>
                  </div>
                </div>

                {myOrders.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-700 text-xs">No orders logged</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">You haven't placed any online checkout transactions yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    {myOrders.map(order => {
                      const isPending = order.status === 'pending';
                      const isProcessing = order.status === 'processing';
                      const isCompleted = order.status === 'completed';
                      const isCancelled = order.status === 'cancelled';
                      const isReturned = order.status === 'returned';

                      return (
                        <div key={order.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/30 hover:bg-white transition-all">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <div className="space-y-0.5">
                              <span className="font-mono font-bold text-slate-800">{order.id}</span>
                              <p className="text-[9px] text-slate-400">Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>

                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              order.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              order.status === 'cancelled' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                              'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          {/* Items */}
                          <div className="bg-white border border-slate-100 rounded-lg p-2.5 font-mono text-[10px] space-y-1 text-slate-500">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>• {it.quantity}x {it.name}</span>
                                <span>${(it.price * it.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between font-bold text-[11px] text-slate-700">
                            <span>Settled via: {order.paymentMethod}</span>
                            <span className="font-mono">Total Paid: ${order.total.toFixed(2)}</span>
                          </div>

                          {/* Interactive triggers */}
                          <div className="flex gap-1.5 justify-end border-t border-slate-100 pt-2.5">
                            {/* GPS Tracking button */}
                            {!isCancelled && !isReturned && (
                              <button
                                onClick={() => setTrackingOrder(order)}
                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Map className="w-3.5 h-3.5" /> Track Route Map
                              </button>
                            )}

                            {/* Automated cancellation */}
                            {(isPending || isProcessing) && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Cancel Order
                              </button>
                            )}

                            {/* Return Refund */}
                            {isCompleted && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'returned')}
                                className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Request Refund
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: RECURRING SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-1.5">
                  <Calendar className="w-4.5 h-4.5 text-blue-600" /> Recurring Essentials Subscriptions
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Subscribe to milk, vegetables or supplies with automated deliveries.</p>
              </div>

              <div className="space-y-4 text-xs">
                {subscriptions.map(sub => (
                  <div key={sub.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3.5 border border-slate-100 bg-slate-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={sub.product.images[0]} alt={sub.product.name} referrerPolicy="no-referrer" className="w-11 h-11 object-cover rounded bg-white border border-slate-200" />
                      <div>
                        <h4 className="font-extrabold text-slate-800">{sub.product.name}</h4>
                        <span className="text-[10px] text-slate-400 block">Frequency: {sub.frequency}</span>
                        <span className="text-[10px] text-blue-600 font-bold block">${sub.product.price} / delivery</span>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        sub.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {sub.status}
                      </span>
                      <button
                        onClick={() => toggleSubscription(sub.id)}
                        className={`px-3 py-1.5 rounded font-bold text-[10px] cursor-pointer border ${
                          sub.status === 'active' ? 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200' : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                        }`}
                      >
                        {sub.status === 'active' ? 'Pause Subscription' : 'Resume'}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Quickly Subscribe tools */}
                <div className="bg-slate-950 text-white rounded-xl p-4 space-y-3.5">
                  <h4 className="font-extrabold text-xs flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-blue-400 animate-pulse" /> Fast Subscription Presets</h4>
                  <p className="text-[11px] text-slate-400">Instantly activate recurring same-day early morning dispatches:</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { prodId: 'prod-milk', label: 'Fresh Milk Daily Dispatch', freq: 'Daily morning' },
                      { prodId: 'prod-eggs', label: 'Protein eggs weekly pack', freq: 'Weekly' }
                    ].map(p => {
                      const prod = approvedProducts.find(item => item.id === p.prodId);
                      if (!prod) return null;
                      return (
                        <div key={p.prodId} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex justify-between items-center">
                          <div>
                            <span className="font-extrabold block text-slate-200">{p.label}</span>
                            <span className="text-[9px] text-slate-500 block">Instantly schedule at current price</span>
                          </div>
                          <button
                            onClick={() => createSubscription(prod, p.freq)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded text-[9px] tracking-wide cursor-pointer transition-colors"
                          >
                            Activate Auto
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: AI TOOLS */}
          {activeTab === 'ai-tools' && (
            <CustomerAiTools 
              products={products}
              onAddToCart={addToCart}
              currentUser={currentUser}
            />
          )}

          {/* TAB: CUSTOMER HELP HUB SUPPORT */}
          {activeTab === 'support' && (
            <CustomerSupport />
          )}

          {/* TAB: PROFILE & LOYALTY WALLET */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Wallet top up and loyalty */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <Wallet className="w-4.5 h-4.5 text-blue-600" /> Shopper Prepaid Loyalty Wallet
                </h3>

                {/* Loyalty Tier Progress */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-700">Account Tier Rank:</span>
                    <span className="bg-blue-100 text-[#1E40AF] font-bold px-2 py-0.5 rounded text-[9px]">{currentUser.membership} Tier</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{currentUser.loyaltyPoints} Reward points earned</span>
                      <span>Next Tier: 1500 Points</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, (currentUser.loyaltyPoints / 1500) * 100)}%` }} />
                    </div>
                  </div>
                </div>

                <form onSubmit={topUpWallet} className="space-y-3">
                  <span className="font-bold text-slate-500 uppercase text-[9px] block">Top Up Prepaid Funds:</span>
                  
                  {topUpSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg font-bold">
                      {topUpSuccess}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 font-mono">$</span>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 rounded-lg cursor-pointer transition-colors">
                      Preload Wallet
                    </button>
                  </div>
                </form>
              </div>

              {/* Shipping address manager */}
              <div className="space-y-6">
                
                {/* Address manager */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                    <MapPin className="w-4.5 h-4.5 text-blue-600" /> Address Location Manager
                  </h3>

                  <div className="space-y-1.5">
                    {currentUser.addresses.map((addr, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-600 flex justify-between items-center">
                        <span className="truncate pr-1">{addr}</span>
                        {i === 0 && <span className="text-[8px] bg-blue-100 text-blue-800 px-1 rounded uppercase font-bold shrink-0">Default</span>}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={addShippingAddress} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Add new shipping destination..."
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 rounded-lg cursor-pointer transition-all">Add</button>
                  </form>
                </div>

                {/* Saved cards manager */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                    <CreditCard className="w-4.5 h-4.5 text-blue-600" /> Saved Payment Accounts
                  </h3>

                  <div className="space-y-1.5">
                    {currentUser.paymentMethods.map((pm, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-600 flex justify-between items-center font-mono">
                        <span>{pm}</span>
                        <span className="text-emerald-600 font-bold text-[9px] uppercase">Active</span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={addPaymentCard} className="flex gap-1.5">
                    <select
                      value={newCardType}
                      onChange={(e) => setNewCardType(e.target.value)}
                      className="bg-slate-100 border border-slate-200 rounded-lg px-2 text-xs text-slate-600 focus:outline-none cursor-pointer"
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Card number e.g. 4111 2222..."
                      value={newCardNumber}
                      onChange={(e) => setNewCardNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 rounded-lg cursor-pointer">Save</button>
                  </form>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* FULL WIDTH DYNAMIC SPECIFICATION AND RATING REVIEW PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 text-xs scrollbar-thin">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">{selectedProduct.category}</span>
                <h3 className="font-extrabold text-[#0F172A] text-sm mt-0.5">{selectedProduct.name}</h3>
              </div>
              <button 
                onClick={() => { setSelectedProduct(null); setReviewComment(''); }} 
                className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1 rounded font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Grid specs info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <img src={selectedProduct.images[0]} referrerPolicy="no-referrer" alt={selectedProduct.name} className="w-full h-48 object-cover rounded-xl border border-slate-200 bg-slate-50" />
                <p className="text-slate-500 leading-relaxed text-[11px]">{selectedProduct.description}</p>
                <div className="text-sm font-mono font-black text-blue-600">${selectedProduct.price}</div>
              </div>

              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1.5">
                  Technical Specifications
                </h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-1 text-slate-500"><span className="font-semibold">Segment Category:</span><span>{selectedProduct.category}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1 text-slate-500"><span className="font-semibold">Product Serial Barcode:</span><span className="font-mono">{selectedProduct.barcode}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1 text-slate-500"><span className="font-semibold">Assigned QR Ticket:</span><span className="font-mono">{selectedProduct.qrCode}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1 text-slate-500"><span className="font-semibold">Minimum Safety Stock:</span><span>{selectedProduct.minStockLevel} units</span></div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-500 text-[10px] block">CUSTOM FEATURES MATRIX:</span>
                  {Object.entries(selectedProduct.specifications || {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between bg-slate-50 border border-slate-100 rounded p-2 text-slate-600">
                      <span className="font-bold capitalize">{k}:</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer text-xs"
                >
                  <ShoppingCart className="w-4 h-4" /> Load Item into Checkout Bag
                </button>
              </div>

            </div>

            {/* Ratings and reviews section */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-current" /> Shopper Ratings and Reviews ({selectedProduct.reviews ? selectedProduct.reviews.length : 0})
              </h4>

              {/* Submit new rating */}
              <form onSubmit={handleReviewSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3" id="write-product-review">
                <span className="font-extrabold text-slate-700 text-[11px] block">Write a Verified Customer Review:</span>
                
                <div className="flex gap-4 items-center">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setReviewRating(val)}
                        className="text-lg cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star className={`w-5 h-5 ${reviewRating >= val ? 'text-amber-400 fill-current' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="font-bold text-slate-500 font-mono">{reviewRating} out of 5 Stars</span>
                </div>

                <div className="space-y-1.5">
                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your user experience, delivery speed or packaging details..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  {submittingReview ? 'Submitting review...' : 'Submit Verified Review'}
                </button>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                  selectedProduct.reviews.map((rev, i) => (
                    <div key={i} className="p-3 border border-slate-100 rounded-lg space-y-1 bg-slate-50/20">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{rev.user}</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, rIdx) => (
                            <Star key={rIdx} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-500 italic">"{rev.comment}"</p>
                      <span className="text-[9px] text-slate-400 block font-mono">{rev.date}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-[11px] text-center py-4 bg-slate-50 border border-slate-150 rounded-xl">No reviews submitted yet for this product. Be the first to share your experience!</p>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
