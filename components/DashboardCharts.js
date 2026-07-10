"use client";
import { BarChart, Bar, Cell, PieChart, Pie, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import Link from 'next/link';
import { TrendingUp, Activity } from 'lucide-react';

export default function DashboardCharts({ data, timeframe, formatCurrency, COLORS }) {
  return (
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
  );
}
