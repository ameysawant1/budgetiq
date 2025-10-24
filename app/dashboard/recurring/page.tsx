"use client";

import { useState, useEffect } from "react";

interface Recurring {
  id: string;
  templateTransaction: {
    amount: number;
    merchant: string;
    category: string;
  };
  frequency: { type: string; interval: number };
  nextRun: string;
}

export default function RecurringPage() {
  const [recurring, setRecurring] = useState<Recurring[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchRecurring();
  }, []);

  const fetchRecurring = async () => {
    try {
      const res = await fetch('/api/v1/recurring');
      const json = await res.json();
      if (json.success) {
        setRecurring(json.data.items);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddRecurring = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      templateTransaction: {
        amount: parseFloat(data.get('amount') as string),
        merchant: data.get('merchant'),
        category: data.get('category')
      },
      frequency: { type: 'monthly', interval: 1 }
    };

    try {
      const res = await fetch('/api/v1/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        fetchRecurring();
        setShowAddForm(false);
        form.reset();
      } else {
        alert(json.error.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const rows = recurring.map(r => ({
    id: r.id,
    desc: r.templateTransaction.merchant,
    amount: `₹${r.templateTransaction.amount.toFixed(2)}`,
    category: r.templateTransaction.category || 'Uncategorized',
    frequency: `${r.frequency.type}ly`,
    next: new Date(r.nextRun).toLocaleDateString(),
    status: 'active'
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Recurring Transactions</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 py-2 bg-[#1e7f8c] text-white rounded-lg">+ Add Recurring Transaction</button>
      </div>

      {showAddForm && (
        <div className="bg-[#0f1114] rounded-lg p-6 border border-[#2a2730] mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Add Recurring Transaction</h3>
          <form onSubmit={handleAddRecurring}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount (₹)</label>
                <input name="amount" type="number" step="0.01" className="w-full rounded bg-[#14141a] placeholder:text-gray-500 px-3 py-2 text-sm border border-[#222229]" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Merchant</label>
                <input name="merchant" className="w-full rounded bg-[#14141a] placeholder:text-gray-500 px-3 py-2 text-sm border border-[#222229]" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select name="category" className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]">
                  <option value="">Select category</option>
                  <option value="food">Food</option>
                  <option value="housing">Housing</option>
                  <option value="transport">Transport</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>
            </div>
            <div>
              <button type="submit" className="px-4 py-2 bg-[#1e7f8c] text-white rounded">Add Recurring</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="ml-2 px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#0f1114] rounded-lg p-6 border border-[#2a2730]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead>
              <tr className="text-gray-400">
                <th className="py-3">Description</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Category</th>
                <th className="py-3">Frequency</th>
                <th className="py-3">Next Date</th>
                <th className="py-3">Status</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26232a]">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-4">{r.desc}</td>
                  <td className="py-4">{r.amount}</td>
                  <td className="py-4">{r.category}</td>
                  <td className="py-4">{r.frequency}</td>
                  <td className="py-4">{r.next}</td>
                  <td className="py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">{r.status}</span></td>
                  <td className="py-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <button className="text-teal-400">↻</button>
                      <button className="text-yellow-400">✎</button>
                      <button className="text-red-500">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
