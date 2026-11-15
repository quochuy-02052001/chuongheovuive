import { createInitialCropOrders, createInitialCropPlots, getUnlockedPlotCount } from '../data/cropSeeds';
import { BREED_MAP, PIG_BREEDS } from '../data/pigBreeds';
import {
  AchievementItem,
  CouplePacket,
  FarmState,
  NeighborFarm,
  PartnerSlot,
  PigInstance,
  QuestItem,
  YardDrop,
} from '../types/game';
import { getVietnamDateKey } from './vietnamTime';

const LEGACY_STORAGE_KEY = 'chuong_heo_vui_ve_save_v1';
const ACTIVE_SLOT_KEY = 'chuong_heo_active_slot_v2';
const SLOT_KEYS: Record<PartnerSlot, string> = {
  partner_a: 'chuong_heo_save_partner_a_v2',
  partner_b: 'chuong_heo_save_partner_b_v2',
};

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

export const STARTER_BARN_CAPACITY = 5;
export const MAX_BARN_CAPACITY = 11;

export interface BarnUpgradeTier {
  requiredLevel: number;
  targetCapacity: number;
  cost: number;
}

export const BARN_UPGRADE_TIERS: BarnUpgradeTier[] = [
  { requiredLevel: 10, targetCapacity: 7, cost: 1500 },
  { requiredLevel: 20, targetCapacity: 9, cost: 3500 },
  { requiredLevel: 30, targetCapacity: 11, cost: 7000 },
];

export const MAX_STORED_PIGS = 30;
export const MAX_STEALS_PER_DAY = 2;

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
}

export function hasAnySavedFarm(): boolean {
  try {
    return Boolean(
      localStorage.getItem(SLOT_KEYS.partner_a) ||
        localStorage.getItem(SLOT_KEYS.partner_b) ||
        localStorage.getItem(LEGACY_STORAGE_KEY)
    );
  } catch {
    return false;
  }
}

export function getMaxBarnCapacityForLevel(level: number): number {
  let max = STARTER_BARN_CAPACITY;
  for (const tier of BARN_UPGRADE_TIERS) {
    if (level >= tier.requiredLevel) {
      max = tier.targetCapacity;
    }
  }
  return max;
}

export function getBarnExpandInfo(currentCapacity: number, level: number) {
  const nextTier = BARN_UPGRADE_TIERS.find((tier) => tier.targetCapacity > currentCapacity);
  if (!nextTier || currentCapacity >= MAX_BARN_CAPACITY) {
    return {
      isMax: true,
      nextCapacity: MAX_BARN_CAPACITY,
      increment: 0,
      requiredLevel: 30,
      cost: 0,
      isLevelLocked: false,
    };
  }
  return {
    isMax: false,
    nextCapacity: nextTier.targetCapacity,
    increment: Math.max(1, nextTier.targetCapacity - currentCapacity),
    requiredLevel: nextTier.requiredLevel,
    cost: nextTier.cost,
    isLevelLocked: level < nextTier.requiredLevel,
  };
}

export function getBarnExpandCost(currentCapacity: number): number {
  return getBarnExpandInfo(currentCapacity, 999).cost;
}

const RARITY_COSTS: Record<string, number> = {
  common: 40,
  uncommon: 90,
  rare: 220,
  epic: 500,
  legendary: 900,
};

export function calculateBreedingCost(breedAId: string, breedBId: string): number {
  const bA = BREED_MAP[breedAId] || PIG_BREEDS[0];
  const bB = BREED_MAP[breedBId] || PIG_BREEDS[0];
  const costA = RARITY_COSTS[bA.rarity] || 40;
  const costB = RARITY_COSTS[bB.rarity] || 40;
  return 60 + costA + costB;
}

export function createPigInstance(
  breedId: string,
  options?: { growth?: number; x?: number; y?: number; nickname?: string }
): PigInstance {
  const breed = PIG_BREEDS.find((b) => b.id === breedId) || PIG_BREEDS[0];
  const growth = options?.growth ?? 0;
  const stage = growth >= 100 ? 'adult' : growth >= 45 ? 'teen' : 'piglet';
  const x = options?.x ?? 28 + Math.random() * 42;
  const y = options?.y ?? 35 + Math.random() * 33;

  return {
    id: uid('pig'),
    breedId: breed.id,
    nickname: options?.nickname ?? breed.name,
    x,
    y,
    targetX: x,
    targetY: y,
    facing: Math.random() < 0.5 ? 'left' : 'right',
    isMoving: false,
    hunger: 78 + Math.floor(Math.random() * 20),
    thirst: 76 + Math.floor(Math.random() * 20),
    happiness: 80 + Math.floor(Math.random() * 18),
    health: 100,
    isSick: false,
    growth,
    stage,
    moodBubble: stage === 'adult' ? 'ready' : null,
  };
}

function createInitialNeighbors(_slot: PartnerSlot): NeighborFarm[] {
  // Xóa bạn mặc định, chỉ hiển thị khi kết bạn hoặc kết nối
  return [];
}

