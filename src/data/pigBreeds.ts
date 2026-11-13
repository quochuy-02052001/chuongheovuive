import { BreedingPairResult, InventoryItem, PigBreed } from '../types/game';

export const PIG_BREEDS: PigBreed[] = [
  // ---- COMMON (Lv.1 Shop Starter Breeds) ----
  {
    id: 'pink_flower',
    name: 'Heo Hồng Hoa',
    rarity: 'common',
    buyPrice: 100,
    unlockLevel: 1,
    sellPrice: 320,
    growthDurationSec: 70,
    description: 'Chú heo hồng đáng yêu cài bông hoa đào bên tai, rất ngoan và dễ nuôi.',
    trait: 'Lớn nhanh, ít kén ăn',
    bodyColor: '#ffc2d1',
    bellyColor: '#ffe5ec',
    earColor: '#ff8fab',
    pattern: 'flower',
  },
  {
    id: 'spotted_milk',
    name: 'Heo Đốm Sữa',
    rarity: 'common',
    buyPrice: 140,
    unlockLevel: 1,
    sellPrice: 440,
    growthDurationSec: 80,
    description: 'Bộ lông hồng phớt chấm đốm nâu sữa, thường rơi thêm hộp quà đỏ.',
    trait: 'Rơi hộp quà thường xuyên',
    bodyColor: '#ffd6e0',
    bellyColor: '#fff0f3',
    earColor: '#8d5524',
    pattern: 'spotted',
  },

  // ---- UNCOMMON (Unlocked Gradually as Player Levels Up) ----
  {
    id: 'watermelon',
    name: 'Heo Dưa Hấu',
    rarity: 'uncommon',
    buyPrice: 260,
    unlockLevel: 2,
    sellPrice: 780,
    growthDurationSec: 95,
    description: 'Vỏ xanh sọc dưa hấu mát rượi, cực kỳ thích uống nước từ máng.',
    trait: 'Giữ nước lâu hơn 30%',
    bodyColor: '#3a9d3e',
    bellyColor: '#6bd45f',
    earColor: '#236b27',
    pattern: 'watermelon',
  },
  {
    id: 'strawberry',
    name: 'Heo Dâu Tây',
    rarity: 'uncommon',
    buyPrice: 310,
    unlockLevel: 3,
    sellPrice: 920,
    growthDurationSec: 95,
    description: 'Màu đỏ dâu ngọt ngào với cuống lá xanh mướt trên đỉnh đầu.',
    trait: 'Thích hợp phối giống hiếm',
    bodyColor: '#fb7185',
    bellyColor: '#ffe4e6',
    earColor: '#16a34a',
    pattern: 'strawberry',
  },
  {
    id: 'tiger_stripe',
    name: 'Heo Mèo Béo Cam',
    rarity: 'uncommon',
    buyPrice: 360,
    unlockLevel: 5,
    sellPrice: 1080,
    growthDurationSec: 100,
    description: 'Lông vàng cam vằn đen, đôi mắt lờ đờ buồn ngủ siêu cưng và đuôi xù sọc vằn.',
    trait: 'Tăng vui vẻ nhanh khi vuốt ve',
    bodyColor: '#f59e0b',
    bellyColor: '#fef3c7',
    earColor: '#b45309',
    pattern: 'tiger',
  },

  // ---- RARE (Breeding-Only ~5%) ----
  {
    id: 'blue_samurai',
    name: 'Heo Chiến Binh Xanh',
    rarity: 'rare',
    buyPrice: 0,
    sellPrice: 1580,
    growthDurationSec: 110,
    description: 'Đội mũ giáp xanh uy phong, chỉ xuất hiện khi lai tạo trong chuồng.',
    trait: 'Ít bị ốm, bán giá cao',
    bodyColor: '#ffe0e9',
    bellyColor: '#fff3f6',
    earColor: '#1d4ed8',
    pattern: 'samurai',
  },
  {
    id: 'green_cat',
    name: 'Heo Mèo Cười Xanh',
    rarity: 'rare',
    buyPrice: 0,
    sellPrice: 1650,
    growthDurationSec: 110,
    description: 'Bộ lông sọc xanh biếc với nụ cười tinh quái và chiếc đuôi mèo xù cực đáng yêu.',
    trait: 'Hay nhặt rương báu',
    bodyColor: '#22d3ee',
    bellyColor: '#cffafe',
    earColor: '#0284c7',
    pattern: 'cat_green',
  },
  {
    id: 'panda_pig',
    name: 'Heo Gấu Trúc',
    rarity: 'rare',
    buyPrice: 0,
    sellPrice: 1750,
    growthDurationSec: 115,
    description: 'Trắng muốt điểm quầng mắt đen đáng yêu như gấu trúc ăn tre.',
    trait: 'Rất thân thiện với hàng xóm',
    bodyColor: '#f8fafc',
    bellyColor: '#ffffff',
    earColor: '#1e293b',
    pattern: 'panda',
  },
  {
    id: 'sakura_mochi',
    name: 'Heo Hoa Anh Đào',
    rarity: 'rare',
    buyPrice: 0,
    sellPrice: 1860,
    growthDurationSec: 115,
    description: 'Mềm mại như bánh mochi hồng phấn điểm cánh hoa anh đào rơi.',
    trait: 'Thưởng thêm XP khi lớn',
    bodyColor: '#fbcfe8',
    bellyColor: '#fdf2f8',
    earColor: '#ec4899',
    pattern: 'sakura',
  },
  {
    id: 'lucky_jade',
    name: 'Heo Ngọc Bích',
    rarity: 'rare',
    buyPrice: 0,
    sellPrice: 2050,
    growthDurationSec: 120,
    description: 'Ánh xanh ngọc bích mang lại may mắn và tài lộc cho chủ trại.',
    trait: 'Tăng tỷ lệ ra rương báu',
    bodyColor: '#10b981',
    bellyColor: '#a7f3d0',
    earColor: '#047857',
    pattern: 'jade',
  },
  {
    id: 'angel_halo',
    name: 'Heo Thiên Thần',
    rarity: 'rare',
    buyPrice: 0,
    sellPrice: 2180,
    growthDurationSec: 120,
    description: 'Đôi cánh trắng muốt cùng vòng hào quang vàng tỏa sáng dịu dàng.',
    trait: 'Tỏa hào quang giúp đàn ít ốm',
    bodyColor: '#fff7ed',
    bellyColor: '#ffffff',
    earColor: '#fde68a',
    pattern: 'angel',
  },
  {
    id: 'little_devil',
    name: 'Heo Tiểu Quỷ',
    rarity: 'rare',
    buyPrice: 0,
    sellPrice: 2280,
    growthDurationSec: 122,
    description: 'Cặp sừng đỏ nhỏ nhắn và chiếc đuôi mũi tên siêu tinh nghịch.',
    trait: 'Rơi hộp quà đỏ nhanh hơn',
    bodyColor: '#e11d48',
    bellyColor: '#fda4af',
    earColor: '#881337',
    pattern: 'devil',
  },
  {
    id: 'pirate_captain',
    name: 'Heo Thuyền Trưởng',
    rarity: 'rare',
    buyPrice: 0,
    sellPrice: 2420,
    growthDurationSec: 125,
    description: 'Đeo bịt mắt hải tặc và khăn trùm đầu sọ đi săn rương kho báu.',
    trait: 'Tăng xu khi mở rương báu',
    bodyColor: '#fed7aa',
    bellyColor: '#ffedd5',
    earColor: '#b91c1c',
    pattern: 'pirate',
  },
  {
    id: 'frost_king',
    name: 'Heo Băng Giá',
    rarity: 'rare',
    buyPrice: 0,
    sellPrice: 2560,
    growthDurationSec: 125,
    description: 'Thân xanh băng tuyết mát lạnh đội vương miện pha lê lấp lánh.',
    trait: 'Không bao giờ khát nước nhanh',
    bodyColor: '#bae6fd',
    bellyColor: '#f0f9ff',
    earColor: '#0284c7',
    pattern: 'frost_king',
  },

  // ---- EPIC (Breeding-Only ~5%) ----
  {
    id: 'lightning_red',
    name: 'Heo Tia Chớp',
    rarity: 'epic',
    buyPrice: 0,
    sellPrice: 2900,
    growthDurationSec: 128,
    description: 'Thân đỏ rực in dấu tia chớp vàng chói, năng lượng tràn đầy.',
    trait: 'Sản sinh xu vàng nhanh',
    bodyColor: '#ef4444',
    bellyColor: '#fde047',
    earColor: '#b91c1c',
    pattern: 'lightning',
  },
  {
    id: 'rainbow_parrot',
    name: 'Heo Cầu Vồng',
    rarity: 'epic',
    buyPrice: 0,
    sellPrice: 3150,
    growthDurationSec: 130,
    description: 'Khoác bộ áo rực rỡ bảy sắc đỏ vàng xanh dương, niềm tự hào của trang trại.',
    trait: 'Thu hút khách thăm nông trại',
    bodyColor: '#3b82f6',
    bellyColor: '#facc15',
    earColor: '#ef4444',
    pattern: 'rainbow',
  },
  {
    id: 'ninja_shadow',
    name: 'Heo Rồng Bóng Đêm',
    rarity: 'epic',
    buyPrice: 0,
    sellPrice: 3350,
    growthDurationSec: 132,
    description: 'Chú heo rồng đen bí ẩn với đôi cánh dơi, mắt xanh lá và vây đuôi đỏ cực ngầu.',
    trait: 'Giảm nguy cơ mất trộm',
    bodyColor: '#1e293b',
    bellyColor: '#475569',
    earColor: '#0f172a',
    pattern: 'ninja',
  },
  {
    id: 'golden_royal',
    name: 'Heo Hoàng Kim',
    rarity: 'epic',
    buyPrice: 0,
    sellPrice: 3600,
    growthDurationSec: 140,
    description: 'Giống heo quý tộc phủ vàng óng ánh, chỉ xuất hiện qua lai tạo hiếm.',
    trait: 'Rơi túi xu vàng giá trị cao',
    bodyColor: '#f59e0b',
    bellyColor: '#fef08a',
    earColor: '#d97706',
    pattern: 'crown',
  },
  {
    id: 'cyber_mecha',
    name: 'Heo Robot Tương Lai',
    rarity: 'epic',
    buyPrice: 0,
    sellPrice: 3800,
    growthDurationSec: 140,
    description: 'Đeo kính laser xanh ngọc, chế tạo từ công nghệ nông trại tương lai.',
    trait: 'Không bao giờ bị ốm',
    bodyColor: '#cbd5e1',
    bellyColor: '#e2e8f0',
    earColor: '#0284c7',
    pattern: 'mecha',
  },
  {
    id: 'star_wizard',
    name: 'Heo Phù Thủy Sao',
    rarity: 'epic',
    buyPrice: 0,
    sellPrice: 3950,
    growthDurationSec: 142,
    description: 'Đội mũ phù thủy tím chóp nhọn dệt ánh sao vàng phép thuật.',
    trait: 'Tăng XP nhận được mỗi lần chăm',
    bodyColor: '#a855f7',
    bellyColor: '#f3e8ff',
    earColor: '#6b21a8',
    pattern: 'wizard',
  },
  {
    id: 'astro_pig',
    name: 'Heo Phi Hành Gia',
    rarity: 'epic',
    buyPrice: 0,
    sellPrice: 4150,
    growthDurationSec: 145,
    description: 'Đội mũ kính phi hành gia trong suốt, sẵn sàng chinh phục ngân hà.',
    trait: 'Miễn nhiễm ốm & vui vẻ bền lâu',
    bodyColor: '#f1f5f9',
    bellyColor: '#ffffff',
    earColor: '#ea580c',
    pattern: 'astronaut',
  },
  {
    id: 'unicorn_dream',
    name: 'Heo Kỳ Lân Mộng Mơ',
    rarity: 'epic',
    buyPrice: 0,
    sellPrice: 4400,
    growthDurationSec: 148,
    description: 'Sừng xoắn ánh vàng rực rỡ và bờm pastel bồng bềnh như mây.',
    trait: 'Tăng thiện cảm khi bạn bè qua thăm',
    bodyColor: '#fdf4ff',
    bellyColor: '#ffffff',
    earColor: '#f472b6',
    pattern: 'unicorn',
  },

  // ---- LEGENDARY (Ultra-Rare Breeding-Only ~5%) ----
  {
    id: 'lion_dance',
    name: 'Heo Lân Sư Rồng',
    rarity: 'legendary',
    buyPrice: 0,
    sellPrice: 5200,
    growthDurationSec: 155,
    description: 'Mang vẻ rực rỡ lễ hội với bờm vàng đỏ may mắn quanh năm.',
    trait: 'Cực hiếm — giá bán siêu cao',
    bodyColor: '#dc2626',
    bellyColor: '#fef08a',
    earColor: '#f59e0b',
    pattern: 'lion_dance',
  },
  {
    id: 'starlight_cosmic',
    name: 'Heo Ngân Hà',
    rarity: 'legendary',
    buyPrice: 0,
    sellPrice: 5800,
    growthDurationSec: 165,
    description: 'Khoác dải ngân hà lấp lánh ánh sao đêm huyền ảo.',
    trait: 'Huyền thoại — rơi nhiều XP & Xu',
    bodyColor: '#312e81',
    bellyColor: '#6366f1',
    earColor: '#1e1b4b',
    pattern: 'cosmic',
  },
  {
    id: 'nine_tail_kitsune',
    name: 'Heo Bạch Ngọc Hồ Ly',
    rarity: 'legendary',
    buyPrice: 0,
    sellPrice: 6300,
    growthDurationSec: 168,
    description: 'Thân trắng ngọc điểm ấn ký đỏ linh thiêng và cụm đuôi hồ ly xòe rực rỡ.',
    trait: 'Huyền thoại — mang vận may phối giống',
    bodyColor: '#fff1f2',
    bellyColor: '#ffffff',
    earColor: '#e11d48',
    pattern: 'kitsune',
  },
  {
    id: 'phoenix_flame',
    name: 'Heo Phượng Hoàng Lửa',
    rarity: 'legendary',
    buyPrice: 0,
    sellPrice: 6900,
    growthDurationSec: 172,
    description: 'Đôi cánh lửa vàng cam rực cháy cùng mào lông phượng hoàng bất tử.',
    trait: 'Huyền thoại — không bao giờ bị ốm',
    bodyColor: '#f97316',
    bellyColor: '#fef08a',
    earColor: '#b91c1c',
    pattern: 'phoenix',
  },
  {
    id: 'emperor_diamond',
    name: 'Heo Đế Vương Kim Cương',
    rarity: 'legendary',
    buyPrice: 0,
    sellPrice: 7600,
    growthDurationSec: 180,
    description: 'Báu vật tối thượng của chuồng heo, đội vương miện kim cương lấp lánh.',
    trait: 'Cực hiếm — đỉnh cao sưu tầm',
    bodyColor: '#e0f2fe',
    bellyColor: '#ffffff',
    earColor: '#38bdf8',
    pattern: 'diamond',
  },
  {
    id: 'golden_dragon',
    name: 'Heo Thần Rồng Vàng',
    rarity: 'legendary',
    buyPrice: 0,
    sellPrice: 8800,
    growthDurationSec: 190,
    description: 'Thân vảy rồng hoàng kim tối thượng, sừng rồng uy nghi & cánh rực sáng.',
    trait: 'Cực hiếm tối thượng — giá trị vô song',
    bodyColor: '#fbbf24',
    bellyColor: '#fef9c3',
    earColor: '#b45309',
    pattern: 'dragon_gold',
  },
];

