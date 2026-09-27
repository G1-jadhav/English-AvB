import React from "react";
import { Clock } from "lucide-react";

export function QuestionTimer({ timeLeft = 10, maxTime = 10 }) {
  const percentage = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));
  const isCritical = timeLeft <= 3 && timeLeft > 0;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/60 font-medium flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#8587D9]" />
          <span>Time Remaining</span>
        </span>

        {/* Numeric Countdown in Top-Right */}
        <span className={`font-mono font-black text-sm px-2.5 py-0.5 rounded-full transition-all duration-300 ${
          isCritical 
            ? "bg-rose-500 text-white timer-critical scale-110" 
            : "bg-white/10 text-white border border-white/10"
        }`}>
          {timeLeft}s
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isCritical
              ? "bg-gradient-to-r from-rose-500 to-amber-500"
              : "bg-gradient-to-r from-[#6F70C8] via-[#8587D9] to-emerald-400"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
