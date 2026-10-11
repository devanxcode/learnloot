'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  Clock,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Sparkles,
  IndianRupee,
  Gift,
  Flame,
  Award,
  AlertTriangle
} from 'lucide-react';
import { formatMinutes, formatDate, getIndianDateTime, getIndianDateString } from '@/lib/utils';
import { RedeemModal } from './RedeemModal';

interface DashboardProps {
  onOpenLogModal: () => void;
  onNavigateToLogs: () => void;
  onNavigateToSubjects: () => void;
}

export function Dashboard({ onOpenLogModal, onNavigateToLogs, onNavigateToSubjects }: DashboardProps) {
  const {
    subjects,
    chapters,
    studyLogs,
    availableXP,
    lifetimeXP,
    redeemedXP,
    redemptions,
    currentLevel,
    ratePerXP,
    marketTrend,
    changePercent,
    marketStatus,
    totalRupeeValuation,
    activeStudyDaysThisWeek
  } = useWorkspace();

  const [todayStr, setTodayStr] = useState('2026-10-11');
  const [indianDate, setIndianDate] = useState('Sunday, October 11, 2026');
  const [indianTime, setIndianTime] = useState('10:00 PM');
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const { date, time } = getIndianDateTime(now);
      setIndianDate(date);
      setIndianTime(time);
      setTodayStr(getIndianDateString(now));

      const weekStartMS = now.getTime() - 7 * 86400000;
      const mins = studyLogs
        .filter(l => new Date(l.date).getTime() >= weekStartMS)
        .reduce((acc, l) => acc + (Number(l.duration_minutes) || 0), 0);
      setWeeklyMinutes(mins);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, [studyLogs]);

  const todayMinutes = studyLogs
    .filter(l => l.date === todayStr)
    .reduce((acc, l) => acc + (Number(l.duration_minutes) || 0), 0);

  const totalStudyMinutes = studyLogs.reduce((acc, l) => acc + (Number(l.duration_minutes) || 0), 0);
  const completedChapters = chapters.filter(c => Boolean(c.completed)).length;
  const totalChapters = chapters.length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 pb-24 md:pb-10">
      {/* Header with Live Indian Date & Time */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2F38]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B8F36B] tracking-wide mb-1">
            <span className="w-2 h-2 rounded-full bg-[#B8F36B] animate-pulse" />
            <span>{indianDate} · {indianTime} · India Standard Time (IST)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-xs text-[#969BA7] mt-0.5">
            15 mins study = 1 XP · Dynamic study stock market valuation based on consistency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRedeemModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 font-bold text-xs transition-all active:scale-95 shadow-sm"
          >
            <Gift className="w-4 h-4" />
            <span>Redeem XP</span>
          </button>
          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#B8F36B] hover:bg-[#a3e652] text-black font-extrabold text-xs transition-all shadow-lg shadow-[#B8F36B]/10 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Log Study Session</span>
          </button>
        </div>
      </div>

      {/* High-Stakes Stock Market Banner */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border shadow-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          marketTrend === 'bear'
            ? 'bg-gradient-to-r from-[#221014] via-[#1A1218] to-[#16181F] border-rose-500/40 shadow-rose-950/30'
            : marketTrend === 'bull'
            ? 'bg-gradient-to-r from-[#112416] via-[#16201B] to-[#16181F] border-emerald-500/40 shadow-emerald-950/30'
            : 'bg-gradient-to-r from-[#1C1F26] via-[#202530] to-[#1C1F26] border-[#2B2F38]'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${
              marketTrend === 'bear'
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse'
                : marketTrend === 'bull'
                ? 'bg-[#B8F36B]/20 border border-[#B8F36B]/40 text-[#B8F36B]'
                : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
            }`}
          >
            {marketTrend === 'bear' ? (
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            ) : marketTrend === 'bull' ? (
              <Flame className="w-6 h-6 text-[#B8F36B]" />
            ) : (
              <IndianRupee className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm sm:text-base font-black text-white">Study Market Valuation</span>
              <span
                className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                  marketTrend === 'bear'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : marketTrend === 'bull'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}
              >
                {marketTrend === 'bear' ? (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>
                  {changePercent >= 0 ? `+${changePercent}%` : `${changePercent}%`} · {marketStatus}
                </span>
              </span>
            </div>

            <p className="text-xs text-[#969BA7] mt-1">
              Live Exchange: <strong className="text-white font-mono">1 XP = ₹{ratePerXP}</strong>
              <span className="text-[#969BA7] ml-1.5">
                (Floor: ₹0.50 [-50%] · Base: ₹1.00 · Cap: ₹1.50 [+50%])
              </span>
            </p>

            <div className="mt-1.5 text-[11px] font-medium flex items-center gap-1">
              {marketTrend === 'bear' ? (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <span>⚠️ Inactivity Penalty Active:</span>
                  <span className="text-[#969BA7]">Only {activeStudyDaysThisWeek}/7 active days. Study today to drive your market price back up!</span>
                </span>
              ) : marketTrend === 'bull' ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span>🔥 High-Consistency Bull Rally:</span>
                  <span className="text-[#969BA7]">{activeStudyDaysThisWeek}/7 active days. Your study time is trading at peak reward rates!</span>
                </span>
              ) : (
                <span className="text-cyan-400 font-semibold">
                  <span>⚖️ Market Equilibrium:</span>
                  <span className="text-[#969BA7]">{activeStudyDaysThisWeek}/7 active days. Log consistent sessions to trigger a bull run!</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[#2B2F38]">
          <span className="text-xs text-[#969BA7]">Portfolio Market Value</span>
          <div
            className={`text-2xl sm:text-3xl font-black font-mono ${
              marketTrend === 'bear'
                ? 'text-rose-400'
                : 'text-[#B8F36B]'
            }`}
          >
            ₹{totalRupeeValuation}
          </div>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Hours */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1C1F26] border border-[#2B2F38] space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#969BA7]">
            <span>Today's Study</span>
            <Clock className="w-4 h-4 text-[#B8F36B]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {formatMinutes(todayMinutes)}
          </div>
          <div className="text-[11px] text-[#969BA7]">
            +{Math.floor(todayMinutes / 15)} XP earned
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1C1F26] border border-[#2B2F38] space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#969BA7]">
            <span>Past 7 Days</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {formatMinutes(weeklyMinutes)}
          </div>
          <div className="text-[11px] text-[#969BA7]">
            {activeStudyDaysThisWeek} of 7 days active
          </div>
        </div>

        {/* Chapter Progress */}
        <div
          onClick={onNavigateToSubjects}
          className="p-4 sm:p-5 rounded-2xl bg-[#1C1F26] border border-[#2B2F38] space-y-1.5 cursor-pointer hover:border-[#3E4350] transition-colors shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-[#969BA7]">
            <span>Chapters Done</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {completedChapters} <span className="text-xs font-normal text-[#969BA7]">/ {totalChapters}</span>
          </div>
          <div className="text-[11px] text-[#969BA7]">
            {totalChapters > 0 ? `${Math.round((completedChapters / totalChapters) * 100)}% complete` : '0%'}
          </div>
        </div>

        {/* Available Loot XP */}
        <div
          onClick={() => setRedeemModalOpen(true)}
          className="p-4 sm:p-5 rounded-2xl bg-[#1C1F26] border border-[#2B2F38] space-y-1.5 shadow-sm cursor-pointer hover:border-[#3E4350] transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#969BA7]">
            <span>Available XP</span>
            <Sparkles className="w-4 h-4 text-[#B8F36B]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#B8F36B] font-mono">
            {availableXP} <span className="text-xs font-normal text-[#969BA7]">XP</span>
          </div>
          <div className="text-[11px] text-[#969BA7] flex items-center justify-between">
            <span>{lifetimeXP} total earned</span>
            {redeemedXP > 0 && (
              <span className="text-amber-400 font-medium">({redeemedXP} paid out)</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Subject Breakdown & Recent Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subject Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#1C1F26] border border-[#2B2F38] space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Subject Breakdown</h2>
            <span className="text-xs text-[#969BA7]">All Time</span>
          </div>

          <div className="space-y-3.5">
            {subjects.map(sub => {
              const subMinutes = studyLogs
                .filter(l => l.subject_id === sub.id)
                .reduce((acc, l) => acc + l.duration_minutes, 0);

              const percentage = totalStudyMinutes > 0 ? Math.round((subMinutes / totalStudyMinutes) * 100) : 0;

              return (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                      <span className="font-semibold text-white">{sub.name}</span>
                    </div>
                    <div className="text-[#969BA7] font-mono">
                      {formatMinutes(subMinutes)} <span className="text-[10px]">({percentage}%)</span>
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

        {/* Recent Sessions */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#1C1F26] border border-[#2B2F38] space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Recent Study Sessions</h2>
            <button
              onClick={onNavigateToLogs}
              className="text-xs text-[#B8F36B] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {studyLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#969BA7] rounded-2xl bg-[#111318]/50 border border-dashed border-[#2B2F38]">
              No study sessions logged yet. Click "+ Log Study Session" to record your first block.
            </div>
          ) : (
            <div className="space-y-2.5">
              {studyLogs.slice(0, 4).map(log => {
                const sub = subjects.find(s => s.id === log.subject_id);
                const chap = chapters.find(c => c.id === log.chapter_id);

                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-[#15171D] border border-[#2B2F38] hover:border-[#3E4350] transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sub?.color || '#B8F36B' }} />
                        <span className="text-xs font-bold text-white truncate">
                          {sub?.name || 'Subject'}
                        </span>
                        {chap && (
                          <span className="text-[11px] text-[#969BA7] truncate">
                            • {chap.name}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#969BA7] mt-0.5">
                        {formatDate(log.date)} · +{Math.floor(log.duration_minutes / 15)} XP
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-black text-[#B8F36B]">
                        {formatMinutes(log.duration_minutes)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Redeem Modal */}
      <RedeemModal
        isOpen={redeemModalOpen}
        onClose={() => setRedeemModalOpen(false)}
      />
    </div>
  );
}
