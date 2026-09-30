import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Expense, Category, PaymentMethod } from '../types';
import { CATEGORY_LIST, CATEGORIES } from '../utils/categories';
import { getTodayDateString, getCurrentTimeString } from '../utils/dateUtils';

interface ManualExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'>, existingId?: string) => void;
  editingExpense?: Expense | null;
}

export const ManualExpenseModal: React.FC<ManualExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExpense
}) => {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<Category>('Food');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [time, setTime] = useState<string>(getCurrentTimeString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDescription(editingExpense.description);
      setDate(editingExpense.date);
      setTime(editingExpense.time || getCurrentTimeString());
      setPaymentMethod(editingExpense.paymentMethod || 'UPI');
      setNotes(editingExpense.notes || '');
    } else {
      setAmount('');
      setCategory('Food');
      setDescription('');
      setDate(getTodayDateString());
      setTime(getCurrentTimeString());
      setPaymentMethod('UPI');
      setNotes('');
    }
  }, [editingExpense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSave(
      {
        amount: parsedAmount,
        category,
        description: description.trim() || category,
        date,
        time,
        paymentMethod,
        notes: notes.trim()
      },
      editingExpense ? editingExpense.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="glass-panel anime-item rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {editingExpense ? 'Update transaction details' : 'Log a financial transaction manually'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-base font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                placeholder="150"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
              {CATEGORY_LIST.map((cat) => {
                const meta = CATEGORIES[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-800 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white/40 hover:bg-white/30 text-slate-700'
                    }`}
                  >
                    <span>{meta.emoji}</span>
                    <span className="truncate">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              placeholder="e.g. Lunch with team, Bus fare, Groceries"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white/40"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white/40"
                >
                  <option value="UPI">UPI / GPay</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit/Debit Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Other">Other</option>
                </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              placeholder="e.g. Split with Rahul, Office reimbursement"
            />
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
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
