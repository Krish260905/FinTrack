"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, Activity } from 'lucide-react';

export default function AnalysisCharts({ monthlyData, formatCurrency }) {
  return (
    <>
      <div className="dashboard-card p-6 mb-6">
         <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-blue-50 text-[#5c6cf1] rounded-lg"><BarChart3 className="w-5 h-5" /></div>
             <h3 className="font-bold text-slate-800">Income vs Expense (Monthly)</h3>
         </div>
         <div className="h-[350px]">
            {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `₹${val}`} />
                        <RechartsTooltip 
                            formatter={(value) => formatCurrency(value)}
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400">Not enough data for chart.</div>
            )}
         </div>
      </div>

      <div className="dashboard-card p-6">
         <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity className="w-5 h-5" /></div>
             <h3 className="font-bold text-slate-800">Net Cash Flow Trends</h3>
         </div>
         <div className="h-[300px]">
            {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `₹${val}`} />
                        <RechartsTooltip 
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line type="monotone" dataKey="NetFlow" name="Net Cash Flow" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400">Not enough data for chart.</div>
            )}
         </div>
      </div>
    </>
  );
}
