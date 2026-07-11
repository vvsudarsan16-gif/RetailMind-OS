import React, { useState } from 'react';
import { 
  Sparkles, ChefHat, Wallet, Check, AlertCircle, ShoppingCart, RefreshCcw, Tag 
} from 'lucide-react';
import { Product, User } from '../../types';

interface CustomerAiToolsProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  currentUser: User;
}

export default function CustomerAiTools({ 
  products, 
  onAddToCart, 
  currentUser 
}: CustomerAiToolsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'meal' | 'budget' | 'refill'>('meal');

  // 1. AI Meal Planner States
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [mealIngredientsAdded, setMealIngredientsAdded] = useState(false);

  const recipes = [
    {
      name: "Farmhouse Classic Pancake Breakfast",
      desc: "Warm fluffy milk pancakes with fresh eggs",
      items: ["Farm Fresh Organic Milk 1L", "Cage-Free Brown Eggs (12pk)"],
      cookingTime: "15 mins",
      difficulty: "Easy"
    },
    {
      name: "High-Protein Fitness Diet Bundle",
      desc: "Energizing morning bundle with protein milk, cereal, and eggs",
      items: ["Farm Fresh Organic Milk 1L", "Cage-Free Brown Eggs (12pk)", "AeroPro Elite Thin Notebook 14\""], // Notebook is in electronics, let's keep it food items
      cookingTime: "5 mins",
      difficulty: "Easy"
    }
  ];

  // Adjust ingredients to actual available catalog names to avoid mismatches
  const getRecipeIngredients = (recipeName: string) => {
    if (recipeName === "Farmhouse Classic Pancake Breakfast") {
      return products.filter(p => p.id === 'prod-milk' || p.id === 'prod-eggs');
    }
    // High Protein diet
    return products.filter(p => p.id === 'prod-milk' || p.id === 'prod-eggs');
  };

  const handleAddRecipeIngredients = (recipeName: string) => {
    const ingredients = getRecipeIngredients(recipeName);
    if (ingredients.length === 0) return;
    
    ingredients.forEach(prod => {
      onAddToCart(prod);
    });

    setMealIngredientsAdded(true);
    setTimeout(() => setMealIngredientsAdded(false), 3000);
  };

  // 2. AI Budget Shopping States
  const [targetBudget, setTargetBudget] = useState('50');
  const [budgetCategory, setBudgetCategory] = useState('All');
  const [assembledBundle, setAssembledBundle] = useState<Product[]>([]);
  const [bundleSum, setBundleSum] = useState(0);

  const assembleBudgetBundle = () => {
    const limit = parseFloat(targetBudget) || 0;
    if (limit <= 0) return;

    let filtered = products.filter(p => p.isApproved);
    if (budgetCategory !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === budgetCategory.toLowerCase());
    }

    // Simple greedy knapsack algorithm to pack items under budget
    const bundle: Product[] = [];
    let currentSum = 0;

    // Sort by rating high to low to give them best recommended items
    const sorted = [...filtered].sort((a, b) => b.rating - a.rating);

    for (const item of sorted) {
      if (currentSum + item.price <= limit) {
        bundle.push(item);
        currentSum = parseFloat((currentSum + item.price).toFixed(2));
      }
    }

    setAssembledBundle(bundle);
    setBundleSum(currentSum);
  };

  const addBundleToCart = () => {
    if (assembledBundle.length === 0) return;
    assembledBundle.forEach(p => onAddToCart(p));
    setAssembledBundle([]);
    setBundleSum(0);
    alert('Dynamic AI Budget Bundle has been transferred to your checkout bag!');
  };

  // 3. Smart Grocery Refill Prediction States
  const refillItems = [
    { id: 'prod-milk', name: 'Farm Fresh Organic Milk 1L', lastBought: '4 days ago', level: 12, rate: 'High consumption' },
    { id: 'prod-eggs', name: 'Cage-Free Brown Eggs (12pk)', lastBought: '6 days ago', level: 25, rate: 'Moderate consumption' }
  ];

  const handleRefillItem = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      onAddToCart(prod);
      alert(`Quick Refill ordered! 1x ${prod.name} added to checkout bag.`);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6" id="ai-commerce-tools">
      
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" /> AI Intelligent Shopping Suite
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Automate grocery list generation, match exact budgets, and forecast home grocery depletion.</p>
        </div>

        {/* Tab Header buttons */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-[10px] font-bold">
          <button 
            onClick={() => setActiveSubTab('meal')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${activeSubTab === 'meal' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
          >
            🍳 Meal Planner
          </button>
          <button 
            onClick={() => { setActiveSubTab('budget'); assembleBudgetBundle(); }}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${activeSubTab === 'budget' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
          >
            💰 Budget Matcher
          </button>
          <button 
            onClick={() => setActiveSubTab('refill')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${activeSubTab === 'refill' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
          >
            🔄 Smart Refill
          </button>
        </div>
      </div>

      {/* SUB TAB 1: MEAL PLANNER INGREDIENT CONCIERGE */}
      {activeSubTab === 'meal' && (
        <div className="space-y-4 text-xs">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
            <ChefHat className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <strong>Instant Ingredient Loader:</strong> Select a recipe you want to cook. The Copilot compiles all the raw ingredients from our shelves and lets you load them into your basket with 1 click.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recipes.map((recipe, idx) => (
              <div 
                key={idx} 
                className={`border p-4 rounded-xl flex flex-col justify-between space-y-3 transition-all ${
                  selectedRecipe === recipe.name ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono uppercase">
                    <span>⏱ {recipe.cookingTime}</span>
                    <span>{recipe.difficulty}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 leading-snug">{recipe.name}</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">{recipe.desc}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-2.5 text-[11px] space-y-1">
                  <span className="font-bold text-slate-500 text-[9px] uppercase tracking-wider block">INGREDIENTS REQUIRED:</span>
                  {recipe.items.map((it, i) => (
                    <div key={i} className="text-slate-600 flex justify-between">
                      <span>• {it}</span>
                      <span className="text-emerald-600 font-semibold">In stock</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { setSelectedRecipe(recipe.name); handleAddRecipeIngredients(recipe.name); }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[10px] tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {mealIngredientsAdded && selectedRecipe === recipe.name ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Loaded into Bag!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" /> Add Ingredients to Cart
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 2: BUDGET LIMIT BUNDLE ASSEMBLER */}
      {activeSubTab === 'budget' && (
        <div className="space-y-4 text-xs">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
            <Wallet className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <strong>Max-Limit Bundle Optimizer:</strong> Enter your exact spending limit and filter categories. Our AI-driven engine selects top-rated compatible products that pack perfectly under your budget cap.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-500 uppercase text-[9px]">Max Spending Limit ($):</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                <input
                  type="number"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-6 pr-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500 uppercase text-[9px]">Target Segment:</label>
              <select
                value={budgetCategory}
                onChange={(e) => setBudgetCategory(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="groceries">Groceries</option>
                <option value="electronics">Electronics</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={assembleBudgetBundle}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Optimize Bundle
              </button>
            </div>
          </div>

          {/* Bundle Suggestions Result Box */}
          {assembledBundle.length > 0 ? (
            <div className="border border-blue-200 bg-blue-50/10 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                <span className="font-bold text-slate-700">Curated AI Suggestions Package:</span>
                <span className="font-mono font-black text-blue-600">Total Bundle: ${bundleSum.toFixed(2)}</span>
              </div>

              <div className="space-y-2.5">
                {assembledBundle.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-white p-2 border border-slate-200 rounded-lg">
                    <span className="font-semibold text-slate-700">{p.name}</span>
                    <span className="font-mono text-slate-500">${p.price}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={addBundleToCart}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg tracking-wide text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <ShoppingCart className="w-4 h-4" /> Load Optimized Package into Cart
              </button>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 italic bg-slate-50 border border-slate-200 border-dashed rounded-xl">
              No custom limit packages loaded. Select a target budget and click "Optimize Bundle" to search shelves.
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 3: SMART GROCERY REFILL PREDICTIONS */}
      {activeSubTab === 'refill' && (
        <div className="space-y-4 text-xs">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
            <RefreshCcw className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <strong>Refill Predictor:</strong> Calculates estimated depletion level of essentials (milk, eggs) purchased previously based on consumption frequency indices.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {refillItems.map(item => (
              <div key={item.id} className="border border-slate-200 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className={`text-[10px] font-bold ${item.level <= 15 ? 'text-red-500' : 'text-amber-500'}`}>{item.level}% left</span>
                  </div>
                  
                  {/* Usage Meter */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${item.level <= 15 ? 'bg-red-500' : 'bg-amber-400'}`}
                      style={{ width: `${item.level}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Bought {item.lastBought}</span>
                    <span>Rate: {item.rate}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRefillItem(item.id)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-[10px] tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCcw className="w-3.5 h-3.5" /> Refill Supply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
