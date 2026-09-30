import React, { useState } from 'react';
import {
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Settings,
  Menu,
  Edit2
} from 'lucide-react';
import { Expense, MonthlyBalance, UserProfile } from '../types';
import { MonthlyStats } from '../utils/calculations';
import { formatCurrency, formatMonthName } from '../utils/dateUtils';
import { CATEGORIES, CATEGORY_LIST } from '../utils/categories';

interface BudgetPageProps {
  monthlyStats: MonthlyStats;
  currentBalance: MonthlyBalance;
  user: UserProfile;
  onOpenEditBalance: () => void;
  onToggleSidebarMobile: () => void;
}

export const BudgetPage: React.FC<BudgetPageProps> = ({
  monthlyStats,
  currentBalance,
  user,
  onOpenEditBalance,
  onToggleSidebarMobile
}) => {
  const isApproachingLimit = monthlyStats.weeklyBudgetPercentage >= 80 && monthlyStats.weeklyBudgetPercentage <= 100;
  const isOverBudget = monthlyStats.weeklyBudgetPercentage > 100;

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
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Budget & Pacing</h1>
            <p className="text-xs text-slate-500">
              Plan and control your weekly and monthly limits · {formatMonthName(currentBalance.monthKey)}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenEditBalance}
          className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-white/40 border border-slate-200 hover:bg-white/30 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Limits</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Weekly Budget Hero Card */}
        <div className="glass-panel anime-item rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Weekly Allocation
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Current Week Spending Progress
              </h2>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs text-slate-500 block">Weekly Limit</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {formatCurrency(monthlyStats.weeklyBudget, user.currency)}
              </span>
            </div>
          </div>

          {/* Warning Banner if approaching limit */}
          {isOverBudget ? (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                You have exceeded your weekly budget by{' '}
                <strong className="font-mono">{formatCurrency(monthlyStats.thisWeekSpending - monthlyStats.weeklyBudget, user.currency)}</strong>. Consider cooling down non-essential expenses for the remainder of this week.
              </span>
            </div>
          ) : isApproachingLimit ? (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                You have used most of your weekly budget. Try keeping discretionary spending lower for the next few days.
              </span>
            </div>
          ) : (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Your spending pace is healthy. You have{' '}
                <strong className="font-mono">{formatCurrency(monthlyStats.weeklyBudgetRemaining, user.currency)}</strong> left in this week&apos;s budget.
              </span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">
                Spent: <strong className="font-mono text-slate-900">{formatCurrency(monthlyStats.thisWeekSpending, user.currency)}</strong>
              </span>
              <span className="font-mono text-slate-500 font-semibold">
                {monthlyStats.weeklyBudgetPercentage.toFixed(1)}% of weekly limit
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverBudget
                    ? 'bg-rose-500'
                    : isApproachingLimit
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(monthlyStats.weeklyBudgetPercentage, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>₹0</span>
              <span>{formatCurrency(monthlyStats.weeklyBudget, user.currency)}</span>
            </div>
          </div>

          {/* Daily breakdown for current week */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block mb-3">
              Daily Distribution This Week
            </span>
            <div className="grid grid-cols-7 gap-2">
              {monthlyStats.weeklyDailyBreakdown.map((day) => (
                <div
                  key={day.dayName}
                  className="bg-white/30 border border-slate-100 rounded-lg p-2 text-center"
                >
                  <span className="text-[11px] font-bold text-slate-700 block">{day.dayName}</span>
                  <span className="text-[10px] text-slate-400 block mb-1">{day.shortDate.split(' ')[1]}</span>
                  <span className="text-xs font-mono tabular-nums font-semibold text-slate-900 block">
                    {formatCurrency(day.amount, user.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Budget Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel anime-item rounded-xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Monthly Starting Amount</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
              {formatCurrency(monthlyStats.startingAmount, user.currency)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Configured for {formatMonthName(currentBalance.monthKey)}</p>
          </div>

          <div className="glass-panel anime-item rounded-xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Total Spent So Far</span>
            <span className="text-xl font-bold font-mono tabular-nums text-rose-600 mt-1 block">
              {formatCurrency(monthlyStats.totalSpent, user.currency)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">{monthlyStats.spendingPercentage.toFixed(1)}% of starting amount</p>
          </div>

          <div className="glass-panel anime-item rounded-xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Remaining This Month</span>
            <span className="text-xl font-bold font-mono tabular-nums text-blue-600 mt-1 block">
              {formatCurrency(monthlyStats.remainingBalance, user.currency)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">{(100 - monthlyStats.spendingPercentage).toFixed(1)}% available funds</p>
          </div>
        </div>

        {/* Category Budget Recommendations */}
        <div className="glass-panel anime-item rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Category Allocations</h3>
              <p className="text-xs text-slate-500">Spending breakdown vs proportional monthly allocation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORY_LIST.slice(0, 6).map((cat) => {
              const meta = CATEGORIES[cat];
              const spent = monthlyStats.categoryBreakdown.find((c) => c.category === cat)?.amount || 0;
              // Proportional reference target
              const refTarget = Math.round(monthlyStats.startingAmount * 0.2); // ~20%
              const pct = refTarget > 0 ? (spent / refTarget) * 100 : 0;

              return (
                <div key={cat} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span>{meta.emoji}</span>
                      <span>{cat}</span>
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {formatCurrency(spent, user.currency)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: meta.chartColor
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>Spent</span>
                    <span>Target ~{formatCurrency(refTarget, user.currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
