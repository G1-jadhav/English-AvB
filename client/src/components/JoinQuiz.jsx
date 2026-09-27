import React, { useState } from "react";
import { ArrowLeft, Users, KeyRound } from "lucide-react";
import { AVATARS } from "../data/avatars";

export function JoinQuiz({ 
  onBack, 
  onJoin, 
  playerName, 
  setPlayerName, 
  playerAvatar, 
  setPlayerAvatar, 
  initialRoomId = "",
  isLoading 
}) {
  const [roomId, setRoomId] = useState(initialRoomId.toUpperCase());
  const [error, setError] = useState("");

  const handleRoomIdChange = (e) => {
    // Only alphanumeric, max 6 chars, uppercase
    const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setRoomId(clean);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomId || roomId.length < 4) {
      setError("Please enter a valid 6-character Room ID.");
      return;
    }
    if (!playerName.trim()) {
      setError("Please enter your player name.");
      return;
    }

    setError("");
    onJoin({
      roomId: roomId.trim(),
      playerName: playerName.trim(),
      playerAvatar
    }, (err) => {
      if (err) {
        setError(err);
      }
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
            ENTER CODE
          </span>
          <h1 className="text-2xl font-black text-white font-display">
            Join Quiz
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Room ID input card */}
        <div className="glass-card rounded-2xl p-5 border border-violet-500/20">
          <label className="block text-[11px] font-bold tracking-wider text-violet-300 uppercase mb-2 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" /> Room Code
          </label>
          <input
            type="text"
            value={roomId}
            onChange={handleRoomIdChange}
            placeholder="A7K9P2"
            maxLength={6}
            className="w-full text-center text-2xl font-black tracking-widest uppercase font-mono py-3.5 rounded-xl glass-input placeholder-white/25 text-white"
          />
          <p className="text-[11px] text-violet-200/60 text-center mt-2">
            Ask the host for their 6-character room code.
          </p>
        </div>

        {/* Player Profile Card */}
        <div className="glass-card rounded-2xl p-4 border border-violet-500/20">
          <label className="block text-[11px] font-bold tracking-wider text-violet-300 uppercase mb-2">
            Your Avatar & Name
          </label>

          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => setPlayerAvatar(av.id)}
                className={`w-11 h-11 rounded-full p-0.5 transition-all flex-shrink-0 ${
                  playerAvatar === av.id
                    ? "ring-4 ring-violet-400 scale-105"
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

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold text-center animate-shake">
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
            <>
              <Users className="w-5 h-5" />
              <span>JOIN ROOM</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
