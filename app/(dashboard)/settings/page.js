"use client";
import { useState, useEffect } from 'react';
import { User, Shield, Loader2, Save, Mail, Phone, MapPin, DollarSign, Lock } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState({});
  const [profileData, setProfileData] = useState({ firstname: '', lastname: '', country: '', currency: '', contact: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('fintrack_token');
      const res = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const result = await res.json();
        setUser(result.user);
        setProfileData({
          firstname: result.user.firstname || '',
          lastname: result.user.lastname || '',
          country: result.user.country || '',
          currency: result.user.currency || '',
          contact: result.user.contact || ''
        });
      }
    } catch (e) { console.error(e); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    setMsg({ type: '', text: '' });
    try {
      const token = localStorage.getItem('fintrack_token');
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if(res.ok) {
        setMsg({ type: 'success', text: 'Profile updated successfully' });
        localStorage.setItem('fintrack_user', JSON.stringify(data.user));
      } else throw new Error(data.message);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoadingProfile(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoadingPassword(true);
    setMsg({ type: '', text: '' });
    if(passwordData.newPassword !== passwordData.confirmPassword) {
        setMsg({ type: 'error', text: "New passwords do not match." });
        setLoadingPassword(false);
        return;
    }
    try {
      const token = localStorage.getItem('fintrack_token');
      const res = await fetch('/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })
      });
      const data = await res.json();
      if(res.ok) {
        setMsg({ type: 'success', text: 'Password changed successfully' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else throw new Error(data.message);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoadingPassword(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account settings and preferences</p>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium shadow-sm transition-all ${msg.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
          {msg.type === 'success' ? <Shield className="w-5 h-5 text-emerald-500" /> : <Shield className="w-5 h-5 text-red-500" />}
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Profile Information Card */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><User className="w-5 h-5"/></div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Profile Information</h2>
              <p className="text-xs text-slate-500">Update your personal details</p>
            </div>
          </div>
          
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">First Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#5c6cf1] focus:ring-1 focus:ring-[#5c6cf1] transition-all text-sm" 
                  value={profileData.firstname} 
                  onChange={e=>setProfileData({...profileData, firstname: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Last Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#5c6cf1] focus:ring-1 focus:ring-[#5c6cf1] transition-all text-sm" 
                  value={profileData.lastname} 
                  onChange={e=>setProfileData({...profileData, lastname: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> Email Address</label>
                <input 
                  type="email" 
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed" 
                  value={user.email || ''} 
                />
                <p className="text-[10px] text-slate-400">Email cannot be changed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> Country</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#5c6cf1] focus:ring-1 focus:ring-[#5c6cf1] transition-all text-sm" 
                  value={profileData.country} 
                  onChange={e=>setProfileData({...profileData, country: e.target.value})} 
                  placeholder="e.g. India"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><DollarSign className="w-4 h-4 text-slate-400" /> Currency</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#5c6cf1] focus:ring-1 focus:ring-[#5c6cf1] transition-all text-sm" 
                  value={profileData.currency} 
                  onChange={e=>setProfileData({...profileData, currency: e.target.value})}
                >
                  <option value="">Select Currency</option>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> Contact Number</label>
              <input 
                 type="text" 
                 className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#5c6cf1] focus:ring-1 focus:ring-[#5c6cf1] transition-all text-sm" 
                 value={profileData.contact} 
                 onChange={e=>setProfileData({...profileData, contact: e.target.value})} 
                 placeholder="+91"
              />
            </div>
            
            <div className="pt-4 flex justify-end">
                <button type="submit" disabled={loadingProfile} className="bg-[#5c6cf1] hover:bg-[#4f5ee3] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-[#5c6cf1]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                {loadingProfile ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} Save Profile
                </button>
            </div>
          </form>
        </div>

        {/* Security Card */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm h-fit">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600"><Lock className="w-5 h-5"/></div>
                <div>
                <h2 className="text-lg font-bold text-slate-800">Security</h2>
                <p className="text-xs text-slate-500">Update your password</p>
                </div>
            </div>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-5">
                <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Current Password</label>
                <input 
                    required 
                    type="password" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm" 
                    value={passwordData.currentPassword} 
                    onChange={e=>setPasswordData({...passwordData, currentPassword: e.target.value})} 
                    placeholder="••••••••"
                />
                </div>
                <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">New Password</label>
                <input 
                    required 
                    type="password" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm" 
                    value={passwordData.newPassword} 
                    onChange={e=>setPasswordData({...passwordData, newPassword: e.target.value})} 
                    placeholder="••••••••"
                />
                </div>
                <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                <input 
                    required 
                    type="password" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm" 
                    value={passwordData.confirmPassword} 
                    onChange={e=>setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                    placeholder="••••••••"
                />
                </div>
                
                <div className="pt-4">
                    <button type="submit" disabled={loadingPassword} className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                    {loadingPassword ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Update Password'}
                    </button>
                </div>
            </form>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                 <Shield className="w-8 h-8 text-slate-400 mb-3" />
                 <h3 className="text-sm font-bold text-slate-700">Account Secured</h3>
                 <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Your financial data is encrypted and stored securely.</p>
            </div>
        </div>

      </div>
    </div>
  );
}
