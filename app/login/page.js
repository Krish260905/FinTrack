"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity, Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMsg('Account created successfully. Please log in.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      localStorage.setItem('fintrack_token', data.token);
      localStorage.setItem('fintrack_user', JSON.stringify(data.user));
      
      window.location.href = '/dashboard';
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
    <>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Welcome back</h1>
        <p className="text-slate-500">Log in to manage your finances</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Link href="#" className="text-xs text-[#5c6cf1] hover:underline">Forgot password?</Link>
          </div>
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
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Log In'}
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
          text="continue_with"
          width="100%"
        />
      </div>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don't have an account?{' '}
        <Link href="/signup" className="text-[#5c6cf1] font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative bg-[#f4f6fa]">
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="relative flex items-center justify-center w-9 h-9 bg-gradient-to-br from-[#5c6cf1] to-[#3642c2] rounded-xl shadow-lg shadow-[#5c6cf1]/40 overflow-hidden">
          <svg className="w-5 h-5 text-white transform -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/20 rounded-full blur-sm" />
          <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-white/10 rounded-full blur-sm" />
        </div>
        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight ml-1">FinTrack</span>
      </div>

      <div className="w-full max-w-md">
        <div className="dashboard-card bg-white p-8 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-xl border border-slate-100 rounded-2xl">
          <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-[#5c6cf1]" /></div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
