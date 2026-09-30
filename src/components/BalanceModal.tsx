import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { MonthlyBalance } from '../types';
import { formatMonthName } from '../utils/dateUtils';

interface BalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: MonthlyBalance;
  onSave: (updated: MonthlyBalance) => void;
}

export const BalanceModal: React.FC<BalanceModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  onSave
}) => {
  const [startingAmount, setStartingAmount] = useState<string>(
    currentBalance.startingAmount ? currentBalance.startingAmount.toString() : '20000'
  );
  const [salary, setSalary] = useState<string>(
    currentBalance.salary ? currentBalance.salary.toString() : ''
  );
  const [monthKey, setMonthKey] = useState<string>(currentBalance.monthKey);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(startingAmount) || 0;
    const salaryVal = salary ? parseFloat(salary) : undefined;

    onSave({
      ...currentBalance,
      monthKey,
      startingAmount: amountVal,
      salary: salaryVal,
      weeklyBudget: undefined, // Let calculations.ts dynamically calculate it from remaining balance
      updatedAt: Date.now()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="glass-panel anime-item rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Edit Monthly Balance</h3>
            <p className="text-xs text-slate-500 mt-0.5">Set default available amount and targets for the month</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Month Period
            </label>
            <div className="w-full px-3 py-2 border border-slate-200 bg-white/30 rounded-lg text-sm text-slate-600 font-medium">
              {formatMonthName(monthKey)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Managing for the current system month (IST).
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Monthly Available Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="number"
                min="0"
                step="100"
                value={startingAmount}
                onChange={(e) => {
                  setStartingAmount(e.target.value);
                  // auto-suggest weekly budget if empty
                  if (!weeklyBudget) {
                    const parsed = parseFloat(e.target.value);
                    if (!isNaN(parsed)) {
                      setWeeklyBudget(Math.round(parsed / 4).toString());
                    }
                  }
                }}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                placeholder="20000"
                required
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Starting funds for this calendar month. All expenses deduct from this.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Monthly Salary / Income (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="number"
                min="0"
                step="500"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                placeholder="e.g. 50000"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Reference income for financial ratio calculations.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white/40 border border-slate-200 rounded-lg hover:bg-white/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Save Balance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
