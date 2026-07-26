import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Use a fallback validation in case dates are invalid or empty
  if (isNaN(dateObj.getTime())) return String(date);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export interface ExpenseMinimal {
  amount: number;
  category: string;
  date: string;
}

/**
 * Calculates the rollover amount for a specific category and target month.
 * It iterates from the startMonth (or earliest expense) up to the month BEFORE targetMonth.
 */
export function calculateRollover(
  expenses: ExpenseMinimal[],
  category: string,
  baseLimit: number,
  targetMonth: string,
  startMonth?: string
) {
  if (!startMonth) {
    if (expenses.length === 0) return 0;
    const sortedDates = expenses.map(e => e.date).sort();
    startMonth = sortedDates[0].substring(0, 7);
  }

  if (startMonth >= targetMonth) return 0;

  const months: string[] = [];
  const startParts = startMonth.split('-').map(Number);
  const targetParts = targetMonth.split('-').map(Number);
  
  if (startParts.some(isNaN) || targetParts.some(isNaN)) return 0;

  let currY = startParts[0];
  let currM = startParts[1];
  
  while (currY < targetParts[0] || (currY === targetParts[0] && currM < targetParts[1])) {
    months.push(`${currY}-${String(currM).padStart(2, '0')}`);
    currM++;
    if (currM > 12) {
      currM = 1;
      currY++;
    }
  }

  let accumulatedRollover = 0;

  for (const month of months) {
    const spentInMonth = expenses
      .filter(e => e.category === category && e.date.startsWith(month))
      .reduce((sum, e) => sum + e.amount, 0);

    const monthLimit = baseLimit + accumulatedRollover;
    const remaining = monthLimit - spentInMonth;

    // Reset to zero if overspent, otherwise carry forward
    accumulatedRollover = Math.max(0, remaining);
  }

  return accumulatedRollover;
}
