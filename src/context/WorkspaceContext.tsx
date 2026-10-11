'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Subject, Chapter, StudyLog, UserSettings, RedemptionItem } from '@/types';
import { initialSubjects, initialChapters, initialStudyLogs, initialSettings } from '@/lib/initialData';
import { calculateStockExchangeRate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface WorkspaceContextType {
  subjects: Subject[];
  chapters: Chapter[];
  studyLogs: StudyLog[];
  redemptions: RedemptionItem[];
  settings: UserSettings;

  // Gamified Loot XP (2.5 mins = 1 XP)
  lifetimeXP: number;
  availableXP: number;
  redeemedXP: number;
  currentLevel: number;
  xpProgressPercent: number;

  // Dynamic Stock Market Rupee Valuation
  ratePerXP: number;
  marketTrend: 'bull' | 'bear' | 'stable';
  changePercent: number;
  marketStatus: string;
  activeStudyDaysThisWeek: number;
  missedDaysThisWeek: number;
  consecutiveStreak: number;
  totalRupeeValuation: number;

  // Theme
  toggleTheme: () => void;

  // Subjects & Chapters
  addChapter: (subjectId: string, name: string) => void;
  toggleChapterCompletion: (chapterId: string) => void;
  deleteChapter: (chapterId: string) => void;

  // Study Logs
  addStudyLog: (log: Omit<StudyLog, 'id'>, markChapterComplete?: boolean) => void;
  updateStudyLog: (id: string, updates: Partial<StudyLog>) => void;
  deleteStudyLog: (id: string) => void;

  // Redeem XP & Payouts
  redeemXP: (xpAmount: number, payoutMethod: string, destination: string) => boolean;
  deleteRedemption: (id: string) => void;
  clearAllRedemptions: () => void;
  clearAllData: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

const STORAGE_PREFIX = 'devanand_study_v1_';

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [subjects] = useState<Subject[]>(initialSubjects);
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>(initialStudyLogs);
  const [redemptions, setRedemptions] = useState<RedemptionItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>(initialSettings);

  // Cloud-First Data Hydration: Read directly from Supabase Cloud Database
  useEffect(() => {
    let isSubscribed = true;

    async function loadCloudData() {
      if (supabase) {
        try {
          const [logsRes, redemptionsRes, chaptersRes] = await Promise.all([
            supabase.from('study_logs').select('*').order('created_at', { ascending: false }),
            supabase.from('redemption_requests').select('*').order('created_at', { ascending: false }),
            supabase.from('chapters').select('*'),
          ]);

          if (isSubscribed) {
            if (logsRes.data && logsRes.data.length > 0) {
              setStudyLogs(
                logsRes.data.map((l: any) => {
                  const duration = Number(l.duration_minutes) || 0;
                  const xp =
                    l.xp_awarded !== undefined
                      ? Number(l.xp_awarded)
                      : Math.max(1, Math.floor(duration / 15));
                  return {
                    id: l.id,
                    subject_id: l.subject_id || 'sub-1',
                    chapter_id: l.chapter_id || undefined,
                    date: l.date,
                    duration_minutes: duration,
                    notes: l.notes || l.topic || '',
                    questions_solved: Number(l.questions_solved) || 0,
                    confidence_rating: Number(l.confidence_rating) || 3,
                    xp_awarded: xp,
                  };
                })
              );
            }

            if (redemptionsRes.data && redemptionsRes.data.length > 0) {
              setRedemptions(
                redemptionsRes.data.map((r: any) => ({
                  id: r.id,
                  xp_spent: Number(r.coins_amount) || 0,
                  rupee_value: Number(r.rupee_amount) || 0,
                  payout_method: r.payout_method || 'UPI',
                  destination: r.payout_destination || '',
                  date: (r.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0],
                }))
              );
            }

            if (chaptersRes.data && chaptersRes.data.length > 0) {
              setChapters(
                chaptersRes.data.map((c: any) => ({
                  id: c.id,
                  subject_id: c.subject_id,
                  name: c.name,
                  target_date: c.target_date || '',
                  completed: c.status === 'completed',
                  confidence_rating: c.confidence_rating || 3,
                }))
              );
            }
          }
        } catch (err) {
          console.warn('Cloud database fetch notice:', err);
        }
      }
      if (isSubscribed) {
        setIsLoaded(true);
      }
    }

    loadCloudData();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Sync theme changes
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [settings.theme]);

  // RULE: 15 minutes of study = 1 XP (minimum 1 XP per logged session)
  // Chapters finished award bonus XP (+10 XP per chapter)
  const lifetimeXP = useMemo(() => {
    const studyXP = studyLogs.reduce((acc, l) => {
      const awarded = l.xp_awarded !== undefined
        ? Number(l.xp_awarded)
        : Math.max(1, Math.floor((Number(l.duration_minutes) || 0) / 15));
      return acc + (Number.isFinite(awarded) ? awarded : 0);
    }, 0);
    const chapterXP = chapters.filter(c => Boolean(c.completed)).length * 10;
    return studyXP + chapterXP;
  }, [studyLogs, chapters]);

  const redeemedXP = useMemo(() => {
    return redemptions.reduce((acc, r) => {
      const spent = Number(r.xp_spent) || 0;
      return acc + spent;
    }, 0);
  }, [redemptions]);

  const availableXP = useMemo(() => {
    return Math.max(0, lifetimeXP - redeemedXP);
  }, [lifetimeXP, redeemedXP]);

  // Level curve: 100 XP per level
  const currentLevel = useMemo(() => {
    return Math.floor(lifetimeXP / 100) + 1;
  }, [lifetimeXP]);

  const xpProgressPercent = useMemo(() => {
    const currentBase = (currentLevel - 1) * 100;
    const progress = lifetimeXP - currentBase;
    return Math.min(100, Math.max(0, Math.round((progress / 100) * 100)));
  }, [lifetimeXP, currentLevel]);

  // STOCK MARKET DYNAMIC PRICE ALGORITHM
  // RULE: When total study logs is 0, NO FINE, NO PENALTY! (Rate: ₹1.00, 0% change).
  const [stockRateState, setStockRateState] = useState<{
    ratePerXP: number;
    marketTrend: 'bull' | 'bear' | 'stable';
    changePercent: number;
    marketStatus: string;
    activeStudyDaysThisWeek: number;
    missedDaysThisWeek: number;
    consecutiveStreak: number;
  }>({
    ratePerXP: 1.00,
    marketTrend: 'stable',
    changePercent: 0.0,
    marketStatus: 'NEW WORKSPACE (NO PENALTY)',
    activeStudyDaysThisWeek: 0,
    missedDaysThisWeek: 0,
    consecutiveStreak: 0,
  });

  useEffect(() => {
    // If user has 0 logs, clean baseline: no penalty, no fine!
    if (studyLogs.length === 0) {
      setStockRateState({
        ratePerXP: 1.00,
        marketTrend: 'stable',
        changePercent: 0.0,
        marketStatus: 'NEW WORKSPACE (NO PENALTY)',
        activeStudyDaysThisWeek: 0,
        missedDaysThisWeek: 0,
        consecutiveStreak: 0,
      });
      return;
    }

    const now = new Date();
    // Build past 7 calendar days
    const past7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      past7Days.push(d.toISOString().split('T')[0]);
    }

    const weekAgo = past7Days[0];
    const weekLogs = studyLogs.filter(l => l.date >= weekAgo);
    const activeDateSet = new Set(weekLogs.map(l => l.date));
    const activeDaysInWeek = activeDateSet.size;
    const missedDaysCount = 7 - activeDaysInWeek;
    const totalWeeklyHours = weekLogs.reduce((acc, l) => acc + (Number(l.duration_minutes) || 0), 0) / 60;

    // Calculate current consecutive daily streak
    let currentStreak = 0;
    for (let i = past7Days.length - 1; i >= 0; i--) {
      if (activeDateSet.has(past7Days[i])) {
        currentStreak++;
      } else {
        if (i === past7Days.length - 1) continue;
        break;
      }
    }

    const rateResult = calculateStockExchangeRate(
      activeDaysInWeek,
      totalWeeklyHours,
      missedDaysCount,
      currentStreak,
      studyLogs.length > 0
    );

    setStockRateState({
      ...rateResult,
      activeStudyDaysThisWeek: activeDaysInWeek,
      missedDaysThisWeek: missedDaysCount,
      consecutiveStreak: currentStreak,
    });
  }, [studyLogs]);

  const {
    ratePerXP,
    marketTrend,
    changePercent,
    marketStatus,
    activeStudyDaysThisWeek,
    missedDaysThisWeek,
    consecutiveStreak,
  } = stockRateState;

  // Rupee valuation for available XP
  const totalRupeeValuation = useMemo(() => {
    return Number((availableXP * ratePerXP).toFixed(2));
  }, [availableXP, ratePerXP]);

  const toggleTheme = () => {
    setSettings(s => ({
      ...s,
      theme: s.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const addChapter = (subjectId: string, name: string) => {
    if (!name.trim()) return;
    const newChap: Chapter = {
      id: 'ch-' + Date.now(),
      subject_id: subjectId,
      name: name.trim(),
      completed: false,
    };
    setChapters(prev => [...prev, newChap]);
  };

  const toggleChapterCompletion = (chapterId: string) => {
    setChapters(prev =>
      prev.map(c => (c.id === chapterId ? { ...c, completed: !c.completed } : c))
    );
  };

  const deleteChapter = (chapterId: string) => {
    setChapters(prev => prev.filter(c => c.id !== chapterId));
  };

  const addStudyLog = (logData: Omit<StudyLog, 'id'>, markChapterComplete?: boolean) => {
    const duration = Number(logData.duration_minutes) || 0;
    const baseXP = Math.max(1, Math.floor(duration / 15));
    const finalXP = logData.xp_awarded !== undefined ? Number(logData.xp_awarded) : baseXP;

    const newLog: StudyLog = {
      ...logData,
      duration_minutes: duration,
      xp_awarded: finalXP,
      id: 'log-' + Date.now(),
    };
    setStudyLogs(prev => [newLog, ...prev]);

    if (markChapterComplete && logData.chapter_id) {
      setChapters(prev =>
        prev.map(c => (c.id === logData.chapter_id ? { ...c, completed: true } : c))
      );
    }

    // Save online to Supabase
    if (supabase) {
      supabase
        .from('study_logs')
        .insert({
          date: logData.date,
          duration_minutes: duration,
          xp_awarded: finalXP,
          topic: logData.notes || 'Study Session',
          notes: logData.notes || '',
        })
        .then(
          ({ error }) => {
            if (error) console.info('Supabase online sync info:', error.message);
          },
          () => {}
        );
    }
  };

  const updateStudyLog = (id: string, updates: Partial<StudyLog>) => {
    setStudyLogs(prev =>
      prev.map(l => {
        if (l.id !== id) return l;
        const duration = updates.duration_minutes !== undefined ? Number(updates.duration_minutes) : l.duration_minutes;
        const xp = updates.xp_awarded !== undefined
          ? Number(updates.xp_awarded)
          : (updates.duration_minutes !== undefined ? Math.max(1, Math.floor(duration / 15)) : l.xp_awarded);
        return { ...l, ...updates, duration_minutes: duration, xp_awarded: xp };
      })
    );
  };

  const deleteStudyLog = (id: string) => {
    setStudyLogs(prev => prev.filter(l => l.id !== id));
    if (supabase) {
      supabase.from('study_logs').delete().eq('id', id).then(() => {}, () => {});
    }
  };

  const redeemXP = (xpAmount: number, payoutMethod: string, destination: string): boolean => {
    if (xpAmount <= 0 || xpAmount > availableXP) {
      alert(`Invalid XP amount. You have ${availableXP} available XP.`);
      return false;
    }
    const rupeeValue = Number((xpAmount * ratePerXP).toFixed(2));
    const newRedemption: RedemptionItem = {
      id: 'red-' + Date.now(),
      xp_spent: xpAmount,
      rupee_value: rupeeValue,
      payout_method: payoutMethod,
      destination,
      date: new Date().toISOString().split('T')[0],
    };
    setRedemptions(prev => [newRedemption, ...prev]);

    // Save online to Supabase
    if (supabase) {
      supabase
        .from('redemption_requests')
        .insert({
          coins_amount: xpAmount,
          rupee_amount: rupeeValue,
          payout_method: payoutMethod,
          payout_destination: destination,
          status: 'pending',
        })
        .then(
          ({ error }) => {
            if (error) console.info('Supabase redemption sync info:', error.message);
          },
          () => {}
        );
    }

    return true;
  };

  const deleteRedemption = (id: string) => {
    setRedemptions(prev => prev.filter(r => r.id !== id));
  };

  const clearAllRedemptions = () => {
    setRedemptions([]);
  };

  const clearAllData = () => {
    setStudyLogs([]);
    setRedemptions([]);
    setChapters(prev => prev.map(c => ({ ...c, completed: false })));
    try {
      localStorage.removeItem(STORAGE_PREFIX + 'studyLogs');
      localStorage.removeItem(STORAGE_PREFIX + 'redemptions');
      localStorage.removeItem(STORAGE_PREFIX + 'chapters');
      // Also clear legacy prefixes if any existed
      localStorage.removeItem('learnloot_mini_studyLogs');
      localStorage.removeItem('learnloot_mini_redemptions');
      localStorage.removeItem('learnloot_mini_chapters');
    } catch {}
  };

  return (
    <WorkspaceContext.Provider
      value={{
        subjects,
        chapters,
        studyLogs,
        redemptions,
        settings,
        lifetimeXP,
        availableXP,
        redeemedXP,
        currentLevel,
        xpProgressPercent,
        ratePerXP,
        marketTrend,
        changePercent,
        marketStatus,
        activeStudyDaysThisWeek,
        missedDaysThisWeek,
        consecutiveStreak,
        totalRupeeValuation,
        toggleTheme,
        addChapter,
        toggleChapterCompletion,
        deleteChapter,
        addStudyLog,
        updateStudyLog,
        deleteStudyLog,
        redeemXP,
        deleteRedemption,
        clearAllRedemptions,
        clearAllData,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be within WorkspaceProvider');
  return ctx;
}
