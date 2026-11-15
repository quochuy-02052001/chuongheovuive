import { CropOrder, CropSeed, FarmPlot } from '../types/game';

export const TOTAL_FARM_PLOTS = 25;
export const STARTER_FARM_PLOTS = 5;
export const FERTILIZER_PRICE = 35;

// 25 plots (5x5): plots 0..4 unlocked at Lv.1, plots 5..24 unlock gradually from Lv.2 to Lv.25
const EXTRA_PLOT_UNLOCK_LEVELS = [
  2, 3, 4, 5, 6,
  7, 8, 9, 10, 12,
  13, 14, 15, 16, 18,
  19, 20, 22, 24, 25,
];

export function getPlotUnlockLevel(plotIndex: number): number {
  if (plotIndex < STARTER_FARM_PLOTS) return 1;
  const extraIdx = plotIndex - STARTER_FARM_PLOTS;
  return EXTRA_PLOT_UNLOCK_LEVELS[extraIdx] ?? 25;
}

export function getUnlockedPlotCount(level: number): number {
  let count = STARTER_FARM_PLOTS;
  for (const reqLv of EXTRA_PLOT_UNLOCK_LEVELS) {
    if (level >= reqLv) count += 1;
  }
  return Math.min(TOTAL_FARM_PLOTS, count);
}

