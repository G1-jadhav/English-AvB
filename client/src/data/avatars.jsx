import React from "react";

export const AVATARS = [
  {
    id: "avatar-1",
    name: "Alex",
    color: "#6F70C8",
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#4338CA" />
        {/* Face */}
        <circle cx="50" cy="52" r="30" fill="#FBCFE8" />
        {/* Hair */}
        <path d="M22 45 Q50 15 78 45 Q65 25 50 25 Q35 25 22 45 Z" fill="#312E81" />
        {/* Eyes */}
        <circle cx="42" cy="50" r="3.5" fill="#1E1B4B" />
        <circle cx="58" cy="50" r="3.5" fill="#1E1B4B" />
        <circle cx="43" cy="49" r="1" fill="#FFFFFF" />
        <circle cx="59" cy="49" r="1" fill="#FFFFFF" />
        {/* Smile */}
        <path d="M44 60 Q50 67 56 60" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Cheeks */}
        <circle cx="36" cy="56" r="4" fill="#F472B6" opacity="0.5" />
        <circle cx="64" cy="56" r="4" fill="#F472B6" opacity="0.5" />
      </svg>
    )
  },
  {
    id: "avatar-2",
    name: "Maya",
    color: "#EC4899",
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#BE185D" />
        {/* Long hair background */}
        <path d="M20 45 C15 75 30 85 30 85 L70 85 C70 85 85 75 80 45 Z" fill="#831843" />
        {/* Face */}
        <circle cx="50" cy="50" r="28" fill="#FED7AA" />
        {/* Front Hair */}
        <path d="M22 42 Q50 18 78 42 Q50 28 22 42 Z" fill="#831843" />
        {/* Eyes */}
        <ellipse cx="41" cy="48" rx="3.5" ry="4" fill="#1E1B4B" />
        <ellipse cx="59" cy="48" rx="3.5" ry="4" fill="#1E1B4B" />
        <circle cx="42" cy="47" r="1.2" fill="#FFFFFF" />
        <circle cx="60" cy="47" r="1.2" fill="#FFFFFF" />
        {/* Smile */}
        <path d="M43 58 Q50 66 57 58" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Blush */}
        <circle cx="35" cy="54" r="3.5" fill="#FB7185" opacity="0.6" />
        <circle cx="65" cy="54" r="3.5" fill="#FB7185" opacity="0.6" />
      </svg>
    )
  },
  {
    id: "avatar-3",
    name: "Leo",
    color: "#10B981",
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#047857" />
        {/* Face */}
        <circle cx="50" cy="53" r="29" fill="#FDE68A" />
        {/* Cap / Beanie */}
        <path d="M22 45 Q50 15 78 45 Z" fill="#10B981" />
        <rect x="20" y="42" width="60" height="7" rx="3.5" fill="#059669" />
        {/* Eyes */}
        <circle cx="42" cy="53" r="3.5" fill="#1E1B4B" />
        <circle cx="58" cy="53" r="3.5" fill="#1E1B4B" />
        {/* Glasses */}
        <circle cx="42" cy="53" r="8" stroke="#1E1B4B" strokeWidth="2" fill="none" />
        <circle cx="58" cy="53" r="8" stroke="#1E1B4B" strokeWidth="2" fill="none" />
        <line x1="50" y1="53" x2="50" y2="53" stroke="#1E1B4B" strokeWidth="2" />
        {/* Smile */}
        <path d="M44 64 Q50 70 56 64" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
    )
  },
  {
    id: "avatar-4",
    name: "Sam",
    color: "#F59E0B",
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#B45309" />
        {/* Face */}
        <circle cx="50" cy="52" r="30" fill="#FCE7F3" />
        {/* Curly Hair */}
        <circle cx="30" cy="30" r="14" fill="#78350F" />
        <circle cx="50" cy="24" r="15" fill="#78350F" />
        <circle cx="70" cy="30" r="14" fill="#78350F" />
        <circle cx="22" cy="45" r="11" fill="#78350F" />
        <circle cx="78" cy="45" r="11" fill="#78350F" />
        {/* Eyes */}
        <circle cx="42" cy="52" r="3.5" fill="#1E1B4B" />
        <circle cx="58" cy="52" r="3.5" fill="#1E1B4B" />
        <circle cx="43" cy="51" r="1" fill="#FFFFFF" />
        <circle cx="59" cy="51" r="1" fill="#FFFFFF" />
        {/* Big Smile */}
        <path d="M42 61 Q50 71 58 61" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="35" cy="58" r="3.5" fill="#F43F5E" opacity="0.4" />
        <circle cx="65" cy="58" r="3.5" fill="#F43F5E" opacity="0.4" />
      </svg>
    )
  }
];

export function getAvatarById(id) {
  return AVATARS.find(a => a.id === id) || AVATARS[0];
}
