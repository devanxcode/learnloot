'use client';

import React from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  LayoutDashboard,
  GraduationCap,
  Clock,
  BarChart2,
  Sun,
  Moon,
  Plus,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Gift
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogModal: () => void;
  onOpenRedeemModal: () => void;
}

export function DesktopSidebar({
  activeTab,
  setActiveTab,
  onOpenLogModal,
  onOpenRedeemModal
}: NavigationProps) {
  const {
    settings,
    toggleTheme,
    availableXP,
    currentLevel,
    xpProgressPercent,
    ratePerXP,
    marketTrend,
    changePercent,
    totalRupeeValuation,
    clearAllData
  } = useWorkspace();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects & Chapters', icon: GraduationCap },
    { id: 'logs', label: 'Study Log', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-[#2B2F38] bg-[#15171D] text-[#E6E8EC] p-4 select-none shrink-0 justify-between">
      <div className="space-y-4">
        {/* Brand */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#B8F36B] flex items-center justify-center font-black text-black text-xs shadow-md shadow-[#B8F36B]/10">
              LL
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">LearnLoot</span>
              <span className="text-[10px] text-[#969BA7] -mt-0.5 block">Study & Consistency Market</span>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl text-[#969BA7] hover:text-white hover:bg-[#1C1F26] transition-colors"
            title="Toggle theme"
          >
            {settings.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>

        {/* Stock Market Card + Redeem Button */}
        <div
          className={`p-4 rounded-2xl border space-y-3 shadow-lg transition-colors ${
            marketTrend === 'bear'
              ? 'bg-[#1C1618] border-rose-500/30 shadow-rose-950/20'
              : marketTrend === 'bull'
              ? 'bg-[#161F1A] border-emerald-500/30 shadow-emerald-950/20'
              : 'bg-[#1C1F26] border-[#2B2F38]'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Sparkles className="w-3.5 h-3.5 text-[#B8F36B]" />
              <span>{availableXP} XP</span>
            </div>

            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                marketTrend === 'bull'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : marketTrend === 'bear'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {marketTrend === 'bull' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{changePercent >= 0 ? `+${changePercent}%` : `${changePercent}%`}</span>
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1 border-t border-[#2B2F38]/50">
            <span className="text-[10px] text-[#969BA7]">Valuation</span>
            <span
              className={`text-base font-mono font-black ${
                marketTrend === 'bear' ? 'text-rose-400' : 'text-white'
              }`}
            >
              ₹{totalRupeeValuation}
            </span>
          </div>

          <div className="w-full bg-[#111318] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                marketTrend === 'bear' ? 'bg-rose-500' : 'bg-[#B8F36B]'
              }`}
              style={{ width: `${xpProgressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#969BA7]">
            <span
              className={`font-mono ${
                marketTrend === 'bear'
                  ? 'text-rose-400 font-bold'
                  : marketTrend === 'bull'
                  ? 'text-[#B8F36B] font-bold'
                  : ''
              }`}
            >
              1 XP = ₹{ratePerXP}
            </span>
            <span className="text-[#B8F36B] font-semibold">Lvl {currentLevel}</span>
          </div>

          {/* Quick Redeem Trigger */}
          <button
            onClick={onOpenRedeemModal}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-xs font-bold transition-all active:scale-95"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Redeem XP</span>
          </button>
        </div>

        {/* Quick Log Button */}
        <button
          onClick={onOpenLogModal}
          className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-[#B8F36B] hover:bg-[#a3e652] text-black text-xs font-extrabold transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Log Study Session</span>
        </button>

        {/* Nav Links */}
        <nav className="space-y-1 pt-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#1C1F26] text-[#B8F36B] font-bold border-l-2 border-[#B8F36B]'
                    : 'text-[#969BA7] hover:text-white hover:bg-[#1C1F26]/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#B8F36B]' : 'text-[#969BA7]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-2 py-3 border-t border-[#2B2F38] text-[11px] text-[#969BA7] flex items-center justify-between">
        <span>15m = 1 XP · Cloud & Local</span>
        <button
          onClick={() => {
            if (confirm('Clear all study entries and reset all demo data?')) {
              clearAllData();
            }
          }}
          className="text-[#969BA7] hover:text-rose-400 text-[10px] flex items-center gap-1 transition-colors font-medium px-2 py-0.5 rounded-lg hover:bg-rose-500/10"
          title="Clear all demo data and start fresh"
        >
          <span>Reset All</span>
        </button>
      </div>
    </aside>
  );
}

export function MobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenLogModal,
  onOpenRedeemModal
}: NavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: GraduationCap },
    { id: 'logs', label: 'Study Log', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-[#2B2F38] bg-[#15171D]/95 backdrop-blur-lg px-2 flex items-center justify-around z-40">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#B8F36B] font-bold' : 'text-[#969BA7] hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        );
      })}

      <button
        onClick={onOpenRedeemModal}
        className="flex flex-col items-center gap-1 py-1.5 px-3 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
      >
        <Gift className="w-5 h-5" />
        <span>Redeem</span>
      </button>
    </nav>
  );
}
