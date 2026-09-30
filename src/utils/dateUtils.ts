/**
 * Date and currency utility functions
 */

export function getTodayDateString(): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(new Date());
  let y = '', m = '', d = '';
  for (const part of parts) {
    if (part.type === 'year') y = part.value;
    if (part.type === 'month') m = part.value;
    if (part.type === 'day') d = part.value;
  }
  return `${y}-${m}-${d}`;
}

export function getCurrentMonthKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getCurrentTimeString(d: Date = new Date()): string {
  return d.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function formatMonthName(monthKey: string): string {
  if (!monthKey) return '';
  const [y, m] = monthKey.split('-').map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDateString();
}

export function isThisWeek(dateStr: string): boolean {
  if (!dateStr) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);
  const now = new Date();

  // Find start of current week (Monday)
  const currentDay = now.getDay();
  const distanceToMonday = (currentDay + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return targetDate >= monday && targetDate <= sunday;
}

export function isSameMonth(dateStr: string, monthKey: string): boolean {
  if (!dateStr || !monthKey) return false;
  return dateStr.startsWith(monthKey);
}

export function formatCurrency(amount: number, symbol: string = '₹'): string {
  const rounded = Math.round(amount);
  const formatted = Math.abs(rounded).toLocaleString('en-IN');
  if (rounded < 0) {
    return `-${symbol}${formatted}`;
  }
  return `${symbol}${formatted}`;
}

/**
 * Parses relative or spoken dates into YYYY-MM-DD
 */
export function parseRelativeDate(text: string): { dateStr: string; displayLabel: string } {
  const lower = text.toLowerCase();
  const now = new Date();

  if (lower.includes('yesterday')) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const y = yesterday.getFullYear();
    const m = String(yesterday.getMonth() + 1).padStart(2, '0');
    const d = String(yesterday.getDate()).padStart(2, '0');
    return { dateStr: `${y}-${m}-${d}`, displayLabel: 'Yesterday' };
  }

  if (lower.includes('day before yesterday')) {
    const dby = new Date(now);
    dby.setDate(now.getDate() - 2);
    const y = dby.getFullYear();
    const m = String(dby.getMonth() + 1).padStart(2, '0');
    const d = String(dby.getDate()).padStart(2, '0');
    return { dateStr: `${y}-${m}-${d}`, displayLabel: 'Day before yesterday' };
  }

  // Weekdays: monday, tuesday, etc.
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < days.length; i++) {
    if (lower.includes(days[i])) {
      const targetDay = i;
      const currentDay = now.getDay();
      let diff = currentDay - targetDay;
      if (diff <= 0) diff += 7; // look back to previous occurrence
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - diff);
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      const d = String(targetDate.getDate()).padStart(2, '0');
      const capName = days[i].charAt(0).toUpperCase() + days[i].slice(1);
      return { dateStr: `${y}-${m}-${d}`, displayLabel: `Last ${capName}` };
    }
  }

  // Specific dates like "12th oct", "october 12", "12 oct"
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const fullMonths = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  
  const dateMatch = lower.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i) || 
                    lower.match(/(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?/i);

  if (dateMatch) {
    let dayStr, monthStr;
    if (isNaN(parseInt(dateMatch[1]))) {
      // Month is first
      monthStr = dateMatch[1];
      dayStr = dateMatch[2];
    } else {
      // Day is first
      dayStr = dateMatch[1];
      monthStr = dateMatch[2];
    }
    
    const day = parseInt(dayStr, 10);
    let monthIdx = months.findIndex(m => monthStr.toLowerCase().startsWith(m));
    
    if (monthIdx !== -1 && day >= 1 && day <= 31) {
      const targetDate = new Date(now.getFullYear(), monthIdx, day);
      // If the date is in the future, assume it was last year
      if (targetDate > now) {
        targetDate.setFullYear(now.getFullYear() - 1);
      }
      
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      const d = String(targetDate.getDate()).padStart(2, '0');
      
      return { 
        dateStr: `${y}-${m}-${d}`, 
        displayLabel: `${fullMonths[monthIdx].charAt(0).toUpperCase() + fullMonths[monthIdx].slice(1)} ${day}` 
      };
    }
  }

  // Default is today
  return { dateStr: getTodayDateString(), displayLabel: 'Today' };
}
