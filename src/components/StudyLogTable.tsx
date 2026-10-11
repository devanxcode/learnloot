'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Clock, Plus, Trash2, Edit2, Filter, Sparkles } from 'lucide-react';
import { StudyLog } from '@/types';
import { formatMinutes, formatDate } from '@/lib/utils';

interface StudyLogViewProps {
  onOpenNewModal: () => void;
  onEditLog: (log: StudyLog) => void;
}

export function StudyLogTable({ onOpenNewModal, onEditLog }: StudyLogViewProps) {
  const { studyLogs, subjects, chapters, deleteStudyLog } = useWorkspace();
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');

  const filteredLogs = studyLogs.filter(l =>
    filterSubjectId === 'all' ? true : l.subject_id === filterSubjectId
  );

  const totalMinutes = filteredLogs.reduce((acc, l) => acc + l.duration_minutes, 0);
  const totalEarnedXP = filteredLogs.reduce(
    (acc, l) => acc + (l.xp_awarded ?? Math.max(1, Math.floor(l.duration_minutes / 15))),
    0
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2F38]">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#B8F36B]" />
            <span>Study Log</span>
          </h1>
          <p className="text-xs text-[#969BA7] mt-0.5">
            Database of your study sessions. 15 mins study = 1 XP, plus section completion bonuses.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B8F36B] hover:bg-[#a3e652] text-black font-bold text-xs transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#1C1F26] border border-[#2B2F38]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#969BA7]" />
          <span className="text-xs font-semibold text-white">Filter Subject:</span>
          <select
            value={filterSubjectId}
            onChange={e => setFilterSubjectId(e.target.value)}
            className="bg-[#111318] border border-[#2B2F38] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#B8F36B]"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-[#969BA7]">Duration: </span>
            <strong className="text-white">{formatMinutes(totalMinutes)}</strong>
          </div>
          <div>
            <span className="text-[#969BA7]">XP Earned: </span>
            <strong className="text-[#B8F36B] inline-flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{totalEarnedXP} XP</span>
            </strong>
          </div>
          <div>
            <span className="text-[#969BA7]">Entries: </span>
            <strong className="text-white">{filteredLogs.length}</strong>
          </div>
        </div>
      </div>

      {/* Notion-Style Table */}
      <div className="rounded-2xl bg-[#1C1F26] border border-[#2B2F38] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#15171D] border-b border-[#2B2F38] text-[#969BA7]">
              <tr>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Subject</th>
                <th className="py-3 px-4 font-semibold">Chapter / Section</th>
                <th className="py-3 px-4 font-semibold text-right">Actual Time</th>
                <th className="py-3 px-4 font-semibold text-right">XP Earned</th>
                <th className="py-3 px-4 font-semibold">Notes</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#2B2F38]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#969BA7]">
                    No study entries found. Click "+ New Entry" to log a study session.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const sub = subjects.find(s => s.id === log.subject_id);
                  const chap = chapters.find(c => c.id === log.chapter_id);
                  const earnedXP = log.xp_awarded ?? Math.max(1, Math.floor(log.duration_minutes / 15));

                  return (
                    <tr key={log.id} className="hover:bg-[#1F232B] transition-colors group">
                      <td className="py-3 px-4 font-mono text-white whitespace-nowrap">
                        {formatDate(log.date)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold"
                          style={{
                            backgroundColor: `${sub?.color || '#B8F36B'}15`,
                            color: sub?.color || '#B8F36B',
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sub?.color || '#B8F36B' }} />
                          {sub?.name || 'Subject'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-white max-w-xs truncate">
                        {chap ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span>{chap.name}</span>
                            {chap.completed && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded font-semibold">
                                ✓
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-[#969BA7] italic">--</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                        {formatMinutes(log.duration_minutes)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-[#B8F36B] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#B8F36B]" />
                          <span>+{earnedXP} XP</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[#969BA7] max-w-sm truncate">
                        {log.notes || <span className="text-zinc-600">--</span>}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditLog(log)}
                            className="p-1 rounded text-[#969BA7] hover:text-white hover:bg-[#111318]"
                            title="Edit entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this study log entry?')) {
                                deleteStudyLog(log.id);
                              }
                            }}
                            className="p-1 rounded text-[#969BA7] hover:text-red-400 hover:bg-[#111318]"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
