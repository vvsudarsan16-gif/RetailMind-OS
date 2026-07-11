import React, { useState, useEffect } from 'react';
import { 
  Map, Navigation, Phone, CheckCircle, Truck, Package, Clock, AlertCircle, RefreshCw 
} from 'lucide-react';
import { Order } from '../../types';

interface CustomerMapTrackerProps {
  order: Order;
  onClose: () => void;
}

export default function CustomerMapTracker({ order, onClose }: CustomerMapTrackerProps) {
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(15);
  const [statusMessage, setStatusMessage] = useState('Leaving Warehouse Depot...');

  // Animate the truck moving along the route
  useEffect(() => {
    setProgress(0);
    setEta(15);
    setStatusMessage('Preparing cargo at Downtown branch...');

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setStatusMessage('Driver has successfully delivered cargo!');
          setEta(0);
          return 100;
        }

        const next = prev + 5;
        // Update messages based on location
        if (next < 25) {
          setStatusMessage('Leaving Warehouse. Driving past Central Avenue...');
          setEta(12);
        } else if (next < 50) {
          setStatusMessage('Crossing Main Street Intersection. Navigating traffic...');
          setEta(8);
        } else if (next < 75) {
          setStatusMessage('Out on Maple Lane. Approaching destination area...');
          setEta(4);
        } else if (next < 95) {
          setStatusMessage('Vehicle pulled up at gate. Courier is arriving with package...');
          setEta(1);
        } else {
          setStatusMessage('Order completed. Thank you for shopping!');
          setEta(0);
        }
        return next;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [order.id]);

  // SVG Coordinates for the route path (making a nice zig-zag path across our city grid)
  const pathData = "M 30,220 C 30,120 120,120 120,70 C 120,20 220,20 220,120 C 220,220 310,220 310,120 L 310,30";

  // Calculate truck current coordinates based on progress along path length
  // We can approximate a visual point along the grid to keep it lightweight & responsive!
  const getTruckCoordinates = (prog: number) => {
    // Zig zag approximation for coordinates on a 340 x 240 grid
    if (prog < 25) {
      const p = prog / 25;
      return { x: 30 + p * 40, y: 220 - p * 60 };
    } else if (prog < 50) {
      const p = (prog - 25) / 25;
      return { x: 70 + p * 50, y: 160 - p * 60 };
    } else if (prog < 75) {
      const p = (prog - 50) / 25;
      return { x: 120 + p * 100, y: 100 + p * 60 };
    } else {
      const p = (prog - 75) / 25;
      return { x: 220 + p * 90, y: 160 - p * 130 };
    }
  };

  const truckPos = getTruckCoordinates(progress);

  const agent = {
    name: "Johnathan Miller",
    phone: "+1 (555) 923-8120",
    vehicle: "EV-Van #093 - Clean Transit",
    rating: "4.92 ★",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-md space-y-4 max-w-lg mx-auto" id="live-map-tracker">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full uppercase">GPS Tracking</span>
          <h3 className="font-extrabold text-slate-800 text-sm mt-1">Order Ref: {order.id}</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer bg-slate-100 px-2.5 py-1 rounded"
        >
          Close Map
        </button>
      </div>

      {/* Grid: Map left, Live Telemetry right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Animated Map SVG Canvas */}
        <div className="md:col-span-2 relative bg-slate-50 border border-slate-200 rounded-lg overflow-hidden h-[240px] flex items-center justify-center">
          
          {/* Custom City Grid Background Patterns */}
          <svg className="absolute inset-0 w-full h-full text-slate-200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Styled roads */}
            <path d="M 30,220 L 30,160 L 120,160 L 120,70 L 220,70 L 220,160 L 310,160 L 310,30" fill="none" stroke="#E2E8F0" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 30,220 L 30,160 L 120,160 L 120,70 L 220,70 L 220,160 L 310,160 L 310,30" fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Warehouse start point */}
            <g transform="translate(30, 220)">
              <circle r="14" fill="#3B82F6" className="opacity-20 animate-ping" />
              <circle r="8" fill="#1E40AF" />
              <rect x="-4" y="-4" width="8" height="8" fill="white" />
            </g>

            {/* Customer destination house */}
            <g transform="translate(310, 30)">
              <circle r="14" fill="#10B981" className="opacity-20 animate-ping" />
              <circle r="8" fill="#047857" />
              <polygon points="0,-6 -6,0 6,0" fill="white" />
              <rect x="-4" y="0" width="8" height="6" fill="white" />
            </g>

            {/* Delivery truck moving point */}
            <g transform={`translate(${truckPos.x}, ${truckPos.y})`}>
              <circle r="16" fill="#F59E0B" className="opacity-30 animate-pulse" />
              <circle r="10" fill="#D97706" />
              {/* Simple arrow/truck indicator */}
              <circle r="4" fill="white" />
            </g>
          </svg>

          {/* Map labels */}
          <span className="absolute bottom-2 left-2 text-[8px] bg-slate-900/80 text-slate-300 px-1.5 py-0.5 rounded font-mono">DEPOT WAREHOUSE</span>
          <span className="absolute top-2 right-2 text-[8px] bg-slate-900/80 text-emerald-400 px-1.5 py-0.5 rounded font-mono">YOUR HOME</span>

          {/* Route progress line indicator */}
          <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white font-mono text-[9px] px-2 py-1 rounded">
            Route: {progress}% Done
          </div>
        </div>

        {/* Live Status Telemetry & Agent Profile card */}
        <div className="space-y-3.5 flex flex-col justify-between text-xs">
          
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Live Status:</span>
            <p className="font-bold text-slate-800 leading-snug flex items-start gap-1">
              <Navigation className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5 animate-spin" />
              <span>{statusMessage}</span>
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-[11px] space-y-1 font-mono">
              <div className="flex justify-between"><span>ETA remaining:</span><span className="text-blue-600 font-bold">{eta} mins</span></div>
              <div className="flex justify-between"><span>Speed:</span><span>24 mph</span></div>
              <div className="flex justify-between"><span>Distance left:</span><span>{((100 - progress) / 30).toFixed(1)} miles</span></div>
            </div>
          </div>

          {/* Delivery Courier Contact Card */}
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <img src={agent.avatar} alt={agent.name} referrerPolicy="no-referrer" className="w-9 h-9 object-cover rounded-full border border-blue-200 bg-white" />
              <div className="min-w-0 flex-1 text-[10px]">
                <h5 className="font-extrabold text-slate-800 truncate">{agent.name}</h5>
                <span className="text-slate-400 block truncate">{agent.vehicle}</span>
                <span className="text-amber-600 font-bold">{agent.rating} Verified Rider</span>
              </div>
            </div>
            <a 
              href={`tel:${agent.phone}`}
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 text-[10px] transition-colors cursor-pointer"
            >
              <Phone className="w-3 h-3" /> Call Driver Ticket
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
