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
          className="w-10 h-10 rounded-full bg-[#FFF8E7] border border-[#F1D58A] flex items-center justify-center text-[#4B5563] hover:text-[#1F2937] hover:bg-[#FFFDF5] active:scale-95 transition shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A7610]">
            SETUP 1v1 MATCH
          </span>
          <h1 className="text-2xl font-black text-[#1F2937] font-display">
            Create Quiz
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Profile / Host Card */}
        <div className="bg-[#FFF8E7] rounded-2xl p-4 border border-[#F1D58A] shadow-sm">
          <label className="block text-[11px] font-bold tracking-wider text-[#9A7610] uppercase mb-2">
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
                    ? "ring-4 ring-[#D4AF37] scale-105"
                    : "opacity-60 hover:opacity-100 ring-1 ring-[#E5D8B0]"
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
            className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5D8B0] focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-[#1F2937] text-sm font-semibold placeholder-[#9CA3AF] transition-all"
          />
        </div>

        {/* Category Selection */}
        <div className="bg-[#FFF8E7] rounded-2xl p-4 border border-[#F1D58A] shadow-sm">
          <label className="block text-[11px] font-bold tracking-wider text-[#9A7610] uppercase mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" /> Quiz Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                style={category === cat ? { background: "linear-gradient(135deg, #D4AF37, #E8C96A)" } : {}}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition text-left flex items-center justify-between ${
                  category === cat
                    ? "text-[#1F2937] shadow-sm border border-[#F4E3A1]"
                    : "bg-[#FFFDF5] hover:bg-white text-[#4B5563] border border-[#E5D8B0]"
                }`}
              >
                <span>{cat}</span>
                {category === cat && <Sparkles className="w-3 h-3 text-[#1F2937]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="bg-[#FFF8E7] rounded-2xl p-4 border border-[#F1D58A] shadow-sm">
          <label className="block text-[11px] font-bold tracking-wider text-[#9A7610] uppercase mb-2 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#D4AF37]" /> Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                style={difficulty === diff ? { background: "linear-gradient(135deg, #D4AF37, #E8C96A)" } : {}}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition text-center ${
                  difficulty === diff
                    ? "text-[#1F2937] shadow-sm border border-[#F4E3A1]"
                    : "bg-[#FFFDF5] hover:bg-white text-[#4B5563] border border-[#E5D8B0]"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Quiz Parameters (Questions & Timer) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#FFF8E7] rounded-2xl p-3.5 border border-[#F1D58A] shadow-sm">
            <div className="text-[11px] font-bold tracking-wider text-[#9A7610] uppercase mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#D4AF37]" /> Questions
            </div>
            <div className="text-xl font-extrabold text-[#1F2937] mt-1">
              10 <span className="text-xs font-normal text-[#6B7280]">Qs</span>
            </div>
            <div className="text-[10px] text-[#6B7280] mt-0.5">Fixed standard round</div>
          </div>

          <div className="bg-[#FFF8E7] rounded-2xl p-3.5 border border-[#F1D58A] shadow-sm">
            <div className="text-[11px] font-bold tracking-wider text-[#9A7610] uppercase mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> Timer
            </div>
            <div className="text-xl font-extrabold text-[#1F2937] mt-1">
              10 <span className="text-xs font-normal text-[#6B7280]">sec / Q</span>
            </div>
            <div className="text-[10px] text-[#16a34a] font-semibold mt-0.5">Fast-paced 1v1</div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{ background: "linear-gradient(135deg, #D4AF37, #E8C96A)" }}
          className="mt-2 w-full min-h-[52px] py-4 px-6 rounded-2xl hover:brightness-105 active:scale-[0.98] text-[#1F2937] text-base font-extrabold tracking-wide transition shadow-xl shadow-[#D4AF37]/25 border border-[#F4E3A1] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-[#1F2937] border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>CREATE QUIZ ARENA</span>
          )}
        </button>
      </form>
    </div>
  );
}
