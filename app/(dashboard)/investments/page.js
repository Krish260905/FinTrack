"use client";
import { useState, useEffect } from 'react';
import { TrendingUp, Plus, X, Loader2, ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [newInv, setNewInv] = useState({ asset_name: '', asset_type: 'Stock', total_amount: '', growth_amount: '' });

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const token = localStorage.getItem('fintrack_token');
      const res = await fetch('/api/investments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setInvestments(result.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvestment = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('fintrack_token');
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newInv)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setShowAddModal(false);
        setNewInv({ asset_name: '', asset_type: 'Stock', total_amount: '', growth_amount: '' });
        fetchInvestments();
      } else {
        setError(data.message || 'Failed to add investment');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt || 0);

  // Calculate totals
  const totalPortfolioValue = investments.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const totalGrowth = investments.reduce((sum, inv) => sum + Number(inv.growth_amount), 0);
  const overallReturnPercent = totalPortfolioValue > 0 ? ((totalGrowth / (totalPortfolioValue - totalGrowth)) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Portfolio & Investments</h1>
          <p className="text-sm text-slate-500 mt-1">Track your stocks, mutual funds, and crypto</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
         <div className="dashboard-card p-6 border-t-4 border-t-[#5c6cf1]">
            <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-5 h-5 text-[#5c6cf1]" />
                <h3 className="text-sm font-medium text-slate-500">Total Portfolio Value</h3>
            </div>
            <h2 className="text-3xl font-bold text-slate-800">{formatCurrency(totalPortfolioValue)}</h2>
         </div>

         <div className="dashboard-card p-6 border-t-4 border-t-emerald-500">
            <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-medium text-slate-500">Total All-Time Return</h3>
            </div>
            <div className="flex items-end gap-3">
               <h2 className="text-3xl font-bold text-slate-800">{formatCurrency(totalGrowth)}</h2>
               <div className={`flex items-center gap-1 text-sm font-bold pb-1 ${Number(overallReturnPercent) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {Number(overallReturnPercent) >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(overallReturnPercent)}%
               </div>
            </div>
         </div>
      </div>

      <div className="dashboard-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Your Assets</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#5c6cf1] animate-spin" /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {investments.map((inv) => {
              const invBase = Number(inv.total_amount) - Number(inv.growth_amount);
              const percentReturn = invBase > 0 ? ((Number(inv.growth_amount) / invBase) * 100).toFixed(2) : 0;
              const isPositive = Number(inv.growth_amount) >= 0;

              return (
                <div key={inv.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                        {inv.asset_name.charAt(0)}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">{inv.asset_name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{inv.asset_type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 text-right">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Current Value</p>
                        <p className="font-bold text-slate-800">{formatCurrency(inv.total_amount)}</p>
                    </div>
                    <div className="w-24">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Return</p>
                        <div className={`flex items-center justify-end gap-1 font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {formatCurrency(Math.abs(inv.growth_amount))}
                        </div>
                        <p className={`text-[10px] font-medium mt-0.5 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                           {isPositive ? '+' : '-'}{Math.abs(percentReturn)}%
                        </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {investments.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <TrendingUp className="w-8 h-8 text-slate-400" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-800 mb-1">No investments yet</h3>
                   <p className="text-sm text-slate-500 max-w-sm mb-6">Track your portfolio value and returns over time.</p>
                   <button onClick={() => setShowAddModal(true)} className="bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add your first asset
                   </button>
                </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Add Investment Asset</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleAddInvestment} className="p-6 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Asset Name</label>
                <input 
                  required type="text" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]" 
                  placeholder="e.g. S&P 500 ETF, Apple Stock, Bitcoin"
                  value={newInv.asset_name} 
                  onChange={e => setNewInv({...newInv, asset_name: e.target.value})} 
                />
              </div>

              <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Asset Type</label>
                  <select 
                    required
                    value={newInv.asset_type}
                    onChange={(e) => setNewInv({...newInv, asset_type: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]"
                  >
                    <option value="Stock">Stock</option>
                    <option value="Mutual Fund">Mutual Fund / ETF</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Fixed Deposit">Fixed Deposit / Bond</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Current Total Value (₹)</label>
                <input 
                  required type="number" min="0" step="0.01" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]" 
                  placeholder="0.00"
                  value={newInv.total_amount} 
                  onChange={e => setNewInv({...newInv, total_amount: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Total All-Time Profit/Loss (₹)</label>
                <input 
                  required type="number" step="0.01" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]" 
                  placeholder="e.g. 5000 (profit) or -2000 (loss)"
                  value={newInv.growth_amount} 
                  onChange={e => setNewInv({...newInv, growth_amount: e.target.value})} 
                />
                <p className="text-[10px] text-slate-500 mt-1">Include negative sign for loss. Set 0 if no change.</p>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading} className="flex-1 bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
