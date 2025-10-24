"use client";

import { useState, useEffect } from "react";
import MotionCard from "../../components/MotionCard";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  merchant: string;
  category: string | null;
  notes: string;
  split: Split[];
}

interface Split {
  amount?: number;
  percentage?: number;
  category?: string;
  recipient?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'expense' | 'income'>('expense');
  const [showSplitForm, setShowSplitForm] = useState(false);
  const [splitTransaction, setSplitTransaction] = useState<Transaction | null>(null);
  const [splits, setSplits] = useState<Split[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/v1/transactions');
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data.items);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorize = async (transactionId: string, category: string) => {
    if (!category) return;

    try {
      const res = await fetch(`/api/v1/transactions/${transactionId}/categorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      });
      const json = await res.json();
      if (json.success) {
        // Update local state
        setTransactions(prev => prev.map(t =>
          t.id === transactionId ? { ...t, category } : t
        ));
      } else {
        alert(json.error.message);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to categorize transaction');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const amount = parseFloat(data.get('amount') as string);
    const type = data.get('type') as string;

    // Convert to negative for expenses
    const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

    const payload = {
      date: data.get('date'),
      amount: finalAmount,
      currency: 'INR',
      merchant: data.get('merchant') || 'Unknown',
      category: data.get('category') || null,
      notes: data.get('notes') || ''
    };

    try {
      const res = await fetch('/api/v1/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        fetchTransactions(); // refresh
        form.reset();
        setShowForm(false);
      } else {
        alert(json.error.message);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add transaction');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Transactions</h1>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setFormType('expense');
              setShowForm(true);
            }}
            className="px-3 py-2 md:px-4 md:py-2 bg-[#1e7f8c] text-white rounded-lg"
          >
            + Add Expense
          </button>
          <button
            onClick={() => {
              setFormType('income');
              setShowForm(true);
            }}
            className="px-3 py-2 md:px-4 md:py-2 bg-[#10b981] text-white rounded-lg"
          >
            + Add Income
          </button>
          <button className="px-3 py-2 md:px-4 md:py-2 bg-[#f59e0b] text-white rounded-lg">Upload Receipt</button>
        </div>
      </div>

      {/* Transactions Table */}
      <MotionCard className="w-full mb-6">
        <div className="bg-[#0f1114] border border-[#2a2730] rounded-lg p-6">
          <h2 className="text-lg text-white font-semibold mb-4">Recent Transactions</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead>
                  <tr className="text-gray-400">
                    <th className="py-3">Date</th>
                    <th className="py-3">Merchant</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Category</th>
                    <th className="py-3">Notes</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26232a]">
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="py-4">{t.date}</td>
                      <td className="py-4">{t.merchant}</td>
                      <td className={`py-4 ${t.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        ₹{t.amount.toFixed(2)}
                      </td>
                      <td className="py-4">
                        <select
                          value={t.category || ''}
                          onChange={(e) => handleCategorize(t.id, e.target.value)}
                          className="bg-[#14141a] px-2 py-1 rounded text-sm border border-[#222229] text-gray-300"
                        >
                          <option value="">Uncategorized</option>
                          <option value="food">Food</option>
                          <option value="housing">Housing</option>
                          <option value="transport">Transport</option>
                          <option value="entertainment">Entertainment</option>
                          <option value="shopping">Shopping</option>
                          <option value="healthcare">Healthcare</option>
                        </select>
                      </td>
                      <td className="py-4">{t.notes}</td>
                      <td className="py-4">
                        <button
                          onClick={() => {
                            setSplitTransaction(t);
                            setSplits([]);
                            setShowSplitForm(true);
                          }}
                          className="px-2 py-1 bg-[#1e7f8c] text-white rounded text-xs"
                        >
                          Split
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </MotionCard>

      {/* Add Transaction Form */}
      {showForm && (
        <MotionCard className="w-full">
          <div className="bg-[#0f1114] border border-[#2a2730] rounded-lg p-6">
            <div className="border-b border-[#26232a] mb-6">
              <ul className="flex gap-6 text-sm text-gray-400">
                <li className="pb-3 border-b-2 border-[#1e7f8c] text-white">Quick Add</li>
                <li className="pb-3">Recurring</li>
                <li className="pb-3">Split Transaction</li>
                <li className="pb-3">Transfer</li>
              </ul>
            </div>

            <h2 className="text-lg text-white font-semibold mb-4">Quick Add {formType === 'expense' ? 'Expense' : 'Income'}</h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount (₹)</label>
                  <input name="amount" type="number" step="0.01" defaultValue="0.00" className="w-full rounded bg-[#14141a] placeholder:text-gray-500 px-3 py-2 text-sm border border-[#222229]" required />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Type</label>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="text-sm text-gray-300">
                      <input
                        className="mr-2"
                        type="radio"
                        name="type"
                        value="expense"
                        checked={formType === 'expense'}
                        onChange={() => setFormType('expense')}
                      /> Expense
                    </label>
                    <label className="text-sm text-gray-300">
                      <input
                        className="mr-2"
                        type="radio"
                        name="type"
                        value="income"
                        checked={formType === 'income'}
                        onChange={() => setFormType('income')}
                      /> Income
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select name="category" className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]">
                    <option value="">Select a category</option>
                    <option value="groceries">Groceries</option>
                    <option value="transport">Transport</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="food">Food</option>
                    <option value="housing">Housing</option>
                    <option value="shopping">Shopping</option>
                    <option value="healthcare">Healthcare</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Date</label>
                  <input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]" required />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <input name="description" placeholder="e.g. Grocery shopping, Coffee" className="w-full rounded bg-[#14141a] placeholder:text-gray-500 px-3 py-2 text-sm border border-[#222229]" required />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-[#1e7f8c] text-white rounded">
                  Add {formType === 'expense' ? 'Expense' : 'Income'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </MotionCard>
      )}

      {/* Split Transaction Form */}
      {showSplitForm && splitTransaction && (
        <MotionCard className="w-full">
          <div className="bg-[#0f1114] border border-[#2a2730] rounded-lg p-6">
            <h2 className="text-lg text-white font-semibold mb-4">Split Transaction: {splitTransaction.merchant}</h2>
            <p className="text-gray-400 mb-4">Total: ₹{Math.abs(splitTransaction.amount).toFixed(2)}</p>

            <div className="mb-4">
              <button
                onClick={() => setSplits([...splits, { amount: 0 }])}
                className="px-4 py-2 bg-[#1e7f8c] text-white rounded"
              >
                Add Split
              </button>
            </div>

            {splits.map((split, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={split.amount || ''}
                    onChange={(e) => {
                      const newSplits = [...splits];
                      newSplits[index].amount = parseFloat(e.target.value) || undefined;
                      newSplits[index].percentage = undefined; // clear percentage when amount is set
                      setSplits(newSplits);
                    }}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Percentage</label>
                  <input
                    type="number"
                    step="0.01"
                    value={split.percentage || ''}
                    onChange={(e) => {
                      const newSplits = [...splits];
                      newSplits[index].percentage = parseFloat(e.target.value) || undefined;
                      newSplits[index].amount = undefined; // clear amount when percentage is set
                      setSplits(newSplits);
                    }}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                    placeholder="Enter %"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select
                    value={split.category || ''}
                    onChange={(e) => {
                      const newSplits = [...splits];
                      newSplits[index].category = e.target.value;
                      setSplits(newSplits);
                    }}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                  >
                    <option value="">Select category</option>
                    <option value="food">Food</option>
                    <option value="housing">Housing</option>
                    <option value="transport">Transport</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="shopping">Shopping</option>
                    <option value="healthcare">Healthcare</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Recipient</label>
                  <input
                    type="text"
                    value={split.recipient || ''}
                    onChange={(e) => {
                      const newSplits = [...splits];
                      newSplits[index].recipient = e.target.value;
                      setSplits(newSplits);
                    }}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                    placeholder="Optional"
                  />
                </div>
              </div>
            ))}

            <div>
              <button
                onClick={async () => {
                  if (splits.length === 0) {
                    alert('Please add at least one split');
                    return;
                  }

                  // Validate that each split has either amount or percentage
                  const invalidSplits = splits.filter(s => !s.amount && !s.percentage);
                  if (invalidSplits.length > 0) {
                    alert('Each split must have either an amount or percentage');
                    return;
                  }

                  try {
                    const res = await fetch(`/api/v1/transactions/${splitTransaction.id}/split`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ splits })
                    });
                    const json = await res.json();
                    if (json.success) {
                      fetchTransactions();
                      setShowSplitForm(false);
                      setSplitTransaction(null);
                      setSplits([]);
                    } else {
                      alert(json.error.message);
                    }
                  } catch (error) {
                    console.error(error);
                    alert('Failed to split transaction');
                  }
                }}
                className="px-4 py-2 bg-[#1e7f8c] text-white rounded mr-2"
              >
                Split Transaction
              </button>
              <button
                onClick={() => {
                  setShowSplitForm(false);
                  setSplitTransaction(null);
                  setSplits([]);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </MotionCard>
      )}
    </div>
  );
}
