import React from "react";

export function Countdown({ count, text }) {
  const displayText = text || (count > 0 ? count : "GO!");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md select-none animate-fade-in">
      <div className="flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-widest text-[#9A7610] font-bold mb-4">
          GET READY!
        </span>

        <div className="relative">
          {/* Animated pulsing rings */}
          <div className="absolute inset-0 rounded-full bg-[#F4E3A1]/50 blur-2xl animate-ping" />
          
          <div 
            key={displayText}
            className="relative w-36 h-36 rounded-full bg-[#FFF8E7] border-2 border-[#F1D58A] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/30 animate-scale-in"
          >
            <span className="text-6xl font-black tracking-tight text-[#1F2937] font-display drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)]">
              {displayText}
            </span>
          </div>
        </div>

        <p className="mt-8 text-sm text-[#4B5563] font-medium">
          Quiz is starting in real-time...
        </p>
      </div>
    </div>
  );
}
