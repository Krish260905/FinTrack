"use client";
import { useState, useEffect } from 'react';
import { Target, Plus, X, Loader2, Trophy, Coins, CalendarDays } from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forms state
  const [newGoal, setNewGoal] = useState({ name: '', target_amount: '', current_amount: '', accountId: '' });
  const [fundAmount, setFundAmount] = useState('');
  const [fundAccountId, setFundAccountId] = useState('');

  useEffect(() => {
    fetchGoals();
    fetchAccounts();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('fintrack_token');
      const res = await fetch('/api/goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setGoals(result.data || []);
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
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('fintrack_token');
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newGoal)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setShowAddModal(false);
        setNewGoal({ name: '', target_amount: '', current_amount: '', accountId: '' });
        fetchGoals();
        fetchAccounts(); // Refresh accounts in case balance changed
      } else {
        setError(data.message || 'Failed to create goal');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('fintrack_token');
      const res = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ goal_id: selectedGoal.id, amount: fundAmount, accountId: fundAccountId })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setShowFundModal(false);
        setFundAmount('');
        setFundAccountId('');
        setSelectedGoal(null);
        fetchGoals();
        fetchAccounts(); // Refresh accounts in case balance changed
      } else {
        setError(data.message || 'Failed to add funds');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const openFundModal = (goal) => {
      setSelectedGoal(goal);
      setFundAmount('');
      setFundAccountId('');
      setError('');
      setShowFundModal(true);
  };

  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  // Totals
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
  const completedGoals = goals.filter(g => Number(g.current_amount) >= Number(g.target_amount)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Saving Goals</h1>
          <p className="text-sm text-slate-500 mt-1">Track your progress towards what matters</p>
        </div>
        <button 
          onClick={() => { setError(''); setShowAddModal(true); }} 
          className="bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" /> Create Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="dashboard-card p-6 border-l-4 border-l-[#5c6cf1]">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Trophy className="w-6 h-6" /></div>
                <div>
                   <p className="text-sm font-medium text-slate-500">Total Saved</p>
                   <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalSaved)}</h3>
                </div>
            </div>
         </div>
         <div className="dashboard-card p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Target className="w-6 h-6" /></div>
                <div>
                   <p className="text-sm font-medium text-slate-500">Overall Progress</p>
                   <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl font-bold text-slate-800">{overallProgress}%</h3>
                   </div>
                </div>
            </div>
         </div>
         <div className="dashboard-card p-6 border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Coins className="w-6 h-6" /></div>
                <div>
                   <p className="text-sm font-medium text-slate-500">Completed Goals</p>
                   <h3 className="text-2xl font-bold text-slate-800">{completedGoals} <span className="text-lg text-slate-400 font-normal">/ {goals.length}</span></h3>
                </div>
            </div>
         </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#5c6cf1] animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, idx) => {
            const current = Number(goal.current_amount);
            const target = Number(goal.target_amount);
            const percentage = Math.min(100, Math.round((current / target) * 100));
            const isCompleted = current >= target;

            const colors = [
               { bg: 'bg-blue-500', text: 'text-blue-500', bar: 'bg-blue-500', shadow: 'shadow-blue-500/20', hover: 'hover:bg-blue-500' },
               { bg: 'bg-purple-500', text: 'text-purple-500', bar: 'bg-purple-500', shadow: 'shadow-purple-500/20', hover: 'hover:bg-purple-500' },
               { bg: 'bg-emerald-500', text: 'text-emerald-500', bar: 'bg-emerald-500', shadow: 'shadow-emerald-500/20', hover: 'hover:bg-emerald-500' },
               { bg: 'bg-orange-500', text: 'text-orange-500', bar: 'bg-orange-500', shadow: 'shadow-orange-500/20', hover: 'hover:bg-orange-500' },
               { bg: 'bg-rose-500', text: 'text-rose-500', bar: 'bg-rose-500', shadow: 'shadow-rose-500/20', hover: 'hover:bg-rose-500' }
            ];
            const theme = isCompleted ? { bg: 'bg-emerald-500', text: 'text-emerald-500', bar: 'bg-emerald-500', shadow: 'shadow-emerald-500/20', hover: 'hover:bg-emerald-500' } : colors[idx % colors.length];

            return (
              <div key={goal.id} className="dashboard-card p-6 flex flex-col justify-between group hover:border-[#5c6cf1]/30 transition-colors relative overflow-hidden">
                {isCompleted && <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">Goal Reached!</div>}
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-lg font-bold text-slate-800 leading-tight pr-12">{goal.name}</h3>
                     <div className={`text-2xl font-black ${theme.text}`}>{percentage}%</div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-3">
                     <span className="font-semibold text-slate-700">{formatCurrency(current)}</span>
                     <span className="text-slate-400 font-medium text-xs">of {formatCurrency(target)}</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                    <div className={`${theme.bar} h-2.5 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                  <button 
                     disabled={isCompleted}
                     onClick={() => openFundModal(goal)}
                     className={`flex-1 py-2 text-sm font-medium rounded-lg flex justify-center items-center gap-2 transition-all ${isCompleted ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : `bg-white border border-slate-200 text-slate-700 hover:border-transparent ${theme.hover} hover:text-white hover:shadow-lg ${theme.shadow}`}`}
                  >
                     <Plus className="w-4 h-4" /> {isCompleted ? 'Completed' : 'Add Funds'}
                  </button>
                </div>
              </div>
            );
          })}

          {goals.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center dashboard-card border-dashed">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-slate-400" />
               </div>
               <h3 className="text-lg font-bold text-slate-800 mb-1">No goals set</h3>
               <p className="text-sm text-slate-500 max-w-sm mb-6">Create a goal to start saving for a car, vacation, or emergency fund.</p>
               <button onClick={() => { setError(''); setShowAddModal(true); }} className="bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create your first goal
               </button>
            </div>
          )}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Create New Goal</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleAddGoal} className="p-6 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Goal Name</label>
                <input 
                  required type="text" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]" 
                  placeholder="e.g. New Macbook, Vacation to Bali"
                  value={newGoal.name} 
                  onChange={e => setNewGoal({...newGoal, name: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Amount (₹)</label>
                <input 
                  required type="number" min="1" step="1" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]" 
                  placeholder="0.00"
                  value={newGoal.target_amount} 
                  onChange={e => setNewGoal({...newGoal, target_amount: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Initial Saved Amount (₹)</label>
                <input 
                  type="number" min="0" step="1" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]" 
                  placeholder="0.00 (Optional)"
                  value={newGoal.current_amount} 
                  onChange={e => setNewGoal({...newGoal, current_amount: e.target.value})} 
                />
              </div>
              
              {Number(newGoal.current_amount) > 0 && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-medium text-slate-700 mb-1">Source Account</label>
                <select 
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]"
                  value={newGoal.accountId}
                  onChange={e => setNewGoal({...newGoal, accountId: e.target.value})}
                >
                  <option value="">Select account to fund from...</option>
                  {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.account_name} (Avail: {formatCurrency(acc.account_balance)})</option>
                  ))}
                </select>
                {accounts.length === 0 && <p className="text-xs text-red-500 mt-1">You need to create an Account first to fund goals.</p>}
              </div>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading || (Number(newGoal.current_amount) > 0 && accounts.length === 0)} className="flex-1 bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showFundModal && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <div>
                 <h3 className="font-bold text-slate-800">Add Funds</h3>
                 <p className="text-xs text-slate-500">{selectedGoal.name}</p>
              </div>
              <button onClick={() => setShowFundModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleAddFunds} className="p-6 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
              
              <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center border border-slate-100">
                 <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Current Progress</p>
                    <p className="font-semibold text-slate-700">{formatCurrency(selectedGoal.current_amount)}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Target</p>
                    <p className="font-semibold text-slate-700">{formatCurrency(selectedGoal.target_amount)}</p>
                 </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Source Account</label>
                <select 
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]"
                  value={fundAccountId}
                  onChange={e => setFundAccountId(e.target.value)}
                >
                  <option value="">Select account to fund from...</option>
                  {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.account_name} (Avail: {formatCurrency(acc.account_balance)})</option>
                  ))}
                </select>
                {accounts.length === 0 && <p className="text-xs text-red-500 mt-1">You need to create an Account first to fund goals.</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Amount to Add (₹)</label>
                <div className="relative">
                   <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                   <input 
                     required type="number" min="1" step="1" 
                     className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1] text-lg font-semibold text-slate-800" 
                     placeholder="0"
                     value={fundAmount} 
                     onChange={e => setFundAmount(e.target.value)} 
                   />
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                   Remaining needed: <span className="font-medium text-slate-600">{formatCurrency(Number(selectedGoal.target_amount) - Number(selectedGoal.current_amount))}</span>
               </p>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="submit" disabled={submitLoading || accounts.length === 0} className="w-full bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-4 py-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Addition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
