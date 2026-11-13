import React, { useState, useEffect } from 'react';
import {
  Archive,
  Award,
  Check,
  Coins,
  Download,
  Heart,
  HelpCircle,
  Lock,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  BREEDING_RECIPES,
  BREED_MAP,
  PIG_BREEDS,
  RARITY_LABELS,
  SHOP_SUPPLIES,
} from '../data/pigBreeds';
import { AchievementCategory, FarmState, PigInstance } from '../types/game';
import { MAX_STORED_PIGS, calculateBreedingCost, getBarnExpandCost } from '../services/farmRepository';
import { getVietnamClock } from '../services/vietnamTime';
import { PigSprite } from './PigSprite';

export type ActiveModal =
  | null
  | 'shop'
  | 'inventory'
  | 'dex'
  | 'breeding'
  | 'quests'
  | 'achievements'
  | 'wheel'
  | 'couple'
  | 'friend'
  | 'settings';

interface ModalShellProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

const ModalShell: React.FC<ModalShellProps> = ({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = 'max-w-3xl',
}) => {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-1.5 sm:p-5 bg-black/55 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className={`parchment-panel w-full ${maxWidth} max-h-[95dvh] rounded-2xl flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-5 py-2 sm:py-3.5 [@media(max-height:500px)]:py-1.5 bg-gradient-to-b from-[#9c6330] to-[#74451d] border-b-3 border-[#4a280d] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-2xl font-extrabold text-amber-50 truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-amber-200/90 truncate">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-600 hover:bg-red-500 border-2 border-[#450a0a] text-white flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-3 sm:p-5 pb-5 overflow-y-auto farm-scroll flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

/* ---------------- SHOP MODAL ---------------- */
interface ShopModalProps {
  state: FarmState;
  onClose: () => void;
  onBuyPig: (breedId: string) => void;
  onBuySupply: (itemId: string, qty: number) => void;
  onExpandBarn: () => void;
  onHireDog: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  state,
  onClose,
  onBuyPig,
  onBuySupply,
  onExpandBarn,
  onHireDog,
}) => {
  const [tab, setTab] = useState<'pigs' | 'supplies' | 'upgrades'>('pigs');
  const buyablePigs = PIG_BREEDS.filter((b) => b.buyPrice > 0);
  const expandCost = getBarnExpandCost(state.barnCapacity);
  const isFull = state.pigs.length >= state.barnCapacity;

  return (
    <ModalShell
      title="Cửa Hàng Nông Trại"
      subtitle={`Xu hiện có: ${state.coins.toLocaleString('vi-VN')} ₫ · Sức chứa chuồng: ${state.pigs.length}/${state.barnCapacity}`}
      onClose={onClose}
    >
      <div className="flex items-center gap-2 mb-4 border-b border-[#78471e]/20 pb-3">
        <TabButton active={tab === 'pigs'} onClick={() => setTab('pigs')}>
          Mua Heo Con
        </TabButton>
        <TabButton active={tab === 'supplies'} onClick={() => setTab('supplies')}>
          Thức Ăn & Thuốc
        </TabButton>
        <TabButton active={tab === 'upgrades'} onClick={() => setTab('upgrades')}>
          Nâng Cấp Chuồng
        </TabButton>
      </div>

      {tab === 'pigs' && (
        <>
          <div className="mb-3 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-[#5c3618] text-xs font-semibold">
            Mới vào game bạn mua <strong>Heo Thường (Lv.1)</strong>. Chơi lên cấp sẽ mở khóa thêm giống mới trong shop; toàn bộ{' '}
            <strong>{PIG_BREEDS.filter((b) => b.buyPrice === 0).length} giống Hiếm, Sử Thi & Cực Hiếm</strong> chỉ có thể{' '}
            <strong>Lai Tạo ra (~5%)</strong>!
          </div>
          {isFull && (
            <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-amber-100 border border-amber-400 text-amber-950 text-sm font-semibold">
              Chuồng đang đầy ({state.pigs.length}/{state.barnCapacity}). Hãy bán heo trưởng thành hoặc mở rộng chuồng ở mục Nâng Cấp!
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {buyablePigs.map((breed) => {
              const r = RARITY_LABELS[breed.rarity];
              const reqLevel = breed.unlockLevel ?? 1;
              const isLevelLocked = state.level < reqLevel;
              const canAfford = state.coins >= breed.buyPrice && !isFull && !isLevelLocked;
              return (
                <div
                  key={breed.id}
                  className={`p-3 rounded-xl border-2 flex items-center gap-3 ${
                    isLevelLocked
                      ? 'bg-[#efe1c6]/80 border-[#b79a72] opacity-85'
                      : 'bg-white/85 border-[#c29b68]'
                  }`}
                >
                  <div className="w-16 h-16 rounded-xl bg-[#fef3c7] border border-[#d6b27e] flex items-center justify-center shrink-0 relative">
                    <PigSprite breedId={breed.id} stage="piglet" size={58} />
                    {isLevelLocked && (
                      <div className="absolute inset-0 rounded-xl bg-[#3c1e08]/45 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-amber-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-[#3c1e08] truncate">
                        {breed.name}
                      </span>
                      <span
                        className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                        style={{ color: r.color, backgroundColor: r.bg }}
                      >
                        {r.label}
                      </span>
                      {reqLevel > 1 && (
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                            isLevelLocked
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          Lv.{reqLevel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6d411c] line-clamp-2 mt-0.5">
                      {breed.trait} · Bán lớn: {breed.sellPrice}₫
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono-nums font-bold text-sm text-amber-800">
                        {breed.buyPrice} ₫
                      </span>
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => onBuyPig(breed.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 disabled:text-stone-600 text-white text-xs font-bold cursor-pointer transition whitespace-nowrap"
                      >
                        {isLevelLocked ? `Mở ở Lv.${reqLevel}` : 'Mua Ngay'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'supplies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SHOP_SUPPLIES.map((item) => {
            const owned = state.inventory[item.id] || 0;
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white/85 border-2 border-[#c29b68] flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display font-bold text-base text-[#3c1e08]">
                      {item.name}
                    </h4>
                    <span className="text-xs font-mono-nums font-bold text-[#78471e]">
                      Đang có: {owned}
                    </span>
                  </div>
                  <p className="text-xs text-[#6d411c] mt-1">{item.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#e5cfa8]">
                  <span className="font-mono-nums font-bold text-amber-800">
                    {item.price} ₫ / gói
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={state.coins < item.price}
                      onClick={() => onBuySupply(item.id, 1)}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-stone-300 text-white text-xs font-bold cursor-pointer"
                    >
                      Mua 1
                    </button>
                    <button
                      type="button"
                      disabled={state.coins < item.price * 5}
                      onClick={() => onBuySupply(item.id, 5)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 text-white text-xs font-bold cursor-pointer"
                    >
                      Mua 5
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'upgrades' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white/85 border-2 border-[#c29b68] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-display font-bold text-lg text-[#3c1e08]">
                Mở Rộng Chuồng Nuôi (+4 Chỗ)
              </h4>
              <p className="text-sm text-[#6d411c]">
                Sức chứa hiện tại: <strong className="font-mono-nums">{state.barnCapacity}</strong> chú heo (Tối đa 28).
                {state.barnCapacity < 28 && (
                  <span className="ml-1 text-xs text-violet-700 font-semibold">
                    (Mức kế: {state.barnCapacity} → {Math.min(28, state.barnCapacity + 4)})
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              disabled={state.coins < expandCost || state.barnCapacity >= 28}
              onClick={onExpandBarn}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-stone-300 disabled:text-stone-600 text-white text-sm font-bold cursor-pointer whitespace-nowrap"
            >
              {state.barnCapacity >= 28 ? 'Đã Tối Đa' : `Nâng Cấp (${expandCost.toLocaleString('vi-VN')} ₫)`}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-white/85 border-2 border-[#c29b68] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-display font-bold text-lg text-[#3c1e08]">
                Gọi Cún Bảo Vệ Canh Chuồng (1 Giờ)
              </h4>
              <p className="text-sm text-[#6d411c]">
                Cún con giúp tăng tâm trạng đàn heo và giữ an toàn cho các hộp quà rơi trên sân.
              </p>
            </div>
            <button
              type="button"
              disabled={state.coins < 180}
              onClick={onHireDog}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-stone-300 text-white text-sm font-bold cursor-pointer whitespace-nowrap"
            >
              Thuê Cún (180 ₫)
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
};

/* ---------------- INVENTORY (TÚI ĐỒ & CẤT HEO) MODAL ---------------- */
interface InventoryModalProps {
  state: FarmState;
  onClose: () => void;
  onFeedAll: () => void;
  onHealAll: () => void;
  onGoShop: () => void;
  onStorePig: (pigId: string) => void;
  onReleasePig: (pigId: string) => void;
  onSellStoredPig: (pigId: string) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  state,
  onClose,
  onFeedAll,
  onHealAll,
  onGoShop,
  onStorePig,
  onReleasePig,
  onSellStoredPig,
}) => {
  const storedPigs = state.storedPigs || [];
  const [tab, setTab] = useState<'pigs' | 'supplies'>('pigs');
  const barnFull = state.pigs.length >= state.barnCapacity;
  const bagFull = storedPigs.length >= MAX_STORED_PIGS;

  return (
    <ModalShell
      title="Túi Đồ Nông Trại"
      subtitle={`Heo trong túi: ${storedPigs.length}/${MAX_STORED_PIGS} · Chuồng ngoài sân: ${state.pigs.length}/${state.barnCapacity}`}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      <div className="flex items-center gap-2 mb-4 border-b border-[#78471e]/20 pb-3">
        <TabButton active={tab === 'pigs'} onClick={() => setTab('pigs')}>
          Túi Cất Heo ({storedPigs.length}/{MAX_STORED_PIGS})
        </TabButton>
        <TabButton active={tab === 'supplies'} onClick={() => setTab('supplies')}>
          Vật Phẩm & Thức Ăn
        </TabButton>
      </div>

      {tab === 'pigs' ? (
        <div className="space-y-4">
          {/* Stored pigs inside the bag */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h4 className="font-display font-bold text-base text-[#3c1e08] flex items-center gap-1.5">
                <Archive className="w-4 h-4 text-amber-700" /> Heo Đang Cất Trong Túi ({storedPigs.length}/{MAX_STORED_PIGS})
              </h4>
              {barnFull && storedPigs.length > 0 && (
                <span className="text-xs font-bold text-rose-700 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-lg">
                  Chuồng ngoài sân đang đầy ({state.pigs.length}/{state.barnCapacity})
                </span>
              )}
            </div>

            {storedPigs.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-xs sm:text-sm text-[#6d411c] font-semibold">
                Chưa có chú heo nào trong túi đồ. Bạn có thể bấm <strong>Cất Vào Túi</strong> ở danh sách đàn heo bên dưới hoặc bấm trực tiếp vào chú heo ngoài sân để cất vào túi khi cần chừa chỗ chuồng!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {storedPigs.map((pig) => {
                  const breed = BREED_MAP[pig.breedId] || PIG_BREEDS[0];
                  const rarity = RARITY_LABELS[breed.rarity];
                  const isAdult = pig.growth >= 100;
                  const sellValue = isAdult
                    ? Math.round(breed.sellPrice * (0.85 + (pig.happiness / 100) * 0.35))
                    : Math.round(breed.sellPrice * 0.25);

                  return (
                    <div
                      key={pig.id}
                      className="p-3 rounded-xl bg-white/90 border-2 border-[#c29b68] flex items-center gap-3"
                    >
                      <div className="w-14 h-14 rounded-xl bg-[#fef3c7] border border-[#d6b27e] flex items-center justify-center shrink-0">
                        <PigSprite breedId={pig.breedId} stage={pig.stage} isSick={pig.isSick} size={52} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-display font-bold text-sm text-[#3c1e08] truncate">
                            {pig.nickname}
                          </span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ color: rarity.color, backgroundColor: rarity.bg }}
                          >
                            {rarity.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6d411c] font-mono-nums mt-0.5">
                          {breed.name} · Lớn: {Math.floor(pig.growth)}%
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <button
                            type="button"
                            disabled={barnFull}
                            onClick={() => onReleasePig(pig.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 disabled:text-stone-600 text-white text-xs font-bold cursor-pointer"
                          >
                            {barnFull ? 'Chuồng Đầy' : 'Thả Ra Chuồng'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onSellStoredPig(pig.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer"
                          >
                            Bán {sellValue.toLocaleString('vi-VN')}₫
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick store from yard */}
          <div className="pt-3 border-t border-[#78471e]/20">
            <h4 className="font-display font-bold text-sm sm:text-base text-[#3c1e08] mb-2">
              Cất Nhanh Heo Từ Chuồng Vào Túi ({state.pigs.length}/{state.barnCapacity})
            </h4>
            {state.pigs.length === 0 ? (
              <p className="text-xs text-[#6d411c]">Chuồng ngoài sân đang trống.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {state.pigs.map((pig) => {
                  const breed = BREED_MAP[pig.breedId] || PIG_BREEDS[0];
                  return (
                    <div
                      key={pig.id}
                      className="p-2.5 rounded-xl bg-white/75 border border-[#c29b68] flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <PigSprite breedId={pig.breedId} stage={pig.stage} isSick={pig.isSick} size={42} />
                        <div className="min-w-0">
                          <div className="font-display font-bold text-xs sm:text-sm text-[#3c1e08] truncate">
                            {pig.nickname}
                          </div>
                          <div className="text-[11px] text-[#6d411c] font-mono-nums truncate">
                            {breed.name} · {Math.floor(pig.growth)}%
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={bagFull}
                        onClick={() => onStorePig(pig.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 disabled:bg-stone-300 disabled:text-stone-600 text-white text-xs font-bold cursor-pointer shrink-0 whitespace-nowrap"
                      >
                        {bagFull ? 'Túi Đầy' : 'Cất Vào Túi'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {SHOP_SUPPLIES.map((item) => {
              const qty = state.inventory[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-white/85 border-2 border-[#c29b68] flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-display font-bold text-[#3c1e08]">{item.name}</h4>
                    <p className="text-xs text-[#6d411c] mt-0.5">{item.description}</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-[#fef3c7] border border-[#b47b44] font-mono-nums font-extrabold text-[#4a280d] shrink-0">
                    x{qty}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#78471e]/20">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  onFeedAll();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold cursor-pointer"
              >
                Rải Cám Cho Cả Đàn
              </button>
              <button
                type="button"
                onClick={() => {
                  onHealAll();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold cursor-pointer"
              >
                Chữa Bệnh Toàn Chuồng
              </button>
            </div>

            <button
              type="button"
              onClick={onGoShop}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold cursor-pointer flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" /> Mua Thêm
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
};

/* ---------------- DEX (COLLECTION BOOK) MODAL ---------------- */
interface DexModalProps {
  state: FarmState;
  onClose: () => void;
}

export const DexModal: React.FC<DexModalProps> = ({ state, onClose }) => {
  return (
    <ModalShell
      title="Sổ Tay Giống Heo"
      subtitle={`Đã mở khóa: ${state.unlockedBreeds.length}/${PIG_BREEDS.length} giống heo`}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {PIG_BREEDS.map((breed) => {
          const unlocked = state.unlockedBreeds.includes(breed.id);
          const r = RARITY_LABELS[breed.rarity];
          const recipe = BREEDING_RECIPES.find((rec) => rec.childBreedId === breed.id);

          return (
            <div
              key={breed.id}
              className={`p-3 rounded-xl border-2 flex flex-col gap-2 ${
                unlocked
                  ? 'bg-white/90 border-[#b47b44]'
                  : 'bg-[#e7d6b7]/70 border-[#a68356] opacity-85'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-14 h-14 rounded-xl bg-[#fef3c7] border border-[#d6b27e] flex items-center justify-center shrink-0">
                  {unlocked ? (
                    <PigSprite breedId={breed.id} stage="adult" size={52} />
                  ) : (
                    <Lock className="w-6 h-6 text-[#8b5a2b]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-sm text-[#3c1e08] truncate">
                    {unlocked ? breed.name : 'Giống Heo Bí Ẩn'}
                  </h4>
                  <span
                    className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5"
                    style={{ color: r.color, backgroundColor: r.bg }}
                  >
                    {r.label}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#5c3618] leading-relaxed">
                {unlocked
                  ? breed.description
                  : breed.buyPrice > 0
                  ? `Mở bán ở Cửa Hàng khi đạt Cấp ${breed.unlockLevel ?? 1}.`
                  : recipe
                  ? `Chỉ mở qua Lai Tạo (~5%) · Gợi ý: ${recipe.hint.split('→')[0].trim()}`
                  : 'Giống hiếm chỉ xuất hiện khi Lai Tạo trong chuồng (~5%).'}
              </p>

              <div className="mt-auto pt-1.5 border-t border-[#e5cfa8] flex items-center justify-between text-[11px] font-semibold text-[#78471e]">
                <span>{unlocked ? breed.trait : breed.buyPrice === 0 ? 'Chỉ Lai Tạo (~5%)' : `Shop Lv.${breed.unlockLevel ?? 1}`}</span>
                <span className="font-mono-nums">{breed.sellPrice} ₫</span>
              </div>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
};

/* ---------------- BREEDING & BARN MANAGEMENT MODAL ---------------- */
interface BreedingModalProps {
  state: FarmState;
  onClose: () => void;
  onBreed: (pigAId: string, pigBId: string, useCharm: boolean) => void;
  onClaimIncubator: (incubatorId: string) => void;
  onSellPig: (pigId: string) => void;
  onStorePig: (pigId: string) => void;
  onRenamePig: (pigId: string, newName: string) => void;
}

export const BreedingModal: React.FC<BreedingModalProps> = ({
  state,
  onClose,
  onBreed,
  onClaimIncubator,
  onSellPig,
  onStorePig,
  onRenamePig,
}) => {
  const adults = state.pigs.filter((p) => p.growth >= 100);
  const [parentAId, setParentAId] = useState<string>(adults[0]?.id || '');
  const [parentBId, setParentBId] = useState<string>(adults[1]?.id || '');
  const [useCharm, setUseCharm] = useState(false);
  const [editingPigId, setEditingPigId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  const charmQty = state.inventory['breed_charm'] || 0;
  const parentA = state.pigs.find((p) => p.id === parentAId);
  const parentB = state.pigs.find((p) => p.id === parentBId);

  const matchingRecipe =
    parentA && parentB
      ? BREEDING_RECIPES.find(
          (r) =>
            (r.parentA === parentA.breedId && r.parentB === parentB.breedId) ||
            (r.parentA === parentB.breedId && r.parentB === parentA.breedId)
        )
      : undefined;

  const breedCost = parentA && parentB ? calculateBreedingCost(parentA.breedId, parentB.breedId) : 120;
  const canBreed =
    Boolean(parentA && parentB && parentA.id !== parentB.id) &&
    state.pigs.length < state.barnCapacity &&
    state.coins >= breedCost;

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ModalShell
      title="Chuồng Phối Giống & Xuất Chuồng"
      subtitle={`Đàn heo hiện tại: ${state.pigs.length}/${state.barnCapacity} · Heo trưởng thành: ${adults.length}`}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      {/* Breeding Box */}
      <div className="p-4 rounded-xl bg-white/90 border-2 border-[#b47b44] mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3 className="font-display font-bold text-lg text-[#3c1e08] flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" /> Lai Tạo Giống Mới (Phí {breedCost.toLocaleString('vi-VN')} ₫ · Ấp 5 phút)
          </h3>
          <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg">
            Tỷ lệ ra giống Hiếm/Cực Hiếm: {useCharm && charmQty > 0 ? '10% (Có Bùa)' : '5%'}
          </span>
        </div>

        {matchingRecipe && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-300 text-xs font-bold text-purple-900">
            Công thức ghép cặp khớp! Nếu trúng tỷ lệ hiếm ({useCharm && charmQty > 0 ? '10%' : '5%'}) sẽ nở chắc chắn:{' '}
            <span className="underline">{BREED_MAP[matchingRecipe.childBreedId]?.name}</span>
          </div>
        )}

        {adults.length >= 2 && parentA && parentB && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50/90 border-2 border-amber-300 flex items-center justify-center gap-3 sm:gap-6 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-[#b47b44] flex items-center justify-center shadow">
                <PigSprite breedId={parentA.breedId} stage={parentA.stage} size={64} />
              </div>
              <span className="font-display font-bold text-xs text-[#3c1e08] mt-1 truncate max-w-[120px]">
                {parentA.nickname}
              </span>
              <span className="text-[10px] text-amber-800 font-semibold">{BREED_MAP[parentA.breedId]?.name}</span>
            </div>

            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-lg shadow-md animate-pulse shrink-0">
              💕
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-[#b47b44] flex items-center justify-center shadow">
                <PigSprite breedId={parentB.breedId} stage={parentB.stage} size={64} />
              </div>
              <span className="font-display font-bold text-xs text-[#3c1e08] mt-1 truncate max-w-[120px]">
                {parentB.nickname}
              </span>
              <span className="text-[10px] text-amber-800 font-semibold">{BREED_MAP[parentB.breedId]?.name}</span>
            </div>
          </div>
        )}

        {adults.length < 2 ? (
          <p className="text-sm text-[#78471e] py-2">
            Cần ít nhất <strong>2 chú heo trưởng thành (100%)</strong> để tiến hành phối giống. Hãy chăm sóc cho các bé heo mau lớn nhé!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div>
              <label className="block text-xs font-bold text-[#6d411c] mb-1">Heo Bố / Mẹ 1</label>
              <div className="flex items-center gap-2">
                {parentA && (
                  <div className="w-10 h-10 rounded-lg bg-[#fef3c7] border border-[#b47b44] flex items-center justify-center shrink-0 shadow-xs">
                    <PigSprite breedId={parentA.breedId} stage={parentA.stage} size={36} />
                  </div>
                )}
                <select
                  value={parentAId}
                  onChange={(e) => setParentAId(e.target.value)}
                  className="flex-1 px-2.5 py-2 rounded-lg bg-[#fff9ea] border-2 border-[#b47b44] text-sm font-semibold text-[#3c1e08]"
                >
                  {adults.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nickname} ({BREED_MAP[p.breedId]?.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6d411c] mb-1">Heo Bố / Mẹ 2</label>
              <div className="flex items-center gap-2">
                {parentB && (
                  <div className="w-10 h-10 rounded-lg bg-[#fef3c7] border border-[#b47b44] flex items-center justify-center shrink-0 shadow-xs">
                    <PigSprite breedId={parentB.breedId} stage={parentB.stage} size={36} />
                  </div>
                )}
                <select
                  value={parentBId}
                  onChange={(e) => setParentBId(e.target.value)}
                  className="flex-1 px-2.5 py-2 rounded-lg bg-[#fff9ea] border-2 border-[#b47b44] text-sm font-semibold text-[#3c1e08]"
                >
                  {adults.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nickname} ({BREED_MAP[p.breedId]?.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs font-bold text-[#4a280d] cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCharm && charmQty > 0}
                  disabled={charmQty === 0}
                  onChange={(e) => setUseCharm(e.target.checked)}
                  className="w-4 h-4 accent-purple-600"
                />
                Dùng Bùa Lai Giống (Còn: {charmQty})
              </label>

              <button
                type="button"
                disabled={!canBreed}
                onClick={() => onBreed(parentAId, parentBId, useCharm && charmQty > 0)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-stone-300 text-white text-sm font-bold cursor-pointer transition"
              >
                {state.pigs.length >= state.barnCapacity
                  ? 'Chuồng Đã Đầy'
                  : parentAId === parentBId
                  ? 'Chọn 2 Con Khác Nhau'
                  : 'Phối Giống Ngay!'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Incubators (5-minute hidden surprise) */}
      {(state.breedingIncubators || []).length > 0 && (
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400">
          <h4 className="font-display font-bold text-base text-[#3c1e08] mb-2 flex items-center gap-1.5">
            🥚 Trứng Đang Ấp & Lai Tạo (Bất Ngờ Khi Nở)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {state.breedingIncubators.map((inc) => {
              const elapsed = now - inc.startAt;
              const remainingMs = Math.max(0, inc.durationMs - elapsed);
              const isReady = remainingMs === 0;
              const mins = Math.floor(remainingMs / 60000);
              const secs = Math.floor((remainingMs % 60000) / 1000);
              const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

              return (
                <div
                  key={inc.id}
                  className="p-3 rounded-xl bg-white border border-amber-300 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-400 flex items-center justify-center shrink-0 text-2xl animate-pulse">
                      🥚
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-bold text-sm text-[#3c1e08] truncate">
                        {inc.parentAName} × {inc.parentBName}
                      </div>
                      <div className="text-xs font-mono-nums font-bold text-amber-800">
                        {isReady ? '🎉 Trứng đã sẵn sàng nở!' : `⏳ Còn lại: ${timeStr}`}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!isReady}
                    onClick={() => onClaimIncubator(inc.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 hover:brightness-105 disabled:bg-stone-300 disabled:text-stone-600 text-white text-xs font-bold cursor-pointer shrink-0 shadow whitespace-nowrap"
                  >
                    {isReady ? 'Thu Hoạch 🎁' : 'Đang Ấp...'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Herd List */}
      <h3 className="font-display font-bold text-lg text-[#3c1e08] mb-2.5">
        Danh Sách Đàn Heo ({state.pigs.length}/{state.barnCapacity})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {state.pigs.map((pig: PigInstance) => {
          const breed = BREED_MAP[pig.breedId] || PIG_BREEDS[0];
          const isAdult = pig.growth >= 100;
          const sellValue = isAdult
            ? Math.round(breed.sellPrice * (0.85 + (pig.happiness / 100) * 0.35))
            : Math.round(breed.sellPrice * 0.25);

          return (
            <div
              key={pig.id}
              className="p-3 rounded-xl bg-white/85 border border-[#c29b68] flex items-center gap-3"
            >
              <PigSprite breedId={pig.breedId} stage={pig.stage} size={52} />
              <div className="flex-1 min-w-0">
                {editingPigId === pig.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      maxLength={18}
                      className="w-32 px-2 py-0.5 text-xs rounded border border-[#78471e] bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (draftName.trim()) onRenamePig(pig.id, draftName.trim());
                        setEditingPigId(null);
                      }}
                      className="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Lưu
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-bold text-sm text-[#3c1e08] truncate">
                      {pig.nickname}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPigId(pig.id);
                        setDraftName(pig.nickname);
                      }}
                      className="text-[11px] text-amber-700 hover:underline cursor-pointer"
                    >
                      Đổi tên
                    </button>
                  </div>
                )}
                <div className="text-xs text-[#6d411c] font-mono-nums">
                  {breed.name} · Lớn: {Math.floor(pig.growth)}% · Vui: {Math.floor(pig.happiness)}%
                </div>
                {isAdult && (
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => setParentAId(pig.id)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        parentAId === pig.id
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                      }`}
                    >
                      {parentAId === pig.id ? '✓ Bố/Mẹ 1' : '+ Chọn Mẹ 1'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setParentBId(pig.id)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        parentBId === pig.id
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                      }`}
                    >
                      {parentBId === pig.id ? '✓ Bố/Mẹ 2' : '+ Chọn Bố 2'}
                    </button>
                  </div>
                )}
              </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={(state.storedPigs?.length || 0) >= MAX_STORED_PIGS}
                    onClick={() => onStorePig(pig.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 disabled:bg-stone-300 text-white text-xs font-bold cursor-pointer"
                  >
                    Cất Túi
                  </button>
                  <button
                    type="button"
                    onClick={() => onSellPig(pig.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer ${
                      isAdult
                        ? 'bg-amber-600 hover:bg-amber-500'
                        : 'bg-stone-500 hover:bg-stone-400'
                    }`}
                  >
                    Bán {sellValue}₫
                  </button>
                </div>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
};

/* ---------------- QUESTS MODAL ---------------- */
interface QuestsModalProps {
  state: FarmState;
  onClose: () => void;
  onClaimQuest: (questId: string) => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({
  state,
  onClose,
  onClaimQuest,
}) => {
  const [clock, setClock] = useState(() => getVietnamClock());

  useEffect(() => {
    const timer = setInterval(() => setClock(getVietnamClock()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ModalShell
      title="Nhiệm Vụ Hằng Ngày"
      subtitle={`Tự động làm mới vào lúc 0:00 mỗi ngày · Giờ VN: ${clock.timeStr}`}
      onClose={onClose}
    >
      {/* Daily Reset & Vietnam Clock Banner */}
      <div className="mb-4 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-amber-100 via-[#fff8eb] to-orange-100 border-2 border-amber-400 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-200/80 border border-amber-400 flex items-center justify-center text-xl shrink-0 shadow-xs">
            🇻🇳
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-[#4a280d] flex items-center gap-2">
              <span>Giờ Việt Nam (UTC+7):</span>
              <span className="font-mono-nums font-extrabold text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded-md text-sm border border-amber-300">
                {clock.timeStr}
              </span>
            </div>
            <div className="text-[11px] text-[#78471e] font-semibold mt-0.5">
              {clock.dateStr}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-1 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-amber-200">
          <span className="text-[11px] font-bold text-amber-900">
            Tự động làm mới lúc 0:00:
          </span>
          <span className="font-mono-nums font-extrabold text-xs sm:text-sm text-rose-700 bg-white/95 px-2.5 py-1 rounded-lg border border-amber-300 shadow-xs">
            ⏳ Còn {clock.countdownToMidnight}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {state.quests.map((q) => {
          const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
          const ready = q.progress >= q.target && !q.claimed;
          return (
            <div
              key={q.id}
              className="p-3.5 rounded-xl bg-white/85 border-2 border-[#c29b68] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-display font-bold text-base text-[#3c1e08]">
                    {q.title}
                  </h4>
                  <span className="font-mono-nums text-xs font-extrabold text-[#78471e]">
                    {Math.min(q.progress, q.target)}/{q.target}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#e7d6b7] overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-xs text-[#6d411c] mt-1.5 font-semibold">
                  Thưởng: +{q.rewardCoins} ₫ · +{q.rewardGems} Ngọc · +{q.rewardXp} XP
                </div>
              </div>

              <button
                type="button"
                disabled={!ready}
                onClick={() => onClaimQuest(q.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  q.claimed
                    ? 'bg-stone-200 text-stone-500 cursor-default'
                    : ready
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-amber-200 text-amber-800 cursor-not-allowed'
                }`}
              >
                {q.claimed ? (
                  <>
                    <Check className="w-4 h-4" /> Đã Nhận
                  </>
                ) : ready ? (
                  'Nhận Thưởng'
                ) : (
                  'Đang Làm'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
};

/* ---------------- ACHIEVEMENTS & RANKINGS MODAL ---------------- */
const ACHIEVEMENT_TABS: Array<{ id: 'all' | AchievementCategory; label: string }> = [
  { id: 'all', label: 'Tất Cả' },
  { id: 'collection', label: 'Sưu Tầm' },
  { id: 'care', label: 'Chăm Sóc' },
  { id: 'breed', label: 'Lai Tạo' },
  { id: 'wealth', label: 'Phát Triển' },
  { id: 'social', label: 'Cặp Đôi' },
];

interface AchievementsModalProps {
  state: FarmState;
  onClose: () => void;
  onClaimAchievement: (achievementId: string) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  state,
  onClose,
  onClaimAchievement,
}) => {
  const [activeCat, setActiveCat] = useState<'all' | AchievementCategory>('all');
  const [viewTab, setViewTab] = useState<'achievements' | 'rankings'>('achievements');

  const totalCount = state.achievements.length;
  const unlockedCount = state.achievements.filter((a) => a.unlocked).length;
  const unclaimedCount = state.achievements.filter((a) => a.unlocked && !a.claimed).length;
  const masteryPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredAchievements = state.achievements
    .filter((a) => activeCat === 'all' || (a.category || 'collection') === activeCat)
    .sort((a, b) => {
      // Claimable first, then in-progress, then claimed
      const rankA = a.unlocked && !a.claimed ? 0 : !a.unlocked ? 1 : 2;
      const rankB = b.unlocked && !b.claimed ? 0 : !b.unlocked ? 1 : 2;
      return rankA - rankB;
    });

  const rankingRows = [
    {
      name: `${state.playerName} (Bạn)`,
      level: state.level,
      breeds: state.unlockedBreeds.length,
      isMe: true,
    },
    ...state.neighbors.map((n) => ({
      name: n.farmerName,
      level: n.level,
      breeds: Math.min(PIG_BREEDS.length, 3 + Math.floor(n.level / 2)),
      isMe: false,
    })),
  ].sort((a, b) => b.level - a.level);

  return (
    <ModalShell
      title="Thành Tựu & Chinh Phục"
      subtitle={`Đã chinh phục ${unlockedCount}/${totalCount} danh hiệu (${masteryPct}%) · Chờ nhận: ${unclaimedCount}`}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      {/* Top Switcher + Overall Progress */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#78471e]/20">
        <div className="flex items-center gap-2">
          <TabButton active={viewTab === 'achievements'} onClick={() => setViewTab('achievements')}>
            Danh Hiệu ({unlockedCount}/{totalCount})
          </TabButton>
          <TabButton active={viewTab === 'rankings'} onClick={() => setViewTab('rankings')}>
            Bảng Xếp Hạng Khu Vực
          </TabButton>
        </div>

        <div className="flex items-center gap-2 min-w-[180px]">
          <div className="flex-1 h-2.5 rounded-full bg-[#e7d6b7] border border-[#b47b44] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all"
              style={{ width: `${masteryPct}%` }}
            />
          </div>
          <span className="font-mono-nums text-xs font-extrabold text-[#5c3618]">
            {masteryPct}%
          </span>
        </div>
      </div>

      {viewTab === 'achievements' ? (
        <div className="space-y-3">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto farm-scroll pb-1">
            {ACHIEVEMENT_TABS.map((tab) => {
              const catItems =
                tab.id === 'all'
                  ? state.achievements
                  : state.achievements.filter((a) => (a.category || 'collection') === tab.id);
              const catUnclaimed = catItems.filter((a) => a.unlocked && !a.claimed).length;
              const isSelected = activeCat === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCat(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-800 shadow-sm'
                      : 'bg-white/80 text-[#5c3618] border-[#c29b68] hover:bg-[#fff9ea]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {catUnclaimed > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-extrabold leading-tight">
                      {catUnclaimed}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Achievement Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredAchievements.map((a) => {
              const clampedProgress = Math.min(a.progress, a.target);
              const pct = Math.min(100, Math.round((clampedProgress / a.target) * 100));
              const canClaim = a.unlocked && !a.claimed;

              return (
                <div
                  key={a.id}
                  className={`p-3 rounded-xl border-2 flex flex-col gap-2 ${
                    canClaim
                      ? 'bg-amber-50 border-emerald-500 shadow-sm'
                      : a.claimed
                      ? 'bg-[#f4e7ce]/80 border-[#b79a72]'
                      : 'bg-white/85 border-[#c29b68]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Award
                          className={`w-4 h-4 shrink-0 ${
                            a.unlocked ? 'text-amber-500' : 'text-stone-400'
                          }`}
                        />
                        <h4 className="font-display font-bold text-sm text-[#3c1e08] truncate">
                          {a.title}
                        </h4>
                      </div>
                      <p className="text-xs text-[#6d411c] mt-0.5">{a.description}</p>
                    </div>
                    <span className="text-[11px] font-extrabold font-mono-nums text-[#78471e] shrink-0">
                      {clampedProgress}/{a.target}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-[#e7d6b7] overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        a.unlocked ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Rewards + Claim Action */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-300 font-mono-nums">
                        +{a.rewardGems} Ngọc
                      </span>
                      {a.rewardCoins ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono-nums">
                          +{a.rewardCoins.toLocaleString('vi-VN')} ₫
                        </span>
                      ) : null}
                    </div>

                    {a.claimed ? (
                      <span className="px-2.5 py-1 rounded-lg bg-stone-200 text-stone-600 text-[11px] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Đã Nhận
                      </span>
                    ) : canClaim ? (
                      <button
                        type="button"
                        onClick={() => onClaimAchievement(a.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold cursor-pointer shadow-sm animate-pulse"
                      >
                        Nhận Thưởng
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-[#8b5a2b]">
                        Chưa Đạt ({pct}%)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <h3 className="font-display font-bold text-base text-[#3c1e08] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-violet-600" /> Bảng Xếp Hạng Nông Trại Khu Vực
          </h3>
          <div className="rounded-xl bg-white/85 border-2 border-[#c29b68] divide-y divide-[#e5cfa8]">
            {rankingRows.map((row, index) => (
              <div
                key={row.name}
                className={`px-3.5 py-2.5 flex items-center justify-between ${
                  row.isMe ? 'bg-amber-100/80 font-bold' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-[#4a280d] text-amber-100 text-xs font-mono-nums font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm text-[#3c1e08] truncate">{row.name}</span>
                </div>
                <div className="text-xs font-mono-nums text-[#78471e] shrink-0">
                  Lv.{row.level} · {row.breeds} giống
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ModalShell>
  );
};

/* ---------------- LUCKY WHEEL MODAL ---------------- */
export const WHEEL_SLICES = [
  { id: 'rare_pig', label: '1 Bé Heo Hiếm!', shortLabel: 'Heo Hiếm', color: '#ec4899', textColor: '#ffffff', isPig: true },
  { id: 'gold_150', label: '+150 Xu Vàng', shortLabel: '150₫', color: '#f59e0b', textColor: '#451a03', isPig: false },
  { id: 'gold_400', label: '+400 Xu Vàng', shortLabel: '400₫', color: '#fbbf24', textColor: '#451a03', isPig: false },
  { id: 'gold_250', label: '+250 Xu Vàng', shortLabel: '250₫', color: '#d97706', textColor: '#fffbeb', isPig: false },
  { id: 'gold_1000', label: '+1.000 Xu Vàng', shortLabel: '1.000₫', color: '#fde047', textColor: '#713f12', isPig: false },
  { id: 'gold_600', label: '+600 Xu Vàng', shortLabel: '600₫', color: '#eab308', textColor: '#451a03', isPig: false },
] as const;

interface WheelModalProps {
  state: FarmState;
  onClose: () => void;
  onSpin: () => { label: string; sliceIndex: number } | null;
}

export const WheelModal: React.FC<WheelModalProps> = ({
  state,
  onClose,
  onSpin,
}) => {
  const [resultText, setResultText] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotationDeg, setRotationDeg] = useState(0);

  const canSpinFree = Date.now() - state.lastWheelSpinAt > 1000 * 60 * 5;
  const spinCost = canSpinFree ? 0 : 120;

  const handleSpin = () => {
    if (spinning) return;
    const outcome = onSpin();
    if (!outcome) return;

    setSpinning(true);
    setResultText(null);
    // Each slice spans 60deg; slice i center is at i*60 + 30deg clockwise from top (0deg).
    // Rotating the wheel by (360 - center) aligns slice i right under the top pointer.
    const sliceCenter = outcome.sliceIndex * 60 + 30;
    const jitter = Math.floor(Math.random() * 24) - 12;
    const baseSpins = 360 * 4;
    const nextAngle =
      rotationDeg - (rotationDeg % 360) + baseSpins + (360 - sliceCenter) + jitter;
    setRotationDeg(nextAngle);

    setTimeout(() => {
      setSpinning(false);
      setResultText(outcome.label);
    }, 1250);
  };

  return (
    <ModalShell
      title="Vòng Quay May Mắn"
      subtitle="1 ô Heo Hiếm duy nhất & 5 ô Xu Vàng cực hời!"
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col items-center text-center py-2">
        {/* Top Pointer */}
        <div className="relative flex flex-col items-center">
          <div
            className="z-20 -mb-2.5 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-600 drop-shadow-md"
            aria-hidden="true"
          />

          <div
            className="w-52 h-52 rounded-full border-8 border-[#5c3111] shadow-xl relative overflow-hidden transition-transform duration-[1200ms] ease-out"
            style={{ transform: `rotate(${rotationDeg}deg)` }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {WHEEL_SLICES.map((slice, idx) => {
                const startAngle = (idx * 60 - 90) * (Math.PI / 180);
                const endAngle = ((idx + 1) * 60 - 90) * (Math.PI / 180);
                const x1 = 100 + 100 * Math.cos(startAngle);
                const y1 = 100 + 100 * Math.sin(startAngle);
                const x2 = 100 + 100 * Math.cos(endAngle);
                const y2 = 100 + 100 * Math.sin(endAngle);
                const midDeg = idx * 60 + 30;
                return (
                  <g key={slice.id}>
                    <path
                      d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                      fill={slice.color}
                      stroke="#5c3111"
                      strokeWidth="2.5"
                    />
                    <g transform={`rotate(${midDeg} 100 100)`}>
                      {slice.isPig ? (
                        <g transform="translate(100, 42)">
                          <circle cx="0" cy="-2" r="11" fill="#ffc2d1" stroke="#831843" strokeWidth="1.6" />
                          <polygon points="-9,-9 -5,-16 -1,-10" fill="#ff8fab" stroke="#831843" strokeWidth="1.4" />
                          <polygon points="9,-9 5,-16 1,-10" fill="#ff8fab" stroke="#831843" strokeWidth="1.4" />
                          <ellipse cx="0" cy="0" rx="5" ry="3.5" fill="#ff8fab" stroke="#831843" strokeWidth="1.2" />
                          <circle cx="-4" cy="-5" r="1.4" fill="#1c1917" />
                          <circle cx="4" cy="-5" r="1.4" fill="#1c1917" />
                          <text
                            x="0"
                            y="22"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="11"
                            fontWeight="800"
                          >
                            Heo Hiếm
                          </text>
                        </g>
                      ) : (
                        <g transform="translate(100, 44)">
                          <circle cx="0" cy="-4" r="9.5" fill="#fef08a" stroke="#92400e" strokeWidth="1.8" />
                          <text
                            x="0"
                            y="-0.5"
                            textAnchor="middle"
                            fill="#92400e"
                            fontSize="10"
                            fontWeight="900"
                          >
                            ₫
                          </text>
                          <text
                            x="0"
                            y="20"
                            textAnchor="middle"
                            fill={slice.textColor}
                            fontSize="12"
                            fontWeight="900"
                          >
                            {slice.shortLabel}
                          </text>
                        </g>
                      )}
                    </g>
                  </g>
                );
              })}
              <circle cx="100" cy="100" r="24" fill="#fff9ea" stroke="#4a280d" strokeWidth="4" />
              <text x="100" y="104" textAnchor="middle" fill="#4a280d" fontSize="11" fontWeight="900">
                QUAY
              </text>
            </svg>
          </div>
        </div>

        <div className="mt-4 min-h-[44px] flex items-center justify-center">
          {resultText ? (
            <div className="px-4 py-2 rounded-xl bg-emerald-100 border-2 border-emerald-500 text-emerald-900 font-bold text-sm">
              Chúc mừng! Bạn trúng: {resultText}
            </div>
          ) : (
            <p className="text-sm text-[#6d411c]">
              {canSpinFree
                ? 'Bạn có 1 lượt quay miễn phí!'
                : 'Lượt miễn phí hồi sau 5 phút, hoặc quay ngay bằng 120 ₫.'}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={spinning || (!canSpinFree && state.coins < 120)}
          onClick={handleSpin}
          className="mt-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-stone-300 text-white font-display font-bold text-base cursor-pointer shadow-md"
        >
          {spinning
            ? 'Đang quay...'
            : spinCost === 0
            ? 'Quay Miễn Phí'
            : `Quay Ngay (${spinCost} ₫)`}
        </button>
      </div>
    </ModalShell>
  );
};

/* ---------------- SETTINGS & LOCAL/ONLINE SAVE MODAL ---------------- */
interface SettingsModalProps {
  state: FarmState;
  onClose: () => void;
  onToggleSound: () => void;
  onUpdateProfile: (playerName: string, greeting: string) => void;
  onExportSave: () => string;
  onImportSave: (raw: string) => boolean;
  onResetFarm: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  state,
  onClose,
  onToggleSound,
  onUpdateProfile,
  onExportSave,
  onImportSave,
  onResetFarm,
}) => {
  const [name, setName] = useState(state.playerName);
  const [greeting, setGreeting] = useState(state.farmGreeting);
  const [importText, setImportText] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleDownloadJson = () => {
    const json = onExportSave();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chuong-heo-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg('Đã tải file sao lưu JSON về máy!');
  };

  return (
    <ModalShell
      title="Cài Đặt & Lưu Trữ Trang Trại"
      subtitle="Chế độ chơi Local (dữ liệu lưu trên trình duyệt, sẵn sàng mở rộng Online)"
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* Profile & Banner */}
        <div className="p-4 rounded-xl bg-white/85 border-2 border-[#c29b68] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-[#3c1e08]">Thông Tin Trang Trại</span>
            <button
              type="button"
              onClick={onToggleSound}
              className="px-3 py-1.5 rounded-lg bg-[#fef3c7] border border-[#b47b44] text-xs font-bold text-[#4a280d] flex items-center gap-1.5 cursor-pointer"
            >
              {state.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {state.soundEnabled ? 'Âm Thanh: Bật' : 'Âm Thanh: Tắt'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#6d411c] mb-1">Tên Chủ Trại</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                className="w-full px-3 py-2 rounded-lg bg-[#fff9ea] border border-[#b47b44] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6d411c] mb-1">Khẩu Hiệu Ruy-Băng Trên Đầu</label>
              <input
                type="text"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                maxLength={32}
                className="w-full px-3 py-2 rounded-lg bg-[#fff9ea] border border-[#b47b44] text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onUpdateProfile(name.trim() || 'Nông Dân', greeting.trim() || 'Chuồng Heo Vui Vẻ!');
              setStatusMsg('Đã lưu tên trang trại và khẩu hiệu!');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
          >
            Lưu Thay Đổi
          </button>
        </div>

        {/* Local Save Export/Import */}
        <div className="p-4 rounded-xl bg-white/85 border-2 border-[#c29b68] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-display font-bold text-[#3c1e08]">Sao Lưu & Phục Hồi Dữ Liệu Local</h4>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> Tự động lưu vào LocalStorage
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="./chuong-heo-offline.html"
              download="ChuongHeoVuiVe.html"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Tải Game 1 File (.html) Chơi Offline
            </a>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Xuất File Save (.json)
            </button>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-[#6d411c] mb-1">
              Dán nội dung JSON để khôi phục dữ liệu:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"version":1,...}'
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#fff9ea] border border-[#b47b44] text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  const ok = onImportSave(importText);
                  setStatusMsg(ok ? 'Khôi phục dữ liệu thành công!' : 'Dữ liệu JSON không hợp lệ.');
                  if (ok) setImportText('');
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Nhập Save
              </button>
            </div>
          </div>

          {statusMsg && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold">
              {statusMsg}
            </div>
          )}
        </div>

        {/* Reset & Architecture Note */}
        <div className="p-4 rounded-xl bg-[#f5e6c8] border border-[#b47b44] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-[#5c3618] flex items-start gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#78471e]" />
            <span>
              Kiến trúc <strong>FarmRepository</strong> đang chạy ở chế độ Local. Khi phát triển Online, chỉ cần kết nối API/WebSocket vào lớp dịch vụ lưu trữ là đồng bộ được ngay.
            </span>
          </div>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold border border-rose-300 shrink-0 cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Chơi Lại Từ Đầu
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onResetFarm();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold cursor-pointer"
              >
                Xác Nhận Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 rounded-lg bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold cursor-pointer transition whitespace-nowrap ${
      active
        ? 'bg-[#78471e] text-amber-50 shadow-sm'
        : 'bg-[#e7d6b7] text-[#5c3618] hover:bg-[#dec79f]'
    }`}
  >
    {children}
  </button>
);
