"use client";

import { useState, useEffect } from "react";
import MotionCard from "../../components/MotionCard";

interface Budget {
  id: string;
  category: string;
  period: string;
  limit: number;
  spentToDate: number;
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await fetch('/api/v1/budgets');
      const json = await res.json();
      if (json.success) {
        setBudgets(json.data.budgets);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddBudget = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      category: data.get('category'),
      period: 'monthly', // default
      limit: data.get('limit')
    };

    try {
      const res = await fetch('/api/v1/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        fetchBudgets();
        setShowAddForm(false);
        form.reset();
      } else {
        alert(json.error.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const categories = [
    { id: "food", name: "Food" },
    { id: "housing", name: "Housing" },
    { id: "transport", name: "Transport" },
    { id: "entertainment", name: "Entertainment" },
    { id: "shopping", name: "Shopping" },
    { id: "healthcare", name: "Healthcare" },
  ];

  // Merge budgets with categories - only show categories that have budgets
  const mergedCategories = budgets.map(budget => {
    const cat = categories.find(c => c.id === budget.category);
    return {
      id: budget.category,
      name: cat?.name || budget.category,
      spent: budget.spentToDate,
      limit: budget.limit,
      color: "bg-yellow-400" // default color, can map per category later
    };
  });

  const totalLimit = mergedCategories.reduce((s, c) => s + c.limit, 0);
  const totalSpent = mergedCategories.reduce((s, c) => s + c.spent, 0);
  const remaining = totalLimit - totalSpent;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-8">
      <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Budget Management</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="px-3 py-2 md:px-4 md:py-2 bg-[#1e7f8c] text-white rounded-lg">+ Add Budget</button>
      </div>

      {showAddForm && (
        <MotionCard className="w-full mb-6">
          <div className="bg-[#0f1114] rounded-lg p-6 border border-[#2a2730]">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Budget</h3>
            <form onSubmit={handleAddBudget}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select name="category" className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]" required>
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Monthly Limit (₹)</label>
                  <input name="limit" type="number" step="0.01" className="w-full rounded bg-[#14141a] placeholder:text-gray-500 px-3 py-2 text-sm border border-[#222229]" required />
                </div>
              </div>
              <div>
                <button type="submit" className="px-4 py-2 bg-[#1e7f8c] text-white rounded">Add Budget</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="ml-2 px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
              </div>
            </form>
          </div>
        </MotionCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MotionCard className="w-full">
          <div className="bg-[#0f1114] rounded-lg p-6 border border-[#2a2730]">
            <h3 className="text-lg font-semibold text-white mb-4">Budget Status</h3>
            <div className="space-y-4">
              {mergedCategories.map((c) => {
                const pct = c.limit > 0 ? Math.min(100, Math.round((c.spent / c.limit) * 100)) : 0;
                return (
                  <div key={c.id}>
                    <div className="flex flex-col sm:flex-row justify-between mb-2 items-start sm:items-center gap-1">
                      <div className="text-sm text-gray-300 truncate">{c.name}</div>
                      <div className="text-sm text-green-400">₹{c.spent.toFixed(2)} / ₹{c.limit.toFixed(2)}</div>
                    </div>
                    {c.limit > 0 && (
                      <div className="w-full bg-[#1b1b1f] h-2 sm:h-3 rounded-full overflow-hidden">
                        <div className={`${c.color} h-2 sm:h-3 rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </MotionCard>

        <MotionCard className="w-full">
          <div className="bg-[#0f1114] rounded-lg p-6 border border-[#2a2730]">
            <h3 className="text-lg font-semibold text-white mb-6">Budget Summary</h3>
            <div className="grid grid-cols-1 gap-4 text-gray-300 sm:grid-cols-2">
              <div>
                <div className="text-sm">Total Budget</div>
                <div className="text-xl sm:text-2xl font-bold text-white">₹{totalLimit.toFixed(2)}</div>
              </div>

              <div>
                <div className="text-sm">Spent So Far</div>
                <div className="text-xl sm:text-2xl font-bold text-white">₹{totalSpent.toFixed(2)}</div>
              </div>

              <div>
                <div className="text-sm">Remaining</div>
                <div className="text-xl sm:text-2xl font-bold text-green-400">₹{remaining.toFixed(2)}</div>
              </div>

              <div>
                <div className="text-sm">Budget Health</div>
                <div className="text-xl sm:text-2xl font-bold text-yellow-400">
                  {remaining > 0 ? 'Good' : 'Over Budget'}
                </div>
              </div>
            </div>
          </div>
        </MotionCard>
      </div>
    </div>
  );
}