export function createInitialQuests(): QuestItem[] {
  return [
    {
      id: 'q_feed_50',
      title: 'Cho heo ăn & thu hoạch quà đỏ',
      iconType: 'feed',
      progress: 0,
      target: 15,
      rewardCoins: 350,
      rewardGems: 3,
      rewardXp: 80,
      claimed: false,
    },
    {
      id: 'q_raise_10',
      title: 'Chăm sóc & bán heo trưởng thành',
      iconType: 'scroll',
      progress: 0,
      target: 3,
      rewardCoins: 650,
      rewardGems: 5,
      rewardXp: 150,
      claimed: false,
    },
    {
      id: 'q_clean_yard',
      title: 'Dọn dẹp chuồng sạch sẽ',
      iconType: 'clean',
      progress: 0,
      target: 5,
      rewardCoins: 240,
      rewardGems: 2,
      rewardXp: 60,
      claimed: false,
    },
    {
      id: 'q_breed_1',
      title: 'Lai tạo giống heo mới trong chuồng',
      iconType: 'breed',
      progress: 0,
      target: 1,
      rewardCoins: 500,
      rewardGems: 4,
      rewardXp: 120,
      claimed: false,
    },
    {
      id: 'q_visit_1',
      title: 'Ghé thăm & giúp đỡ người yêu / hàng xóm',
      iconType: 'visit',
      progress: 0,
      target: 2,
      rewardCoins: 300,
      rewardGems: 2,
      rewardXp: 70,
      claimed: false,
    },
  ];
}

