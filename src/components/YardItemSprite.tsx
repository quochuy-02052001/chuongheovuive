import React from 'react';
import { DropType } from '../types/game';

interface YardItemSpriteProps {
  type: DropType;
  size?: number;
}

export const YardItemSprite: React.FC<YardItemSpriteProps> = ({ type, size = 38 }) => {
  if (type === 'red_cube') {
    // 3D glossy red star gift cube matching screenshot
    return (
      <svg viewBox="0 0 52 52" width={size} height={size} className="drop-shadow-md">
        <ellipse cx="26" cy="43" rx="16" ry="5" fill="#4a260a" opacity="0.28" />
        {/* Left face */}
        <polygon points="8,18 25,27 25,44 8,34" fill="#dc2626" stroke="#5e1212" strokeWidth="2.1" strokeLinejoin="round" />
        {/* Right shaded face */}
        <polygon points="25,27 44,18 44,34 25,44" fill="#991b1b" stroke="#5e1212" strokeWidth="2.1" strokeLinejoin="round" />
        {/* Bright Top face */}
        <polygon points="26,9 44,18 25,27 8,18" fill="#f87171" stroke="#5e1212" strokeWidth="2.1" strokeLinejoin="round" />
        {/* White 5-point star on top */}
        <polygon
          points="26,13 27.6,16.4 31.3,16.8 28.4,19.1 29.2,22.5 26,20.6 22.8,22.5 23.6,19.1 20.7,16.8 24.4,16.4"
          fill="#ffffff"
        />
        {/* Small star dots on side faces */}
        <polygon points="16.5,27 18,30 21,30.5 18.8,32.5 19.3,35.5 16.5,34 13.7,35.5 14.2,32.5 12,30.5 15,30" fill="#fee2e2" />
        <polygon points="34.5,27 36,30 39,30.5 36.8,32.5 37.3,35.5 34.5,34 31.7,35.5 32.2,32.5 30,30.5 33,30" fill="#fecaca" opacity="0.9" />
      </svg>
    );
  }

  if (type === 'chest') {
    // Tilted 3D crimson & gold treasure chest matching screenshot
    return (
      <svg viewBox="0 0 60 56" width={size * 1.2} height={size * 1.15} className="drop-shadow-lg">
        <ellipse cx="30" cy="46" rx="20" ry="6" fill="#4a260a" opacity="0.3" />
        <circle cx="30" cy="28" r="22" fill="#fde047" opacity="0.22" />
        {/* Chest body (3/4 view) */}
        <polygon points="10,24 34,28 34,46 10,40" fill="#991b1b" stroke="#450a0a" strokeWidth="2.2" strokeLinejoin="round" />
        <polygon points="34,28 50,21 50,39 34,46" fill="#7f1d1d" stroke="#450a0a" strokeWidth="2.2" strokeLinejoin="round" />
        {/* Domed lid */}
        <path d="M 10 24 Q 18 11 32 14 L 48 10 Q 52 15 50 21 L 34 28 Z" fill="#dc2626" stroke="#450a0a" strokeWidth="2.2" strokeLinejoin="round" />
        {/* Gold metal bands */}
        <path d="M 16 16 L 16 41" stroke="#facc15" strokeWidth="4.2" strokeLinecap="round" />
        <path d="M 28 15 L 28 44" stroke="#facc15" strokeWidth="4.2" strokeLinecap="round" />
        <path d="M 43 12 L 43 41" stroke="#eab308" strokeWidth="3.8" strokeLinecap="round" />
        {/* Brass lock clasp */}
        <rect x="20" y="25" width="7" height="8" rx="2" fill="#fde047" stroke="#78350f" strokeWidth="1.6" />
        <circle cx="23.5" cy="29" r="1.2" fill="#78350f" />
      </svg>
    );
  }

  if (type === 'poop') {
    return (
      <svg viewBox="0 0 44 44" width={size * 0.9} height={size * 0.9} className="drop-shadow">
        <ellipse cx="22" cy="36" rx="14" ry="4" fill="#4a260a" opacity="0.25" />
        <path
          d="M 10 34 Q 22 38 34 34 Q 36 28 30 26 Q 32 20 26 18 Q 27 12 22 10 Q 17 14 18 19 Q 12 20 14 26 Q 8 28 10 34 Z"
          fill="#854d27"
          stroke="#451a03"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M 17 20 Q 21 18 24 20" stroke="#a1623b" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="18" cy="26" r="1.5" fill="#fef3c7" />
        <circle cx="25" cy="26" r="1.5" fill="#fef3c7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className="drop-shadow-md">
      <ellipse cx="24" cy="41" rx="12" ry="4" fill="#4a260a" opacity="0.25" />
      <path d="M 18 11 L 30 11 L 27 17 L 21 17 Z" fill="#d97706" stroke="#451a03" strokeWidth="2" />
      <circle cx="24" cy="28" r="13" fill="#fbbf24" stroke="#78350f" strokeWidth="2.2" />
      <ellipse cx="20" cy="23" rx="4" ry="2.5" fill="#fef9c3" opacity="0.6" />
      <text x="24" y="33" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#78350f">
        ₫
      </text>
    </svg>
  );
};
