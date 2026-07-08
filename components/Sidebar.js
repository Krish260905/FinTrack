"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  ReceiptText, 
  TrendingUp, 
  CreditCard, 
  Target,
  LineChart,
  BarChart3,
  PieChart,
  Settings,
  HelpCircle,
  HeadphonesIcon,
  LogOut,
  Gem
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user');
    window.location.href = '/login';
  };

  const navGroups = [
    {
      title: "General",
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'All Expenses', href: '/transactions', icon: ArrowRightLeft },
        { name: 'Bill & Subscription', href: '/subscriptions', icon: ReceiptText },
        { name: 'Investment', href: '/investments', icon: TrendingUp },
        { name: 'Card', href: '/accounts', icon: CreditCard },
        { name: 'Goals', href: '/goals', icon: Target },
      ]
    },
    {
      title: "Tools",
      items: [
        { name: 'Insights', href: '/insights', icon: PieChart },
        { name: 'Analysis', href: '/analysis', icon: BarChart3 },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#f4f6fa] border-r border-[#e2e8f0] flex flex-col hidden md:flex h-full py-6">
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className="text-2xl font-black text-[#5c6cf1]">N</div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">FinTrack</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <p className="px-4 text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              {group.title}
            </p>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={isActive ? "sidebar-link-active" : "sidebar-link"}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-4 mt-auto">
        <Link href="/settings" className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === '/settings' ? 'bg-[#5c6cf1] text-white shadow-md shadow-[#5c6cf1]/20' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>

    </aside>
  );
}
