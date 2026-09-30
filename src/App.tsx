/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActivePage,
  Expense,
  MonthlyBalance,
  UserProfile,
  ChatSession,
  ChatMessage
} from './types';
import { storageService } from './services/storageService';
import { parserService } from './services/parserService';
import { calculateFinancialStats } from './utils/calculations';
import { getCurrentMonthKey, getTodayDateString } from './utils/dateUtils';
import { Sidebar } from './components/Sidebar';
import { BalanceModal } from './components/BalanceModal';
import { ManualExpenseModal } from './components/ManualExpenseModal';
import { OnboardingModal } from './components/OnboardingModal';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { BudgetPage } from './pages/BudgetPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  // Authentication & Onboarding
  const [user, setUser] = useState<UserProfile>(() => storageService.getUserProfile());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('expenseai_logged_in') === 'true';
  });
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => storageService.isOnboarded());

  // Current view state
  const [activePage, setActivePage] = useState<ActivePage>('chat');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState<boolean>(false);

  // Month & financial data
  const currentMonthKey = useMemo(() => getCurrentMonthKey(), []);
  const [currentBalance, setCurrentBalance] = useState<MonthlyBalance>(() =>
    storageService.getMonthlyBalance(currentMonthKey)
  );
  const [expenses, setExpenses] = useState<Expense[]>(() => storageService.getExpenses());

  // Chat sessions & messages
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() =>
    storageService.getChatSessions()
  );
  const [activeChatId, setActiveChatId] = useState<string>(() =>
    storageService.getActiveChatId()
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    storageService.getMessages(storageService.getActiveChatId())
  );

  // Modals
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isManualExpenseModalOpen, setIsManualExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Sync messages when active chat changes
  useEffect(() => {
    const sessionMessages = storageService.getMessages(activeChatId);
    setMessages(sessionMessages);
  }, [activeChatId]);

  // Derived financial stats - recalculated dynamically whenever expenses or balance change
  const monthlyStats = useMemo(() => {
    return calculateFinancialStats(
      expenses,
      currentBalance.startingAmount,
      currentBalance.monthKey,
      currentBalance.weeklyBudget
    );
  }, [expenses, currentBalance]);

  // Login handler
  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    storageService.saveUserProfile(newUser);
    localStorage.setItem('expenseai_logged_in', 'true');
    setIsLoggedIn(true);

    // If never onboarded, OnboardingModal will trigger next
    if (!storageService.isOnboarded()) {
      setIsOnboarded(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('expenseai_logged_in');
    setIsLoggedIn(false);
  };

  // Onboarding completion
  const handleCompleteOnboarding = (startingAmount: number) => {
    const updatedBalance: MonthlyBalance = {
      ...currentBalance,
      startingAmount,
      weeklyBudget: Math.round(startingAmount / 4),
      updatedAt: Date.now()
    };
    storageService.saveMonthlyBalance(updatedBalance);
    setCurrentBalance(updatedBalance);
    storageService.setOnboarded(true);
    setIsOnboarded(true);
    setActivePage('chat');
  };

  // Balance edit save
  const handleSaveBalance = (updated: MonthlyBalance) => {
    storageService.saveMonthlyBalance(updated);
    setCurrentBalance(updated);
  };

  // Manual Expense Add or Edit
  const handleSaveManualExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      const updated = storageService.updateExpense(existingId, expenseData);
      if (updated) {
        setExpenses(storageService.getExpenses());
      }
    } else {
      const created = storageService.addExpense(expenseData);
      setExpenses(storageService.getExpenses());

      // Add a quick confirmation note in active chat
      const confirmMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: `Manually added ${user.currency}${created.amount} for ${created.description} (${created.category}).`,
        timestamp: Date.now(),
        expenseAction: {
          type: 'added',
          expense: created,
          remainingBalance: currentBalance.startingAmount - (monthlyStats.totalSpent + created.amount),
          todayTotal: monthlyStats.todaySpending + created.amount
        }
      };
      const updatedMessages = [...messages, confirmMsg];
      setMessages(updatedMessages);
      storageService.saveMessages(activeChatId, updatedMessages);
    }
    setEditingExpense(null);
  };

  // Delete expense
  const handleDeleteExpense = useCallback((id: string) => {
    storageService.deleteExpense(id);
    setExpenses(storageService.getExpenses());
    
    setMessages(prev => {
      const updated = prev.map(m => {
        if (m.expenseAction && m.expenseAction.expense.id === id) {
          return {
            ...m,
            expenseAction: { ...m.expenseAction, type: 'deleted' as const }
          };
        }
        return m;
      });
      storageService.saveMessages(activeChatId, updated);
      return updated;
    });
  }, [activeChatId]);

  // Send message in Chatbot
  const handleSendMessage = useCallback(
    async (inputText: string) => {
      const userMsg: ChatMessage = {
        id: `msg_u_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        sender: 'user',
        text: inputText,
        timestamp: Date.now()
      };

      // 1. Show user message instantly
      setMessages(prev => {
        const newMsgs = [...prev, userMsg];
        storageService.saveMessages(activeChatId, newMsgs);
        return newMsgs;
      });

      // 2. Process AI inference
      const intent = await parserService.parseInput(inputText);
      const response = parserService.generateResponse(
        intent,
        expenses,
        currentBalance.startingAmount,
        currentBalance.monthKey
      );

      // If response includes new expense, add to storage
      let actualExpense = response.newExpense;
      if (response.newExpense) {
        actualExpense = storageService.addExpense({
          amount: response.newExpense.amount,
          category: response.newExpense.category,
          description: response.newExpense.description,
          date: response.newExpense.date,
          time: response.newExpense.time,
          paymentMethod: response.newExpense.paymentMethod,
          notes: response.newExpense.notes
        });
        setExpenses(storageService.getExpenses());
      }

      // If action updated balance
      if (intent.type === 'action' && intent.actionKind === 'set_balance' && intent.value) {
        const updatedBalance: MonthlyBalance = {
          ...currentBalance,
          startingAmount: intent.value,
          updatedAt: Date.now()
        };
        storageService.saveMonthlyBalance(updatedBalance);
        setCurrentBalance(updatedBalance);
      }

      if (intent.type === 'action' && intent.actionKind === 'set_budget' && intent.value) {
        const updatedBalance: MonthlyBalance = {
          ...currentBalance,
          weeklyBudget: intent.value,
          updatedAt: Date.now()
        };
        storageService.saveMonthlyBalance(updatedBalance);
        setCurrentBalance(updatedBalance);
      }

      // 3. Show Bot Response
      // Replace the dummy expense with the actual database expense so Undo works
      const finalExpenseAction = response.expenseAction;
      if (finalExpenseAction && actualExpense) {
        finalExpenseAction.expense = actualExpense;
      }

      const botMsg: ChatMessage = {
        id: `msg_b_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        sender: 'assistant',
        text: response.text,
        timestamp: Date.now() + 1,
        expenseAction: finalExpenseAction,
        insights: response.insights
      };

      if (intent.type === 'action' && intent.actionKind === 'clear_chat') {
        // Only keep the bot's confirmation message
        const newMsgs = [botMsg];
        setMessages(newMsgs);
        storageService.saveMessages(activeChatId, newMsgs);
      } else if (intent.type === 'action' && intent.actionKind === 'new_chat') {
        // Create new session
        const newSessionId = `session_${Date.now()}`;
        const newSession: ChatSession = {
          id: newSessionId,
          title: `Chat ${chatSessions.length + 1}`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const updatedSessions = [newSession, ...chatSessions];
        storageService.saveChatSessions(updatedSessions);
        setChatSessions(updatedSessions);
        setActiveChatId(newSessionId);
        
        // Save the bot's response message into the new chat
        const newMsgs = [botMsg];
        setMessages(newMsgs);
        storageService.saveMessages(newSessionId, newMsgs);
      } else {
        setMessages(prev => {
          const newMsgs = [...prev, botMsg];
          storageService.saveMessages(activeChatId, newMsgs);
          return newMsgs;
        });
      }
    },
    [expenses, currentBalance, activeChatId, chatSessions]
  );

  // Chat session management
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: `Chat ${chatSessions.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updated = [newSession, ...chatSessions];
    storageService.saveChatSessions(updated);
    setChatSessions(updated);
    setActiveChatId(newSession.id);
    storageService.setActiveChatId(newSession.id);
    setMessages([]);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    storageService.setActiveChatId(id);
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    const updated = chatSessions.map((s) => (s.id === id ? { ...s, title: newTitle } : s));
    storageService.saveChatSessions(updated);
    setChatSessions(updated);
  };

  const handleDeleteChat = (id: string) => {
    if (chatSessions.length <= 1) return;
    const filtered = chatSessions.filter((s) => s.id !== id);
    storageService.saveChatSessions(filtered);
    setChatSessions(filtered);
    if (activeChatId === id) {
      const nextId = filtered[0].id;
      setActiveChatId(nextId);
      storageService.setActiveChatId(nextId);
    }
  };

  // Clear data
  const handleClearAllData = () => {
    storageService.clearAllData();
    setExpenses([]);
    setMessages([]);
    const resetBalance: MonthlyBalance = {
      monthKey: currentMonthKey,
      startingAmount: 20000,
      salary: 50000,
      weeklyBudget: 5000,
      updatedAt: Date.now()
    };
    storageService.saveMonthlyBalance(resetBalance);
    setCurrentBalance(resetBalance);
  };

  // Load sample demo data
  const handleLoadSampleData = () => {
    storageService.loadSampleDemoData();
    setExpenses(storageService.getExpenses());
    setCurrentBalance(storageService.getMonthlyBalance(currentMonthKey));
  };

  // If not logged in, render Login Page
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const defaultGradient = "from-indigo-200 via-purple-200 to-pink-200";
  const bgClass = user?.themeGradient || defaultGradient;

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-gradient-to-br ${bgClass} text-slate-900 font-sans`}>
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        monthlyStats={monthlyStats}
        currentBalance={currentBalance}
        onOpenEditBalance={() => setIsBalanceModalOpen(true)}
        chatSessions={chatSessions}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        user={user}
        onLogout={handleLogout}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {activePage === 'chat' && (
          <ChatPage
            messages={messages}
            onSendMessage={handleSendMessage}
            onOpenManualAdd={() => {
              setEditingExpense(null);
              setIsManualExpenseModalOpen(true);
            }}
            onOpenEditBalance={() => setIsBalanceModalOpen(true)}
            onDeleteExpense={handleDeleteExpense}
            user={user}
            onToggleSidebarMobile={() => setIsOpenMobileSidebar(true)}
          />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage
            expenses={expenses}
            monthlyStats={monthlyStats}
            currentBalance={currentBalance}
            user={user}
            onOpenManualAdd={() => {
              setEditingExpense(null);
              setIsManualExpenseModalOpen(true);
            }}
            onEditExpense={(exp) => {
              setEditingExpense(exp);
              setIsManualExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
            onNavigateToExpenses={() => setActivePage('expenses')}
            onToggleSidebarMobile={() => setIsOpenMobileSidebar(true)}
          />
        )}

        {activePage === 'expenses' && (
          <ExpensesPage
            expenses={expenses}
            user={user}
            onOpenManualAdd={() => {
              setEditingExpense(null);
              setIsManualExpenseModalOpen(true);
            }}
            onEditExpense={(exp) => {
              setEditingExpense(exp);
              setIsManualExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
            onToggleSidebarMobile={() => setIsOpenMobileSidebar(true)}
          />
        )}

        {activePage === 'budget' && (
          <BudgetPage
            monthlyStats={monthlyStats}
            currentBalance={currentBalance}
            user={user}
            onOpenEditBalance={() => setIsBalanceModalOpen(true)}
            onToggleSidebarMobile={() => setIsOpenMobileSidebar(true)}
          />
        )}

        {activePage === 'reports' && (
          <ReportsPage
            monthlyStats={monthlyStats}
            currentBalance={currentBalance}
            user={user}
            onToggleSidebarMobile={() => setIsOpenMobileSidebar(true)}
          />
        )}

        {activePage === 'settings' && (
          <SettingsPage
            user={user}
            onUpdateUser={(updated) => {
              setUser(updated);
              storageService.saveUserProfile(updated);
            }}
            currentBalance={currentBalance}
            onUpdateBalance={handleSaveBalance}
            onClearAllData={handleClearAllData}
            onLoadSampleData={handleLoadSampleData}
            onToggleSidebarMobile={() => setIsOpenMobileSidebar(true)}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage
            user={user}
            onUpdateUser={(updated) => {
              setUser(updated);
              storageService.saveUserProfile(updated);
            }}
            onToggleSidebarMobile={() => setIsOpenMobileSidebar(true)}
          />
        )}
      </main>

      {/* Modals */}
      <BalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        currentBalance={currentBalance}
        onSave={handleSaveBalance}
      />

      <ManualExpenseModal
        isOpen={isManualExpenseModalOpen}
        onClose={() => {
          setIsManualExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveManualExpense}
        editingExpense={editingExpense}
      />

      <OnboardingModal
        isOpen={!isOnboarded && isLoggedIn}
        monthKey={currentMonthKey}
        onComplete={handleCompleteOnboarding}
      />
    </div>
  );
}
