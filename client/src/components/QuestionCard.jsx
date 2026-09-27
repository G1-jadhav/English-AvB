import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, Sparkles } from "lucide-react";

function shuffleOptions(options) {
  if (!Array.isArray(options)) return [];
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function QuestionCard({
  question,
  selectedAnswer,
  answerFeedback,
  onSelectAnswer,
  isLocked,
  opponentAnswered,
  opponentName = "Opponent",
  timeLeft,
  isIntermission = false
}) {
  const [shuffledOptions, setShuffledOptions] = useState(() => {
    return question?.options ? shuffleOptions(question.options) : [];
  });

  // Re-shuffle ONCE whenever a new question starts (stable across timer/score renders)
  useEffect(() => {
    if (question?.options) {
      setShuffledOptions(shuffleOptions(question.options));
    }
  }, [question?.index, question?.question]);

  if (!question) return null;

  const isAnswered = selectedAnswer !== null;
  const isFeedbackRevealed = Boolean(answerFeedback || isIntermission);
  const isCorrect = answerFeedback?.isCorrect;
  const correctAnswer = answerFeedback?.correctAnswer;
  const displayOptions = shuffledOptions.length > 0 ? shuffledOptions : (question.options || []);

  return (
    <div className="flex flex-col gap-4 animate-scale-in">
      {/* Question Card Box */}
      <div className="glass-card-solid rounded-[28px] p-6 shadow-2xl relative">
        {/* Category & Status Bar */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            {question.category || "English Quiz"}
          </span>

          {/* Opponent Answer Status */}
          <div className="text-[11px] font-semibold flex items-center gap-1.5">
            {opponentAnswered ? (
              <span className="text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                {opponentName} answered ✓
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                {opponentName} is thinking...
              </span>
            )}
          </div>
        </div>

        {/* Question Text */}
        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-snug mb-2 font-display">
          {question.question}
        </h2>
      </div>

      {/* Answer Options (4 buttons, >=52px touch target) */}
      <div className="grid grid-cols-1 gap-2.5">
        {displayOptions.map((option, idx) => {
          const isThisSelected = selectedAnswer === option;
          const isThisCorrect = correctAnswer === option;

          // Determine button style based on game state
          let buttonStyle = "bg-white/10 hover:bg-white/15 text-white border-white/20";
          let badgeIcon = null;

          if (isFeedbackRevealed) {
            if (isThisCorrect) {
              // Highlight correct answer in green
              buttonStyle = "bg-emerald-500/90 text-white border-emerald-400 shadow-lg shadow-emerald-500/30 scale-[1.01]";
              badgeIcon = <CheckCircle2 className="w-5 h-5 text-white" />;
            } else if (isThisSelected && !isCorrect) {
              // Selected wrong answer in red
              buttonStyle = "bg-rose-500/90 text-white border-rose-400 shadow-lg shadow-rose-500/30";
              badgeIcon = <XCircle className="w-5 h-5 text-white" />;
            } else {
              // Dim other options
              buttonStyle = "bg-white/5 text-white/40 border-white/5 opacity-50";
            }
          } else if (isThisSelected) {
            // User submitted answer, waiting for opponent / question end
            buttonStyle = "bg-[#6F70C8] text-white border-white/40 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50";
          } else if (isLocked) {
            // Locked but not selected
            buttonStyle = "bg-white/5 text-white/50 border-white/5 opacity-60";
          }

          const optionLetters = ["A", "B", "C", "D"];

          return (
            <button
              key={idx}
              disabled={isLocked}
              onClick={() => onSelectAnswer(option)}
              className={`w-full min-h-[54px] py-3.5 px-4 rounded-2xl border text-left font-semibold text-base transition-all duration-200 flex items-center justify-between active:scale-[0.99] ${buttonStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono ${
                  isFeedbackRevealed && isThisCorrect 
                    ? "bg-white text-emerald-700" 
                    : isFeedbackRevealed && isThisSelected && !isCorrect 
                      ? "bg-white text-rose-700" 
                      : isThisSelected
                        ? "bg-white text-indigo-900 font-extrabold"
                        : "bg-white/10 text-white/80"
                }`}>
                  {optionLetters[idx]}
                </span>
                <span className="capitalize">{option}</span>
              </div>

              {badgeIcon}
            </button>
          );
        })}
      </div>

      {/* Waiting for Opponent Status Banner (shown after one player answers, before question ends) */}
      {isAnswered && !isFeedbackRevealed && (
        <div className="glass-card rounded-2xl p-4 border border-indigo-400/30 bg-indigo-950/40 animate-fade-in flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>Answer submitted</span>
                <span className="text-emerald-400">✓</span>
              </div>
              <div className="text-[11px] text-indigo-200/80 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                <span>Waiting for opponent...</span>
              </div>
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-white/60 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
            {timeLeft}s
          </div>
        </div>
      )}

      {/* Answer Feedback & Explanation Box (revealed when question ends) */}
      {isFeedbackRevealed && answerFeedback && (
        <div className="glass-card rounded-2xl p-4 border border-white/20 animate-fade-in flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8587D9] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Correct Answer:
            </span>
            <span className="text-xs font-extrabold text-emerald-300 font-mono">
              {correctAnswer}
            </span>
          </div>

          {answerFeedback.explanation && (
            <p className="text-xs text-white/80 leading-relaxed mt-0.5">
              {answerFeedback.explanation}
            </p>
          )}

          <div className="text-[11px] text-white/40 italic mt-1 text-right">
            Next question loading...
          </div>
        </div>
      )}
    </div>
  );
}