export function createInitialAchievements(): AchievementItem[] {
  return [
    // Sưu tầm giống
    {
      id: 'ach_barn_milestone_5',
      category: 'collection',
      title: 'Chủ Chuồng Tài Ba 🏆',
      description: 'Hoàn thành 5 thành tựu Chuồng Heo để nhận ngay giống heo hiếm độc quyền (không thể lai).',
      progress: 0,
      target: 5,
      rewardGems: 15,
      rewardCoins: 1000,
      rewardBreedId: 'crystal_trophy',
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_barn_milestone_10',
      category: 'collection',
      title: 'Huyền Thoại Chuồng Heo 👑',
      description: 'Hoàn thành 10 thành tựu Chuồng Heo để nhận ngay giống heo Cực Hiếm độc bản (không thể lai).',
      progress: 0,
      target: 10,
      rewardGems: 40,
      rewardCoins: 5000,
      rewardBreedId: 'ruby_emperor',
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_collector_5',
      category: 'collection',
      title: 'Nhà Sưu Tầm Nhí',
      description: 'Mở khóa 5 giống heo khác nhau trong sổ tay.',
      progress: 2,
      target: 5,
      rewardGems: 5,
      rewardCoins: 200,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_collector_14',
      category: 'collection',
      title: 'Bậc Thầy Giống Heo',
      description: 'Mở khóa 14 giống heo khác nhau.',
      progress: 2,
      target: 14,
      rewardGems: 15,
      rewardCoins: 800,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_collector_28',
      category: 'collection',
      title: 'Huyền Thoại 28 Giống',
      description: 'Sưu tầm trọn bộ 28 giống heo cơ bản & lai tạo trong sổ tay.',
      progress: 2,
      target: PIG_BREEDS.filter((b) => !b.achievementOnly).length,
      rewardGems: 50,
      rewardCoins: 3000,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_rare_1',
      category: 'collection',
      title: 'Thợ Săn Heo Hiếm',
      description: 'Mở khóa giống Heo Hiếm đầu tiên.',
      progress: 0,
      target: 1,
      rewardGems: 8,
      rewardCoins: 500,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_epic_1',
      category: 'collection',
      title: 'Chạm Tay Sử Thi',
      description: 'Mở khóa 1 giống Heo Sử Thi từ lai tạo.',
      progress: 0,
      target: 1,
      rewardGems: 15,
      rewardCoins: 1200,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_legend_1',
      category: 'collection',
      title: 'Đỉnh Cao Huyền Thoại',
      description: 'Mở khóa 1 giống Heo Cực Hiếm (Huyền Thoại).',
      progress: 0,
      target: 1,
      rewardGems: 30,
      rewardCoins: 2500,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_legend_3',
      category: 'collection',
      title: 'Vương Triều Cực Hiếm',
      description: 'Mở khóa 3 giống heo Cực Hiếm (Legendary) khác nhau.',
      progress: 0,
      target: 3,
      rewardGems: 80,
      rewardCoins: 12000,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_breeder_50',
      category: 'breed',
      title: 'Phòng Thí Nghiệm Tối Thượng',
      description: 'Lai tạo thành công 50 chú heo con.',
      progress: 0,
      target: 50,
      rewardGems: 60,
      rewardCoins: 10000,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_tycoon_100',
      category: 'wealth',
      title: 'Tỷ Phú Nông Trại Vàng',
      description: 'Bán tổng cộng 100 chú heo trưởng thành.',
      progress: 0,
      target: 100,
      rewardGems: 75,
      rewardCoins: 25000,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_love_500',
      category: 'social',
      title: 'Tình Yêu Vĩnh Cửu 💕',
      description: 'Đạt 500 Điểm Gắn Kết cùng người thương.',
      progress: 10,
      target: 500,
      rewardGems: 100,
      rewardCoins: 35000,
      unlocked: false,
      claimed: false,
    },

    // Chăm sóc & Dọn dẹp
    {
      id: 'ach_feed_20',
      category: 'care',
      title: 'Đầu Bếp Chuồng Heo',
      description: 'Cho đàn heo ăn đủ 20 lần.',
      progress: 0,
      target: 20,
      rewardGems: 4,
      rewardCoins: 250,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_feed_100',
      category: 'care',
      title: 'Vua Vỗ Béo',
      description: 'Cho đàn heo ăn đủ 100 lần.',
      progress: 0,
      target: 100,
      rewardGems: 12,
      rewardCoins: 1000,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_feed_500',
      category: 'care',
      title: 'Đại Tiệc Cám Heo',
      description: 'Cho đàn heo ăn đủ 500 lần — Cột mốc kiên trì!',
      progress: 0,
      target: 500,
      rewardGems: 45,
      rewardCoins: 8000,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_clean_10',
      category: 'care',
      title: 'Người Gìn Giữ Sạch Sẽ',
      description: 'Dọn dẹp vết bẩn trên sân 10 lần.',
      progress: 0,
      target: 10,
      rewardGems: 4,
      rewardCoins: 250,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_clean_50',
      category: 'care',
      title: 'Bậc Thầy Vệ Sinh',
      description: 'Dọn dẹp sân chuồng 50 lần.',
      progress: 0,
      target: 50,
      rewardGems: 10,
      rewardCoins: 900,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_clean_200',
      category: 'care',
      title: 'Thánh Dọn Dẹp Chuồng Trại',
      description: 'Dọn dẹp chuồng sạch bóng 200 lần.',
      progress: 0,
      target: 200,
      rewardGems: 40,
      rewardCoins: 7500,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_pet_25',
      category: 'care',
      title: 'Bàn Tay Dịu Dàng',
      description: 'Vuốt ve đàn heo 25 lần.',
      progress: 0,
      target: 25,
      rewardGems: 5,
      rewardCoins: 350,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_pet_150',
      category: 'care',
      title: 'Bàn Tay Phép Thuật',
      description: 'Vuốt ve đàn heo 150 lần, gắn kết sâu đậm.',
      progress: 0,
      target: 150,
      rewardGems: 30,
      rewardCoins: 5000,
      unlocked: false,
      claimed: false,
    },

    // Lai tạo & Đột phá
    {
      id: 'ach_breeder',
      category: 'breed',
      title: 'Chuyên Gia Lai Tạo',
      description: 'Lai tạo thành công 5 chú heo con.',
      progress: 0,
      target: 5,
      rewardGems: 10,
      rewardCoins: 500,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_breeder_20',
      category: 'breed',
      title: 'Phòng Lab Di Truyền',
      description: 'Lai tạo thành công 20 chú heo con.',
      progress: 0,
      target: 20,
      rewardGems: 25,
      rewardCoins: 1800,
      unlocked: false,
      claimed: false,
    },

    // Kinh doanh & Phát triển
    {
      id: 'ach_tycoon',
      category: 'wealth',
      title: 'Thương Nhân Khởi Nghiệp',
      description: 'Bán tổng cộng 10 chú heo trưởng thành.',
      progress: 0,
      target: 10,
      rewardGems: 12,
      rewardCoins: 600,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_tycoon_30',
      category: 'wealth',
      title: 'Triệu Phú Nông Trại',
      description: 'Bán tổng cộng 30 chú heo trưởng thành.',
      progress: 0,
      target: 30,
      rewardGems: 28,
      rewardCoins: 2200,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_level_5',
      category: 'wealth',
      title: 'Chủ Trại Tập Sự',
      description: 'Đạt Cấp độ trang trại Lv.5.',
      progress: 1,
      target: 5,
      rewardGems: 8,
      rewardCoins: 500,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_level_10',
      category: 'wealth',
      title: 'Đại Gia Chăn Nuôi',
      description: 'Đạt Cấp độ trang trại Lv.10.',
      progress: 1,
      target: 10,
      rewardGems: 20,
      rewardCoins: 1500,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_level_25',
      category: 'wealth',
      title: 'Bậc Thầy Nông Dân',
      description: 'Đạt Cấp độ trang trại Lv.25 tối thượng.',
      progress: 1,
      target: 25,
      rewardGems: 50,
      rewardCoins: 12000,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_barn_20',
      category: 'wealth',
      title: 'Chuồng Trại Khang Trang',
      description: 'Mở rộng sức chứa chuồng lên 9 chỗ (đạt Lv.20).',
      progress: 5,
      target: 9,
      rewardGems: 10,
      rewardCoins: 800,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_barn_28',
      category: 'wealth',
      title: 'Đại Trang Trại Tối Thượng',
      description: 'Mở rộng sức chứa chuồng lên mức tối đa (11 chỗ ở Lv.30).',
      progress: 5,
      target: 11,
      rewardGems: 60,
      rewardCoins: 15000,
      unlocked: false,
      claimed: false,
    },

    // Tình yêu & Cộng đồng
    {
      id: 'ach_love_30',
      category: 'social',
      title: 'Cặp Đôi Ngọt Ngào',
      description: 'Đạt 30 Điểm Gắn Kết 💕 cùng người yêu/bạn bè.',
      progress: 10,
      target: 30,
      rewardGems: 8,
      rewardCoins: 500,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_love_100',
      category: 'social',
      title: 'Tri Kỷ Chuồng Heo',
      description: 'Đạt 100 Điểm Gắn Kết 💕.',
      progress: 10,
      target: 100,
      rewardGems: 25,
      rewardCoins: 2000,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_wheel_5',
      category: 'social',
      title: 'Tín Đồ Vòng Quay',
      description: 'Quay Vòng Quay May Mắn 5 lần.',
      progress: 0,
      target: 5,
      rewardGems: 6,
      rewardCoins: 400,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_wheel_50',
      category: 'social',
      title: 'Bàn Tay Vàng Quay Thưởng',
      description: 'Quay Vòng Quay May Mắn đủ 50 lần.',
      progress: 0,
      target: 50,
      rewardGems: 40,
      rewardCoins: 8000,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_thief_5',
      category: 'social',
      title: 'Đạo Chích Chuồng Heo',
      description: 'Ăn trộm thành công 5 bé heo từ chuồng đối phương.',
      progress: 0,
      target: 5,
      rewardGems: 15,
      rewardCoins: 2000,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_thief_20',
      category: 'social',
      title: 'Siêu Trộm Huyền Thoại 🥷',
      description: 'Ăn trộm thành công 20 bé heo từ chuồng đối phương.',
      progress: 0,
      target: 20,
      rewardGems: 45,
      rewardCoins: 8500,
      unlocked: false,
      claimed: false,
    },

    // Nông Trại Trồng Trọt (5x5 & 25 Hạt Giống)
    {
      id: 'ach_crop_plant_10',
      category: 'crop_farm',
      title: 'Nông Dân Chăm Chỉ 🌱',
      description: 'Gieo trồng 10 hạt giống bên Nông Trại.',
      progress: 0,
      target: 10,
      rewardGems: 5,
      rewardCoins: 350,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_crop_harvest_25',
      category: 'crop_farm',
      title: 'Mùa Màng Bội Thu 🌾',
      description: 'Thu hoạch 25 ô cây trồng trên cánh đồng.',
      progress: 0,
      target: 25,
      rewardGems: 10,
      rewardCoins: 900,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_crop_harvest_100',
      category: 'crop_farm',
      title: 'Ông Trùm Cánh Đồng 🚜',
      description: 'Thu hoạch tổng cộng 100 ô cây trồng bên Nông Trại.',
      progress: 0,
      target: 100,
      rewardGems: 35,
      rewardCoins: 5500,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_crop_feed_30',
      category: 'crop_farm',
      title: 'Tự Cung Tự Cấp 🥣',
      description: 'Ép 30 nông sản thành cám dinh dưỡng cho đàn heo.',
      progress: 0,
      target: 30,
      rewardGems: 12,
      rewardCoins: 1200,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_crop_orders_5',
      category: 'crop_farm',
      title: 'Thương Lái Đắt Hàng 🚚',
      description: 'Giao thành công 5 đơn hàng nông sản.',
      progress: 0,
      target: 5,
      rewardGems: 18,
      rewardCoins: 2000,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_crop_orders_20',
      category: 'crop_farm',
      title: 'Chuyến Xe Hạng Sang 📦',
      description: 'Giao thành công 20 đơn hàng nông sản.',
      progress: 0,
      target: 20,
      rewardGems: 45,
      rewardCoins: 9500,
      unlocked: false,
      claimed: false,
    },
    {
      id: 'ach_crop_plots_25',
      category: 'crop_farm',
      title: 'Bá Chủ 25 Ô Đất 🏡',
      description: 'Đạt Lv.25 để mở khóa trọn vẹn toàn bộ 25 ô đất 5×5.',
      progress: 5,
      target: 25,
      rewardGems: 40,
      rewardCoins: 8000,
      unlocked: false,
      claimed: false,
    },
  ];
}

