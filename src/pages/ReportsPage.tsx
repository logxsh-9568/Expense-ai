import React, { useState } from 'react';
import { ExportModal } from '../components/ExportModal';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Sparkles,
  Menu,
  Download
} from 'lucide-react';
import { MonthlyStats } from '../utils/calculations';
import { MonthlyBalance, UserProfile } from '../types';
import { formatCurrency, formatMonthName } from '../utils/dateUtils';
import { DonutChart } from '../components/charts/DonutChart';
import { WeeklyBarChart } from '../components/charts/WeeklyBarChart';
import { DailyTrendLineChart } from '../components/charts/DailyTrendLineChart';
import { storageService } from '../services/storageService';

interface ReportsPageProps {
  monthlyStats: MonthlyStats;
  currentBalance: MonthlyBalance;
  user: UserProfile;
  onToggleSidebarMobile: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  monthlyStats,
  currentBalance,
  user,
  onToggleSidebarMobile
}) => {
  const [reportTab, setReportTab] = useState<'monthly' | 'weekly'>('monthly');

  const [isExportOpen, setIsExportOpen] = useState(false);

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
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Financial Reports</h1>
            <p className="text-xs text-slate-500">
              Aggregated spending analytics and category breakdown · {formatMonthName(currentBalance.monthKey)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setReportTab('monthly')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                reportTab === 'monthly'
                  ? 'bg-white/40 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly View
            </button>
            <button
              onClick={() => setReportTab('weekly')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                reportTab === 'weekly'
                  ? 'bg-white/40 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly View
            </button>
          </div>

          <button
            onClick={() => setIsExportOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 bg-white/40 border border-slate-200 hover:bg-white/30 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Download report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Key KPI Summary Row */}
        {reportTab === 'monthly' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel anime-item rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Total Monthly Expenses</span>
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                {formatCurrency(monthlyStats.totalSpent, user.currency)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {monthlyStats.spendingPercentage.toFixed(1)}% of starting funds
              </span>
            </div>

            <div className="glass-panel anime-item rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Remaining Balance</span>
              <span className="text-xl font-bold font-mono tabular-nums text-blue-600 mt-1 block">
                {formatCurrency(monthlyStats.remainingBalance, user.currency)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                From {formatCurrency(monthlyStats.startingAmount, user.currency)}
              </span>
            </div>

            <div className="glass-panel anime-item rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Average Daily Spend</span>
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                {formatCurrency(monthlyStats.dailyAverage, user.currency)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">On active expense days</span>
            </div>

            <div className="glass-panel anime-item rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Highest Category</span>
              <span className="text-base font-bold text-slate-900 mt-1 block truncate">
                {monthlyStats.highestCategory ? monthlyStats.highestCategory.category : 'None'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block font-mono">
                {monthlyStats.highestCategory
                  ? `${formatCurrency(monthlyStats.highestCategory.amount, user.currency)} (${monthlyStats.highestCategory.percentage.toFixed(0)}%)`
                  : '—'}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel anime-item rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Total This Week</span>
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                {formatCurrency(monthlyStats.thisWeekSpending, user.currency)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block font-mono">
                Budget: {formatCurrency(monthlyStats.weeklyBudget, user.currency)}
              </span>
            </div>

            <div className="glass-panel anime-item rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Remaining Budget</span>
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 mt-1 block">
                {formatCurrency(monthlyStats.weeklyBudgetRemaining, user.currency)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">For current week</span>
            </div>

            <div className="glass-panel anime-item rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Daily Average</span>
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                {formatCurrency(Math.round(monthlyStats.thisWeekSpending / 7), user.currency)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Across 7 days</span>
            </div>

            <div className="glass-panel anime-item rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Budget Pacing</span>
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                {monthlyStats.weeklyBudgetPercentage.toFixed(0)}%
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Of weekly allocation</span>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Category Distribution Donut */}
          <div className="glass-panel anime-item rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Category Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of expenses by category</p>
            </div>

            <div className="flex-1 flex items-center justify-center py-2">
              <DonutChart
                data={monthlyStats.categoryBreakdown}
                totalAmount={monthlyStats.totalSpent}
              />
            </div>
          </div>

          {/* Chart 2: Weekly Spending Bar Chart OR Daily Trend */}
          <div className="glass-panel anime-item rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {reportTab === 'weekly' ? 'Daily Spending This Week' : 'Weekly Spending Pace'}
              </h3>
              <p className="text-xs text-slate-500">Day-by-day distribution from Monday to Sunday</p>
            </div>

            <div className="flex-1 flex items-center justify-center py-2">
              <WeeklyBarChart data={monthlyStats.weeklyDailyBreakdown} />
            </div>
          </div>
        </div>

        {/* Full-width Line Chart: Daily Spending Trend Across Month */}
        <div className="glass-panel anime-item rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900">Daily Spending Trend</h3>
            <p className="text-xs text-slate-500">
              Trajectory of expenses throughout {formatMonthName(currentBalance.monthKey)}
            </p>
          </div>

          <DailyTrendLineChart data={monthlyStats.monthDailyTrend} />
        </div>

        {/* ExpenseAI Insights & Observations */}
        <div className="glass-panel anime-item rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">ExpenseAI Financial Insights</h3>
              <p className="text-xs text-slate-500">Data-driven observations from your actual ledger records</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {monthlyStats.insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/30 border border-slate-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
};
