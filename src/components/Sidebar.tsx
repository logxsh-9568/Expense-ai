import React, { useState } from 'react';
import {
  MessageSquare,
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  Settings,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  ChevronRight,
  TrendingDown,
  X
} from 'lucide-react';
import { ActivePage, MonthlyBalance, ChatSession, UserProfile } from '../types';
import { formatCurrency, formatMonthName } from '../utils/dateUtils';
import { MonthlyStats } from '../utils/calculations';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  monthlyStats: MonthlyStats;
  currentBalance: MonthlyBalance;
  onOpenEditBalance: () => void;
  chatSessions: ChatSession[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onDeleteChat: (id: string) => void;
  user: UserProfile;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  monthlyStats,
  currentBalance,
  onOpenEditBalance,
  chatSessions,
  activeChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  user,
  onLogout,
  isOpenMobile,
  onCloseMobile
}) => {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState<string>('');

  const navItems = [
    { id: 'chat' as ActivePage, label: 'Chat', icon: MessageSquare },
    { id: 'dashboard' as ActivePage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses' as ActivePage, label: 'Expenses', icon: Receipt },
    { id: 'budget' as ActivePage, label: 'Budget', icon: PiggyBank },
    { id: 'reports' as ActivePage, label: 'Reports', icon: BarChart3 },
    { id: 'settings' as ActivePage, label: 'Settings', icon: Settings }
  ];

  const handleStartRename = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingChatId(session.id);
    setEditTitleInput(session.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitleInput.trim()) {
      onRenameChat(id, editTitleInput.trim());
    }
    setEditingChatId(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 glass-panel border-r border-slate-200/50 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col">
          {/* Logo Brand */}
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-lg shadow-xs">
                💸
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg tracking-tight">ExpenseAI</span>
                <span className="block text-[11px] text-slate-400 font-medium -mt-1">
                  Personal Financial Assistant
                </span>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Details Section */}
          <div 
            onClick={() => {
              onNavigate('profile');
              onCloseMobile();
            }}
            className="glass-panel anime-item border border-slate-200 rounded-xl p-3 mb-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-slate-900 truncate">
                  {user.name}
                </span>
                <span className="block text-[11px] text-slate-500 truncate">
                  {user.email}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Primary Button */}
          <button
            onClick={() => {
              onNewChat();
              onNavigate('chat');
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs mb-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1 mb-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>



          {/* Financial Balance Card */}
          <div className="glass-panel anime-item rounded-xl p-3.5 border border-slate-200/80 mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Available This Month
              </span>
              <button
                onClick={onOpenEditBalance}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <span>Edit</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {formatCurrency(monthlyStats.remainingBalance, user.currency)}
            </div>

            <div className="text-[11px] text-slate-400 mt-0.5 mb-2.5">
              Period: {formatMonthName(currentBalance.monthKey)}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-300 ${
                  monthlyStats.spendingPercentage > 90
                    ? 'bg-rose-500'
                    : monthlyStats.spendingPercentage > 75
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(monthlyStats.spendingPercentage, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono tabular-nums">
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Starting</span>
                <span>{formatCurrency(monthlyStats.startingAmount, user.currency)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] font-sans">Spent ({monthlyStats.spendingPercentage.toFixed(0)}%)</span>
                <span className="text-rose-600 flex items-center justify-end gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  {formatCurrency(monthlyStats.totalSpent, user.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Chats Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Recent Chats
              </span>
            </div>

            <div className="space-y-0.5 overflow-y-auto flex-1 pr-1">
              {chatSessions.map((session) => {
                const isActive = activeChatId === session.id && activePage === 'chat';
                const isEditing = editingChatId === session.id;

                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      onSelectChat(session.id);
                      onNavigate('chat');
                      onCloseMobile();
                    }}
                    className={`group flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-600 hover:glass-panel anime-item hover:text-slate-900'
                    }`}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitleInput}
                        onChange={(e) => setEditTitleInput(e.target.value)}
                        onBlur={() => handleSaveRename(session.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(session.id);
                          if (e.key === 'Escape') setEditingChatId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-1.5 py-0.5 border border-blue-500 rounded bg-white/20 backdrop-blur-md border-white/50 text-xs text-slate-800 focus:outline-none"
                      />
                    ) : (
                      <>
                        <span className="truncate flex-1 pr-2">{session.title}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                          <button
                            onClick={(e) => handleStartRename(e, session)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                            title="Rename chat"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {chatSessions.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChat(session.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Delete chat"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
