export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type PigStage = 'piglet' | 'teen' | 'adult';

export type MoodBubble = 'hungry' | 'thirsty' | 'love' | 'sick' | 'ready' | 'sleep' | null;

export type ToolMode = 'hand' | 'feed' | 'glove' | 'medicine' | 'shovel';

export interface PigBreed {
  id: string;
  name: string;
  rarity: Rarity;
  buyPrice: number; // 0 if breeding-only
  unlockLevel?: number; // Shop unlock level for buyable breeds
  sellPrice: number; // base adult sell price
  growthDurationSec: number; // total seconds from 0 -> 100% when cared for
  description: string;
  trait: string;
  bodyColor: string;
  bellyColor: string;
  earColor: string;
  pattern:
    | 'solid'
    | 'flower'
    | 'spotted'
    | 'watermelon'
    | 'samurai'
    | 'cat_green'
    | 'tiger'
    | 'lightning'
    | 'rainbow'
    | 'crown'
    | 'panda'
    | 'strawberry'
    | 'ninja'
    | 'sakura'
    | 'mecha'
    | 'jade'
    | 'lion_dance'
    | 'cosmic'
    | 'diamond'
    | 'angel'
    | 'devil'
    | 'pirate'
    | 'frost_king'
    | 'wizard'
    | 'astronaut'
    | 'unicorn'
    | 'kitsune'
    | 'phoenix'
    | 'dragon_gold';
}

export interface PigInstance {
  id: string;
  breedId: string;
  nickname: string;
  x: number; // percentage 18..82 of yard width
  y: number; // percentage 26..74 of yard height
  targetX: number;
  targetY: number;
  facing: 'left' | 'right';
  isMoving: boolean;
  hunger: number; // 0 (starving) .. 100 (full)
  thirst: number; // 0 (parched) .. 100 (hydrated)
  happiness: number; // 0 .. 100
  health: number; // 0 .. 100
  isSick: boolean;
  growth: number; // 0 .. 100
  stage: PigStage;
  lastBouncedAt?: number;
  moodBubble: MoodBubble;
}

export type DropType = 'red_cube' | 'chest' | 'poop' | 'coin_bag';

export interface YardDrop {
  id: string;
  type: DropType;
  x: number; // percentage 18..82
  y: number; // percentage 28..76
  value: number;
  createdAt: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'feed' | 'medicine' | 'vitamin' | 'charm';
  quantity: number;
  price: number;
  description: string;
}

export interface QuestItem {
  id: string;
  title: string;
  iconType: 'feed' | 'scroll' | 'clean' | 'breed' | 'visit';
  progress: number;
  target: number;
  rewardCoins: number;
  rewardGems: number;
  rewardXp: number;
  claimed: boolean;
}

export type AchievementCategory = 'collection' | 'care' | 'breed' | 'wealth' | 'social';

export interface AchievementItem {
  id: string;
  category?: AchievementCategory;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewardGems: number;
  rewardCoins?: number;
  unlocked: boolean;
  claimed?: boolean;
}

export interface NeighborFarm {
  id: string;
  name: string;
  farmerName: string;
  avatarColor: string;
  avatarHair: string;
  level: number;
  rank: number;
  hearts: number;
  greeting: string;
  pigs: PigInstance[];
  storedPigs: PigInstance[];
  drops: YardDrop[];
  waterLevel: number;
  helpedToday: boolean;
  isPartner?: boolean;
  isRealFriend?: boolean;
  lastSyncedAt?: number;
}

export type PartnerSlot = 'partner_a' | 'partner_b';

export interface CouplePacket {
  v: 2;
  senderSlot: PartnerSlot;
  senderName: string;
  farmName: string;
  greeting: string;
  level: number;
  loveNote: string;
  giftCoins: number;
  giftPigBreedId: string | null;
  pigs: Array<{
    breedId: string;
    nickname: string;
    growth: number;
    x: number;
    y: number;
  }>;
  waterLevel: number;
  sentAt: number;
}

export interface FloatingFeedback {
  id: string;
  x: number;
  y: number;
  text: string;
  tone: 'coin' | 'gem' | 'love' | 'xp' | 'heal' | 'warn';
}

export interface BreedingPairResult {
  parentA: string;
  parentB: string;
  childBreedId: string;
  hint: string;
}

export interface BreedingIncubator {
  id: string;
  parentAName: string;
  parentBName: string;
  childBreedId: string; // hidden until ready
  startAt: number;
  durationMs: number; // 5 minutes = 300,000 ms
}

export interface FarmState {
  version: number;
  slot?: PartnerSlot;
  playerName: string;
  partnerName: string;
  lovePoints: number;
  loveNote: string;
  farmGreeting: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  barnCapacity: number;
  waterLevel: number; // 0..100
  guardDogActiveUntil: number; // timestamp ms
  soundEnabled: boolean;
  pigs: PigInstance[];
  storedPigs: PigInstance[];
  breedingIncubators: BreedingIncubator[];
  drops: YardDrop[];
  inventory: Record<string, number>;
  unlockedBreeds: string[];
  quests: QuestItem[];
  achievements: AchievementItem[];
  neighbors: NeighborFarm[];
  totalSold: number;
  totalBred: number;
  totalCleaned: number;
  totalFed: number;
  totalPetted?: number;
  totalWheelSpins?: number;
  totalStolen?: number;
  stealsToday?: number;
  roomCode?: string;
  partnerDeviceId?: string;
  dailyGiftClaimedAt: number;
  lastWheelSpinAt: number;
  lastTickAt: number;
  lastQuestResetDate?: string; // YYYY-MM-DD in Vietnam timezone (UTC+7)
}
