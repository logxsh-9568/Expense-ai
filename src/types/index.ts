export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Education'
  | 'Healthcare'
  | 'Travel'
  | 'Others';

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Net Banking' | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "01:10 PM"
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export interface MonthlyBalance {
  monthKey: string; // YYYY-MM e.g. "2026-09"
  startingAmount: number; // e.g. 20000
  salary?: number;
  weeklyBudget?: number;
  categoryBudgets?: Partial<Record<Category, number>>;
  updatedAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
  currencyCode: string;
  monthlySalary?: number;
  themeGradient?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  expenseAction?: {
    type: 'added' | 'deleted' | 'updated';
    expense: Expense;
    remainingBalance: number;
    todayTotal: number;
  };
  insights?: string[];
  suggestedActions?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export type ActivePage = 'chat' | 'dashboard' | 'expenses' | 'budget' | 'reports' | 'settings' | 'profile';
