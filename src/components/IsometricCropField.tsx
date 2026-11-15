import React, { useMemo } from 'react';
import { CROP_SEEDS, CROP_SEED_MAP, computePlotProgress, getPlotUnlockLevel } from '../data/cropSeeds';
import { CropSeed, FarmPlot } from '../types/game';
import { FarmTool } from './CropFarmModal';

interface IsometricCropFieldProps {
  plots: FarmPlot[];
  playerLevel: number;
  now: number;
  farmTool: FarmTool;
  selectedSeed: CropSeed;
  isSeedPanelOpen?: boolean;
  pendingPlotIndex?: number | null;
  onPlotTap: (plot: FarmPlot, isLocked: boolean) => void;
}

// Map plot.index (0..24) to isometric (row, col) in 5x5 so starter Lv.1 plots (0..4)
// form a cohesive tilled cluster at the top-center, matching classic 2.5D farm layout.
const PLOT_GRID_POS: Array<[number, number]> = [
  [0, 0], // 0 - Lv.1
  [0, 1], // 1 - Lv.1
  [1, 0], // 2 - Lv.1
  [1, 1], // 3 - Lv.1
  [0, 2], // 4 - Lv.1
  [1, 2], // 5 - Lv.2
  [2, 0], // 6 - Lv.3
  [2, 1], // 7 - Lv.4
  [2, 2], // 8 - Lv.5
  [0, 3], // 9 - Lv.6
  [1, 3], // 10 - Lv.7
  [2, 3], // 11 - Lv.8
  [3, 0], // 12 - Lv.9
  [3, 1], // 13 - Lv.10
  [3, 2], // 14 - Lv.12
  [3, 3], // 15 - Lv.13
  [0, 4], // 16 - Lv.14
  [1, 4], // 17 - Lv.15
  [2, 4], // 18 - Lv.16
  [3, 4], // 19 - Lv.18
  [4, 0], // 20 - Lv.19
  [4, 1], // 21 - Lv.20
  [4, 2], // 22 - Lv.22
  [4, 3], // 23 - Lv.24
  [4, 4], // 24 - Lv.25
];

const TILE_W = 112;
const TILE_H = 56;
const ORIGIN_X = 390;
const ORIGIN_Y = 128;

