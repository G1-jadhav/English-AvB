import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, RotateCcw, PlusCircle, Home, CheckCircle2, XCircle, Percent, Target } from "lucide-react";
import { PlayerAvatar } from "./PlayerAvatar";

export function QuizResult({ 
  resultData, 
  userRole, 
  onPlayAgain, 
  onCreateNewRoom, 
  onReturnHome 
}) {
  const { winner, isDraw, hostStats, guestStats, totalQuestions } = resultData || {};

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore if confetti not supported
    }
  }, []);

  const userStats = userRole === "host" ? hostStats : (guestStats || hostStats);
  const opponentStats = userRole === "host" ? guestStats : hostStats;

  return (
    <div className="flex flex-col gap-5 animate-fade-in pb-6">
      {/* Trophy / Result Header */}
      <div className="text-center pt-2">
        <div className="inline-flex p-3.5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950 shadow-xl shadow-amber-500/20 mb-3 animate-bounce-gentle">
          <Trophy className="w-8 h-8 fill-current" />
        </div>
        <span className="block text-[11px] font-bold tracking-widest text-[#8587D9] uppercase">
          GAME OVER
        </span>
        <h1 className="text-3xl font-black text-white font-display">
          Quiz Complete
        </h1>
      </div>

      {/* Main Result Card */}
      <div className="glass-card-solid rounded-[28px] p-6 shadow-2xl relative overflow-hidden">
        {/* Matchup Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          {/* Host */}
          <div className="flex-1 flex flex-col items-center">
            <PlayerAvatar
              avatarId={hostStats?.avatar || "avatar-1"}
              name={hostStats?.name}
              size="lg"
            />
            <div className="mt-2 text-2xl font-black text-slate-800 font-display">
              {hostStats?.score || 0}
            </div>
            <span className="text-[11px] font-bold uppercase text-slate-400">
              points
            </span>
          </div>

          <div className="px-3 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs">
              VS
            </div>
          </div>

          {/* Guest */}
          <div className="flex-1 flex flex-col items-center">
            {guestStats ? (
              <>
                <PlayerAvatar
                  avatarId={guestStats?.avatar || "avatar-2"}
                  name={guestStats?.name}
                  size="lg"
                />
                <div className="mt-2 text-2xl font-black text-slate-800 font-display">
                  {guestStats?.score || 0}
                </div>
                <span className="text-[11px] font-bold uppercase text-slate-400">
                  points
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-400">Solo</span>
            )}
          </div>
        </div>

        {/* Winner Announcement Banner */}
        <div className="py-4 text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            Quiz Finished
          </div>
          {isDraw ? (
            <div className="text-xl font-black text-slate-800">
              It's a Draw!
            </div>
          ) : (
            <div className="text-xl font-black text-slate-800">
              {winner} won the match!
            </div>
          )}

          {/* Subtext breakdown */}
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-2">
            <span>{hostStats?.name} scored {hostStats?.score} points</span>
            {guestStats && (
              <>
                <span>•</span>
                <span>{guestStats?.name} scored {guestStats?.score} points</span>
              </>
            )}
          </div>
        </div>

        {/* Detailed Player Performance Stats */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600" /> Your Performance
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50 rounded-2xl p-2.5 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-lg font-black text-emerald-700 font-mono">
                {userStats?.correctCount || 0}
              </div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase">
                Correct
              </div>
            </div>

            <div className="bg-rose-50 rounded-2xl p-2.5 border border-rose-100">
              <XCircle className="w-4 h-4 text-rose-600 mx-auto mb-1" />
              <div className="text-lg font-black text-rose-700 font-mono">
                {userStats?.wrongCount || 0}
              </div>
              <div className="text-[10px] font-bold text-rose-600 uppercase">
                Wrong
              </div>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-2.5 border border-indigo-100">
              <Percent className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <div className="text-lg font-black text-indigo-700 font-mono">
                {userStats?.accuracy || 0}%
              </div>
              <div className="text-[10px] font-bold text-indigo-600 uppercase">
                Accuracy
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={onPlayAgain}
          className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#6F70C8] via-[#7B7CE0] to-[#8587D9] hover:brightness-110 active:scale-[0.98] text-white text-base font-extrabold tracking-wide transition shadow-xl shadow-indigo-600/35 border border-white/20 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>PLAY AGAIN</span>
        </button>

        <button
          onClick={onCreateNewRoom}
          className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white text-sm font-bold tracking-wide transition border border-white/20 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-[#8587D9]" />
          <span>CREATE NEW ROOM</span>
        </button>

        <button
          onClick={onReturnHome}
          className="w-full min-h-[48px] py-3 px-6 rounded-2xl hover:bg-white/10 active:scale-[0.98] text-white/70 hover:text-white text-xs font-semibold tracking-wide transition flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>RETURN HOME</span>
        </button>
      </div>
    </div>
  );
}
