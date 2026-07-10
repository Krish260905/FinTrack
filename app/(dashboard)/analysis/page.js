"use client";
import { useState, useEffect } from 'react';
import { BarChart3, Loader2, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';

const AnalysisCharts = dynamic(() => import('@/components/AnalysisCharts'), {
  ssr: false,
  loading: () => (
    <>
      <div className="dashboard-card p-6 mb-6 h-[430px] flex items-center justify-center bg-slate-50/50 animate-pulse">
         <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
      <div className="dashboard-card p-6 h-[380px] flex items-center justify-center bg-slate-50/50 animate-pulse">
         <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    </>
  )
});

export default function AnalysisPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('fintrack_token');
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

  // Group by Month
  const monthlyDataRaw = transactions.reduce((acc, curr) => {
      const date = new Date(curr.created_at);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      if (!acc[monthYear]) {
          acc[monthYear] = { name: monthYear, Income: 0, Expense: 0, timestamp: date.getTime() };
      }
      
      if (curr.type === 'income') acc[monthYear].Income += Number(curr.amount);
      if (curr.type === 'expense') acc[monthYear].Expense += Number(curr.amount);
      
      return acc;
  }, {});

  const monthlyData = Object.values(monthlyDataRaw)
      .sort((a, b) => a.timestamp - b.timestamp) // Sort chronologically
      .map(item => {
         item.NetFlow = item.Income - item.Expense;
         return item;
      });

  // Calculate high-level stats
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Financial Analysis</h1>
        <p className="text-sm text-slate-500 mt-1">Cash flow and income vs expense trends</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#5c6cf1] animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
             <div className="dashboard-card p-6 border-t-4 border-t-emerald-500">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Total Income (All-Time)</h3>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{formatCurrency(totalIncome)}</h2>
             </div>
             
             <div className="dashboard-card p-6 border-t-4 border-t-red-500">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Total Expense (All-Time)</h3>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{formatCurrency(totalExpense)}</h2>
             </div>

             <div className="dashboard-card p-6 border-t-4 border-t-[#5c6cf1]">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Average Savings Rate</h3>
                    <Activity className="w-4 h-4 text-[#5c6cf1]" />
                </div>
                <h2 className={`text-2xl font-bold ${Number(savingsRate) >= 0 ? 'text-[#5c6cf1]' : 'text-red-500'}`}>
                    {savingsRate}%
                </h2>
             </div>
          </div>

          <AnalysisCharts monthlyData={monthlyData} formatCurrency={formatCurrency} />
        </>
      )}
    </div>
  );
}
