import { Expense, Category } from '../types';
import { isToday, isThisWeek, isSameMonth, formatCurrency } from './dateUtils';
import { CATEGORY_LIST } from './categories';

export interface MonthlyStats {
  startingAmount: number;
  totalSpent: number;
  remainingBalance: number;
  spendingPercentage: number;
  todaySpending: number;
  thisWeekSpending: number;
  dailyAverage: number;
  highestCategory: { category: Category; amount: number; percentage: number } | null;
  categoryBreakdown: { category: Category; amount: number; percentage: number }[];
  weeklyBudget: number;
  weeklyBudgetRemaining: number;
  weeklyBudgetPercentage: number;
  weeklyDailyBreakdown: { dayName: string; shortDate: string; amount: number }[];
  monthDailyTrend: { date: string; dayLabel: string; amount: number }[];
  insights: string[];
}

export function calculateFinancialStats(
  expenses: Expense[],
  startingAmount: number = 20000,
  currentMonthKey: string,
  customWeeklyBudget?: number
): MonthlyStats {
  // Filter expenses belonging strictly to this month
  const monthExpenses = expenses.filter(e => isSameMonth(e.date, currentMonthKey));

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBalance = startingAmount - totalSpent;
  const spendingPercentage = startingAmount > 0 ? (totalSpent / startingAmount) * 100 : 0;

  // Today's spending
  const todayExpenses = monthExpenses.filter(e => isToday(e.date));
  const todaySpending = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // This week spending (within this month)
  const thisWeekExpenses = monthExpenses.filter(e => isThisWeek(e.date));
  const thisWeekSpending = thisWeekExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Distinct days with expenses in this month to calculate daily average
  const uniqueActiveDays = new Set(monthExpenses.map(e => e.date)).size;
  const dailyAverage = uniqueActiveDays > 0 ? Math.round(totalSpent / uniqueActiveDays) : 0;

  // Category breakdown
  const categoryMap = new Map<Category, number>();
  for (const cat of CATEGORY_LIST) {
    categoryMap.set(cat, 0);
  }
  for (const e of monthExpenses) {
    const cur = categoryMap.get(e.category) || 0;
    categoryMap.set(e.category, cur + e.amount);
  }

  const categoryBreakdown: { category: Category; amount: number; percentage: number }[] = [];
  let highestCategory: { category: Category; amount: number; percentage: number } | null = null;

  for (const [cat, amt] of categoryMap.entries()) {
    if (amt > 0) {
      const pct = totalSpent > 0 ? (amt / totalSpent) * 100 : 0;
      const item = { category: cat, amount: amt, percentage: pct };
      categoryBreakdown.push(item);
      if (!highestCategory || amt > highestCategory.amount) {
        highestCategory = item;
      }
    }
  }

  // Sort categories highest first
  categoryBreakdown.sort((a, b) => b.amount - a.amount);

  // Weekly budget logic
  // Automatically calculate weekly budget as a division of 4 times of the monthly available limit
  const weeklyBudget = customWeeklyBudget && customWeeklyBudget > 0 
    ? customWeeklyBudget 
    : Math.round(startingAmount / 4);
  const weeklyBudgetRemaining = weeklyBudget - thisWeekSpending;
  const weeklyBudgetPercentage = weeklyBudget > 0 ? (thisWeekSpending / weeklyBudget) * 100 : 0;

  // Weekly daily breakdown (Mon - Sun of current week)
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const distToMonday = (currentDayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distToMonday);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyDailyBreakdown = dayNames.map((name, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${day}`;

    const dayTotal = monthExpenses
      .filter(e => e.date === dateKey)
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      dayName: name,
      shortDate: `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`,
      amount: dayTotal
    };
  });

  // Daily trend for the month (grouped by days)
  const daysInMonthMap = new Map<string, number>();
  for (const e of monthExpenses) {
    daysInMonthMap.set(e.date, (daysInMonthMap.get(e.date) || 0) + e.amount);
  }
  const sortedDates = Array.from(daysInMonthMap.keys()).sort();
  const monthDailyTrend = sortedDates.map(dateStr => {
    const [, , d] = dateStr.split('-');
    return {
      date: dateStr,
      dayLabel: `Day ${Number(d)}`,
      amount: daysInMonthMap.get(dateStr) || 0
    };
  });

  // Generate grounded AI insights based strictly on user's actual stored data
  const insights: string[] = [];

  if (monthExpenses.length === 0) {
    insights.push("No expenses recorded yet for this month. Start by telling ExpenseAI what you spend today!");
  } else {
    if (highestCategory) {
      insights.push(
        `${highestCategory.category} is your highest spending category at ${formatCurrency(highestCategory.amount)} (${highestCategory.percentage.toFixed(0)}% of your total spending).`
      );
    }

    if (remainingBalance > 0) {
      insights.push(
        `You have ${formatCurrency(remainingBalance)} remaining for this month (${(100 - spendingPercentage).toFixed(0)}% balance available).`
      );
    } else {
      insights.push(
        `Warning: You have exceeded your monthly balance by ${formatCurrency(Math.abs(remainingBalance))}.`
      );
    }

    if (dailyAverage > 0) {
      insights.push(
        `Your average spending across active days is ${formatCurrency(dailyAverage)} per day.`
      );
    }

    if (weeklyBudgetPercentage > 85 && weeklyBudgetPercentage <= 100) {
      insights.push("You have used most of your weekly budget. Pace your spending over the coming days.");
    } else if (weeklyBudgetPercentage > 100) {
      insights.push(`Your weekly spending has exceeded the suggested weekly limit by ${formatCurrency(thisWeekSpending - weeklyBudget)}.`);
    } else {
      insights.push(`Your weekly budget pacing is healthy with ${formatCurrency(weeklyBudgetRemaining)} still available.`);
    }
  }

  return {
    startingAmount,
    totalSpent,
    remainingBalance,
    spendingPercentage,
    todaySpending,
    thisWeekSpending,
    dailyAverage,
    highestCategory,
    categoryBreakdown,
    weeklyBudget,
    weeklyBudgetRemaining,
    weeklyBudgetPercentage,
    weeklyDailyBreakdown,
    monthDailyTrend,
    insights
  };
}
