import * as ort from 'onnxruntime-web';
import { Category, Expense } from '../types';
import { CATEGORIES, CATEGORY_LIST } from '../utils/categories';
import { parseRelativeDate, getCurrentTimeString, formatCurrency, isToday, isThisWeek, isSameMonth } from '../utils/dateUtils';
import { calculateFinancialStats } from '../utils/calculations';

// Initialize ONNX runtime path if needed
ort.env.wasm.wasmPaths = '/';

let onnxSession: ort.InferenceSession | null = null;

async function getOnnxSession() {
  if (!onnxSession) {
    try {
      onnxSession = await ort.InferenceSession.create('/expense_model.onnx');
    } catch (e) {
      console.error("Failed to load ONNX model:", e);
    }
  }
  return onnxSession;
}

export interface ParsedExpenseIntent {
  type: 'add_expense';
  amount: number;
  category: Category;
  description: string;
  date: string;
  time: string;
  paymentMethod?: 'Cash' | 'UPI' | 'Card' | 'Net Banking';
  confidence: number;
}

export interface ParsedQueryIntent {
  type: 'query';
  queryKind:
    | 'today_expenses'
    | 'remaining_balance'
    | 'category_spending'
    | 'biggest_expense'
    | 'highest_category'
    | 'weekly_report'
    | 'day_expenses'
    | 'help'
    | 'general';
  categoryFilter?: Category;
  dayFilter?: string;
}

export interface ParsedActionIntent {
  type: 'action';
  actionKind: 'set_balance' | 'set_budget' | 'clear_data' | 'clear_chat' | 'new_chat';
  value?: number;
}

export type ParsedIntent = ParsedExpenseIntent | ParsedQueryIntent | ParsedActionIntent;

