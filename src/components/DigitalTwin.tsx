/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { LayoutGrid, AlertTriangle, Thermometer, ShoppingCart, RefreshCw, Layers } from 'lucide-react';

interface DigitalTwinProps {
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onRestock: (id: string, qty: number) => void;
}

export default function DigitalTwin({ products, onSelectProduct, onRestock }: DigitalTwinProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Classify products into layout zones
  const groceries = products.filter(p => p.category === 'Groceries');
  const electronics = products.filter(p => p.category === 'Electronics');
  const household = products.filter(p => p.category === 'Household' || p.category === 'Fashion');

  const zones = [
    { id: 'zone-grocery', name: 'Aisle 1: Fresh Produce & Dairy', items: groceries, bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800', icon: Layers, temp: '4.2°C (Cold Chain)' },
    { id: 'zone-electronics', name: 'Aisle 2: Electronics & Tech Showcase', items: electronics, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-800', icon: LayoutGrid, temp: '21.5°C (Ambient)' },
    { id: 'zone-household', name: 'Aisle 3: Household Essentials & Apparel', items: household, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800', icon: Layers, temp: '22.0°C (Ambient)' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6" id="digital-twin-stage">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <span className="p-1.5 bg-[#DBEAFE] text-[#3B82F6] rounded-lg"><LayoutGrid className="w-5 h-5" /></span>
            RetailMind Live Digital Twin – Store Floor Layout
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Real-time Internet-of-Things (IoT) mapping of physical store aisles, shelf stocks, and cold-chain temperature limits.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-xs font-semibold text-[#1E40AF]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            IoT Sensors Online
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Stage */}
        <div className="lg:col-span-2 bg-slate-950 rounded-xl p-6 relative overflow-hidden min-h-[380px] flex flex-col justify-between border border-[#334155]">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <div className="relative z-10 flex justify-between items-center text-xs text-slate-400 border-b border-[#334155] pb-3">
            <span className="font-mono">BUILDING ID: HQ-SUPERSTORE-01</span>
            <span className="font-mono bg-[#DBEAFE] text-[#1E40AF] px-2 py-0.5 rounded border border-[#BFDBFE]">FRONT INGRESS</span>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            {zones.map((zone) => {
              const lowStockCount = zone.items.filter(p => p.stock <= p.minStockLevel).length;
              const isSelected = selectedSection === zone.id;

              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedSection(zone.id)}
                  className={`p-4 rounded-xl border text-left transition-all duration-300 relative group overflow-hidden cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-900 border-[#3B82F6] shadow-lg shadow-blue-500/10' 
                      : 'bg-[#0F172A] border-[#334155] hover:border-[#475569]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-900/40 text-[#60A5FA]' : 'bg-slate-800 text-slate-400'}`}>
                      <zone.icon className="w-4 h-4" />
                    </span>
                    {lowStockCount > 0 && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-500/20 text-rose-400 rounded text-[10px] font-bold border border-rose-500/30 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> {lowStockCount} LOW
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
                    {zone.name.split(':')[0]}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{zone.name.split(':')[1]}</p>

                  <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" /> {zone.temp}</span>
                  </div>

                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#3B82F6]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative z-10 flex justify-between items-center text-[10px] text-slate-500 border-t border-[#334155] pt-3">
            <span>Grid Coordinates: [37.7749° N, 122.4194° W]</span>
            <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono">EGRESS SENSORS: GOOD</span>
          </div>
        </div>

        {/* Selected Zone Shelf Details */}
        <div className="bg-[#F8FAFC] rounded-lg p-5 border border-[#E2E8F0] flex flex-col justify-between">
          <div>
            {selectedSection ? (
              (() => {
                const zone = zones.find(z => z.id === selectedSection);
                if (!zone) return null;
                return (
                  <>
                    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
                      <h3 className="font-bold text-[#0F172A] text-sm tracking-tight">{zone.name}</h3>
                      <span className="text-[10px] font-mono text-[#1E40AF] bg-[#DBEAFE] px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                        {zone.temp.split(' ')[0]}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                      {zone.items.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">No items registered on this shelf shelf.</p>
                      ) : (
                        zone.items.map(p => {
                          const isLow = p.stock <= p.minStockLevel;
                          return (
                            <div 
                              key={p.id} 
                              className={`p-3 bg-white rounded-lg border text-xs transition-colors flex items-center justify-between gap-3 ${
                                isLow ? 'border-rose-200 bg-rose-50/10' : 'border-[#E2E8F0] hover:border-slate-200'
                              }`}
                            >
                              <div className="min-w-0">
                                <h4 className="font-semibold text-[#0F172A] truncate">{p.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-mono text-[#3B82F6] font-bold">${p.price}</span>
                                  <span className="text-slate-300">|</span>
                                  <span className={`font-mono ${isLow ? 'text-rose-600 font-bold animate-pulse' : 'text-slate-500'}`}>
                                    Stock: {p.stock}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => onSelectProduct(p)}
                                  className="p-1 bg-[#F1F5F9] text-slate-600 hover:bg-slate-200 rounded border border-[#E2E8F0] transition-colors cursor-pointer"
                                  title="View Specifications & Specs"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                </button>
                                {isLow && (
                                  <button
                                    onClick={() => onRestock(p.id, 50)}
                                    className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-200 transition-colors cursor-pointer"
                                    title="Automated Reorder Restock 50 Units"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="text-center py-16">
                <LayoutGrid className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-700 text-sm">Select an Aisle Shelf</h3>
                <p className="text-xs text-slate-400 px-4 mt-1">
                  Click on any of the active IoT sections in the layout grid to inspect live product stock configurations and sensor levels.
                </p>
              </div>
            )}
          </div>

          {selectedSection && (
            <div className="mt-4 pt-3 border-t border-[#E2E8F0] bg-white p-3.5 rounded-lg border border-[#E2E8F0] flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <Thermometer className="w-3.5 h-3.5 text-rose-500" /> Air Handler System:
              </span>
              <span className="font-mono font-semibold text-slate-800">NOMINAL (98%)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
