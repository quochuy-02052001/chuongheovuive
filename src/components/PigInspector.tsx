import React from 'react';
import { Archive, Heart, Pill, Sparkles, Utensils, X } from 'lucide-react';
import { BREED_MAP, PIG_BREEDS, RARITY_LABELS } from '../data/pigBreeds';
import { PigInstance } from '../types/game';
import { PigSprite } from './PigSprite';

interface PigInspectorProps {
  pig: PigInstance;
  isNeighborMode: boolean;
  neighborPigCount?: number;
  stealsRemaining?: number;
  feedCount: number;
  deluxeFeedCount: number;
  medCount: number;
  vitaminCount: number;
  onClose: () => void;
  onFeed: (pigId: string, deluxe?: boolean) => void;
  onPet: (pigId: string) => void;
  onHeal: (pigId: string) => void;
  onVitamin: (pigId: string) => void;
  onSell: (pigId: string) => void;
  onStorePig?: (pigId: string) => void;
  onStealPig?: (pigId: string) => void;
}

export const PigInspector: React.FC<PigInspectorProps> = ({
  pig,
  isNeighborMode,
  neighborPigCount = 2,
  stealsRemaining = 2,
  feedCount,
  deluxeFeedCount,
  medCount,
  vitaminCount,
  onClose,
  onFeed,
  onPet,
  onHeal,
  onVitamin,
  onSell,
  onStorePig,
  onStealPig,
}) => {
  const breed = BREED_MAP[pig.breedId] || PIG_BREEDS[0];
  const rarity = RARITY_LABELS[breed.rarity];
  const isAdult = pig.growth >= 100;
  const isMaxHappy = Math.round(pig.happiness) >= 100;
  const sellPrice = isAdult
    ? Math.round(breed.sellPrice * (0.85 + (pig.happiness / 100) * 0.35))
    : Math.round(breed.sellPrice * 0.25);

  const stageLabel =
    pig.stage === 'adult' ? 'Trưởng Thành' : pig.stage === 'teen' ? 'Heo Choai' : 'Heo Con';

  return (
    <div
      style={{ right: 'max(0.5rem, env(safe-area-inset-right, 0px))' }}
      className="absolute top-11 sm:top-16 z-40 w-[268px] sm:w-[320px] max-h-[calc(100dvh-145px)] sm:max-h-[calc(100dvh-190px)] overflow-y-auto farm-scroll parchment-panel rounded-2xl p-3 sm:p-3.5 shadow-2xl"
    >
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#78471e]/20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#fef3c7] border border-[#b47b44] flex items-center justify-center shrink-0">
            <PigSprite breedId={pig.breedId} stage={pig.stage} isSick={pig.isSick} size={46} />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-extrabold text-sm sm:text-base text-[#3c1e08] truncate">
              {pig.nickname}
            </h3>
            <div className="text-[11px] sm:text-xs text-[#6d411c] font-semibold">
              {breed.name} · {stageLabel}
            </div>
            <span
              className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5"
              style={{ color: rarity.color, backgroundColor: rarity.bg }}
            >
              {rarity.label}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thông tin heo"
          className="w-7 h-7 rounded-lg bg-[#d99b52] hover:bg-[#c8873c] text-[#3c1e08] flex items-center justify-center cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stat Bars */}
      <div className="py-2 space-y-1.5 sm:space-y-2">
        <StatBar label="Độ No" value={pig.hunger} color="bg-amber-500" />
        <StatBar label="Nước Uống" value={pig.thirst} color="bg-sky-500" />
        <StatBar label="Vui Vẻ" value={pig.happiness} color="bg-rose-500" />
        <StatBar
          label="Trưởng Thành"
          value={pig.growth}
          color={isAdult ? 'bg-emerald-500' : 'bg-violet-500'}
        />
      </div>

      {pig.isSick && (
        <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold">
          Bé heo đang bị ốm! Hãy cho uống Thuốc Bổ ngay.
        </div>
      )}

      {/* Actions */}
      {isNeighborMode ? (
        <div className="pt-1 space-y-1.5">
          <button
            type="button"
            disabled={isMaxHappy}
            onClick={() => onPet(pig.id)}
            className="w-full py-2 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:bg-stone-300 disabled:text-stone-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Heart className="w-4 h-4" />
            {isMaxHappy ? 'Vui Vẻ Đạt 100% Rồi' : 'Vuốt Ve Heo Hàng Xóm (+10 ₫)'}
          </button>

          {onStealPig && (
            <button
              type="button"
              disabled={stealsRemaining <= 0 || neighborPigCount <= 1}
              onClick={() => onStealPig(pig.id)}
              className="w-full py-2 rounded-xl bg-violet-700 hover:bg-violet-600 disabled:bg-stone-300 disabled:text-stone-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>🥷</span>
              <span>
                {neighborPigCount <= 1
                  ? 'Chỉ còn 1 heo cuối (Không thể trộm)'
                  : stealsRemaining <= 0
                  ? 'Hết lượt trộm hôm nay (0/2)'
                  : `Trộm Bé Heo Này (Còn ${stealsRemaining}/2)`}
              </span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            type="button"
            disabled={feedCount === 0}
            onClick={() => onFeed(pig.id, false)}
            className="py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-stone-300 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5" /> Cám ({feedCount})
          </button>
          <button
            type="button"
            disabled={deluxeFeedCount === 0}
            onClick={() => onFeed(pig.id, true)}
            className="py-1.5 px-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-stone-300 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Bánh ({deluxeFeedCount})
          </button>
          <button
            type="button"
            disabled={isMaxHappy}
            onClick={() => onPet(pig.id)}
            className="py-1.5 px-2 rounded-lg bg-rose-500 hover:bg-rose-400 disabled:bg-stone-300 disabled:text-stone-600 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5" /> {isMaxHappy ? 'Vui 100%' : 'Vuốt Ve'}
          </button>
          {pig.isSick ? (
            <button
              type="button"
              disabled={medCount === 0}
              onClick={() => onHeal(pig.id)}
              className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Pill className="w-3.5 h-3.5" /> Chữa ({medCount})
            </button>
          ) : (
            <button
              type="button"
              disabled={vitaminCount === 0 || isAdult}
              onClick={() => onVitamin(pig.id)}
              className="py-1.5 px-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-stone-300 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Vitamin ({vitaminCount})
            </button>
          )}
          {onStorePig && (
            <button
              type="button"
              onClick={() => onStorePig(pig.id)}
              className="py-2 px-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer mt-0.5"
            >
              <Archive className="w-3.5 h-3.5" /> Cất Vào Túi
            </button>
          )}
          <button
            type="button"
            onClick={() => onSell(pig.id)}
            className={`${
              onStorePig ? '' : 'col-span-2'
            } py-2 px-2 rounded-xl text-xs font-extrabold text-white cursor-pointer mt-0.5 ${
              isAdult
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-sm'
                : 'bg-stone-500 hover:bg-stone-400'
            }`}
          >
            {isAdult ? `Bán (+${sellPrice}₫)` : `Bán Non (+${sellPrice}₫)`}
          </button>
        </div>
      )}
    </div>
  );
};

const StatBar: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div>
    <div className="flex items-center justify-between text-[11px] font-bold text-[#5c3618] mb-0.5">
      <span>{label}</span>
      <span className="font-mono-nums">{Math.round(value)}%</span>
    </div>
    <div className="w-full h-2 rounded-full bg-[#e5cfa8] overflow-hidden border border-[#c29b68]/50">
      <div
        className={`h-full ${color} transition-all duration-300`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  </div>
);
