import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { formatMonthName } from '../utils/dateUtils';

interface OnboardingModalProps {
  isOpen: boolean;
  monthKey: string;
  onComplete: (amount: number) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  monthKey,
  onComplete
}) => {
  const [amount, setAmount] = useState<string>('20000');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    onComplete(isNaN(val) || val <= 0 ? 20000 : val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="glass-panel anime-item rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-xs">
            <Sparkles className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Welcome to ExpenseAI 
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            Let&apos;s set up your monthly spending for <span className="font-semibold text-slate-700">{formatMonthName(monthKey)}</span>.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 text-left space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
                How much do you have available this month?
              </label>
              <div className="relative max-w-xs mx-auto">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-mono text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-blue-600 rounded-xl text-2xl font-mono font-bold text-slate-900 text-center focus:outline-none transition-all shadow-xs"
                  placeholder="20000"
                  required
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                You can easily edit this amount anytime from the balance card.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <span>Start Tracking</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onComplete(20000)}
                className="w-full text-xs text-slate-500 hover:text-slate-700 py-1.5 transition-colors cursor-pointer"
              >
                Keep default ₹20,000 for now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
