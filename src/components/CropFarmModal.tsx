import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Droplets,
  Package,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Sprout,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import {
  CROP_SEEDS,
  CROP_SEED_MAP,
  FERTILIZER_PRICE,
  computePlotProgress,
  getUnlockedPlotCount,
} from '../data/cropSeeds';
import { CropFocus, CropOrder, FarmPlot, FarmState } from '../types/game';
import { IsometricCropField } from './IsometricCropField';
import { SupplyItemSprite } from './SupplyItemSprite';

export type FarmTool = 'plant' | 'water' | 'fertilize' | 'uproot';

interface CropFarmModalProps {
  state: FarmState;
  onClose: () => void;
  onPlantSeed: (plotIndex: number, seedId: string) => void;
  onWaterPlot: (plotIndex: number) => void;
  onWaterAllPlots: () => void;
  onFertilizePlot: (plotIndex: number) => void;
  onFertilizeAllPlots: () => void;
  onHarvestPlot: (plotIndex: number) => void;
  onHarvestAllPlots: () => void;
  onUprootPlot: (plotIndex: number) => void;
  onBuyFertilizer: (qty: number) => void;
  onConvertCropToFeed: (seedId: string, qty: number) => void;
  onConvertAllCropsToFeed: () => void;
  onSellCrop: (seedId: string, qty: number) => void;
  onCompleteOrder: (orderId: string) => void;
  onRefreshOrder: (orderId: string) => void;
  onOpenAchievements?: () => void;
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}p` : `${m}p${s < 10 ? '0' : ''}${s}s`;
}

const FOCUS_META: Record<CropFocus, { label: string; textClass: string }> = {
  coin: { label: 'Nhiều Xu', textClass: 'text-amber-700' },
  xp: { label: 'Nhiều XP', textClass: 'text-sky-700' },
  feed: { label: 'Thức Ăn Heo', textClass: 'text-emerald-700' },
};

export const CropFarmModal: React.FC<CropFarmModalProps> = ({
  state,
  onClose,
  onPlantSeed,
  onWaterPlot,
  onWaterAllPlots,
  onFertilizePlot,
  onFertilizeAllPlots,
  onHarvestPlot,
  onHarvestAllPlots,
  onUprootPlot,
  onBuyFertilizer,
  onConvertCropToFeed,
  onConvertAllCropsToFeed,
  onSellCrop,
  onCompleteOrder,
  onRefreshOrder,
  onOpenAchievements,
}) => {
  const [farmTool, setFarmTool] = useState<FarmTool>('plant');
  const [selectedSeedId, setSelectedSeedId] = useState<string>(CROP_SEEDS[0].id);
  const [rightTab, setRightTab] = useState<'seeds' | 'orders' | 'storage'>('seeds');
  const [showConsole, setShowConsole] = useState(false);
  const [pendingPlotIndex, setPendingPlotIndex] = useState<number | null>(null);
  const [focusFilter, setFocusFilter] = useState<'all' | CropFocus>('all');
  const [now, setNow] = useState(() => Date.now());

  // Lightweight 1s timer running only while the farm view is open and visible
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const plots: FarmPlot[] = useMemo(() => state.cropPlots || [], [state.cropPlots]);
  const storage = useMemo(() => state.cropStorage || {}, [state.cropStorage]);
  const orders: CropOrder[] = useMemo(() => state.cropOrders || [], [state.cropOrders]);
  const fertilizerCount = state.fertilizerCount ?? 0;
  const unlockedPlots = getUnlockedPlotCount(state.level);

  const readyCount = useMemo(
    () => plots.filter((p) => p.seedId && computePlotProgress(p, now).isReady).length,
    [plots, now]
  );
  const dryCount = useMemo(
    () =>
      plots.filter((p) => {
        if (!p.seedId || p.watered) return false;
        return !computePlotProgress(p, now).isReady;
      }).length,
    [plots, now]
  );
  const growingCount = useMemo(
    () => plots.filter((p) => p.seedId && !computePlotProgress(p, now).isReady).length,
    [plots, now]
  );

  const filteredSeeds = useMemo(
    () =>
      focusFilter === 'all'
        ? CROP_SEEDS
        : CROP_SEEDS.filter((s) => s.focus === focusFilter),
    [focusFilter]
  );

  const storedEntries = useMemo(
    () =>
      Object.entries(storage)
        .filter(([, qty]) => qty > 0)
        .map(([seedId, qty]) => ({
          seed: CROP_SEED_MAP[seedId] || CROP_SEEDS[0],
          qty,
        })),
    [storage]
  );

  const totalStoredCrops = useMemo(
    () => storedEntries.reduce((sum, e) => sum + e.qty, 0),
    [storedEntries]
  );

  const selectedSeed = CROP_SEED_MAP[selectedSeedId] || CROP_SEEDS[0];

  const handlePlotTap = (plot: FarmPlot, isLocked: boolean) => {
    if (isLocked) return;

    if (plot.seedId) {
      const status = computePlotProgress(plot, now);
      if (farmTool === 'uproot') {
        onUprootPlot(plot.index);
        return;
      }
      if (status.isReady) {
        onHarvestPlot(plot.index);
        return;
      }
      if (farmTool === 'water') {
        onWaterPlot(plot.index);
        return;
      }
      if (farmTool === 'fertilize') {
        onFertilizePlot(plot.index);
        return;
      }
      // Smart 1-tap water when tapping a dry growing plot in plant mode
      if (!plot.watered) {
        onWaterPlot(plot.index);
      }
      return;
    }

    // Empty unlocked plot
    if (!showConsole) {
      setFarmTool('plant');
      setRightTab('seeds');
      setShowConsole(true);
      setPendingPlotIndex(plot.index);
      return;
    }

    if (farmTool === 'plant') {
      setPendingPlotIndex(null);
      onPlantSeed(plot.index, selectedSeed.id);
    } else {
      setFarmTool('plant');
      setRightTab('seeds');
      setPendingPlotIndex(plot.index);
    }
  };

  const toggleConsoleTab = (tab: 'seeds' | 'orders' | 'storage') => {
    if (showConsole && rightTab === tab) {
      setShowConsole(false);
      setPendingPlotIndex(null);
    } else {
      setRightTab(tab);
      setShowConsole(true);
      if (tab === 'seeds') {
        setFarmTool('plant');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-[#5ba913] overflow-hidden safe-x">
      {/* TOP WOODEN FARM BAR */}
      <header className="px-2.5 sm:px-4 py-1.5 sm:py-2 [@media(max-height:500px)]:py-1 bg-gradient-to-b from-[#8b5526] to-[#683d17] border-b-3 border-[#3d2108] flex items-center justify-between gap-2 shrink-0 safe-top shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1.5 [@media(max-height:500px)]:py-1 rounded-xl bg-amber-500 hover:bg-amber-400 border-2 border-[#4a280d] text-[#3c1e08] text-xs font-extrabold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Về Chuồng Heo</span>
            <span className="sm:hidden">Về Chuồng</span>
          </button>

          <div className="min-w-0">
            <h2 className="font-display text-sm sm:text-lg [@media(max-height:500px)]:text-sm font-extrabold text-amber-50 truncate leading-tight">
              🌾 Nông Trại Vui Vẻ ({unlockedPlots}/25 Ô)
            </h2>
            <p className="text-[10px] sm:text-xs [@media(max-height:500px)]:text-[10px] text-amber-200/95 font-mono-nums truncate">
              Xu: {state.coins.toLocaleString('vi-VN')} ₫ · Lv.{state.level} · 🧪 Phân: {fertilizerCount} · 🥣 Cám: {state.inventory['feed_standard'] || 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenAchievements && (
            <button
              type="button"
              onClick={onOpenAchievements}
              className="relative px-2.5 py-1.5 [@media(max-height:500px)]:py-1 rounded-xl bg-amber-100 hover:bg-white border-2 border-[#4a280d] text-[#3c1e08] text-xs font-extrabold flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Thành Tựu</span>
              {state.achievements.some((a) => a.category === 'crop_farm' && a.unlocked && !a.claimed) && (
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng Nông Trại"
            className="w-8 h-8 [@media(max-height:500px)]:w-7 [@media(max-height:500px)]:h-7 rounded-xl bg-red-600 hover:bg-red-500 border-2 border-[#450a0a] text-white flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN SCENE + CONSOLE */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row [@media(max-height:500px)]:flex-row overflow-hidden">
        {/* LEFT / TOP: 2.5D ISOMETRIC MEADOW & 5x5 PLOTS */}
        <div className="relative flex-1 min-h-0 md:h-full [@media(max-height:500px)]:h-full flex flex-col bg-[#75c51c] overflow-hidden">
          {/* Quick 1-Tap Meadow Actions (Top-Left Overlay) */}
          <div className="absolute top-2 left-2 z-10 flex flex-wrap items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              disabled={dryCount === 0}
              onClick={onWaterAllPlots}
              title="Tưới nước nhanh cho tất cả các ô cây đang khô"
              className="px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900/55 disabled:text-sky-100/65 border-2 border-sky-950 text-white text-[11px] font-extrabold shadow-md cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
            >
              💧 Tưới Nhanh{dryCount > 0 ? ` (${dryCount})` : ''}
            </button>
            <button
              type="button"
              disabled={growingCount === 0 || fertilizerCount <= 0}
              onClick={onFertilizeAllPlots}
              title={
                fertilizerCount <= 0
                  ? 'Hết phân bón! Mua thêm bên phải hoặc dọn phân heo'
                  : 'Bón phân nhanh giảm 50% thời gian chín cho các cây đang lớn'
              }
              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-amber-950/55 disabled:text-amber-100/65 border-2 border-[#4a280d] text-[#3c1e08] text-[11px] font-extrabold shadow-md cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
            >
              🧪 Bón Nhanh{growingCount > 0 && fertilizerCount > 0 ? ` (${Math.min(fertilizerCount, growingCount)})` : ''}
            </button>
            {readyCount > 0 && (
              <button
                type="button"
                onClick={onHarvestAllPlots}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-950 text-white text-[11px] font-extrabold shadow-md cursor-pointer whitespace-nowrap"
              >
                🧺 Thu Hết ({readyCount})
              </button>
            )}
            {farmTool === 'uproot' && (
              <span className="px-2.5 py-1 rounded-xl bg-rose-600/95 border border-rose-200 text-white text-[11px] font-bold shadow">
                ⚠️ Bấm cây trồng nhầm để nhổ bỏ
              </span>
            )}
          </div>

          {/* Isometric Field SVG */}
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <IsometricCropField
              plots={plots}
              playerLevel={state.level}
              now={now}
              farmTool={farmTool}
              selectedSeed={selectedSeed}
              isSeedPanelOpen={showConsole && rightTab === 'seeds'}
              pendingPlotIndex={pendingPlotIndex}
              onPlotTap={handlePlotTap}
            />
          </div>

          {/* Classic Bottom Wooden Dock over Meadow */}
          <div className="px-2 pb-1.5 pt-1 bg-gradient-to-t from-[#4a280d]/95 via-[#683d17]/95 to-[#804c1e]/95 border-t-2 border-[#cfa06b] flex flex-wrap items-center justify-between gap-1.5 shrink-0">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <ToolButton
                active={farmTool === 'plant'}
                onClick={() => {
                  setFarmTool('plant');
                  toggleConsoleTab('seeds');
                }}
                icon={<Sprout className="w-4 h-4" />}
                label={showConsole && rightTab === 'seeds' ? `Gieo ${selectedSeed.icon}` : 'Trồng Cây 🌱'}
                activeClass="bg-emerald-600 text-white border-emerald-950"
              />
              <ToolButton
                active={farmTool === 'water'}
                onClick={() => {
                  setFarmTool('water');
                  setPendingPlotIndex(null);
                  if (showConsole && rightTab === 'seeds') setShowConsole(false);
                }}
                icon={<Droplets className="w-4 h-4" />}
                label="Tưới Nước"
                activeClass="bg-sky-600 text-white border-sky-950"
              />
              <ToolButton
                active={farmTool === 'fertilize'}
                onClick={() => {
                  setFarmTool('fertilize');
                  setPendingPlotIndex(null);
                  if (showConsole && rightTab === 'seeds') setShowConsole(false);
                }}
                icon={<Sparkles className="w-4 h-4" />}
                label={`Bón Phân (${fertilizerCount})`}
                activeClass="bg-amber-500 text-amber-950 border-amber-950"
              />
              <ToolButton
                active={farmTool === 'uproot'}
                onClick={() => {
                  setFarmTool('uproot');
                  setPendingPlotIndex(null);
                  if (showConsole && rightTab === 'seeds') setShowConsole(false);
                }}
                icon={<Trash2 className="w-4 h-4" />}
                label="Nhổ Bỏ"
                activeClass="bg-rose-600 text-white border-rose-950"
              />
            </div>

            {/* Quick Drawer Buttons (Hạt giống / Đơn hàng / Kho) */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => toggleConsoleTab('seeds')}
                className={`px-2 py-1.5 rounded-xl border-2 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer whitespace-nowrap transition ${
                  showConsole && rightTab === 'seeds'
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-700'
                    : 'bg-[#f4e5c8] hover:bg-white text-[#4a280d] border-[#cfa06b]'
                }`}
              >
                <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                <span>Hạt Giống</span>
              </button>
              <button
                type="button"
                onClick={() => toggleConsoleTab('orders')}
                className={`px-2 py-1.5 rounded-xl border-2 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer whitespace-nowrap transition ${
                  showConsole && rightTab === 'orders'
                    ? 'bg-amber-200 text-[#3c1e08] border-amber-800'
                    : 'bg-[#f4e5c8] hover:bg-white text-[#4a280d] border-[#cfa06b]'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-amber-800" />
                <span>Đơn ({orders.length})</span>
              </button>
              <button
                type="button"
                onClick={() => toggleConsoleTab('storage')}
                className={`px-2 py-1.5 rounded-xl border-2 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer whitespace-nowrap transition ${
                  showConsole && rightTab === 'storage'
                    ? 'bg-amber-200 text-[#3c1e08] border-amber-800'
                    : 'bg-[#f4e5c8] hover:bg-white text-[#4a280d] border-[#cfa06b]'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-amber-800" />
                <span>Kho ({totalStoredCrops})</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT / BOTTOM: SEEDS (25), DELIVERY ORDERS & STORAGE CONSOLE (Hidden until needed) */}
        {showConsole && (
        <aside className="h-[46dvh] md:h-full [@media(max-height:500px)]:h-full md:w-[345px] lg:w-[395px] [@media(max-height:500px)]:w-[295px] shrink-0 bg-[#f6e8cb] border-t-3 md:border-t-0 md:border-l-3 [@media(max-height:500px)]:border-t-0 [@media(max-height:500px)]:border-l-3 border-[#4a280d] flex flex-col min-h-0 shadow-2xl">
          {/* Tabs + Collapse button */}
          <div className="flex items-center gap-1 p-1.5 bg-[#e4cca0] border-b-2 border-[#b4834b] shrink-0">
            <div className="grid grid-cols-3 gap-1 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setRightTab('seeds')}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  rightTab === 'seeds'
                    ? 'bg-[#6b3e17] text-amber-50 shadow-xs'
                    : 'text-[#4a280d] hover:bg-white/60'
                }`}
              >
                <Sprout className="w-3.5 h-3.5" /> Hạt (25)
              </button>
              <button
                type="button"
                onClick={() => setRightTab('orders')}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  rightTab === 'orders'
                    ? 'bg-[#6b3e17] text-amber-50 shadow-xs'
                    : 'text-[#4a280d] hover:bg-white/60'
                }`}
              >
                <Truck className="w-3.5 h-3.5" /> Đơn ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setRightTab('storage')}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  rightTab === 'storage'
                    ? 'bg-[#6b3e17] text-amber-50 shadow-xs'
                    : 'text-[#4a280d] hover:bg-white/60'
                }`}
              >
                <Package className="w-3.5 h-3.5" /> Kho ({totalStoredCrops})
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowConsole(false);
                setPendingPlotIndex(null);
              }}
              title="Thu gọn bảng để nhìn rõ ruộng"
              aria-label="Thu gọn bảng hạt giống"
              className="px-2 py-1.5 rounded-lg bg-[#6b3e17]/15 hover:bg-[#6b3e17]/25 text-[#4a280d] font-extrabold text-[11px] flex items-center gap-0.5 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0 overflow-y-auto farm-scroll p-2.5 space-y-2 safe-bottom">
            {rightTab === 'seeds' && (
              <>
                {pendingPlotIndex !== null && (
                  <div className="px-2.5 py-1.5 rounded-xl bg-emerald-100 border-2 border-emerald-500 text-emerald-950 text-[11px] font-extrabold flex items-center justify-between gap-2">
                    <span>🌱 Bấm chọn hạt bên dưới để gieo ngay vào Ô #{pendingPlotIndex + 1}</span>
                    <button
                      type="button"
                      onClick={() => setPendingPlotIndex(null)}
                      className="text-emerald-800 hover:text-emerald-950 underline shrink-0 cursor-pointer"
                    >
                      Hủy ô
                    </button>
                  </div>
                )}
                {/* Fertilizer Buy Row */}
                <div className="p-2 rounded-xl bg-amber-50 border border-[#c29b68] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-[#4a280d]">
                    <SupplyItemSprite itemId="fertilizer" size={30} className="shrink-0" />
                    <div>
                      <div className="font-extrabold">Phân Bón (Còn {fertilizerCount})</div>
                      <div className="text-[10px] text-[#78471e]">
                        Giảm 50% thời gian · Dọn phân heo cũng rớt!
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={state.coins < FERTILIZER_PRICE}
                      onClick={() => onBuyFertilizer(1)}
                      className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-stone-300 text-white text-[10px] font-bold cursor-pointer whitespace-nowrap"
                    >
                      +1 ({FERTILIZER_PRICE}₫)
                    </button>
                    <button
                      type="button"
                      disabled={state.coins < FERTILIZER_PRICE * 5}
                      onClick={() => onBuyFertilizer(5)}
                      className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 text-white text-[10px] font-bold cursor-pointer whitespace-nowrap"
                    >
                      +5 ({FERTILIZER_PRICE * 5}₫)
                    </button>
                  </div>
                </div>

                {/* Filter Segmented Control */}
                <div className="flex flex-wrap gap-1 p-1 bg-[#ead6b2] rounded-xl">
                  {(
                    [
                      { id: 'all', label: 'Tất cả' },
                      { id: 'coin', label: '💰 Xu' },
                      { id: 'xp', label: '⭐ XP' },
                      { id: 'feed', label: '🐷 Cám' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFocusFilter(f.id)}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-extrabold cursor-pointer whitespace-nowrap transition-colors ${
                        focusFilter === f.id
                          ? 'bg-[#4a280d] text-amber-100 shadow-xs'
                          : 'text-[#5c3618] hover:bg-white/60'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Seed List */}
                <div className="space-y-1.5">
                  {filteredSeeds.map((seed) => {
                    const isLocked = state.level < seed.unlockLevel;
                    const isSelected = selectedSeedId === seed.id;
                    const focusInfo = FOCUS_META[seed.focus];
                    return (
                      <button
                        key={seed.id}
                        type="button"
                        disabled={isLocked}
                        onClick={() => {
                          setSelectedSeedId(seed.id);
                          setFarmTool('plant');
                          if (pendingPlotIndex !== null) {
                            onPlantSeed(pendingPlotIndex, seed.id);
                            setPendingPlotIndex(null);
                          }
                        }}
                        className={`w-full text-left p-2 rounded-xl border-2 flex items-center gap-2 transition-colors ${
                          isLocked
                            ? 'bg-stone-100 border-stone-300 opacity-65 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-50 border-emerald-600 cursor-pointer'
                            : 'bg-white border-[#d6b27e] hover:bg-amber-50 cursor-pointer'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#fef3c7] border border-[#d6b27e] flex items-center justify-center text-xl shrink-0">
                          {seed.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display font-bold text-xs text-[#3c1e08] truncate">
                              {seed.name}
                            </span>
                            <span className={`text-[10px] font-extrabold whitespace-nowrap ${isLocked ? 'text-rose-700' : focusInfo.textClass}`}>
                              {isLocked ? `🔒 Lv.${seed.unlockLevel}` : focusInfo.label}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#6d411c] font-mono-nums mt-0.5 truncate">
                            ⏱️ {formatDuration(seed.growthSec)} · 🌱 {seed.seedPrice}₫ · 💰 +{seed.harvestCoins * seed.harvestYield}₫ · ⭐ +{seed.harvestXp * seed.harvestYield}XP · 🥣 +{seed.feedYield}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {rightTab === 'orders' && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-[#5c3618] px-1">
                  Giao nông sản thu hoạch để nhận thưởng lớn Xu, XP & Ngọc.
                </p>
                {orders.map((order) => {
                  const canFulfill = order.items.every(
                    (req) => (storage[req.seedId] || 0) >= req.qty
                  );
                  return (
                    <div
                      key={order.id}
                      className="p-2.5 rounded-xl bg-white border border-[#c29b68] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-display font-bold text-xs text-[#3c1e08] truncate">
                            🚚 {order.title} · {order.customer}
                          </div>
                          <div className="text-[10px] font-bold text-amber-800 font-mono-nums mt-0.5">
                            +{order.rewardCoins.toLocaleString('vi-VN')} ₫ · +{order.rewardXp} XP · +{order.rewardGems} 💎
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRefreshOrder(order.id)}
                          title="Đổi đơn hàng khác"
                          className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-[#5c3618] cursor-pointer shrink-0"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                        {order.items.map((req) => {
                          const seed = CROP_SEED_MAP[req.seedId] || CROP_SEEDS[0];
                          const owned = storage[req.seedId] || 0;
                          const ok = owned >= req.qty;
                          return (
                            <span
                              key={req.seedId}
                              className={`flex items-center gap-1 ${
                                ok ? 'text-emerald-800' : 'text-rose-700'
                              }`}
                            >
                              <span>{seed.icon}</span>
                              <span>{seed.name}:</span>
                              <span className="font-mono-nums">
                                {owned}/{req.qty}
                              </span>
                            </span>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        disabled={!canFulfill}
                        onClick={() => onCompleteOrder(order.id)}
                        className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 disabled:text-stone-600 text-white text-xs font-extrabold cursor-pointer"
                      >
                        {canFulfill ? 'Giao Hàng Nhận Thưởng 🚚' : 'Chưa Đủ Nông Sản'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {rightTab === 'storage' && (
              <div className="space-y-2">
                {storedEntries.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#78471e] space-y-1">
                    <ShoppingBag className="w-8 h-8 mx-auto text-[#b47b44]" />
                    <p className="font-bold">Kho nông sản đang trống!</p>
                    <p>Gieo hạt trên cánh đồng, tưới nước và thu hoạch để ép thành Cám heo hoặc giao hàng.</p>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onConvertAllCropsToFeed}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <SupplyItemSprite itemId="feed_standard" size={20} />
                      <span>Ép Tất Cả Thành Thức Ăn Cho Heo</span>
                    </button>

                    {storedEntries.map(({ seed, qty }) => (
                      <div
                        key={seed.id}
                        className="p-2 rounded-xl bg-white border border-[#c29b68] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl shrink-0">{seed.icon}</span>
                          <div className="min-w-0">
                            <div className="font-display font-bold text-xs text-[#3c1e08] truncate">
                              {seed.name} <span className="font-mono-nums text-amber-800">×{qty}</span>
                            </div>
                            <div className="text-[10px] text-[#6d411c] font-mono-nums">
                              1 trái → +{seed.feedYield} Cám{seed.feedYield >= 6 ? ' +1 Bánh' : ''} · Bán +{seed.harvestCoins}₫
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onConvertCropToFeed(seed.id, 1)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer whitespace-nowrap"
                          >
                            +Cám
                          </button>
                          <button
                            type="button"
                            onClick={() => onSellCrop(seed.id, qty)}
                            className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold cursor-pointer whitespace-nowrap"
                          >
                            Bán hết
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </aside>
        )}
      </div>
    </div>
  );
};

interface ToolButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeClass: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  active,
  onClick,
  icon,
  label,
  activeClass,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2.5 py-1.5 [@media(max-height:500px)]:py-1 rounded-xl border-2 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer whitespace-nowrap transition-transform active:scale-95 ${
      active
        ? `${activeClass} shadow-md`
        : 'bg-[#fef3c7] text-[#4a280d] border-[#4a280d] hover:bg-amber-100'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
