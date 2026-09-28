import React, { useState } from "react";
import { KeyRound, Copy, Check, Share2, PlusCircle, ArrowRight, ShieldCheck } from "lucide-react";

export function RoomIdCard({ roomId, onCreateRoom, onJoinRoom }) {
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [inputError, setInputError] = useState("");

  const safeRoomId = typeof roomId === "string" ? roomId : (roomId && typeof roomId !== "object" ? String(roomId) : "");

  const handleCopy = () => {
    if (!safeRoomId) return;
    navigator.clipboard.writeText(safeRoomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!safeRoomId) return;
    const shareData = {
      title: "Wordplay - English Quiz Arena",
      text: `Join my English Quiz battle on Wordplay! Room Code: ${safeRoomId}`,
      url: window.location.href.split("?")[0] + `?room=${safeRoomId}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareFeedback("Shared!");
        setTimeout(() => setShareFeedback(""), 2000);
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
      setShareFeedback("Link copied!");
      setTimeout(() => setShareFeedback(""), 2000);
    }
  };

  const handleCodeSubmit = (e) => {
    e?.preventDefault?.();
    const raw = typeof enteredCode === "string" ? enteredCode : String(enteredCode || "");
    const clean = raw.trim().toUpperCase();
    if (clean.length < 4) {
      setInputError("Please enter a valid 6-character room code.");
      return;
    }
    setInputError("");
    if (typeof onJoinRoom === "function") {
      onJoinRoom(clean);
    }
  };

  const handleCodeChange = (e) => {
    const raw = typeof e?.target?.value === "string" ? e.target.value : "";
    const val = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setEnteredCode(val);
    if (inputError) setInputError("");
  };

  return (
    <div className="glass-card rounded-[26px] p-6 sm:p-7 border border-[#F1D58A] bg-[#FFF8E7] shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFFDF5] border border-[#F1D58A] flex items-center justify-center text-[#9A7610]">
            <KeyRound className="w-4 h-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#1F2937] tracking-tight">
            Join with a room code
          </h3>
        </div>

        {safeRoomId ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#22C55E]/10 text-[#16a34a] border border-[#22C55E]/30">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            Active Room
          </span>
        ) : (
          <span className="text-xs font-semibold text-[#9A7610] bg-[#FFFDF5] px-2.5 py-0.5 rounded-full border border-[#F1D58A]">
            Multiplayer
          </span>
        )}
      </div>

      {safeRoomId ? (
        /* Active Room Display State */
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[#4B5563]">
            Your private arena is open. Share this room code with a friend to start:
          </p>

          <div className="bg-[#FFFDF5] rounded-2xl p-4 sm:p-5 border border-[#F1D58A] text-center relative group shadow-sm">
            <div className="text-[11px] tracking-wider text-[#9A7610] uppercase font-bold mb-1">
              ROOM CODE
            </div>
            <div className="text-3xl sm:text-4xl font-black tracking-widest text-[#1F2937] font-mono selection:bg-[#F4E3A1]">
              {safeRoomId}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FFFDF5] hover:bg-white active:scale-95 text-[#1F2937] text-xs sm:text-sm font-bold transition border border-[#E5D8B0] hover:border-[#D4AF37] shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#22C55E]" />
                  <span className="text-[#16a34a]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#9A7610]" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              style={{ background: "linear-gradient(135deg, #D4AF37, #E8C96A)" }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl hover:brightness-105 active:scale-95 text-[#1F2937] text-xs sm:text-sm font-bold transition shadow-md shadow-[#D4AF37]/20 border border-[#F4E3A1]"
            >
              <Share2 className="w-4 h-4 text-[#1F2937]" />
              <span>{shareFeedback || "Share Link"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Clear Empty State & Direct Entry */
        <div className="flex flex-col gap-4">
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            Enter a 6-character room code from your friend to jump directly into the battle.
          </p>

          <form onSubmit={handleCodeSubmit} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={enteredCode}
                  onChange={handleCodeChange}
                  maxLength={6}
                  placeholder="e.g. KV89P2"
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#E5D8B0] focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-[#1F2937] placeholder-[#9CA3AF] text-base font-mono font-bold tracking-widest uppercase transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!enteredCode || enteredCode.length < 4}
                style={enteredCode.length >= 4 ? { background: "linear-gradient(135deg, #D4AF37, #E8C96A)" } : {}}
                className={`px-5 py-3 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center gap-1.5 shadow-md ${
                  enteredCode.length >= 4
                    ? "text-[#1F2937] shadow-[#D4AF37]/25 cursor-pointer active:scale-95 border border-[#F4E3A1] hover:brightness-105"
                    : "bg-[#FFFDF5] text-[#9CA3AF] border border-[#E5D8B0] cursor-not-allowed"
                }`}
              >
                <span>Join</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {inputError && (
              <p className="text-xs text-rose-600 font-semibold px-1">
                {inputError}
              </p>
            )}
          </form>

          {/* Divider with subtle line */}
          <div className="relative flex items-center my-1">
            <div className="flex-grow border-t border-[#E5D8B0]" />
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-[#9A7610] uppercase tracking-widest">
              or host your own
            </span>
            <div className="flex-grow border-t border-[#E5D8B0]" />
          </div>

          {/* Create a Room Action */}
          <button
            type="button"
            onClick={onCreateRoom}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FFFDF5] hover:bg-[#FFF8E7] active:scale-95 text-[#1F2937] text-xs sm:text-sm font-bold transition border border-[#F1D58A] hover:border-[#D4AF37] shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-[#9A7610]" />
            <span>Create a room</span>
          </button>
        </div>
      )}
    </div>
  );
}
