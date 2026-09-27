import React from "react";

export function Countdown({ count, text }) {
  const displayText = text || (count > 0 ? count : "GO!");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#120B2E]/90 backdrop-blur-md select-none animate-fade-in">
      <div className="flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-widest text-[#8587D9] font-bold mb-4">
          GET READY!
        </span>

        <div className="relative">
          {/* Animated pulsing rings */}
          <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-2xl animate-ping" />
          
          <div 
            key={displayText}
            className="relative w-36 h-36 rounded-full glass-card border-2 border-white/40 flex items-center justify-center shadow-2xl shadow-indigo-600/50 animate-scale-in"
          >
            <span className="text-6xl font-black tracking-tight text-white font-display drop-shadow-[0_0_20px_rgba(133,135,217,0.8)]">
              {displayText}
            </span>
          </div>
        </div>

        <p className="mt-8 text-sm text-purple-200/80 font-medium">
          Quiz is starting in real-time...
        </p>
      </div>
    </div>
  );
}
