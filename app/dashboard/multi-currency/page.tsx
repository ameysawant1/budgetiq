"use client";

import React, { useState, useEffect } from "react";

const MotionCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => {
  return <div className={className}>{children}</div>;
};

interface CurrencyAccount {
  id: string;
  currency: string;
  balance: number;
  accountName: string;
  isDefault: boolean;
}

interface Conversion {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  description: string;
  createdAt: string;
}

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

const currencies = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
];

export default function MultiCurrencyPage() {
  const [accounts, setAccounts] = useState<CurrencyAccount[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);

  // Converter state
  const [convertAmount, setConvertAmount] = useState('');
  const [convertFrom, setConvertFrom] = useState('USD');
  const [convertTo, setConvertTo] = useState('INR');
  const [convertedAmount, setConvertedAmount] = useState('');

  // Foreign transaction state
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    accountId: '',
    amount: '',
    currency: 'USD',
    merchant: '',
    category: '',
    description: ''
  });

  // Conversion state
  const [showConversionForm, setShowConversionForm] = useState(false);
  const [conversionForm, setConversionForm] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    exchangeRate: '',
    description: ''
  });

  // New account state
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [accountForm, setAccountForm] = useState({
    currency: 'USD',
    accountName: '',
    initialBalance: '0'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, conversionsRes, ratesRes] = await Promise.all([
        fetch('/api/v1/currency/accounts'),
        fetch('/api/v1/currency/convert'),
        fetch('/api/v1/currency/rates')
      ]);

      const accountsData = await accountsRes.json();
      const conversionsData = await conversionsRes.json();
      const ratesData = await ratesRes.json();

      if (accountsData.success) setAccounts(accountsData.data.accounts);
      if (conversionsData.success) setConversions(conversionsData.data.conversions);
      if (ratesData.success) setExchangeRates(ratesData.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = () => {
    if (!exchangeRates) return;
    const amount = parseFloat(convertAmount);
    if (isNaN(amount)) return;

    // Convert to base currency first, then to target
    const inBase = convertFrom === exchangeRates.base ? amount : amount / (exchangeRates.rates[convertFrom] || 1);
    const result = convertTo === exchangeRates.base ? inBase : inBase * (exchangeRates.rates[convertTo] || 1);

    setConvertedAmount(result.toFixed(2));
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          amount: -Math.abs(parseFloat(transactionForm.amount)), // Always expense for foreign transactions
          currency: transactionForm.currency,
          merchant: transactionForm.merchant,
          category: transactionForm.category,
          notes: transactionForm.description
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowTransactionForm(false);
        setTransactionForm({
          accountId: '',
          amount: '',
          currency: 'USD',
          merchant: '',
          category: '',
          description: ''
        });
        alert('Foreign transaction added successfully!');
      } else {
        alert(data.error.message);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add transaction');
    }
  };

  const handleConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/currency/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId: conversionForm.fromAccountId,
          toAccountId: conversionForm.toAccountId,
          fromAmount: conversionForm.amount,
          exchangeRate: conversionForm.exchangeRate,
          description: conversionForm.description
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowConversionForm(false);
        setConversionForm({
          fromAccountId: '',
          toAccountId: '',
          amount: '',
          exchangeRate: '',
          description: ''
        });
        fetchData(); // Refresh data
        alert('Currency conversion completed successfully!');
      } else {
        alert(data.error.message);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to convert currency');
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/currency/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountForm)
      });

      const data = await res.json();
      if (data.success) {
        setShowAccountForm(false);
        setAccountForm({
          currency: 'USD',
          accountName: '',
          initialBalance: '0'
        });
        fetchData(); // Refresh data
        alert('Currency account added successfully!');
      } else {
        alert(data.error.message);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add account');
    }
  };

  const getCurrencySymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || code;
  };

  const getTotalBalanceInINR = () => {
    if (!exchangeRates) return 0;
    return accounts.reduce((total, account) => {
      const inBase = account.currency === exchangeRates.base
        ? account.balance
        : account.balance / (exchangeRates.rates[account.currency] || 1);
      return total + (inBase * (exchangeRates.rates.INR || 1));
    }, 0);
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Multi-Currency Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAccountForm(true)}
            className="px-4 py-2 bg-[#1e7f8c] text-white rounded-lg hover:bg-[#155a64]"
          >
            + Add Currency Account
          </button>
          <button
            onClick={() => setShowConversionForm(true)}
            className="px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669]"
          >
            Convert Currency
          </button>
          <button
            onClick={() => setShowTransactionForm(true)}
            className="px-4 py-2 bg-[#f59e0b] text-white rounded-lg hover:bg-[#d97706]"
          >
            + Add Foreign Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MotionCard className="bg-[#0f1114] border border-[#2a2730] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Total Accounts</h3>
          <div className="text-3xl font-bold text-[#1e7f8c]">{accounts.length}</div>
        </MotionCard>

        <MotionCard className="bg-[#0f1114] border border-[#2a2730] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Total Balance</h3>
          <div className="text-3xl font-bold text-green-400">₹{getTotalBalanceInINR().toFixed(2)}</div>
          <div className="text-sm text-gray-400">in INR</div>
        </MotionCard>

        <MotionCard className="bg-[#0f1114] border border-[#2a2730] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Recent Conversions</h3>
          <div className="text-3xl font-bold text-[#f59e0b]">{conversions.length}</div>
        </MotionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Currency Converter */}
        <MotionCard className="bg-[#0f1114] border border-[#2a2730] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Currency Converter</h3>
          <div className="text-sm text-gray-400 mb-4">Convert between different currencies using real-time exchange rates</div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <input
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value)}
              placeholder="Amount"
              className="w-full rounded bg-[#14141a] placeholder:text-gray-500 px-3 py-2 text-sm border border-[#222229]"
            />
            <select
              value={convertFrom}
              onChange={(e) => setConvertFrom(e.target.value)}
              className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </option>
              ))}
            </select>
            <select
              value={convertTo}
              onChange={(e) => setConvertTo(e.target.value)}
              className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleConvert} className="w-full px-4 py-2 bg-[#1e7f8c] text-white rounded hover:bg-[#155a64] mb-4">
            Convert
          </button>

          {convertedAmount && (
            <div className="text-white text-center">
              <div className="text-lg font-semibold">
                {getCurrencySymbol(convertFrom)}{convertAmount} = {getCurrencySymbol(convertTo)}{convertedAmount}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Exchange Rate: 1 {convertFrom} = {(parseFloat(convertedAmount) / parseFloat(convertAmount)).toFixed(4)} {convertTo}
              </div>
            </div>
          )}
        </MotionCard>

        {/* Currency Accounts */}
        <MotionCard className="bg-[#0f1114] border border-[#2a2730] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Currency Accounts</h3>
          <div className="space-y-3">
            {accounts.map(account => (
              <div key={account.id} className="flex justify-between items-center p-3 bg-[#14141a] rounded">
                <div>
                  <div className="text-white font-medium">{account.accountName}</div>
                  <div className="text-sm text-gray-400">{account.currency}</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${account.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {getCurrencySymbol(account.currency)}{account.balance.toFixed(2)}
                  </div>
                  {account.isDefault && <div className="text-xs text-[#1e7f8c]">Default</div>}
                </div>
              </div>
            ))}
          </div>
        </MotionCard>
      </div>

      {/* Recent Conversions */}
      <MotionCard className="bg-[#0f1114] border border-[#2a2730] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Conversions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead>
              <tr className="text-gray-400 border-b border-[#26232a]">
                <th className="py-3">Date</th>
                <th className="py-3">From</th>
                <th className="py-3">To</th>
                <th className="py-3">Rate</th>
                <th className="py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {conversions.slice(0, 10).map(conversion => (
                <tr key={conversion.id} className="border-b border-[#26232a]">
                  <td className="py-3">{new Date(conversion.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    {getCurrencySymbol(conversion.fromCurrency)}{conversion.fromAmount.toFixed(2)}
                  </td>
                  <td className="py-3">
                    {getCurrencySymbol(conversion.toCurrency)}{conversion.toAmount.toFixed(2)}
                  </td>
                  <td className="py-3">{conversion.exchangeRate.toFixed(4)}</td>
                  <td className="py-3">{conversion.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MotionCard>

      {/* Add Foreign Transaction Form */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#0f1114] border border-[#2a2730] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Add Foreign Transaction</h3>
            <form onSubmit={handleAddTransaction}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Currency</label>
                  <select
                    value={transactionForm.currency}
                    onChange={(e) => setTransactionForm({...transactionForm, currency: e.target.value})}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Merchant</label>
                  <input
                    type="text"
                    value={transactionForm.merchant}
                    onChange={(e) => setTransactionForm({...transactionForm, merchant: e.target.value})}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                  >
                    <option value="">Select category</option>
                    <option value="travel">Travel</option>
                    <option value="shopping">Shopping</option>
                    <option value="food">Food</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Description</label>
                  <textarea
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="submit" className="flex-1 px-4 py-2 bg-[#1e7f8c] text-white rounded hover:bg-[#155a64]">
                  Add Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setShowTransactionForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Currency Conversion Form */}
      {showConversionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#0f1114] border border-[#2a2730] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Convert Currency</h3>
            <form onSubmit={handleConversion}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">From Account</label>
                  <select
                    value={conversionForm.fromAccountId}
                    onChange={(e) => setConversionForm({...conversionForm, fromAccountId: e.target.value})}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.accountName} ({getCurrencySymbol(account.currency)}{account.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">To Account</label>
                  <select
                    value={conversionForm.toAccountId}
                    onChange={(e) => setConversionForm({...conversionForm, toAccountId: e.target.value})}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.accountName} ({getCurrencySymbol(account.currency)}{account.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount to Convert</label>
                  <input
                    type="number"
                    step="0.01"
                    value={conversionForm.amount}
                    onChange={(e) => setConversionForm({...conversionForm, amount: e.target.value})}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Exchange Rate</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={conversionForm.exchangeRate}
                    onChange={(e) => setConversionForm({...conversionForm, exchangeRate: e.target.value})}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Description</label>
                  <input
                    type="text"
                    value={conversionForm.description}
                    onChange={(e) => setConversionForm({...conversionForm, description: e.target.value})}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="submit" className="flex-1 px-4 py-2 bg-[#10b981] text-white rounded hover:bg-[#059669]">
                  Convert Currency
                </button>
                <button
                  type="button"
                  onClick={() => setShowConversionForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Currency Account Form */}
      {showAccountForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#0f1114] border border-[#2a2730] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Add Currency Account</h3>
            <form onSubmit={handleAddAccount}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Currency</label>
                  <select
                    value={accountForm.currency}
                    onChange={(e) => setAccountForm({...accountForm, currency: e.target.value})}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                    required
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Account Name</label>
                  <input
                    type="text"
                    value={accountForm.accountName}
                    onChange={(e) => setAccountForm({...accountForm, accountName: e.target.value})}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                    placeholder="e.g. Travel Fund USD"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Initial Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={accountForm.initialBalance}
                    onChange={(e) => setAccountForm({...accountForm, initialBalance: e.target.value})}
                    className="w-full rounded bg-[#14141a] px-3 py-2 text-sm border border-[#222229]"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="submit" className="flex-1 px-4 py-2 bg-[#1e7f8c] text-white rounded hover:bg-[#155a64]">
                  Add Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowAccountForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
