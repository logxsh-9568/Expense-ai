import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  CheckCircle2,
  Trash2,
  HelpCircle,
  Menu,
  Sparkles
} from 'lucide-react';
import { ChatMessage, Expense, UserProfile } from '../types';
import { CATEGORIES } from '../utils/categories';
import { formatCurrency, formatShortDate } from '../utils/dateUtils';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ChatPageProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onOpenManualAdd: () => void;
  onOpenEditBalance: () => void;
  onDeleteExpense: (id: string) => void;
  user: UserProfile;
  onToggleSidebarMobile: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  messages,
  onSendMessage,
  onOpenManualAdd,
  onOpenEditBalance,
  onDeleteExpense,
  user,
  onToggleSidebarMobile
}) => {
  const [inputText, setInputText] = useState('');
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isListening,
    transcript,
    isSupported,
    errorMessage: speechError,
    startListening,
    stopListening,
    clearTranscript
  } = useSpeechRecognition();

  // Update input text with speech transcript
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (speechError) {
      setMicNotice(speechError);
      const timer = setTimeout(() => setMicNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [speechError]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    if (isListening) {
      stopListening();
      clearTranscript();
    }

    onSendMessage(text);
    setInputText('');
  };

  const handleToggleVoice = () => {
    if (!isSupported) {
      setMicNotice('Voice recognition is not supported in this browser. Please type your message.');
      setTimeout(() => setMicNotice(null), 4000);
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      clearTranscript();
      startListening();
    }
  };

  const quickActions = [
    { label: '+ Add Expense', action: onOpenManualAdd },
    { label: "Today's Spending", prompt: "Show today's expenses" },
    { label: 'Weekly Report', prompt: 'Weekly report' },
    { label: 'Remaining Balance', prompt: 'How much money do I have left?' },
    { label: 'Set Budget', action: onOpenEditBalance }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-200 glass-panel anime-item flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebarMobile}
            className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-md md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">ExpenseAI</h1>
              <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">
                Active Assistant
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Talk. Track. Understand your spending.</p>
          </div>
        </div>

        <button
          onClick={() => onSendMessage('Help')}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-slate-100 transition-colors"
          title="See example queries"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Examples & Help</span>
        </button>
      </header>

      {/* Mic Status Banner */}
      {micNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between animate-in fade-in duration-200">
          <span>{micNotice}</span>
          <button
            onClick={() => setMicNotice(null)}
            className="text-amber-900 font-bold ml-3 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-xl mx-auto my-auto text-center py-12 px-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              What have you spent today?
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Type naturally or use the mic. ExpenseAI extracts the amount, category, and date automatically.
            </p>

            {/* Starter Suggestion chips */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {[
                { label: ' Food', text: 'I spent ₹150 for lunch today.' },
                { label: ' Transport', text: 'Spent 80 on bus today.' },
                { label: '️ Shopping', text: 'Bought shoes for ₹1200.' },
                { label: ' Inquiry', text: 'How much money do I have left?' }
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(s.text)}
                  className="p-3 text-xs rounded-xl border border-slate-200 bg-white/40 hover:border-blue-400 hover:bg-blue-50/40 text-slate-700 transition-all text-left shadow-xs cursor-pointer"
                >
                  <div className="font-semibold text-slate-800 mb-0.5">{s.label}</div>
                  <div className="text-slate-500">&ldquo;{s.text}&rdquo;</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${
                    isUser
                      ? 'bg-slate-800 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {isUser ? user.name.charAt(0) : 'E'}
                </div>

                {/* Message Body */}
                <div className={`space-y-2 max-w-[85%] sm:max-w-[78%]`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-white/40 text-slate-800 border border-slate-200/80 rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Rich Expense Card embedded in Assistant Response */}
                    {msg.expenseAction && msg.expenseAction.expense && (
                      <div className={`mt-3 pt-3 border-t border-slate-100 bg-white/30 -mx-2 -mb-1 px-3 py-2.5 rounded-xl transition-all ${msg.expenseAction.type === 'deleted' ? 'opacity-50 grayscale' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">
                              {CATEGORIES[msg.expenseAction.expense.category]?.emoji || ''}
                            </span>
                            <div>
                              <div className={`font-semibold text-xs ${msg.expenseAction.type === 'deleted' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                {msg.expenseAction.expense.description}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {msg.expenseAction.expense.category} · {formatShortDate(msg.expenseAction.expense.date)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold font-mono tabular-nums text-sm ${msg.expenseAction.type === 'deleted' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                              {formatCurrency(msg.expenseAction.expense.amount, user.currency)}
                            </div>
                            {msg.expenseAction.type === 'deleted' ? (
                              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                                Undone
                              </div>
                            ) : (
                              <button
                                onClick={() => msg.expenseAction?.expense && onDeleteExpense(msg.expenseAction.expense.id)}
                                className="text-[10px] text-slate-400 hover:text-rose-600 inline-flex items-center gap-0.5 mt-0.5 transition-colors cursor-pointer"
                                title="Delete/Undo transaction"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Undo</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Balance update ticker */}
                        {msg.expenseAction.type !== 'deleted' && (
                          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                            <span>Today: {formatCurrency(msg.expenseAction.todayTotal, user.currency)}</span>
                            <span>Left: {formatCurrency(msg.expenseAction.remainingBalance, user.currency)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`text-[10px] text-slate-400 px-1 ${
                      isUser ? 'text-right' : 'text-left'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area & Quick Actions */}
      <div className="p-3 sm:p-4 glass-panel border-t border-white/40 backdrop-blur-md">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {quickActions.map((qa, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (qa.action) qa.action();
                  else if (qa.prompt) onSendMessage(qa.prompt);
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 bg-white/30 hover:bg-slate-100 hover:border-slate-300 text-slate-700 transition-colors cursor-pointer shrink-0"
              >
                {qa.label}
              </button>
            ))}
          </div>

          {/* Voice Listening Active Waveform Banner */}
          {isListening && (
            <div className="flex items-center justify-between px-3 py-1.5 glass-panel border border-white/50 rounded-lg text-xs text-slate-800 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span className="font-semibold">Listening... Speak clearly (e.g. &ldquo;I spent 250 rupees for lunch&rdquo;)</span>
              </div>
              <button
                onClick={stopListening}
                className="font-bold text-rose-600 hover:text-rose-800 underline"
              >
                Stop
              </button>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 glass-panel border-white/50 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all shadow-xs"
          >
            {/* Quick manual add / attachment icon */}
            <button
              type="button"
              onClick={onOpenManualAdd}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Add manual expense entry"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input field */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening to your voice...'
                  : 'Message ExpenseAI (e.g. "I spent ₹150 for lunch today")'
              }
              className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-900 focus:outline-none placeholder:text-slate-400"
            />

            {/* Voice microphone button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isListening
                  ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 ring-2 ring-rose-400'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/60'
              }`}
              title={isListening ? 'Stop listening' : 'Speak expense (Web Speech API)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
