import React, { useState } from "react";
import { 
  Sparkles, 
  Swords, 
  Users, 
  PlusCircle, 
  Clock, 
  BookOpen, 
  Zap, 
  ChevronRight, 
  Edit3, 
  Radio, 
  CheckCircle2,
  X
} from "lucide-react";
import { AVATARS } from "../data/avatars";
import { PlayerAvatar } from "./PlayerAvatar";
import { RoomIdCard } from "./RoomIdCard";

export function QuizHome({ 
  playerName, 
  setPlayerName, 
  playerAvatar, 
  setPlayerAvatar, 
  activeRoomId, 
  onNavigateCreate, 
  onNavigateJoin,
  isConnected = true,
  isDemoMode = false,
  setIsDemoMode
}) {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setPlayerName(tempName.trim());
    }
    setShowAvatarPicker(false);
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-7 animate-fade-in w-full pb-8">
      {/* ======================================================== */}
      {/* 1. COMPACT HEADER */}
      {/* ======================================================== */}
      <header className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-2 border-b border-violet-500/15">
        {/* Left: Product Name, Live Status, Real-time 1v1 badge */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Product Name "Wordplay" */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-md shadow-violet-700/40 border border-violet-400/30">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
              Wordplay
            </span>
          </div>

          {/* Live Status Indicator */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-300"
            title={isConnected ? "Connected to game server" : "Connecting to game server"}
          >
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-emerald-400" : "bg-amber-400"}`} />
            </span>
            <span>{isConnected ? "Live" : "Connecting"}</span>
          </div>

          {/* Real-time 1v1 Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-950/70 border border-violet-500/30 text-violet-200 text-[11px] font-bold tracking-wide shadow-sm">
            <Swords className="w-3 h-3 text-violet-400" />
            <span>Real-time 1v1</span>
          </div>
        </div>

        {/* Right: Demo Mode Toggle & Signed-in Player Profile Avatar */}
        <div className="flex items-center gap-2">
          {setIsDemoMode && (
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wide transition flex items-center gap-1.5 ${
                isDemoMode 
                  ? "bg-amber-400 text-amber-950 border-amber-300 shadow-sm" 
                  : "bg-white/5 text-violet-200/80 border-violet-500/20 hover:bg-white/10"
              }`}
              title="Toggle solo bot demo vs real-time multiplayer"
            >
              <Radio className="w-3 h-3" />
              <span className="hidden sm:inline">{isDemoMode ? "Solo Bot" : "1v1 Online"}</span>
            </button>
          )}

          {/* Signed-in Player Avatar & Name */}
          <button 
            onClick={() => {
              setTempName(playerName);
              setShowAvatarPicker(true);
            }}
            className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-white/5 hover:bg-violet-900/30 border border-violet-500/20 hover:border-violet-400/40 transition active:scale-95 text-left group"
            title="Click to change your avatar & name"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-violet-950/60 ring-2 ring-violet-500/30 group-hover:ring-violet-400/60 transition">
              <PlayerAvatar avatarId={playerAvatar} name="" size="sm" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider text-violet-300/70 leading-none">
                Player
              </span>
              <span className="text-xs font-bold text-white max-w-[90px] sm:max-w-[120px] truncate leading-tight">
                {playerName || "Player"}
              </span>
            </div>
            <Edit3 className="w-3 h-3 text-violet-400/60 group-hover:text-violet-300 transition" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN SECTION (Hero) */}
      {/* ======================================================== */}
      <section className="text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 pt-1 sm:pt-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-violet-300 uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Multiplayer Arena</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-display">
            English Quiz Arena
          </h1>
          <p className="text-base sm:text-lg text-violet-200/90 font-medium mt-1.5 leading-relaxed">
            Challenge a friend. Sharpen your English.
          </p>
        </div>

        {/* Restrained educational accent pills */}
        <div className="hidden sm:flex flex-col items-end gap-1.5 text-right">
          <span className="text-xs font-semibold text-violet-300/80 bg-violet-950/50 px-3 py-1 rounded-full border border-violet-500/20 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-violet-400" /> 10s Fast Rounds
          </span>
          <span className="text-xs font-semibold text-violet-300/80 bg-violet-950/50 px-3 py-1 rounded-full border border-violet-500/20 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-300" /> Real-time Scoring
          </span>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. PROMINENT CARD ("Ready to play?") */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#1d123f]/95 via-[#150d30]/95 to-[#0e0724]/95 border border-violet-500/25 p-6 sm:p-8 shadow-2xl shadow-purple-950/60 backdrop-blur-xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-gradient-to-bl from-violet-500/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-gradient-to-tr from-indigo-500/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left">
          {/* Card Icon & Badge */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/30 border border-violet-400/30">
              <Swords className="w-6 h-6 text-white" />
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-violet-300 bg-violet-500/15 border border-violet-500/30">
              <Zap className="w-3 h-3 text-amber-300" /> 10-Second Rounds
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
            Ready to play?
          </h2>
          
          <p className="text-sm sm:text-base text-violet-200/90 mt-2 mb-6 max-w-lg leading-relaxed font-normal">
            Jump into fast-paced 10-second rounds. Test your English vocabulary, grammar, and quick thinking against a live opponent.
          </p>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3 pt-1">
            {/* Primary Action: Bright Violet "Create a quiz" */}
            <button
              onClick={onNavigateCreate}
              className="flex-1 min-h-[52px] py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white text-base font-extrabold tracking-wide transition-all shadow-lg shadow-violet-600/40 hover:shadow-violet-500/50 border border-violet-400/30 flex items-center justify-center gap-2.5"
            >
              <PlusCircle className="w-5 h-5 text-white" />
              <span>Create a quiz</span>
            </button>

            {/* Secondary Action: "Join a quiz" */}
            <button
              onClick={onNavigateJoin}
              className="flex-1 min-h-[52px] py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white text-base font-bold tracking-wide transition border border-white/20 hover:border-violet-400/40 flex items-center justify-center gap-2.5"
            >
              <Users className="w-5 h-5 text-violet-300" />
              <span>Join a quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. SEPARATE ROOM CARD ("Join with a room code") */}
      {/* ======================================================== */}
      <RoomIdCard 
        roomId={activeRoomId} 
        onCreateRoom={onNavigateCreate}
        onJoinRoom={(code) => {
          if (typeof onNavigateJoin === "function") {
            onNavigateJoin(code);
          }
        }}
      />

      {/* ======================================================== */}
      {/* 5. AVATAR & NAME CUSTOMIZATION MODAL */}
      {/* ======================================================== */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-[28px] bg-[#160d33] border border-violet-500/30 p-6 sm:p-7 shadow-2xl shadow-purple-950/80 animate-scale-in text-white relative">
            {/* Close Button */}
            <button
              onClick={() => setShowAvatarPicker(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-black text-white font-display mb-1">
              Customize Your Profile
            </h3>
            <p className="text-xs sm:text-sm text-violet-200/80 mb-5">
              Choose your player avatar and display name for quiz battles.
            </p>

            {/* Avatar Selection Grid */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => setPlayerAvatar(av.id)}
                  className={`p-2 rounded-2xl border-2 transition-all flex flex-col items-center ${
                    playerAvatar === av.id
                      ? "border-violet-500 bg-violet-600/25 shadow-lg shadow-violet-600/30 scale-105"
                      : "border-transparent bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="w-12 h-12">
                    {av.svg}
                  </div>
                  <div className="text-[11px] font-bold text-violet-200 mt-1.5">
                    {av.name}
                  </div>
                </button>
              ))}
            </div>

            {/* Name Input */}
            <form onSubmit={handleSaveName} className="mb-5">
              <label className="block text-xs font-bold text-violet-300 mb-1.5 uppercase tracking-wide">
                Player Display Name
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={15}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl glass-input text-white font-bold text-sm focus:border-violet-400"
              />
            </form>

            <button
              onClick={() => {
                if (tempName.trim()) setPlayerName(tempName.trim());
                setShowAvatarPicker(false);
              }}
              className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-violet-600/30 transition border border-violet-400/30"
            >
              Save Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