export function syncAchievements(state: FarmState): FarmState {
  const unlockedSet = new Set(state.unlockedBreeds);
  const standardUnlockedCount = PIG_BREEDS.filter(
    (b) => !b.achievementOnly && unlockedSet.has(b.id)
  ).length;
  const rareCount = PIG_BREEDS.filter(
    (b) => b.rarity === 'rare' && unlockedSet.has(b.id)
  ).length;
  const epicCount = PIG_BREEDS.filter(
    (b) => b.rarity === 'epic' && unlockedSet.has(b.id)
  ).length;
  const legendCount = PIG_BREEDS.filter(
    (b) => b.rarity === 'legendary' && unlockedSet.has(b.id)
  ).length;

  const progressMap: Record<string, number> = {
    ach_collector_5: state.unlockedBreeds.length,
    ach_collector_14: state.unlockedBreeds.length,
    ach_collector_28: standardUnlockedCount,
    ach_rare_1: rareCount,
    ach_epic_1: epicCount,
    ach_legend_1: legendCount,
    ach_legend_3: legendCount,
    ach_feed_20: state.totalFed || 0,
    ach_feed_100: state.totalFed || 0,
    ach_feed_500: state.totalFed || 0,
    ach_clean_10: state.totalCleaned || 0,
    ach_clean_50: state.totalCleaned || 0,
    ach_clean_200: state.totalCleaned || 0,
    ach_pet_25: state.totalPetted || 0,
    ach_pet_150: state.totalPetted || 0,
    ach_breeder: state.totalBred || 0,
    ach_breeder_20: state.totalBred || 0,
    ach_breeder_50: state.totalBred || 0,
    ach_tycoon: state.totalSold || 0,
    ach_tycoon_30: state.totalSold || 0,
    ach_tycoon_100: state.totalSold || 0,
    ach_level_5: state.level || 1,
    ach_level_10: state.level || 1,
    ach_level_25: state.level || 1,
    ach_barn_20: state.barnCapacity || STARTER_BARN_CAPACITY,
    ach_barn_28: state.barnCapacity || STARTER_BARN_CAPACITY,
    ach_love_30: state.lovePoints || 0,
    ach_love_100: state.lovePoints || 0,
    ach_love_500: state.lovePoints || 0,
    ach_wheel_5: state.totalWheelSpins || 0,
    ach_wheel_50: state.totalWheelSpins || 0,
    ach_thief_5: state.totalStolen || 0,
    ach_thief_20: state.totalStolen || 0,
    ach_crop_plant_10: state.totalCropsPlanted || 0,
    ach_crop_harvest_25: state.totalCropsHarvested || 0,
    ach_crop_harvest_100: state.totalCropsHarvested || 0,
    ach_crop_feed_30: state.totalCropsConvertedToFeed || 0,
    ach_crop_orders_5: state.totalOrdersCompleted || 0,
    ach_crop_orders_20: state.totalOrdersCompleted || 0,
    ach_crop_plots_25: getUnlockedPlotCount(state.level || 1),
  };

  const firstPass = state.achievements.map((a) => {
    if (a.rewardBreedId) return a;
    const nextProgress = progressMap[a.id] ?? a.progress;
    return {
      ...a,
      progress: nextProgress,
      unlocked: a.unlocked || nextProgress >= a.target,
    };
  });

  const completedBarnAchievements = firstPass.filter(
    (a) => (a.category || 'collection') !== 'crop_farm' && !a.rewardBreedId && a.unlocked
  ).length;

  return {
    ...state,
    achievements: firstPass.map((a) => {
      if (!a.rewardBreedId) return a;
      return {
        ...a,
        progress: completedBarnAchievements,
        unlocked: a.unlocked || completedBarnAchievements >= a.target,
      };
    }),
  };
}

