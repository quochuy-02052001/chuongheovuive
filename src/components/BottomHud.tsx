import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Gift,
  Lock,
  Search,
  Settings,
} from 'lucide-react';
import { PIG_BREEDS } from '../data/pigBreeds';
import { NeighborFarm, ToolMode } from '../types/game';
import { PigSprite } from './PigSprite';

interface BottomHudProps {
  pigCount: number;
  barnCapacity: number;
  storedPigCount?: number;
  unlockedBreeds: string[];
  activeTool: ToolMode;
  feedCount: number;
  medCount: number;
  neighbors: NeighborFarm[];
  visitingNeighborId: string | null;
  p2pConnected?: boolean;
  hasUnclaimedQuest: boolean;
  hasUnclaimedAchievement?: boolean;
  canClaimDailyGift: boolean;
  onSelectTool: (tool: ToolMode) => void;
  onOpenShop: () => void;
  onOpenInventory: () => void;
  onOpenDex: () => void;
  onOpenAchievements: () => void;
  onOpenQuests: () => void;
  onOpenBreeding: () => void;
  onOpenSettings: () => void;
  onClaimDailyGift: () => void;
  onVisitNeighbor: (neighborId: string | null) => void;
  onInviteNeighbor: () => void;
}

export const BottomHud: React.FC<BottomHudProps> = ({
  pigCount,
  barnCapacity,
  storedPigCount = 0,
  unlockedBreeds,
  activeTool,
  feedCount,
  medCount,
  neighbors,
  visitingNeighborId,
  p2pConnected = false,
  hasUnclaimedQuest,
  hasUnclaimedAchievement = false,
  canClaimDailyGift,
  onSelectTool,
  onOpenShop,
  onOpenInventory,
  onOpenDex,
  onOpenAchievements,
  onOpenQuests,
  onOpenBreeding,
  onOpenSettings,
  onClaimDailyGift,
  onVisitNeighbor,
  onInviteNeighbor,
}) => {
  const [neighborOffset, setNeighborOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  const filteredNeighbors = searchQuery.trim()
    ? neighbors.filter(
        (n) =>
          n.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : neighbors;

  const visibleNeighbors = filteredNeighbors.slice(neighborOffset, neighborOffset + 3);
  const inviteSlotsCount = Math.max(0, 5 - visibleNeighbors.length);

  const handlePrevNeighbors = () => {
    setNeighborOffset((prev) => Math.max(0, prev - 1));
  };

  const handleNextNeighbors = () => {
    setNeighborOffset((prev) =>
      prev + 3 < filteredNeighbors.length ? prev + 1 : prev
    );
  };

  return (
    <div className="relative z-30 w-full select-none safe-bottom safe-x bg-[#4a280d]">
      {/* Main Bottom Console */}
      <div className="flex items-end w-full">
        {/* BOTTOM-LEFT: Wooden Pig Collection Cabinet */}
        <div className="landscape-compact-cabinet relative shrink-0 w-[84px] sm:w-[185px] md:w-[230px]">
          {/* Arched 28-breed collection counter tab */}
          <button
            type="button"
            onClick={onOpenDex}
            title={`Sổ Tay Giống Heo: ${unlockedBreeds.length}/${PIG_BREEDS.length} · Chuồng: ${pigCount}/${barnCapacity}`}
            className="absolute -top-5 sm:-top-7 [@media(max-height:500px)]:-top-5 left-1/2 -translate-x-1/2 z-10 px-2 sm:px-4 [@media(max-height:500px)]:px-2 py-0.5 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b from-[#d99b52] to-[#a96b30] border-2 sm:border-3 border-b-0 border-[#4a280d] shadow-md cursor-pointer hover:brightness-105 transition"
          >
            <div className="px-1.5 sm:px-2.5 [@media(max-height:500px)]:px-1.5 py-0.5 rounded-full bg-[#fff5d6] border border-[#8b5a2b] text-[#4a280d] font-mono-nums font-extrabold text-[10px] sm:text-xs [@media(max-height:500px)]:text-[10px] whitespace-nowrap">
              {unlockedBreeds.length}/{PIG_BREEDS.length}
            </div>
          </button>

          {/* Cabinet body */}
          <button
            type="button"
            onClick={onOpenDex}
            title={`Xem bộ sưu tập ${PIG_BREEDS.length} giống heo`}
            className="w-full wood-panel rounded-tr-xl p-1 sm:p-2 [@media(max-height:500px)]:p-1 text-left cursor-pointer hover:brightness-105 transition focus:outline-none flex flex-col justify-center items-center"
          >
            {/* Mobile & Short Landscape compact view */}
            <div className="sm:hidden [@media(max-height:500px)]:flex flex flex-col items-center justify-center p-1 w-full bg-[#3a1f0c]/85 rounded-lg border border-[#2a1506] py-1.5 [@media(max-height:500px)]:py-1">
              <div className="flex items-center -space-x-1.5 mb-1">
                {unlockedBreeds.slice(0, 3).map((bId) => (
                  <div key={bId} className="w-5 h-5 rounded-full bg-[#fef3c7] border border-[#b47b44] flex items-center justify-center overflow-hidden shadow-xs">
                    <PigSprite breedId={bId} stage="piglet" size={17} />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-bold text-amber-200 leading-none">Sổ Giống</span>
            </div>

            {/* Desktop / tall tablet grid */}
            <div className="hidden sm:grid [@media(max-height:500px)]:!hidden grid-cols-7 gap-0.5 bg-[#3a1f0c]/85 p-1 sm:p-1.5 rounded-lg border border-[#2a1506] w-full">
              {PIG_BREEDS.slice(0, 28).map((breed) => {
                const isUnlocked = unlockedBreeds.includes(breed.id);
                return (
                  <div
                    key={breed.id}
                    className={`aspect-square rounded flex items-center justify-center ${
                      isUnlocked
                        ? 'bg-[#f5d7a3] border border-[#b47b44]'
                        : 'bg-[#5c3618] border border-[#3e220c]'
                    }`}
                  >
                    {isUnlocked ? (
                      <div className="scale-90">
                        <PigSprite breedId={breed.id} stage="adult" size={20} />
                      </div>
                    ) : (
                      <Lock className="w-2.5 h-2.5 text-amber-300/80" />
                    )}
                  </div>
                );
              })}
            </div>
          </button>
        </div>

        {/* RIGHT SIDE: Toolbar Shelf + Friends Strip */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Wooden Toolbar Shelf (Shop, Chest, Tools, Trophy, Notebook, Upgrade) */}
          <div className="relative flex items-end justify-start px-1 sm:px-3 [@media(max-height:500px)]:px-1.5 -mb-1 z-20 overflow-x-auto farm-scroll touch-pan-x overscroll-x-contain">
            <div className="flex items-end gap-1.5 sm:gap-2 [@media(max-height:500px)]:gap-1 px-1 sm:px-2 py-0.5 sm:py-1 [@media(max-height:500px)]:py-0 flex-nowrap shrink-0">
              {/* 1. Shop Stall ("Mới" badge) */}
              <ToolbarItem
                label="Cửa Hàng"
                badge="Mới"
                badgeColor="bg-amber-400 text-amber-950"
                onClick={onOpenShop}
              >
                <svg viewBox="0 0 52 46" className="w-8 h-8 sm:w-11 sm:h-10">
                  <ellipse cx="26" cy="41" rx="18" ry="3.5" fill="#2c1607" opacity="0.35" />
                  <polygon points="8,20 34,20 34,40 8,40" fill="#c27029" stroke="#451a03" strokeWidth="2.1" strokeLinejoin="round" />
                  <polygon points="34,20 45,16 45,35 34,40" fill="#92400e" stroke="#451a03" strokeWidth="2.1" strokeLinejoin="round" />
                  {/* Striped green/white canopy */}
                  <path d="M 4 21 L 12 8 L 40 8 L 48 21 Z" fill="#22c55e" stroke="#14532d" strokeWidth="2.1" strokeLinejoin="round" />
                  <path d="M 16 8 L 13 21 L 20 21 L 22 8 Z" fill="#f0fdf4" />
                  <path d="M 30 8 L 31 21 L 38 21 L 35 8 Z" fill="#f0fdf4" />
                  {/* Veggies on counter */}
                  <rect x="13" y="25" width="16" height="9" rx="2" fill="#fde68a" stroke="#78350f" strokeWidth="1.5" />
                  <circle cx="18" cy="24" r="3" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.1" />
                  <circle cx="24" cy="24" r="3" fill="#22c55e" stroke="#14532d" strokeWidth="1.1" />
                </svg>
              </ToolbarItem>

              {/* 2. Inventory Bag / Chest */}
              <ToolbarItem
                label="Túi Đồ"
                countBadge={storedPigCount > 0 ? storedPigCount : undefined}
                onClick={onOpenInventory}
              >
                <svg viewBox="0 0 52 46" className="w-8 h-8 sm:w-11 sm:h-10">
                  <ellipse cx="26" cy="41" rx="18" ry="3.5" fill="#2c1607" opacity="0.35" />
                  <polygon points="8,21 31,24 31,40 8,36" fill="#b91c1c" stroke="#450a0a" strokeWidth="2.1" strokeLinejoin="round" />
                  <polygon points="31,24 44,18 44,34 31,40" fill="#7f1d1d" stroke="#450a0a" strokeWidth="2.1" strokeLinejoin="round" />
                  <path d="M 8 21 Q 16 8 30 12 L 43 9 Q 46 14 44 18 L 31 24 Z" fill="#ef4444" stroke="#450a0a" strokeWidth="2.1" strokeLinejoin="round" />
                  <path d="M 14 14 L 14 37" stroke="#facc15" strokeWidth="3.8" strokeLinecap="round" />
                  <path d="M 26 13 L 26 39" stroke="#facc15" strokeWidth="3.8" strokeLinecap="round" />
                  <path d="M 38 11 L 38 36" stroke="#eab308" strokeWidth="3.4" strokeLinecap="round" />
                  <rect x="17" y="22" width="6.5" height="7" rx="1.8" fill="#fde047" stroke="#78350f" strokeWidth="1.4" />
                </svg>
              </ToolbarItem>

              {/* 3. Feed Tool */}
              <ToolbarItem
                label="Cho Ăn"
                active={activeTool === 'feed'}
                countBadge={feedCount}
                onClick={() => onSelectTool(activeTool === 'feed' ? 'hand' : 'feed')}
              >
                <svg viewBox="0 0 48 46" className="w-8 h-8 sm:w-10 sm:h-10">
                  <ellipse cx="24" cy="41" rx="14" ry="3.5" fill="#2c1607" opacity="0.32" />
                  <path d="M 14 15 C 9 23, 9 37, 15 39 Q 24 42 33 39 C 39 37, 39 23, 34 15 Z" fill="#e59a47" stroke="#5c2d0c" strokeWidth="2.1" strokeLinejoin="round" />
                  <path d="M 16 15 L 12 8 L 20 11 L 24 7 L 28 11 L 36 8 L 32 15 Z" fill="#f5b35d" stroke="#5c2d0c" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M 14 16 Q 24 18 34 16" stroke="#b91c1c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                  <circle cx="24" cy="27" r="6" fill="#fef3c7" stroke="#92400e" strokeWidth="1.4" />
                </svg>
              </ToolbarItem>

              {/* 4. Petting Gloves */}
              <ToolbarItem
                label="Vuốt Ve"
                active={activeTool === 'glove'}
                onClick={() => onSelectTool(activeTool === 'glove' ? 'hand' : 'glove')}
              >
                <svg viewBox="0 0 48 46" className="w-8 h-8 sm:w-10 sm:h-10">
                  <ellipse cx="24" cy="40" rx="16" ry="3.2" fill="#2c1607" opacity="0.3" />
                  <g transform="rotate(-14 18 24)">
                    <rect x="8" y="14" width="15" height="19" rx="7" fill="#ffffff" stroke="#475569" strokeWidth="2" />
                    <circle cx="7" cy="22" r="4" fill="#ffffff" stroke="#475569" strokeWidth="1.9" />
                    <path d="M 12 18 L 12 24 M 16 17 L 16 24 M 20 18 L 20 24" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
                  </g>
                  <g transform="rotate(14 31 24)">
                    <rect x="25" y="14" width="15" height="19" rx="7" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
                    <circle cx="41" cy="22" r="4" fill="#f8fafc" stroke="#475569" strokeWidth="1.9" />
                    <path d="M 29 18 L 29 24 M 33 17 L 33 24 M 37 18 L 37 24" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
                  </g>
                </svg>
              </ToolbarItem>

              {/* 5. Glossy 3D Medicine Capsules matching reference */}
              <ToolbarItem
                label="Thuốc"
                active={activeTool === 'medicine'}
                countBadge={medCount}
                onClick={() => onSelectTool(activeTool === 'medicine' ? 'hand' : 'medicine')}
              >
                <svg viewBox="0 0 48 46" className="w-8 h-8 sm:w-10 sm:h-10">
                  <ellipse cx="24" cy="40" rx="15" ry="3.2" fill="#2c1607" opacity="0.32" />
                  <g transform="rotate(-38 20 23)">
                    <rect x="11" y="10" width="12" height="24" rx="6" fill="#ef4444" stroke="#5e1212" strokeWidth="2" />
                    <path d="M 11 22 L 23 22 L 23 28 A 6 6 0 0 1 11 28 Z" fill="#facc15" stroke="#5e1212" strokeWidth="2" />
                    <line x1="14.5" y1="13.5" x2="14.5" y2="27" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
                  </g>
                  <g transform="rotate(28 31 25)">
                    <rect x="25" y="12" width="11.5" height="23" rx="5.7" fill="#ef4444" stroke="#5e1212" strokeWidth="2" />
                    <path d="M 25 23.5 L 36.5 23.5 L 36.5 29.2 A 5.7 5.7 0 0 1 25 29.2 Z" fill="#ffffff" stroke="#5e1212" strokeWidth="2" />
                    <line x1="28.2" y1="15" x2="28.2" y2="28" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
                  </g>
                </svg>
              </ToolbarItem>

              {/* 6. Cleaning Wooden Wheelbarrow matching reference */}
              <ToolbarItem
                label="Dọn Dẹp"
                active={activeTool === 'shovel'}
                onClick={() => onSelectTool(activeTool === 'shovel' ? 'hand' : 'shovel')}
              >
                <svg viewBox="0 0 50 46" className="w-8 h-8 sm:w-10 sm:h-10">
                  <ellipse cx="25" cy="41" rx="16" ry="3.2" fill="#2c1607" opacity="0.32" />
                  {/* Handles & frame */}
                  <line x1="11" y1="19" x2="36" y2="33" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="21" y1="30" x2="20" y2="39" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
                  {/* Wheelbarrow tub */}
                  <polygon points="15,17 34,12 42,22 25,31" fill="#e07a32" stroke="#4a2107" strokeWidth="2.1" strokeLinejoin="round" />
                  <polygon points="15,17 25,31 35,28 24,14" fill="#c25915" stroke="#4a2107" strokeWidth="2" strokeLinejoin="round" />
                  {/* Front wheel */}
                  <circle cx="37" cy="34" r="5.5" fill="#475569" stroke="#1e293b" strokeWidth="2" />
                  <circle cx="37" cy="34" r="2" fill="#cbd5e1" />
                </svg>
              </ToolbarItem>

              {/* 7. 3D Golden Trophy (Achievements) */}
              <ToolbarItem
                label="Thành Tựu"
                badge={hasUnclaimedAchievement ? '!' : undefined}
                badgeColor="bg-red-500 text-white"
                onClick={onOpenAchievements}
              >
                <svg viewBox="0 0 48 46" className="w-8 h-8 sm:w-10 sm:h-10">
                  <ellipse cx="24" cy="41" rx="13" ry="3" fill="#2c1607" opacity="0.32" />
                  <path d="M 13 13 Q 5 14 8 23 Q 11 26 16 23" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 35 13 Q 43 14 40 23 Q 37 26 32 23" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 13 10 L 35 10 L 31 26 Q 24 32 17 26 Z" fill="#facc15" stroke="#78350f" strokeWidth="2.1" strokeLinejoin="round" />
                  <path d="M 17 13 L 21 13 L 19 23 Z" fill="#fef9c3" opacity="0.7" />
                  <rect x="21" y="28" width="6" height="7" fill="#eab308" stroke="#78350f" strokeWidth="1.9" />
                  <rect x="14" y="34" width="20" height="6" rx="2.5" fill="#d97706" stroke="#78350f" strokeWidth="2" />
                </svg>
              </ToolbarItem>

              {/* 8. Open Quest Notebook & Pencil matching reference */}
              <ToolbarItem
                label="Nhiệm Vụ"
                badge={hasUnclaimedQuest ? '!' : undefined}
                badgeColor="bg-red-500 text-white"
                onClick={onOpenQuests}
              >
                <svg viewBox="0 0 50 46" className="w-8 h-8 sm:w-10 sm:h-10">
                  <ellipse cx="25" cy="41" rx="16" ry="3.2" fill="#2c1607" opacity="0.32" />
                  {/* Open cream book */}
                  <path d="M 7 15 Q 16 12 25 16 Q 34 12 43 15 L 41 36 Q 33 34 25 38 Q 17 34 9 36 Z" fill="#fef3c7" stroke="#78350f" strokeWidth="2.1" strokeLinejoin="round" />
                  <line x1="25" y1="16" x2="25" y2="38" stroke="#b45309" strokeWidth="1.6" />
                  <g stroke="#d97706" strokeWidth="1.5" opacity="0.75">
                    <line x1="12" y1="20" x2="21" y2="20" />
                    <line x1="12" y1="25" x2="21" y2="25" />
                    <line x1="12" y1="30" x2="19" y2="30" />
                    <line x1="28" y1="20" x2="38" y2="20" />
                    <line x1="28" y1="25" x2="38" y2="25" />
                  </g>
                  {/* Diagonal pencil */}
                  <g transform="rotate(24 33 19)">
                    <rect x="30" y="7" width="6" height="22" rx="1.5" fill="#f59e0b" stroke="#451a03" strokeWidth="1.6" />
                    <polygon points="30,29 36,29 33,35" fill="#fde68a" stroke="#451a03" strokeWidth="1.4" />
                  </g>
                </svg>
              </ToolbarItem>

              {/* 9. Beveled 3D Lavender Purple Up-Arrow matching reference */}
              <ToolbarItem label="Chuồng & Lai" onClick={onOpenBreeding}>
                <svg viewBox="0 0 48 46" className="w-8 h-8 sm:w-10 sm:h-10">
                  <ellipse cx="24" cy="41" rx="13" ry="3" fill="#2c1607" opacity="0.32" />
                  <polygon
                    points="24,8 40,23 32,23 32,38 16,38 16,23 8,23"
                    fill="#7c3aed"
                    stroke="#3b0764"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                  <polygon
                    points="24,6 39,20 31,20 31,35 17,35 17,20 9,20"
                    fill="#a78bfa"
                    stroke="#3b0764"
                    strokeWidth="2.1"
                    strokeLinejoin="round"
                  />
                  <polygon points="24,9 34,19 28,19 28,33 23,33" fill="#ddd6fe" opacity="0.55" />
                </svg>
              </ToolbarItem>
            </div>
          </div>

          {/* Wooden Shelf Divider + Friend / Neighbor Cards Strip */}
          <div className="wood-shelf px-2 sm:px-3 [@media(max-height:500px)]:px-1.5 py-1.5 [@media(max-height:500px)]:py-1 flex items-center gap-1.5 sm:gap-2">
            {/* Prev arrow */}
            <button
              type="button"
              onClick={handlePrevNeighbors}
              disabled={neighborOffset === 0}
              aria-label="Hàng xóm trước"
              className="w-7 h-16 [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-12 rounded-lg bg-[#d99b52] border-2 border-[#4a280d] flex items-center justify-center text-[#3c1e08] hover:brightness-110 disabled:opacity-40 cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-5 h-5 [@media(max-height:500px)]:w-4 [@media(max-height:500px)]:h-4" />
            </button>

            {/* Neighbor Cards + Invite Slots */}
            <div className="flex-1 flex items-center gap-1.5 sm:gap-2 overflow-x-auto farm-scroll py-0.5">
              {visibleNeighbors.map((neighbor) => {
                const isVisiting = visitingNeighborId === neighbor.id;
                const isLivePartner = Boolean(p2pConnected && neighbor.isPartner);
                const medalColor =
                  neighbor.rank === 1
                    ? 'bg-amber-400 text-amber-950 border-amber-700'
                    : neighbor.rank === 2
                    ? 'bg-slate-300 text-slate-900 border-slate-600'
                    : 'bg-orange-400 text-orange-950 border-orange-800';

                return (
                  <button
                    key={neighbor.id}
                    type="button"
                    onClick={() => onVisitNeighbor(isVisiting ? null : neighbor.id)}
                    title={`Bấm để ${isVisiting ? 'về chuồng của bạn' : `qua thăm chuồng ${neighbor.farmerName}`}`}
                    className={`landscape-compact-card relative shrink-0 w-[82px] sm:w-[94px] h-[82px] sm:h-[86px] rounded-lg border-2 p-1 flex flex-col items-center justify-between cursor-pointer transition-transform hover:-translate-y-0.5 ${
                      isVisiting
                        ? 'bg-emerald-100 border-emerald-600 ring-2 ring-emerald-400'
                        : neighbor.isPartner
                        ? 'bg-pink-50 border-pink-500 hover:bg-pink-100'
                        : neighbor.isRealFriend
                        ? 'bg-sky-50 border-sky-500 hover:bg-sky-100'
                        : 'bg-[#f6e3ba] border-[#5c3618] hover:bg-[#fff2d4]'
                    }`}
                  >
                    {isLivePartner ? (
                      <span
                        className="absolute -top-1.5 -right-1.5 px-1 py-0.5 rounded-full bg-emerald-500 border border-white text-[8px] font-extrabold text-white leading-none flex items-center gap-0.5 shadow"
                        title="Đang kết nối Live 2 máy"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-lime-200 animate-pulse" />
                        Live
                      </span>
                    ) : neighbor.isPartner ? (
                      <span
                        className="absolute -top-1.5 -right-1.5 text-xs leading-none drop-shadow"
                        title="Nông Trại Người Yêu"
                      >
                        💕
                      </span>
                    ) : neighbor.isRealFriend ? (
                      <span
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-sky-500 border border-white text-[9px] font-bold text-white flex items-center justify-center shadow"
                        title="Bạn Bè Thật"
                      >
                        ★
                      </span>
                    ) : null}

                    {isVisiting && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[8px] font-extrabold whitespace-nowrap shadow">
                        Đang thăm
                      </span>
                    )}

                    <div className="w-full text-[10px] font-extrabold text-[#4a280d] truncate text-center leading-tight">
                      {neighbor.farmerName}
                    </div>

                    {/* Farmer portrait */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-6 rounded bg-sky-100 border border-[#8b5a2b] flex items-center justify-center overflow-hidden">
                      <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-9 sm:h-9 [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-6">
                        <circle cx="20" cy="14" r="7" fill="#fde68a" stroke="#451a03" strokeWidth="1.8" />
                        <path d="M 13 13 Q 20 5 27 13" fill={neighbor.avatarHair} />
                        <circle cx="17.5" cy="14" r="1.2" fill="#1c1917" />
                        <circle cx="22.5" cy="14" r="1.2" fill="#1c1917" />
                        <path d="M 10 38 Q 10 23 20 23 Q 30 23 30 38 Z" fill={neighbor.avatarColor} stroke="#451a03" strokeWidth="1.8" />
                      </svg>
                    </div>

                    {/* Medal + Level row */}
                    <div className="w-full flex items-center justify-between px-0.5">
                      <span
                        className={`w-4 h-4 sm:w-5 sm:h-5 [@media(max-height:500px)]:w-4 [@media(max-height:500px)]:h-4 rounded-full border text-[9px] sm:text-[10px] font-extrabold flex items-center justify-center font-mono-nums ${medalColor}`}
                      >
                        {neighbor.isPartner ? '♥' : neighbor.rank}
                      </span>
                      <span className="px-1 sm:px-1.5 py-0.5 rounded bg-sky-500 text-white text-[9px] sm:text-[10px] font-extrabold font-mono-nums leading-none border border-sky-800">
                        Lv.{neighbor.level}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Invite / Add Friend slots matching screenshot's "?" cards */}
              {Array.from({ length: inviteSlotsCount }).map((_, idx) => (
                <button
                  key={`invite-${idx}`}
                  type="button"
                  onClick={onInviteNeighbor}
                  title="Kết bạn mới hoặc thêm hàng xóm để bấm là qua thăm"
                  className="landscape-compact-card shrink-0 w-[80px] sm:w-[90px] h-[82px] sm:h-[86px] rounded-lg bg-[#e2eff8] border-2 border-[#5c3618] p-1 flex flex-col items-center justify-between cursor-pointer hover:bg-[#f0f7fc] transition-transform hover:-translate-y-0.5"
                >
                  <div className="w-full flex-1 rounded bg-[#7c94a8] flex items-center justify-center relative">
                    <span className="font-display text-xl sm:text-2xl [@media(max-height:500px)]:text-lg font-extrabold text-white drop-shadow">?</span>
                  </div>
                  <div className="w-full mt-1 [@media(max-height:500px)]:mt-0.5 py-0.5 rounded bg-[#ef4444] text-white text-[9px] sm:text-[10px] font-extrabold text-center border border-[#7f1d1d] whitespace-nowrap">
                    Kết Bạn
                  </div>
                </button>
              ))}
            </div>

            {/* Next arrow */}
            <button
              type="button"
              onClick={handleNextNeighbors}
              disabled={neighborOffset + 3 >= filteredNeighbors.length}
              aria-label="Hàng xóm tiếp theo"
              className="w-7 h-16 [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-12 rounded-lg bg-[#d99b52] border-2 border-[#4a280d] flex items-center justify-center text-[#3c1e08] hover:brightness-110 disabled:opacity-40 cursor-pointer shrink-0"
            >
              <ChevronRight className="w-5 h-5 [@media(max-height:500px)]:w-4 [@media(max-height:500px)]:h-4" />
            </button>

            {/* Right Utility Column: Search, Settings, Gift Box */}
            <div className="flex flex-col items-end gap-1.5 [@media(max-height:500px)]:gap-1 shrink-0 pl-1">
              <div className="flex items-center gap-1.5">
                {showSearchInput && (
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setNeighborOffset(0);
                    }}
                    placeholder="Tìm tên..."
                    className="w-24 px-2 py-0.5 rounded bg-[#fff9ea] border border-[#4a280d] text-xs text-[#3c1e08] focus:outline-none"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setShowSearchInput((v) => !v)}
                  title="Tìm kiếm hàng xóm"
                  className="w-8 h-7 [@media(max-height:500px)]:w-7 [@media(max-height:500px)]:h-6 rounded bg-[#e8ba78] border-2 border-[#4a280d] flex items-center justify-center text-[#4a280d] hover:brightness-105 cursor-pointer"
                >
                  <Search className="w-4 h-4 [@media(max-height:500px)]:w-3.5 [@media(max-height:500px)]:h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  title="Cài đặt & Lưu trữ Local/Online"
                  className="w-8 h-7 [@media(max-height:500px)]:w-7 [@media(max-height:500px)]:h-6 rounded bg-[#e8ba78] border-2 border-[#4a280d] flex items-center justify-center text-[#4a280d] hover:brightness-105 cursor-pointer"
                >
                  <Settings className="w-4 h-4 [@media(max-height:500px)]:w-3.5 [@media(max-height:500px)]:h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={onClaimDailyGift}
                title={canClaimDailyGift ? 'Nhận Quà Hàng Ngày!' : 'Đã nhận quà hôm nay'}
                className={`relative w-12 h-11 [@media(max-height:500px)]:w-10 [@media(max-height:500px)]:h-8 rounded-xl border-2 border-[#4a280d] flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
                  canClaimDailyGift
                    ? 'bg-gradient-to-b from-amber-300 to-amber-500 animate-bounce'
                    : 'bg-[#d99b52] opacity-85'
                }`}
              >
                <Gift className="w-6 h-6 [@media(max-height:500px)]:w-4.5 [@media(max-height:500px)]:h-4.5 text-red-700" />
                {canClaimDailyGift && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                    1
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToolbarItemProps {
  label: string;
  active?: boolean;
  badge?: string;
  badgeColor?: string;
  countBadge?: number;
  onClick: () => void;
  children: React.ReactNode;
}

const ToolbarItem: React.FC<ToolbarItemProps> = ({
  label,
  active = false,
  badge,
  badgeColor = 'bg-amber-400 text-amber-950',
  countBadge,
  onClick,
  children,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-end px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-xl transition-transform cursor-pointer focus:outline-none shrink-0 min-w-[46px] sm:min-w-[56px] select-none ${
        active
          ? 'bg-amber-300/90 ring-2 ring-amber-500 -translate-y-1 sm:-translate-y-1.5 shadow-lg'
          : 'hover:-translate-y-0.5 active:scale-95'
      }`}
    >
      {badge && (
        <span
          className={`absolute -top-1.5 -right-0.5 px-1 sm:px-1.5 py-0.2 rounded-full text-[8px] sm:text-[9px] font-extrabold border border-[#4a280d] shadow-sm leading-tight z-10 ${badgeColor}`}
        >
          {badge}
        </span>
      )}
      {typeof countBadge === 'number' && (
        <span className="absolute -top-1.5 -right-0.5 px-1.5 py-0.2 rounded-full bg-[#4a280d] text-amber-100 text-[8px] sm:text-[9px] font-mono-nums font-bold leading-tight border border-amber-300/70 z-10 shadow-xs">
          {countBadge}
        </span>
      )}
      <div className="drop-shadow-md flex items-center justify-center [@media(max-height:500px)]:scale-90">{children}</div>
      <span className="mt-0.5 px-1 sm:px-1.5 py-0.5 rounded bg-[#4a280d]/85 text-amber-50 text-[9px] sm:text-[10px] font-bold leading-none whitespace-nowrap">
        {label}
      </span>
    </button>
  );
};
