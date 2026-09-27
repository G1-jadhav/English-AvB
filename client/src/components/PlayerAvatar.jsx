import React from "react";
import { getAvatarById } from "../data/avatars";
import { Crown } from "lucide-react";

export function PlayerAvatar({ 
  avatarId = "avatar-1", 
  name = "Player", 
  score = null, 
  isHost = false, 
  size = "md",
  isOpponent = false,
  isTurn = false,
  highlight = false
}) {
  const avatar = getAvatarById(avatarId);

  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-14 h-14 text-sm",
    lg: "w-20 h-20 text-base",
    xl: "w-24 h-24 text-lg"
  };

  const ringClasses = isTurn || highlight
    ? "ring-4 ring-[#8587D9] shadow-lg shadow-indigo-500/40"
    : "ring-2 ring-white/20";

  return (
    <div className="flex flex-col items-center select-none text-center">
      <div className="relative">
        {/* Crown for host */}
        {isHost && (
          <div className="absolute -top-2.5 -right-1 z-10 bg-amber-400 text-amber-950 p-1 rounded-full shadow-md">
            <Crown className="w-3.5 h-3.5 fill-current" />
          </div>
        )}

        {/* Circular Avatar */}
        <div className={`${sizeClasses[size] || sizeClasses.md} rounded-full overflow-hidden transition-all duration-300 ${ringClasses} bg-white/10 p-0.5`}>
          {avatar.svg}
        </div>

        {/* Score pill if provided */}
        {score !== null && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full border border-white/20 shadow-md">
            {score}
          </div>
        )}
      </div>

      {name && (
        <span className="mt-2 font-semibold text-white/90 text-xs md:text-sm tracking-wide max-w-[90px] truncate">
          {name}
        </span>
      )}
    </div>
  );
}
