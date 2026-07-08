"use client";
import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Calendar, Plus, X, Loader2 } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  const [filterType, setFilterType] = useState('all'); // 'all', 'monthly'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    account_id: '',
    category: '',
  });

  useEffect(() => {
    // Add a small debounce for typing
    const timeoutId = setTimeout(() => {
        fetchTransactions();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filterType, selectedMonth, selectedYear, searchTerm]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('fintrack_token');
      
      let df = '2000-01-01';
      let dt = '2100-01-01';
      
      if (filterType === 'monthly') {
          const firstDay = new Date(selectedYear, selectedMonth, 1);
          const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
          
          // Format as YYYY-MM-DD adjusting for timezone offset
          df = new Date(firstDay.getTime() - firstDay.getTimezoneOffset() * 60000).toISOString().split('T')[0];
          dt = new Date(lastDay.getTime() - lastDay.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      }

      const res = await fetch(`/api/transactions?df=${df}&dt=${dt}&s=${encodeURIComponent(searchTerm)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setTransactions(result.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('fintrack_token');
      const res = await fetch('/api/accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setAccounts(result.data || []);
        if (result.data && result.data.length > 0) {
          setFormData(prev => ({...prev, account_id: result.data[0].id}));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('fintrack_token');
      const selectedAccount = accounts.find(a => a.id.toString() === formData.account_id.toString());
      
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          source: selectedAccount ? selectedAccount.account_name : 'General'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add transaction');
      }

      setIsModalOpen(false);
      setFormData({ type: 'expense', amount: '', description: '', account_id: accounts.length > 0 ? accounts[0].id : '', category: '' });
      setLoading(true);
      fetchTransactions(); // Refresh the list
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Expenses & Transactions</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage your financial activity</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      <div className="dashboard-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1] focus:ring-1 focus:ring-[#5c6cf1]" 
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-[#5c6cf1]"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="monthly">Monthly</option>
            </select>
            
            {filterType === 'monthly' && (
              <>
                <select 
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-[#5c6cf1]"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {Array.from({length: 12}).map((_, i) => (
                    <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</option>
                  ))}
                </select>
                <select 
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-[#5c6cf1]"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>
                  })}
                </select>
              </>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-[#5c6cf1] animate-spin" /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
               <div className="p-12 text-center text-slate-500">No transactions found.</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                      {tx.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>{new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>•</span>
                        <span className="capitalize">{tx.source || 'General'}</span>
                        {tx.category && (
                           <>
                             <span>•</span>
                             <span className="capitalize text-slate-400">{tx.category}</span>
                           </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-800'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-medium bg-blue-50 text-blue-600 capitalize">
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Add Transaction</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
              
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
                <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`py-2 rounded-md text-sm font-medium transition-colors ${formData.type === 'expense' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Expense</button>
                <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`py-2 rounded-md text-sm font-medium transition-colors ${formData.type === 'income' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Income</button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <input 
                  type="text" 
                  required 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]"
                  placeholder="e.g. Grocery, Salary, Internet Bill"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]"
                  >
                    <option value="">Select...</option>
                    {formData.type === 'expense' ? (
                      <>
                        <option value="Food">Food & Dining</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Transport">Transport</option>
                        <option value="Bills">Bills & Utilities</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="Salary">Salary</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Investment">Investment Return</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Account</label>
                  <select 
                    required
                    value={formData.account_id}
                    onChange={(e) => setFormData({...formData, account_id: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.account_name} (₹{acc.account_balance})</option>
                    ))}
                    {accounts.length === 0 && <option value="">No accounts found</option>}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading} className="flex-1 bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
