'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { StudyLog } from '@/types';
import { Clock, X, Sparkles, Award } from 'lucide-react';
import { getIndianDateString } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface StudyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLog: StudyLog | null;
  initialChapterId?: string;
}

export function StudyLogModal({ isOpen, onClose, editingLog, initialChapterId }: StudyLogModalProps) {
  const { subjects, chapters, addStudyLog, updateStudyLog, toggleChapterCompletion } = useWorkspace();

  const [date, setDate] = useState('2026-10-11');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [chapterId, setChapterId] = useState('');
  const [hours, setHours] = useState<number | string>(1);
  const [minutes, setMinutes] = useState<number | string>(30);
  const [notes, setNotes] = useState('');
  const [markChapterCompleted, setMarkChapterCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingLog) {
      setDate(editingLog.date);
      setSubjectId(editingLog.subject_id);
      setChapterId(editingLog.chapter_id || '');
      setHours(Math.floor(editingLog.duration_minutes / 60));
      setMinutes(editingLog.duration_minutes % 60);
      setNotes(editingLog.notes || '');
      setMarkChapterCompleted(false);
    } else {
      setDate(getIndianDateString());
      const selectedChap = initialChapterId ? chapters.find(c => c.id === initialChapterId) : null;
      if (selectedChap) {
        setSubjectId(selectedChap.subject_id);
        setChapterId(selectedChap.id);
      } else {
        setSubjectId(subjects[0]?.id || '');
        setChapterId('');
      }
      setHours(1);
      setMinutes(30);
      setNotes('');
      setMarkChapterCompleted(false);
    }
  }, [editingLog, subjects, chapters, isOpen, initialChapterId]);

  if (!isOpen) return null;

  const subjectChapters = chapters.filter(c => c.subject_id === subjectId);
  const selectedChapter = chapters.find(c => c.id === chapterId);
  const isAlreadyCompleted = Boolean(selectedChapter?.completed);

  const totalMinutes = (Number(hours) || 0) * 60 + (Number(minutes) || 0);
  const studyXP = Math.max(1, Math.floor(totalMinutes / 15));
  const chapterBonusXP = (!isAlreadyCompleted && markChapterCompleted) ? 10 : 0;
  const totalEarnedXP = studyXP + chapterBonusXP;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalMinutes <= 0) {
      alert('Please enter a duration greater than 0 minutes.');
      return;
    }

    if (editingLog) {
      updateStudyLog(editingLog.id, {
        date,
        subject_id: subjectId,
        chapter_id: chapterId || undefined,
        duration_minutes: totalMinutes,
        xp_awarded: totalEarnedXP,
        notes: notes.trim() || undefined,
      });
      if (markChapterCompleted && chapterId && !isAlreadyCompleted) {
        toggleChapterCompletion(chapterId);
      }
    } else {
      addStudyLog(
        {
          date,
          subject_id: subjectId,
          chapter_id: chapterId || undefined,
          duration_minutes: totalMinutes,
          xp_awarded: totalEarnedXP,
          notes: notes.trim() || undefined,
        },
        markChapterCompleted && !isAlreadyCompleted
      );
    }

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // gracefully ignore if canvas not supported
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[#1C1F26] border border-[#2B2F38] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B2F38] bg-[#15171D]">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-[#B8F36B]" />
            <div>
              <h3 className="text-sm font-bold text-white">
                {editingLog ? 'Edit Study Session' : 'Log Manual Study Session'}
              </h3>
              <p className="text-[10px] text-[#969BA7]">
                Record study time & complete syllabus sections to level up XP
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#969BA7] hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Date & Subject */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#969BA7] mb-1 font-medium">Session Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#111318] border border-[#2B2F38] text-white focus:outline-none focus:border-[#B8F36B]"
              />
            </div>

            <div>
              <label className="block text-[#969BA7] mb-1 font-medium">Subject *</label>
              <select
                value={subjectId}
                onChange={e => {
                  setSubjectId(e.target.value);
                  setChapterId('');
                  setMarkChapterCompleted(false);
                }}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#111318] border border-[#2B2F38] text-white focus:outline-none focus:border-[#B8F36B]"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Chapter / Section */}
          <div>
            <label className="block text-[#969BA7] mb-1 font-medium">
              Chapter / Syllabus Section (Optional)
            </label>
            <select
              value={chapterId}
              onChange={e => {
                setChapterId(e.target.value);
                setMarkChapterCompleted(false);
              }}
              className="w-full px-3 py-2 rounded-xl bg-[#111318] border border-[#2B2F38] text-white focus:outline-none focus:border-[#B8F36B]"
            >
              <option value="">-- No specific section --</option>
              {subjectChapters.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.completed ? '✓ (Completed)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Mark Chapter/Section Completed Checkbox */}
          {chapterId && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                isAlreadyCompleted
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : markChapterCompleted
                  ? 'bg-[#B8F36B]/10 border-[#B8F36B]/40'
                  : 'bg-[#111318] border-[#2B2F38]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <input
                  type="checkbox"
                  id="markChapter"
                  disabled={isAlreadyCompleted}
                  checked={isAlreadyCompleted || markChapterCompleted}
                  onChange={e => setMarkChapterCompleted(e.target.checked)}
                  className="w-4 h-4 rounded text-[#B8F36B] accent-[#B8F36B] cursor-pointer shrink-0"
                />
                <label htmlFor="markChapter" className="cursor-pointer select-none">
                  <span className="font-semibold text-white block text-xs">
                    {isAlreadyCompleted
                      ? 'Section Already Completed'
                      : 'Completed this section in this session?'}
                  </span>
                  <span className="text-[10px] text-[#969BA7] block">
                    {isAlreadyCompleted
                      ? 'Already earned +10 XP bonus'
                      : 'Check to mark section finished and earn +10 Bonus XP!'}
                  </span>
                </label>
              </div>

              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg shrink-0 flex items-center gap-1 ${
                  isAlreadyCompleted
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-[#B8F36B]/20 text-[#B8F36B]'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>+10 XP</span>
              </span>
            </div>
          )}

          {/* Actual Manual Duration */}
          <div className="p-3.5 rounded-xl bg-[#111318] border border-[#2B2F38] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white">
                Actual Time Studied
              </span>
              <span className="text-xs font-mono font-bold text-[#B8F36B] flex items-center gap-1.5 bg-[#B8F36B]/15 px-2.5 py-1 rounded-lg border border-[#B8F36B]/25">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+{totalEarnedXP} XP Earned</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#969BA7] mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={e => setHours(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-lg bg-[#1C1F26] border border-[#2B2F38] text-white font-mono text-xs focus:outline-none focus:border-[#B8F36B]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#969BA7] mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={e => setMinutes(e.target.value === '' ? '' : Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 rounded-lg bg-[#1C1F26] border border-[#2B2F38] text-white font-mono text-xs focus:outline-none focus:border-[#B8F36B]"
                />
              </div>
            </div>

            <div className="text-[10px] text-[#969BA7] flex items-center justify-between pt-0.5">
              <span>Study Rate: 15 mins = 1 XP (Duration: {totalMinutes} mins)</span>
              {chapterBonusXP > 0 && (
                <span className="text-emerald-400 font-semibold">+10 XP Section Bonus</span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[#969BA7] mb-1 font-medium">Notes / Takeaways (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Practiced derivation, revised formula sheet..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#111318] border border-[#2B2F38] text-white focus:outline-none focus:border-[#B8F36B]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B2F38]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#969BA7] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#B8F36B] hover:bg-[#a3e652] text-black font-bold text-xs transition-all shadow-md active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{editingLog ? 'Save Changes' : `Log Entry (+${totalEarnedXP} XP)`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

