import React, { useState, useMemo } from 'react';
import { ExportModal } from '../components/ExportModal';
import {
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  ArrowUpDown,
  Menu,
  FileSpreadsheet
} from 'lucide-react';
import { Expense, Category, UserProfile } from '../types';
import { CATEGORY_LIST, CATEGORIES } from '../utils/categories';
import { formatCurrency, formatDisplayDate, formatShortDate } from '../utils/dateUtils';
import { storageService } from '../services/storageService';

interface ExpensesPageProps {
  expenses: Expense[];
  user: UserProfile;
  onOpenManualAdd: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onToggleSidebarMobile: () => void;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({
  expenses,
  user,
  onOpenManualAdd,
  onEditExpense,
  onDeleteExpense,
  onToggleSidebarMobile
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Extract available months from expenses
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach((e) => {
      const ym = e.date.substring(0, 7);
      months.add(ym);
    });
    return Array.from(months).sort().reverse();
  }, [expenses]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        // Search filter
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          !query ||
          e.description.toLowerCase().includes(query) ||
          e.category.toLowerCase().includes(query) ||
          e.amount.toString().includes(query) ||
          (e.notes && e.notes.toLowerCase().includes(query));

        // Category filter
        const matchesCategory =
          selectedCategory === 'ALL' || e.category === selectedCategory;

        // Month filter
        const matchesMonth =
          selectedMonth === 'ALL' || e.date.startsWith(selectedMonth);

        return matchesSearch && matchesCategory && matchesMonth;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.createdAt - a.createdAt;
        if (sortBy === 'oldest') return a.createdAt - b.createdAt;
        if (sortBy === 'highest') return b.amount - a.amount;
        if (sortBy === 'lowest') return a.amount - b.amount;
        return 0;
      });
  }, [expenses, searchTerm, selectedCategory, selectedMonth, sortBy]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);



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
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Expense Ledger</h1>
            <p className="text-xs text-slate-500">
              Showing {filteredExpenses.length} of {expenses.length} records · Total {formatCurrency(totalFilteredAmount, user.currency)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsExportOpen(true)}
            disabled={expenses.length === 0}
            className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 bg-white/40 border border-slate-200 hover:bg-white/30 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-40"
            title="Export transactions"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={onOpenManualAdd}
            className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-4 sm:p-8 space-y-5 max-w-6xl mx-auto w-full">
        {/* Controls: Search, Category Filter, Month, Sort */}
        <div className="glass-panel anime-item rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by description, notes, category..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
              />
            </div>

            {/* Month Filter */}
            <div className="w-full sm:w-44">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white/40"
              >
                <option value="ALL">All Months</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="w-full sm:w-44">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white/40"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="highest">Sort: Highest Amount</option>
                <option value="lowest">Sort: Lowest Amount</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills (Horizontal Scrolling) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {CATEGORY_LIST.map((cat) => {
              const isSelected = selectedCategory === cat;
              const meta = CATEGORIES[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{meta.emoji}</span>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Expenses Table */}
        <div className="glass-panel anime-item rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredExpenses.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No expenses yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchTerm || selectedCategory !== 'ALL'
                  ? 'No transactions matched your search filters. Try clearing your filters.'
                  : 'Tell ExpenseAI what you spent today and we will keep track of it for you.'}
              </p>
              <button
                onClick={onOpenManualAdd}
                className="mt-4 inline-flex items-center gap-1.5 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add your first expense</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((exp) => {
                    const meta = CATEGORIES[exp.category];
                    return (
                      <tr
                        key={exp.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Date & Time */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-medium text-slate-800 block">
                            {formatShortDate(exp.date)}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            {exp.time}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {exp.description}
                          </span>
                          {exp.notes && (
                            <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                              {exp.notes}
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                            <span>{meta?.emoji}</span>
                            <span>{exp.category}</span>
                          </span>
                        </td>

                        {/* Payment Method */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                          {exp.paymentMethod || 'UPI'}
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className="font-bold font-mono tabular-nums text-slate-900 text-sm">
                            {formatCurrency(exp.amount, user.currency)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => onEditExpense(exp)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit expense"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteExpense(exp.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Delete expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
};