export const BREED_MAP: Record<string, PigBreed> = Object.fromEntries(
  PIG_BREEDS.map((b) => [b.id, b])
);

export const RARITY_LABELS: Record<PigBreed['rarity'], { label: string; color: string; bg: string }> = {
  common: { label: 'Thường', color: '#57534e', bg: '#e7e5e4' },
  uncommon: { label: 'Khá Hiếm', color: '#15803d', bg: '#dcfce7' },
  rare: { label: 'Hiếm (Lai)', color: '#1d4ed8', bg: '#dbeafe' },
  epic: { label: 'Sử Thi (Lai)', color: '#7e22ce', bg: '#f3e8ff' },
  legendary: { label: 'Cực Hiếm (Lai)', color: '#b45309', bg: '#fef3c7' },
};

export const SHOP_SUPPLIES: InventoryItem[] = [
  {
    id: 'feed_standard',
    name: 'Cám Ngũ Cốc',
    category: 'feed',
    quantity: 1,
    price: 20,
    description: 'Khôi phục +45% độ no và giúp heo lớn nhanh hơn.',
  },
  {
    id: 'feed_deluxe',
    name: 'Bánh Nướng Thượng Hạng',
    category: 'feed',
    quantity: 1,
    price: 55,
    description: 'No căng 100%, tăng +25% vui vẻ và +8% tăng trưởng tức thì!',
  },
  {
    id: 'medicine_pill',
    name: 'Thuốc Bổ Viên Nang',
    category: 'medicine',
    quantity: 1,
    price: 45,
    description: 'Chữa khỏi bệnh cho heo ngay lập tức và hồi +40% sức khỏe.',
  },
  {
    id: 'vitamin_boost',
    name: 'Vitamin Siêu Tốc',
    category: 'vitamin',
    quantity: 1,
    price: 90,
    description: 'Tăng ngay +25% tiến độ trưởng thành cho 1 chú heo.',
  },
  {
    id: 'breed_charm',
    name: 'Bùa Lai Giống Hiếm',
    category: 'charm',
    quantity: 1,
    price: 150,
    description: 'Tăng gấp đôi cơ hội lai ra giống Hiếm & Cực Hiếm (từ 5% lên 10%).',
  },
];