function formatShortTime(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}p` : `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const IsometricCropField: React.FC<IsometricCropFieldProps> = ({
  plots,
  playerLevel,
  now,
  farmTool,
  selectedSeed,
  isSeedPanelOpen = true,
  pendingPlotIndex = null,
  onPlotTap,
}) => {
  // Painter's algorithm sort: back-to-front by (row + col), then row
  const orderedPlots = useMemo(() => {
    return plots
      .map((plot) => {
        const [r, c] = PLOT_GRID_POS[plot.index] || [
          Math.floor(plot.index / 5),
          plot.index % 5,
        ];
        return { plot, r, c, depth: r + c };
      })
      .sort((a, b) => (a.depth !== b.depth ? a.depth - b.depth : a.r - b.r));
  }, [plots]);

  // First locked plot index to highlight with "MỞ RỘNG" signboard prominently
  const nextUnlockPlotIndex = useMemo(() => {
    const locked = plots.filter((p) => playerLevel < getPlotUnlockLevel(p.index));
    if (locked.length === 0) return -1;
    locked.sort((a, b) => getPlotUnlockLevel(a.index) - getPlotUnlockLevel(b.index));
    return locked[0].index;
  }, [plots, playerLevel]);

  return (
    <svg
      viewBox="0 0 780 470"
      className="w-full h-full select-none touch-manipulation"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Cánh đồng nông trại 25 ô đất 5x5"
    >
      <defs>
        <linearGradient id="farmMeadowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#99e22f" />
          <stop offset="55%" stopColor="#75c51c" />
          <stop offset="100%" stopColor="#58a311" />
        </linearGradient>
        <linearGradient id="soilDryTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8d5528" />
          <stop offset="100%" stopColor="#6b3e1b" />
        </linearGradient>
        <linearGradient id="soilWetTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#593215" />
          <stop offset="100%" stopColor="#3f210c" />
        </linearGradient>
        <linearGradient id="grassLockedTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#86d333" />
          <stop offset="100%" stopColor="#64af20" />
        </linearGradient>
      </defs>

      {/* Lush Sunny Meadow Background */}
      <rect x="0" y="0" width="780" height="470" fill="url(#farmMeadowGrad)" />

      {/* Subtle sunlit meadow patches */}
      <ellipse cx="145" cy="140" rx="135" ry="52" fill="#a8eb3b" opacity="0.45" />
      <ellipse cx="645" cy="220" rx="125" ry="48" fill="#a8eb3b" opacity="0.38" />
      <ellipse cx="220" cy="405" rx="160" ry="50" fill="#4f950f" opacity="0.28" />

      {/* Decorative rustic twig campfire / woodpile upper-left matching classic farm */}
      <g transform="translate(155, 44)" opacity="0.9">
        <ellipse cx="0" cy="8" rx="28" ry="10" fill="#4b8d10" opacity="0.55" />
        <line x1="-18" y1="2" x2="18" y2="12" stroke="#6b3e1b" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="-15" y1="12" x2="16" y2="0" stroke="#7c4a21" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="-2" y1="-6" x2="2" y2="15" stroke="#5a3214" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Cozy Straw-Roofed Guard Hut in Upper-Right Lawn */}
      <g transform="translate(650, 26)">
        {/* Shadow */}
        <ellipse cx="38" cy="68" rx="46" ry="15" fill="#3a710a" opacity="0.45" />
        {/* Side woodpile */}
        <g transform="translate(66, 48)">
          <line x1="-8" y1="8" x2="18" y2="2" stroke="#6d411c" strokeWidth="4" strokeLinecap="round" />
          <line x1="-6" y1="13" x2="20" y2="7" stroke="#533012" strokeWidth="4" strokeLinecap="round" />
          <line x1="-4" y1="4" x2="16" y2="12" stroke="#855125" strokeWidth="3.5" strokeLinecap="round" />
        </g>
        {/* Hut Walls */}
        <polygon points="10,32 42,24 66,34 66,64 42,72 10,62" fill="#7c4c26" stroke="#3c1e08" strokeWidth="2" />
        <polygon points="42,24 66,34 66,64 42,72" fill="#5e3719" stroke="#3c1e08" strokeWidth="2" />
        {/* Dark Arched Doorway */}
        <path d="M 19,65 L 19,47 Q 26,38 33,47 L 33,69 Z" fill="#1b0d04" stroke="#3c1e08" strokeWidth="1.5" />
        {/* Thatched Straw Roof */}
        <path
          d="M 2,36 Q 38,-6 74,34 Q 56,42 38,38 Q 18,42 2,36 Z"
          fill="#c49448"
          stroke="#5c3814"
          strokeWidth="2.2"
        />
        <path d="M 14,31 Q 38,8 62,31" fill="none" stroke="#9e712e" strokeWidth="2" />
        <path d="M 22,22 Q 38,6 54,22" fill="none" stroke="#d8ab5f" strokeWidth="1.6" />
        {/* Tiny green bush behind hut */}
        <circle cx="4" cy="54" r="9" fill="#4f9919" />
        <circle cx="11" cy="58" r="7" fill="#62b422" />
      </g>

      {/* Grass border framing the 5x5 isometric field */}
      <polygon
        points={`
          ${ORIGIN_X},${ORIGIN_Y - 10}
          ${ORIGIN_X + 5 * (TILE_W / 2) + 12},${ORIGIN_Y + 5 * (TILE_H / 2)}
          ${ORIGIN_X},${ORIGIN_Y + 5 * TILE_H + 10}
          ${ORIGIN_X - 5 * (TILE_W / 2) - 12},${ORIGIN_Y + 5 * (TILE_H / 2)}
        `}
        fill="#44820c"
        opacity="0.35"
      />

      {/* 25 Isometric Plots (Painter's order back-to-front) */}
      {orderedPlots.map(({ plot, r, c }) => {
        const reqLevel = getPlotUnlockLevel(plot.index);
        const isLocked = playerLevel < reqLevel;
        const seed = plot.seedId ? CROP_SEED_MAP[plot.seedId] : null;
        const progress = plot.seedId ? computePlotProgress(plot, now) : null;

        // Top vertex of diamond (r, c)
        const tx = ORIGIN_X + (c - r) * (TILE_W / 2);
        const ty = ORIGIN_Y + (c + r) * (TILE_H / 2);
        const cx = tx;
        const cy = ty + TILE_H / 2;

        // Diamond 4 vertices (slightly inset by 2px for crisp tile groove)
        const inset = 2;
        const top = `${tx},${ty + inset}`;
        const right = `${tx + TILE_W / 2 - inset * 1.6},${ty + TILE_H / 2}`;
        const bottom = `${tx},${ty + TILE_H - inset}`;
        const left = `${tx - TILE_W / 2 + inset * 1.6},${ty + TILE_H / 2}`;

        // 3D beveled side skirt (gives raised mound feel)
        const depthH = 7;
        const leftSkirt = `${tx - TILE_W / 2 + inset * 1.6},${ty + TILE_H / 2} ${tx},${ty + TILE_H - inset} ${tx},${ty + TILE_H - inset + depthH} ${tx - TILE_W / 2 + inset * 1.6},${ty + TILE_H / 2 + depthH}`;
        const rightSkirt = `${tx},${ty + TILE_H - inset} ${tx + TILE_W / 2 - inset * 1.6},${ty + TILE_H / 2} ${tx + TILE_W / 2 - inset * 1.6},${ty + TILE_H / 2 + depthH} ${tx},${ty + TILE_H - inset + depthH}`;

        if (isLocked) {
          const showSign =
            plot.index === nextUnlockPlotIndex ||
            plot.index === 5 ||
            plot.index === 13 ||
            plot.index === 24;
          return (
            <g
              key={plot.index}
              onClick={() => onPlotTap(plot, true)}
              className="cursor-not-allowed"
            >
              <polygon points={leftSkirt} fill="#4d8a14" />
              <polygon points={rightSkirt} fill="#3c6f0d" />
              <polygon
                points={`${top} ${right} ${bottom} ${left}`}
                fill="url(#grassLockedTop)"
                stroke="#4b8913"
                strokeWidth="1.5"
              />
              {/* Subtle meadow grass blades */}
              <path
                d={`M ${cx - 12},${cy + 4} l -3,-7 m 3,7 l 2,-8 m 3,8 l 4,-6`}
                stroke="#4d8f13"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.7"
              />
              {showSign ? (
                <g transform={`translate(${cx}, ${cy - 4})`}>
                  {/* Tuft at base */}
                  <path d="M -9,6 Q -5,-2 0,6 Q 5,-2 9,6" fill="#4f9414" />
                  {/* Wooden post */}
                  <rect x="-2.5" y="-12" width="5" height="17" fill="#7c4b21" stroke="#3c1e08" strokeWidth="1" />
                  {/* Wooden board "MỞ RỘNG" */}
                  <polygon
                    points="-22,-27 22,-27 19,-11 -19,-11"
                    fill="#d7a063"
                    stroke="#5c3618"
                    strokeWidth="1.6"
                  />
                  <text
                    x="0"
                    y="-19.5"
                    textAnchor="middle"
                    fontSize="6.8"
                    fontWeight="800"
                    fill="#4a280d"
                  >
                    MỞ RỘNG
                  </text>
                  <text
                    x="0"
                    y="-12.5"
                    textAnchor="middle"
                    fontSize="6.4"
                    fontWeight="800"
                    fill="#78350f"
                  >
                    Lv.{reqLevel}
                  </text>
                </g>
              ) : (
                <text
                  x={cx}
                  y={cy + 3}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="800"
                  fill="#295207"
                  opacity="0.75"
                >
                  🔒 Lv.{reqLevel}
                </text>
              )}
            </g>
          );
        }

        // Unlocked plot (empty or planted)
        const isWet = Boolean(plot.seedId && plot.watered);
        const isReady = Boolean(progress?.isReady);
        const isPendingTarget = pendingPlotIndex === plot.index && !plot.seedId;
        const isPlantHoverable = !plot.seedId && farmTool === 'plant';
        const isUprootTarget = Boolean(plot.seedId && farmTool === 'uproot');

        return (
          <g
            key={plot.index}
            onClick={() => onPlotTap(plot, false)}
            className="cursor-pointer group"
          >
            {/* Raised 3D Soil Skirts */}
            <polygon points={leftSkirt} fill={isWet ? '#361b08' : '#573114'} />
            <polygon points={rightSkirt} fill={isWet ? '#261205' : '#43230c'} />

            {/* Tilled Soil Diamond Surface */}
            <polygon
              points={`${top} ${right} ${bottom} ${left}`}
              fill={isWet ? 'url(#soilWetTop)' : 'url(#soilDryTop)'}
              stroke={
                isReady || isPendingTarget
                  ? '#facc15'
                  : isUprootTarget
                  ? '#fb7185'
                  : isPlantHoverable
                  ? '#b87f47'
                  : '#3e210b'
              }
              strokeWidth={isReady || isUprootTarget || isPendingTarget ? '2.6' : '1.5'}
            />

            {/* Plowed Furrow Lines inside soil */}
            <g stroke={isWet ? '#2d1607' : '#542f12'} strokeWidth="1.4" opacity="0.65">
              <line x1={cx - 24} y1={cy + 2} x2={cx + 2} y2={cy - 11} />
              <line x1={cx - 14} y1={cy + 8} x2={cx + 14} y2={cy - 6} />
              <line x1={cx - 2} y1={cy + 13} x2={cx + 24} y2={cy} />
            </g>

            {/* Empty Plot Affordance */}
            {!seed && (
              <g opacity={farmTool === 'plant' ? 0.92 : 0.45}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="10"
                  fill="#a66f3e"
                  stroke="#f3d5a5"
                  strokeWidth="1.2"
                  opacity="0.7"
                />
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="900"
                  fill="#fff7e6"
                >
                  {farmTool === 'plant' ? '+' : '·'}
                </text>
              </g>
            )}

            {/* Planted Crop Graphic */}
            {seed && progress && (
              <>
                {/* Rich dirt mound around plant stem */}
                <ellipse
                  cx={cx}
                  cy={cy + 3}
                  rx="20"
                  ry="8"
                  fill={isWet ? '#2b1406' : '#4a2910'}
                  opacity="0.85"
                />

                <IsometricCropPlant
                  seed={seed}
                  progressPct={progress.progressPct}
                  isReady={progress.isReady}
                  cx={cx}
                  cy={cy}
                />

                {/* Watered / Dry / Fertilizer indicator micro-badge */}
                {!progress.isReady && (
                  <g transform={`translate(${cx + 22}, ${cy - 4})`}>
                    <circle cx="0" cy="0" r="8" fill={plot.watered ? '#0284c7' : '#d97706'} stroke="#ffffff" strokeWidth="1.2" />
                    <text x="0" y="3" textAnchor="middle" fontSize="8">
                      {plot.watered ? '💧' : '☀️'}
                    </text>
                  </g>
                )}

                {plot.fertilizedCount > 0 && !progress.isReady && (
                  <g transform={`translate(${cx - 24}, ${cy - 4})`}>
                    <circle cx="0" cy="0" r="7.5" fill="#92400e" stroke="#fde68a" strokeWidth="1" />
                    <text x="0" y="3" textAnchor="middle" fontSize="7" fontWeight="800" fill="#fef3c7">
                      🧪{plot.fertilizedCount}
                    </text>
                  </g>
                )}

                {/* Harvestable "Thu hoạch" Star Label OR Growth Timer */}
                {progress.isReady ? (
                  <g transform={`translate(${cx}, ${cy - 46})`}>
                    <rect
                      x="-26"
                      y="-10"
                      width="52"
                      height="16"
                      rx="6"
                      fill="#15803d"
                      stroke="#fde047"
                      strokeWidth="1.4"
                    />
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      fontSize="8.2"
                      fontWeight="800"
                      fill="#fef9c3"
                    >
                      ⭐ Thu hoạch
                    </text>
                  </g>
                ) : (
                  <g transform={`translate(${cx}, ${cy + 14})`}>
                    <rect
                      x="-20"
                      y="-6"
                      width="40"
                      height="12"
                      rx="5"
                      fill="rgba(34, 18, 5, 0.86)"
                      stroke="#cfa06b"
                      strokeWidth="0.9"
                    />
                    <text
                      x="0"
                      y="2.5"
                      textAnchor="middle"
                      fontSize="7.8"
                      fontWeight="800"
                      fill="#fef3c7"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatShortTime(progress.remainingSec)}
                    </text>
                  </g>
                )}
              </>
            )}

            {/* Hover / Focus highlight ring */}
            {farmTool === 'plant' && !seed && (
              <polygon
                points={`${top} ${right} ${bottom} ${left}`}
                fill="#fde047"
                opacity="0"
                className="group-hover:opacity-25 transition-opacity duration-150"
              />
            )}
          </g>
        );
      })}

      {/* Tiny selected-seed legend badge at bottom-right of meadow */}
      <g transform="translate(642, 438)">
        <rect
          x="-118"
          y="-16"
          width="236"
          height="24"
          rx="8"
          fill="rgba(42, 22, 7, 0.8)"
          stroke="#c88d4b"
          strokeWidth="1.5"
        />
        <text x="0" y="-1" textAnchor="middle" fontSize="9.2" fontWeight="800" fill="#fef3c7">
          {farmTool === 'plant'
            ? isSeedPanelOpen
              ? `Đang gieo: ${selectedSeed.icon} ${selectedSeed.name} (${selectedSeed.seedPrice}₫)`
              : `🌱 Chạm ô đất trống để chọn hạt & gieo`
            : farmTool === 'water'
            ? '💧 Chế độ Tưới Nước (x2 tốc độ)'
            : farmTool === 'fertilize'
            ? '🧪 Chế độ Bón Phân (-50% thời gian)'
            : '🗑️ Nhổ Bỏ cây trồng nhầm'}
        </text>
      </g>
    </svg>
  );
};

