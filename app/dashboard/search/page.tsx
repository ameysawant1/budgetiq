"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  merchant: string;
  category: string | null;
  notes: string;
}

export default function SearchPage() {
  const [results, setResults] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const searchParams = useSearchParams();

  const performSearch = async (query: string, category: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (category) params.set('category', category);

      const res = await fetch(`/api/v1/transactions?${params}`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data.items);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      performSearch(q, '');
    }
  }, [searchParams]);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const query = data.get('q') as string;
    const category = data.get('category') as string;
    setSearchQuery(query);
    setSelectedCategory(category);
    performSearch(query, category);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-white mb-6">Search Transactions</h1>

      <div className="bg-[#0f1114] rounded-lg p-6 border border-[#2a2730] mb-6">
        <h3 className="text-sm font-semibold text-white mb-4">Search Filters</h3>
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              name="q"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full rounded bg-[#14141a] placeholder:text-gray-500 px-3 py-2 text-sm border border-[#222229] text-white"
            />
            <select
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229] text-white"
            >
              <option value="">All Categories</option>
              <option value="food">Food</option>
              <option value="housing">Housing</option>
              <option value="transport">Transport</option>
              <option value="entertainment">Entertainment</option>
            </select>
            <select className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]">
              <option>All Types</option>
              <option>Expense</option>
              <option>Income</option>
            </select>
            <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-[#1e7f8c] text-white rounded">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#0f1114] rounded-lg p-6 border border-[#2a2730]">
        <h3 className="text-sm font-semibold text-white mb-4">Search Results ({results.length})</h3>
        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead>
                <tr className="text-gray-400">
                  <th className="py-3">Date</th>
                  <th className="py-3">Merchant</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26232a]">
                {results.map((t) => (
                  <tr key={t.id}>
                    <td className="py-4">{t.date}</td>
                    <td className="py-4">{t.merchant}</td>
                    <td className={`py-4 ${t.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      ₹{t.amount.toFixed(2)}
                    </td>
                    <td className="py-4">{t.category || 'Uncategorized'}</td>
                    <td className="py-4">{t.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500">No results found. Try adjusting your filters.</div>
        )}
      </div>
    </div>
  );
}
