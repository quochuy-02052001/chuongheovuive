import React from 'react';

export type SupplySpriteId =
  | 'feed_standard'
  | 'feed_deluxe'
  | 'medicine_pill'
  | 'vitamin_boost'
  | 'breed_charm'
  | 'fertilizer'
  | 'barn_upgrade'
  | 'guard_dog';

interface SupplyItemSpriteProps {
  itemId: SupplySpriteId | string;
  size?: number;
  className?: string;
}

export const SupplyItemSprite: React.FC<SupplyItemSpriteProps> = ({
  itemId,
  size = 44,
  className = '',
}) => {
  switch (itemId) {
    case 'feed_standard':
      // Cám Ngũ Cốc: plump golden grain sack with wheat emblem
      return (
        <svg viewBox="0 0 56 56" width={size} height={size} className={className} aria-hidden="true">
          <ellipse cx="28" cy="49" rx="17" ry="4" fill="#4a260a" opacity="0.22" />
          {/* Sack body */}
          <path
            d="M 15 20 C 10 28, 9 43, 17 46 Q 28 50 39 46 C 47 43, 46 28, 41 20 Z"
            fill="#e59a47"
            stroke="#5c2d0c"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          {/* Shading */}
          <path
            d="M 33 21 C 38 29, 38 42, 33 46 Q 37 46 39 46 C 46 43, 45 28, 41 20 Z"
            fill="#c97d2e"
            opacity="0.7"
          />
          {/* Tied top frill */}
          <path
            d="M 18 20 L 13 11 L 22 15 L 28 9 L 34 15 L 43 11 L 38 20 Z"
            fill="#f5b962"
            stroke="#5c2d0c"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Red ribbon */}
          <path d="M 16 20 Q 28 23 40 20" stroke="#dc2626" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          {/* Center wheat medallion */}
          <circle cx="28" cy="34" r="9" fill="#fef3c7" stroke="#92400e" strokeWidth="1.7" />
          <path d="M 28 28 L 28 40" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="25.5" cy="31" rx="2" ry="1.3" transform="rotate(-30 25.5 31)" fill="#eab308" />
          <ellipse cx="30.5" cy="31" rx="2" ry="1.3" transform="rotate(30 30.5 31)" fill="#eab308" />
          <ellipse cx="25.5" cy="35" rx="2" ry="1.3" transform="rotate(-30 25.5 35)" fill="#eab308" />
          <ellipse cx="30.5" cy="35" rx="2" ry="1.3" transform="rotate(30 30.5 35)" fill="#eab308" />
        </svg>
      );

    case 'feed_deluxe':
      // Bánh Nướng Thượng Hạng: golden honey cake with cream & cherry
      return (
        <svg viewBox="0 0 56 56" width={size} height={size} className={className} aria-hidden="true">
          <ellipse cx="28" cy="48" rx="19" ry="4.5" fill="#4a260a" opacity="0.22" />
          {/* Plate */}
          <ellipse cx="28" cy="44" rx="20" ry="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
          {/* Cake base */}
          <path
            d="M 12 31 L 12 41 Q 28 47 44 41 L 44 31 Z"
            fill="#f59e0b"
            stroke="#78350f"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <ellipse cx="28" cy="31" rx="16" ry="5.5" fill="#fbbf24" stroke="#78350f" strokeWidth="2.2" />
          {/* Creamy frosting drips */}
          <path
            d="M 12 31 Q 17 37 22 33 Q 27 38 33 33 Q 39 37 44 31 Q 28 26 12 31 Z"
            fill="#fffbeb"
            stroke="#b45309"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Whipped cream swirl */}
          <ellipse cx="28" cy="27" rx="8" ry="4" fill="#ffffff" stroke="#d97706" strokeWidth="1.4" />
          {/* Bright red cherry on top */}
          <path d="M 28 19 Q 31 12 35 11" stroke="#15803d" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="28" cy="22" r="4.8" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.6" />
          <circle cx="26.5" cy="20.5" r="1.4" fill="#fecaca" />
        </svg>
      );

    case 'medicine_pill':
      // Thuốc Bổ Viên Nang: glossy 3D capsules
      return (
        <svg viewBox="0 0 56 56" width={size} height={size} className={className} aria-hidden="true">
          <ellipse cx="28" cy="48" rx="16" ry="4" fill="#4a260a" opacity="0.22" />
          <g transform="rotate(-36 22 28)">
            <rect x="13" y="12" width="14" height="28" rx="7" fill="#ef4444" stroke="#5e1212" strokeWidth="2.2" />
            <path d="M 13 26 L 27 26 L 27 33 A 7 7 0 0 1 13 33 Z" fill="#facc15" stroke="#5e1212" strokeWidth="2.2" />
            <line x1="17" y1="16" x2="17" y2="31" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
          </g>
          <g transform="rotate(28 36 30)">
            <rect x="29" y="15" width="13.5" height="27" rx="6.7" fill="#10b981" stroke="#064e3b" strokeWidth="2.2" />
            <path d="M 29 28.5 L 42.5 28.5 L 42.5 35.3 A 6.7 6.7 0 0 1 29 35.3 Z" fill="#ffffff" stroke="#064e3b" strokeWidth="2.2" />
            <line x1="32.5" y1="19" x2="32.5" y2="33" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
          </g>
        </svg>
      );

    case 'vitamin_boost':
      // Vitamin Siêu Tốc: glowing violet energy potion bottle
      return (
        <svg viewBox="0 0 56 56" width={size} height={size} className={className} aria-hidden="true">
          <ellipse cx="28" cy="49" rx="15" ry="4" fill="#4a260a" opacity="0.22" />
          {/* Cork & neck */}
          <rect x="23" y="8" width="10" height="7" rx="2" fill="#d97706" stroke="#451a03" strokeWidth="2" />
          <rect x="21" y="14" width="14" height="5" rx="2" fill="#ede9fe" stroke="#4c1d95" strokeWidth="2" />
          {/* Flask body */}
          <path
            d="M 22 19 L 13 35 A 12 11 0 0 0 23 47 L 33 47 A 12 11 0 0 0 43 35 L 34 19 Z"
            fill="#8b5cf6"
            stroke="#4c1d95"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          {/* Liquid highlight */}
          <path d="M 16 36 Q 28 32 40 36 A 10 9 0 0 1 32 45 L 24 45 A 10 9 0 0 1 16 36 Z" fill="#a855f7" />
          {/* Lightning bolt icon on flask */}
          <polygon
            points="30,24 24,34 28.5,34 26.5,42 33.5,31.5 29,31.5"
            fill="#fde047"
            stroke="#854d0e"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          {/* Sparkle */}
          <circle cx="43" cy="18" r="2.2" fill="#facc15" />
        </svg>
      );

    case 'breed_charm':
      // Bùa Lai Giống Hiếm: golden-framed crimson heart talisman
      return (
        <svg viewBox="0 0 56 56" width={size} height={size} className={className} aria-hidden="true">
          <ellipse cx="28" cy="49" rx="14" ry="3.5" fill="#4a260a" opacity="0.22" />
          {/* Cord */}
          <path d="M 22 16 Q 28 6 34 16" fill="none" stroke="#eab308" strokeWidth="2.8" strokeLinecap="round" />
          {/* Golden amulet frame */}
          <polygon
            points="28,12 43,23 38,44 18,44 13,23"
            fill="#facc15"
            stroke="#78350f"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          <polygon
            points="28,16 39,24.5 35,41 21,41 17,24.5"
            fill="#fef3c7"
            stroke="#b45309"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Ruby heart center */}
          <path
            d="M 28 37 C 20 31, 19 23, 24.5 22.5 C 27 22.3, 28 24.8, 28 24.8 C 28 24.8, 29 22.3, 31.5 22.5 C 37 23, 36 31, 28 37 Z"
            fill="#e11d48"
            stroke="#881337"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="24.5" cy="26" r="1.4" fill="#fda4af" />
        </svg>
      );

    case 'fertilizer':
      // Phân Bón Hữu Cơ: lush green & brown fertilizer bag with sprout badge
      return (
        <svg viewBox="0 0 56 56" width={size} height={size} className={className} aria-hidden="true">
          <ellipse cx="28" cy="49" rx="16" ry="4" fill="#4a260a" opacity="0.22" />
          <path
            d="M 15 19 C 11 27, 11 43, 17 46 Q 28 49 39 46 C 45 43, 45 27, 41 19 Z"
            fill="#16a34a"
            stroke="#14532d"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          <path d="M 18 19 L 15 11 L 23 15 L 28 10 L 33 15 L 41 11 L 38 19 Z" fill="#22c55e" stroke="#14532d" strokeWidth="2.1" strokeLinejoin="round" />
          <path d="M 16 19 Q 28 22 40 19" stroke="#facc15" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="28" cy="34" r="8.5" fill="#fef9c3" stroke="#166534" strokeWidth="1.6" />
          <path d="M 28 39 L 28 30" stroke="#15803d" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 28 32 Q 22 28 23 25 Q 27 26 28 31 Z" fill="#4ade80" stroke="#15803d" strokeWidth="1.2" />
          <path d="M 28 32 Q 34 28 33 25 Q 29 26 28 31 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.2" />
        </svg>
      );

    case 'barn_upgrade':
      // Cozy red-roofed pig barn
      return (
        <svg viewBox="0 0 56 56" width={size} height={size} className={className} aria-hidden="true">
          <ellipse cx="28" cy="49" rx="20" ry="4" fill="#4a260a" opacity="0.2" />
          <rect x="11" y="25" width="34" height="22" rx="2" fill="#d97706" stroke="#451a03" strokeWidth="2.2" />
          <polygon points="7,26 28,10 49,26" fill="#dc2626" stroke="#450a0a" strokeWidth="2.3" strokeLinejoin="round" />
          <rect x="21" y="31" width="14" height="16" rx="1.5" fill="#78350f" stroke="#451a03" strokeWidth="1.8" />
          <line x1="21" y1="31" x2="35" y2="47" stroke="#f59e0b" strokeWidth="1.6" />
          <line x1="35" y1="31" x2="21" y2="47" stroke="#f59e0b" strokeWidth="1.6" />
          <circle cx="28" cy="20" r="3.2" fill="#fef3c7" stroke="#78350f" strokeWidth="1.4" />
        </svg>
      );

    case 'guard_dog':
      // Cute guard puppy icon
      return (
        <svg viewBox="0 0 56 56" width={size} height={size} className={className} aria-hidden="true">
          <ellipse cx="28" cy="49" rx="16" ry="4" fill="#4a260a" opacity="0.2" />
          {/* Floppy ears */}
          <ellipse cx="14" cy="26" rx="5.5" ry="10" transform="rotate(14 14 26)" fill="#92400e" stroke="#451a03" strokeWidth="2" />
          <ellipse cx="42" cy="26" rx="5.5" ry="10" transform="rotate(-14 42 26)" fill="#92400e" stroke="#451a03" strokeWidth="2" />
          {/* Head */}
          <circle cx="28" cy="27" r="14" fill="#f59e0b" stroke="#451a03" strokeWidth="2.2" />
          {/* Muzzle */}
          <ellipse cx="28" cy="33" rx="8.5" ry="6" fill="#fef3c7" />
          <ellipse cx="28" cy="30.5" rx="3.4" ry="2.2" fill="#1c1917" />
          <circle cx="22.5" cy="24.5" r="2.2" fill="#1c1917" />
          <circle cx="33.5" cy="24.5" r="2.2" fill="#1c1917" />
          <circle cx="22" cy="23.8" r="0.8" fill="#ffffff" />
          <circle cx="33" cy="23.8" r="0.8" fill="#ffffff" />
          {/* Red collar */}
          <rect x="18" y="40" width="20" height="5" rx="2.5" fill="#dc2626" stroke="#450a0a" strokeWidth="1.6" />
          <circle cx="28" cy="44" r="2.5" fill="#facc15" stroke="#78350f" strokeWidth="1.2" />
        </svg>
      );

    default:
      return null;
  }
};