function mergeAchievements(existing: AchievementItem[] | undefined): AchievementItem[] {
  const defaults = createInitialAchievements();
  if (!existing || existing.length === 0) return defaults;
  const existingMap = new Map(existing.map((a) => [a.id, a]));
  return defaults.map((def) => {
    const old = existingMap.get(def.id);
    if (!old) return def;
    return {
      ...def,
      progress: old.progress ?? def.progress,
      unlocked: Boolean(old.unlocked),
      claimed: Boolean(old.claimed),
    };
  });
}

export function createDefaultFarmState(slot: PartnerSlot = 'partner_a'): FarmState {
  const isA = slot === 'partner_a';
  const starterPigs: PigInstance[] = isA
    ? [
        createPigInstance('pink_flower', { growth: 55, x: 36, y: 40, nickname: 'Bé Đào' }),
        createPigInstance('spotted_milk', { growth: 35, x: 54, y: 46, nickname: 'Bò Sữa' }),
      ]
    : [
        createPigInstance('pink_flower', { growth: 55, x: 36, y: 40, nickname: 'Bánh Mochi' }),
        createPigInstance('spotted_milk', { growth: 35, x: 54, y: 46, nickname: 'Cà Phê Sữa' }),
      ];

  const starterDrops: YardDrop[] = [
    { id: uid('drop'), type: 'red_cube', x: 42, y: 40, value: 30, createdAt: Date.now() },
    { id: uid('drop'), type: 'chest', x: 58, y: 62, value: 110, createdAt: Date.now() },
  ];

  const unlocked = Array.from(new Set(starterPigs.map((p) => p.breedId)));

  return {
    version: 2,
    slot,
    playerName: isA ? 'Anh' : 'Em',
    partnerName: isA ? 'Em Yêu' : 'Anh Yêu',
    lovePoints: 10,
    loveNote: isA ? 'Chúc em nuôi heo thật vui!' : 'Anh nhớ cho heo ăn nhé!',
    farmGreeting: isA ? 'Chuồng Heo Của Anh 💕' : 'Chuồng Heo Của Em 💕',
    level: 1,
    xp: 0,
    coins: 480,
    gems: 10,
    barnCapacity: 5,
    waterLevel: 90,
    guardDogActiveUntil: Date.now() + 1000 * 60 * 30,
    soundEnabled: true,
    pigs: starterPigs,
    storedPigs: [],
    breedingIncubators: [],
    drops: starterDrops,
    inventory: {
      feed_standard: 10,
      feed_deluxe: 2,
      medicine_pill: 2,
      vitamin_boost: 1,
      breed_charm: 1,
    },
    unlockedBreeds: unlocked,
    quests: createInitialQuests(),
    achievements: createInitialAchievements(),
    neighbors: createInitialNeighbors(slot),
    totalSold: 0,
    totalBred: 0,
    totalCleaned: 0,
    totalFed: 0,
    totalPetted: 0,
    totalWheelSpins: 0,
    totalStolen: 0,
    stealsToday: 0,
    roomCode: generateRoomCode(),
    dailyGiftClaimedAt: 0,
    lastWheelSpinAt: 0,
    lastTickAt: Date.now(),
    lastQuestResetDate: getVietnamDateKey(),
    cropPlots: createInitialCropPlots(),
    cropStorage: {},
    fertilizerCount: 3,
    cropOrders: createInitialCropOrders(1),
    totalCropsPlanted: 0,
    totalCropsHarvested: 0,
    totalOrdersCompleted: 0,
    totalCropsConvertedToFeed: 0,
  };
}