export const parserService = {
  /**
   * Main entry point: takes user input and determines if it's an expense entry,
   * a financial memory query, or a configuration command.
   */
  async parseInput(input: string): Promise<ParsedIntent> {
    const raw = input.trim();
    const lower = raw.toLowerCase();

    // 1. Check for commands / setting adjustments
    const setBalanceMatch = lower.match(/(?:set|update|change)\s+(?:balance|monthly|amount)\s+(?:to\s+)?(?:[₹rs.]*\s*)?(\d+[\d,]*)/i);
    if (setBalanceMatch) {
      const val = parseInt(setBalanceMatch[1].replace(/,/g, ''), 10);
      return { type: 'action', actionKind: 'set_balance', value: val };
    }

    const setBudgetMatch = lower.match(/(?:set|update|change)\s+(?:weekly\s+)?budget\s+(?:to\s+)?(?:[₹rs.]*\s*)?(\d+[\d,]*)/i);
    if (setBudgetMatch) {
      const val = parseInt(setBudgetMatch[1].replace(/,/g, ''), 10);
      return { type: 'action', actionKind: 'set_budget', value: val };
    }

    if (lower.includes('new chat') || lower.includes('start new chat')) {
      return { type: 'action', actionKind: 'new_chat' };
    }

    if (
      lower.includes('clear chat') || 
      lower.includes('clear history') || 
      lower.includes('start over')
    ) {
      return { type: 'action', actionKind: 'clear_chat' };
    }

    // 2. Check for queries
    if (
      lower.includes('how much money do i have left') ||
      lower.includes('remaining balance') ||
      lower.includes('money left') ||
      lower.includes('balance left') ||
      lower.includes('available balance')
    ) {
      return { type: 'query', queryKind: 'remaining_balance' };
    }

    if (
      lower.includes("show today's expenses") ||
      lower.includes('today expenses') ||
      lower.includes('todays expenses') ||
      lower.includes("today's spending") ||
      lower.includes('spend today') ||
      lower.includes('spent today')
    ) {
      return { type: 'query', queryKind: 'today_expenses' };
    }

    if (
      lower.includes('biggest expense') ||
      lower.includes('largest expense') ||
      lower.includes('highest expense') ||
      lower.includes('most expensive')
    ) {
      return { type: 'query', queryKind: 'biggest_expense' };
    }

    if (
      lower.includes('spend most on') ||
      lower.includes('highest spending category') ||
      lower.includes('top category') ||
      lower.includes('most spent category')
    ) {
      return { type: 'query', queryKind: 'highest_category' };
    }

    if (
      lower.includes('weekly report') ||
      lower.includes('weekly summary') ||
      lower.includes('spend this week') ||
      lower.includes('spending this week')
    ) {
      return { type: 'query', queryKind: 'weekly_report' };
    }

    const dayMatch = lower.match(/(?:what did i spend on|expenses on|spent on|how much on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|yesterday|\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}(?:st|nd|rd|th)?)/i);
    if (dayMatch) {
      return { type: 'query', queryKind: 'day_expenses', dayFilter: dayMatch[1].toLowerCase() };
    }

    for (const cat of CATEGORY_LIST) {
      const catLower = cat.toLowerCase();
      if (
        (lower.includes(`on ${catLower}`) || lower.includes(`for ${catLower}`)) &&
        (lower.includes('how much') || lower.includes('total'))
      ) {
        return {
          type: 'query',
          queryKind: 'category_spending',
          categoryFilter: cat
        };
      }
    }

    if (lower === 'help' || lower.includes('what can you do') || lower.includes('how to use')) {
      return { type: 'query', queryKind: 'help' };
    }

    // 3. Try to extract Expense Entry
    const expense = await this.extractExpenseDetails(raw);
    if (expense) {
      return expense;
    }

    return { type: 'query', queryKind: 'general' };
  },

  /**
   * Parses natural language into expense components:
   * Amount, Category, Description, Date, Payment Method
   */
  async extractExpenseDetails(input: string): Promise<ParsedExpenseIntent | null> {
    const amountPatterns = [
      /(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:₹|rs\.?|rupees|bucks|inr)/i,
      /(?:spent|paid|cost|costed|gave)\s*(?:\w+\s+){0,3}(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i,
      /\b(\d+(?:\.\d+)?)\s*(?:for|on)\b/i,
      /\b(\d+(?:\.\d+)?)\s*[.!?'"]*$/i,
      /^(\d+(?:\.\d+)?)\b/i
    ];

    let detectedAmount: number | null = null;

    for (let i = 0; i < amountPatterns.length; i++) {
      const match = input.match(amountPatterns[i]);
      if (match && match[1]) {
        const val = parseFloat(match[1]);
        if (!isNaN(val) && val > 0 && val < 10000000) {
          detectedAmount = val;
          break;
        }
      }
    }

    if (!detectedAmount) {
      return null;
    }

    const { dateStr } = parseRelativeDate(input);
    const lower = input.toLowerCase();

    // 1. Isolate the main reason FIRST (by stripping out filler)
    // We pass 'Others' temporarily just to fulfill the signature, we handle empty later
    let rawDescription = this.extractDescription(input, detectedAmount, 'Others');
    const descLower = rawDescription.toLowerCase();

    // 2. Try Regex Keywords on the ISOLATED description first (highest accuracy)
    let detectedCategory: Category = 'Others';
    let highestKeywordScore = 0;

    for (const [catName, meta] of Object.entries(CATEGORIES)) {
      for (const kw of meta.keywords) {
        const regex = new RegExp(`\\b${kw}s?\\b`, 'i');
        // Check clean description first, fallback to raw input
        if (regex.test(descLower) || (highestKeywordScore === 0 && regex.test(lower))) {
          const score = kw.length > 3 ? 3 : 2;
          // Give extra weight if it matches the clean isolated description
          const finalScore = regex.test(descLower) ? score + 2 : score; 
          
          if (finalScore > highestKeywordScore) {
            highestKeywordScore = finalScore;
            detectedCategory = catName as Category;
          }
        }
      }
    }

    // 3. Fallback to ML Category prediction using ONNX
    if (highestKeywordScore === 0 || highestKeywordScore <= 2) {
      try {
        const session = await getOnnxSession();
        if (session) {
          // Pass the CLEAN description to the model, not the noisy input
          const tensor = new ort.Tensor('string', [rawDescription || input], [1, 1]);
          const results = await session.run({ input_text: tensor });
          
          const labelTensor = results['output_label'];
          if (labelTensor && labelTensor.data && labelTensor.data.length > 0) {
            const predicted = labelTensor.data[0] as string;
            const normalized = predicted.charAt(0).toUpperCase() + predicted.slice(1).toLowerCase();
            if (CATEGORY_LIST.includes(normalized as Category)) {
              detectedCategory = normalized as Category;
              highestKeywordScore = 1; // Indicate ML success
            }
          }
        }
      } catch (e) {
        console.error("ONNX inference failed:", e);
      }
    }

    // Fix up description if it was completely empty
    if (!rawDescription || rawDescription.length < 2 || rawDescription === 'Expense') {
      rawDescription = detectedCategory === 'Others' ? 'Expense' : detectedCategory;
    }

    let paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Net Banking' = 'UPI';
    if (lower.includes('cash')) paymentMethod = 'Cash';
    else if (lower.includes('card') || lower.includes('credit') || lower.includes('debit')) paymentMethod = 'Card';
    else if (lower.includes('net banking') || lower.includes('bank transfer')) paymentMethod = 'Net Banking';
    else if (lower.includes('upi') || lower.includes('gpay') || lower.includes('phonepe') || lower.includes('paytm')) paymentMethod = 'UPI';

    return {
      type: 'add_expense',
      amount: detectedAmount,
      category: detectedCategory,
      description: rawDescription,
      date: dateStr,
      time: getCurrentTimeString(),
      paymentMethod,
      confidence: highestKeywordScore > 0 ? 0.95 : 0.8
    };
  },

  /**
   * Cleans input to isolate the expense description
   */
  extractDescription(input: string, amount: number, category: Category): string {
    let clean = input
      .replace(/i spent|spent|i paid|paid|bought|added|cost|costed|gave|give|just|only/gi, '')
      .replace(/rupees|rupee|rs\.?|₹|bucks|inr/gi, '')
      .replace(/today|yesterday|day before yesterday|tomorrow/gi, '')
      .replace(/\b(?:via|by|in|using)?\s*(?:cash|card|upi|gpay|phonepe|paytm|net banking|bank transfer|credit|debit)\b/gi, '')
      .replace(new RegExp(`\\b${amount}\\b`, 'g'), '')
      .replace(/\b(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi, '') // Remove time like "at 9 am"
      .replace(/\b(?:on\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '') // Remove days
      .replace(/\b(?:for|on|and|the|a|an|i|we|to|at|my|some|any|had|got|did|went|watched|bought|took)\b/gi, '') // Stop words
      .trim();

    // Remove extra spaces and duplicate adjacent words
    clean = clean.replace(/\s+/g, ' ');
    clean = clean.split(' ').filter((item, pos, arr) => pos === 0 || item !== arr[pos - 1]).join(' ');

    // Remove leading/trailing prepositions or punctuation
    clean = clean.replace(/^[,\-–—\s]+|[,\-–—\s]+$/g, '');

    if (!clean || clean.length < 2) {
      // Default to Category name or friendly fallback
      return category === 'Others' ? 'Expense' : category;
    }

    // Capitalize first letter
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  },

  /**
   * Generates a conversational response based on stored data and the parsed intent
   */
  generateResponse(
    intent: ParsedIntent,
    allExpenses: Expense[],
    startingAmount: number,
    currentMonthKey: string
  ): {
    text: string;
    expenseAction?: {
      type: 'added' | 'deleted' | 'updated';
      expense: Expense;
      remainingBalance: number;
      todayTotal: number;
    };
    insights?: string[];
    newExpense?: Expense;
  } {
    const stats = calculateFinancialStats(allExpenses, startingAmount, currentMonthKey);

    if (intent.type === 'add_expense') {
      const newExpense: Expense = {
        id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        amount: intent.amount,
        category: intent.category,
        description: intent.description,
        date: intent.date,
        time: intent.time,
        paymentMethod: intent.paymentMethod,
        createdAt: Date.now()
      };

      // Recalculate stats including this new expense
      const updatedExpenses = [newExpense, ...allExpenses];
      const updatedStats = calculateFinancialStats(updatedExpenses, startingAmount, currentMonthKey);

      const emoji = CATEGORIES[intent.category]?.emoji || '';
      const text = `Added ${formatCurrency(intent.amount)} to ${intent.category} → ${intent.description}.

Today's spending: ${formatCurrency(updatedStats.todaySpending)}
Remaining this month: ${formatCurrency(updatedStats.remainingBalance)}`;

      return {
        text,
        expenseAction: {
          type: 'added',
          expense: newExpense,
          remainingBalance: updatedStats.remainingBalance,
          todayTotal: updatedStats.todaySpending
        },
        newExpense
      };
    }

    if (intent.type === 'action') {
      if (intent.actionKind === 'set_balance' && intent.value) {
        return {
          text: `Updated your monthly starting balance to ${formatCurrency(intent.value)}. Your remaining balance is now ${formatCurrency(intent.value - stats.totalSpent)}.`
        };
      }
      if (intent.actionKind === 'set_budget' && intent.value) {
        return {
          text: `Updated your weekly budget limit to ${formatCurrency(intent.value)}. You have spent ${formatCurrency(stats.thisWeekSpending)} this week.`
        };
      }
      if (intent.actionKind === 'clear_chat') {
        return {
          text: `I've cleared the chat history. We're starting fresh!`
        };
      }
      if (intent.actionKind === 'new_chat') {
        return {
          text: `I've created a brand new chat session for you!`
        };
      }
    }

    if (intent.type === 'query') {
      switch (intent.queryKind) {
        case 'remaining_balance': {
          return {
            text: `You have ${formatCurrency(stats.remainingBalance)} remaining for this month out of your starting balance of ${formatCurrency(stats.startingAmount)} (${(100 - stats.spendingPercentage).toFixed(0)}% available).`
          };
        }

        case 'today_expenses': {
          const todayList = allExpenses.filter(e => isToday(e.date));
          if (todayList.length === 0) {
            return {
              text: "You haven't logged any expenses today yet. Just tell me what you spent, e.g. \"I spent ₹150 for lunch\"!"
            };
          }
          const listText = todayList
            .map(e => `• ${e.time} - ${CATEGORIES[e.category]?.emoji || ''} ${e.description}: ${formatCurrency(e.amount)}`)
            .join('\n');
          return {
            text: `Here are today's expenses (${todayList.length} transaction${todayList.length > 1 ? 's' : ''}):\n\n${listText}\n\nToday's Total: ${formatCurrency(stats.todaySpending)}`
          };
        }

        case 'biggest_expense': {
          const monthExpenses = allExpenses.filter(e => isSameMonth(e.date, currentMonthKey));
          if (monthExpenses.length === 0) {
            return {
              text: "No expenses recorded yet for this month."
            };
          }
          const sorted = [...monthExpenses].sort((a, b) => b.amount - a.amount);
          const top = sorted[0];
          return {
            text: `Your biggest expense this month was ${formatCurrency(top.amount)} for "${top.description}" in ${top.category} on ${top.date}.`
          };
        }

        case 'highest_category': {
          if (!stats.highestCategory) {
            return {
              text: "No expenses recorded yet for this month."
            };
          }
          return {
            text: `${stats.highestCategory.category} is your highest spending category this month, totaling ${formatCurrency(stats.highestCategory.amount)} (${stats.highestCategory.percentage.toFixed(0)}% of all expenses).`
          };
        }

        case 'category_spending': {
          const cat = intent.categoryFilter || 'Food';
          const catExpenses = allExpenses.filter(
            e => e.category === cat && isThisWeek(e.date) && isSameMonth(e.date, currentMonthKey)
          );
          const weekTotal = catExpenses.reduce((sum, e) => sum + e.amount, 0);

          const monthCatExpenses = allExpenses.filter(
            e => e.category === cat && isSameMonth(e.date, currentMonthKey)
          );
          const monthTotal = monthCatExpenses.reduce((sum, e) => sum + e.amount, 0);

          return {
            text: `You spent ${formatCurrency(weekTotal)} on ${cat} this week (and ${formatCurrency(monthTotal)} overall this month across ${monthCatExpenses.length} transactions).`
          };
        }

        case 'weekly_report': {
          return {
            text: `Weekly Spending Summary:\n• Total this week: ${formatCurrency(stats.thisWeekSpending)}\n• Weekly budget: ${formatCurrency(stats.weeklyBudget)}\n• Remaining weekly budget: ${formatCurrency(stats.weeklyBudgetRemaining)}\n• Daily average: ${formatCurrency(stats.dailyAverage)}/day`
          };
        }

        case 'day_expenses': {
          const targetDay = intent.dayFilter || 'yesterday';
          const { dateStr, displayLabel } = parseRelativeDate(targetDay);
          const dayExpenses = allExpenses.filter(e => e.date === dateStr);
          if (dayExpenses.length === 0) {
            return {
              text: `You had no expenses recorded on ${displayLabel} (${dateStr}).`
            };
          }
          const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
          const listText = dayExpenses
            .map(e => `• ${CATEGORIES[e.category]?.emoji || ''} ${e.description}: ${formatCurrency(e.amount)}`)
            .join('\n');
          return {
            text: `Expenses on ${displayLabel} (${dateStr}):\n\n${listText}\n\nTotal: ${formatCurrency(total)}`
          };
        }

        case 'help': {
          return {
            text: `I'm ExpenseAI, your personal financial assistant! Here are some things you can try:

• Record an expense: "I spent ₹150 for lunch today" or "80 on bus"
• Voice input: Tap the mic button and speak naturally
• Check balance: "How much money do I have left?"
• Today's summary: "Show today's expenses"
• Weekly inquiry: "How much did I spend on food this week?"
• High spend: "What was my biggest expense?"
• Adjust budget: "Set balance to 25000" or "Set budget to 5000"`
          };
        }

        default: {
          return {
            text: `I understood your message, but didn't detect a specific expense or question.

Try telling me an expense like "I spent ₹250 for dinner", or ask "How much money do I have left?" or "Show today's expenses".`
          };
        }
      }
    }

    return {
      text: "I'm ready! Tell me an expense or ask about your spending."
    };
  }
};
