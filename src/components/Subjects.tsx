import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { GraduationCap, Plus, CheckCircle2, Circle, Trash2, Award, Clock } from 'lucide-react';
import { formatMinutes } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface SubjectsProps {
  onLogChapterSession?: (chapterId: string) => void;
}

export function Subjects({ onLogChapterSession }: SubjectsProps) {
  const { subjects, chapters, studyLogs, addSubject, deleteSubject, addChapter, toggleChapterCompletion, deleteChapter } = useWorkspace();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [newChapterName, setNewChapterName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);

  // Sync selected subject
  useEffect(() => {
    if (subjects.length > 0 && (!selectedSubjectId || !subjects.some(s => s.id === selectedSubjectId))) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const handleToggle = (chapter: any) => {
    toggleChapterCompletion(chapter.id);
    if (!chapter.completed) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  };

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const subjectChapters = chapters.filter(c => c.subject_id === currentSubject?.id);

  // Time spent in this subject
  const subjectMinutes = studyLogs
    .filter(l => l.subject_id === currentSubject?.id)
    .reduce((acc, l) => acc + l.duration_minutes, 0);

  const completedCount = subjectChapters.filter(c => c.completed).length;
  const totalCount = subjectChapters.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterName.trim() || !currentSubject) return;
    addChapter(currentSubject.id, newChapterName.trim());
    setNewChapterName('');
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    const colors = ['#60A5FA', '#F472B6', '#B8F36B', '#38BDF8', '#FBBF24', '#A78BFA', '#F87171'];
    const randomColor = colors[subjects.length % colors.length];
    await addSubject(newSubjectName.trim(), randomColor);
    setNewSubjectName('');
    setShowAddSubject(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Title */}
      <div className="pb-4 border-b border-[#2B2F38] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#B8F36B]" />
            <span>Subjects & Chapters</span>
          </h1>
          <p className="text-xs text-[#969BA7] mt-0.5">
            Organize your subjects and chapter syllabus stored directly in your cloud database.
          </p>
        </div>
        <button
          onClick={() => setShowAddSubject(prev => !prev)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C1F26] hover:bg-[#2B2F38] text-white font-semibold text-xs border border-[#2B2F38] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#B8F36B]" />
          <span>{showAddSubject ? 'Cancel' : 'Add Subject'}</span>
        </button>
      </div>

      {showAddSubject && (
        <form onSubmit={handleCreateSubject} className="p-4 rounded-2xl bg-[#1C1F26] border border-[#B8F36B]/30 flex items-center gap-3">
          <input
            type="text"
            placeholder="Enter subject name (e.g. Physics, Chemistry, DSA)..."
            value={newSubjectName}
            onChange={e => setNewSubjectName(e.target.value)}
            autoFocus
            className="flex-1 bg-[#15171D] border border-[#2B2F38] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8F36B]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#B8F36B] hover:bg-[#a3e652] text-black font-bold text-xs shrink-0"
          >
            Create Subject
          </button>
        </form>
      )}

      {/* Subject Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#2B2F38]">
        {subjects.length === 0 ? (
          <div className="text-xs text-[#969BA7] py-1">No subjects created yet. Click "+ Add Subject" to get started.</div>
        ) : (
          subjects.map(s => {
            const isSelected = s.id === currentSubject?.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSubjectId(s.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#1C1F26] text-white border-[#B8F36B]'
                    : 'bg-[#15171D] text-[#969BA7] border-[#2B2F38] hover:text-white hover:border-[#3E4350]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.name}</span>
              </button>
            );
          })
        )}
      </div>

      {currentSubject && (
        <div className="space-y-6">
          {/* Active Subject Card */}
          <div className="p-5 rounded-2xl bg-[#1C1F26] border border-[#2B2F38] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentSubject.color }} />
                <h2 className="text-xl font-bold text-white">{currentSubject.name}</h2>
                <button
                  onClick={() => {
                    if (confirm(`Delete subject "${currentSubject.name}" and all its chapters from cloud?`)) {
                      deleteSubject(currentSubject.id);
                    }
                  }}
                  className="p-1 text-[#969BA7] hover:text-red-400 transition-colors ml-2"
                  title="Delete this subject from cloud"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-[#969BA7] mt-1">
                Total Study Time: <strong className="text-[#B8F36B] font-mono">{formatMinutes(subjectMinutes)}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-[#969BA7]">Chapter Completion</span>
              <div className="text-lg font-bold text-white font-mono mt-0.5">
                {completedCount} / {totalCount} chapters ({progressPercent}%)
              </div>
              <div className="w-36 sm:w-44 bg-[#111318] h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${progressPercent}%`, backgroundColor: currentSubject.color }}
                />
              </div>
            </div>
          </div>

          {/* Add Chapter Form */}
          <form onSubmit={handleAddChapter} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Add new chapter to ${currentSubject.name}...`}
              value={newChapterName}
              onChange={e => setNewChapterName(e.target.value)}
              className="flex-1 bg-[#1C1F26] border border-[#2B2F38] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8F36B]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#B8F36B] hover:bg-[#a3e652] text-black font-bold text-xs transition-all shrink-0 active:scale-95"
            >
              + Add Chapter
            </button>
          </form>

          {/* Chapters List */}
          <div className="space-y-2">
            {subjectChapters.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#969BA7] rounded-xl bg-[#1C1F26] border border-dashed border-[#2B2F38]">
                No chapters added for {currentSubject.name} yet. Add your first chapter above.
              </div>
            ) : (
              subjectChapters.map((chap, idx) => (
                <div
                  key={chap.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors group ${
                    chap.completed
                      ? 'bg-[#15171D] border-emerald-500/20'
                      : 'bg-[#1C1F26] border-[#2B2F38] hover:border-[#3E4350]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggle(chap)}
                      className="text-[#969BA7] hover:text-[#B8F36B] shrink-0 transition-colors"
                      title={chap.completed ? 'Mark incomplete (-10 XP)' : 'Mark completed (+10 XP)'}
                    >
                      {chap.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#B8F36B]" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="truncate">
                      <span className="text-xs text-[#969BA7] mr-2">Ch {idx + 1}.</span>
                      <span
                        className={`text-xs font-medium ${
                          chap.completed ? 'line-through text-[#969BA7]' : 'text-white'
                        }`}
                      >
                        {chap.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        chap.completed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#B8F36B]/15 text-[#B8F36B] border border-[#B8F36B]/30'
                      }`}
                      title={chap.completed ? 'Completed: +10 XP Earned' : 'Complete to earn +10 XP bonus'}
                    >
                      <Award className="w-3 h-3" />
                      <span>{chap.completed ? '✓ +10 XP' : '+10 XP'}</span>
                    </span>

                    {onLogChapterSession && (
                      <button
                        onClick={() => onLogChapterSession(chap.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111318] hover:bg-[#B8F36B] text-[#969BA7] hover:text-black font-semibold text-[11px] transition-all border border-[#2B2F38]"
                        title="Log a study session for this section"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Log Session</span>
                      </button>
                    )}

                    <button
                      onClick={() => deleteChapter(chap.id)}
                      className="p-1 text-[#969BA7] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete chapter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
