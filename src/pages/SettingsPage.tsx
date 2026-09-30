import React, { useState } from 'react';
import {
  User,
  DollarSign,
  Sliders,
  Database,
  Check,
  Download,
  Trash2,
  RefreshCw,
  Menu
} from 'lucide-react';
import { UserProfile, MonthlyBalance, Expense } from '../types';
import { storageService } from '../services/storageService';

interface SettingsPageProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  currentBalance: MonthlyBalance;
  onUpdateBalance: (updated: MonthlyBalance) => void;
  onClearAllData: () => void;
  onLoadSampleData: () => void;
  onToggleSidebarMobile: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onUpdateUser,
  currentBalance,
  onUpdateBalance,
  onClearAllData,
  onLoadSampleData,
  onToggleSidebarMobile
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currencySymbol, setCurrencySymbol] = useState(user.currency || '₹');
  const [currencyCode, setCurrencyCode] = useState(user.currencyCode || 'INR');
  const [monthlyAmount, setMonthlyAmount] = useState(currentBalance.startingAmount.toString());
  const [salary, setSalary] = useState(currentBalance.salary?.toString() || '');
  const [themeGradient, setThemeGradient] = useState(user.themeGradient || 'from-indigo-200 via-purple-200 to-pink-200');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Update user profile
    onUpdateUser({
      ...user,
      name,
      email,
      currency: currencySymbol,
      currencyCode: currencyCode,
      themeGradient: themeGradient
    });

    // Update balance
    const parsedAmount = parseFloat(monthlyAmount) || 20000;
    const parsedSalary = salary ? parseFloat(salary) : undefined;

    onUpdateBalance({
      ...currentBalance,
      startingAmount: parsedAmount,
      salary: parsedSalary,
      weeklyBudget: undefined, // Let calculations.ts dynamically calculate it from remaining balance
      updatedAt: Date.now()
    });

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleExportJSON = () => {
    const expenses = storageService.getExpenses();
    const data = {
      user,
      currentBalance,
      expenses,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ExpenseAI_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-y-auto">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-200 glass-panel anime-item flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebarMobile}
            className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-md md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-xs text-slate-500">Configure profile, currency, balance limits, and data exports</p>
          </div>
        </div>

        {savedNotice && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in duration-200">
            <Check className="w-3.5 h-3.5" />
            <span>Settings saved successfully</span>
          </span>
        )}
      </header>

      {/* Main Content Area */}
      <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: User Profile */}
          <div className="glass-panel anime-item rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
              <User className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">User Profile</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Financial Settings */}
          <div className="glass-panel anime-item rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Financial Settings</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Default Currency
                </label>
                <select
                  value={`${currencySymbol}_${currencyCode}`}
                  onChange={(e) => {
                    const [sym, code] = e.target.value.split('_');
                    setCurrencySymbol(sym);
                    setCurrencyCode(code);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white/40"
                >
                  <option value="₹_INR">₹ INR (Indian Rupee)</option>
                  <option value="$_USD">$ USD (US Dollar)</option>
                  <option value="€_EUR">€ EUR (Euro)</option>
                  <option value="£_GBP">£ GBP (British Pound)</option>
                  <option value="A$_AUD">A$ AUD (Australian Dollar)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Monthly Available Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>


            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="max-w-xs">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Monthly Salary / Income ({currencySymbol}) [Optional]
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  placeholder="50000"
                />
              </div>
            </div>
          </div>

          {/* Section 2.5: Aesthetics & Theme */}
          <div className="glass-panel anime-item rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">App Theme & Aesthetics</h2>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Overall Gradient Background
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'from-indigo-200 via-purple-200 to-pink-200', name: 'Twilight Dawn', colors: 'bg-gradient-to-r from-indigo-300 to-pink-300' },
                  { id: 'from-blue-200 via-cyan-200 to-emerald-200', name: 'Ocean Breeze', colors: 'bg-gradient-to-r from-blue-300 to-emerald-300' },
                  { id: 'from-rose-200 via-orange-200 to-amber-200', name: 'Sunset Glow', colors: 'bg-gradient-to-r from-rose-300 to-amber-300' },
                  { id: 'from-slate-200 via-slate-100 to-zinc-200', name: 'Minimal Frost', colors: 'bg-gradient-to-r from-slate-300 to-zinc-300' },
                  { id: 'from-violet-200 via-fuchsia-200 to-rose-200', name: 'Cyber Violet', colors: 'bg-gradient-to-r from-violet-300 to-rose-300' },
                  { id: 'from-emerald-200 via-teal-200 to-cyan-200', name: 'Mint Leaf', colors: 'bg-gradient-to-r from-emerald-300 to-cyan-300' }
                ].map((theme) => {
                  const isSelected = themeGradient === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setThemeGradient(theme.id)}
                      className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20' 
                          : 'border-slate-200 hover:border-blue-300 bg-white/50 hover:bg-white/80'
                      }`}
                    >
                      <div className={`w-full h-12 rounded-lg shadow-inner ${theme.colors}`}></div>
                      <span className="text-[10px] font-semibold text-slate-700">{theme.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Financial Preferences</span>
            </button>
          </div>
        </form>


      </div>
    </div>
  );
};
