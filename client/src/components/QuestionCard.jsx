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
      <div className="bg-[#FFF8E7] border border-[#F1D58A] rounded-[28px] p-6 shadow-md relative">
        {/* Category & Status Bar */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FFFDF5] text-[#9A7610] border border-[#F1D58A]">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            {question.category || "English Quiz"}
          </span>

          {/* Opponent Answer Status */}
          <div className="text-[11px] font-semibold flex items-center gap-1.5">
            {opponentAnswered ? (
              <span className="text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {opponentName} answered ✓
              </span>
            ) : (
              <span className="text-[#6B7280] flex items-center gap-1 bg-[#FFFDF5] px-2.5 py-0.5 rounded-full border border-[#E5D8B0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-pulse" />
                {opponentName} is thinking...
              </span>
            )}
          </div>
        </div>

        {/* Question Text */}
        <h2 className="text-xl md:text-2xl font-black text-[#1F2937] tracking-tight leading-snug mb-2 font-display">
          {question.question}
        </h2>
      </div>

      {/* Answer Options (4 buttons, >=52px touch target) */}
      <div className="grid grid-cols-1 gap-2.5">
        {displayOptions.map((option, idx) => {
          const isThisSelected = selectedAnswer === option;
          const isThisCorrect = correctAnswer === option;

          // Determine button style based on game state
          let buttonStyle = "bg-[#FFFFFF] hover:bg-[#FFF1B8] text-[#1F2937] border-[#E5D8B0] shadow-sm";
          let badgeIcon = null;

          if (isFeedbackRevealed) {
            if (isThisCorrect) {
              // Highlight correct answer in green
              buttonStyle = "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.01]";
              badgeIcon = <CheckCircle2 className="w-5 h-5 text-white" />;
            } else if (isThisSelected && !isCorrect) {
              // Selected wrong answer in red
              buttonStyle = "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20";
              badgeIcon = <XCircle className="w-5 h-5 text-white" />;
            } else {
              // Dim other options
              buttonStyle = "bg-[#FFFFFF]/60 text-[#9CA3AF] border-[#E5D8B0]/50 opacity-50";
            }
          } else if (isThisSelected) {
            // User submitted answer, light gold selected state
            buttonStyle = "bg-[#FFF1B8] text-[#1F2937] border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/50";
          } else if (isLocked) {
            // Locked but not selected
            buttonStyle = "bg-[#FFFFFF]/70 text-[#9CA3AF] border-[#E5D8B0]/60 opacity-60";
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
                        ? "bg-[#D4AF37] text-[#1F2937] font-extrabold"
                        : "bg-[#FFF8E7] text-[#9A7610] border border-[#F1D58A]"
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
        <div className="bg-[#FFF8E7] rounded-2xl p-4 border border-[#F1D58A] shadow-md animate-fade-in flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-black text-[#1F2937] flex items-center gap-1.5">
                <span>Answer submitted</span>
                <span className="text-[#16a34a]">✓</span>
              </div>
              <div className="text-[11px] text-[#6B7280] font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                <span>Waiting for opponent...</span>
              </div>
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-[#1F2937] px-2.5 py-1 rounded-lg bg-white border border-[#E5D8B0]">
            {timeLeft}s
          </div>
        </div>
      )}

      {/* Answer Feedback & Explanation Box (revealed when question ends) */}
      {isFeedbackRevealed && answerFeedback && (
        <div className="bg-[#FFF8E7] rounded-2xl p-4 border border-[#F1D58A] shadow-md animate-fade-in flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9A7610] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-[#D4AF37]" /> Correct Answer:
            </span>
            <span className="text-xs font-extrabold text-emerald-700 font-mono">
              {correctAnswer}
            </span>
          </div>

          {answerFeedback.explanation && (
            <p className="text-xs text-[#4B5563] leading-relaxed mt-0.5">
              {answerFeedback.explanation}
            </p>
          )}

          <div className="text-[11px] text-[#9CA3AF] italic mt-1 text-right">
            Next question loading...
          </div>
        </div>
      )}
    </div>
  );
}