export const CROP_SEEDS: CropSeed[] = [
  {
    id: 'seed_grass',
    name: 'Cỏ Non Tươi',
    icon: '🌿',
    unlockLevel: 1,
    seedPrice: 12,
    growthSec: 25,
    focus: 'feed',
    harvestCoins: 24,
    harvestXp: 8,
    feedYield: 2,
    harvestYield: 2,
    description: 'Nhanh thu hoạch, ép thành nhiều Cám nuôi heo.',
  },
  {
    id: 'seed_carrot',
    name: 'Cà Rốt Giòn',
    icon: '🥕',
    unlockLevel: 1,
    seedPrice: 18,
    growthSec: 35,
    focus: 'xp',
    harvestCoins: 34,
    harvestXp: 16,
    feedYield: 2,
    harvestYield: 2,
    description: 'Cây khởi đầu nhiều Kinh Nghiệm để lên cấp nhanh.',
  },
  {
    id: 'seed_corn',
    name: 'Bắp Ngọt Vàng',
    icon: '🌽',
    unlockLevel: 2,
    seedPrice: 24,
    growthSec: 45,
    focus: 'coin',
    harvestCoins: 56,
    harvestXp: 12,
    feedYield: 2,
    harvestYield: 2,
    description: 'Bắp vàng đắt hàng, bán hoặc giao hàng nhiều Xu.',
  },
  {
    id: 'seed_lettuce',
    name: 'Xà Lách Mỡ',
    icon: '🥬',
    unlockLevel: 3,
    seedPrice: 28,
    growthSec: 50,
    focus: 'feed',
    harvestCoins: 52,
    harvestXp: 15,
    feedYield: 3,
    harvestYield: 2,
    description: 'Rau xanh mướt cho sản lượng thức ăn heo dồi dào.',
  },
  {
    id: 'seed_tomato',
    name: 'Cà Chua Bi',
    icon: '🍅',
    unlockLevel: 4,
    seedPrice: 35,
    growthSec: 65,
    focus: 'xp',
    harvestCoins: 72,
    harvestXp: 28,
    feedYield: 2,
    harvestYield: 2,
    description: 'Trái chín đỏ mọng, thưởng XP chăm chỉ cực cao.',
  },
  {
    id: 'seed_potato',
    name: 'Khoai Tây Bơ',
    icon: '🥔',
    unlockLevel: 5,
    seedPrice: 42,
    growthSec: 75,
    focus: 'coin',
    harvestCoins: 98,
    harvestXp: 20,
    feedYield: 3,
    harvestYield: 2,
    description: 'Củ to chắc thịt, nguồn thu nhập Xu ổn định.',
  },
  {
    id: 'seed_sweet_potato',
    name: 'Khoai Lang Mật',
    icon: '🍠',
    unlockLevel: 6,
    seedPrice: 48,
    growthSec: 90,
    focus: 'feed',
    harvestCoins: 92,
    harvestXp: 24,
    feedYield: 4,
    harvestYield: 2,
    description: 'Ngọt bùi, chuyển hóa thành lượng lớn thức ăn heo.',
  },
  {
    id: 'seed_cucumber',
    name: 'Dưa Chuột Xanh',
    icon: '🥒',
    unlockLevel: 7,
    seedPrice: 54,
    growthSec: 100,
    focus: 'xp',
    harvestCoins: 105,
    harvestXp: 42,
    feedYield: 3,
    harvestYield: 2,
    description: 'Thanh mát dễ trồng, tăng XP vượt trội.',
  },
  {
    id: 'seed_wheat',
    name: 'Lúa Mì Vàng',
    icon: '🌾',
    unlockLevel: 8,
    seedPrice: 60,
    growthSec: 110,
    focus: 'feed',
    harvestCoins: 115,
    harvestXp: 30,
    feedYield: 5,
    harvestYield: 3,
    description: 'Nguyên liệu vàng để chế biến Cám Heo số lượng lớn.',
  },
  {
    id: 'seed_onion',
    name: 'Hành Tây Tím',
    icon: '🧅',
    unlockLevel: 9,
    seedPrice: 68,
    growthSec: 120,
    focus: 'coin',
    harvestCoins: 158,
    harvestXp: 32,
    feedYield: 3,
    harvestYield: 2,
    description: 'Gia vị quý được các đơn giao hàng săn đón giá cao.',
  },
  {
    id: 'seed_chili',
    name: 'Ớt Hiểm Đỏ',
    icon: '🌶️',
    unlockLevel: 10,
    seedPrice: 75,
    growthSec: 135,
    focus: 'coin',
    harvestCoins: 178,
    harvestXp: 36,
    feedYield: 3,
    harvestYield: 2,
    description: 'Cay nồng thơm lừng, bán chạy giá rất cao.',
  },
  {
    id: 'seed_eggplant',
    name: 'Cà Tím Bóng',
    icon: '🍆',
    unlockLevel: 11,
    seedPrice: 82,
    growthSec: 150,
    focus: 'xp',
    harvestCoins: 162,
    harvestXp: 64,
    feedYield: 4,
    harvestYield: 2,
    description: 'Trái tím óng ả giúp chủ trại cày cấp thần tốc.',
  },
  {
    id: 'seed_broccoli',
    name: 'Bông Cải Xanh',
    icon: '🥦',
    unlockLevel: 12,
    seedPrice: 90,
    growthSec: 165,
    focus: 'feed',
    harvestCoins: 175,
    harvestXp: 46,
    feedYield: 6,
    harvestYield: 2,
    description: 'Giàu dinh dưỡng, ép được rất nhiều phần ăn cho heo.',
  },
  {
    id: 'seed_pumpkin',
    name: 'Bí Ngô Khổng Lồ',
    icon: '🎃',
    unlockLevel: 13,
    seedPrice: 105,
    growthSec: 180,
    focus: 'coin',
    harvestCoins: 245,
    harvestXp: 50,
    feedYield: 5,
    harvestYield: 2,
    description: 'Quả to tròn nặng ký, bán được món Xu lớn.',
  },
  {
    id: 'seed_strawberry',
    name: 'Dâu Tây Đà Lạt',
    icon: '🍓',
    unlockLevel: 14,
    seedPrice: 120,
    growthSec: 200,
    focus: 'xp',
    harvestCoins: 240,
    harvestXp: 90,
    feedYield: 4,
    harvestYield: 3,
    description: 'Hương thơm ngọt ngào, thưởng Kinh Nghiệm cực hậu.',
  },
  {
    id: 'seed_blueberry',
    name: 'Việt Quất Rừng',
    icon: '🫐',
    unlockLevel: 15,
    seedPrice: 135,
    growthSec: 220,
    focus: 'xp',
    harvestCoins: 268,
    harvestXp: 105,
    feedYield: 4,
    harvestYield: 3,
    description: 'Siêu quả rừng sâu, chuyên dùng để bứt phá cấp độ.',
  },
  {
    id: 'seed_watermelon',
    name: 'Dưa Hấu Ruột Đỏ',
    icon: '🍉',
    unlockLevel: 16,
    seedPrice: 150,
    growthSec: 240,
    focus: 'coin',
    harvestCoins: 350,
    harvestXp: 68,
    feedYield: 6,
    harvestYield: 2,
    description: 'Quả to mọng nước, giá thu mua luôn top đầu.',
  },
  {
    id: 'seed_grape',
    name: 'Nho Tím Không Hạt',
    icon: '🍇',
    unlockLevel: 17,
    seedPrice: 168,
    growthSec: 260,
    focus: 'coin',
    harvestCoins: 395,
    harvestXp: 76,
    feedYield: 5,
    harvestYield: 2,
    description: 'Chùm nho thượng hạng dành cho đơn hàng cao cấp.',
  },
  {
    id: 'seed_pineapple',
    name: 'Dứa Mật Hoàng Kim',
    icon: '🍍',
    unlockLevel: 18,
    seedPrice: 185,
    growthSec: 280,
    focus: 'feed',
    harvestCoins: 365,
    harvestXp: 88,
    feedYield: 8,
    harvestYield: 2,
    description: 'Giàu vitamin, làm thức ăn giúp đàn heo lớn khỏe.',
  },
  {
    id: 'seed_mango',
    name: 'Xoài Cát Vàng',
    icon: '🥭',
    unlockLevel: 19,
    seedPrice: 205,
    growthSec: 300,
    focus: 'coin',
    harvestCoins: 480,
    harvestXp: 92,
    feedYield: 6,
    harvestYield: 2,
    description: 'Đặc sản xuất khẩu, thu về lượng Xu cực khủng.',
  },
  {
    id: 'seed_avocado',
    name: 'Bơ Sáp Tây Nguyên',
    icon: '🥑',
    unlockLevel: 20,
    seedPrice: 225,
    growthSec: 330,
    focus: 'feed',
    harvestCoins: 440,
    harvestXp: 108,
    feedYield: 10,
    harvestYield: 2,
    description: 'Béo ngậy giàu dưỡng chất nhất cho đàn heo.',
  },
  {
    id: 'seed_peach',
    name: 'Đào Tiên Vườn Ngọc',
    icon: '🍑',
    unlockLevel: 21,
    seedPrice: 250,
    growthSec: 360,
    focus: 'xp',
    harvestCoins: 500,
    harvestXp: 185,
    feedYield: 6,
    harvestYield: 2,
    description: 'Quả tiên thanh khiết mang lại nguồn Kinh Nghiệm dồi dào.',
  },
  {
    id: 'seed_cherry',
    name: 'Cherry Đỏ Hoàng Gia',
    icon: '🍒',
    unlockLevel: 22,
    seedPrice: 280,
    growthSec: 400,
    focus: 'coin',
    harvestCoins: 670,
    harvestXp: 120,
    feedYield: 6,
    harvestYield: 3,
    description: 'Trái cây nhập khẩu quý hiếm với giá trị Xu đỉnh cao.',
  },
  {
    id: 'seed_sunflower',
    name: 'Hướng Dương Mặt Trời',
    icon: '🌻',
    unlockLevel: 23,
    seedPrice: 310,
    growthSec: 440,
    focus: 'xp',
    harvestCoins: 620,
    harvestXp: 240,
    feedYield: 8,
    harvestYield: 2,
    description: 'Rực rỡ ánh nắng, cày XP nhanh bậc nhất nông trại.',
  },
  {
    id: 'seed_truffle',
    name: 'Nấm Truffle Vàng',
    icon: '🍄',
    unlockLevel: 25,
    seedPrice: 360,
    growthSec: 500,
    focus: 'coin',
    harvestCoins: 880,
    harvestXp: 195,
    feedYield: 10,
    harvestYield: 2,
    description: 'Cực phẩm nông trại cấp 25 — siêu lợi nhuận Xu & XP!',
  },
];

