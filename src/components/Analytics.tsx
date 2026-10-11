'use client';

import React, { useState, useMemo } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  BarChart2,
  Clock,
  Sparkles,
  Calendar,
  Filter,
  ChevronDown,
  BookOpen,
  IndianRupee,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { formatMinutes, formatDate } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type FilterPeriod = 'week' | 'month' | 'custom' | 'all';

export function Analytics() {
  const {
    studyLogs,
    subjects,
    chapters,
    availableXP,
    lifetimeXP,
    redeemedXP,
    redemptions,
    ratePerXP,
    marketTrend,
    changePercent,
    totalRupeeValuation,
    activeStudyDaysThisWeek
  } = useWorkspace();

  const [period, setPeriod] = useState<FilterPeriod>('week');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-11');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    const today = new Date().toISOString().split('T')[0];
    setEndDate(today);
    const start = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];
    setStartDate(start);
  }, []);

  const filteredLogs = useMemo(() => {
    if (!mounted) return studyLogs;
    const now = new Date();
    if (period === 'week') {
      const weekStart = new Date(now.getTime() - 6 * 86400000).toISOString().split('T')[0];
      return studyLogs.filter(l => l.date >= weekStart);
    }
    if (period === 'month') {
      const monthStart = new Date(now.getTime() - 29 * 86400000).toISOString().split('T')[0];
      return studyLogs.filter(l => l.date >= monthStart);
    }
    if (period === 'custom') {
      return studyLogs.filter(l => l.date >= startDate && l.date <= endDate);
    }
    return studyLogs;
  }, [studyLogs, period, startDate, endDate]);

  const filteredStudyMinutes = useMemo(() => {
    return filteredLogs.reduce((acc, l) => acc + l.duration_minutes, 0);
  }, [filteredLogs]);

  const completedChapters = chapters.filter(c => c.completed).length;
  const totalChapters = chapters.length;

  const chartData = useMemo(() => {
    if (!mounted) return [];
    if (period === 'week') {
      const days: { label: string; date: string; minutes: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const mins = filteredLogs
          .filter(l => l.date === dateStr)
          .reduce((acc, l) => acc + l.duration_minutes, 0);
        days.push({ label: dayName, date: dateStr, minutes: mins });
      }
      return days;
    } else if (period === 'month') {
      const buckets: Record<string, number> = {};
      filteredLogs.forEach(l => {
        const d = new Date(l.date);
        const weekNum = `W${Math.ceil(d.getDate() / 7)}`;
        buckets[weekNum] = (buckets[weekNum] || 0) + l.duration_minutes;
      });
      return ['W1', 'W2', 'W3', 'W4', 'W5'].map(w => ({
        label: w,
        date: w,
        minutes: buckets[w] || 0,
      }));
    } else {
      const dateMap: Record<string, number> = {};
      filteredLogs.forEach(l => {
        dateMap[l.date] = (dateMap[l.date] || 0) + l.duration_minutes;
      });
      const sortedDates = Object.keys(dateMap).sort().slice(-14);
      return sortedDates.map(d => ({
        label: d.slice(5),
        date: d,
        minutes: dateMap[d] || 0,
      }));
    }
  }, [filteredLogs, period]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2F38]">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-[#B8F36B]" />
            <span>Analytics & Study Market</span>
          </h1>
          <p className="text-xs text-[#969BA7] mt-0.5">
            Real study statistics · 15 mins = 1 XP · Dynamic market stock valuation.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-[#1C1F26] border border-[#2B2F38] p-1 text-xs">
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === 'week'
                  ? 'bg-[#B8F36B] text-black font-bold shadow-sm'
                  : 'text-[#969BA7] hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === 'month'
                  ? 'bg-[#B8F36B] text-black font-bold shadow-sm'
                  : 'text-[#969BA7] hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod('custom')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === 'custom'
                  ? 'bg-[#B8F36B] text-black font-bold shadow-sm'
                  : 'text-[#969BA7] hover:text-white'
              }`}
            >
              Custom
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === 'all'
                  ? 'bg-[#B8F36B] text-black font-bold shadow-sm'
                  : 'text-[#969BA7] hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {period === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-[#1C1F26] border border-[#2B2F38] text-xs animate-in fade-in">
          <span className="text-[#969BA7] font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#B8F36B]" /> Custom Date Range:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-[#111318] border border-[#2B2F38] text-white px-2.5 py-1 rounded-lg focus:outline-none focus:border-[#B8F36B]"
            />
            <span className="text-[#969BA7]">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="bg-[#111318] border border-[#2B2F38] text-white px-2.5 py-1 rounded-lg focus:outline-none focus:border-[#B8F36B]"
            />
          </div>
        </div>
      )}

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Filtered Hours */}
        <div className="p-4 rounded-2xl bg-[#1C1F26] border border-[#2B2F38] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#969BA7]">
            <span>Total Study Hours</span>
            <Clock className="w-4 h-4 text-[#B8F36B]" />
          </div>
          <div className="text-2xl font-extrabold text-[#B8F36B] font-mono">
            {formatMinutes(filteredStudyMinutes)}
          </div>
          <span className="text-[11px] text-[#969BA7] block">
            Across {filteredLogs.length} logged sessions
          </span>
        </div>

        {/* Stock Market Valuation Card */}
        <div className="p-4 rounded-2xl bg-[#1C1F26] border border-[#2B2F38] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#969BA7]">
            <span>Study Stock Valuation</span>
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1 py-0.5 rounded ${
                marketTrend === 'bull'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : marketTrend === 'bear'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {marketTrend === 'bull' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{changePercent >= 0 ? `+${changePercent}%` : `${changePercent}%`}</span>
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono flex items-baseline gap-1.5">
            <span className={marketTrend === 'bear' ? 'text-rose-400' : 'text-white'}>₹{totalRupeeValuation}</span>
            <span className="text-xs text-[#969BA7] font-normal">({availableXP} XP)</span>
          </div>
          <span className="text-[11px] text-[#969BA7] block font-mono">
            Rate: 1 XP = ₹{ratePerXP} (Range: ₹0.50 [-50%] to ₹1.50 [+50%])
          </span>
        </div>

        {/* Chapter Progress */}
        <div className="p-4 rounded-2xl bg-[#1C1F26] border border-[#2B2F38] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#969BA7]">
            <span>Chapter Progress</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {completedChapters} <span className="text-sm font-normal text-[#969BA7]">/ {totalChapters}</span>
          </div>
          <span className="text-[11px] text-[#969BA7] block">
            {totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0}% syllabus finished
          </span>
        </div>
      </div>

      {/* Visual Chart Card */}
      <div className="p-5 rounded-2xl bg-[#1C1F26] border border-[#2B2F38] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">
            {period === 'week' && 'Daily Study Duration (Past 7 Days)'}
            {period === 'month' && 'Weekly Study Distribution (Past 30 Days)'}
            {period === 'custom' && `Study Duration (${startDate} to ${endDate})`}
            {period === 'all' && 'All-Time Study Distribution'}
          </h2>
          <span className="text-xs text-[#969BA7] font-mono">Minutes / Session</span>
        </div>

        <div className="h-64 w-full pt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#969BA7]">
              No study records found in this date range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  stroke="#969BA7"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#2B2F38' }}
                />
                <YAxis
                  stroke="#969BA7"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#2B2F38' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(184, 243, 107, 0.05)' }}
                  contentStyle={{
                    backgroundColor: '#15171D',
                    borderColor: '#2B2F38',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                  formatter={(val: any) => [`${formatMinutes(val)} (${val}m)`, 'Study Time']}
                />
                <Bar
                  dataKey="minutes"
                  fill="#B8F36B"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Subject-Wise Time Allocation */}
      <div className="p-5 rounded-2xl bg-[#1C1F26] border border-[#2B2F38] space-y-4">
        <h2 className="text-sm font-bold text-white">Subject-Wise Study Allocation</h2>

        <div className="space-y-3">
          {subjects.map(sub => {
            const subMinutes = filteredLogs
              .filter(l => l.subject_id === sub.id)
              .reduce((acc, l) => acc + l.duration_minutes, 0);

            const percentage = filteredStudyMinutes > 0 ? Math.round((subMinutes / filteredStudyMinutes) * 100) : 0;

            return (
              <div key={sub.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                    <span className="font-semibold text-white">{sub.name}</span>
                  </div>
                  <div className="font-mono text-white">
                    {formatMinutes(subMinutes)} <span className="text-[#969BA7]">({percentage}%)</span>
                  </div>
                </div>

                <div className="w-full bg-[#111318] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${percentage}%`, backgroundColor: sub.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payout & Redemption History Section */}
      <div className="p-5 rounded-2xl bg-[#1C1F26] border border-[#2B2F38] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Payout & Redemption History</span>
            </h2>
            <p className="text-[11px] text-[#969BA7] mt-0.5">
              Cumulative redeemed: {redeemedXP} XP · Total earned: {lifetimeXP} XP · Available: {availableXP} XP
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {redemptions.length} {redemptions.length === 1 ? 'Payout' : 'Payouts'}
          </span>
        </div>

        {redemptions.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-[#15171D] border border-dashed border-[#2B2F38] text-xs text-[#969BA7]">
            No payouts redeemed yet. Click <strong>Redeem XP</strong> on the dashboard to exchange your earned XP for rewards.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-[#969BA7] border-b border-[#2B2F38]">
                <tr>
                  <th className="pb-2.5 font-semibold">Date</th>
                  <th className="pb-2.5 font-semibold">Method</th>
                  <th className="pb-2.5 font-semibold">Destination</th>
                  <th className="pb-2.5 font-semibold text-right">XP Spent</th>
                  <th className="pb-2.5 font-semibold text-right">Payout Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2F38]/50">
                {redemptions.map(r => (
                  <tr key={r.id} className="hover:bg-[#15171D]/50 transition-colors">
                    <td className="py-3 text-[#969BA7] font-mono">{formatDate(r.date)}</td>
                    <td className="py-3 font-semibold text-white">{r.payout_method}</td>
                    <td className="py-3 text-[#969BA7] font-mono text-[11px]">{r.destination}</td>
                    <td className="py-3 text-right font-mono font-bold text-amber-400">-{r.xp_spent} XP</td>
                    <td className="py-3 text-right font-mono font-bold text-[#B8F36B]">₹{r.rupee_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
