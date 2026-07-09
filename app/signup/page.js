"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ firstName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google authentication failed');

      localStorage.setItem('fintrack_token', data.token);
      localStorage.setItem('fintrack_user', JSON.stringify(data.user));
      
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-24 relative overflow-y-auto">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 flex lg:hidden items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#5c6cf1] to-[#3642c2] rounded-lg shadow-lg overflow-hidden">
            <svg className="w-4 h-4 text-white transform -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight ml-1">FinTrack</span>
        </div>

        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-800">Create an account</h1>
            <p className="text-slate-500">Enter your details to get started</p>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1] focus:ring-1 focus:ring-[#5c6cf1] text-slate-800 placeholder-slate-400"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1] focus:ring-1 focus:ring-[#5c6cf1] text-slate-800 placeholder-slate-400"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5c6cf1] focus:ring-1 focus:ring-[#5c6cf1] text-slate-800 placeholder-slate-400"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Google authentication failed');
              }}
              theme="outline"
              shape="rectangular"
              size="large"
              text="signup_with"
              width="100%"
            />
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#5c6cf1] font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Branding/Info */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#5c6cf1] via-[#4657e8] to-[#273296] relative flex-col items-center justify-center p-12 lg:p-24 overflow-hidden text-white">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-[128px]"></div>
           <div className="absolute -bottom-24 -left-24 w-[30rem] h-[30rem] bg-[#3642c2] rounded-full blur-[128px]"></div>
        </div>

        {/* Branding Content */}
        <div className="relative z-10 w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="flex items-center gap-3 mb-12">
             <div className="relative flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-2xl overflow-hidden">
                <svg className="w-7 h-7 text-[#5c6cf1] transform -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
             </div>
             <span className="text-3xl font-black tracking-tight text-white drop-shadow-md">FinTrack</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight drop-shadow-sm">
            Master your money,<br/>
            <span className="text-blue-200">shape your future.</span>
          </h1>
          
          <p className="text-lg text-blue-50 leading-relaxed max-w-md font-medium">
            Join thousands of users who have taken control of their financial journey. Track expenses, monitor investments, and hit your savings goals—all in one elegant dashboard.
          </p>
          
          <div className="pt-12 flex items-center gap-4 text-sm font-semibold text-blue-100">
             <div className="flex -space-x-3">
               <div className="w-10 h-10 rounded-full border-2 border-[#4657e8] bg-slate-200 flex items-center justify-center overflow-hidden"><User className="w-5 h-5 text-slate-500" /></div>
               <div className="w-10 h-10 rounded-full border-2 border-[#4657e8] bg-slate-300 flex items-center justify-center overflow-hidden"><User className="w-5 h-5 text-slate-600" /></div>
               <div className="w-10 h-10 rounded-full border-2 border-[#4657e8] bg-slate-400 flex items-center justify-center overflow-hidden"><User className="w-5 h-5 text-slate-700" /></div>
             </div>
             <p>Trusted by 10,000+ users worldwide</p>
          </div>
        </div>
      </div>
    </div>
  );
}
