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
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white relative overflow-hidden">
      
      {/* Decorative Background Shape */}
      <div className="hidden md:block absolute top-0 left-0 w-[65%] h-full bg-[#5c6cf1] z-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
      <div className="md:hidden absolute top-0 left-0 w-full h-72 bg-[#5c6cf1] z-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>

      {/* Left Side Content */}
      <div className="w-full md:w-[45%] p-8 md:p-16 lg:p-24 flex flex-col pt-16 md:pt-32 text-white relative z-10 min-h-[300px] md:min-h-screen">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-sm">Welcome<br/>Back!</h1>
        <p className="text-lg md:text-xl text-blue-50 mb-10 font-medium drop-shadow-sm leading-snug">
          To keep connected with<br/>us please login.
        </p>
        <Link href="/login" className="inline-block border-2 border-white text-white rounded-full px-12 py-3 font-medium hover:bg-white hover:text-[#5c6cf1] transition-colors w-max shadow-sm text-lg">
          Log In
        </Link>
      </div>

      {/* Right Side Content (Form) */}
      <div className="w-full md:w-[55%] p-8 md:p-16 lg:p-24 flex flex-col justify-center relative z-10 bg-transparent min-h-screen md:min-h-0">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-700 mb-1">Sign Up</h2>
          </div>

            {error && (
              <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-slate-600 font-medium">First Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#5c6cf1] focus:ring-1 focus:ring-[#5c6cf1] text-slate-800 placeholder-slate-400"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-600 font-medium">Email address <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#5c6cf1] focus:ring-1 focus:ring-[#5c6cf1] text-slate-800 placeholder-slate-400"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-600 font-medium">Password <span className="text-red-500">*</span></label>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#5c6cf1] focus:ring-1 focus:ring-[#5c6cf1] text-slate-800 placeholder-slate-400"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <button type="submit" disabled={loading} className="w-full border-2 border-[#5c6cf1] text-[#5c6cf1] hover:bg-[#5c6cf1] hover:text-white font-medium py-2.5 rounded-full transition-colors flex items-center justify-center gap-2 mt-6">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign Up'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-400 uppercase tracking-wider">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google authentication failed')}
                theme="outline"
                shape="pill"
                size="large"
                text="signup_with"
                width="100%"
              />
            </div>
          </div>
        </div>
      </div>
  );
}
