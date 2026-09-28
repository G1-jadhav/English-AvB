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
      <header className="grid grid-cols-[1fr_auto] items-center gap-y-2 gap-x-2 pt-1 pb-2 border-b border-[#F1D58A]/50 bg-[#FFFFFF] sm:flex sm:items-center sm:justify-between sm:gap-3">
        {/* Top-Left on Mobile / First on Desktop: Product Name "Wordplay" */}
        <div className="col-start-1 row-start-1 flex items-center gap-2 sm:order-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#E8C96A] flex items-center justify-center shadow-md shadow-[#D4AF37]/25 border border-[#F4E3A1] flex-shrink-0">
            <BookOpen className="w-4 h-4 text-[#1F2937]" />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1F2937] font-display whitespace-nowrap">
            Wordplay
          </span>
        </div>

        {/* Top-Right on Mobile / Far-Right on Desktop: Demo Mode Toggle & Signed-in Player Profile Avatar */}
        <div className="col-start-2 row-start-1 flex items-center gap-1.5 sm:gap-2 justify-self-end sm:order-3">
          {setIsDemoMode && (
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`px-2 sm:px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wide transition flex items-center gap-1 sm:gap-1.5 flex-shrink-0 ${
                isDemoMode 
                  ? "bg-[#D4AF37] text-[#1F2937] border-[#E8C96A] shadow-sm" 
                  : "bg-[#FFFDF5] text-[#4B5563] border-[#E5D8B0] hover:bg-[#FFF8E7]"
              }`}
              title="Toggle solo bot demo vs real-time multiplayer"
            >
              <Radio className="w-3 h-3 text-[#9A7610]" />
              <span className="hidden sm:inline">{isDemoMode ? "Solo Bot" : "1v1 Online"}</span>
            </button>
          )}

          {/* Signed-in Player Avatar & Name */}
          <button 
            onClick={() => {
              setTempName(playerName);
              setShowAvatarPicker(true);
            }}
            className="flex items-center gap-2 sm:gap-2.5 p-1 pr-2.5 sm:pr-3 rounded-full bg-[#FFFDF5] hover:bg-[#FFF8E7] border border-[#E5D8B0] hover:border-[#D4AF37] transition active:scale-95 text-left group shadow-sm flex-shrink-0"
            title="Click to change your avatar & name"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#FFF8E7] ring-2 ring-[#F1D58A] group-hover:ring-[#D4AF37] transition flex-shrink-0">
              <PlayerAvatar avatarId={playerAvatar} name="" size="sm" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#9A7610] leading-none">
                Player
              </span>
              <span className="text-xs font-bold text-[#1F2937] max-w-[70px] sm:max-w-[120px] truncate leading-tight">
                {playerName || "Player"}
              </span>
            </div>
            <Edit3 className="w-3 h-3 text-[#9A7610]/70 group-hover:text-[#9A7610] transition flex-shrink-0" />
          </button>
        </div>

        {/* Second Row on Mobile / Left-Center on Desktop: Live Status & Real-time 1v1 Badges */}
        <div className="col-start-1 col-span-2 row-start-2 flex items-center flex-wrap gap-2 sm:gap-3 sm:col-auto sm:row-auto sm:order-2 sm:mr-auto">
          {/* Live Status Indicator */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[11px] font-bold text-[#16a34a]"
            title={isConnected ? "Connected to game server" : "Connecting to game server"}
          >
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-[#22C55E]" : "bg-amber-400"}`} />
            </span>
            <span>{isConnected ? "Live" : "Connecting"}</span>
          </div>

          {/* Real-time 1v1 Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF8E7] border border-[#F1D58A] text-[#9A7610] text-[11px] font-bold tracking-wide shadow-sm">
            <Swords className="w-3 h-3 text-[#D4AF37]" />
            <span>Real-time 1v1</span>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN SECTION (Hero) */}
      {/* ======================================================== */}
      <section className="text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 pt-1 sm:pt-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#9A7610] uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Multiplayer Arena</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1F2937] font-display">
            English Quiz Arena
          </h1>
          <p className="text-base sm:text-lg text-[#4B5563] font-medium mt-1.5 leading-relaxed">
            Challenge a friend. Sharpen your English.
          </p>
        </div>

        {/* Restrained educational accent pills */}
        <div className="hidden sm:flex flex-col items-end gap-1.5 text-right">
          <span className="text-xs font-semibold text-[#6B7280] bg-[#FFFDF5] px-3 py-1 rounded-full border border-[#E5D8B0] flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> 10s Fast Rounds
          </span>
          <span className="text-xs font-semibold text-[#6B7280] bg-[#FFFDF5] px-3 py-1 rounded-full border border-[#E5D8B0] flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-[#D4AF37]" /> Real-time Scoring
          </span>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. PROMINENT CARD ("Ready to play?") */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-[28px] bg-[#FFF8E7] border border-[#F1D58A] p-6 sm:p-8 shadow-xl shadow-amber-900/5">
        {/* Subtle warm golden decorative highlights */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-gradient-to-bl from-[#F4E3A1]/30 via-[#FFFDF5]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-gradient-to-tr from-[#E8C96A]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left">
          {/* Card Icon & Badge */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#E8C96A] flex items-center justify-center shadow-lg shadow-[#D4AF37]/25 border border-[#F4E3A1]">
              <Swords className="w-6 h-6 text-[#1F2937]" />
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-[#9A7610] bg-[#FFFDF5] border border-[#F1D58A]">
              <Zap className="w-3 h-3 text-[#D4AF37]" /> 10-Second Rounds
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937] font-display tracking-tight">
            Ready to play?
          </h2>
          
          <p className="text-sm sm:text-base text-[#4B5563] mt-2 mb-6 max-w-lg leading-relaxed font-normal">
            Jump into fast-paced 10-second rounds. Test your English vocabulary, grammar, and quick thinking against a live opponent.
          </p>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3 pt-1">
            {/* Primary Action: Gold Gradient "Create a quiz" */}
            <button
              onClick={onNavigateCreate}
              style={{ background: "linear-gradient(135deg, #D4AF37, #E8C96A)" }}
              className="flex-1 min-h-[52px] py-4 px-6 rounded-2xl hover:brightness-105 active:scale-[0.98] text-[#1F2937] text-base font-extrabold tracking-wide transition-all shadow-lg shadow-[#D4AF37]/25 border border-[#F4E3A1] flex items-center justify-center gap-2.5"
            >
              <PlusCircle className="w-5 h-5 text-[#1F2937]" />
              <span>Create a quiz</span>
            </button>

            {/* Secondary Action: Light Golden / Cream "Join a quiz" with gold border */}
            <button
              onClick={onNavigateJoin}
              className="flex-1 min-h-[52px] py-4 px-6 rounded-2xl bg-[#FFFDF5] hover:bg-[#FFF8E7] active:scale-[0.98] text-[#1F2937] text-base font-bold tracking-wide transition border border-[#D4AF37] shadow-sm flex items-center justify-center gap-2.5"
            >
              <Users className="w-5 h-5 text-[#9A7610]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-[28px] bg-[#FFFDF5] border border-[#F1D58A] p-6 sm:p-7 shadow-2xl animate-scale-in text-[#1F2937] relative">
            {/* Close Button */}
            <button
              onClick={() => setShowAvatarPicker(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FFF8E7] hover:bg-[#F4E3A1]/50 border border-[#E5D8B0] flex items-center justify-center text-[#6B7280] hover:text-[#1F2937] transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-black text-[#1F2937] font-display mb-1">
              Customize Your Profile
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] mb-5">
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
                      ? "border-[#D4AF37] bg-[#FFF8E7] shadow-lg shadow-[#D4AF37]/20 scale-105"
                      : "border-transparent bg-[#FFF8E7]/60 hover:bg-[#FFF8E7]"
                  }`}
                >
                  <div className="w-12 h-12">
                    {av.svg}
                  </div>
                  <div className="text-[11px] font-bold text-[#4B5563] mt-1.5">
                    {av.name}
                  </div>
                </button>
              ))}
            </div>

            {/* Name Input */}
            <form onSubmit={handleSaveName} className="mb-5">
              <label className="block text-xs font-bold text-[#9A7610] mb-1.5 uppercase tracking-wide">
                Player Display Name
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={15}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5D8B0] focus:border-[#D4AF37] text-[#1F2937] font-bold text-sm placeholder-[#9CA3AF] outline-none"
              />
            </form>

            <button
              onClick={() => {
                if (tempName.trim()) setPlayerName(tempName.trim());
                setShowAvatarPicker(false);
              }}
              style={{ background: "linear-gradient(135deg, #D4AF37, #E8C96A)" }}
              className="w-full py-3.5 rounded-xl hover:brightness-105 active:scale-95 text-[#1F2937] font-extrabold text-sm shadow-lg shadow-[#D4AF37]/25 transition border border-[#F4E3A1]"
            >
              Save Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