function applyOfflineProgress(parsed: FarmState): FarmState {
  const now = Date.now();
  const elapsedSec = Math.min(7200, Math.max(0, (now - (parsed.lastTickAt || now)) / 1000));
  if (elapsedSec > 8) {
    parsed.pigs = parsed.pigs.map((pig) => {
      const breed = PIG_BREEDS.find((b) => b.id === pig.breedId) || PIG_BREEDS[0];
      const hungerDrop = elapsedSec * 0.03;
      const thirstDrop = elapsedSec * 0.025;
      const nextHunger = Math.max(15, pig.hunger - hungerDrop);
      const nextThirst = Math.max(15, pig.thirst - thirstDrop);
      const growRate = nextHunger > 30 && nextThirst > 30 ? 100 / breed.growthDurationSec : 0.15;
      const nextGrowth = Math.min(100, pig.growth + elapsedSec * growRate * 0.35);
      const stage = nextGrowth >= 100 ? 'adult' : nextGrowth >= 45 ? 'teen' : 'piglet';
      return {
        ...pig,
        hunger: nextHunger,
        thirst: nextThirst,
        growth: nextGrowth,
        stage,
        moodBubble: stage === 'adult' ? 'ready' : nextHunger < 35 ? 'hungry' : nextThirst < 35 ? 'thirsty' : null,
      };
    });
  }
  parsed.lastTickAt = now;
  return parsed;
}