// Curated recipes: when the 5% (or 10% with charm) rare roll hits, matching pairs guarantee the hinted rare/ultra-rare child!
export const BREEDING_RECIPES: BreedingPairResult[] = [
  {
    parentA: 'pink_flower',
    parentB: 'spotted_milk',
    childBreedId: 'angel_halo',
    hint: 'Heo Hồng Hoa + Heo Đốm Sữa → Heo Thiên Thần',
  },
  {
    parentA: 'pink_flower',
    parentB: 'strawberry',
    childBreedId: 'sakura_mochi',
    hint: 'Heo Hồng Hoa + Heo Dâu Tây → Heo Hoa Anh Đào',
  },
  {
    parentA: 'pink_flower',
    parentB: 'tiger_stripe',
    childBreedId: 'golden_royal',
    hint: 'Heo Hồng Hoa + Heo Mèo Béo Cam → Heo Hoàng Kim',
  },
  {
    parentA: 'spotted_milk',
    parentB: 'watermelon',
    childBreedId: 'panda_pig',
    hint: 'Heo Đốm Sữa + Heo Dưa Hấu → Heo Gấu Trúc',
  },
  {
    parentA: 'watermelon',
    parentB: 'strawberry',
    childBreedId: 'lucky_jade',
    hint: 'Heo Dưa Hấu + Heo Dâu Tây → Heo Ngọc Bích',
  },
  {
    parentA: 'strawberry',
    parentB: 'tiger_stripe',
    childBreedId: 'little_devil',
    hint: 'Heo Dâu Tây + Heo Mèo Béo Cam → Heo Tiểu Quỷ',
  },
  {
    parentA: 'angel_halo',
    parentB: 'sakura_mochi',
    childBreedId: 'unicorn_dream',
    hint: 'Heo Thiên Thần + Heo Hoa Anh Đào → Heo Kỳ Lân Mộng Mơ',
  },
  {
    parentA: 'blue_samurai',
    parentB: 'lightning_red',
    childBreedId: 'cyber_mecha',
    hint: 'Heo Chiến Binh + Heo Tia Chớp → Heo Robot Tương Lai',
  },
  {
    parentA: 'frost_king',
    parentB: 'angel_halo',
    childBreedId: 'emperor_diamond',
    hint: 'Heo Băng Giá + Heo Thiên Thần → Heo Đế Vương Kim Cương',
  },
  {
    parentA: 'little_devil',
    parentB: 'lightning_red',
    childBreedId: 'phoenix_flame',
    hint: 'Heo Tiểu Quỷ + Heo Tia Chớp → Heo Phượng Hoàng Lửa',
  },
  {
    parentA: 'sakura_mochi',
    parentB: 'angel_halo',
    childBreedId: 'nine_tail_kitsune',
    hint: 'Heo Hoa Anh Đào + Heo Thiên Thần → Heo Bạch Ngọc Hồ Ly',
  },
  {
    parentA: 'golden_royal',
    parentB: 'ninja_shadow',
    childBreedId: 'golden_dragon',
    hint: 'Heo Hoàng Kim + Heo Rồng Bóng Đêm → Heo Thần Rồng Vàng',
  },
];

