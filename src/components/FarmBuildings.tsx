import React from 'react';

interface FarmBuildingsProps {
  waterLevel: number;
  isGuardDogActive: boolean;
  isNeighborMode: boolean;
  onClickOven: () => void;
  onClickWell: () => void;
  onClickDoghouse: () => void;
  onClickBarn: () => void;
  onClickTrough: () => void;
  onClickScratchPost: () => void;
}

export const FarmBuildings: React.FC<FarmBuildingsProps> = ({
  waterLevel,
  isGuardDogActive,
  isNeighborMode,
  onClickOven,
  onClickWell,
  onClickDoghouse,
  onClickBarn,
  onClickTrough,
  onClickScratchPost,
}) => {
  return (
    <>
      {/* TOP-LEFT: Rustic Kitchen Cottage with Swooping Teal-Blue Roof & Brick Oven */}
      <button
        type="button"
        onClick={onClickOven}
        title={isNeighborMode ? 'Nhà Bếp Hàng Xóm' : 'Lò Nướng & Cho Ăn Nhanh'}
        className="landscape-compact-building-oven group absolute top-[7%] left-[3.5%] z-10 w-[148px] sm:w-[180px] md:w-[210px] lg:w-[230px] cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
      >
        <svg viewBox="0 0 196 164" className="w-full h-auto drop-shadow-md">
          <defs>
            <linearGradient id="kitchenSwoopRoof" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="52%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="timberCream" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="100%" stopColor="#e5cf9f" />
            </linearGradient>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="96" cy="140" rx="76" ry="15" fill="#5c3618" opacity="0.22" />

          {/* Smoke puffs */}
          <circle cx="122" cy="18" r="7" fill="#ffffff" opacity="0.72" className="animate-smoke" />
          <circle cx="130" cy="11" r="5" fill="#f8fafc" opacity="0.58" className="animate-smoke" />

          {/* Stone Chimney */}
          <rect x="110" y="18" width="22" height="34" rx="4" fill="#a87c52" stroke="#4a280d" strokeWidth="2.3" />
          <line x1="110" y1="29" x2="132" y2="29" stroke="#6d411c" strokeWidth="1.5" />

          {/* Cottage walls with weathered cream-white posts */}
          <polygon points="24,74 96,74 96,134 24,134" fill="url(#timberCream)" stroke="#4a280d" strokeWidth="2.4" strokeLinejoin="round" />
          <polygon points="96,74 156,58 156,118 96,134" fill="#dfcaa0" stroke="#4a280d" strokeWidth="2.4" strokeLinejoin="round" />
          {/* Timber beams */}
          <rect x="22" y="72" width="10" height="63" rx="2" fill="#fffbeb" stroke="#4a280d" strokeWidth="2" />
          <rect x="91" y="72" width="10" height="63" rx="2" fill="#fffbeb" stroke="#4a280d" strokeWidth="2" />
          <rect x="148" y="57" width="9" height="62" rx="2" fill="#efe0ba" stroke="#4a280d" strokeWidth="2" />

          {/* Glowing brick oven arch */}
          <path d="M 43 134 L 43 101 Q 61 82 79 101 L 79 134 Z" fill="#8b3a16" stroke="#4a280d" strokeWidth="2.3" />
          <path d="M 49 134 L 49 106 Q 61 93 73 106 L 73 134 Z" fill="#f97316" />
          <path d="M 54 134 Q 61 108 68 134 Z" fill="#fef08a" />

          {/* Food counter shelf */}
          <polygon points="98,104 166,89 176,97 108,114" fill="#d99b52" stroke="#4a280d" strokeWidth="2.2" strokeLinejoin="round" />
          <ellipse cx="126" cy="99" rx="9" ry="4.5" fill="#fef3c7" stroke="#4a280d" strokeWidth="1.5" />
          <circle cx="126" cy="97" r="3" fill="#ef4444" />
          <ellipse cx="147" cy="94" rx="9" ry="4.5" fill="#fef3c7" stroke="#4a280d" strokeWidth="1.5" />
          <circle cx="147" cy="92" r="3" fill="#22c55e" />

          {/* Swooping Blue-Teal Roof with weathered gold edge */}
          <path d="M 8 78 Q 38 56 62 24 L 116 78 Q 62 72 8 78 Z" fill="#0e7490" stroke="#134e4a" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M 62 24 Q 100 18 138 14 Q 156 36 178 55 Q 144 69 116 78 Q 88 52 62 24 Z" fill="url(#kitchenSwoopRoof)" stroke="#134e4a" strokeWidth="2.4" strokeLinejoin="round" />
          {/* Curved ridge beam & weathered golden edge chips */}
          <path d="M 60 23 Q 100 17 139 14" fill="none" stroke="#5eead4" strokeWidth="4" strokeLinecap="round" />
          <path d="M 118 75 Q 145 67 173 56" fill="none" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 9" opacity="0.85" />
          <g stroke="#0f766e" strokeWidth="1.4" opacity="0.55">
            <path d="M 84 21 Q 108 49 130 73" fill="none" />
            <path d="M 103 19 Q 127 45 148 67" fill="none" />
            <path d="M 122 17 Q 145 40 163 61" fill="none" />
          </g>

          {/* Warm glowing hanging lantern */}
          <line x1="20" y1="76" x2="20" y2="85" stroke="#4a280d" strokeWidth="1.8" />
          <circle cx="20" cy="90" r="9" fill="#fde047" opacity="0.3" />
          <circle cx="20" cy="90" r="5.5" fill="#fbbf24" stroke="#78350f" strokeWidth="1.6" />
          <circle cx="18.5" cy="88.5" r="1.8" fill="#fef9c3" />
        </svg>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#4a280d]/90 text-amber-100 text-[11px] font-bold whitespace-nowrap pointer-events-none">
          {isNeighborMode ? 'Nhà Bếp' : 'Cho Ăn Nhanh'}
        </span>
      </button>

      {/* MID-LEFT: Mossy Stone Water Well */}
      <button
        type="button"
        onClick={onClickWell}
        title="Giếng Nước — Nhấn để múc nước đầy máng"
        className="landscape-compact-building-well group absolute top-[37%] left-[4.5%] z-10 w-[108px] sm:w-[128px] md:w-[146px] cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
      >
        <svg viewBox="0 0 132 132" className="w-full h-auto drop-shadow-md">
          <ellipse cx="66" cy="112" rx="42" ry="12" fill="#5c3618" opacity="0.22" />
          <ellipse cx="66" cy="105" rx="34" ry="14" fill="#64748b" stroke="#273244" strokeWidth="2.4" />
          <rect x="32" y="77" width="68" height="28" fill="#94a3b8" stroke="#273244" strokeWidth="2.4" />
          <path d="M 32 90 Q 66 98 100 90" fill="none" stroke="#475569" strokeWidth="1.6" />
          <line x1="54" y1="79" x2="54" y2="92" stroke="#475569" strokeWidth="1.6" />
          <line x1="78" y1="80" x2="78" y2="93" stroke="#475569" strokeWidth="1.6" />
          <ellipse cx="66" cy="77" rx="34" ry="12" fill="#cbd5e1" stroke="#273244" strokeWidth="2.4" />
          <ellipse cx="66" cy="77" rx="25" ry="8" fill="#0ea5e9" />
          <ellipse cx="60" cy="76" rx="10" ry="3" fill="#bae6fd" opacity="0.7" />
          {/* Cream timber posts */}
          <rect x="38" y="34" width="8.5" height="45" rx="2" fill="#f7ebd0" stroke="#4a280d" strokeWidth="2.1" />
          <rect x="85.5" y="34" width="8.5" height="45" rx="2" fill="#e5cf9f" stroke="#4a280d" strokeWidth="2.1" />
          {/* Swooping Blue-Teal Roof */}
          <path d="M 18 44 Q 44 30 66 11 Q 88 30 114 44 Q 66 38 18 44 Z" fill="#0e7490" stroke="#134e4a" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M 66 11 Q 92 26 118 37 L 112 44 Q 88 30 66 11 Z" fill="#2dd4bf" stroke="#134e4a" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#4a280d]/90 text-amber-100 text-[11px] font-bold whitespace-nowrap pointer-events-none">
          Múc Nước Giếng
        </span>
      </button>

      {/* BOTTOM-LEFT: Rustic Open-Vibe Doghouse & Guard Puppy */}
      <button
        type="button"
        onClick={onClickDoghouse}
        title="Chuồng Chó Bảo Vệ"
        className="landscape-compact-building-dog group absolute bottom-[17%] left-[5.5%] z-10 w-[116px] sm:w-[138px] md:w-[156px] cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
      >
        <svg viewBox="0 0 144 124" className="w-full h-auto drop-shadow-md">
          <ellipse cx="74" cy="105" rx="54" ry="11" fill="#5c3618" opacity="0.22" />
          <polygon points="34,54 88,54 88,100 34,100" fill="#fffbeb" stroke="#4a280d" strokeWidth="2.4" strokeLinejoin="round" />
          <polygon points="88,54 118,44 118,90 88,100" fill="#e5cf9f" stroke="#4a280d" strokeWidth="2.4" strokeLinejoin="round" />
          <line x1="48" y1="55" x2="48" y2="100" stroke="#c3a474" strokeWidth="1.3" />
          <line x1="74" y1="55" x2="74" y2="100" stroke="#c3a474" strokeWidth="1.3" />
          {/* Teal-framed arched doorway */}
          <path d="M 48 100 L 48 73 Q 61 60 74 73 L 74 100 Z" fill="#3a2210" stroke="#14b8a6" strokeWidth="3.5" />
          {/* Swooping Teal-Blue Roof */}
          <path d="M 20 60 Q 44 43 61 23 L 98 58 Q 58 55 20 60 Z" fill="#0e7490" stroke="#134e4a" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M 61 23 Q 84 19 105 16 Q 118 32 130 44 Q 112 53 98 58 Z" fill="url(#kitchenSwoopRoof)" stroke="#134e4a" strokeWidth="2.4" strokeLinejoin="round" />
          {isGuardDogActive && (
            <g transform="translate(61, 86)">
              <circle cx="0" cy="0" r="10" fill="#e69a45" stroke="#4a280d" strokeWidth="2" />
              <ellipse cx="-8" cy="-2" rx="3" ry="5" fill="#78350f" />
              <ellipse cx="8" cy="-2" rx="3" ry="5" fill="#78350f" />
              <circle cx="-3" cy="-2" r="1.5" fill="#1c1917" />
              <circle cx="3" cy="-2" r="1.5" fill="#1c1917" />
              <circle cx="0" cy="2" r="2" fill="#1c1917" />
            </g>
          )}
          <ellipse cx="107" cy="100" rx="14" ry="7" fill="#0284c7" stroke="#0c4a6e" strokeWidth="2.2" />
          <ellipse cx="107" cy="98" rx="9" ry="3.5" fill="#7dd3fc" />
        </svg>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#4a280d]/90 text-amber-100 text-[11px] font-bold whitespace-nowrap pointer-events-none">
          {isGuardDogActive ? 'Cún Đang Canh Trại' : 'Gọi Cún Canh Trại'}
        </span>
      </button>

      {/* TOP-RIGHT: Open-Air Rustic Pavilion Barn matching exact reference image */}
      <button
        type="button"
        onClick={onClickBarn}
        title={isNeighborMode ? 'Chuồng Heo Hàng Xóm' : 'Chuồng Phối Giống & Quản Lý Heo'}
        className="landscape-compact-building-barn group absolute top-[4%] right-[3.5%] z-10 w-[180px] sm:w-[225px] md:w-[265px] lg:w-[290px] cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
      >
        <svg viewBox="0 0 240 192" className="w-full h-auto drop-shadow-lg">
          <defs>
            <linearGradient id="barnSwoopRoof" x1="0" y1="0" x2="0.2" y2="1">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="52%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="postLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f3e5c3" />
            </linearGradient>
          </defs>

          {/* Soft Ground Contact Shadow */}
          <ellipse cx="122" cy="152" rx="94" ry="22" fill="#5c3618" opacity="0.22" />

          {/* Mossy green stepping cobbles spilling out front-left */}
          <g fill="#8ea42b" stroke="#4a280d" strokeWidth="1.6">
            <ellipse cx="86" cy="144" rx="14" ry="7.5" />
            <ellipse cx="109" cy="149" rx="12" ry="6.5" />
            <ellipse cx="70" cy="153" rx="11" ry="6" />
            <ellipse cx="92" cy="159" rx="9" ry="5" />
          </g>

          {/* Back timber frame & half-height interior wooden pen walls */}
          <polygon points="104,76 176,58 176,124 104,140" fill="#dfc593" stroke="#4a280d" strokeWidth="2.2" strokeLinejoin="round" />
          <polygon points="176,58 202,70 202,130 176,124" fill="#c9ab74" stroke="#4a280d" strokeWidth="2.2" strokeLinejoin="round" />
          {/* Dark interior floor & lower plank texture */}
          <polygon points="74,126 144,106 198,124 128,148" fill="#8b6239" opacity="0.55" />
          <g stroke="#9b7b4c" strokeWidth="1.3" opacity="0.65">
            <line x1="122" y1="73" x2="122" y2="136" />
            <line x1="142" y1="68" x2="142" y2="131" />
            <line x1="160" y1="63" x2="160" y2="127" />
          </g>

          {/* Left clay water jars + mini curved picket wing */}
          <g>
            <ellipse cx="48" cy="126" rx="16" ry="15" fill="#5c3618" stroke="#2d1807" strokeWidth="2.1" />
            <ellipse cx="48" cy="116" rx="11" ry="4.5" fill="#2d1807" />
            <ellipse cx="66" cy="131" rx="9" ry="8" fill="#6b3e1b" stroke="#2d1807" strokeWidth="1.9" />
            {/* Short left fence wing */}
            <polygon points="24,118 46,136 46,144 24,126" fill="#c9ae7f" stroke="#4a280d" strokeWidth="1.8" />
            <polygon points="24,108 30,104 36,108 36,136 24,136" fill="#e8d4ab" stroke="#4a280d" strokeWidth="1.9" />
            <polygon points="39,118 45,114 51,118 51,146 39,146" fill="#f3e5c3" stroke="#4a280d" strokeWidth="1.9" />
          </g>

          {/* Front Left Facade with Turquoise Arched Piggy Door */}
          <polygon points="72,82 134,94 134,144 72,130" fill="#efe0ba" stroke="#4a280d" strokeWidth="2.3" strokeLinejoin="round" />
          <path d="M 88 134 L 88 112 Q 103 95 118 116 L 118 140 Z" fill="#14b8a6" stroke="#134e4a" strokeWidth="2" />
          <path d="M 93 135 L 93 116 Q 103 103 113 119 L 113 139 Z" fill="#3a2210" />

          {/* Open-Air Right Half-Wall & Sturdy Beveled Cream-White Corner Posts */}
          <path d="M 134 102 Q 168 100 198 88 L 198 128 L 134 144 Z" fill="#ebd6a7" stroke="#4a280d" strokeWidth="2.2" strokeLinejoin="round" />
          <g stroke="#b89867" strokeWidth="1.3" opacity="0.7">
            <line x1="150" y1="101" x2="150" y2="140" />
            <line x1="166" y1="98" x2="166" y2="136" />
            <line x1="182" y1="94" x2="182" y2="132" />
          </g>

          {/* 4 Sturdy Timber Posts + Top Crossbeam (so interior stays open & airy!) */}
          <polygon points="130,68 142,68 142,146 130,146" fill="url(#postLight)" stroke="#4a280d" strokeWidth="2.2" />
          <polygon points="142,68 148,65 148,143 142,146" fill="#d3b988" stroke="#4a280d" strokeWidth="1.8" />
          <polygon points="193,52 204,52 204,132 193,132" fill="url(#postLight)" stroke="#4a280d" strokeWidth="2.2" />
          <polygon points="204,52 210,49 210,129 204,132" fill="#d3b988" stroke="#4a280d" strokeWidth="1.8" />
          {/* Gable beam */}
          <polygon points="140,66 175,38 206,56 196,62 175,48 144,72" fill="#f3e5c3" stroke="#4a280d" strokeWidth="2" strokeLinejoin="round" />

          {/* Iconic Swooping Curved Blue-to-Teal Roof */}
          {/* Right gable overhang */}
          <path
            d="M 102 18 L 178 36 Q 204 54 224 68 Q 212 72 202 64 L 174 42 Z"
            fill="#0e7490"
            stroke="#134e4a"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          {/* Main wide swooping front slope */}
          <path
            d="M 100 18 Q 138 24 176 36 Q 152 68 134 96 Q 94 92 48 80 Q 74 52 100 18 Z"
            fill="url(#barnSwoopRoof)"
            stroke="#134e4a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Curved Roof Planks */}
          <g stroke="#0f766e" strokeWidth="1.4" opacity="0.55" fill="none">
            <path d="M 118 22 Q 98 54 72 86" />
            <path d="M 138 26 Q 118 59 95 90" />
            <path d="M 157 31 Q 138 64 116 94" />
          </g>
          {/* Bright Turquoise Ridge Beam + Weathered Golden Eave Accents */}
          <path d="M 97 17 Q 138 23 177 35" fill="none" stroke="#5eead4" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 98 15 Q 138 21 178 33" fill="none" stroke="#134e4a" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 52 80 Q 94 91 132 95" fill="none" stroke="#fde047" strokeWidth="2.8" strokeLinecap="round" strokeDasharray="8 10" opacity="0.88" />
          <circle cx="163" cy="36" r="4" fill="#fde047" opacity="0.7" />

          {/* Glowing Golden Lantern hanging from front-left eave! */}
          <line x1="63" y1="84" x2="63" y2="95" stroke="#4a280d" strokeWidth="2" />
          <circle cx="63" cy="102" r="12" fill="#fde047" opacity="0.34" />
          <circle cx="63" cy="102" r="7" fill="#f59e0b" stroke="#78350f" strokeWidth="1.8" />
          <circle cx="61" cy="100" r="2.5" fill="#fef9c3" />

          {/* Curved Front White/Cream Picket Fence wrapping around the pen */}
          <polygon points="78,150 132,162 204,132 204,143 132,172 78,160" fill="#c9ae7f" stroke="#4a280d" strokeWidth="1.8" />
          <g fill="#f7ebd0" stroke="#4a280d" strokeWidth="2" strokeLinejoin="round">
            <polygon points="82,138 89,132 96,138 96,166 82,166" />
            <polygon points="103,144 110,138 117,144 117,172 103,172" />
            <polygon points="124,148 131,142 138,148 138,176 124,176" />
            <polygon points="145,142 152,136 159,142 159,170 145,170" />
            <polygon points="166,134 173,128 180,134 180,162 166,162" />
            <polygon points="187,125 194,119 201,125 201,153 187,153" />
          </g>
        </svg>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-[#4a280d]/90 text-amber-100 text-[11px] font-bold whitespace-nowrap pointer-events-none">
          {isNeighborMode ? 'Chuồng Chính' : 'Lai Tạo & Quản Lý'}
        </span>
      </button>

      {/* RIGHT: Long Aqua Water Trough with Chunky Faucet matching reference */}
      <button
        type="button"
        onClick={onClickTrough}
        title={`Máng Nước (${Math.round(waterLevel)}%) — Nhấn để châm đầy nước`}
        className="landscape-compact-building-trough group absolute top-[42%] right-[6.5%] z-10 w-[64px] sm:w-[76px] md:w-[86px] cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
      >
        <svg viewBox="0 0 86 195" className="w-full h-auto drop-shadow-md">
          <defs>
            <linearGradient id="troughWater" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="55%" stopColor="#38d4c5" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
          <ellipse cx="36" cy="176" rx="26" ry="8" fill="#5c3618" opacity="0.25" />
          <rect x="10" y="30" width="46" height="150" rx="18" fill="#177f7b" stroke="#134e4a" strokeWidth="2.6" />
          <rect x="16" y="36" width="34" height="136" rx="14" fill="#0d5b58" />
          <rect
            x="18"
            y={38 + (1 - waterLevel / 100) * 124}
            width="30"
            height={Math.max(10, (waterLevel / 100) * 132)}
            rx="12"
            fill="url(#troughWater)"
          />
          {waterLevel > 15 && (
            <>
              <ellipse cx="33" cy={64 + (1 - waterLevel / 100) * 85} rx="7" ry="15" fill="#d1fae5" opacity="0.65" />
              <ellipse cx="29" cy={118 + (1 - waterLevel / 100) * 40} rx="5" ry="10" fill="#e0f2fe" opacity="0.55" />
            </>
          )}
          <path d="M 42 40 L 42 22 Q 42 14 54 14 L 66 14 L 66 26" fill="none" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
          <path d="M 42 40 L 42 22 Q 42 14 54 14 L 66 14 L 66 26" fill="none" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="66" cy="27" r="4.5" fill="#334155" />
          <rect x="52" y="6" width="16" height="4.5" rx="2" fill="#475569" stroke="#1e293b" strokeWidth="1.2" />
          <rect x="58" y="3" width="4.5" height="10" rx="2" fill="#64748b" stroke="#1e293b" strokeWidth="1.2" />
        </svg>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#4a280d]/90 text-amber-100 text-[11px] font-bold whitespace-nowrap pointer-events-none">
          Nước: {Math.round(waterLevel)}%
        </span>
      </button>

      {/* FAR-RIGHT: Swirl Totem Scratching Post matching reference */}
      <button
        type="button"
        onClick={onClickScratchPost}
        title="Trụ Gãi Ngứa — Nhấn để gọi heo tới cọ lưng cho vui!"
        className="landscape-compact-building-post group absolute top-[50%] right-[1.2%] z-10 w-[48px] sm:w-[58px] md:w-[66px] cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
      >
        <svg viewBox="0 0 64 162" className="w-full h-auto drop-shadow-md">
          <defs>
            <linearGradient id="postRedBody" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="45%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="postWoodCap" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>

          <ellipse cx="32" cy="152" rx="20" ry="6" fill="#5c3618" opacity="0.25" />
          <ellipse cx="32" cy="18" rx="18" ry="8" fill="url(#postWoodCap)" stroke="#4a280d" strokeWidth="2.2" />
          <ellipse cx="32" cy="11" rx="13" ry="5.5" fill="url(#postWoodCap)" stroke="#4a280d" strokeWidth="2" />
          <rect x="16" y="25" width="32" height="15" rx="3" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
          <rect x="17" y="40" width="30" height="76" fill="url(#postRedBody)" stroke="#4a280d" strokeWidth="2.2" />
          <g stroke="#fde68a" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.9">
            <path d="M 19 52 Q 36 44 45 56" />
            <path d="M 21 67 Q 32 76 44 65" />
            <path d="M 19 84 Q 35 76 45 88" />
            <path d="M 21 101 Q 34 110 44 98" />
          </g>
          <rect x="16" y="116" width="32" height="15" rx="3" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
          <ellipse cx="32" cy="136" rx="18" ry="7.5" fill="url(#postWoodCap)" stroke="#4a280d" strokeWidth="2.2" />
          <ellipse cx="32" cy="144" rx="15" ry="6" fill="url(#postWoodCap)" stroke="#4a280d" strokeWidth="2" />
        </svg>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-3 right-0 px-2 py-0.5 rounded bg-[#4a280d]/90 text-amber-100 text-[11px] font-bold whitespace-nowrap pointer-events-none">
          Trụ Gãi Ngứa
        </span>
      </button>
    </>
  );
};
