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
        <div className="inline-flex p-3.5 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F4E3A1] text-[#1F2937] shadow-xl shadow-[#D4AF37]/25 mb-3 animate-bounce-gentle">
          <Trophy className="w-8 h-8 fill-current" />
        </div>
        <span className="block text-[11px] font-bold tracking-widest text-[#9A7610] uppercase">
          GAME OVER
        </span>
        <h1 className="text-3xl font-black text-[#1F2937] font-display">
          Quiz Complete
        </h1>
      </div>

      {/* Main Result Card */}
      <div className="bg-[#FFF8E7] rounded-[28px] p-6 shadow-md border border-[#F1D58A] relative overflow-hidden">
        {/* Matchup Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#F1D58A]/50">
          {/* Host */}
          <div className="flex-1 flex flex-col items-center">
            <PlayerAvatar
              avatarId={hostStats?.avatar || "avatar-1"}
              name={hostStats?.name}
              size="lg"
            />
            <div className="mt-2 text-2xl font-black text-[#1F2937] font-display">
              {hostStats?.score || 0}
            </div>
            <span className="text-[11px] font-bold uppercase text-[#6B7280]">
              points
            </span>
          </div>

          <div className="px-3 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#FFFDF5] text-[#6B7280] border border-[#F1D58A] flex items-center justify-center font-black text-xs">
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
                <div className="mt-2 text-2xl font-black text-[#1F2937] font-display">
                  {guestStats?.score || 0}
                </div>
                <span className="text-[11px] font-bold uppercase text-[#6B7280]">
                  points
                </span>
              </>
            ) : (
              <span className="text-xs text-[#6B7280]">Solo</span>
            )}
          </div>
        </div>

        {/* Winner Announcement Banner */}
        <div className="py-4 text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-[#9A7610] mb-1">
            Quiz Finished
          </div>
          {isDraw ? (
            <div className="text-xl font-black text-[#1F2937]">
              It's a Draw!
            </div>
          ) : (
            <div className="text-xl font-black text-[#1F2937]">
              {winner} won the match!
            </div>
          )}

          {/* Subtext breakdown */}
          <div className="text-xs text-[#6B7280] mt-1 flex items-center justify-center gap-2">
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
        <div className="pt-4 border-t border-[#F1D58A]/50">
          <div className="text-xs font-bold text-[#1F2937] uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#9A7610]" /> Your Performance
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50 rounded-2xl p-2.5 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-lg font-black text-emerald-700 font-mono">
                {userStats?.correctCount || 0}
              </div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase">
                Correct
              </div>
            </div>

            <div className="bg-rose-50 rounded-2xl p-2.5 border border-rose-200">
              <XCircle className="w-4 h-4 text-rose-600 mx-auto mb-1" />
              <div className="text-lg font-black text-rose-700 font-mono">
                {userStats?.wrongCount || 0}
              </div>
              <div className="text-[10px] font-bold text-rose-600 uppercase">
                Wrong
              </div>
            </div>

            <div className="bg-[#FFFDF5] rounded-2xl p-2.5 border border-[#F1D58A]">
              <Percent className="w-4 h-4 text-[#9A7610] mx-auto mb-1" />
              <div className="text-lg font-black text-[#1F2937] font-mono">
                {userStats?.accuracy || 0}%
              </div>
              <div className="text-[10px] font-bold text-[#9A7610] uppercase">
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
          style={{ background: "linear-gradient(135deg, #D4AF37, #E8C96A)" }}
          className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl hover:brightness-105 active:scale-[0.98] text-[#1F2937] text-base font-extrabold tracking-wide transition shadow-xl shadow-[#D4AF37]/25 border border-[#F4E3A1] flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5 text-[#1F2937]" />
          <span>PLAY AGAIN</span>
        </button>

        <button
          onClick={onCreateNewRoom}
          className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-[#FFFDF5] hover:bg-white active:scale-[0.98] text-[#1F2937] text-sm font-bold tracking-wide transition border border-[#D4AF37] shadow-sm flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-[#9A7610]" />
          <span>CREATE NEW ROOM</span>
        </button>

        <button
          onClick={onReturnHome}
          className="w-full min-h-[48px] py-3 px-6 rounded-2xl hover:bg-[#FFF8E7] active:scale-[0.98] text-[#4B5563] hover:text-[#1F2937] text-xs font-semibold tracking-wide transition flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>RETURN HOME</span>
        </button>
      </div>
    </div>
  );
}
