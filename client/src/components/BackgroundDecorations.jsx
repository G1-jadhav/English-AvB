import React from "react";
import { BookOpen, Sparkles, Feather, GraduationCap } from "lucide-react";

export function BackgroundDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Subtle warm-golden atmospheric highlights */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[360px] rounded-full bg-[#F4E3A1]/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-[420px] h-[420px] rounded-full bg-[#E8C96A]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-[460px] h-[460px] rounded-full bg-[#F4E3A1]/10 blur-[160px] pointer-events-none" />

      {/* Restrained, elegant educational accents */}
      <div className="absolute top-16 left-8 text-[#9A7610]/15 animate-float">
        <BookOpen className="w-10 h-10" />
      </div>

      <div className="absolute top-36 right-10 text-[#D4AF37]/15 animate-float" style={{ animationDelay: "1.5s" }}>
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="absolute top-2/3 left-10 text-[#9A7610]/15 animate-float" style={{ animationDelay: "2.8s" }}>
        <Feather className="w-9 h-9" />
      </div>

      <div className="absolute bottom-24 right-12 text-[#9A7610]/15 animate-float" style={{ animationDelay: "3.5s" }}>
        <GraduationCap className="w-10 h-10" />
      </div>
    </div>
  );
}

