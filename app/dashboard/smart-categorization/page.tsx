"use client";

import { useState, useEffect, useCallback } from "react";
import MotionCard from "../../components/MotionCard";

interface Transaction {
  id: string;
  desc: string;
  amount: string;
  date: string;
  suggested: string;
}

export default function SmartCategorizationPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUncategorized = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/transactions');
      const json = await res.json();
      if (json.success) {
        const uncategorized = json.data.items.filter((t: { category: string | null }) => !t.category).map((t: { id: string; merchant: string; amount: number; date: string }) => ({
          id: t.id,
          desc: t.merchant,
          amount: `₹${t.amount.toFixed(2)}`,
          date: t.date,
          suggested: suggestCategory(t.merchant)
        }));
        setTransactions(uncategorized);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUncategorized();
  }, [fetchUncategorized]);

  const suggestCategory = (merchant: string) => {
    const lower = merchant.toLowerCase();
    if (lower.includes('amazon') || lower.includes('flipkart')) return 'shopping';
    if (lower.includes('uber') || lower.includes('ola')) return 'transportation';
    if (lower.includes('cafe') || lower.includes('restaurant')) return 'dining';
    if (lower.includes('pharmacy')) return 'healthcare';
    if (lower.includes('netflix') || lower.includes('spotify')) return 'entertainment';
    return 'misc';
  };

  const handleApprove = async (id: string, category: string) => {
    try {
      const res = await fetch(`/api/v1/transactions/${id}/categorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      });
      if (res.ok) {
        setTransactions(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white">Smart Categorization</h1>
          <div className="text-sm text-gray-400">AI automatically sorts transactions</div>
        </div>
        <button className="px-4 py-2 bg-[#1e7f8c] text-white rounded-lg">Run AI Categorization</button>
      </div>

      <MotionCard className="w-full">
        <div className="bg-[#0f1114] rounded-lg p-6 border border-[#2a2730]">
          <h3 className="text-lg font-semibold text-white mb-4">Pending Categorization</h3>
          <div className="text-sm text-gray-400 mb-6">Review and approve AI suggestions</div>

          {loading ? (
            <div>Loading...</div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead>
                  <tr className="text-gray-400">
                    <th className="py-3">Transaction</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Date</th>
                    <th className="py-3">Suggested Category</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26232a]">
                  {transactions.map((t) => (
                    <tr key={t.id} className="align-top">
                      <td className="py-4">{t.desc}</td>
                      <td className="py-4">{t.amount}</td>
                      <td className="py-4">{t.date}</td>
                      <td className="py-4">
                        <select defaultValue={t.suggested} className="bg-[#14141a] px-3 py-2 rounded text-sm border border-[#222229] text-gray-300">
                          <option value="shopping">shopping</option>
                          <option value="transportation">transportation</option>
                          <option value="dining">dining</option>
                          <option value="healthcare">healthcare</option>
                          <option value="entertainment">entertainment</option>
                          <option value="misc">misc</option>
                        </select>
                      </td>
                      <td className="py-4 text-green-400">
                        <button onClick={() => handleApprove(t.id, t.suggested)} className="mr-4 text-green-400">✓ Approve</button>
                        <button className="text-green-400">Apply</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500">No uncategorized transactions.</div>
          )}
        </div>
      </MotionCard>
    </div>
  );
}