export const CROP_SEED_MAP: Record<string, CropSeed> = Object.fromEntries(
  CROP_SEEDS.map((s) => [s.id, s])
);

export function createInitialCropPlots(): FarmPlot[] {
  return Array.from({ length: TOTAL_FARM_PLOTS }, (_, index) => ({
    index,
    seedId: null,
    plantedAt: 0,
    lastUpdatedAt: 0,
    growthMs: 0,
    watered: false,
    fertilizedCount: 0,
  }));
}

export function computePlotProgress(plot: FarmPlot, now: number): {
  progressPct: number;
  remainingSec: number;
  isReady: boolean;
  effectiveElapsedMs: number;
  totalMs: number;
} {
  if (!plot.seedId) {
    return { progressPct: 0, remainingSec: 0, isReady: false, effectiveElapsedMs: 0, totalMs: 0 };
  }
  const seed = CROP_SEED_MAP[plot.seedId] || CROP_SEEDS[0];
  const totalMs = seed.growthSec * 1000;
  const deltaReal = Math.max(0, now - (plot.lastUpdatedAt || plot.plantedAt || now));
  // Watered soil grows at 1.0x speed; dry unwatered soil grows slowly at 0.45x
  const speedMultiplier = plot.watered ? 1 : 0.45;
  const effectiveElapsedMs = Math.min(totalMs, (plot.growthMs || 0) + deltaReal * speedMultiplier);
  const remainingEffectiveMs = Math.max(0, totalMs - effectiveElapsedMs);
  // Show real seconds remaining at current hydration speed
  const remainingSec = Math.ceil(remainingEffectiveMs / (speedMultiplier * 1000));
  const progressPct = Math.min(100, (effectiveElapsedMs / totalMs) * 100);
  return {
    progressPct,
    remainingSec,
    isReady: effectiveElapsedMs >= totalMs,
    effectiveElapsedMs,
    totalMs,
  };
}