// Multi-stage 2.5D isometric crop illustrations
const IsometricCropPlant: React.FC<{
  seed: CropSeed;
  progressPct: number;
  isReady: boolean;
  cx: number;
  cy: number;
}> = ({ seed, progressPct, isReady, cx, cy }) => {
  // Stage 0: Early seedling (< 33%)
  if (!isReady && progressPct < 33) {
    return (
      <g transform={`translate(${cx}, ${cy})`}>
        <path d="M 0,2 Q -1,-10 -8,-14 Q -2,-17 0,-8" fill="#65c924" stroke="#2d660c" strokeWidth="1.2" />
        <path d="M 0,2 Q 2,-11 9,-15 Q 3,-18 0,-8" fill="#7be032" stroke="#2d660c" strokeWidth="1.2" />
      </g>
    );
  }

  // Stage 1: Growing leafy plant (33%..99%)
  if (!isReady) {
    return (
      <g transform={`translate(${cx}, ${cy})`}>
        <path d="M -2,2 Q -18,-8 -20,-20 Q -6,-18 -1,-4" fill="#469e18" stroke="#245908" strokeWidth="1.3" />
        <path d="M 2,2 Q 18,-8 20,-20 Q 6,-18 1,-4" fill="#58b820" stroke="#245908" strokeWidth="1.3" />
        <path d="M 0,2 Q -8,-18 -4,-28 Q 4,-24 1,-2" fill="#68cf26" stroke="#245908" strokeWidth="1.3" />
        <path d="M 0,2 Q 9,-16 10,-26 Q 0,-22 -1,-2" fill="#7be032" stroke="#245908" strokeWidth="1.2" />
      </g>
    );
  }

  // Stage 2: Mature Harvestable Crops tailored to classic farm look
  switch (seed.id) {
    case 'seed_corn':
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          {/* Broad sweeping corn leaves */}
          <path d="M -2,2 Q -22,-6 -24,-22 Q -8,-18 -1,-4" fill="#3a8d14" stroke="#1f5308" strokeWidth="1.4" />
          <path d="M 2,2 Q 24,-6 25,-22 Q 8,-18 1,-4" fill="#4ba81b" stroke="#1f5308" strokeWidth="1.4" />
          <path d="M -2,-8 Q -24,-20 -26,-32 Q -9,-28 -1,-14" fill="#52b61e" stroke="#1f5308" strokeWidth="1.4" />
          <path d="M 2,-8 Q 24,-20 26,-32 Q 9,-28 1,-14" fill="#64cb26" stroke="#1f5308" strokeWidth="1.4" />
          {/* Stalk */}
          <rect x="-3" y="-34" width="6" height="36" rx="3" fill="#4ba81b" stroke="#1f5308" strokeWidth="1.3" />
          {/* Golden Corn Cob */}
          <ellipse cx="0" cy="-24" rx="5.5" ry="11" fill="#fde047" stroke="#ca8a04" strokeWidth="1.4" />
          <path d="M -6,-18 Q -4,-26 -1,-16 M 6,-18 Q 4,-26 1,-16" fill="#84cc16" stroke="#3f6212" strokeWidth="1" />
        </g>
      );

    case 'seed_lettuce':
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          {/* Outer green cabbage leaves */}
          <ellipse cx="-11" cy="-5" rx="10" ry="7" fill="#3e9616" stroke="#1e5307" strokeWidth="1.3" />
          <ellipse cx="11" cy="-5" rx="10" ry="7" fill="#4aad1b" stroke="#1e5307" strokeWidth="1.3" />
          {/* Pale crisp cabbage core */}
          <ellipse cx="0" cy="-12" rx="11" ry="13" fill="#dcfce7" stroke="#2f7d10" strokeWidth="1.5" />
          <path d="M -6,-20 Q 0,-12 -4,-2 M 6,-20 Q 0,-12 4,-2" fill="none" stroke="#86efac" strokeWidth="2" />
          <path d="M -10,-8 Q -12,-18 -4,-22 Q -2,-10 -8,-3 Z" fill="#52b820" stroke="#1e5307" strokeWidth="1.2" />
          <path d="M 10,-8 Q 12,-18 4,-22 Q 2,-10 8,-3 Z" fill="#65cc2a" stroke="#1e5307" strokeWidth="1.2" />
        </g>
      );

    case 'seed_onion':
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          {/* Tall spiky green shoots */}
          <path d="M -7,-4 Q -14,-24 -16,-36 M -5,-4 Q -8,-28 -6,-40" stroke="#52b820" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M 0,-4 Q -1,-28 2,-42 M 4,-4 Q 10,-26 13,-37" stroke="#65d028" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M 7,-4 Q 16,-20 20,-30" stroke="#429d17" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {/* Cluster of plump white/pearl bulbs just like screenshot */}
          <ellipse cx="-8" cy="-2" rx="6.5" ry="5.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />
          <ellipse cx="7" cy="-1" rx="6.5" ry="5.5" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.2" />
          <ellipse cx="0" cy="1" rx="7.5" ry="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.3" />
        </g>
      );

    case 'seed_carrot':
    case 'seed_potato':
    case 'seed_sweet_potato': {
      const tuberColor =
        seed.id === 'seed_carrot'
          ? '#f97316'
          : seed.id === 'seed_sweet_potato'
          ? '#a855f7'
          : '#d99a4e';
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          {/* Feathery green tops */}
          <path d="M 0,-8 Q -12,-24 -16,-32 M 0,-8 Q -2,-28 0,-36 M 0,-8 Q 12,-24 16,-32" stroke="#46a318" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Root vegetable peeking out of soil */}
          <ellipse cx="-5" cy="-2" rx="6" ry="7" fill={tuberColor} stroke="#7c2d12" strokeWidth="1.3" />
          <ellipse cx="6" cy="-1" rx="6" ry="6.5" fill={tuberColor} stroke="#7c2d12" strokeWidth="1.3" />
        </g>
      );
    }

    case 'seed_wheat':
    case 'seed_grass':
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          {[-12, -5, 2, 9].map((dx, i) => (
            <g key={i} transform={`translate(${dx}, 0)`}>
              <path d={`M 0,2 Q ${dx * 0.4},-18 ${dx * 0.5},-34`} stroke={seed.id === 'seed_wheat' ? '#ca8a04' : '#3f9614'} strokeWidth="2.4" fill="none" />
              <ellipse
                cx={dx * 0.5}
                cy="-33"
                rx="3.2"
                ry="7"
                fill={seed.id === 'seed_wheat' ? '#facc15' : '#70d62c'}
                stroke={seed.id === 'seed_wheat' ? '#854d0e' : '#245908'}
                strokeWidth="1"
              />
            </g>
          ))}
        </g>
      );

    case 'seed_sunflower':
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          <path d="M 0,2 L 0,-30" stroke="#3f9614" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="-9" cy="-13" rx="8" ry="4" fill="#52b820" stroke="#245908" strokeWidth="1" />
          <ellipse cx="9" cy="-17" rx="8" ry="4" fill="#52b820" stroke="#245908" strokeWidth="1" />
          <circle cx="0" cy="-32" r="13" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          <circle cx="0" cy="-32" r="6.5" fill="#713f12" />
        </g>
      );

    case 'seed_pumpkin':
    case 'seed_watermelon':
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          <path d="M -18,2 Q -10,-12 0,-6 Q 12,-14 20,2" fill="none" stroke="#3d9116" strokeWidth="2.6" />
          <ellipse
            cx="0"
            cy="-6"
            rx="15"
            ry="11"
            fill={seed.id === 'seed_pumpkin' ? '#f97316' : '#16a34a'}
            stroke={seed.id === 'seed_pumpkin' ? '#9a3412' : '#14532d'}
            strokeWidth="1.6"
          />
          {seed.id === 'seed_pumpkin' ? (
            <path d="M -5,-17 L -5,5 M 5,-17 L 5,5 M 0,-18 L 0,-22" stroke="#9a3412" strokeWidth="1.5" />
          ) : (
            <path d="M -7,-16 Q -4,-6 -7,4 M 0,-17 Q 2,-6 0,5 M 7,-16 Q 9,-6 7,4" stroke="#86efac" strokeWidth="1.8" fill="none" />
          )}
        </g>
      );

    default:
      // Lush fruiting bush / vine with the crop's fruit icon cleanly showcased on top
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          <path d="M -2,2 Q -20,-6 -22,-22 Q -6,-18 -1,-4" fill="#3a9215" stroke="#1e5307" strokeWidth="1.3" />
          <path d="M 2,2 Q 20,-6 22,-22 Q 6,-18 1,-4" fill="#4eb31c" stroke="#1e5307" strokeWidth="1.3" />
          <circle cx="-8" cy="-16" r="10" fill="#4aa61a" stroke="#1e5307" strokeWidth="1.2" />
          <circle cx="8" cy="-16" r="10" fill="#59be22" stroke="#1e5307" strokeWidth="1.2" />
          <circle cx="0" cy="-22" r="11" fill="#65cf28" stroke="#1e5307" strokeWidth="1.2" />
          <text x="0" y="-15" textAnchor="middle" fontSize="18">
            {seed.icon}
          </text>
        </g>
      );
  }
};

export { CROP_SEEDS };
