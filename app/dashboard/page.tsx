"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardData {
  lastUpdated: string;
  summary: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    transactionCount: number;
    monthlyTransactionCount: number;
  };
  charts: {
    categoryDistribution: Array<{ category: string; amount: number }>;
    spendingOverview: Array<{ date: string; amount: number }>;
  };
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await fetch('/api/v1/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleAIInsights = () => {
    // TODO: Implement AI insights
    alert('AI Insights feature coming soon!');
  };

  if (loading) {
    return (
      <div className="bg-[#14131a] text-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <main className="flex-1 p-8">
            <div className="text-center">Loading dashboard...</div>
          </main>
        </div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    transactionCount: 0,
    monthlyTransactionCount: 0
  };

  const cards = [
    {
      id: 1,
      title: "Total Balance",
      value: `₹${summary.totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtitle: summary.transactionCount > 0 ? `${summary.transactionCount} transactions` : "No transactions yet",
      color: "from-blue-400 to-blue-500"
    },
    {
      id: 2,
      title: "Monthly Income",
      value: `₹${summary.monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtitle: summary.monthlyTransactionCount > 0 ? "This month" : "No income recorded",
      color: "from-green-400 to-green-500"
    },
    {
      id: 3,
      title: "Monthly Expenses",
      value: `₹${summary.monthlyExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtitle: summary.monthlyTransactionCount > 0 ? "This month" : "No expenses recorded",
      color: "from-red-400 to-red-500"
    },
  ];

  const categoryColors = ['#1e7f8c', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="bg-[#14131a] text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main content (layout provides Sidebar and root layout provides NavBar) */}
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-white">Dashboard</h1>
              {dashboardData?.lastUpdated && (
                <p className="text-sm text-gray-400 mt-1">
                  Last updated: {new Date(dashboardData.lastUpdated).toLocaleString('en-IN')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 rounded bg-[#0e1114] placeholder:text-gray-500 px-3 py-2 text-sm border border-[#222229]"
                  placeholder="search transactions and categories"
                />
                <i className="fas fa-search absolute right-3 top-2 text-gray-500" />
              </form>
              <button 
                onClick={() => fetchDashboardData(true)} 
                disabled={refreshing}
                className="px-3 py-2 bg-gray-600 rounded text-sm hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh dashboard data"
              >
                <i className={`fas fa-sync-alt ${refreshing ? 'fa-spin' : ''}`} />
              </button>
              <button onClick={handleAIInsights} className="px-4 py-2 bg-[#1e7f8c] rounded text-sm hover:bg-[#155a64]">AI Insights</button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {cards.map((c) => (
              <div key={c.id} className={`p-6 rounded-lg text-white bg-linear-to-r ${c.color}`}>
                <div className="text-sm">{c.title}</div>
                <div className="mt-3 text-2xl font-bold">{c.value}</div>
                <div className="mt-2 text-sm opacity-90">{c.subtitle}</div>
              </div>
            ))}
          </div>

          {/* Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#0f1114] rounded-lg p-6 border border-[#242228]">
              <h3 className="text-lg font-semibold text-white mb-4">Spending Overview (Last 30 Days)</h3>
              <div className="h-56">
                {dashboardData?.charts.spendingOverview && dashboardData.charts.spendingOverview.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.charts.spendingOverview}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '6px',
                          color: '#f3f4f6'
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN')}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#1e7f8c"
                        strokeWidth={2}
                        dot={{ fill: '#1e7f8c', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#1e7f8c', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full rounded-md bg-[#1b1b1f] flex items-center justify-center text-gray-500">
                    No spending data for the last 30 days
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#0f1114] rounded-lg p-6 border border-[#242228]">
              <h3 className="text-lg font-semibold text-white mb-4">Category Distribution</h3>
              <div className="h-56">
                {dashboardData?.charts.categoryDistribution && dashboardData.charts.categoryDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.charts.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="amount"
                        label={({ category, percent }: any) => `${category} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {dashboardData.charts.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '6px',
                          color: '#f3f4f6'
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full rounded-md bg-[#1b1b1f] flex items-center justify-center text-gray-500">
                    No expense categories for this month
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
