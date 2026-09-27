import React from "react";
import { BookOpen, Sparkles, Feather, GraduationCap } from "lucide-react";

export function BackgroundDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Soft atmospheric ambient violet glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[360px] rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-[420px] h-[420px] rounded-full bg-purple-700/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-[460px] h-[460px] rounded-full bg-indigo-700/10 blur-[140px] pointer-events-none" />

      {/* Restrained, elegant educational accents */}
      <div className="absolute top-16 left-8 text-violet-400/[0.07] animate-float">
        <BookOpen className="w-10 h-10" />
      </div>

      <div className="absolute top-36 right-10 text-violet-300/[0.08] animate-float" style={{ animationDelay: "1.5s" }}>
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="absolute top-2/3 left-10 text-violet-400/[0.06] animate-float" style={{ animationDelay: "2.8s" }}>
        <Feather className="w-9 h-9" />
      </div>

      <div className="absolute bottom-24 right-12 text-violet-400/[0.07] animate-float" style={{ animationDelay: "3.5s" }}>
        <GraduationCap className="w-10 h-10" />
      </div>
    </div>
  );
}

