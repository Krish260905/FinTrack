"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Activity, ArrowRight, SlidersHorizontal, ChevronDown, CreditCard, TrendingUp, Target, ArrowRightLeft, ReceiptText, LogOut, Calendar } from 'lucide-react';
import { BarChart, Bar, Cell, PieChart, Pie, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [timeframe, setTimeframe] = useState('monthly'); // 'monthly' or 'yearly'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

  // Other States
  const [currentTime, setCurrentTime] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expenseFilter, setExpenseFilter] = useState('recent'); // 'recent', 'highest'
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    // Dynamic Time
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }) + ' | ' + now.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' | IN');
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('fintrack_token');
        const queryParams = new URLSearchParams({
            timeframe,
            year: selectedYear,
            ...(timeframe === 'monthly' ? { month: selectedMonth } : {})
        }).toString();
        
        const res = await fetch(`/api/transactions/dashboard?${queryParams}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const result = await res.json();
          setData(result);
        } else {
          setError("Failed to fetch dashboard data. The database tables might be missing.");
        }
      } catch (err) {
        setError("Network error or server unreachable.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [timeframe, selectedYear, selectedMonth]);

  const handleLogout = () => {
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user');
    window.location.href = '/login';
  };

  if (loading && !data) {
    return <div className="h-full flex items-center justify-center"><Activity className="w-8 h-8 text-[#5c6cf1] animate-spin" /></div>;
  }

  if (error || !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-xl max-w-md text-center shadow-sm">
          <h3 className="font-bold text-lg mb-2">Oops, something went wrong!</h3>
          <p className="text-sm mb-4">{error || "Failed to load data."}</p>
        </div>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('fintrack_user') || '{}');
  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  const COLORS = ['#5c6cf1', '#f59e0b', '#10b981', '#a855f7', '#f43f5e', '#0ea5e9'];

  // Process expenses based on search and filters
  let filteredExpenses = data.recentExpenses || [];

  if (expenseFilter === 'highest') {
      filteredExpenses = [...filteredExpenses].sort((a,b) => Number(b.amount) - Number(a.amount));
  } else {
      filteredExpenses = [...filteredExpenses].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Hi, {user.firstname || 'Ananya'} <span className="text-xl">👋</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track your all expense and transactions</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center text-sm text-slate-500 mr-4 font-medium">
            {currentTime}
          </div>
          
          <div className="relative">
             <div onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-10 h-10 rounded-lg bg-[#5c6cf1] flex items-center justify-center text-white font-bold cursor-pointer hover:bg-[#4f5ee3] transition-colors shadow-sm">
               {user.firstname ? user.firstname.charAt(0).toUpperCase() : 'A'}
             </div>
             {showProfileMenu && (
                 <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 border-b border-slate-50 mb-2 bg-slate-50/50">
                        <p className="font-bold text-slate-800 text-sm leading-tight">{user.firstname} {user.lastname}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email || 'user@example.com'}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Switch Account / Logout
                    </button>
                 </div>
             )}
          </div>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-slate-100 rounded-xl p-4 shadow-sm mb-8">
         <div className="flex items-center gap-2 mb-4 sm:mb-0 bg-slate-50 p-1 rounded-lg border border-slate-100">
             <button 
                 onClick={() => setTimeframe('monthly')}
                 className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeframe === 'monthly' ? 'bg-white text-[#5c6cf1] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                 Monthly
             </button>
             <button 
                 onClick={() => setTimeframe('yearly')}
                 className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeframe === 'yearly' ? 'bg-white text-[#5c6cf1] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                 Yearly
             </button>
         </div>
         
         <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-400 hidden sm:block" />
            {timeframe === 'monthly' && (
                <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-[#5c6cf1] focus:ring-1 focus:ring-[#5c6cf1]"
                >
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </select>
            )}
            <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-[#5c6cf1] focus:ring-1 focus:ring-[#5c6cf1]"
            >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
            </select>
         </div>
      </div>

      {loading && data && (
          <div className="fixed top-0 left-0 w-full h-1 bg-slate-100 z-50">
              <div className="h-full bg-[#5c6cf1] transition-all duration-300 animate-pulse w-full"></div>
          </div>
      )}

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Account Balance */}
        <div className="dashboard-card p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md"><CreditCard className="w-4 h-4" /></span>
              Account Balance
            </div>
            <Link href="/accounts" className="p-1 hover:bg-slate-50 rounded"><ArrowRight className="w-4 h-4 text-slate-400 cursor-pointer" /></Link>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">{formatCurrency(data.accountBalance)}</h3>
          <div className="flex items-center">
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">↗ Active Tracking</span>
          </div>
        </div>

        {/* Expenses (Filtered) */}
        <div className="dashboard-card p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <span className="p-1.5 bg-red-50 text-red-500 rounded-md"><TrendingUp className="w-4 h-4" /></span>
              {timeframe === 'monthly' ? 'Monthly Expenses' : 'Yearly Expenses'}
            </div>
            <Link href="/transactions" className="p-1 hover:bg-slate-50 rounded"><ArrowRight className="w-4 h-4 text-slate-400 cursor-pointer" /></Link>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">{formatCurrency(data.monthlyExpense)}</h3>
          <div className="flex items-center">
            <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
               {timeframe === 'monthly' ? `Total in ${new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'short' })}` : `Total in ${selectedYear}`}
            </span>
          </div>
        </div>

        {/* Total Investment */}
        <div className="dashboard-card p-5 relative overflow-hidden group flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <span className="p-1.5 bg-purple-50 text-purple-600 rounded-md"><Activity className="w-4 h-4" /></span>
              Total Investment
            </div>
            <Link href="/investments" className="p-1 hover:bg-slate-50 rounded"><ArrowRight className="w-4 h-4 text-slate-400 cursor-pointer" /></Link>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{formatCurrency(data.investment?.total_amount || 0)}</h3>
            <div className="flex items-center">
               <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">All-time value tracked</span>
            </div>
          </div>
        </div>

        {/* Goal */}
        <div className="dashboard-card p-5 flex gap-4 items-center relative overflow-hidden group">
          <Link href="/goals" className="absolute top-4 right-4 p-1 hover:bg-slate-50 rounded">
             <ArrowRight className="w-4 h-4 text-slate-400 cursor-pointer" />
          </Link>
          
          <div className="w-16 h-16 rounded-full border-4 border-yellow-100 flex items-center justify-center relative shrink-0">
             <div className="absolute inset-0 rounded-full border-4 border-yellow-400 border-r-transparent border-t-transparent -rotate-45"></div>
             <Target className="w-6 h-6 text-yellow-500" />
          </div>
          
          <div className="min-w-0 pr-4">
             <div className="flex items-center gap-1 text-sm font-semibold text-slate-600 mb-1">
               <span className="p-1 bg-yellow-50 text-yellow-600 rounded"><Target className="w-3 h-3" /></span>
               Goal
             </div>
             <p className="text-sm font-bold text-slate-800 leading-tight truncate">{data.goal?.name || 'No Goals Set'}</p>
             <p className="text-[10px] text-slate-500 mt-1">Target: {formatCurrency(data.goal?.target_amount || 0)}</p>
             <p className="text-[10px] text-slate-500">Saved: {formatCurrency(data.goal?.current_amount || 0)}</p>
          </div>
        </div>
      </div>

      {/* Middle Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 dashboard-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 text-red-500 rounded-md"><TrendingUp className="w-5 h-5" /></div>
              <h3 className="font-bold text-slate-800">
                  {timeframe === 'monthly' ? '6-Month Trend' : 'Yearly Expenses'}
              </h3>
            </div>
            <Link href="/analysis" className="flex items-center gap-2 border rounded-md px-3 py-1.5 text-xs text-slate-600 cursor-pointer hover:bg-slate-50 font-medium transition-colors">
              Full Analysis
            </Link>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={timeframe === 'yearly' ? 20 : 40}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value) => formatCurrency(value)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                  {data.monthlyChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === data.monthlyChart.length - 1 ? '#5c6cf1' : '#a8b4f8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 dashboard-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-500 rounded-md"><Activity className="w-5 h-5" /></div>
              <h3 className="font-bold text-slate-800">Top Categories</h3>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between mt-4">
            <div className="w-40 h-40 relative">
               {data.topCategories && data.topCategories.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={data.topCategories} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                         {data.topCategories.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                     </PieChart>
                   </ResponsiveContainer>
               ) : (
                   <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 text-center px-4 bg-slate-50 rounded-full">No expenses</div>
               )}
            </div>
            <div className="flex-1 w-full space-y-3 mt-6 md:mt-0 md:ml-6">
              {data.topCategories && data.topCategories.length > 0 ? data.topCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>
                    <span className="text-slate-600 font-medium truncate max-w-[80px]" title={cat.category}>{cat.category}</span>
                  </div>
                  <span className="font-bold text-slate-800">{formatCurrency(cat.value)}</span>
                </div>
              )) : (
                  <div className="text-xs text-slate-400 text-center">Select a different timeframe</div>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Link href="/insights" className="text-xs px-4 py-2 bg-slate-50 border rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors">More Insights →</Link>
          </div>
        </div>
      </div>

      {/* Bottom Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 dashboard-card p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-md"><ArrowRightLeft className="w-5 h-5" /></div>
              <h3 className="font-bold text-slate-800">Recent Expenses</h3>
            </div>
            <div className="flex items-center gap-2 relative">
               <button 
                 onClick={() => setShowFilterMenu(!showFilterMenu)}
                 className={`flex items-center gap-2 border rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${showFilterMenu ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
               >
                 <SlidersHorizontal className="w-3 h-3" /> 
                 Sort: {expenseFilter === 'highest' ? 'Highest' : 'Recent'} 
                 <ChevronDown className="w-3 h-3" />
               </button>
               {showFilterMenu && (
                 <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-slate-100 rounded-lg shadow-lg py-1 z-10">
                   <button onClick={() => { setExpenseFilter('recent'); setShowFilterMenu(false); }} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 ${expenseFilter === 'recent' ? 'font-bold text-[#5c6cf1]' : 'text-slate-600'}`}>Most Recent</button>
                   <button onClick={() => { setExpenseFilter('highest'); setShowFilterMenu(false); }} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 ${expenseFilter === 'highest' ? 'font-bold text-[#5c6cf1]' : 'text-slate-600'}`}>Highest Amount</button>
                 </div>
               )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredExpenses.length > 0 ? (
               <table className="w-full text-sm text-left">
                 <thead>
                   <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                     <th className="pb-3 px-2">Description</th>
                     <th className="pb-3 px-2">Amount</th>
                     <th className="pb-3 px-2">Category</th>
                     <th className="pb-3 px-2 hidden sm:table-cell">Date</th>
                   </tr>
                 </thead>
                 <tbody>
                   {filteredExpenses.map((expense) => (
                     <tr key={expense.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                       <td className="py-3 px-2">
                           <p className="font-bold text-slate-800">{expense.description}</p>
                           <p className="text-[10px] text-slate-400">{expense.source || 'Bank'}</p>
                       </td>
                       <td className="py-3 px-2 font-bold text-slate-800">{formatCurrency(expense.amount)}</td>
                       <td className="py-3 px-2 text-slate-600">{expense.category || 'General'}</td>
                       <td className="py-3 px-2 text-slate-500 hidden sm:table-cell">{new Date(expense.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            ) : (
               <div className="text-center py-8 text-slate-500 text-sm">
                  No expenses found for this period.
               </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 dashboard-card p-6 flex flex-col max-h-[400px]">
           <div className="flex justify-between items-center mb-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 text-yellow-600 rounded-md"><ReceiptText className="w-5 h-5" /></div>
              <h3 className="font-bold text-slate-800">Bill & Subscription</h3>
            </div>
            <Link href="/subscriptions" className="p-1 hover:bg-slate-50 rounded"><ArrowRight className="w-4 h-4 text-slate-400 cursor-pointer" /></Link>
          </div>

          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {data.subscriptions && data.subscriptions.length > 0 ? (
                data.subscriptions.map((sub, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${idx % 3 === 0 ? 'bg-red-500' : idx % 3 === 1 ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                        {sub.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm leading-none">{sub.name}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{new Date(sub.next_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-800 text-sm">{formatCurrency(sub.amount)}</span>
                  </div>
                ))
            ) : (
                <div className="text-center py-8 text-slate-500 text-sm">No subscriptions</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
