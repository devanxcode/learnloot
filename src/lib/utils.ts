import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutes(mins: number): string {
  if (!mins || mins <= 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

/**
 * Format Indian Date & Time using zero-dependency built-in Intl.DateTimeFormat (Asia/Kolkata)
 */
export function getIndianDateTime(now?: Date) {
  const target = now ?? new Date();
  const date = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(target);

  const time = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(target);

  return { date, time };
}

/**
 * Returns current date as YYYY-MM-DD in IST (Asia/Kolkata)
 */
export function getIndianDateString(now?: Date): string {
  const target = now ?? new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
  }).format(target);
}

/**
 * Serious High-Stakes Stock Market Exchange Rate Formula:
 * Base: 1 XP = ₹1.00
 * Max UP Cap: +50.0% (Rate: ₹1.50 per XP) - Achieved via unbroken daily streaks & zero gap days
 * Max DOWN Floor: -50.0% (Rate: ₹0.50 per XP) - Triggered by broken dates / gap days (e.g. Day 1, Day 3, Day 6)
 * Strict Penalty Formula:
 * - Active study days reward points
 * - Missed gap days (skipped dates) heavily penalize the market rate with negative deductions
 * - Consecutive day streaks add momentum
 */
export function calculateStockExchangeRate(
  activeDaysInWeek: number,
  weeklyHours: number,
  missedDaysCount: number = 7 - activeDaysInWeek,
  consecutiveStreak: number = 0,
  hasAnyLogs: boolean = true
): {
  ratePerXP: number;
  marketTrend: 'bull' | 'bear' | 'stable';
  changePercent: number;
  marketStatus: string;
  missedDays: number;
  consecutiveStreak: number;
} {
  const baseRate = 1.0;

  // RULE: When total study logs is 0, NO FINE, NO PENALTY! Baseline at 0% change (₹1.00).
  if (!hasAnyLogs) {
    return {
      ratePerXP: 1.00,
      marketTrend: 'stable',
      changePercent: 0.0,
      marketStatus: 'NEW WORKSPACE (NO PENALTY)',
      missedDays: 0,
      consecutiveStreak: 0,
    };
  }

  const clampedActiveDays = Math.min(7, Math.max(0, activeDaysInWeek));
  const clampedMissedDays = Math.min(7, Math.max(0, missedDaysCount));

  // 1. Active Study Days Score (+0 to +45 pts)
  const activePoints = (clampedActiveDays / 7) * 45;

  // 2. Skipped/Gap Day Penalty (-0 to -40 pts)
  // e.g. Day 1, Day 3, Day 6 skips Day 2, Day 4, Day 5, Day 7 -> 4 missed days = -22.8 pts penalty!
  const gapPenalty = (clampedMissedDays / 7) * 40;

  // 3. Consecutive Daily Streak Bonus (+0 to +15 pts)
  // Consecutive daily logging builds streak momentum
  const streakBonus = Math.min(15, (Math.max(0, consecutiveStreak) / 7) * 15);

  // 4. Study Volume Score (+0 to +30 pts)
  // Target benchmark: 15 hours/week
  const volumePoints = Math.min(30, (Math.max(0, weeklyHours) / 15) * 30);

  // Net Score: Baseline 0% is balanced at ~3.5 active days & 3.5 missed days
  const netScore = activePoints - gapPenalty + streakBonus + volumePoints - 25;

  // Strict bounded range: exactly [-50.0%, +50.0%]
  const clampedChangePercent = Math.max(-50.0, Math.min(50.0, netScore));
  const changePercent = Number(clampedChangePercent.toFixed(1));

  // Dynamic exchange rate: strictly between ₹0.50 and ₹1.50
  const ratePerXP = Number(Math.max(0.50, Math.min(1.50, baseRate * (1 + changePercent / 100))).toFixed(2));

  let marketTrend: 'bull' | 'bear' | 'stable' = 'stable';
  let marketStatus = 'Equilibrium';

  if (changePercent >= 15.0) {
    marketTrend = 'bull';
    marketStatus = changePercent >= 45.0 ? 'MAX BULL RALLY (+50% PEAK)' : 'BULL RUN (CONSISTENT STREAK)';
  } else if (changePercent <= -15.0) {
    marketTrend = 'bear';
    marketStatus = changePercent <= -45.0 ? 'CRITICAL BEAR CRASH (-50% FLOOR)' : 'BEAR MARKET (BROKEN GAPS PENALTY)';
  } else {
    marketTrend = 'stable';
    marketStatus = 'MARKET CONSOLIDATION (MODERATE)';
  }

  return {
    ratePerXP,
    marketTrend,
    changePercent,
    marketStatus,
    missedDays: clampedMissedDays,
    consecutiveStreak,
  };
}
