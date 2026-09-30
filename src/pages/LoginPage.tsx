import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) return;

    if (!isLoginMode) {
      if (!nameInput.trim()) return;
      // Simulate storing to our database for first time creation (Sign up)
      console.log("Creating new credentials:", { name: nameInput, email: emailInput, password: passwordInput });
    } else {
      // Simulate checking from our database (Log in)
      console.log("Logging in with credentials:", { email: emailInput, password: passwordInput });
    }

    const derivedName = nameInput.trim() || emailInput.split('@')[0];
    onLogin({
      id: `usr_${Date.now()}`,
      name: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
      email: emailInput.trim(),
      currency: '₹',
      currencyCode: 'INR',
      monthlySalary: 50000
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200">
      {/* Top minimal header */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm shadow-sm">
            💸
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">ExpenseAI</span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="max-w-md mx-auto w-full my-auto py-8">
        <div className="glass-panel anime-item rounded-2xl organic-card border border-slate-100 p-8 sm:p-10 text-center relative animate-slide-up-fade">
          {/* Back Button for Sign Up Mode */}
          {!isLoginMode && (
            <button 
              onClick={() => setIsLoginMode(true)}
              className="absolute top-6 left-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Go back to Log in"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Brand Mark */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center mx-auto mb-5 shadow-sm animate-slide-up-fade delay-75 hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight animate-slide-up-fade delay-150">
            {isLoginMode ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 mb-8 animate-slide-up-fade delay-150">
            {isLoginMode ? 'Log in to your account with your credentials.' : 'Sign up to create your credentials.'}
          </p>

          <div className="space-y-4 animate-slide-up-fade delay-200">
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {!isLoginMode && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Alex"
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 bg-white/60 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none handcrafted-input"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@domain.com"
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 bg-white/60 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none handcrafted-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder={isLoginMode ? "Enter your password" : "Set a strong password"}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 bg-white/60 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none handcrafted-input"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold uppercase tracking-wide rounded-xl transition-all duration-300 ease-out shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer mt-6"
              >
                <span>{isLoginMode ? 'Log In' : 'Sign Up'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-xs text-slate-500">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-blue-600 font-bold hover:text-indigo-600 transition-colors focus:outline-none cursor-pointer relative group"
              >
                {isLoginMode ? 'Sign up' : 'Log in'}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </button>
            </div>
          </div>

          {/* Privacy statement */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Private & secure. Data stays safely on your device.</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-2 font-medium">
        ExpenseAI · Talk. Track. Understand your spending.
      </footer>
    </div>
  );
};
