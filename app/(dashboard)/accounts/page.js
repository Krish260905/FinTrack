"use client";
import { useState, useEffect } from 'react';
import { Plus, Wallet, ArrowRightLeft, CreditCard, X, Loader2 } from 'lucide-react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', amount: '', account_number: '' });
  const [error, setError] = useState('');

  // Modals for adding money and transferring
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [transferData, setTransferData] = useState({ toAccountId: '', amount: '' });

  useEffect(() => {
    fetchAccounts();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('fintrack_token');
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newAccount)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setShowAddModal(false);
        setNewAccount({ name: '', amount: '', account_number: '' });
        fetchAccounts();
      } else {
        setError(data.message || 'Failed to create account');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('fintrack_token');
      const res = await fetch('/api/accounts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ accountId: selectedAccount.id, amount: addMoneyAmount, description: 'Manual Deposit' })
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddMoneyModal(false);
        setAddMoneyAmount('');
        fetchAccounts();
      } else {
        setError(data.message || 'Failed to add money');
      }
    } catch(err) {
        setError(err.message);
    } finally { 
        setSubmitLoading(false); 
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('fintrack_token');
      const res = await fetch('/api/accounts/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ fromAccountId: selectedAccount.id, toAccountId: transferData.toAccountId, amount: transferData.amount })
      });
      const data = await res.json();
      if (res.ok) {
        setShowTransferModal(false);
        setTransferData({ toAccountId: '', amount: '' });
        fetchAccounts();
      } else {
        setError(data.message || 'Failed to transfer money');
      }
    } catch(err) {
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
          <h1 className="text-2xl font-bold text-slate-800">Accounts & Wallets</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all your payment methods in one place</p>
        </div>
        <button 
          onClick={() => { setShowAddModal(true); setError(''); }} 
          className="bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#5c6cf1] animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(acc => (
            <div key={acc.id} className="dashboard-card p-6 flex flex-col justify-between group hover:border-[#5c6cf1]/50 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    **** {acc.account_number ? acc.account_number.slice(-4) : '0000'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">{acc.account_name}</h3>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {formatCurrency(acc.account_balance)}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                <button 
                  onClick={() => { setSelectedAccount(acc); setShowTransferModal(true); setError(''); }} 
                  className="flex-1 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded hover:bg-slate-50 flex justify-center items-center gap-2 transition-colors"
                >
                  <ArrowRightLeft className="w-3 h-3" /> Transfer
                </button>
                <button 
                  onClick={() => { setSelectedAccount(acc); setShowAddMoneyModal(true); setError(''); }} 
                  className="flex-1 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex justify-center items-center gap-2 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Money
                </button>
              </div>
            </div>
          ))}

          {accounts.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center dashboard-card border-dashed">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-slate-400" />
               </div>
               <h3 className="text-lg font-bold text-slate-800 mb-1">No accounts yet</h3>
               <p className="text-sm text-slate-500 max-w-sm mb-6">Create an account like your Bank, Credit Card, or Cash wallet to start tracking transactions.</p>
               <button onClick={() => setShowAddModal(true)} className="bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add your first account
               </button>
            </div>
          )}
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Add New Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleAddAccount} className="p-6 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Account Name</label>
                <input 
                  required type="text" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]" 
                  placeholder="e.g. HDFC Bank, SBI, Cash Wallet"
                  value={newAccount.name} 
                  onChange={e => setNewAccount({...newAccount, name: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Account Number (Optional)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]" 
                  placeholder="e.g. 1234567890"
                  value={newAccount.account_number} 
                  onChange={e => setNewAccount({...newAccount, account_number: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Initial Balance (₹)</label>
                <input 
                  required type="number" min="0" step="0.01" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]" 
                  placeholder="0.00"
                  value={newAccount.amount} 
                  onChange={e => setNewAccount({...newAccount, amount: e.target.value})} 
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading} className="flex-1 bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {showAddMoneyModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Add Money</h3>
              <button onClick={() => setShowAddMoneyModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleAddMoney} className="p-6 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
              
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                 Adding money to: <span className="font-bold">{selectedAccount.account_name}</span>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Amount to Add (₹)</label>
                <input 
                  required type="number" min="1" step="0.01" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]" 
                  placeholder="0.00"
                  value={addMoneyAmount} 
                  onChange={e => setAddMoneyAmount(e.target.value)} 
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddMoneyModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Transfer Money</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleTransfer} className="p-6 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
              
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-sm mb-4">
                 From: <span className="font-bold text-slate-800">{selectedAccount.account_name}</span>
                 <p className="text-xs text-slate-500 mt-0.5">Available Balance: {formatCurrency(selectedAccount.account_balance)}</p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Transfer To</label>
                <select 
                  required 
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]" 
                  value={transferData.toAccountId} 
                  onChange={e => setTransferData({...transferData, toAccountId: e.target.value})}
                >
                  <option value="">Select account...</option>
                  {accounts.filter(a => a.id !== selectedAccount.id).map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.account_name}</option>
                  ))}
                </select>
                {accounts.length <= 1 && (
                    <p className="text-xs text-orange-500 mt-1">You need at least one other account to transfer money.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Amount to Transfer (₹)</label>
                <input 
                  required type="number" min="1" step="0.01" 
                  max={selectedAccount.account_balance}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1]" 
                  placeholder="0.00"
                  value={transferData.amount} 
                  onChange={e => setTransferData({...transferData, amount: e.target.value})} 
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowTransferModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading || accounts.length <= 1} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