export const TARGET_CROP_ORDERS = 6;

interface OrderCustomerTemplate {
  title: string;
  customer: string;
  minLevel: number;
}

const ORDER_CUSTOMERS: OrderCustomerTemplate[] = [
  { title: 'Đơn Chợ Sáng', customer: 'Bếp Cô Ba', minLevel: 1 },
  { title: 'Đơn Quán Cơm Quê', customer: 'Chị Tư Hiền', minLevel: 1 },
  { title: 'Đơn Căng Tin Trường', customer: 'Cô Lan', minLevel: 1 },
  { title: 'Đơn Sạp Rau Sạch', customer: 'Bác Năm', minLevel: 2 },
  { title: 'Đơn Nhà Hàng Xanh', customer: 'Đầu Bếp Minh', minLevel: 4 },
  { title: 'Đơn Tiệm Bánh Ngọt', customer: 'Tiệm Mochi', minLevel: 4 },
  { title: 'Đơn Quán Sinh Tố', customer: 'Trà Sữa Bông', minLevel: 5 },
  { title: 'Đơn Siêu Thị Nông Sản', customer: 'Quầy Trái Cây', minLevel: 6 },
  { title: 'Đơn Khách Sạn 5 Sao', customer: 'Chef Hoàng', minLevel: 10 },
  { title: 'Đơn Tiệc Cưới Mùa Thu', customer: 'Nhà Hàng Sen', minLevel: 12 },
  { title: 'Đơn Thực Phẩm Hữu Cơ', customer: 'GreenMart', minLevel: 14 },
  { title: 'Đơn Xuất Khẩu Tươi', customer: 'Thương Lái Huy', minLevel: 16 },
  { title: 'Đơn Quà Biếu Cao Cấp', customer: 'Phủ Chủ Tịch', minLevel: 20 },
  { title: 'Đơn Đặc Sản Hoàng Gia', customer: 'Ẩm Thực Cung Đình', minLevel: 22 },
];

