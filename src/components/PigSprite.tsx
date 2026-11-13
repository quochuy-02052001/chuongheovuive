import React, { useId } from 'react';
import { BREED_MAP } from '../data/pigBreeds';
import { MoodBubble, PigStage } from '../types/game';

interface PigSpriteProps {
  breedId: string;
  stage?: PigStage;
  facing?: 'left' | 'right';
  isMoving?: boolean;
  isSick?: boolean;
  isBouncing?: boolean;
  moodBubble?: MoodBubble;
  size?: number;
  selected?: boolean;
}

export const PigSprite: React.FC<PigSpriteProps> = ({
  breedId,
  stage = 'adult',
  facing = 'left',
  isMoving = false,
  isSick = false,
  isBouncing = false,
  moodBubble = null,
  size = 76,
  selected = false,
}) => {
  const rawUid = useId();
  const uid = rawUid.replace(/[^a-zA-Z0-9_-]/g, '');
  const breed = BREED_MAP[breedId] || BREED_MAP['pink_flower'];
  const stageScale = stage === 'piglet' ? 0.78 : stage === 'teen' ? 0.91 : 1.04;
  // Default SVG faces LEFT (snout on left, tail on right). Flip when facing right.
  const flipX = facing === 'right' ? -1 : 1;

  const bodyGradId = `bg-${uid}`;
  const bodyClipId = `bc-${uid}`;
  const snoutGradId = `sn-${uid}`;
  const rainbowGradId = `rb-${uid}`;
  const metalGradId = `mt-${uid}`;
  const goldGradId = `gd-${uid}`;
  const dragonGradId = `dr-${uid}`;
  const goldDragonGradId = `dg-${uid}`;
  const phoenixGradId = `ph-${uid}`;
  const frostGradId = `fr-${uid}`;

  const isDragon = breed.pattern === 'ninja';
  const isGoldDragon = breed.pattern === 'dragon_gold';
  const isMecha = breed.pattern === 'mecha';
  const isTigerCat = breed.pattern === 'tiger';
  const isCheshireCat = breed.pattern === 'cat_green';
  const isRoyalGold = breed.pattern === 'crown';
  const isAngel = breed.pattern === 'angel';
  const isDevil = breed.pattern === 'devil';
  const isPirate = breed.pattern === 'pirate';
  const isFrost = breed.pattern === 'frost_king';
  const isWizard = breed.pattern === 'wizard';
  const isAstro = breed.pattern === 'astronaut';
  const isUnicorn = breed.pattern === 'unicorn';
  const isKitsune = breed.pattern === 'kitsune';
  const isPhoenix = breed.pattern === 'phoenix';

  const bodyFill =
    breed.pattern === 'rainbow'
      ? `url(#${rainbowGradId})`
      : isMecha
      ? `url(#${metalGradId})`
      : isRoyalGold
      ? `url(#${goldGradId})`
      : isDragon
      ? `url(#${dragonGradId})`
      : isGoldDragon
      ? `url(#${goldDragonGradId})`
      : isPhoenix
      ? `url(#${phoenixGradId})`
      : isFrost
      ? `url(#${frostGradId})`
      : `url(#${bodyGradId})`;

  const snoutBase =
    breed.pattern === 'watermelon'
      ? '#bef264'
      : isMecha
      ? '#cbd5e1'
      : isDragon
      ? '#475569'
      : isGoldDragon
      ? '#fde047'
      : isFrost
      ? '#e0f2fe'
      : isDevil
      ? '#fb7185'
      : isTigerCat || isCheshireCat
      ? '#ffb4c6'
      : '#ff9ebb';

  const snoutHighlight =
    breed.pattern === 'watermelon'
      ? '#ecfccb'
      : isMecha
      ? '#f8fafc'
      : isDragon
      ? '#64748b'
      : isGoldDragon
      ? '#fef9c3'
      : isFrost
      ? '#ffffff'
      : '#ffd6e4';

  const outlineColor = isMecha
    ? '#475569'
    : isDragon
    ? '#1e293b'
    : isFrost
    ? '#0369a1'
    : isDevil
    ? '#881337'
    : '#542912';

  const hoofColor = isMecha
    ? '#64748b'
    : isDragon
    ? '#0f172a'
    : isFrost
    ? '#0284c7'
    : isRoyalGold || isGoldDragon
    ? '#b45309'
    : '#6e3a1e';

  // Plump, rounded 2.5D jellybean/pear silhouette with soft cheek & chubby belly
  const roundBodyPath =
    'M 19 54 C 19 31, 35 22, 56 23 C 79 23, 97 35, 97 56 C 97 77, 81 86, 57 86 C 32 86, 19 74, 19 54 Z';

  return (
    <div
      className="relative inline-flex items-center justify-center select-none pointer-events-none"
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Floating Mood Bubble */}
      {moodBubble && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="px-1.5 py-0.5 rounded-full bg-white/95 border-2 border-[#6d411c] shadow-sm text-[11px] font-bold leading-none flex items-center gap-0.5 whitespace-nowrap">
            {moodBubble === 'hungry' && <span title="Đói bụng">🍖</span>}
            {moodBubble === 'thirsty' && <span title="Khát nước">💧</span>}
            {moodBubble === 'love' && <span title="Vui vẻ">❤️</span>}
            {moodBubble === 'sick' && <span title="Bị ốm">🤒</span>}
            {moodBubble === 'ready' && (
              <span className="text-amber-600" title="Trưởng thành">
                ★
              </span>
            )}
            {moodBubble === 'sleep' && <span className="text-indigo-500">Zzz</span>}
          </div>
        </div>
      )}

      {/* Selection ring */}
      {selected && (
        <div
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[78%] h-[22%] rounded-full border-2 border-amber-300 bg-amber-300/35 animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Soft elliptical ground shadow */}
      <div
        className="absolute bottom-[4%] left-1/2 -translate-x-1/2 rounded-full bg-[#4a260a]/30 blur-[1.5px]"
        style={{ width: size * 0.68 * stageScale, height: size * 0.16 * stageScale }}
      />

      <div
        className={`w-full h-full flex items-center justify-center ${
          isBouncing ? 'animate-pig-bounce' : isMoving ? 'animate-pig-waddle' : ''
        }`}
      >
        <svg
          viewBox="0 0 116 108"
          width={size * stageScale}
          height={size * stageScale}
          style={{
            transform: `scaleX(${flipX})`,
            filter: isSick ? 'saturate(0.55) hue-rotate(40deg)' : undefined,
          }}
        >
          <defs>
            <radialGradient id={bodyGradId} cx="35%" cy="28%" r="72%">
              <stop offset="0%" stopColor={breed.bellyColor} />
              <stop offset="48%" stopColor={breed.bodyColor} />
              <stop offset="100%" stopColor={breed.earColor} />
            </radialGradient>

            <radialGradient id={snoutGradId} cx="35%" cy="30%" r="72%">
              <stop offset="0%" stopColor={snoutHighlight} />
              <stop offset="65%" stopColor={snoutBase} />
              <stop offset="100%" stopColor={snoutBase} />
            </radialGradient>

            {/* Vibrant curved rainbow bands */}
            <linearGradient id={rainbowGradId} x1="0" y1="0.2" x2="1" y2="0.8">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="22%" stopColor="#ef4444" />
              <stop offset="52%" stopColor="#facc15" />
              <stop offset="76%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>

            <radialGradient id={metalGradId} cx="35%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="48%" stopColor="#cbd5e1" />
              <stop offset="85%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </radialGradient>

            <radialGradient id={goldGradId} cx="35%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="45%" stopColor="#fbbf24" />
              <stop offset="88%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </radialGradient>

            <radialGradient id={dragonGradId} cx="36%" cy="26%" r="75%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="45%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>

            <radialGradient id={goldDragonGradId} cx="35%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="42%" stopColor="#fbbf24" />
              <stop offset="82%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#92400e" />
            </radialGradient>

            <radialGradient id={phoenixGradId} cx="35%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="46%" stopColor="#fb923c" />
              <stop offset="85%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </radialGradient>

            <radialGradient id={frostGradId} cx="35%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#bae6fd" />
              <stop offset="88%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>

            <clipPath id={bodyClipId}>
              <path d={roundBodyPath} />
            </clipPath>
          </defs>

          {/* ---- BACK/FAR WINGS ---- */}
          {isDragon && (
            <path
              d="M 52 33 C 54 14, 70 7, 83 14 C 79 22, 82 26, 85 28 C 78 30, 75 34, 73 39 Z"
              fill="#1e293b"
              stroke={outlineColor}
              strokeWidth="1.9"
              strokeLinejoin="round"
            />
          )}
          {isGoldDragon && (
            <path
              d="M 52 33 C 54 13, 72 6, 86 14 C 81 22, 84 26, 87 28 C 79 30, 75 34, 73 39 Z"
              fill="#f59e0b"
              stroke={outlineColor}
              strokeWidth="1.9"
              strokeLinejoin="round"
            />
          )}
          {isAngel && (
            <path
              d="M 54 34 C 52 16, 70 11, 80 20 C 75 26, 76 31, 70 37 Z"
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          )}
          {isPhoenix && (
            <path
              d="M 53 34 C 52 15, 73 8, 86 16 C 78 23, 81 29, 73 38 Z"
              fill="#facc15"
              stroke="#b91c1c"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          )}

          {/* ---- CHUBBY FAR-SIDE TROTTERS ---- */}
          <g stroke={outlineColor} strokeWidth="1.8" strokeLinejoin="round">
            <path d="M 31 76 Q 30 88 35 89 Q 41 89 41 77 Z" fill={breed.earColor} />
            <path d="M 69 75 Q 69 87 74 88 Q 80 88 80 75 Z" fill={breed.earColor} />
          </g>

          {/* ---- TAILS ---- */}
          {isTigerCat ? (
            <g>
              <path
                d="M 93 58 C 106 56, 110 42, 102 34 C 96 29, 91 37, 95 44 C 97 49, 95 53, 91 54"
                fill="#f59e0b"
                stroke={outlineColor}
                strokeWidth="1.9"
                strokeLinecap="round"
              />
              <path d="M 99 35 L 103 40 M 98 44 L 104 46" stroke="#1f2937" strokeWidth="2.1" strokeLinecap="round" />
            </g>
          ) : isCheshireCat ? (
            <g>
              <path
                d="M 93 58 C 107 54, 110 36, 100 30 C 94 27, 92 35, 96 41 C 98 47, 95 51, 91 52"
                fill="#06b6d4"
                stroke="#0f172a"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
              <path d="M 98 31 L 103 36 M 98 42 L 104 45" stroke="#1e3a8a" strokeWidth="2.1" strokeLinecap="round" />
            </g>
          ) : isMecha ? (
            <g>
              <path d="M 94 56 Q 104 50 107 43" fill="none" stroke="#475569" strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="108" cy="41" r="4" fill="#ec4899" stroke="#831843" strokeWidth="1.4" />
              <circle cx="106.5" cy="39.5" r="1.2" fill="#fbcfe8" />
            </g>
          ) : isDragon ? (
            <g>
              <path d="M 94 58 Q 105 62 110 53" fill="none" stroke="#0f172a" strokeWidth="4.2" strokeLinecap="round" />
              <path d="M 107 54 L 113 45 L 112 59 Z" fill="#b91c1c" stroke={outlineColor} strokeWidth="1.5" strokeLinejoin="round" />
            </g>
          ) : isGoldDragon ? (
            <g>
              <path d="M 94 58 Q 105 62 110 51" fill="none" stroke="#b45309" strokeWidth="4.2" strokeLinecap="round" />
              <path d="M 106 53 L 113 43 L 112 58 Z" fill="#fef08a" stroke="#92400e" strokeWidth="1.5" strokeLinejoin="round" />
            </g>
          ) : isDevil ? (
            <g>
              <path d="M 94 56 Q 104 52 108 42" fill="none" stroke="#881337" strokeWidth="2.6" strokeLinecap="round" />
              <polygon points="105,41 113,36 111,46" fill="#e11d48" stroke="#4c0519" strokeWidth="1.4" strokeLinejoin="round" />
            </g>
          ) : isKitsune ? (
            <g>
              <path d="M 91 57 C 105 60, 113 44, 104 33 C 98 28, 93 37, 96 46" fill="#fff1f2" stroke={outlineColor} strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 90 53 C 104 50, 111 33, 100 26 C 95 24, 92 32, 95 40" fill="#fda4af" stroke={outlineColor} strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 91 60 C 102 66, 110 56, 104 47" fill="#ffe4e6" stroke={outlineColor} strokeWidth="1.8" strokeLinecap="round" />
            </g>
          ) : isPhoenix ? (
            <g>
              <path d="M 93 55 Q 109 48 111 36 Q 102 39 96 47" fill="#facc15" stroke="#991b1b" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M 94 59 Q 110 59 111 47 Q 102 50 95 54" fill="#ef4444" stroke="#991b1b" strokeWidth="1.7" strokeLinejoin="round" />
            </g>
          ) : isUnicorn ? (
            <path
              d="M 93 56 C 106 54, 109 40, 102 34 C 97 31, 93 38, 97 45"
              fill="#f472b6"
              stroke={outlineColor}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M 94 56 C 103 52, 105 43, 100 40 C 96 38, 94 44, 99 47 C 102 49, 98 53, 94 54"
              fill="none"
              stroke={breed.earColor}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          )}

          {/* ---- FAR EAR (3/4 perspective) ---- */}
          {isDragon ? (
            <ellipse cx="32" cy="23" rx="4.4" ry="8" transform="rotate(-14 32 23)" fill="#1e293b" stroke={outlineColor} strokeWidth="1.8" />
          ) : isTigerCat || isCheshireCat ? (
            <path d="M 24 31 L 26 14 L 38 24 Z" fill={isCheshireCat ? '#38bdf8' : breed.earColor} stroke={outlineColor} strokeWidth="1.9" strokeLinejoin="round" />
          ) : isKitsune ? (
            <g>
              <path d="M 24 31 L 25 13 L 38 24 Z" fill="#ffe4e6" stroke={outlineColor} strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M 26 28 L 27 17 L 35 24 Z" fill="#fb7185" />
            </g>
          ) : !isMecha ? (
            <g>
              <path d="M 25 32 C 21 17, 32 14, 38 25 Z" fill={breed.earColor} stroke={outlineColor} strokeWidth="1.9" strokeLinejoin="round" />
              <path d="M 27 29 C 25 20, 31 18, 35 25 Z" fill="#fda4af" opacity="0.6" />
            </g>
          ) : null}

          {/* ---- MAIN PLUMP 2.5D BODY ---- */}
          <path d={roundBodyPath} fill={bodyFill} stroke={outlineColor} strokeWidth="1.9" />

          {/* ---- CLIPPED BREED PATTERNS & SOFT VOLUME ---- */}
          <g clipPath={`url(#${bodyClipId})`}>
            {(isTigerCat || isCheshireCat) && (
              <ellipse cx="29" cy="61" rx="14" ry="11" fill="#fff7ed" opacity="0.92" />
            )}

            {isCheshireCat && (
              <>
                <rect x="16" y="18" width="88" height="72" fill="#22d3ee" opacity="0.72" />
                <ellipse cx="29" cy="61" rx="14" ry="11" fill="#fff1f2" />
                <g stroke="#0284c7" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9">
                  <path d="M 49 21 Q 55 46 48 76" />
                  <path d="M 61 21 Q 67 48 60 80" />
                  <path d="M 73 23 Q 78 48 71 80" />
                  <path d="M 84 28 Q 89 50 83 78" />
                </g>
              </>
            )}

            {isTigerCat && (
              <g stroke="#1c1917" strokeWidth="3.2" fill="none" strokeLinecap="round">
                <path d="M 49 22 Q 53 34 48 44" />
                <path d="M 60 21 Q 64 35 59 48" />
                <path d="M 71 22 Q 75 36 69 49" />
                <path d="M 81 26 Q 85 37 79 50" />
                <path d="M 89 34 Q 93 44 88 54" />
              </g>
            )}

            {breed.pattern === 'spotted' && (
              <g fill="#7c4722" opacity="0.82">
                <ellipse cx="64" cy="34" rx="8.5" ry="6.5" transform="rotate(-15 64 34)" />
                <circle cx="81" cy="51" r="6" />
                <circle cx="55" cy="64" r="4.8" />
              </g>
            )}

            {breed.pattern === 'watermelon' && (
              <g stroke="#14532d" strokeWidth="3.8" fill="none" strokeLinecap="round" opacity="0.85">
                <path d="M 51 23 Q 58 54 51 85" />
                <path d="M 65 23 Q 72 54 65 85" />
                <path d="M 80 28 Q 87 55 80 83" />
              </g>
            )}

            {breed.pattern === 'rainbow' && (
              <>
                <circle cx="32" cy="52" r="19" fill="#fff5f7" opacity="0.9" />
                <path d="M 53 21 Q 61 54 52 87" stroke="#ef4444" strokeWidth="11" fill="none" opacity="0.85" />
                <path d="M 67 22 Q 75 54 66 86" stroke="#facc15" strokeWidth="11" fill="none" opacity="0.9" />
                <path d="M 81 26 Q 89 54 80 83" stroke="#2563eb" strokeWidth="11" fill="none" opacity="0.9" />
              </>
            )}

            {breed.pattern === 'lightning' && (
              <polygon
                points="60,34 74,34 65,48 77,48 57,70 62,53 52,53"
                fill="#fde047"
                stroke="#9a3412"
                strokeWidth="1.5"
              />
            )}

            {breed.pattern === 'strawberry' && (
              <g fill="#fef08a" opacity="0.92">
                <ellipse cx="55" cy="41" rx="1.5" ry="2.3" />
                <ellipse cx="68" cy="36" rx="1.5" ry="2.3" />
                <ellipse cx="80" cy="45" rx="1.5" ry="2.3" />
                <ellipse cx="64" cy="56" rx="1.5" ry="2.3" />
                <ellipse cx="77" cy="62" rx="1.5" ry="2.3" />
              </g>
            )}

            {breed.pattern === 'sakura' && (
              <g fill="#ec4899" opacity="0.72">
                <ellipse cx="63" cy="39" rx="3.8" ry="2.2" transform="rotate(-25 63 39)" />
                <ellipse cx="78" cy="51" rx="3.5" ry="2" transform="rotate(20 78 51)" />
                <ellipse cx="58" cy="63" rx="3.2" ry="1.9" transform="rotate(40 58 63)" />
              </g>
            )}

            {isDragon && (
              <g fill="#475569" opacity="0.6">
                <circle cx="58" cy="33" r="2.8" />
                <circle cx="67" cy="36" r="2.1" />
                <circle cx="74" cy="31" r="2.6" />
                <circle cx="81" cy="41" r="2.3" />
              </g>
            )}

            {isMecha && (
              <g>
                <path d="M 50 23 C 56 44, 54 67, 47 87" fill="none" stroke="#475569" strokeWidth="1.9" />
                <path d="M 56 31 Q 75 27 88 43 Q 89 65 72 71 Q 58 63 56 31 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" opacity="0.85" />
                <line x1="66" y1="44" x2="66" y2="53" stroke="#334155" strokeWidth="2.1" strokeLinecap="round" />
                <line x1="72" y1="45" x2="72" y2="54" stroke="#334155" strokeWidth="2.1" strokeLinecap="round" />
                <line x1="78" y1="46" x2="78" y2="55" stroke="#334155" strokeWidth="2.1" strokeLinecap="round" />
                <circle cx="60" cy="35" r="1.3" fill="#475569" />
                <circle cx="82" cy="43" r="1.3" fill="#475569" />
                <circle cx="72" cy="65" r="1.3" fill="#475569" />
              </g>
            )}

            {isGoldDragon && (
              <g fill="#fde047" opacity="0.65">
                <circle cx="59" cy="33" r="3" />
                <circle cx="69" cy="36" r="2.4" />
                <circle cx="77" cy="31" r="2.8" />
                <circle cx="83" cy="42" r="2.5" />
                <path d="M 50 64 Q 64 72 88 64" stroke="#fef9c3" strokeWidth="4" fill="none" opacity="0.55" />
              </g>
            )}

            {isFrost && (
              <g fill="#ffffff" opacity="0.72">
                <polygon points="64,33 67,38 64,43 61,38" />
                <polygon points="80,44 83,49 80,54 77,49" />
                <polygon points="57,58 59,62 57,66 55,62" />
              </g>
            )}

            {isWizard && (
              <g fill="#fde047" opacity="0.88">
                <polygon points="64,37 66,42 71,42 67,45 68,50 64,47 60,50 61,45 57,42 62,42" />
                <circle cx="81" cy="52" r="2.2" />
                <circle cx="55" cy="60" r="1.8" />
              </g>
            )}

            {isUnicorn && (
              <g>
                <path d="M 50 25 C 60 29, 65 39, 59 48 C 68 47, 73 54, 68 63" fill="none" stroke="#f472b6" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
                <path d="M 54 24 C 64 28, 69 37, 64 45" fill="none" stroke="#38bdf8" strokeWidth="4.5" strokeLinecap="round" opacity="0.5" />
              </g>
            )}

            {isKitsune && (
              <g>
                <path d="M 31 33 L 35 27 L 39 33 L 35 36 Z" fill="#e11d48" />
                <path d="M 62 58 Q 76 52 86 62" stroke="#fda4af" strokeWidth="4" fill="none" opacity="0.65" />
              </g>
            )}

            {isAstro && (
              <g>
                <rect x="55" y="42" width="23" height="16" rx="4" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
                <circle cx="62" cy="50" r="3" fill="#ef4444" />
                <circle cx="71" cy="50" r="3" fill="#38bdf8" />
              </g>
            )}

            {breed.pattern === 'cosmic' && (
              <g fill="#fef08a">
                <circle cx="58" cy="36" r="1.9" />
                <circle cx="73" cy="32" r="2.4" />
                <circle cx="84" cy="47" r="1.7" />
                <circle cx="67" cy="59" r="2" />
                <path d="M 48 55 Q 69 42 92 55" stroke="#a5b4fc" strokeWidth="2.8" fill="none" opacity="0.55" />
              </g>
            )}

            {/* Soft 2.5D spherical belly shadow, bounce rim & glossy top highlight */}
            <path d="M 16 66 Q 58 82 99 65 L 100 92 L 16 92 Z" fill="#000000" opacity="0.1" />
            <path d="M 28 79 Q 57 86 84 78" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.22" />
            <path d="M 32 29 Q 57 22 80 31" fill="none" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="round" opacity="0.52" />
            <ellipse cx="66" cy="34" rx="10" ry="3.2" transform="rotate(14 66 34)" fill="#ffffff" opacity="0.24" />
          </g>

          {/* Crisp warm outline around body */}
          <path d={roundBodyPath} fill="none" stroke={outlineColor} strokeWidth="1.9" />

          {/* ---- NEAR-SIDE WINGS ---- */}
          {isDragon && (
            <path
              d="M 59 45 C 59 24, 79 12, 97 20 C 90 28, 93 34, 96 38 C 87 38, 83 44, 81 51 C 74 46, 66 46, 59 45 Z"
              fill="#334155"
              stroke={outlineColor}
              strokeWidth="1.9"
              strokeLinejoin="round"
            />
          )}
          {isGoldDragon && (
            <path
              d="M 59 45 C 59 24, 81 11, 100 20 C 92 28, 95 34, 98 38 C 88 38, 84 44, 82 51 C 74 46, 66 46, 59 45 Z"
              fill="#fbbf24"
              stroke={outlineColor}
              strokeWidth="1.9"
              strokeLinejoin="round"
            />
          )}
          {isAngel && (
            <path
              d="M 58 46 C 60 29, 79 20, 93 27 C 88 34, 88 41, 82 46 C 74 46, 66 48, 58 46 Z"
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          )}
          {isDevil && (
            <path
              d="M 60 46 C 60 31, 76 22, 88 28 C 82 34, 84 40, 79 45 C 73 42, 66 44, 60 46 Z"
              fill="#881337"
              stroke="#4c0519"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          )}
          {isPhoenix && (
            <path
              d="M 58 47 C 58 26, 81 15, 98 22 C 90 30, 92 36, 94 41 C 85 41, 81 47, 77 52 C 71 47, 64 47, 58 47 Z"
              fill="#f97316"
              stroke="#7f1d1d"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          )}

          {/* ---- CUTE TAPERED NEAR-SIDE TROTTERS ---- */}
          <g stroke={outlineColor} strokeWidth="1.8" strokeLinejoin="round">
            <path
              d="M 40 77 Q 39 90 45 91 Q 51 91 51 78 Z"
              fill={isCheshireCat ? '#22d3ee' : breed.pattern === 'rainbow' ? '#facc15' : breed.bodyColor}
            />
            <path d="M 41.5 87 Q 45 91 49.5 87" fill={hoofColor} stroke="none" opacity="0.65" />

            <path
              d="M 74 76 Q 74 89 80 90 Q 86 90 86 76 Z"
              fill={isCheshireCat ? '#22d3ee' : breed.pattern === 'rainbow' ? '#2563eb' : breed.bodyColor}
            />
            <path d="M 75.5 86 Q 80 90 84.5 86" fill={hoofColor} stroke="none" opacity="0.65" />
          </g>

          {/* ---- PANDA EYE PATCHES ---- */}
          {breed.pattern === 'panda' && (
            <>
              <ellipse cx="23.5" cy="46.5" rx="5" ry="6.2" transform="rotate(10 23.5 46.5)" fill="#1e293b" />
              <ellipse cx="39.5" cy="47.5" rx="6.6" ry="7.6" transform="rotate(-14 39.5 47.5)" fill="#1e293b" />
            </>
          )}

          {/* ---- NEAR EAR (3/4 perspective) ---- */}
          {isDragon ? (
            <ellipse cx="52" cy="24" rx="4.8" ry="8.8" transform="rotate(24 52 24)" fill="#334155" stroke={outlineColor} strokeWidth="1.8" />
          ) : isTigerCat || isCheshireCat ? (
            <g>
              <path d="M 41 27 L 45 11 L 56 24 Z" fill={isCheshireCat ? '#22d3ee' : breed.bodyColor} stroke={outlineColor} strokeWidth="1.9" strokeLinejoin="round" />
              <path d="M 44 24 L 46 15 L 52 23 Z" fill="#fda4af" />
            </g>
          ) : isKitsune ? (
            <g>
              <path d="M 41 27 L 45 10 L 56 24 Z" fill="#fff1f2" stroke={outlineColor} strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M 44 24 L 46 15 L 52 23 Z" fill="#fb7185" />
            </g>
          ) : isMecha ? (
            <g>
              <line x1="33" y1="27" x2="28" y2="13" stroke="#475569" strokeWidth="2.3" strokeLinecap="round" />
              <circle cx="27" cy="11" r="4" fill="#ec4899" stroke="#831843" strokeWidth="1.4" />
              <circle cx="25.8" cy="9.8" r="1.2" fill="#fbcfe8" />

              <line x1="47" y1="24" x2="50" y2="11" stroke="#475569" strokeWidth="2.3" strokeLinecap="round" />
              <circle cx="50" cy="9" r="4" fill="#ec4899" stroke="#831843" strokeWidth="1.4" />
              <circle cx="48.8" cy="7.8" r="1.2" fill="#fbcfe8" />
            </g>
          ) : (
            <g>
              <path d="M 40 28 C 41 12, 54 13, 56 27 Z" fill={breed.earColor} stroke={outlineColor} strokeWidth="1.9" strokeLinejoin="round" />
              <path d="M 43 25 C 44 17, 50 17, 52 25 Z" fill="#fda4af" opacity="0.7" />
            </g>
          )}

          {/* ---- EXPRESSIVE 3/4 GLOSSY EYES ---- */}
          {isSick ? (
            <g stroke={outlineColor} strokeWidth="2" strokeLinecap="round">
              <line x1="21" y1="43.5" x2="26" y2="48.5" />
              <line x1="26" y1="43.5" x2="21" y2="48.5" />
              <line x1="36" y1="44.5" x2="42" y2="50.5" />
              <line x1="42" y1="44.5" x2="36" y2="50.5" />
            </g>
          ) : isMecha ? (
            <g>
              {/* Far robot eye */}
              <ellipse cx="23.5" cy="46.5" rx="4.2" ry="5.4" fill="#ffffff" stroke="#334155" strokeWidth="1.6" />
              <ellipse cx="23" cy="46.8" rx="2.7" ry="3.5" fill="#0284c7" />
              <circle cx="22.8" cy="46.8" r="1.4" fill="#0f172a" />
              <circle cx="22" cy="45" r="1.1" fill="#ffffff" />
              {/* Near robot eye */}
              <ellipse cx="39.5" cy="47.5" rx="5.5" ry="6.5" fill="#ffffff" stroke="#334155" strokeWidth="1.6" />
              <ellipse cx="38.8" cy="47.8" rx="3.5" ry="4.3" fill="#0284c7" />
              <circle cx="38.3" cy="47.8" r="1.9" fill="#0f172a" />
              <circle cx="37.3" cy="45.3" r="1.5" fill="#ffffff" />
            </g>
          ) : isTigerCat ? (
            <g>
              <ellipse cx="23.5" cy="46.5" rx="4.6" ry="5.6" fill="#fef08a" stroke={outlineColor} strokeWidth="1.7" />
              <path d="M 19 46.5 Q 23.5 44.5 28 46.5" stroke={outlineColor} strokeWidth="1.5" fill="none" />
              <path d="M 19.5 44.8 C 21 40, 26 40, 27.5 44.8 Z" fill="#f59e0b" stroke={outlineColor} strokeWidth="1.3" />
              <circle cx="22.8" cy="48" r="1.6" fill="#1c1917" />

              <ellipse cx="39.5" cy="47.5" rx="6.2" ry="6.8" fill="#fef08a" stroke={outlineColor} strokeWidth="1.8" />
              <path d="M 33.5 47.5 Q 39.5 45.5 45.5 47.5" stroke={outlineColor} strokeWidth="1.6" fill="none" />
              <path d="M 34 45.5 C 36 40.5, 43 40.5, 45 45.5 Z" fill="#f59e0b" stroke={outlineColor} strokeWidth="1.4" />
              <circle cx="38.5" cy="49.2" r="2" fill="#1c1917" />
              <circle cx="37.8" cy="48.3" r="0.8" fill="#ffffff" />
            </g>
          ) : isCheshireCat ? (
            <g>
              <ellipse cx="23.5" cy="46.5" rx="4.5" ry="5.6" fill="#0f172a" stroke="#083344" strokeWidth="1.4" />
              <ellipse cx="23" cy="46.5" rx="3" ry="4" fill="#2dd4bf" />
              <ellipse cx="22.6" cy="46.5" rx="1.3" ry="2.7" fill="#0f172a" />
              <circle cx="22" cy="44.5" r="1.1" fill="#ffffff" />

              <ellipse cx="39.5" cy="47.5" rx="6" ry="7" fill="#0f172a" stroke="#083344" strokeWidth="1.5" />
              <ellipse cx="38.8" cy="47.5" rx="4.1" ry="5.1" fill="#2dd4bf" />
              <ellipse cx="38.3" cy="47.5" rx="1.8" ry="3.4" fill="#0f172a" />
              <circle cx="37.2" cy="45" r="1.4" fill="#ffffff" />

              <path
                d="M 21 60 Q 31 69 44 61 Q 32 63.5 21 60 Z"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <line x1="27" y1="61.5" x2="27" y2="64.5" stroke="#94a3b8" strokeWidth="0.9" />
              <line x1="32" y1="62" x2="32" y2="65" stroke="#94a3b8" strokeWidth="0.9" />
              <line x1="37" y1="61.6" x2="37" y2="64.5" stroke="#94a3b8" strokeWidth="0.9" />
            </g>
          ) : (
            <g>
              {/* Far eye (subtle perspective) */}
              <ellipse
                cx="23.5"
                cy="46.5"
                rx="3.4"
                ry="4.8"
                fill={breed.pattern === 'panda' ? '#ffffff' : '#1c1410'}
              />
              {isDragon && <ellipse cx="23.2" cy="46.5" rx="2.5" ry="3.7" fill="#a3e635" />}
              {isDragon && <ellipse cx="23" cy="46.5" rx="1.3" ry="2.8" fill="#0f172a" />}
              <circle
                cx="22.4"
                cy="44.8"
                r="1.4"
                fill={breed.pattern === 'panda' ? '#0f172a' : '#ffffff'}
              />
              <circle cx="24.2" cy="48.2" r="0.7" fill="#ffffff" opacity="0.85" />

              {/* Near eye (big sparkling) */}
              <ellipse
                cx="39.5"
                cy="47.5"
                rx="4.8"
                ry="5.9"
                fill={breed.pattern === 'panda' ? '#ffffff' : '#1c1410'}
              />
              {isDragon && <ellipse cx="39" cy="47.5" rx="3.5" ry="4.6" fill="#a3e635" />}
              {isDragon && <ellipse cx="38.5" cy="47.5" rx="1.9" ry="3.4" fill="#0f172a" />}
              <circle
                cx="37.8"
                cy="45.2"
                r="1.9"
                fill={breed.pattern === 'panda' ? '#0f172a' : '#ffffff'}
              />
              <circle cx="40.8" cy="49.5" r="0.95" fill="#ffffff" opacity="0.85" />
              {/* Cute tiny eyelash curve */}
              {!isDragon && (
                <path
                  d="M 43 43.5 Q 45.5 44 46 46"
                  fill="none"
                  stroke={outlineColor}
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  opacity="0.75"
                />
              )}
            </g>
          )}

          {/* Soft rosy cheeks */}
          {!isMecha && !isDragon && (
            <>
              <ellipse cx="19.5" cy="54" rx="2.8" ry="1.8" fill="#fb7185" opacity="0.45" />
              <ellipse cx="45.5" cy="56" rx="4.2" ry="2.4" fill="#fb7185" opacity="0.52" />
            </>
          )}

          {/* ---- PLUMP 3D SNOUT & HAPPY SMILE ---- */}
          <g>
            {!isCheshireCat && !isMecha && !isSick && (
              <path
                d="M 25.5 64 Q 28.8 66.8 32 64"
                fill="none"
                stroke={outlineColor}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}
            <ellipse
              cx="27.5"
              cy="57.5"
              rx="7.2"
              ry="5.6"
              transform="rotate(-4 27.5 57.5)"
              fill={`url(#${snoutGradId})`}
              stroke={outlineColor}
              strokeWidth="1.8"
            />
            <ellipse cx="25.5" cy="54.8" rx="2.4" ry="1" fill="#ffffff" opacity="0.5" />
            <ellipse cx="25.2" cy="57.5" rx="1.2" ry="1.6" fill={isMecha ? '#475569' : '#6d2530'} />
            <ellipse cx="29.4" cy="57.7" rx="1.2" ry="1.6" fill={isMecha ? '#475569' : '#6d2530'} />
          </g>

          {/* ---- HEADWEAR & ACCESSORIES ---- */}
          {(breed.pattern === 'flower' || breed.pattern === 'sakura') && (
            <g transform="translate(48, 28)">
              <circle cx="0" cy="-4" r="3.3" fill="#ff5d8f" stroke="#9d174d" strokeWidth="0.8" />
              <circle cx="3.8" cy="-1" r="3.3" fill="#ff5d8f" stroke="#9d174d" strokeWidth="0.8" />
              <circle cx="2.4" cy="3.5" r="3.3" fill="#ff5d8f" stroke="#9d174d" strokeWidth="0.8" />
              <circle cx="-2.4" cy="3.5" r="3.3" fill="#ff5d8f" stroke="#9d174d" strokeWidth="0.8" />
              <circle cx="-3.8" cy="-1" r="3.3" fill="#ff5d8f" stroke="#9d174d" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="2.3" fill="#fde047" />
            </g>
          )}

          {breed.pattern === 'samurai' && (
            <g>
              <path d="M 20 33 Q 38 14 56 32 Z" fill="#2563eb" stroke="#1e3a8a" strokeWidth="1.9" />
              <path d="M 32 22 L 37 12 L 42 22 Z" fill="#facc15" stroke="#854d0e" strokeWidth="1.3" />
              <path d="M 18 20 Q 38 9 58 20" fill="none" stroke="#38bdf8" strokeWidth="3.4" strokeLinecap="round" />
            </g>
          )}

          {breed.pattern === 'strawberry' && (
            <g transform="translate(38, 23)">
              <path d="M -9 4 L -4 -5 L 0 2 L 5 -6 L 9 4 Z" fill="#16a34a" stroke="#14532d" strokeWidth="1.5" />
            </g>
          )}

          {(breed.pattern === 'crown' || breed.pattern === 'diamond' || breed.pattern === 'jade') && (
            <g transform="translate(38, 21)">
              <polygon
                points="-11,7 -9,-5 -3,1 0,-8 3,1 9,-5 11,7"
                fill={breed.pattern === 'diamond' ? '#7dd3fc' : '#facc15'}
                stroke="#713f12"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <circle cx="0" cy="0" r="2" fill={breed.pattern === 'diamond' ? '#ffffff' : '#ef4444'} />
            </g>
          )}

          {breed.pattern === 'lion_dance' && (
            <g>
              <path d="M 22 33 Q 39 14 56 33" fill="none" stroke="#facc15" strokeWidth="5.5" strokeLinecap="round" strokeDasharray="4 4" />
              <circle cx="38" cy="23" r="4.4" fill="#fde047" stroke="#991b1b" strokeWidth="1.7" />
            </g>
          )}

          {isAngel && (
            <ellipse
              cx="38"
              cy="12"
              rx="13"
              ry="3.8"
              fill="none"
              stroke="#facc15"
              strokeWidth="3"
            />
          )}

          {isDevil && (
            <g fill="#dc2626" stroke="#4c0519" strokeWidth="1.7" strokeLinejoin="round">
              <path d="M 27 25 Q 23 13 31 15 Q 33 20 33 25 Z" />
              <path d="M 41 24 Q 45 12 50 16 Q 49 21 46 25 Z" />
            </g>
          )}

          {isUnicorn && (
            <g>
              <polygon
                points="30,27 25,7 38,23"
                fill="#fde047"
                stroke="#92400e"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <line x1="28" y1="19" x2="33" y2="21" stroke="#f59e0b" strokeWidth="1.4" />
            </g>
          )}

          {isFrost && (
            <g transform="translate(38, 21)">
              <polygon
                points="-11,7 -8,-6 -3,1 0,-10 3,1 8,-6 11,7"
                fill="#e0f2fe"
                stroke="#0369a1"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <circle cx="0" cy="-1" r="2.1" fill="#38bdf8" />
            </g>
          )}

          {isPirate && (
            <g>
              {/* Eyepatch over near eye while far eye gleams */}
              <line x1="28" y1="36" x2="50" y2="39" stroke="#1c1917" strokeWidth="2.1" />
              <circle cx="39.5" cy="47.5" r="6" fill="#1c1917" />
              {/* Red pirate bandana */}
              <path d="M 22 33 Q 38 15 56 31 L 50 36 Q 36 25 22 33 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1.7" strokeLinejoin="round" />
              <circle cx="38" cy="24" r="2.5" fill="#ffffff" />
            </g>
          )}

          {isWizard && (
            <g>
              <ellipse cx="39" cy="27" rx="19" ry="4.3" fill="#581c87" stroke="#2e1065" strokeWidth="1.8" />
              <path d="M 26 26 L 40 3 L 51 26 Z" fill="#7e22ce" stroke="#2e1065" strokeWidth="1.8" strokeLinejoin="round" />
              <polygon points="38,14 39.5,17 43,17 40.2,19 41,22 38,20 35,22 36,19 33,17 36.5,17" fill="#fde047" />
            </g>
          )}

          {isAstro && (
            <g>
              <circle cx="34" cy="45" r="23.5" fill="#bae6fd" fillOpacity="0.26" stroke="#e2e8f0" strokeWidth="2.4" />
              <path d="M 19 34 Q 25 25 36 25" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            </g>
          )}

          {isPhoenix && (
            <g>
              <path d="M 30 24 C 33 10, 44 8, 47 18 C 42 18, 39 21, 38 25 Z" fill="#fde047" stroke="#b91c1c" strokeWidth="1.5" />
              <path d="M 38 25 C 43 14, 53 13, 55 22 C 49 22, 46 24, 44 27 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
            </g>
          )}

          {isGoldDragon && (
            <g fill="#fef08a" stroke="#92400e" strokeWidth="1.7" strokeLinejoin="round">
              <path d="M 30 25 Q 26 11 36 11 Q 37 18 36 25 Z" />
              <path d="M 43 24 Q 47 10 55 14 Q 52 20 48 25 Z" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
