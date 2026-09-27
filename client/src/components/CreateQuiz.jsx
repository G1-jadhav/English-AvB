import React, { useState } from "react";
import { ArrowLeft, Sparkles, BookOpen, Clock, Layers, Award } from "lucide-react";
import { AVATARS } from "../data/avatars";

const CATEGORIES = [
  "Mixed English",
  "Grammar",
  "Vocabulary",
  "Tenses",
  "Articles",
  "Prepositions"
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export function CreateQuiz({ 
  onBack, 
  onCreate, 
  playerName, 
  setPlayerName, 
  playerAvatar, 
  setPlayerAvatar,
  isLoading 
}) {
  const [category, setCategory] = useState("Mixed English");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(10);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError("Please enter your player name.");
      return;
    }
    setError("");
    onCreate({
      hostName: playerName.trim(),
      hostAvatar: playerAvatar,
      category,
      difficulty: difficulty.toLowerCase(),
      questionCount,
      timePerQuestion
    });
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 active:scale-95 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8587D9]">
            SETUP 1v1 MATCH
          </span>
          <h1 className="text-2xl font-black text-white font-display">
            Create Quiz
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Profile / Host Card */}
        <div className="glass-card rounded-2xl p-4 border border-white/15">
          <label className="block text-[11px] font-bold tracking-wider text-[#8587D9] uppercase mb-2">
            Your Avatar & Name
          </label>

          {/* Quick Avatar Row */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => setPlayerAvatar(av.id)}
                className={`w-11 h-11 rounded-full p-0.5 transition-all flex-shrink-0 ${
                  playerAvatar === av.id
                    ? "ring-4 ring-[#8587D9] scale-105"
                    : "opacity-60 hover:opacity-100 ring-1 ring-white/20"
                }`}
              >
                {av.svg}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={18}
            placeholder="Enter your player name..."
            className="w-full px-4 py-3 rounded-xl glass-input text-sm font-semibold placeholder-white/40"
          />
        </div>

        {/* Category Selection */}
        <div className="glass-card rounded-2xl p-4 border border-white/15">
          <label className="block text-[11px] font-bold tracking-wider text-[#8587D9] uppercase mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Quiz Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition text-left flex items-center justify-between ${
                  category === cat
                    ? "bg-[#6F70C8] text-white shadow-md shadow-indigo-600/30 border border-white/30"
                    : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
                }`}
              >
                <span>{cat}</span>
                {category === cat && <Sparkles className="w-3 h-3 text-amber-300" />}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="glass-card rounded-2xl p-4 border border-white/15">
          <label className="block text-[11px] font-bold tracking-wider text-[#8587D9] uppercase mb-2 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition text-center ${
                  difficulty === diff
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md border border-white/30"
                    : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Quiz Parameters (Questions & Timer) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-2xl p-3.5 border border-violet-500/20">
            <div className="text-[11px] font-bold tracking-wider text-violet-300 uppercase mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Questions
            </div>
            <div className="text-xl font-extrabold text-white mt-1">
              10 <span className="text-xs font-normal text-violet-300/60">Qs</span>
            </div>
            <div className="text-[10px] text-violet-200/60 mt-0.5">Fixed standard round</div>
          </div>

          <div className="glass-card rounded-2xl p-3.5 border border-violet-500/20">
            <div className="text-[11px] font-bold tracking-wider text-violet-300 uppercase mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Timer
            </div>
            <div className="text-xl font-extrabold text-white mt-1">
              10 <span className="text-xs font-normal text-violet-300/60">sec / Q</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Fast-paced 1v1</div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full min-h-[52px] py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white text-base font-extrabold tracking-wide transition shadow-xl shadow-violet-600/30 border border-violet-400/30 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>CREATE QUIZ ARENA</span>
          )}
        </button>
      </form>
    </div>
  );
}
