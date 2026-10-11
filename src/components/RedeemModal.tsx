'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  Sparkles,
  IndianRupee,
  ArrowRight,
  CheckCircle2,
  X,
  Wallet,
  ShieldCheck,
  History,
  Trash2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RedeemModal({ isOpen, onClose }: RedeemModalProps) {
  const {
    availableXP,
    lifetimeXP,
    redeemedXP,
    ratePerXP,
    redeemXP,
    redemptions,
    deleteRedemption,
    clearAllRedemptions,
    totalRupeeValuation
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'redeem' | 'history'>('redeem');
  const [xpToRedeem, setXpToRedeem] = useState<number>(availableXP > 0 ? Math.min(availableXP, 50) : 10);
  const [method, setMethod] = useState('UPI (Instant)');
  const [destination, setDestination] = useState('learner@okhdfcbank');
  const [success, setSuccess] = useState(false);

  // Keep slider synced when availableXP changes
  React.useEffect(() => {
    if (availableXP > 0 && (xpToRedeem > availableXP || xpToRedeem <= 0)) {
      setXpToRedeem(Math.min(availableXP, 50));
    }
  }, [availableXP]);

  if (!isOpen) return null;

  const currentRupeeValue = Number((xpToRedeem * ratePerXP).toFixed(2));

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (xpToRedeem <= 0 || xpToRedeem > availableXP) {
      alert(`Please choose an amount between 1 and ${availableXP} XP`);
      return;
    }
    const ok = redeemXP(xpToRedeem, method, destination);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setActiveTab('history');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-[#1C1F26] border border-[#2B2F38] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B2F38] bg-[#15171D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Loot Payout & Rewards</h3>
              <p className="text-[11px] text-[#969BA7]">Convert focus output to personal rewards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#969BA7] hover:text-white hover:bg-[#1C1F26] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Redeem Form vs Payout History */}
        <div className="flex items-center border-b border-[#2B2F38] bg-[#171920] px-6 text-xs">
          <button
            onClick={() => setActiveTab('redeem')}
            className={`py-3 px-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'redeem'
                ? 'border-[#B8F36B] text-[#B8F36B]'
                : 'border-transparent text-[#969BA7] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Redeem XP</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-[#B8F36B] text-[#B8F36B]'
                : 'border-transparent text-[#969BA7] hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Payout History</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#1C1F26] text-[#969BA7] border border-[#2B2F38]">
              {redemptions.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'redeem' ? (
            success ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-white">Redemption Claimed!</h4>
                <p className="text-xs text-[#969BA7]">
                  ₹{currentRupeeValue} claimed for {xpToRedeem} XP at current market rate ₹{ratePerXP}/XP.
                </p>
                <span className="text-[11px] text-[#B8F36B] block">Redirecting to Payout History...</span>
              </div>
            ) : (
              <form onSubmit={handleRedeem} className="space-y-4 text-xs">
                {/* Balance Overview */}
                <div className="p-4 rounded-2xl bg-[#15171D] border border-[#2B2F38] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-[#969BA7]">Available XP</span>
                      <span className="text-[10px] text-[#969BA7]">({lifetimeXP} total earned)</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-[#B8F36B]">{availableXP} XP</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#969BA7]">Market Exchange Rate</span>
                    <div className="text-sm font-mono font-bold text-white">1 XP = ₹{ratePerXP}</div>
                    <span className="text-[10px] text-emerald-400 font-mono">Portfolio: ₹{totalRupeeValuation}</span>
                  </div>
                </div>

                {availableXP === 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">No Available XP to Redeem</p>
                      <p className="text-[11px] text-[#969BA7] mt-0.5">
                        Log study sessions (15 mins = 1 XP) or complete chapters (+10 XP) to earn XP.
                        {redeemedXP > 0 && (
                          <span> You have redeemed {redeemedXP} XP in past payouts (see Payout History tab).</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Slider / Number Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-medium">
                    <label className="text-[#969BA7]">XP to Redeem</label>
                    <span className="font-mono text-white font-bold">{xpToRedeem} XP</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={Math.max(1, availableXP)}
                    step="1"
                    value={xpToRedeem}
                    disabled={availableXP === 0}
                    onChange={e => setXpToRedeem(Number(e.target.value))}
                    className="w-full accent-[#B8F36B] cursor-pointer disabled:opacity-40"
                  />
                  <div className="flex justify-between text-[10px] text-[#969BA7]">
                    <span>Min: 1 XP</span>
                    <span>Max: {availableXP} XP</span>
                  </div>
                </div>

                {/* Rupee Equivalent Callout */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#B8F36B]/15 via-emerald-500/10 to-transparent border border-[#B8F36B]/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#B8F36B] tracking-wider">Estimated Payout</span>
                    <div className="text-xl font-black text-white font-mono">₹{currentRupeeValue}</div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-[#B8F36B]" />
                </div>

                {/* Payout Method */}
                <div className="space-y-1">
                  <label className="block text-[#969BA7] font-medium">Reward Payout Method</label>
                  <select
                    value={method}
                    onChange={e => setMethod(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#111318] border border-[#2B2F38] text-white focus:outline-none focus:border-[#B8F36B]"
                  >
                    <option value="UPI (Instant)">UPI (GPay, PhonePe, Paytm)</option>
                    <option value="Amazon Pay Gift Card">Amazon Pay Gift Card</option>
                    <option value="Bookstore Voucher">Bookstore / Academic Credit</option>
                    <option value="Personal Cash Ledger">Personal Allowance Ledger</option>
                  </select>
                </div>

                {/* Destination */}
                <div className="space-y-1">
                  <label className="block text-[#969BA7] font-medium">Payment ID / UPI VPA</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    placeholder="e.g. name@upi or your email"
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#111318] border border-[#2B2F38] text-white focus:outline-none focus:border-[#B8F36B]"
                  />
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={availableXP < 1 || xpToRedeem <= 0}
                    className="w-full py-3 rounded-2xl bg-[#B8F36B] hover:bg-[#a3e652] disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Confirm Redemption (₹{currentRupeeValue})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )
          ) : (
            /* Payout History Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Your Past Redemptions</h4>
                  <p className="text-[11px] text-[#969BA7]">
                    Total Redeemed: {redeemedXP} XP · {redemptions.length} payout(s)
                  </p>
                </div>

                {redemptions.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Clear all redemption history? This will also return the XP back to your available balance.')) {
                        clearAllRedemptions();
                      }
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset History</span>
                  </button>
                )}
              </div>

              {redemptions.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#15171D] border border-dashed border-[#2B2F38] space-y-2">
                  <Wallet className="w-8 h-8 text-[#969BA7] mx-auto opacity-50" />
                  <p className="text-xs font-bold text-white">No Payout History Yet</p>
                  <p className="text-[11px] text-[#969BA7]">
                    When you redeem your study XP for rewards, your receipts will be recorded here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {redemptions.map(r => (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-2xl bg-[#15171D] border border-[#2B2F38] hover:border-[#3E4350] transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{r.payout_method}</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Completed
                          </span>
                        </div>
                        <div className="text-[11px] text-[#969BA7] truncate font-mono">
                          To: {r.destination}
                        </div>
                        <div className="text-[10px] text-[#969BA7]">
                          {formatDate(r.date)} · <span className="text-[#B8F36B] font-bold">-{r.xp_spent} XP</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-black font-mono text-[#B8F36B]">
                            ₹{r.rupee_value}
                          </div>
                          <span className="text-[10px] text-[#969BA7] font-mono">
                            {r.xp_spent} XP
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm(`Refund ${r.xp_spent} XP and delete this payout record?`)) {
                              deleteRedemption(r.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-[#969BA7] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete payout and restore XP"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
