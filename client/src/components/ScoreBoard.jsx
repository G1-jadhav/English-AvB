import React from "react";
import { PlayerAvatar } from "./PlayerAvatar";
import { Check, Clock } from "lucide-react";

export function ScoreBoard({ 
  hostPlayer, 
  guestPlayer, 
  userRole, 
  playerId,
  userAnswered, 
  opponentAnswered,
  isIntermission 
}) {
  // Construct players list
  const players = [
    hostPlayer ? { ...hostPlayer, isHost: true } : null,
    guestPlayer ? { ...guestPlayer, isHost: false } : null
  ].filter(Boolean);

  // Identify Current Player ("YOU") and Opponent Player
  let currentPlayer = null;
  let opponentPlayer = null;

  if (playerId) {
    currentPlayer = players.find(p => p.id === playerId);
    opponentPlayer = players.find(p => p.id !== playerId);
  }

  // Fallback using userRole if playerId not provided or not matched
  if (!currentPlayer) {
    if (userRole === "guest") {
      currentPlayer = guestPlayer ? { ...guestPlayer, isHost: false } : null;
      opponentPlayer = hostPlayer ? { ...hostPlayer, isHost: true } : null;
    } else {
      currentPlayer = hostPlayer ? { ...hostPlayer, isHost: true } : null;
      opponentPlayer = guestPlayer ? { ...guestPlayer, isHost: false } : null;
    }
  }

  const leftPlayer = currentPlayer || { name: "You", avatar: "avatar-1", score: 0, isHost: userRole === "host" };
  const rightPlayer = opponentPlayer || { name: "Opponent", avatar: "avatar-2", score: 0, isHost: userRole !== "host" };

  const leftIsHost = Boolean(leftPlayer.isHost || (hostPlayer && leftPlayer.id === hostPlayer.id));
  const rightIsHost = Boolean(rightPlayer.isHost || (hostPlayer && rightPlayer.id === hostPlayer.id));

  const leftScore = leftPlayer.score ?? 0;
  const rightScore = rightPlayer.score ?? 0;

  return (
    <div className="glass-card rounded-[24px] p-3.5 border border-white/20 shadow-xl relative overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between">
        {/* Current User / "YOU" (Always Left) */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="relative">
            <PlayerAvatar
              avatarId={leftPlayer?.avatar || "avatar-1"}
              name=""
              size="sm"
              isHost={leftIsHost}
            />
            {/* Answered indicator badge */}
            <div className="absolute -bottom-1 -right-1">
              {userAnswered ? (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full bg-white/20 text-white/70 flex items-center justify-center text-[10px]">
                  <Clock className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-[10px] text-white/50 uppercase font-semibold leading-tight flex items-center gap-1">
              <span className="truncate max-w-[85px]">{leftPlayer?.name || "You"}</span>
              <span className="text-[#8587D9] font-bold">(You)</span>
            </div>
            <div className="text-xl font-black text-white font-display">
              {leftScore}
            </div>
          </div>
        </div>

        {/* Center VS Score Badge (Relative: User Score - Opponent Score) */}
        <div className="px-3 flex flex-col items-center">
          <div className="text-[10px] font-extrabold tracking-widest text-indigo-300 uppercase">
            SCORE
          </div>
          <div className="text-base font-black text-white tracking-wider flex items-center gap-1.5 font-mono">
            <span>{leftScore}</span>
            <span className="text-white/40">-</span>
            <span>{rightScore}</span>
          </div>
        </div>

        {/* Opponent (Always Right) */}
        <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0 text-right">
          <div className="min-w-0">
            <div className="text-[10px] text-white/50 uppercase font-semibold leading-tight flex items-center justify-end gap-1">
              <span className="truncate max-w-[100px]">{rightPlayer?.name || "Opponent"}</span>
            </div>
            <div className="text-xl font-black text-white font-display">
              {rightScore}
            </div>
          </div>

          <div className="relative">
            <PlayerAvatar
              avatarId={rightPlayer?.avatar || "avatar-2"}
              name=""
              size="sm"
              isHost={rightIsHost}
            />
            {/* Answered indicator badge */}
            <div className="absolute -bottom-1 -right-1">
              {opponentAnswered ? (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full bg-white/20 text-white/70 flex items-center justify-center text-[10px]">
                  <Clock className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
