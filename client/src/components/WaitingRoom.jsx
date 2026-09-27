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
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 active:scale-95 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8587D9]">
            MATCH LOBBY
          </span>
          <h2 className="text-xl font-black text-white font-display">
            {hasOpponent ? "Ready to Battle!" : "Waiting for Opponent..."}
          </h2>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Room ID Sharing Card */}
      <div className="glass-card rounded-[24px] p-5 border border-white/15 text-center shadow-xl">
        <div className="text-[11px] font-bold tracking-widest text-[#8587D9] uppercase mb-1">
          ROOM ID
        </div>
        <div className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-white to-indigo-100 font-mono my-1">
          {roomId}
        </div>
        <p className="text-xs text-white/60 mb-4">
          Share this Room ID with your opponent.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition border border-white/15"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#8587D9]" />
                <span>COPY ID</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#6F70C8] hover:bg-[#7B7CE0] active:scale-95 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
          >
            <Share2 className="w-4 h-4" />
            <span>{shareText || "SHARE"}</span>
          </button>
        </div>
      </div>

      {/* VS Matchup Card */}
      <div className="glass-card rounded-[28px] p-6 border border-white/20 shadow-2xl relative overflow-hidden">
        {/* Glow behind VS */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          {/* Host */}
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[10px] font-bold tracking-wider text-amber-300 uppercase mb-2 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30">
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white/40 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-purple-900/50">
              VS
            </div>
          </div>

          {/* Guest / Opponent */}
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[10px] font-bold tracking-wider text-indigo-300 uppercase mb-2 px-2 py-0.5 rounded-full bg-indigo-400/10 border border-indigo-400/30">
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
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center bg-white/5 animate-pulse-slow">
                  <div className="w-7 h-7 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                </div>
                <span className="mt-2 text-xs font-semibold text-white/50 text-center animate-pulse">
                  Waiting...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quiz Specs summary pills */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-around text-xs text-white/70">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#8587D9]" />
            <span>{room?.quizSettings?.category || "Mixed English"}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/30" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8587D9]" />
            <span>{room?.quizSettings?.timePerQuestion || 10}s per question</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/30" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
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
              className="w-full min-h-[52px] py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 active:scale-[0.98] text-white text-base font-black tracking-wide transition shadow-xl shadow-emerald-900/50 border border-white/30 flex items-center justify-center gap-2 animate-bounce-gentle"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START QUIZ</span>
            </button>
          ) : (
            <div className="py-4 px-6 rounded-2xl glass-card border border-white/20 text-center">
              <div className="inline-flex items-center gap-2 text-indigo-300 text-sm font-bold">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                Waiting for host to start...
              </div>
            </div>
          )
        ) : (
          <div className="py-4 px-6 rounded-2xl glass-card border border-white/15 text-center flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2 text-white/70 text-sm font-semibold">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Waiting for player to join...
            </div>
            <p className="text-xs text-white/40">
              Send your room code to an opponent to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
