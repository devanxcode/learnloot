'use client';

import React, { useState } from 'react';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { DesktopSidebar, MobileBottomNav } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { Subjects } from '@/components/Subjects';
import { StudyLogTable } from '@/components/StudyLogTable';
import { Analytics } from '@/components/Analytics';
import { StudyLogModal } from '@/components/StudyLogModal';
import { RedeemModal } from '@/components/RedeemModal';
import { LoginGate } from '@/components/LoginGate';
import { StudyLog } from '@/types';
import { Sparkles, Gift } from 'lucide-react';

function LearnLootApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subjects' | 'logs' | 'analytics'>('dashboard');
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<StudyLog | null>(null);
  const [initialChapterId, setInitialChapterId] = useState<string | undefined>(undefined);

  const handleOpenNewModal = (chapId?: string) => {
    setEditingLog(null);
    setInitialChapterId(chapId);
    setLogModalOpen(true);
  };

  const handleEditLog = (log: StudyLog) => {
    setEditingLog(log);
    setInitialChapterId(undefined);
    setLogModalOpen(true);
  };

  return (
    <LoginGate>
      <div className="flex h-screen w-screen overflow-hidden bg-[#111318] text-[#E6E8EC]">
        {/* Modern Desktop Sidebar */}
        <DesktopSidebar
          activeTab={activeTab}
          setActiveTab={(t: any) => setActiveTab(t)}
          onOpenLogModal={() => handleOpenNewModal()}
          onOpenRedeemModal={() => setRedeemModalOpen(true)}
        />

        {/* Main Content View */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Modern Mobile Top Header */}
          <header className="md:hidden h-14 border-b border-[#2B2F38] bg-[#15171D]/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#B8F36B] flex items-center justify-center font-black text-black text-xs shadow-md shadow-[#B8F36B]/20">
                LL
              </div>
              <span className="font-extrabold text-sm text-white tracking-tight">LearnLoot</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRedeemModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Redeem</span>
              </button>
              <button
                onClick={() => handleOpenNewModal()}
                className="px-3 py-1.5 rounded-xl bg-[#B8F36B] text-black text-xs font-black shadow-md shadow-[#B8F36B]/20 active:scale-95"
              >
                + Log
              </button>
            </div>
          </header>

          {/* View Router */}
          <main className="flex-1 overflow-y-auto">
            {activeTab === 'dashboard' && (
              <Dashboard
                onOpenLogModal={() => handleOpenNewModal()}
                onNavigateToLogs={() => setActiveTab('logs')}
                onNavigateToSubjects={() => setActiveTab('subjects')}
              />
            )}

            {activeTab === 'subjects' && (
              <Subjects
                onLogChapterSession={(chapId) => handleOpenNewModal(chapId)}
              />
            )}

            {activeTab === 'logs' && (
              <StudyLogTable
                onOpenNewModal={() => handleOpenNewModal()}
                onEditLog={handleEditLog}
              />
            )}

            {activeTab === 'analytics' && <Analytics />}
          </main>
        </div>

        {/* Modern Mobile Bottom Navigation */}
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={(t: any) => setActiveTab(t)}
          onOpenLogModal={() => handleOpenNewModal()}
          onOpenRedeemModal={() => setRedeemModalOpen(true)}
        />

        {/* Study Log Creation & Edit Modal */}
        <StudyLogModal
          isOpen={logModalOpen}
          onClose={() => {
            setLogModalOpen(false);
            setInitialChapterId(undefined);
          }}
          editingLog={editingLog}
          initialChapterId={initialChapterId}
        />

        {/* Redeem XP Modal */}
        <RedeemModal
          isOpen={redeemModalOpen}
          onClose={() => setRedeemModalOpen(false)}
        />
      </div>
    </LoginGate>
  );
}

export default function Home() {
  return (
    <WorkspaceProvider>
      <LearnLootApp />
    </WorkspaceProvider>
  );
}
