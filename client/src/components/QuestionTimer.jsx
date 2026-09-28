import React from "react";
import { Clock } from "lucide-react";

export function QuestionTimer({ timeLeft = 10, maxTime = 10 }) {
  const percentage = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));
  const isCritical = timeLeft <= 3 && timeLeft > 0;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#6B7280] font-medium flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Time Remaining</span>
        </span>

        {/* Numeric Countdown in Top-Right */}
        <span className={`font-mono font-black text-sm px-2.5 py-0.5 rounded-full transition-all duration-300 ${
          isCritical 
            ? "bg-rose-500 text-white timer-critical scale-110" 
            : "bg-[#FFF8E7] text-[#1F2937] border border-[#F1D58A]"
        }`}>
          {timeLeft}s
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-[#FFF8E7] rounded-full overflow-hidden p-0.5 border border-[#F1D58A]">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isCritical
              ? "bg-gradient-to-r from-rose-500 to-amber-500"
              : "bg-gradient-to-r from-[#D4AF37] via-[#E8C96A] to-[#22C55E]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
