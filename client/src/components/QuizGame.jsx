import React, { useState, useEffect } from "react";
import { LogOut, AlertTriangle, ArrowRight } from "lucide-react";
import { ScoreBoard } from "./ScoreBoard";
import { QuestionTimer } from "./QuestionTimer";
import { QuestionCard } from "./QuestionCard";

export function QuizGame({
  room,
  currentQuestion,
  timeLeft,
  maxTime = 10,
  userRole,
  playerId,
  onAnswer,
  onExit,
  answerFeedback,
  opponentAnswered,
  isIntermission,
  intermissionData,
  opponentDisconnected
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Reset selected answer when a new question arrives
  useEffect(() => {
    setSelectedAnswer(null);
  }, [currentQuestion?.index]);

  const handleSelectAnswer = (option) => {
    if (selectedAnswer !== null || isIntermission) return;
    setSelectedAnswer(option);
    onAnswer(currentQuestion.index, option);
  };

  const isLocked = selectedAnswer !== null || isIntermission || timeLeft <= 0;
  const opponentName = userRole === "host" ? room?.guestPlayer?.name : room?.hostPlayer?.name;

  return (
    <div className="flex flex-col gap-4 animate-fade-in relative">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="py-1.5 px-3 rounded-full bg-[#FFF8E7] hover:bg-[#FFFDF5] active:scale-95 transition text-[#4B5563] hover:text-[#1F2937] text-xs font-bold flex items-center gap-1.5 border border-[#F1D58A] shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5 text-[#9A7610]" />
          <span>Exit</span>
        </button>

        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#9A7610] font-mono">
            Question {(currentQuestion?.index || 0) + 1} of {room?.totalQuestions || 10}
          </span>
        </div>

        <div className="w-14" /> {/* Spacer */}
      </div>

      {/* Opponent Disconnect Alert */}
      {opponentDisconnected && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Opponent disconnected</span>
          </div>
          <button
            onClick={onExit}
            className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-[11px]"
          >
            Leave
          </button>
        </div>
      )}

      {/* Score Board */}
      <ScoreBoard
        hostPlayer={room?.hostPlayer}
        guestPlayer={room?.guestPlayer}
        userRole={userRole}
        playerId={playerId}
        userAnswered={selectedAnswer !== null}
        opponentAnswered={opponentAnswered}
        isIntermission={isIntermission}
      />

      {/* 10-Second Synchronized Question Timer */}
      <QuestionTimer timeLeft={timeLeft} maxTime={maxTime} />

      {/* Question Card */}
      <QuestionCard
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        answerFeedback={answerFeedback}
        onSelectAnswer={handleSelectAnswer}
        isLocked={isLocked}
        opponentAnswered={opponentAnswered}
        opponentName={opponentName}
        timeLeft={timeLeft}
        isIntermission={isIntermission}
      />

      {/* Intermission Overlay between questions */}
      {isIntermission && (
        <div className="fixed inset-x-0 bottom-6 z-40 px-4 max-w-[420px] mx-auto animate-bounce-gentle">
          <div className="bg-[#FFF8E7] rounded-2xl p-4 shadow-2xl border-2 border-[#D4AF37] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#9A7610]">
                Question Complete
              </div>
              <div className="text-sm font-black text-[#1F2937]">
                {room?.hostPlayer?.name} {room?.hostPlayer?.score} - {room?.guestPlayer?.score} {room?.guestPlayer?.name}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#9A7610]">
              <span>Next</span>
              <ArrowRight className="w-4 h-4 animate-pulse text-[#D4AF37]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
