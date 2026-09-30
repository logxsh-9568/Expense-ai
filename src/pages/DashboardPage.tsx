import React from 'react';
import {
  Calendar,
  Wallet,
  TrendingUp,
  Clock,
  Plus,
  ArrowUpRight,
  Sparkles,
  Edit2,
  Trash2,
  Menu
} from 'lucide-react';
import { Expense, MonthlyBalance, UserProfile } from '../types';
import { MonthlyStats } from '../utils/calculations';
import { formatCurrency, formatDisplayDate, getTodayDateString, isToday } from '../utils/dateUtils';
import { CATEGORIES } from '../utils/categories';

interface DashboardPageProps {
  expenses: Expense[];
  monthlyStats: MonthlyStats;
  currentBalance: MonthlyBalance;
  user: UserProfile;
  onOpenManualAdd: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onNavigateToExpenses: () => void;
  onToggleSidebarMobile: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  expenses,
  monthlyStats,
  currentBalance,
  user,
  onOpenManualAdd,
  onEditExpense,
  onDeleteExpense,
  onNavigateToExpenses,
  onToggleSidebarMobile
}) => {
  const todayDateStr = getTodayDateString();
  const formattedToday = formatDisplayDate(todayDateStr);

  // Filter today's expenses
  const todayExpenses = expenses.filter((e) => isToday(e.date));

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-y-auto">
      {/* Header */}
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
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Financial Dashboard</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{formattedToday}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenManualAdd}
          className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Top 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Today's Spending */}
          <div className="glass-panel anime-item rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Today&apos;s Spending</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formatCurrency(monthlyStats.todaySpending, user.currency)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {todayExpenses.length} transaction{todayExpenses.length === 1 ? '' : 's'} recorded today
            </div>
          </div>

          {/* Card 2: This Week */}
          <div className="glass-panel anime-item rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>This Week</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formatCurrency(monthlyStats.thisWeekSpending, user.currency)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Target: {formatCurrency(monthlyStats.weeklyBudget, user.currency)}
            </div>
          </div>

          {/* Card 3: This Month */}
          <div className="glass-panel anime-item rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>This Month</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formatCurrency(monthlyStats.totalSpent, user.currency)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Used {monthlyStats.spendingPercentage.toFixed(1)}% of starting funds
            </div>
          </div>

          {/* Card 4: Remaining Balance */}
          <div className="glass-panel anime-item rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Remaining Balance</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div
              className={`mt-2 text-xl sm:text-2xl font-bold font-mono tabular-nums ${
                monthlyStats.remainingBalance >= 0 ? 'text-blue-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(monthlyStats.remainingBalance, user.currency)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Out of {formatCurrency(monthlyStats.startingAmount, user.currency)}
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Today's Expense Dashboard + AI Insights & Category preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Expense Dashboard Card (Spans 2 columns) */}
          <div className="lg:col-span-2 glass-panel anime-item rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Today&apos;s Expense Dashboard</h2>
                <p className="text-xs text-slate-500">{formattedToday}</p>
              </div>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {todayExpenses.length} Items
              </span>
            </div>

            {/* List of today's expenses */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[340px] pr-1">
              {todayExpenses.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                  <p>No expenses logged for today yet.</p>
                  <p className="text-slate-500">
                    Use the chatbot or click &ldquo;Add Expense&rdquo; above to track.
                  </p>
                </div>
              ) : (
                todayExpenses.map((e) => {
                  const meta = CATEGORIES[e.category];
                  return (
                    <div
                      key={e.id}
                      className="group flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg shrink-0">
                          {meta?.emoji || ''}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">
                            {e.description}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{e.time}</span>
                            <span>•</span>
                            <span>{e.category}</span>
                            {e.paymentMethod && (
                              <>
                                <span>•</span>
                                <span>{e.paymentMethod}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold font-mono tabular-nums text-slate-900 text-sm">
                          {formatCurrency(e.amount, user.currency)}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button
                            onClick={() => onEditExpense(e)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                            title="Edit expense"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(e.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Today's Total Banner */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between bg-white/30 -mx-5 -mb-5 px-5 py-3 rounded-b-xl">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Today&apos;s Total
              </span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                {formatCurrency(monthlyStats.todaySpending, user.currency)}
              </span>
            </div>
          </div>

          {/* Right Column: AI Insights & Quick Stats */}
          <div className="space-y-6">
            {/* ExpenseAI Insights Card */}
            <div className="glass-panel anime-item rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">ExpenseAI Insights</h3>
              </div>

              <div className="space-y-2.5">
                {monthlyStats.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white/30 text-xs text-slate-700 leading-relaxed border border-slate-100"
                  >
                    {insight}
                  </div>
                ))}
              </div>
            </div>

            {/* Category Snapshot */}
            <div className="glass-panel anime-item rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Top Categories</h3>
                <button
                  onClick={onNavigateToExpenses}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {monthlyStats.categoryBreakdown.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No categories recorded yet.</p>
                ) : (
                  monthlyStats.categoryBreakdown.slice(0, 4).map((item) => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">
                          {CATEGORIES[item.category]?.emoji} {item.category}
                        </span>
                        <span className="font-mono tabular-nums text-slate-900 font-semibold">
                          {formatCurrency(item.amount, user.currency)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: CATEGORIES[item.category]?.chartColor || '#3B82F6'
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
