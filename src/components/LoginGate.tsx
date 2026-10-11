'use client';

import React, { useState, useEffect } from 'react';
import { Lock, User, Sparkles, ShieldCheck, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoginGateProps {
  children: React.ReactNode;
}

const AUTH_STORAGE_KEY = 'learnloot_auth_session';

export function LoginGate({ children }: LoginGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState('devanand');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored === 'devanand_logged_in') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const targetUser = process.env.NEXT_PUBLIC_APP_USERNAME || 'devanand';
    const targetPass = process.env.NEXT_PUBLIC_APP_PASSWORD || 'DEV123';

    setTimeout(() => {
      if (username.trim().toLowerCase() === targetUser.toLowerCase() && password === targetPass) {
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, 'devanand_logged_in');
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
        setIsAuthenticated(true);
      } else {
        setErrorMsg('Invalid username or password. Please try again.');
      }
      setIsLoading(false);
    }, 250);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
    setIsAuthenticated(false);
    setPassword('');
  };

  // Prevent flash while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#111318] text-[#E6E8EC]">
        <div className="w-8 h-8 rounded-full border-2 border-[#B8F36B] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-[#0d0f14] p-4 text-[#E6E8EC] relative overflow-hidden">
        {/* Ambient Glowing Backdrop */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#B8F36B]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md rounded-3xl bg-[#16181F]/90 backdrop-blur-xl border border-[#2B2F38] shadow-2xl p-7 md:p-8 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
          {/* Logo / Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#B8F36B] text-black font-black text-xl shadow-lg shadow-[#B8F36B]/20 mb-1">
              LL
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span>Devanand's LearnLoot</span>
              <Sparkles className="w-5 h-5 text-[#B8F36B]" />
            </h1>
            <p className="text-xs text-[#969BA7]">
              Personal Mission Control · Study Sessions & Market XP Engine
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#969BA7] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B8F36B]" />
                <span>Username</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="devanand"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#101217] border border-[#2B2F38] text-white text-sm focus:outline-none focus:border-[#B8F36B] transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#969BA7] mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#B8F36B]" />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#101217] border border-[#2B2F38] text-white text-sm focus:outline-none focus:border-[#B8F36B] transition-colors font-mono"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#B8F36B] hover:bg-[#a3e652] text-black font-extrabold text-sm transition-all shadow-lg shadow-[#B8F36B]/20 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'Verifying...' : 'Access Mission Control'}</span>
            </button>
          </form>

          {/* Footer Note */}
          <div className="pt-2 border-t border-[#2B2F38]/60 text-center text-[11px] text-[#969BA7]">
            <span>Personal Workspace Protected · Devanand</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* User Logout Top-bar Pill */}
      <div className="hidden md:flex fixed top-3 right-5 z-40 items-center gap-2 bg-[#1C1F26]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#2B2F38] text-xs shadow-md">
        <span className="w-2 h-2 rounded-full bg-[#B8F36B] animate-pulse" />
        <span className="font-semibold text-white">Devanand</span>
        <span className="text-[#969BA7]">·</span>
        <button
          onClick={handleLogout}
          className="text-[#969BA7] hover:text-rose-400 flex items-center gap-1 transition-colors text-[11px]"
          title="Sign out of personal workspace"
        >
          <LogOut className="w-3 h-3" />
          <span>Exit</span>
        </button>
      </div>

      {children}
    </div>
  );
}
