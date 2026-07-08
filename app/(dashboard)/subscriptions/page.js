"use client";
import { useState, useEffect } from 'react';
import { ReceiptText, Plus, X, Loader2, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [newSub, setNewSub] = useState({ name: '', amount: '', next_date: '', accountId: '' });

  useEffect(() => {
    fetchSubscriptions();
    fetchAccounts();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('fintrack_token');
      const res = await fetch('/api/subscriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setSubscriptions(result.data || []);
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

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('fintrack_token');
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newSub)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setShowAddModal(false);
        setNewSub({ name: '', amount: '', next_date: '', accountId: '' });
        fetchSubscriptions();
        fetchAccounts();
      } else {
        setError(data.message || 'Failed to add subscription');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt || 0);

  // Helper to calculate days remaining
  const getDaysRemaining = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = new Date(dateString);
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate monthly total
  const monthlyTotal = subscriptions.reduce((sum, sub) => sum + Number(sub.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bills & Subscriptions</h1>
          <p className="text-sm text-slate-500 mt-1">Keep track of your recurring payments</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" /> Add Subscription
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="dashboard-card p-6 flex items-center gap-4 border-l-4 border-l-[#5c6cf1]">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ReceiptText className="w-6 h-6" /></div>
            <div>
               <p className="text-sm font-medium text-slate-500">Total Monthly Bills</p>
               <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(monthlyTotal)}</h3>
            </div>
         </div>
         <div className="dashboard-card p-6 flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><RefreshCw className="w-6 h-6" /></div>
            <div>
               <p className="text-sm font-medium text-slate-500">Active Subscriptions</p>
               <h3 className="text-2xl font-bold text-slate-800">{subscriptions.length}</h3>
            </div>
         </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#5c6cf1] animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub, idx) => {
            const daysLeft = getDaysRemaining(sub.next_date);
            const isUrgent = daysLeft <= 3 && daysLeft >= 0;
            const isOverdue = daysLeft < 0;

            return (
              <div key={sub.id} className="dashboard-card p-6 flex flex-col justify-between group hover:border-[#5c6cf1]/50 transition-colors relative overflow-hidden">
                {isUrgent && <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">Due Soon</div>}
                {isOverdue && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">Overdue</div>}
                
                <div className="flex items-center gap-4 mb-6 mt-2">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-sm ${idx % 3 === 0 ? 'bg-rose-500' : idx % 3 === 1 ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                    {sub.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{sub.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{formatCurrency(sub.amount)} / month</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Next Billing Date</p>
                      <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                        {new Date(sub.next_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</p>
                     <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {isOverdue ? 'Overdue' : `${daysLeft} days left`}
                     </p>
                  </div>
                </div>
              </div>
            );
          })}

          {subscriptions.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center dashboard-card border-dashed">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <ReceiptText className="w-8 h-8 text-slate-400" />
               </div>
               <h3 className="text-lg font-bold text-slate-800 mb-1">No subscriptions found</h3>
               <p className="text-sm text-slate-500 max-w-sm mb-6">Keep track of Netflix, Spotify, Internet bills, and more.</p>
               <button onClick={() => setShowAddModal(true)} className="bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add your first bill
               </button>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Add Bill or Subscription</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleAddSubscription} className="p-6 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Service Name</label>
                <input 
                  required type="text" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]" 
                  placeholder="e.g. Netflix, Spotify, Electricity"
                  value={newSub.name} 
                  onChange={e => setNewSub({...newSub, name: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input 
                  required type="number" min="0" step="0.01" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]" 
                  placeholder="0.00"
                  value={newSub.amount} 
                  onChange={e => setNewSub({...newSub, amount: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Next Billing Date</label>
                <input 
                  required type="date" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]" 
                  value={newSub.next_date} 
                  onChange={e => setNewSub({...newSub, next_date: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Source Account</label>
                <select 
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]"
                  value={newSub.accountId}
                  onChange={e => setNewSub({...newSub, accountId: e.target.value})}
                >
                  <option value="">Select account to pay from...</option>
                  {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.account_name} (Avail: {formatCurrency(acc.account_balance)})</option>
                  ))}
                </select>
                {accounts.length === 0 && <p className="text-xs text-red-500 mt-1">You need to create an Account first.</p>}
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading || accounts.length === 0} className="flex-1 bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