export const BASE_RARE_BREED_CHANCE = 0.05; // 5% base chance for Rare / Epic / Legendary

export function resolveBreedingOutcome(
  breedAId: string,
  breedBId: string,
  useCharm: boolean
): string {
  const rareThreshold = useCharm ? BASE_RARE_BREED_CHANCE * 2 : BASE_RARE_BREED_CHANCE;
  const rareRoll = Math.random();

  if (rareRoll < rareThreshold) {
    // Rare hit (~5% base, ~10% with charm)!
    const match = BREEDING_RECIPES.find(
      (r) =>
        (r.parentA === breedAId && r.parentB === breedBId) ||
        (r.parentA === breedBId && r.parentB === breedAId)
    );
    if (match) {
      return match.childBreedId;
    }

    // Weighted rare pool: ~55% rare, ~30% epic, ~15% legendary
    const tierRoll = Math.random();
    const rares = PIG_BREEDS.filter((b) => b.rarity === 'rare');
    const epics = PIG_BREEDS.filter((b) => b.rarity === 'epic');
    const legendaries = PIG_BREEDS.filter((b) => b.rarity === 'legendary');

    const pool =
      tierRoll < 0.55 ? rares : tierRoll < 0.85 ? epics : legendaries;
    return pool[Math.floor(Math.random() * pool.length)].id;
  }

  // Standard 95% outcome: inherit Common/Uncommon or mutate slightly to Uncommon
  const commons = PIG_BREEDS.filter((b) => b.rarity === 'common');
  const uncommons = PIG_BREEDS.filter((b) => b.rarity === 'uncommon');

  if (Math.random() < 0.16) {
    return uncommons[Math.floor(Math.random() * uncommons.length)].id;
  }

  const breedA = BREED_MAP[breedAId];
  const breedB = BREED_MAP[breedBId];
  const nonRareParents = [breedA, breedB].filter(
    (b): b is PigBreed => Boolean(b && (b.rarity === 'common' || b.rarity === 'uncommon'))
  );

  if (nonRareParents.length > 0) {
    return nonRareParents[Math.floor(Math.random() * nonRareParents.length)].id;
  }

  // Even when breeding two rare+ parents, normal 95% rolls produce Common piglets so rare+ stays strictly ~5%
  return commons[Math.floor(Math.random() * commons.length)].id;
}
