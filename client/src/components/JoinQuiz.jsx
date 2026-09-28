import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, KeyRound } from "lucide-react";
import { AVATARS } from "../data/avatars";

// Safe helper to sanitize room code
function normalizeRoomCode(val) {
  if (typeof val === "string") {
    return val.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  }
  if (typeof val === "number") {
    return String(val).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  }
  return "";
}

export function JoinQuiz({ 
  onBack, 
  onJoin, 
  playerName = "", 
  setPlayerName, 
  playerAvatar = "avatar-1", 
  setPlayerAvatar, 
  initialRoomId = "",
  isLoading = false 
}) {
  const [roomId, setRoomId] = useState(() => normalizeRoomCode(initialRoomId));
  const [error, setError] = useState("");

  // Sync if initialRoomId is updated externally
  useEffect(() => {
    if (initialRoomId && typeof initialRoomId !== "object") {
      const normalized = normalizeRoomCode(initialRoomId);
      if (normalized) setRoomId(normalized);
    }
  }, [initialRoomId]);

  const handleRoomIdChange = (e) => {
    // Only alphanumeric, max 6 chars, uppercase
    const raw = typeof e?.target?.value === "string" ? e.target.value : "";
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setRoomId(clean);
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const cleanRoom = typeof roomId === "string" ? roomId.trim() : "";
    const cleanPlayer = typeof playerName === "string" ? playerName.trim() : String(playerName || "").trim();

    if (!cleanRoom || cleanRoom.length < 4) {
      setError("Please enter a valid 6-character Room ID.");
      return;
    }
    if (!cleanPlayer) {
      setError("Please enter your player name.");
      return;
    }

    setError("");
    if (typeof onJoin === "function") {
      onJoin({
        roomId: cleanRoom,
        playerName: cleanPlayer,
        playerAvatar: playerAvatar || "avatar-1"
      }, (err) => {
        if (err) {
          setError(typeof err === "string" ? err : "Could not join room.");
        }
      });
    }
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
            ENTER CODE
          </span>
          <h1 className="text-2xl font-black text-[#1F2937] font-display">
            Join Quiz
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Room ID input card */}
        <div className="bg-[#FFF8E7] rounded-2xl p-5 border border-[#F1D58A] shadow-sm">
          <label className="block text-[11px] font-bold tracking-wider text-[#9A7610] uppercase mb-2 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" /> Room Code
          </label>
          <input
            type="text"
            value={roomId || ""}
            onChange={handleRoomIdChange}
            placeholder="A7K9P2"
            maxLength={6}
            className="w-full text-center text-2xl font-black tracking-widest uppercase font-mono py-3.5 rounded-xl bg-white border border-[#E5D8B0] focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 placeholder-[#9CA3AF] text-[#1F2937] transition-all"
          />
          <p className="text-[11px] text-[#6B7280] text-center mt-2">
            Ask the host for their 6-character room code.
          </p>
        </div>

        {/* Player Profile Card */}
        <div className="bg-[#FFF8E7] rounded-2xl p-4 border border-[#F1D58A] shadow-sm">
          <label className="block text-[11px] font-bold tracking-wider text-[#9A7610] uppercase mb-2">
            Your Avatar & Name
          </label>

          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => setPlayerAvatar && setPlayerAvatar(av.id)}
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
            value={playerName || ""}
            onChange={(e) => setPlayerName && setPlayerName(e.target.value)}
            maxLength={18}
            placeholder="Enter your player name..."
            className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5D8B0] focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-[#1F2937] text-sm font-semibold placeholder-[#9CA3AF] transition-all"
          />
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center animate-shake">
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
            <>
              <Users className="w-5 h-5 text-[#1F2937]" />
              <span>JOIN ROOM</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