function loadRawSlot(slot: PartnerSlot): FarmState | null {
  try {
    let raw = localStorage.getItem(SLOT_KEYS[slot]);
    if (!raw && slot === 'partner_a') {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FarmState;
    if (!parsed || !Array.isArray(parsed.pigs)) return null;
    const defaults = createDefaultFarmState(slot);
    const todayVnKey = getVietnamDateKey();
    const isNewDay = !parsed.lastQuestResetDate || parsed.lastQuestResetDate !== todayVnKey;

    const baseNeighbors = parsed.neighbors?.length ? parsed.neighbors : defaults.neighbors;
    const nextNeighbors = isNewDay
      ? baseNeighbors.map((n) => ({ ...n, helpedToday: false }))
      : baseNeighbors;

    const levelAllowedCapacity = getMaxBarnCapacityForLevel(parsed.level || 1);
    const normalizedBarnCapacity = Math.min(
      Math.max(levelAllowedCapacity, parsed.pigs.length),
      Math.max(STARTER_BARN_CAPACITY, parsed.barnCapacity || STARTER_BARN_CAPACITY)
    );

    const merged = applyOfflineProgress({
      ...defaults,
      ...parsed,
      slot,
      barnCapacity: normalizedBarnCapacity,
      roomCode: parsed.roomCode || defaults.roomCode,
      stealsToday: isNewDay ? 0 : parsed.stealsToday || 0,
      totalStolen: parsed.totalStolen || 0,
      storedPigs: Array.isArray(parsed.storedPigs) ? parsed.storedPigs : [],
      breedingIncubators: Array.isArray(parsed.breedingIncubators) ? parsed.breedingIncubators : [],
      quests: isNewDay ? createInitialQuests() : Array.isArray(parsed.quests) && parsed.quests.length ? parsed.quests : defaults.quests,
      achievements: mergeAchievements(parsed.achievements),
      neighbors: nextNeighbors,
      lastQuestResetDate: todayVnKey,
      cropPlots:
        Array.isArray(parsed.cropPlots) && parsed.cropPlots.length === 25
          ? parsed.cropPlots
          : createInitialCropPlots(),
      cropStorage: parsed.cropStorage && typeof parsed.cropStorage === 'object' ? parsed.cropStorage : {},
      fertilizerCount: typeof parsed.fertilizerCount === 'number' ? parsed.fertilizerCount : 3,
      cropOrders:
        Array.isArray(parsed.cropOrders) && parsed.cropOrders.length > 0
          ? parsed.cropOrders
          : createInitialCropOrders(parsed.level || 1),
      totalCropsPlanted: parsed.totalCropsPlanted || 0,
      totalCropsHarvested: parsed.totalCropsHarvested || 0,
      totalOrdersCompleted: parsed.totalOrdersCompleted || 0,
      totalCropsConvertedToFeed: parsed.totalCropsConvertedToFeed || 0,
    });
    return syncAchievements(merged);
  } catch {
    return null;
  }
}

export function encodeCouplePacket(
  state: FarmState,
  options: { loveNote: string; giftCoins: number; giftPigBreedId: string | null }
): string {
  const packet: CouplePacket = {
    v: 2,
    senderSlot: state.slot || 'partner_a',
    senderName: state.playerName,
    farmName: state.farmGreeting,
    greeting: options.loveNote || state.farmGreeting,
    level: state.level,
    loveNote: options.loveNote,
    giftCoins: Math.max(0, Math.round(options.giftCoins)),
    giftPigBreedId: options.giftPigBreedId,
    pigs: state.pigs.slice(0, 10).map((p) => ({
      breedId: p.breedId,
      nickname: p.nickname,
      growth: Math.round(p.growth),
      x: Math.round(p.x),
      y: Math.round(p.y),
    })),
    waterLevel: Math.round(state.waterLevel),
    sentAt: Date.now(),
  };
  const json = JSON.stringify(packet);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return `HEO2:${btoa(binary)}`;
}

export function decodeCouplePacket(rawToken: string): CouplePacket {
  const trimmed = rawToken.trim();
  let payload = trimmed.startsWith('HEO2:') ? trimmed.slice(5) : trimmed;
  payload = payload.replace(/-/g, '+').replace(/_/g, '/');
  while (payload.length % 4) payload += '=';
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const json = new TextDecoder().decode(bytes);
  const parsed = JSON.parse(json) as CouplePacket;
  if (!parsed || parsed.v !== 2 || !Array.isArray(parsed.pigs)) {
    throw new Error('Mã kết nối không đúng định dạng.');
  }
  return parsed;
}

function stableFriendId(name: string): string {
  let hash = 0;
  const norm = name.trim().toLowerCase();
  for (let i = 0; i < norm.length; i++) {
    hash = (hash * 31 + norm.charCodeAt(i)) >>> 0;
  }
  return `friend_${hash.toString(36)}`;
}

export function upsertFriendFromPacket(
  state: FarmState,
  packet: CouplePacket,
  options?: { asPartner?: boolean }
): { nextState: FarmState; friendNeighbor: NeighborFarm } {
  const normName = packet.senderName.trim().toLowerCase();
  const existing = state.neighbors.find(
    (n) =>
      (options?.asPartner && (n.id === 'partner_farm' || n.isPartner)) ||
      (n.isRealFriend && n.farmerName.trim().toLowerCase() === normName)
  );

  const isFirstRealPartner =
    options?.asPartner ||
    !state.neighbors.some((n) => n.isRealFriend && n.id !== existing?.id);

  const friendId = existing?.id || (isFirstRealPartner ? 'partner_farm' : stableFriendId(packet.senderName));
  const isPartner = Boolean(options?.asPartner ?? existing?.isPartner ?? isFirstRealPartner);

  const friendNeighbor: NeighborFarm = {
    id: friendId,
    name: packet.farmName || `Chuồng Heo ${packet.senderName}`,
    farmerName: packet.senderName,
    avatarColor: packet.senderSlot === 'partner_b' ? '#ec4899' : '#0ea5e9',
    avatarHair: '#292524',
    level: packet.level,
    rank: isPartner ? 1 : existing?.rank || 2,
    hearts: (existing?.hearts || 99) + 10,
    greeting: packet.loveNote || packet.greeting,
    waterLevel: packet.waterLevel,
    helpedToday: false,
    isPartner,
    isRealFriend: true,
    lastSyncedAt: Date.now(),
    storedPigs: [],
    pigs: packet.pigs.map((p) =>
      createPigInstance(p.breedId, {
        growth: p.growth,
        x: p.x,
        y: p.y,
        nickname: p.nickname,
      })
    ),
    drops: [
      { id: uid('drop'), type: 'red_cube', x: 40, y: 54, value: 45, createdAt: Date.now() },
      { id: uid('drop'), type: 'chest', x: 58, y: 62, value: 120, createdAt: Date.now() },
    ],
  };

  const remaining = state.neighbors.filter((n) => n.id !== friendId);
  // Keep partner/real friends first so they sit right at the front of the bottom friends strip
  const ordered = [friendNeighbor, ...remaining].sort((a, b) => {
    const scoreA = (a.isPartner ? 2 : 0) + (a.isRealFriend ? 1 : 0);
    const scoreB = (b.isPartner ? 2 : 0) + (b.isRealFriend ? 1 : 0);
    return scoreB - scoreA;
  });

  let nextPigs = [...state.pigs];
  let nextUnlocked = [...state.unlockedBreeds];
  if (packet.giftPigBreedId && nextPigs.length < state.barnCapacity) {
    nextPigs.push(createPigInstance(packet.giftPigBreedId, { growth: 20 }));
    if (!nextUnlocked.includes(packet.giftPigBreedId)) {
      nextUnlocked.push(packet.giftPigBreedId);
    }
  }

  const nextState: FarmState = {
    ...state,
    coins: state.coins + packet.giftCoins,
    partnerName: isPartner ? packet.senderName : state.partnerName,
    lovePoints: state.lovePoints + 10,
    pigs: nextPigs,
    unlockedBreeds: nextUnlocked,
    neighbors: ordered,
  };

  return { nextState, friendNeighbor };
}

export interface FarmRepository {
  readonly mode: 'local' | 'online';
  getActiveSlot(): PartnerSlot;
  switchSlot(slot: PartnerSlot): Promise<FarmState>;
  load(slot?: PartnerSlot): Promise<FarmState>;
  save(state: FarmState): Promise<void>;
  reset(slot?: PartnerSlot): Promise<FarmState>;
  exportJson(state: FarmState): string;
  importJson(raw: string): FarmState;
}

class LocalFarmRepository implements FarmRepository {
  readonly mode = 'local' as const;

  getActiveSlot(): PartnerSlot {
    const saved = localStorage.getItem(ACTIVE_SLOT_KEY);
    return saved === 'partner_b' ? 'partner_b' : 'partner_a';
  }

  private syncPartnerIntoNeighbors(state: FarmState, currentSlot: PartnerSlot): FarmState {
    const otherSlot: PartnerSlot = currentSlot === 'partner_a' ? 'partner_b' : 'partner_a';
    const otherState = loadRawSlot(otherSlot);
    if (!otherState) return state;

    const partnerNeighbor: NeighborFarm = {
      id: 'partner_farm',
      name: otherState.farmGreeting,
      farmerName: otherState.playerName,
      avatarColor: otherSlot === 'partner_b' ? '#ec4899' : '#0ea5e9',
      avatarHair: '#292524',
      level: otherState.level,
      rank: 1,
      hearts: 99 + state.lovePoints,
      greeting: otherState.loveNote || otherState.farmGreeting,
      waterLevel: otherState.waterLevel,
      helpedToday: false,
      isPartner: true,
      storedPigs: otherState.storedPigs ? otherState.storedPigs.map((p) => ({ ...p })) : [],
      pigs: otherState.pigs.map((p) => ({ ...p })),
      drops: otherState.drops.slice(0, 4).map((d) => ({ ...d })),
    };

    const others = state.neighbors.filter((n) => n.id !== 'partner_farm' && !n.isPartner);
    return {
      ...state,
      neighbors: [partnerNeighbor, ...others],
    };
  }

  async load(explicitSlot?: PartnerSlot): Promise<FarmState> {
    const slot = explicitSlot ?? this.getActiveSlot();
    localStorage.setItem(ACTIVE_SLOT_KEY, slot);

    let loaded = loadRawSlot(slot);
    if (!loaded) {
      loaded = createDefaultFarmState(slot);
      localStorage.setItem(SLOT_KEYS[slot], JSON.stringify(loaded));
    }
    return this.syncPartnerIntoNeighbors(loaded, slot);
  }

  async switchSlot(slot: PartnerSlot): Promise<FarmState> {
    localStorage.setItem(ACTIVE_SLOT_KEY, slot);
    return this.load(slot);
  }

  async save(state: FarmState): Promise<void> {
    try {
      const slot = state.slot ?? this.getActiveSlot();
      localStorage.setItem(SLOT_KEYS[slot], JSON.stringify({ ...state, slot, lastTickAt: Date.now() }));
    } catch {
      // Ignore quota issues cleanly
    }
  }

  async reset(explicitSlot?: PartnerSlot): Promise<FarmState> {
    const slot = explicitSlot ?? this.getActiveSlot();
    const fresh = createDefaultFarmState(slot);
    await this.save(fresh);
    return this.syncPartnerIntoNeighbors(fresh, slot);
  }

  exportJson(state: FarmState): string {
    return JSON.stringify(state, null, 2);
  }

  importJson(raw: string): FarmState {
    const parsed = JSON.parse(raw) as FarmState;
    if (!parsed || typeof parsed.coins !== 'number' || !Array.isArray(parsed.pigs)) {
      throw new Error('Dữ liệu sao lưu không hợp lệ.');
    }
    const slot = this.getActiveSlot();
    const levelAllowedCapacity = getMaxBarnCapacityForLevel(parsed.level || 1);
    const normalizedBarnCapacity = Math.min(
      Math.max(levelAllowedCapacity, parsed.pigs.length),
      Math.max(STARTER_BARN_CAPACITY, parsed.barnCapacity || STARTER_BARN_CAPACITY)
    );
    return syncAchievements({
      ...createDefaultFarmState(slot),
      ...parsed,
      slot,
      barnCapacity: normalizedBarnCapacity,
      achievements: mergeAchievements(parsed.achievements),
      lastTickAt: Date.now(),
      cropPlots:
        Array.isArray(parsed.cropPlots) && parsed.cropPlots.length === 25
          ? parsed.cropPlots
          : createInitialCropPlots(),
      cropStorage: parsed.cropStorage && typeof parsed.cropStorage === 'object' ? parsed.cropStorage : {},
      fertilizerCount: typeof parsed.fertilizerCount === 'number' ? parsed.fertilizerCount : 3,
      cropOrders:
        Array.isArray(parsed.cropOrders) && parsed.cropOrders.length > 0
          ? parsed.cropOrders
          : createInitialCropOrders(parsed.level || 1),
      totalCropsPlanted: parsed.totalCropsPlanted || 0,
      totalCropsHarvested: parsed.totalCropsHarvested || 0,
      totalOrdersCompleted: parsed.totalOrdersCompleted || 0,
      totalCropsConvertedToFeed: parsed.totalCropsConvertedToFeed || 0,
    });
  }
}

export const farmRepository: FarmRepository = new LocalFarmRepository();
