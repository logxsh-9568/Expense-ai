import { Expense, MonthlyBalance, UserProfile, ChatSession, ChatMessage } from '../types';
import { getCurrentMonthKey, getTodayDateString } from '../utils/dateUtils';

const STORAGE_KEYS = {
  USER: 'expenseai_user_profile',
  BALANCES: 'expenseai_monthly_balances',
  EXPENSES: 'expenseai_expenses',
  CHATS: 'expenseai_chat_sessions',
  MESSAGES: 'expenseai_chat_messages',
  ONBOARDED: 'expenseai_is_onboarded',
  ACTIVE_CHAT_ID: 'expenseai_active_chat_id'
};

const DEFAULT_USER: UserProfile = {
  id: 'usr_default',
  name: 'Logeshwaran',
  email: 'logeshwaran0096@gmail.com',
  currency: '₹',
  currencyCode: 'INR',
  monthlySalary: 50000
};

export const storageService = {
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return DEFAULT_USER;
  },

  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
  },

  isOnboarded(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
  },

  setOnboarded(value: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, value ? 'true' : 'false');
  },

  getMonthlyBalances(): Record<string, MonthlyBalance> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BALANCES);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return {};
  },

  getMonthlyBalance(monthKey: string = getCurrentMonthKey()): MonthlyBalance {
    const balances = this.getMonthlyBalances();
    if (balances[monthKey]) {
      return balances[monthKey];
    }
    // Default initial monthly amount: ₹20,000 as per specification
    const defaultBalance: MonthlyBalance = {
      monthKey,
      startingAmount: 20000,
      salary: 50000,
      weeklyBudget: undefined,
      updatedAt: Date.now()
    };
    balances[monthKey] = defaultBalance;
    this.saveMonthlyBalances(balances);
    return defaultBalance;
  },

  saveMonthlyBalance(balance: MonthlyBalance): void {
    const balances = this.getMonthlyBalances();
    balances[balance.monthKey] = {
      ...balance,
      updatedAt: Date.now()
    };
    this.saveMonthlyBalances(balances);
  },

  saveMonthlyBalances(balances: Record<string, MonthlyBalance>): void {
    localStorage.setItem(STORAGE_KEYS.BALANCES, JSON.stringify(balances));
  },

  getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return [];
  },

  saveExpenses(expenses: Expense[]): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Expense {
    const expenses = this.getExpenses();
    const newExpense: Expense = {
      ...expense,
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now()
    };
    expenses.unshift(newExpense);
    this.saveExpenses(expenses);
    return newExpense;
  },

  updateExpense(id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>): Expense | null {
    const expenses = this.getExpenses();
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) return null;
    expenses[index] = {
      ...expenses[index],
      ...updates
    };
    this.saveExpenses(expenses);
    return expenses[index];
  },

  deleteExpense(id: string): boolean {
    const expenses = this.getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    if (filtered.length !== expenses.length) {
      this.saveExpenses(filtered);
      return true;
    }
    return false;
  },

  getChatSessions(): ChatSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHATS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    // Default chat session
    const defaultChat: ChatSession = {
      id: 'session_default',
      title: 'Daily Expenses',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.saveChatSessions([defaultChat]);
    return [defaultChat];
  },

  saveChatSessions(sessions: ChatSession[]): void {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(sessions));
  },

  getActiveChatId(): string {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT_ID);
    if (id) return id;
    const sessions = this.getChatSessions();
    const active = sessions[0]?.id || 'session_default';
    this.setActiveChatId(active);
    return active;
  },

  setActiveChatId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, id);
  },

  getMessages(sessionId: string): ChatMessage[] {
    try {
      const all = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (all) {
        const parsed = JSON.parse(all);
        if (parsed[sessionId]) return parsed[sessionId];
      }
    } catch {
      // fallback
    }
    return [];
  },

  saveMessages(sessionId: string, messages: ChatMessage[]): void {
    try {
      const all = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      const parsed = all ? JSON.parse(all) : {};
      parsed[sessionId] = messages;
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(parsed));
    } catch {
      // fallback
    }
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.BALANCES);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDED);
  },

  loadSampleDemoData(): void {
    const today = getTodayDateString();
    const [y, m] = today.split('-');
    const currentMonthKey = `${y}-${m}`;

    // Calculate dates for sample items
    const now = new Date();
    const makeDate = (daysAgo: number) => {
      const d = new Date(now);
      d.setDate(now.getDate() - daysAgo);
      const dy = d.getFullYear();
      const dm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${dy}-${dm}-${dd}`;
    };

    const sampleExpenses: Expense[] = [
      {
        id: 'exp_sample_1',
        amount: 30,
        category: 'Food',
        description: 'Morning Tea',
        date: today,
        time: '08:30 AM',
        paymentMethod: 'UPI',
        createdAt: Date.now() - 3600000 * 4
      },
      {
        id: 'exp_sample_2',
        amount: 150,
        category: 'Food',
        description: 'Lunch',
        date: today,
        time: '01:10 PM',
        paymentMethod: 'UPI',
        createdAt: Date.now() - 3600000 * 2
      },
      {
        id: 'exp_sample_3',
        amount: 50,
        category: 'Transport',
        description: 'Bus',
        date: today,
        time: '05:30 PM',
        paymentMethod: 'Cash',
        createdAt: Date.now() - 3600000 * 1
      },
      {
        id: 'exp_sample_4',
        amount: 250,
        category: 'Food',
        description: 'Dinner',
        date: today,
        time: '08:20 PM',
        paymentMethod: 'UPI',
        createdAt: Date.now() - 1800000
      },
      {
        id: 'exp_sample_5',
        amount: 300,
        category: 'Entertainment',
        description: 'Movie ticket',
        date: makeDate(1),
        time: '06:00 PM',
        paymentMethod: 'Card',
        createdAt: Date.now() - 86400000
      },
      {
        id: 'exp_sample_6',
        amount: 650,
        category: 'Shopping',
        description: 'Cotton T-shirt',
        date: makeDate(2),
        time: '04:15 PM',
        paymentMethod: 'UPI',
        createdAt: Date.now() - 86400000 * 2
      },
      {
        id: 'exp_sample_7',
        amount: 1200,
        category: 'Bills',
        description: 'Wifi Broadband Bill',
        date: makeDate(4),
        time: '11:00 AM',
        paymentMethod: 'Net Banking',
        createdAt: Date.now() - 86400000 * 4
      },
      {
        id: 'exp_sample_8',
        amount: 450,
        category: 'Healthcare',
        description: 'Vitamins & Pain relief',
        date: makeDate(6),
        time: '02:30 PM',
        paymentMethod: 'UPI',
        createdAt: Date.now() - 86400000 * 6
      }
    ];

    this.saveExpenses(sampleExpenses);
    this.saveMonthlyBalance({
      monthKey: currentMonthKey,
      startingAmount: 20000,
      salary: 50000,
      weeklyBudget: 5000,
      updatedAt: Date.now()
    });
    this.setOnboarded(true);
  },

  exportExpensesToCSV(): string {
    const expenses = this.getExpenses();
    const headers = ['Date', 'Time', 'Description', 'Category', 'Amount (INR)', 'Payment Method', 'Notes'];
    const rows = expenses.map(e => [
      e.date,
      e.time,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.category,
      e.amount,
      e.paymentMethod || 'Cash',
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};
