import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { User, Mail, Shield, Check, Menu, Camera } from 'lucide-react';

interface ProfilePageProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onToggleSidebarMobile?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser, onToggleSidebarMobile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setMessage({ text: 'Please fill in both password fields.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }

    // Simulate password update
    console.log('Password updated successfully for:', user.email);
    setMessage({ text: 'Password has been successfully reset.', type: 'success' });
    setNewPassword('');
    setConfirmPassword('');
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...user, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-transparent">
      <div className="flex items-center gap-3 p-4 bg-white/40 border-b border-slate-200 md:hidden">
        <button
          onClick={onToggleSidebarMobile}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Profile</h1>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="hidden md:block">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Profile</h2>
            <p className="text-sm text-slate-500 mt-1">Manage your account details and security settings.</p>
          </div>

        <div className="grid gap-6">
          {/* User Details Read-Only Section */}
          <div className="glass-panel anime-item rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">Account Details</h3>
            </div>
            <div className="p-6 space-y-6">
              
              {/* Avatar Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-4 border-white shadow-md">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-slate-400">{user.name.charAt(0)}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handlePhotoUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">Profile Photo</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Upload a new avatar. Recommended size is 256x256px.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={user.name}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white/30 rounded-xl text-sm text-slate-600 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 ml-1">Your username cannot be changed.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white/30 rounded-xl text-sm text-slate-600 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 ml-1">Your email address is permanent and cannot be changed.</p>
              </div>
            </div>
          </div>

          {/* Password Reset Section */}
          <div className="glass-panel anime-item rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">Security & Password</h3>
            </div>
            
            <form onSubmit={handlePasswordReset} className="p-6 space-y-5">
              {message && (
                <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                  {message.type === 'success' && <Check className="w-4 h-4" />}
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