function pickWeightedSeed(pool: CropSeed[], safeLevel: number): CropSeed {
  const weights = pool.map((seed) => {
    const gap = Math.max(0, safeLevel - seed.unlockLevel);
    if (gap <= 3) return 6; // Prioritize newly unlocked crops for current level
    if (gap <= 7) return 3;
    return 1;
  });
  const total = weights.reduce((sum, w) => sum + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

export function generateCropOrder(level: number, preferredMinItems?: number): CropOrder {
  const safeLevel = Math.max(1, level);
  const availableSeeds = CROP_SEEDS.filter((s) => s.unlockLevel <= safeLevel);
  const maxDistinct = availableSeeds.length;

  let itemCount = 1;
  if (safeLevel <= 2) {
    itemCount = maxDistinct >= 2 && Math.random() < 0.5 ? 2 : 1;
  } else if (safeLevel <= 6) {
    itemCount = maxDistinct >= 2 ? (Math.random() < 0.8 ? 2 : 1) : 1;
  } else if (safeLevel <= 13) {
    itemCount = maxDistinct >= 3 && Math.random() < 0.55 ? 3 : 2;
  } else {
    itemCount = maxDistinct >= 4 && Math.random() < 0.45 ? 4 : 3;
  }

  if (preferredMinItems !== undefined) {
    itemCount = Math.max(itemCount, preferredMinItems);
  }
  itemCount = Math.min(maxDistinct, itemCount);

  const remaining = [...availableSeeds];
  const picked: CropSeed[] = [];
  for (let i = 0; i < itemCount && remaining.length > 0; i++) {
    const chosen = pickWeightedSeed(remaining, safeLevel);
    picked.push(chosen);
    const idx = remaining.findIndex((s) => s.id === chosen.id);
    if (idx >= 0) remaining.splice(idx, 1);
  }

  const levelQtyBonus = safeLevel >= 15 ? 2 : safeLevel >= 7 ? 1 : 0;
  const items = picked.map((seed) => {
    // High-unlock crops ask for slightly tighter quantities so orders remain rewarding
    const isTopCrop = seed.unlockLevel >= 16;
    const baseQty = isTopCrop ? 2 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 3);
    return {
      seedId: seed.id,
      qty: Math.min(7, baseQty + (isTopCrop ? Math.min(1, levelQtyBonus) : levelQtyBonus)),
    };
  });

  let baseCoins = 0;
  let baseXp = 0;
  for (const req of items) {
    const seed = CROP_SEED_MAP[req.seedId] || CROP_SEEDS[0];
    baseCoins += seed.harvestCoins * req.qty;
    baseXp += seed.harvestXp * req.qty;
  }

  const coinMult = 1.45 + Math.min(0.45, (safeLevel - 1) * 0.02);
  const xpMult = 1.55 + Math.min(0.55, (safeLevel - 1) * 0.025);

  const eligibleCustomers = ORDER_CUSTOMERS.filter((c) => c.minLevel <= safeLevel);
  // Prefer higher-tier customers as level rises
  const tierPool = eligibleCustomers.slice(-Math.min(eligibleCustomers.length, 6));
  const cust = tierPool[Math.floor(Math.random() * tierPool.length)] || ORDER_CUSTOMERS[0];

  return {
    id: `order_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`,
    title: cust.title,
    customer: cust.customer,
    items,
    rewardCoins: Math.round(baseCoins * coinMult),
    rewardXp: Math.round(baseXp * xpMult),
    rewardGems: itemCount >= 4 ? 4 : itemCount === 3 ? 3 : itemCount === 2 ? 2 : 1,
  };
}

export function createInitialCropOrders(level: number): CropOrder[] {
  const safeLevel = Math.max(1, level);
  return Array.from({ length: TARGET_CROP_ORDERS }, (_, idx) =>
    generateCropOrder(safeLevel, idx === TARGET_CROP_ORDERS - 1 && safeLevel >= 5 ? 3 : undefined)
  );
}

export function ensureCropOrdersForLevel(
  existingOrders: CropOrder[] | undefined,
  level: number,
  prevLevel?: number,
  storage?: Record<string, number>
): CropOrder[] {
  const safeLevel = Math.max(1, level);
  if (!Array.isArray(existingOrders) || existingOrders.length === 0) {
    return createInitialCropOrders(safeLevel);
  }

  let next = [...existingOrders];

  // If the player just leveled up and unlocked new seeds, refresh unstarted orders
  // (orders where player holds 0 of every requested crop) so new crops appear immediately!
  if (prevLevel !== undefined && safeLevel > prevLevel) {
    const unlockedNewSeed = CROP_SEEDS.some(
      (s) => s.unlockLevel > prevLevel && s.unlockLevel <= safeLevel
    );
    if (unlockedNewSeed) {
      let refreshedCount = 0;
      next = next.map((order) => {
        const hasAnyStock = order.items.some((req) => ((storage || {})[req.seedId] || 0) > 0);
        if (!hasAnyStock && refreshedCount < 3) {
          refreshedCount += 1;
          return generateCropOrder(safeLevel);
        }
        return order;
      });
    }
  }

  while (next.length < TARGET_CROP_ORDERS) {
    next.push(generateCropOrder(safeLevel));
  }

  return next;
}
