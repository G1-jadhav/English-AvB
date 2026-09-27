import React, { useState } from "react";
import { KeyRound, Copy, Check, Share2, PlusCircle, ArrowRight, ShieldCheck } from "lucide-react";

export function RoomIdCard({ roomId, onCreateRoom, onJoinRoom }) {
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [inputError, setInputError] = useState("");

  const handleCopy = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!roomId) return;
    const shareData = {
      title: "Wordplay - English Quiz Arena",
      text: `Join my English Quiz battle on Wordplay! Room Code: ${roomId}`,
      url: window.location.href.split("?")[0] + `?room=${roomId}`
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
    e.preventDefault();
    const clean = enteredCode.trim().toUpperCase();
    if (clean.length < 4) {
      setInputError("Please enter a valid 6-character room code.");
      return;
    }
    setInputError("");
    if (onJoinRoom) {
      onJoinRoom(clean);
    }
  };

  const handleCodeChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setEnteredCode(val);
    if (inputError) setInputError("");
  };

  return (
    <div className="glass-card rounded-[26px] p-6 sm:p-7 border border-violet-500/20 shadow-xl shadow-purple-950/40 relative overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
            <KeyRound className="w-4 h-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Join with a room code
          </h3>
        </div>

        {roomId ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Room
          </span>
        ) : (
          <span className="text-xs font-semibold text-violet-300/80 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20">
            Multiplayer
          </span>
        )}
      </div>

      {roomId ? (
        /* Active Room Display State */
        <div className="flex flex-col gap-4">
          <p className="text-sm text-violet-200/80">
            Your private arena is open. Share this room code with a friend to start:
          </p>

          <div className="bg-[#0b051b]/80 rounded-2xl p-4 sm:p-5 border border-violet-500/25 text-center relative group">
            <div className="text-[11px] tracking-wider text-violet-300/70 uppercase font-bold mb-1">
              ROOM CODE
            </div>
            <div className="text-3xl sm:text-4xl font-black tracking-widest text-white font-mono selection:bg-violet-600">
              {roomId}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs sm:text-sm font-bold transition border border-white/20 hover:border-violet-400/40"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-violet-300" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-xs sm:text-sm font-bold transition shadow-md shadow-violet-600/30 border border-violet-400/30"
            >
              <Share2 className="w-4 h-4" />
              <span>{shareFeedback || "Share Link"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Clear Empty State & Direct Entry */
        <div className="flex flex-col gap-4">
          <p className="text-xs sm:text-sm text-violet-200/80 leading-relaxed">
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
                  className="w-full px-4 py-3 rounded-xl glass-input text-base font-mono font-bold tracking-widest placeholder-white/30 uppercase focus:border-violet-400"
                />
              </div>

              <button
                type="submit"
                disabled={!enteredCode || enteredCode.length < 4}
                className={`px-5 py-3 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center gap-1.5 shadow-md ${
                  enteredCode.length >= 4
                    ? "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30 cursor-pointer active:scale-95 border border-violet-400/30"
                    : "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
                }`}
              >
                <span>Join</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {inputError && (
              <p className="text-xs text-rose-300 font-semibold px-1">
                {inputError}
              </p>
            )}
          </form>

          {/* Divider with subtle line */}
          <div className="relative flex items-center my-1">
            <div className="flex-grow border-t border-white/10" />
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-violet-300/50 uppercase tracking-widest">
              or host your own
            </span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          {/* Create a Room Action */}
          <button
            type="button"
            onClick={onCreateRoom}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-violet-200 hover:text-white text-xs sm:text-sm font-bold transition border border-white/15 hover:border-violet-400/30"
          >
            <PlusCircle className="w-4 h-4 text-violet-400" />
            <span>Create a room</span>
          </button>
        </div>
      )}
    </div>
  );
}
