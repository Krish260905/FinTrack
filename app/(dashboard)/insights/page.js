"use client";
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon, Loader2, ArrowDownRight, AlertTriangle } from 'lucide-react';

export default function InsightsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('fintrack_token');
      // Fetch a wide range to get all historical data for insights
      const res = await fetch('/api/transactions?df=2020-01-01', {
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

  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  // Data processing
  const expenses = transactions.filter(t => t.type === 'expense');
  
  // 1. Category Breakdown
  const categoryDataRaw = expenses.reduce((acc, curr) => {
      const cat = curr.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + Number(curr.amount);
      return acc;
  }, {});
  
  const categoryData = Object.keys(categoryDataRaw).map(key => ({
      name: key,
      value: categoryDataRaw[key]
  })).sort((a, b) => b.value - a.value);

  // 2. Top Expenses
  const topExpenses = [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);

  // Colors for charts
  const COLORS = ['#5c6cf1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#64748b'];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Spending Insights</h1>
        <p className="text-sm text-slate-500 mt-1">Deep dive into where your money is going</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#5c6cf1] animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           
          {/* Category Breakdown Chart */}
          <div className="dashboard-card p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 text-[#5c6cf1] rounded-lg"><PieChartIcon className="w-5 h-5" /></div>
                  <h3 className="font-bold text-slate-800">Expenses by Category</h3>
              </div>
              
              {categoryData.length > 0 ? (
                  <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip 
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                  </div>
              ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                      No expense data available to analyze.
                  </div>
              )}
          </div>

          <div className="space-y-6">
              {/* Top Expenses List */}
              <div className="dashboard-card p-6">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-red-50 text-red-500 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
                      <h3 className="font-bold text-slate-800">Biggest Single Expenses</h3>
                  </div>
                  
                  <div className="divide-y divide-slate-100">
                     {topExpenses.length > 0 ? (
                         topExpenses.map((tx, idx) => (
                             <div key={tx.id} className="py-3 flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                         #{idx + 1}
                                     </div>
                                     <div>
                                         <p className="font-semibold text-slate-800 text-sm">{tx.description}</p>
                                         <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <p className="font-bold text-red-500">{formatCurrency(tx.amount)}</p>
                                     <p className="text-[10px] text-slate-400 uppercase tracking-wider">{tx.category || 'General'}</p>
                                 </div>
                             </div>
                         ))
                     ) : (
                         <div className="py-8 text-center text-slate-400 text-sm">No expenses recorded yet.</div>
                     )}
                  </div>
              </div>

              {/* Category Breakdown List */}
              <div className="dashboard-card p-6">
                 <h3 className="font-bold text-slate-800 mb-4">Category Summary</h3>
                 <div className="space-y-4">
                    {categoryData.map((cat, idx) => {
                        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
                        const percent = ((cat.value / totalExpenses) * 100).toFixed(1);
                        return (
                            <div key={cat.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-700">{cat.name}</span>
                                    <span className="font-bold text-slate-800">{formatCurrency(cat.value)}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="h-2 rounded-full" style={{ width: `${percent}%`, backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                </div>
                            </div>
                        );
                    })}
                 </div>
              </div>
          </div>

        </div>
      )}
    </div>
  );
}
