import React, { useState } from "react";
import { Copy, Check, Share2, ArrowLeft, Play, Users, Sparkles, Clock, BookOpen } from "lucide-react";
import { PlayerAvatar } from "./PlayerAvatar";

export function WaitingRoom({ 
  room, 
  isHost, 
  onStartQuiz, 
  onLeaveRoom, 
  isStarting 
}) {
  const [copied, setCopied] = useState(false);
  const [shareText, setShareText] = useState("");

  const hostPlayer = room?.hostPlayer;
  const guestPlayer = room?.guestPlayer;
  const roomId = room?.roomId;
  const hasOpponent = !!guestPlayer;

  const handleCopy = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!roomId) return;
    const shareData = {
      title: "Join my English Quiz Battle!",
      text: `Join my English Quiz room: ${roomId}`,
      url: window.location.href.split("?")[0] + `?room=${roomId}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareText("Shared!");
        setTimeout(() => setShareText(""), 2000);
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
      setShareText("Copied!");
      setTimeout(() => setShareText(""), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onLeaveRoom}
          className="w-10 h-10 rounded-full bg-[#FFF8E7] border border-[#F1D58A] flex items-center justify-center text-[#4B5563] hover:text-[#1F2937] hover:bg-[#FFFDF5] active:scale-95 transition shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A7610]">
            MATCH LOBBY
          </span>
          <h2 className="text-xl font-black text-[#1F2937] font-display">
            {hasOpponent ? "Ready to Battle!" : "Waiting for Opponent..."}
          </h2>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Room ID Sharing Card */}
      <div className="bg-[#FFF8E7] rounded-[24px] p-5 border border-[#F1D58A] text-center shadow-md">
        <div className="text-[11px] font-bold tracking-widest text-[#9A7610] uppercase mb-1">
          ROOM ID
        </div>
        <div className="text-3xl font-black tracking-widest text-[#1F2937] font-mono my-1 selection:bg-[#F4E3A1]">
          {roomId}
        </div>
        <p className="text-xs text-[#6B7280] mb-4">
          Share this Room ID with your opponent.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#FFFDF5] hover:bg-white active:scale-95 text-[#1F2937] text-xs font-bold transition border border-[#E5D8B0] hover:border-[#D4AF37] shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#22C55E]" />
                <span className="text-[#16a34a]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#9A7610]" />
                <span>COPY ID</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            style={{ background: "linear-gradient(135deg, #D4AF37, #E8C96A)" }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl hover:brightness-105 active:scale-95 text-[#1F2937] text-xs font-bold transition shadow-md shadow-[#D4AF37]/20 border border-[#F4E3A1]"
          >
            <Share2 className="w-4 h-4 text-[#1F2937]" />
            <span>{shareText || "SHARE"}</span>
          </button>
        </div>
      </div>

      {/* VS Matchup Card */}
      <div className="bg-[#FFF8E7] rounded-[28px] p-6 border border-[#F1D58A] shadow-md relative overflow-hidden">
        {/* Glow behind VS */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#F4E3A1]/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          {/* Host */}
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[10px] font-bold tracking-wider text-[#9A7610] uppercase mb-2 px-2 py-0.5 rounded-full bg-[#FFFDF5] border border-[#F1D58A]">
              HOST
            </span>
            <PlayerAvatar
              avatarId={hostPlayer?.avatar || "avatar-1"}
              name={hostPlayer?.name || "Host"}
              size="lg"
              isHost={true}
              highlight={true}
            />
          </div>

          {/* VS Center Badge */}
          <div className="px-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E8C96A] border-2 border-white flex items-center justify-center font-black text-[#1F2937] text-sm shadow-md">
              VS
            </div>
          </div>

          {/* Guest / Opponent */}
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[10px] font-bold tracking-wider text-[#9A7610] uppercase mb-2 px-2 py-0.5 rounded-full bg-[#FFFDF5] border border-[#F1D58A]">
              {guestPlayer ? "OPPONENT" : "WAITING"}
            </span>

            {guestPlayer ? (
              <PlayerAvatar
                avatarId={guestPlayer.avatar || "avatar-2"}
                name={guestPlayer.name}
                size="lg"
                highlight={true}
              />
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#F1D58A] flex items-center justify-center bg-[#FFFDF5] animate-pulse-slow">
                  <div className="w-7 h-7 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                </div>
                <span className="mt-2 text-xs font-semibold text-[#9CA3AF] text-center animate-pulse">
                  Waiting...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quiz Specs summary pills */}
        <div className="mt-6 pt-4 border-t border-[#F1D58A]/50 flex items-center justify-around text-xs text-[#6B7280]">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{room?.quizSettings?.category || "Mixed English"}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-[#F1D58A]" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{room?.quizSettings?.timePerQuestion || 10}s per question</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-[#F1D58A]" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>10 Qs</span>
          </div>
        </div>
      </div>

      {/* Status & Action */}
      <div className="mt-2">
        {hasOpponent ? (
          isHost ? (
            <button
              onClick={onStartQuiz}
              disabled={isStarting}
              className="w-full min-h-[52px] py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-105 active:scale-[0.98] text-white text-base font-black tracking-wide transition shadow-xl shadow-emerald-600/30 border border-emerald-400 flex items-center justify-center gap-2 animate-bounce-gentle"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START QUIZ</span>
            </button>
          ) : (
            <div className="py-4 px-6 rounded-2xl bg-[#FFFDF5] border border-[#F1D58A] text-center shadow-sm">
              <div className="inline-flex items-center gap-2 text-[#9A7610] text-sm font-bold">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
                Waiting for host to start...
              </div>
            </div>
          )
        ) : (
          <div className="py-4 px-6 rounded-2xl bg-[#FFFDF5] border border-[#F1D58A] text-center flex flex-col items-center gap-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-[#4B5563] text-sm font-semibold">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Waiting for player to join...
            </div>
            <p className="text-xs text-[#9CA3AF]">
              Send your room code to an opponent to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
