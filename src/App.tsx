import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Coins,
  Gem,
  Heart,
  Home,
  RotateCw,
  Share2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BottomHud } from './components/BottomHud';
import { CoupleModal } from './components/CoupleModal';
import { FarmBuildings } from './components/FarmBuildings';
import { FriendModal } from './components/FriendModal';
import {
  AchievementsModal,
  ActiveModal,
  BreedingModal,
  DexModal,
  InventoryModal,
  QuestsModal,
  SettingsModal,
  ShopModal,
  WheelModal,
} from './components/Modals';
import { PigInspector } from './components/PigInspector';
import { PigSprite } from './components/PigSprite';
import { YardItemSprite } from './components/YardItemSprite';
import {
  BREED_MAP,
  PIG_BREEDS,
  SHOP_SUPPLIES,
  resolveBreedingOutcome,
} from './data/pigBreeds';
import {
  MAX_STEALS_PER_DAY,
  MAX_STORED_PIGS,
  calculateBreedingCost,
  createInitialQuests,
  createPigInstance,
  decodeCouplePacket,
  encodeCouplePacket,
  farmRepository,
  generateRoomCode,
  getBarnExpandCost,
  hasAnySavedFarm,
  normalizeRoomCode,
  syncAchievements,
  uid,
  upsertFriendFromPacket,
} from './services/farmRepository';
import { getVietnamClock, getVietnamDateKey } from './services/vietnamTime';
import {
  LiveFarmSnapshot,
  P2PConnectionState,
  P2PMessage,
  ServerlessP2PSession,
  buildShareUrl,
} from './services/p2pSession';
import { RoomCloudSession, RoomSyncStatus, getOrCreateDeviceId } from './services/roomSync';
import {
  CouplePacket,
  BreedingIncubator,
  FarmState,
  FloatingFeedback,
  NeighborFarm,
  PigInstance,
  PigStage,
  ToolMode,
  YardDrop,
} from './types/game';
import { soundFx } from './utils/sound';

const NEIGHBOR_POOL = [
  { name: 'Trại Heo Bảo Ngọc', farmerName: 'Bảo Ngọc', avatarColor: '#8b5cf6', avatarHair: '#1c1917' },
  { name: 'Nông Trại Tuấn Kiệt', farmerName: 'Tuấn Kiệt', avatarColor: '#10b981', avatarHair: '#451a03' },
  { name: 'Chuồng Heo Gia Hân', farmerName: 'Gia Hân', avatarColor: '#f43f5e', avatarHair: '#292524' },
  { name: 'Trang Trại Quốc Huy', farmerName: 'Quốc Huy', avatarColor: '#0ea5e9', avatarHair: '#0f172a' },
];

export default function App() {
  const [farm, setFarm] = useState<FarmState | null>(null);
  const [activeTool, setActiveTool] = useState<ToolMode>('hand');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedPigId, setSelectedPigId] = useState<string | null>(null);
  const [visitingNeighborId, setVisitingNeighborId] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);
  const [bouncingPigs, setBouncingPigs] = useState<Record<string, boolean>>({});
  const [p2pState, setP2pState] = useState<P2PConnectionState>('idle');
  const [p2pError, setP2pError] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState<RoomSyncStatus>('idle');
  const [initialOfferToken, setInitialOfferToken] = useState('');
  const [initialAnswerToken, setInitialAnswerToken] = useState('');
  const [liveBannerMsg, setLiveBannerMsg] = useState<string | null>(null);
  const [vnClock, setVnClock] = useState(() => getVietnamClock());
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1024,
    h: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));
  const [dismissRotatePrompt, setDismissRotatePrompt] = useState(false);
  const lastSavedRef = useRef<number>(0);
  const p2pRef = useRef<ServerlessP2PSession | null>(null);
  const roomRef = useRef<RoomCloudSession | null>(null);
  const prevLevelRef = useRef<number | null>(null);

  useEffect(() => {
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  // Load saved local state on mount & check URL ?room= / ?join= / ?ans= / ?gift= links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const invParam = params.get('inv');
    const joinParam = params.get('join');
    const ansParam = params.get('ans');
    const giftParam = params.get('gift');
    const friendParam = params.get('friend');

    const hadPriorSave = hasAnySavedFarm();
    const preferredSlot = !hadPriorSave && (roomParam || invParam || giftParam || friendParam) ? 'partner_b' : undefined;

    farmRepository.load(preferredSlot).then((loaded) => {
      soundFx.enabled = loaded.soundEnabled;
      let initialFarm = loaded;

      if (roomParam) {
        const cleanRoom = normalizeRoomCode(roomParam);
        if (cleanRoom) {
          initialFarm = { ...initialFarm, roomCode: cleanRoom };
        }
        if (invParam) {
          try {
            const packet = decodeCouplePacket(invParam);
            const { nextState, friendNeighbor } = upsertFriendFromPacket(initialFarm, packet, { asPartner: true });
            initialFarm = nextState;
            setVisitingNeighborId(friendNeighbor.id);
            setLiveBannerMsg(`💕 Đã nối vào phòng ${cleanRoom} cùng ${packet.senderName}!`);
          } catch {
            setLiveBannerMsg(`💕 Đã tham gia phòng ${cleanRoom}!`);
          }
        } else {
          setLiveBannerMsg(`💕 Đã tham gia phòng ${cleanRoom}!`);
        }
        try {
          window.history.replaceState({}, '', window.location.pathname);
        } catch {
          // ignore
        }
      } else if (giftParam || friendParam) {
        try {
          const packet = decodeCouplePacket((giftParam || friendParam)!);
          const { nextState, friendNeighbor } = upsertFriendFromPacket(initialFarm, packet);
          initialFarm = nextState;
          if (friendParam) {
            setVisitingNeighborId(friendNeighbor.id);
            setLiveBannerMsg(`Đã kết bạn & đang qua thăm chuồng của ${packet.senderName} 💕`);
          } else {
            setLiveBannerMsg(`Nhận quà từ ${packet.senderName}: "${packet.loveNote}" 💕`);
          }
          try {
            window.history.replaceState({}, '', window.location.pathname);
          } catch {
            // ignore under file://
          }
        } catch {
          // ignore malformed gift/friend param
        }
      } else if (joinParam) {
        setInitialOfferToken(joinParam);
        setActiveModal('couple');
        try {
          window.history.replaceState({}, '', window.location.pathname);
        } catch {
          // ignore under file://
        }
      } else if (ansParam) {
        setInitialAnswerToken(ansParam);
        setActiveModal('couple');
        try {
          window.history.replaceState({}, '', window.location.pathname);
        } catch {
          // ignore under file://
        }
      }

      setFarm(initialFarm);
    });
  }, []);

  // Debounced auto-save to localStorage
  useEffect(() => {
    if (!farm) return;
    const now = Date.now();
    if (now - lastSavedRef.current > 1200) {
      lastSavedRef.current = now;
      farmRepository.save(farm);
    } else {
      const timer = setTimeout(() => {
        lastSavedRef.current = Date.now();
        farmRepository.save(farm);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [farm]);

  const pushFeedback = useCallback(
    (x: number, y: number, text: string, tone: FloatingFeedback['tone'] = 'coin') => {
      const id = uid('fb');
      setFeedbacks((prev) => [...prev.slice(-14), { id, x, y, text, tone }]);
      setTimeout(() => {
        setFeedbacks((prev) => prev.filter((item) => item.id !== id));
      }, 1100);
    },
    []
  );

  const triggerBounce = useCallback((pigId: string) => {
    setBouncingPigs((prev) => ({ ...prev, [pigId]: true }));
    setTimeout(() => {
      setBouncingPigs((prev) => {
        const next = { ...prev };
        delete next[pigId];
        return next;
      });
    }, 480);
  }, []);

  const addXpAndCoins = useCallback(
    (prev: FarmState, deltaCoins: number, deltaXp: number, deltaGems = 0): FarmState => {
      let nextXp = prev.xp + deltaXp;
      let nextLevel = prev.level;
      let bonusCoins = 0;
      while (nextXp >= nextLevel * 100) {
        nextXp -= nextLevel * 100;
        nextLevel += 1;
        bonusCoins += nextLevel * 60;
      }
      return syncAchievements({
        ...prev,
        coins: Math.max(0, prev.coins + deltaCoins + bonusCoins),
        gems: Math.max(0, prev.gems + deltaGems),
        xp: nextXp,
        level: nextLevel,
      });
    },
    []
  );

  const bumpQuest = useCallback(
    (prev: FarmState, iconType: FarmState['quests'][number]['iconType'], amount = 1): FarmState => {
      return {
        ...prev,
        quests: prev.quests.map((q) =>
          q.iconType === iconType && !q.claimed
            ? { ...q, progress: Math.min(q.target, q.progress + amount) }
            : q
        ),
      };
    },
    []
  );

  // Live Yard Simulation Tick (every 1000ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setVnClock(getVietnamClock());
      setFarm((prev) => {
        if (!prev) return prev;

        const currentVnKey = getVietnamDateKey();
        if (prev.lastQuestResetDate && prev.lastQuestResetDate !== currentVnKey) {
          showLiveToast('🌅 00:00 Ngày Mới! Nhiệm vụ & lượt trộm heo (2/2) đã làm mới!');
          soundFx.playChest();
          return {
            ...prev,
            quests: createInitialQuests(),
            stealsToday: 0,
            lastQuestResetDate: currentVnKey,
            neighbors: prev.neighbors.map((n) => ({ ...n, helpedToday: false })),
          };
        }

        let nextWater = prev.waterLevel;
        const nextDrops = [...prev.drops];
        const poopCount = nextDrops.filter((d) => d.type === 'poop').length;

        const nextPigs: PigInstance[] = prev.pigs.map((pig) => {
          const breed = BREED_MAP[pig.breedId] || PIG_BREEDS[0];

          // Wandering AI
          let { x, y, targetX, targetY, facing, isMoving } = pig;
          const dx = targetX - x;
          const dy = targetY - y;
          const dist = Math.hypot(dx, dy);

          if (dist < 1.8) {
            isMoving = false;
            if (Math.random() < 0.38) {
              targetX = 27 + Math.random() * 44;
              targetY = 33 + Math.random() * 38;
              facing = targetX < x ? 'left' : 'right';
              isMoving = true;
            }
          } else {
            const step = 3.2;
            x += (dx / dist) * step;
            y += (dy / dist) * step;
            facing = dx < 0 ? 'left' : 'right';
            isMoving = true;
          }

          // Needs & growth
          const hunger = Math.max(0, pig.hunger - 0.35);
          let thirst = Math.max(0, pig.thirst - (breed.id === 'watermelon' ? 0.22 : 0.32));

          // Auto-drink from water trough when thirsty
          if (thirst < 42 && nextWater > 3) {
            thirst = Math.min(100, thirst + 32);
            nextWater = Math.max(0, nextWater - 2.5);
          }

          // Sickness chance if dirty or neglected
          let isSick = pig.isSick;
          if (!isSick && breed.id !== 'cyber_mecha') {
            const sickChance = poopCount >= 4 || hunger < 12 ? 0.006 : 0.0005;
            if (Math.random() < sickChance) {
              isSick = true;
            }
          }

          const happiness = Math.max(
            0,
            Math.min(100, pig.happiness - (poopCount >= 3 ? 0.25 : 0.08))
          );

          // Growth rate
          const canGrow = !isSick && hunger > 20 && thirst > 20;
          const growthStep = canGrow ? (100 / breed.growthDurationSec) * 1.0 : 0.05;
          const growth = Math.min(100, pig.growth + growthStep);
          const stage: PigStage = growth >= 100 ? 'adult' : growth >= 45 ? 'teen' : 'piglet';

          const moodBubble = isSick
            ? 'sick'
            : hunger < 35
            ? 'hungry'
            : thirst < 35
            ? 'thirsty'
            : growth >= 100
            ? 'ready'
            : happiness > 88 && Math.random() < 0.06
            ? 'love'
            : null;

          // Random drops on yard (capped at 14 drops)
          if (nextDrops.length < 14 && Math.random() < 0.015) {
            const dropRoll = Math.random();
            if (dropRoll < 0.64) {
              nextDrops.push({
                id: uid('drop'),
                type: 'red_cube',
                x: Math.max(26, Math.min(73, x + (Math.random() * 6 - 3))),
                y: Math.max(34, Math.min(73, y + 3)),
                value: 25 + Math.floor(breed.sellPrice * 0.04),
                createdAt: Date.now(),
              });
            } else if (dropRoll < 0.88) {
              nextDrops.push({
                id: uid('drop'),
                type: 'poop',
                x: Math.max(26, Math.min(73, x)),
                y: Math.max(34, Math.min(73, y + 3)),
                value: 18,
                createdAt: Date.now(),
              });
            } else {
              nextDrops.push({
                id: uid('drop'),
                type: 'chest',
                x: Math.max(27, Math.min(72, x)),
                y: Math.max(36, Math.min(72, y + 3)),
                value: 110 + Math.floor(Math.random() * 90),
                createdAt: Date.now(),
              });
            }
          }

          return {
            ...pig,
            x,
            y,
            targetX,
            targetY,
            facing,
            isMoving,
            hunger,
            thirst,
            happiness,
            isSick,
            growth,
            stage,
            moodBubble,
          };
        });

        // Also gently animate neighbor pigs if visiting
        const nextNeighbors: NeighborFarm[] = prev.neighbors.map((nb) => ({
          ...nb,
          pigs: nb.pigs.map((p) => {
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 2) {
              if (Math.random() < 0.3) {
                const tx = 28 + Math.random() * 42;
                const ty = 34 + Math.random() * 35;
                const nextFacing: 'left' | 'right' = tx < p.x ? 'left' : 'right';
                return { ...p, targetX: tx, targetY: ty, facing: nextFacing, isMoving: true };
              }
              return { ...p, isMoving: false };
            }
            const moveFacing: 'left' | 'right' = dx < 0 ? 'left' : 'right';
            return {
              ...p,
              x: p.x + (dx / dist) * 2.5,
              y: p.y + (dy / dist) * 2.5,
              facing: moveFacing,
              isMoving: true,
            };
          }),
        }));

        return {
          ...prev,
          waterLevel: nextWater,
          pigs: nextPigs,
          drops: nextDrops,
          neighbors: nextNeighbors,
          lastTickAt: Date.now(),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentNeighbor: NeighborFarm | null = useMemo(() => {
    if (!farm || !visitingNeighborId) return null;
    return farm.neighbors.find((n) => n.id === visitingNeighborId) || null;
  }, [farm, visitingNeighborId]);

  const displayedPigs = currentNeighbor ? currentNeighbor.pigs : farm?.pigs || [];
  const displayedDrops = currentNeighbor ? currentNeighbor.drops : farm?.drops || [];
  const displayedWater = currentNeighbor ? currentNeighbor.waterLevel : farm?.waterLevel ?? 100;

  const selectedPig = useMemo(
    () => displayedPigs.find((p) => p.id === selectedPigId) || null,
    [displayedPigs, selectedPigId]
  );

  // Actions
  const handleFeedPig = useCallback(
    (pigId: string, deluxe = false) => {
      if (!farm) return;
      const itemKey = deluxe ? 'feed_deluxe' : 'feed_standard';
      if ((farm.inventory[itemKey] || 0) <= 0) {
        pushFeedback(50, 40, 'Hết thức ăn! Mua thêm ở Cửa Hàng', 'warn');
        setActiveModal('shop');
        return;
      }

      soundFx.playOink();
      triggerBounce(pigId);

      setFarm((prev) => {
        if (!prev) return prev;
        const targetPig = prev.pigs.find((p) => p.id === pigId);
        if (!targetPig) return prev;

        pushFeedback(
          targetPig.x,
          targetPig.y - 6,
          deluxe ? '+Bánh Ngon +8% Lớn' : '+No Bụng +5 XP',
          'love'
        );

        const nextPigs: PigInstance[] = prev.pigs.map((p) => {
          if (p.id !== pigId) return p;
          const growthGain = deluxe ? 8 : 3.5;
          const nextGrowth = Math.min(100, p.growth + growthGain);
          const nextStage: PigStage = nextGrowth >= 100 ? 'adult' : nextGrowth >= 45 ? 'teen' : 'piglet';
          return {
            ...p,
            hunger: deluxe ? 100 : Math.min(100, p.hunger + 45),
            happiness: Math.min(100, p.happiness + (deluxe ? 25 : 10)),
            growth: nextGrowth,
            stage: nextStage,
            moodBubble: 'love' as const,
          };
        });

        let updated: FarmState = {
          ...prev,
          pigs: nextPigs,
          totalFed: prev.totalFed + 1,
          inventory: {
            ...prev.inventory,
            [itemKey]: Math.max(0, (prev.inventory[itemKey] || 0) - 1),
          },
        };
        updated = addXpAndCoins(updated, 0, deluxe ? 12 : 5);
        updated = bumpQuest(updated, 'feed', 1);
        return updated;
      });
    },
    [farm, addXpAndCoins, bumpQuest, pushFeedback, triggerBounce]
  );

  const sendPartnerAction = useCallback(
    (msg: Exclude<P2PMessage, { type: 'FARM_SYNC' }>) => {
      if (p2pRef.current?.isConnected()) {
        p2pRef.current.send(msg);
      }
      if (farm?.partnerDeviceId) {
        roomRef.current?.sendEventToPartner(farm.partnerDeviceId, msg);
      }
    },
    [farm?.partnerDeviceId]
  );

  const handlePetPig = useCallback(
    (pigId: string) => {
      if (!farm) return;

      if (currentNeighbor) {
        const target = currentNeighbor.pigs.find((p) => p.id === pigId);
        if (!target) return;
        if (Math.round(target.happiness) >= 100) {
          soundFx.playClick();
          pushFeedback(target.x, target.y - 6, 'Heo đã vui vẻ 100% rồi!', 'warn');
          return;
        }
        soundFx.playOink();
        triggerBounce(pigId);
        pushFeedback(target.x, target.y - 6, '❤️ +10 ₫', 'coin');
        if (currentNeighbor.isPartner) {
          sendPartnerAction({
            type: 'ACTION_PET',
            senderName: farm.playerName,
            pigId,
          });
        }
        setFarm((prev) => {
          if (!prev) return prev;
          let updated = addXpAndCoins(prev, 10, 4);
          updated = {
            ...updated,
            neighbors: updated.neighbors.map((n) =>
              n.id === currentNeighbor.id
                ? {
                    ...n,
                    hearts: !n.helpedToday ? n.hearts + 1 : n.hearts,
                    helpedToday: true,
                    pigs: n.pigs.map((p) =>
                      p.id === pigId
                        ? { ...p, happiness: Math.min(100, p.happiness + 25), moodBubble: 'love' as const }
                        : p
                    ),
                  }
                : n
            ),
          };
          if (!currentNeighbor.helpedToday) {
            updated = bumpQuest(updated, 'visit', 1);
          }
          return updated;
        });
        return;
      }

      const ownTarget = farm.pigs.find((p) => p.id === pigId);
      if (!ownTarget) return;
      if (Math.round(ownTarget.happiness) >= 100) {
        soundFx.playClick();
        pushFeedback(ownTarget.x, ownTarget.y - 6, 'Vui vẻ 100% rồi, không nhận thêm XP!', 'warn');
        return;
      }

      soundFx.playOink();
      triggerBounce(pigId);
      setFarm((prev) => {
        if (!prev) return prev;
        const target = prev.pigs.find((p) => p.id === pigId);
        if (!target || Math.round(target.happiness) >= 100) return prev;
        pushFeedback(target.x, target.y - 6, '❤️ +6 ₫ · +3 XP', 'love');
        const nextPigs = prev.pigs.map((p) =>
          p.id === pigId
            ? {
                ...p,
                happiness: Math.min(100, p.happiness + 18),
                moodBubble: 'love' as const,
              }
            : p
        );
        return addXpAndCoins(
          {
            ...prev,
            pigs: nextPigs,
            totalPetted: (prev.totalPetted || 0) + 1,
          },
          6,
          3
        );
      });
    },
    [farm, currentNeighbor, addXpAndCoins, bumpQuest, pushFeedback, sendPartnerAction, triggerBounce]
  );

  const handleStealPig = useCallback(
    (pigId: string) => {
      if (!farm || !currentNeighbor) return;
      const stealsUsed = farm.stealsToday || 0;
      if (stealsUsed >= MAX_STEALS_PER_DAY) {
        soundFx.playClick();
        pushFeedback(50, 36, `Hết ${MAX_STEALS_PER_DAY}/2 lượt trộm hôm nay! (Chờ 0:00)`, 'warn');
        return;
      }
      if (currentNeighbor.pigs.length <= 1) {
        soundFx.playClick();
        pushFeedback(50, 36, 'Đối phương chỉ còn 1 bé heo cuối, không thể trộm!', 'warn');
        return;
      }
      const targetPig = currentNeighbor.pigs.find((p) => p.id === pigId);
      if (!targetPig) return;

      const barnHasSpace = farm.pigs.length < farm.barnCapacity;
      const bagHasSpace = (farm.storedPigs?.length || 0) < MAX_STORED_PIGS;
      if (!barnHasSpace && !bagHasSpace) {
        soundFx.playClick();
        pushFeedback(50, 36, 'Chuồng và Túi Đồ đều đã đầy, hãy dọn chỗ trước!', 'warn');
        return;
      }

      const breed = BREED_MAP[targetPig.breedId] || PIG_BREEDS[0];
      const nextSteals = stealsUsed + 1;
      const remaining = MAX_STEALS_PER_DAY - nextSteals;

      soundFx.playChest();
      pushFeedback(
        targetPig.x,
        targetPig.y - 6,
        barnHasSpace
          ? `🥷 Trộm thành công ${breed.name}! (Còn ${remaining}/2)`
          : `🥷 Trộm ${breed.name} vào Túi Đồ! (Còn ${remaining}/2)`,
        'gem'
      );

      if (currentNeighbor.isPartner) {
        sendPartnerAction({
          type: 'ACTION_STEAL_PIG',
          senderName: farm.playerName,
          pigId: targetPig.id,
          breedId: targetPig.breedId,
          nickname: targetPig.nickname,
        });
      }

      setFarm((prev) => {
        if (!prev) return prev;
        const stolenClone = createPigInstance(targetPig.breedId, {
          growth: targetPig.growth,
          nickname: targetPig.nickname,
        });
        const putInYard = prev.pigs.length < prev.barnCapacity;
        const unlocked = prev.unlockedBreeds.includes(targetPig.breedId)
          ? prev.unlockedBreeds
          : [...prev.unlockedBreeds, targetPig.breedId];

        const updated: FarmState = {
          ...prev,
          pigs: putInYard ? [...prev.pigs, stolenClone] : prev.pigs,
          storedPigs: putInYard ? prev.storedPigs : [...(prev.storedPigs || []), stolenClone],
          unlockedBreeds: unlocked,
          stealsToday: (prev.stealsToday || 0) + 1,
          totalStolen: (prev.totalStolen || 0) + 1,
          neighbors: prev.neighbors.map((n) =>
            n.id === currentNeighbor.id
              ? { ...n, pigs: n.pigs.filter((p) => p.id !== pigId) }
              : n
          ),
        };
        return addXpAndCoins(updated, 0, 20);
      });
      setSelectedPigId((curr) => (curr === pigId ? null : curr));
    },
    [farm, currentNeighbor, addXpAndCoins, pushFeedback, sendPartnerAction]
  );

  const handleHealPig = useCallback(
    (pigId: string) => {
      if (!farm) return;
      if ((farm.inventory['medicine_pill'] || 0) <= 0) {
        pushFeedback(50, 40, 'Hết Thuốc Bổ! Hãy mua ở Cửa Hàng', 'warn');
        setActiveModal('shop');
        return;
      }
      soundFx.playWater();
      triggerBounce(pigId);

      setFarm((prev) => {
        if (!prev) return prev;
        const target = prev.pigs.find((p) => p.id === pigId);
        if (target) pushFeedback(target.x, target.y - 6, 'Khỏe Mạnh! +10 XP', 'heal');
        return addXpAndCoins(
          {
            ...prev,
            pigs: prev.pigs.map((p) =>
              p.id === pigId
                ? { ...p, isSick: false, health: 100, happiness: Math.min(100, p.happiness + 15), moodBubble: 'love' }
                : p
            ),
            inventory: {
              ...prev.inventory,
              medicine_pill: Math.max(0, (prev.inventory['medicine_pill'] || 0) - 1),
            },
          },
          0,
          10
        );
      });
    },
    [farm, addXpAndCoins, pushFeedback, triggerBounce]
  );

  const handleVitaminPig = useCallback(
    (pigId: string) => {
      if (!farm || (farm.inventory['vitamin_boost'] || 0) <= 0) return;
      soundFx.playChest();
      triggerBounce(pigId);
      setFarm((prev) => {
        if (!prev) return prev;
        const target = prev.pigs.find((p) => p.id === pigId);
        if (target) pushFeedback(target.x, target.y - 6, '+25% Tăng Trưởng!', 'xp');
        return {
          ...prev,
          pigs: prev.pigs.map((p) => {
            if (p.id !== pigId) return p;
            const g = Math.min(100, p.growth + 25);
            const nextStage: PigStage = g >= 100 ? 'adult' : g >= 45 ? 'teen' : 'piglet';
            return {
              ...p,
              growth: g,
              stage: nextStage,
              moodBubble: g >= 100 ? ('ready' as const) : ('love' as const),
            };
          }),
          inventory: {
            ...prev.inventory,
            vitamin_boost: Math.max(0, (prev.inventory['vitamin_boost'] || 0) - 1),
          },
        };
      });
    },
    [farm, pushFeedback, triggerBounce]
  );

  const handleSellPig = useCallback(
    (pigId: string) => {
      setFarm((prev) => {
        if (!prev) return prev;
        const pig = prev.pigs.find((p) => p.id === pigId);
        if (!pig) return prev;
        const breed = BREED_MAP[pig.breedId] || PIG_BREEDS[0];
        const isAdult = pig.growth >= 100;
        const price = isAdult
          ? Math.round(breed.sellPrice * (0.85 + (pig.happiness / 100) * 0.35))
          : Math.round(breed.sellPrice * 0.25);

        soundFx.playCoin();
        pushFeedback(pig.x, pig.y - 6, `+${price} ₫`, 'coin');

        let updated = {
          ...prev,
          pigs: prev.pigs.filter((p) => p.id !== pigId),
          totalSold: prev.totalSold + (isAdult ? 1 : 0),
        };
        updated = addXpAndCoins(updated, price, isAdult ? 35 : 8);
        if (isAdult) {
          updated = bumpQuest(updated, 'scroll', 1);
        }
        updated = {
          ...updated,
          achievements: updated.achievements.map((a) =>
            a.id === 'ach_tycoon'
              ? {
                  ...a,
                  progress: updated.totalSold,
                  unlocked: updated.totalSold >= a.target,
                }
              : a
          ),
        };
        return updated;
      });
      setSelectedPigId((curr) => (curr === pigId ? null : curr));
    },
    [addXpAndCoins, bumpQuest, pushFeedback]
  );

  const handleStorePig = useCallback(
    (pigId: string) => {
      if (!farm || currentNeighbor) return;
      const target = farm.pigs.find((p) => p.id === pigId);
      if (!target) return;
      if ((farm.storedPigs?.length || 0) >= MAX_STORED_PIGS) {
        pushFeedback(50, 34, `Túi đồ đã đầy (${MAX_STORED_PIGS}/${MAX_STORED_PIGS} heo)!`, 'warn');
        return;
      }
      soundFx.playClick();
      pushFeedback(target.x, target.y - 6, `Đã cất ${target.nickname} vào túi!`, 'love');
      setFarm((prev) => {
        if (!prev) return prev;
        const pig = prev.pigs.find((p) => p.id === pigId);
        if (!pig || (prev.storedPigs?.length || 0) >= MAX_STORED_PIGS) return prev;
        return {
          ...prev,
          pigs: prev.pigs.filter((p) => p.id !== pigId),
          storedPigs: [
            ...(prev.storedPigs || []),
            { ...pig, isMoving: false, moodBubble: null },
          ],
        };
      });
      setSelectedPigId((curr) => (curr === pigId ? null : curr));
    },
    [currentNeighbor, farm, pushFeedback]
  );

  const handleReleasePig = useCallback(
    (pigId: string) => {
      if (!farm || currentNeighbor) return;
      const target = (farm.storedPigs || []).find((p) => p.id === pigId);
      if (!target) return;
      if (farm.pigs.length >= farm.barnCapacity) {
        pushFeedback(50, 34, `Chuồng đã đầy (${farm.pigs.length}/${farm.barnCapacity})!`, 'warn');
        return;
      }
      const nextX = 28 + Math.random() * 42;
      const nextY = 35 + Math.random() * 33;
      soundFx.playOink();
      pushFeedback(nextX, nextY - 6, `Đã thả ${target.nickname} ra chuồng!`, 'love');
      setFarm((prev) => {
        if (!prev || prev.pigs.length >= prev.barnCapacity) return prev;
        const pig = (prev.storedPigs || []).find((p) => p.id === pigId);
        if (!pig) return prev;
        return {
          ...prev,
          storedPigs: (prev.storedPigs || []).filter((p) => p.id !== pigId),
          pigs: [
            ...prev.pigs,
            {
              ...pig,
              x: nextX,
              y: nextY,
              targetX: nextX,
              targetY: nextY,
              isMoving: false,
            },
          ],
        };
      });
    },
    [currentNeighbor, farm, pushFeedback]
  );

  const handleSellStoredPig = useCallback(
    (pigId: string) => {
      setFarm((prev) => {
        if (!prev) return prev;
        const pig = (prev.storedPigs || []).find((p) => p.id === pigId);
        if (!pig) return prev;
        const breed = BREED_MAP[pig.breedId] || PIG_BREEDS[0];
        const isAdult = pig.growth >= 100;
        const price = isAdult
          ? Math.round(breed.sellPrice * (0.85 + (pig.happiness / 100) * 0.35))
          : Math.round(breed.sellPrice * 0.25);

        soundFx.playCoin();
        pushFeedback(50, 38, `Bán ${pig.nickname} +${price} ₫`, 'coin');

        let updated: FarmState = {
          ...prev,
          storedPigs: (prev.storedPigs || []).filter((p) => p.id !== pigId),
          totalSold: prev.totalSold + (isAdult ? 1 : 0),
        };
        updated = addXpAndCoins(updated, price, isAdult ? 35 : 8);
        if (isAdult) {
          updated = bumpQuest(updated, 'scroll', 1);
        }
        return syncAchievements(updated);
      });
    },
    [addXpAndCoins, bumpQuest, pushFeedback]
  );

  const handleClickPig = (pig: PigInstance) => {
    if (currentNeighbor) {
      if (activeTool === 'glove') {
        handlePetPig(pig.id);
      } else {
        soundFx.playOink();
        setSelectedPigId(pig.id);
      }
      return;
    }

    if (activeTool === 'feed') {
      handleFeedPig(pig.id, false);
    } else if (activeTool === 'glove') {
      handlePetPig(pig.id);
    } else if (activeTool === 'medicine') {
      if (pig.isSick) {
        handleHealPig(pig.id);
      } else {
        handleVitaminPig(pig.id);
      }
    } else {
      soundFx.playOink();
      triggerBounce(pig.id);
      setSelectedPigId((curr) => (curr === pig.id ? null : pig.id));
    }
  };

  const handleCollectDrop = (drop: YardDrop) => {
    if (currentNeighbor) {
      if (drop.type === 'poop') {
        soundFx.playSweep();
        pushFeedback(drop.x, drop.y - 4, 'Dọn giúp +20 ₫', 'coin');
      } else {
        soundFx.playCoin();
        pushFeedback(drop.x, drop.y - 4, `Nhặt ké +${Math.round(drop.value * 0.7)} ₫`, 'coin');
      }
      setFarm((prev) => {
        if (!prev) return prev;
        let updated = addXpAndCoins(prev, drop.type === 'poop' ? 20 : Math.round(drop.value * 0.7), 6);
        updated = {
          ...updated,
          neighbors: updated.neighbors.map((n) =>
            n.id === currentNeighbor.id
              ? { ...n, drops: n.drops.filter((d) => d.id !== drop.id) }
              : n
          ),
        };
        return updated;
      });
      return;
    }

    if (drop.type === 'poop') {
      soundFx.playSweep();
      pushFeedback(drop.x, drop.y - 4, `Sạch sẽ! +${drop.value} ₫`, 'coin');
      setFarm((prev) => {
        if (!prev) return prev;
        let updated = {
          ...prev,
          drops: prev.drops.filter((d) => d.id !== drop.id),
          totalCleaned: prev.totalCleaned + 1,
        };
        updated = addXpAndCoins(updated, drop.value, 6);
        updated = bumpQuest(updated, 'clean', 1);
        return updated;
      });
      return;
    }

    if (drop.type === 'chest') {
      soundFx.playChest();
      const bonusGem = Math.random() < 0.45 ? 1 : 0;
      pushFeedback(
        drop.x,
        drop.y - 4,
        bonusGem ? `+${drop.value} ₫ · +1 Ngọc!` : `+${drop.value} ₫!`,
        'gem'
      );
      setFarm((prev) => {
        if (!prev) return prev;
        let updated = {
          ...prev,
          drops: prev.drops.filter((d) => d.id !== drop.id),
        };
        updated = addXpAndCoins(updated, drop.value, 18, bonusGem);
        updated = bumpQuest(updated, 'feed', 1);
        return updated;
      });
      return;
    }

    // red_cube or coin_bag
    soundFx.playCoin();
    pushFeedback(drop.x, drop.y - 4, `+${drop.value} ₫`, 'coin');
    setFarm((prev) => {
      if (!prev) return prev;
      let updated = {
        ...prev,
        drops: prev.drops.filter((d) => d.id !== drop.id),
      };
      updated = addXpAndCoins(updated, drop.value, 5);
      updated = bumpQuest(updated, 'feed', 1);
      return updated;
    });
  };

  const handleFeedAll = () => {
    if (!farm || currentNeighbor) return;
    const feedQty = farm.inventory['feed_standard'] || 0;
    if (feedQty <= 0) {
      pushFeedback(30, 30, 'Hết Cám! Mua thêm ở Cửa Hàng', 'warn');
      setActiveModal('shop');
      return;
    }
    const hungryPigs = farm.pigs.filter((p) => p.hunger < 92);
    const targets = hungryPigs.length > 0 ? hungryPigs : farm.pigs;
    const used = Math.min(feedQty, targets.length);
    if (used === 0) return;

    soundFx.playOink();
    pushFeedback(48, 35, `Đã cho ${used} heo ăn cám!`, 'love');

    const fedIds = new Set(targets.slice(0, used).map((p) => p.id));
    setFarm((prev) => {
      if (!prev) return prev;
      let updated: FarmState = {
        ...prev,
        pigs: prev.pigs.map((p) => {
          if (!fedIds.has(p.id)) return p;
          const nextG = Math.min(100, p.growth + 4);
          const nextStage: PigStage = nextG >= 100 ? 'adult' : nextG >= 45 ? 'teen' : 'piglet';
          return {
            ...p,
            hunger: Math.min(100, p.hunger + 48),
            happiness: Math.min(100, p.happiness + 10),
            growth: nextG,
            stage: nextStage,
            moodBubble: 'love' as const,
          };
        }),
        inventory: {
          ...prev.inventory,
          feed_standard: Math.max(0, (prev.inventory['feed_standard'] || 0) - used),
        },
        totalFed: prev.totalFed + used,
      };
      updated = addXpAndCoins(updated, 0, used * 4);
      updated = bumpQuest(updated, 'feed', used);
      return updated;
    });
  };

  const handleHealAll = () => {
    if (!farm || currentNeighbor) return;
    const sickPigs = farm.pigs.filter((p) => p.isSick);
    if (sickPigs.length === 0) {
      pushFeedback(50, 40, 'Cả đàn heo đều khỏe mạnh!', 'heal');
      return;
    }
    const meds = farm.inventory['medicine_pill'] || 0;
    if (meds <= 0) {
      setActiveModal('shop');
      return;
    }
    const count = Math.min(meds, sickPigs.length);
    const healIds = new Set(sickPigs.slice(0, count).map((p) => p.id));
    soundFx.playWater();
    pushFeedback(50, 40, `Đã chữa cho ${count} bé heo!`, 'heal');
    setFarm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pigs: prev.pigs.map((p) => (healIds.has(p.id) ? { ...p, isSick: false, health: 100 } : p)),
        inventory: {
          ...prev.inventory,
          medicine_pill: Math.max(0, (prev.inventory['medicine_pill'] || 0) - count),
        },
      };
    });
  };

  const handleRefillWater = () => {
    if (!farm) return;
    if (currentNeighbor) {
      if (Math.round(currentNeighbor.waterLevel) >= 100) {
        soundFx.playClick();
        pushFeedback(84, 52, 'Máng nước nhà hàng xóm đã đầy 100% rồi!', 'warn');
        return;
      }
      soundFx.playWater();
      pushFeedback(84, 52, 'Châm nước giúp hàng xóm +15 ₫', 'coin');
      if (currentNeighbor.isPartner) {
        sendPartnerAction({
          type: 'ACTION_WATER',
          senderName: farm.playerName,
        });
      }
      setFarm((prev) => {
        if (!prev) return prev;
        let updated = addXpAndCoins(prev, 15, 6);
        updated = {
          ...updated,
          neighbors: updated.neighbors.map((n) =>
            n.id === currentNeighbor.id ? { ...n, waterLevel: 100, helpedToday: true } : n
          ),
        };
        if (!currentNeighbor.helpedToday) updated = bumpQuest(updated, 'visit', 1);
        return updated;
      });
      return;
    }

    if (Math.round(farm.waterLevel) >= 100) {
      soundFx.playClick();
      pushFeedback(84, 52, 'Máng nước đã đầy 100% rồi!', 'warn');
      return;
    }

    soundFx.playWater();
    pushFeedback(84, 52, 'Đã bơm đầy máng nước! +5 XP', 'heal');
    setFarm((prev) => {
      if (!prev || Math.round(prev.waterLevel) >= 100) return prev;
      return addXpAndCoins(
        {
          ...prev,
          waterLevel: 100,
          pigs: prev.pigs.map((p) => ({ ...p, thirst: Math.min(100, p.thirst + 35) })),
        },
        0,
        5
      );
    });
  };

  const handleScratchPost = () => {
    soundFx.playOink();
    pushFeedback(88, 52, 'Cả đàn chạy tới cọ lưng vui quá! ❤️', 'love');
    if (currentNeighbor) return;
    setFarm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pigs: prev.pigs.map((p) => ({
          ...p,
          targetX: 63 + Math.random() * 9,
          targetY: 42 + Math.random() * 20,
          facing: 'right',
          isMoving: true,
          happiness: Math.min(100, p.happiness + 12),
          moodBubble: 'love',
        })),
      };
    });
  };

  const handleBuyPig = (breedId: string) => {
    if (!farm) return;
    const breed = BREED_MAP[breedId];
    const reqLevel = breed?.unlockLevel ?? 1;
    if (
      !breed ||
      breed.buyPrice <= 0 ||
      farm.level < reqLevel ||
      farm.coins < breed.buyPrice ||
      farm.pigs.length >= farm.barnCapacity
    ) {
      return;
    }
    soundFx.playCoin();
    const newPig = createPigInstance(breedId, { growth: 0 });
    pushFeedback(newPig.x, newPig.y - 6, `Chào đón ${breed.name}!`, 'love');

    setFarm((prev) => {
      if (!prev) return prev;
      const unlocked = prev.unlockedBreeds.includes(breedId)
        ? prev.unlockedBreeds
        : [...prev.unlockedBreeds, breedId];
      return syncAchievements({
        ...prev,
        coins: prev.coins - breed.buyPrice,
        pigs: [...prev.pigs, newPig],
        unlockedBreeds: unlocked,
      });
    });
  };

  const handleBuySupply = (itemId: string, qty: number) => {
    if (!farm) return;
    const item = SHOP_SUPPLIES.find((s) => s.id === itemId);
    if (!item) return;
    const total = item.price * qty;
    if (farm.coins < total) return;
    soundFx.playCoin();
    setFarm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        coins: prev.coins - total,
        inventory: {
          ...prev.inventory,
          [itemId]: (prev.inventory[itemId] || 0) + qty,
        },
      };
    });
  };

  const handleExpandBarn = () => {
    if (!farm || farm.barnCapacity >= 28) return;
    const cost = getBarnExpandCost(farm.barnCapacity);
    if (farm.coins < cost) return;
    soundFx.playChest();
    setFarm((prev) =>
      prev
        ? syncAchievements({
            ...prev,
            coins: prev.coins - cost,
            barnCapacity: Math.min(28, prev.barnCapacity + 4),
          })
        : prev
    );
  };

  const handleHireDog = () => {
    if (!farm || farm.coins < 180) return;
    soundFx.playOink();
    pushFeedback(14, 70, 'Gâu gâu! Cún đã vào vị trí canh trại', 'love');
    setFarm((prev) =>
      prev
        ? {
            ...prev,
            coins: prev.coins - 180,
            guardDogActiveUntil: Date.now() + 1000 * 60 * 60,
          }
        : prev
    );
  };

  const handleBreed = (pigAId: string, pigBId: string, useCharm: boolean) => {
    if (!farm) return;
    const pA = farm.pigs.find((p) => p.id === pigAId);
    const pB = farm.pigs.find((p) => p.id === pigBId);
    if (!pA || !pB || pA.id === pB.id) return;

    const breedCost = calculateBreedingCost(pA.breedId, pB.breedId);
    if (farm.coins < breedCost) {
      pushFeedback(50, 42, `Không đủ xu! Cần ${breedCost.toLocaleString('vi-VN')} ₫`, 'warn');
      return;
    }

    const childBreedId = resolveBreedingOutcome(pA.breedId, pB.breedId, useCharm);
    const incubator: BreedingIncubator = {
      id: uid('incubator'),
      parentAName: pA.nickname,
      parentBName: pB.nickname,
      childBreedId,
      startAt: Date.now(),
      durationMs: 5 * 60 * 1000, // 5 minutes = 300,000 ms
    };

    soundFx.playChest();
    pushFeedback(50, 42, `🥚 Đã bắt đầu ấp trứng lai tạo (5 phút)! (-${breedCost.toLocaleString('vi-VN')} ₫)`, 'love');

    setFarm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        coins: prev.coins - breedCost,
        breedingIncubators: [...(prev.breedingIncubators || []), incubator],
        inventory: useCharm
          ? {
              ...prev.inventory,
              breed_charm: Math.max(0, (prev.inventory['breed_charm'] || 0) - 1),
            }
          : prev.inventory,
      };
    });
  };

  const handleClaimIncubator = (incubatorId: string) => {
    if (!farm) return;
    const inc = (farm.breedingIncubators || []).find((i) => i.id === incubatorId);
    if (!inc) return;

    const elapsed = Date.now() - inc.startAt;
    if (elapsed < inc.durationMs) {
      pushFeedback(50, 42, 'Trứng đang trong thời gian ấp, chưa nở được!', 'warn');
      return;
    }

    const childBreed = BREED_MAP[inc.childBreedId] || PIG_BREEDS[0];
    const isRareHatch =
      childBreed.rarity === 'rare' ||
      childBreed.rarity === 'epic' ||
      childBreed.rarity === 'legendary';

    soundFx.playChest();
    pushFeedback(
      50,
      42,
      isRareHatch
        ? `🌟 BẤT NGỜ! Trứng nở ra ${childBreed.name}!`
        : `🎉 Trứng nở thành công: ${childBreed.name}!`,
      'gem'
    );
    if (isRareHatch) {
      showLiveToast(`🌟 Tuyệt vời! Trứng ấp nở ra giống hiếm: ${childBreed.name}!`);
    }

    setFarm((prev) => {
      if (!prev) return prev;
      const baby = createPigInstance(inc.childBreedId, { growth: 5 });
      const canPutInYard = prev.pigs.length < prev.barnCapacity;
      const nextPigs = canPutInYard ? [...prev.pigs, baby] : prev.pigs;
      const nextStored = canPutInYard ? prev.storedPigs : [...(prev.storedPigs || []), baby];

      const unlocked = prev.unlockedBreeds.includes(inc.childBreedId)
        ? prev.unlockedBreeds
        : [...prev.unlockedBreeds, inc.childBreedId];

      let updated: FarmState = {
        ...prev,
        breedingIncubators: (prev.breedingIncubators || []).filter((i) => i.id !== incubatorId),
        pigs: nextPigs,
        storedPigs: nextStored,
        unlockedBreeds: unlocked,
        totalBred: prev.totalBred + 1,
      };
      updated = addXpAndCoins(updated, 0, 45);
      updated = bumpQuest(updated, 'breed', 1);
      updated = {
        ...updated,
        achievements: updated.achievements.map((a) => {
          if (a.id.startsWith('ach_collector')) {
            return { ...a, progress: unlocked.length, unlocked: unlocked.length >= a.target };
          }
          if (a.id === 'ach_breeder') {
            return { ...a, progress: updated.totalBred, unlocked: updated.totalBred >= a.target };
          }
          return a;
        }),
      };
      return updated;
    });
  };

  const handleClaimQuest = (questId: string) => {
    if (!farm) return;
    const quest = farm.quests.find((q) => q.id === questId);
    if (!quest || quest.claimed || quest.progress < quest.target) return;
    soundFx.playChest();
    pushFeedback(50, 35, `+${quest.rewardCoins} ₫ · +${quest.rewardGems} Ngọc`, 'gem');
    setFarm((prev) => {
      if (!prev) return prev;
      const updated = addXpAndCoins(
        {
          ...prev,
          quests: prev.quests.map((q) => (q.id === questId ? { ...q, claimed: true } : q)),
        },
        quest.rewardCoins,
        quest.rewardXp,
        quest.rewardGems
      );
      return updated;
    });
  };

  const handleClaimAchievement = (achievementId: string) => {
    if (!farm) return;
    const ach = farm.achievements.find((a) => a.id === achievementId);
    if (!ach || !ach.unlocked || ach.claimed) return;
    soundFx.playChest();
    const coinReward = ach.rewardCoins || 0;
    pushFeedback(
      50,
      32,
      coinReward > 0
        ? `🏆 +${ach.rewardGems} Ngọc · +${coinReward.toLocaleString('vi-VN')} ₫`
        : `🏆 +${ach.rewardGems} Ngọc`,
      'gem'
    );
    setFarm((prev) => {
      if (!prev) return prev;
      const marked = {
        ...prev,
        achievements: prev.achievements.map((a) =>
          a.id === achievementId ? { ...a, claimed: true } : a
        ),
      };
      return addXpAndCoins(marked, coinReward, 25, ach.rewardGems);
    });
  };

  const handleSpinWheel = () => {
    if (!farm) return null;
    const canFree = Date.now() - farm.lastWheelSpinAt > 1000 * 60 * 5;
    if (!canFree && farm.coins < 120) return null;

    const rarePool = PIG_BREEDS.filter((b) => b.rarity === 'rare');
    const chosenRare = rarePool[Math.floor(Math.random() * rarePool.length)] || PIG_BREEDS[0];

    // Matches WHEEL_SLICES indices (0: Rare Pig, 1..5: Gold Coins)
    const wheelEntries = [
      {
        sliceIndex: 0,
        weight: 0.08,
        label: `Heo Hiếm: ${chosenRare.name}!`,
        coins: 0,
        pig: chosenRare.id,
      },
      { sliceIndex: 1, weight: 0.25, label: '+150 Xu Vàng', coins: 150, pig: null },
      { sliceIndex: 2, weight: 0.20, label: '+400 Xu Vàng', coins: 400, pig: null },
      { sliceIndex: 3, weight: 0.23, label: '+250 Xu Vàng', coins: 250, pig: null },
      { sliceIndex: 4, weight: 0.09, label: '+1.000 Xu Vàng', coins: 1000, pig: null },
      { sliceIndex: 5, weight: 0.15, label: '+600 Xu Vàng', coins: 600, pig: null },
    ];

    const r = Math.random();
    let acc = 0;
    let picked = wheelEntries[1];
    for (const entry of wheelEntries) {
      acc += entry.weight;
      if (r <= acc) {
        picked = entry;
        break;
      }
    }

    const barnFullForPig = Boolean(picked.pig && farm.pigs.length >= farm.barnCapacity);
    const finalLabel = barnFullForPig
      ? `${picked.label} (Chuồng đầy, quy đổi +1.000 Xu Vàng)`
      : picked.label;

    soundFx.playChest();

    setFarm((prev) => {
      if (!prev) return prev;
      let updated: FarmState = {
        ...prev,
        coins: prev.coins - (canFree ? 0 : 120),
        lastWheelSpinAt: canFree ? Date.now() : prev.lastWheelSpinAt,
        totalWheelSpins: (prev.totalWheelSpins || 0) + 1,
      };
      const coinAward = barnFullForPig ? 1000 : picked.coins;

      if (picked.pig && updated.pigs.length < updated.barnCapacity) {
        const baby = createPigInstance(picked.pig, { growth: 15 });
        const unlocked = updated.unlockedBreeds.includes(picked.pig)
          ? updated.unlockedBreeds
          : [...updated.unlockedBreeds, picked.pig];
        updated = {
          ...updated,
          pigs: [...updated.pigs, baby],
          unlockedBreeds: unlocked,
        };
      }
      return addXpAndCoins(updated, coinAward, 15, 0);
    });

    return { label: finalLabel, sliceIndex: picked.sliceIndex };
  };

  const handleClaimDailyGift = () => {
    if (!farm) return;
    const today = new Date().toDateString();
    const lastClaimed = farm.dailyGiftClaimedAt
      ? new Date(farm.dailyGiftClaimedAt).toDateString()
      : '';
    if (today === lastClaimed) {
      pushFeedback(75, 72, 'Bạn đã nhận quà hôm nay rồi!', 'warn');
      return;
    }
    soundFx.playChest();
    pushFeedback(75, 72, 'Quà Hằng Ngày: +300 ₫ · +2 Ngọc · +5 Cám!', 'gem');
    setFarm((prev) => {
      if (!prev) return prev;
      let updated: FarmState = {
        ...prev,
        dailyGiftClaimedAt: Date.now(),
        inventory: {
          ...prev.inventory,
          feed_standard: (prev.inventory['feed_standard'] || 0) + 5,
        },
      };
      updated = addXpAndCoins(updated, 300, 25, 2);
      return updated;
    });
  };

  const handleInviteNeighbor = () => {
    if (!farm) return;
    const existingNames = new Set(farm.neighbors.map((n) => n.farmerName));
    const candidate = NEIGHBOR_POOL.find((c) => !existingNames.has(c.farmerName));
    if (!candidate) {
      pushFeedback(70, 75, 'Đã kết nối hết nông trại khu vực!', 'love');
      return;
    }
    soundFx.playCoin();
    const newNeighbor: NeighborFarm = {
      id: uid('nb'),
      name: candidate.name,
      farmerName: candidate.farmerName,
      avatarColor: candidate.avatarColor,
      avatarHair: candidate.avatarHair,
      level: 10 + Math.floor(Math.random() * 25),
      rank: farm.neighbors.length + 1,
      hearts: 30 + Math.floor(Math.random() * 90),
      greeting: 'Rất vui được làm hàng xóm!',
      waterLevel: 70,
      helpedToday: false,
      storedPigs: [],
      pigs: [
        createPigInstance('strawberry', { growth: 80, x: 35, y: 42 }),
        createPigInstance('panda_pig', { growth: 100, x: 54, y: 48 }),
        createPigInstance('pink_flower', { growth: 60, x: 44, y: 58 }),
      ],
      drops: [
        { id: uid('drop'), type: 'red_cube', x: 42, y: 54, value: 38, createdAt: Date.now() },
      ],
    };
    setFarm((prev) =>
      prev ? { ...prev, neighbors: [...prev.neighbors, newNeighbor] } : prev
    );
    pushFeedback(65, 75, `Đã thêm ${candidate.farmerName} vào hàng xóm!`, 'love');
  };

  const showLiveToast = useCallback((msg: string) => {
    setLiveBannerMsg(msg);
    setTimeout(() => {
      setLiveBannerMsg((curr) => (curr === msg ? null : curr));
    }, 4500);
  }, []);

  useEffect(() => {
    if (!farm) return;
    if (prevLevelRef.current !== null && farm.level > prevLevelRef.current) {
      const newlyUnlocked = PIG_BREEDS.filter(
        (b) => b.buyPrice > 0 && (b.unlockLevel ?? 1) > prevLevelRef.current! && (b.unlockLevel ?? 1) <= farm.level
      );
      if (newlyUnlocked.length > 0) {
        soundFx.playChest();
        showLiveToast(
          `🎉 Lên Cấp ${farm.level}! Cửa Hàng vừa mở bán: ${newlyUnlocked.map((b) => b.name).join(', ')}!`
        );
      } else {
        showLiveToast(`🎉 Chúc mừng bạn đạt Cấp ${farm.level}!`);
      }
    }
    prevLevelRef.current = farm.level;
  }, [farm?.level, farm, showLiveToast]);

  const buildSnapshot = useCallback((state: FarmState): LiveFarmSnapshot => ({
    deviceId: getOrCreateDeviceId(),
    senderName: state.playerName,
    farmName: state.farmGreeting,
    greeting: state.loveNote || state.farmGreeting,
    level: state.level,
    waterLevel: state.waterLevel,
    guardDogActiveUntil: state.guardDogActiveUntil,
    pigs: state.pigs.map((p) => ({
      id: p.id,
      breedId: p.breedId,
      nickname: p.nickname,
      growth: Math.round(p.growth),
      x: Math.round(p.x),
      y: Math.round(p.y),
      facing: p.facing,
      isSick: p.isSick,
    })),
    drops: state.drops.slice(0, 6).map((d) => ({
      id: d.id,
      type: d.type,
      x: Math.round(d.x),
      y: Math.round(d.y),
      value: d.value,
    })),
  }), []);

  const applyIncomingPartnerSnapshot = useCallback((snap: LiveFarmSnapshot, senderDeviceId?: string) => {
    setFarm((prev) => {
      if (!prev) return prev;
      const partnerNeighbor: NeighborFarm = {
        id: 'partner_farm',
        name: snap.farmName,
        farmerName: snap.senderName,
        avatarColor: '#ec4899',
        avatarHair: '#292524',
        level: snap.level,
        rank: 1,
        hearts: 99 + prev.lovePoints,
        greeting: snap.greeting,
        waterLevel: snap.waterLevel,
        helpedToday: false,
        isPartner: true,
        isRealFriend: true,
        lastSyncedAt: Date.now(),
        storedPigs: [],
        pigs: snap.pigs.map((p) => ({
          ...createPigInstance(p.breedId, {
            growth: p.growth,
            x: p.x,
            y: p.y,
            nickname: p.nickname,
          }),
          id: p.id,
          facing: p.facing,
          isSick: p.isSick,
        })),
        drops: snap.drops.map((d) => ({ ...d, createdAt: Date.now() })),
      };
      const others = prev.neighbors.filter((n) => n.id !== 'partner_farm' && !n.isPartner);
      return {
        ...prev,
        partnerName: snap.senderName,
        partnerDeviceId: senderDeviceId || snap.deviceId || prev.partnerDeviceId,
        neighbors: [partnerNeighbor, ...others],
      };
    });
  }, []);

  const handleP2PMessage = useCallback(
    (msg: P2PMessage) => {
      if (msg.type === 'FARM_SYNC') {
        applyIncomingPartnerSnapshot(msg.payload, msg.payload.deviceId);
      } else if (msg.type === 'PING_HEART') {
        soundFx.playChest();
        showLiveToast(`💕 ${msg.senderName}: "${msg.text}"`);
        pushFeedback(50, 32, `💕 ${msg.senderName}: ${msg.text}`, 'love');
      } else if (msg.type === 'ACTION_PET') {
        soundFx.playOink();
        triggerBounce(msg.pigId);
        showLiveToast(`💕 ${msg.senderName} vừa vuốt ve heo của bạn (+10 ₫)`);
        setFarm((prev) => {
          if (!prev) return prev;
          return addXpAndCoins(
            {
              ...prev,
              lovePoints: prev.lovePoints + 1,
              pigs: prev.pigs.map((p) =>
                p.id === msg.pigId
                  ? { ...p, happiness: Math.min(100, p.happiness + 18), moodBubble: 'love' }
                  : p
              ),
            },
            10,
            4
          );
        });
      } else if (msg.type === 'ACTION_WATER') {
        soundFx.playWater();
        showLiveToast(`💧 ${msg.senderName} đã bơm đầy máng nước giúp bạn!`);
        setFarm((prev) =>
          prev
            ? {
                ...prev,
                lovePoints: prev.lovePoints + 1,
                waterLevel: 100,
                pigs: prev.pigs.map((p) => ({ ...p, thirst: Math.min(100, p.thirst + 35) })),
              }
            : prev
        );
      } else if (msg.type === 'ACTION_GIFT_COINS') {
        soundFx.playChest();
        showLiveToast(`🎁 ${msg.senderName} tặng bạn +${msg.amount} ₫: "${msg.note}"`);
        setFarm((prev) =>
          prev ? addXpAndCoins({ ...prev, lovePoints: prev.lovePoints + 3 }, msg.amount, 10) : prev
        );
      } else if (msg.type === 'ACTION_GIFT_PIG') {
        soundFx.playChest();
        const breed = BREED_MAP[msg.breedId] || PIG_BREEDS[0];
        showLiveToast(`🐷 ${msg.senderName} gửi tặng bạn bé ${breed.name}!`);
        setFarm((prev) => {
          if (!prev || prev.pigs.length >= prev.barnCapacity) return prev;
          const baby = createPigInstance(msg.breedId, { growth: 20, nickname: msg.nickname });
          const unlocked = prev.unlockedBreeds.includes(msg.breedId)
            ? prev.unlockedBreeds
            : [...prev.unlockedBreeds, msg.breedId];
          return {
            ...prev,
            lovePoints: prev.lovePoints + 5,
            pigs: [...prev.pigs, baby],
            unlockedBreeds: unlocked,
          };
        });
      } else if (msg.type === 'ACTION_STEAL_PIG') {
        soundFx.playClick();
        setFarm((prev) => {
          if (!prev || prev.pigs.length <= 1) return prev;
          const idx = prev.pigs.findIndex(
            (p) => p.id === msg.pigId || (p.breedId === msg.breedId && p.nickname === msg.nickname)
          );
          if (idx === -1) return prev;
          const hasDog = prev.guardDogActiveUntil > Date.now();
          const compensation = hasDog ? 150 : 0;
          showLiveToast(
            hasDog
              ? `🐶 Gâu! ${msg.senderName} vừa trộm bé ${msg.nickname} — Cún đền bù +150 ₫!`
              : `🥷 ${msg.senderName} vừa lẻn trộm mất bé ${msg.nickname} của bạn!`
          );
          const nextPigs = prev.pigs.filter((_, i) => i !== idx);
          return {
            ...prev,
            coins: prev.coins + compensation,
            pigs: nextPigs,
          };
        });
      }
    },
    [addXpAndCoins, applyIncomingPartnerSnapshot, pushFeedback, showLiveToast, triggerBounce]
  );

  // Initialize P2P & Room Cloud Sync sessions once
  useEffect(() => {
    const session = new ServerlessP2PSession({
      onStateChange: (nextState, err) => {
        setP2pState(nextState);
        setP2pError(err || null);
        if (nextState === 'connected') {
          soundFx.playChest();
          showLiveToast('🟢 Đã kết nối trực tiếp 2 iPhone thành công!');
        }
      },
      onMessage: (msg) => {
        handleP2PMessage(msg);
      },
    });
    p2pRef.current = session;

    const roomSession = new RoomCloudSession({
      onStatusChange: (st) => {
        setRoomStatus(st);
      },
      onPartnerSnapshot: (snap, devId) => {
        applyIncomingPartnerSnapshot(snap, devId);
      },
      onIncomingEvent: (ev) => {
        handleP2PMessage(ev.msg);
      },
    });
    roomRef.current = roomSession;

    return () => {
      session.close();
      roomSession.disconnect();
    };
  }, [applyIncomingPartnerSnapshot, handleP2PMessage, showLiveToast]);

  // Connect RoomCloudSession whenever farm.roomCode is ready
  useEffect(() => {
    if (!farm?.roomCode) return;
    roomRef.current?.connect(farm.roomCode);
  }, [farm?.roomCode]);

  // Periodically publish snapshot to P2P and Room Cloud
  useEffect(() => {
    if (!farm) return;
    const sendNow = () => {
      const snap = buildSnapshot(farm);
      if (p2pState === 'connected') {
        p2pRef.current?.send({
          type: 'FARM_SYNC',
          payload: snap,
        });
      }
      if (roomStatus === 'connected') {
        roomRef.current?.publishSnapshot(snap);
      }
    };
    sendNow();
    const timer = setInterval(sendNow, 4000);
    return () => clearInterval(timer);
  }, [p2pState, roomStatus, farm, buildSnapshot]);

  const handleCreateOffer = useCallback(async () => {
    if (!p2pRef.current) throw new Error('P2P chưa sẵn sàng');
    return p2pRef.current.createOfferToken();
  }, []);

  const handleAcceptOffer = useCallback(async (token: string) => {
    if (!p2pRef.current) throw new Error('P2P chưa sẵn sàng');
    return p2pRef.current.acceptOfferAndCreateAnswer(token);
  }, []);

  const handleAcceptAnswer = useCallback(async (token: string) => {
    if (!p2pRef.current) throw new Error('P2P chưa sẵn sàng');
    await p2pRef.current.acceptAnswer(token);
  }, []);

  const handleCoupleBreed = (myPigId: string, partnerPigId: string) => {
    if (!farm || farm.coins < 50 || farm.pigs.length >= farm.barnCapacity) return;
    const partner = farm.neighbors.find((n) => n.isPartner) || farm.neighbors[0];
    const myPig = farm.pigs.find((p) => p.id === myPigId);
    const partnerPig = partner?.pigs.find((p) => p.id === partnerPigId);
    if (!myPig || !partnerPig) return;

    const childBreedId = resolveBreedingOutcome(myPig.breedId, partnerPig.breedId, true);
    const childBreed = BREED_MAP[childBreedId] || PIG_BREEDS[0];
    const baby = createPigInstance(childBreedId, { growth: 10 });
    const isRareHatch =
      childBreed.rarity === 'rare' ||
      childBreed.rarity === 'epic' ||
      childBreed.rarity === 'legendary';

    soundFx.playChest();
    pushFeedback(
      50,
      42,
      isRareHatch
        ? `🌟 TRÚNG HIẾM! Lai đôi ra ${childBreed.name}!`
        : `Lai đôi thành công: ${childBreed.name}! (+5 💕)`,
      'gem'
    );
    if (isRareHatch) {
      showLiveToast(`🌟 Siêu may mắn! Hai bạn vừa lai ra giống hiếm: ${childBreed.name}!`);
    }

    setFarm((prev) => {
      if (!prev) return prev;
      const unlocked = prev.unlockedBreeds.includes(childBreedId)
        ? prev.unlockedBreeds
        : [...prev.unlockedBreeds, childBreedId];
      let updated: FarmState = {
        ...prev,
        coins: prev.coins - 50,
        lovePoints: prev.lovePoints + 5,
        pigs: [...prev.pigs, baby],
        unlockedBreeds: unlocked,
        totalBred: prev.totalBred + 1,
      };
      updated = addXpAndCoins(updated, 0, 50);
      updated = bumpQuest(updated, 'breed', 1);
      updated = {
        ...updated,
        achievements: updated.achievements.map((a) => {
          if (a.id.startsWith('ach_collector')) {
            return { ...a, progress: unlocked.length, unlocked: unlocked.length >= a.target };
          }
          if (a.id === 'ach_breeder') {
            return { ...a, progress: updated.totalBred, unlocked: updated.totalBred >= a.target };
          }
          return a;
        }),
      };
      return updated;
    });
  };

  const handleSendPacketComplete = (giftCoins: number, giftPigId: string | null, loveNote: string) => {
    setFarm((prev) => {
      if (!prev) return prev;
      const nextPigs =
        giftPigId && prev.pigs.length > 1
          ? prev.pigs.filter((p) => p.id !== giftPigId)
          : prev.pigs;
      return {
        ...prev,
        coins: Math.max(0, prev.coins - giftCoins),
        pigs: nextPigs,
        loveNote,
        lovePoints: prev.lovePoints + 3,
      };
    });
  };

  const handleReceivePacket = (packet: CouplePacket) => {
    soundFx.playChest();
    setFarm((prev) => {
      if (!prev) return prev;
      const { nextState } = upsertFriendFromPacket(prev, packet, { asPartner: true });
      return addXpAndCoins(nextState, 0, 30);
    });
    pushFeedback(50, 38, `Nhận quà từ ${packet.senderName}! 💕`, 'gem');
  };

  const handleAddFriendFromPacket = (packet: CouplePacket, visitNow: boolean) => {
    soundFx.playChest();
    let targetFriendId = 'partner_farm';
    setFarm((prev) => {
      if (!prev) return prev;
      const { nextState, friendNeighbor } = upsertFriendFromPacket(prev, packet);
      targetFriendId = friendNeighbor.id;
      return addXpAndCoins(nextState, 0, 15);
    });
    if (visitNow) {
      setTimeout(() => {
        setVisitingNeighborId(targetFriendId);
        setSelectedPigId(null);
      }, 0);
    }
    pushFeedback(50, 38, `Đã kết bạn với ${packet.senderName}! 💕`, 'love');
  };

  const handleRemoveFriend = (neighborId: string) => {
    setFarm((prev) =>
      prev
        ? { ...prev, neighbors: prev.neighbors.filter((n) => n.id !== neighborId) }
        : prev
    );
    if (visitingNeighborId === neighborId) {
      setVisitingNeighborId(null);
    }
  };

  const handleShareMyFriendCard = async () => {
    if (!farm) return;
    const token = encodeCouplePacket(farm, {
      loveNote: farm.loveNote || farm.farmGreeting,
      giftCoins: 0,
      giftPigBreedId: null,
    });
    const url = buildShareUrl('friend', token);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Chuồng Heo ${farm.playerName}`,
          text: `${farm.playerName} gửi link chuồng heo mới nhất — bấm vào để qua thăm nhé!`,
          url,
        });
        return;
      } catch {
        // Fallback copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      showLiveToast('Đã copy link chuồng mới nhất của bạn để gửi cho bạn bè!');
    } catch {
      setActiveModal('friend');
    }
  };

  if (!farm) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#5aa340] text-amber-50 font-display text-2xl font-bold">
        Đang mở Chuồng Heo Vui Vẻ...
      </div>
    );
  }

  const isPortraitMobile = viewport.w < viewport.h && viewport.w < 768;
  const isShortLandscape = viewport.h <= 500;
  const stealsRemaining = Math.max(0, MAX_STEALS_PER_DAY - (farm.stealsToday || 0));
  const partnerFarm = farm.neighbors.find((n) => n.isPartner) || farm.neighbors[0] || null;
  const isCoupleLive = p2pState === 'connected' || (roomStatus === 'connected' && Boolean(farm.partnerDeviceId));

  const feedQuest = farm.quests[0];
  const raiseQuest = farm.quests[1];
  const hasUnclaimedQuest = farm.quests.some((q) => q.progress >= q.target && !q.claimed);
  const hasUnclaimedAchievement = farm.achievements.some((a) => a.unlocked && !a.claimed);
  const canClaimDailyGift =
    !farm.dailyGiftClaimedAt ||
    new Date(farm.dailyGiftClaimedAt).toDateString() !== new Date().toDateString();
  const isGuardDogActive = farm.guardDogActiveUntil > Date.now();
  const xpRequired = farm.level * 100;
  const xpPercent = Math.min(100, Math.round((farm.xp / xpRequired) * 100));

  const toolHints: Record<ToolMode, string> = {
    hand: '',
    feed: 'Đang cầm Cám — Nhấn vào chú heo để cho ăn',
    glove: 'Đang đeo Găng Tay — Nhấn vào heo để vuốt ve',
    medicine: 'Đang cầm Thuốc/Vitamin — Nhấn vào heo để chữa bệnh hoặc tăng trưởng',
    shovel: 'Đang cầm Xẻng — Nhấn vào vết bẩn trên sân để dọn sạch',
  };

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-[#2c1b0e]">
      {/* MAIN FARM YARD VIEWPORT */}
      <div className="relative z-10 flex-1 w-full overflow-hidden">
        {/* Lush Grass Field Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 48%, #77c64b 0%, #5fb33a 58%, #47952a 100%)',
          }}
        />

        {/* Subtle decorative bushes & grass patches */}
        <svg
          viewBox="0 0 1200 700"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <defs>
            <linearGradient id="yardSkyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#dcfce7" />
            </linearGradient>
            <linearGradient id="yardSoilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e89e4e" />
              <stop offset="55%" stopColor="#df9142" />
              <stop offset="100%" stopColor="#d18034" />
            </linearGradient>
            <clipPath id="yardSoilClip">
              <path d="M 265 195 Q 600 128 935 195 Q 1002 375 930 552 Q 600 622 265 552 Q 198 375 265 195 Z" />
            </clipPath>
          </defs>

          {/* Soft Distant Sky & Rolling Green Meadow Horizon matching reference */}
          <rect x="0" y="0" width="1200" height="72" fill="url(#yardSkyGrad)" opacity="0.65" />
          <path d="M 0 42 Q 260 12 520 48 T 940 36 L 1200 45 L 1200 125 L 0 125 Z" fill="#a3e67c" opacity="0.72" />
          <path d="M 0 65 Q 340 38 680 68 T 1200 58 L 1200 140 L 0 140 Z" fill="#84d453" opacity="0.78" />

          {/* Grass rim lip shadow around dirt yard */}
          <path
            d="M 265 195 Q 600 128 935 195 Q 1002 375 930 552 Q 600 622 265 552 Q 198 375 265 195 Z"
            fill="url(#yardSoilGrad)"
            stroke="#4d8f24"
            strokeWidth="12"
          />

          {/* Layered terracotta terrain bands & organic earth puddles matching reference */}
          <g clipPath="url(#yardSoilClip)">
            <path d="M 180 305 Q 440 265 690 315 T 1040 295 L 1040 650 L 180 650 Z" fill="#e9a458" opacity="0.58" />
            <path d="M 180 455 Q 460 415 760 465 T 1040 445 L 1040 650 L 180 650 Z" fill="#d9893d" opacity="0.52" />

            {/* Darker warm soil patches */}
            <ellipse cx="360" cy="285" rx="60" ry="23" fill="#ca762c" opacity="0.55" />
            <ellipse cx="770" cy="275" rx="82" ry="26" fill="#ca762c" opacity="0.5" />
            <ellipse cx="835" cy="405" rx="74" ry="28" fill="#c9752b" opacity="0.5" />
            <ellipse cx="535" cy="505" rx="68" ry="22" fill="#c67229" opacity="0.5" />
            <ellipse cx="315" cy="445" rx="52" ry="20" fill="#c9752b" opacity="0.45" />
            <circle cx="445" cy="350" r="15" fill="#c8752a" opacity="0.45" />
            <circle cx="665" cy="370" r="18" fill="#c8752a" opacity="0.42" />
            <circle cx="705" cy="485" r="13" fill="#c8752a" opacity="0.45" />
          </g>

          {/* Crisp grassy inner rim accent */}
          <path
            d="M 265 195 Q 600 128 935 195 Q 1002 375 930 552 Q 600 622 265 552 Q 198 375 265 195 Z"
            fill="none"
            stroke="#84d44d"
            strokeWidth="4.5"
            opacity="0.72"
          />

          {/* Top-Right Rustic Oak Tree Trunk & Leafy Canopy matching reference */}
          <g>
            <path
              d="M 1110 -10 Q 1125 65 1190 135 L 1205 90 Q 1165 40 1158 -10 Z"
              fill="#925b31"
              stroke="#4a280d"
              strokeWidth="2.8"
            />
            <path
              d="M 1128 32 Q 1075 18 1035 34 Q 1075 40 1124 52 Z"
              fill="#7c4b26"
              stroke="#4a280d"
              strokeWidth="2.2"
            />
            <g fill="#5cb338" stroke="#2d6a18" strokeWidth="2.4" opacity="0.96">
              <circle cx="1065" cy="18" r="46" />
              <circle cx="1125" cy="22" r="54" />
              <circle cx="1185" cy="34" r="52" />
              <circle cx="1015" cy="10" r="34" />
            </g>
            <g fill="#7fd84f" opacity="0.65">
              <circle cx="1055" cy="10" r="22" />
              <circle cx="1115" cy="12" r="28" />
              <circle cx="1172" cy="22" r="24" />
            </g>
          </g>

          {/* Pastel Flower Beds & Grass Blade Tufts */}
          <g opacity="0.95">
            {/* Top-left flower cluster */}
            <ellipse cx="265" cy="142" rx="34" ry="12" fill="#509f2d" opacity="0.65" />
            <circle cx="249" cy="138" r="5.5" fill="#f9a8d4" stroke="#db2777" strokeWidth="1" />
            <circle cx="265" cy="132" r="6" fill="#93c5fd" stroke="#2563eb" strokeWidth="1" />
            <circle cx="280" cy="140" r="5.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />

            {/* Top-center-right flower cluster */}
            <ellipse cx="755" cy="132" rx="32" ry="11" fill="#509f2d" opacity="0.6" />
            <circle cx="742" cy="128" r="5" fill="#f9a8d4" stroke="#db2777" strokeWidth="1" />
            <circle cx="758" cy="124" r="5.5" fill="#93c5fd" stroke="#2563eb" strokeWidth="1" />
            <circle cx="772" cy="131" r="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />

            {/* Bottom flower clusters */}
            <ellipse cx="325" cy="606" rx="36" ry="12" fill="#509f2d" opacity="0.6" />
            <circle cx="310" cy="602" r="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="326" cy="610" r="5.5" fill="#f9a8d4" stroke="#db2777" strokeWidth="1" />
            <circle cx="342" cy="602" r="5.5" fill="#93c5fd" stroke="#2563eb" strokeWidth="1" />

            <ellipse cx="685" cy="624" rx="38" ry="12" fill="#509f2d" opacity="0.6" />
            <circle cx="670" cy="624" r="6" fill="#fbcfe8" stroke="#db2777" strokeWidth="1" />
            <circle cx="686" cy="616" r="5.5" fill="#93c5fd" stroke="#2563eb" strokeWidth="1" />
            <circle cx="702" cy="624" r="5.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />

            <path d="M 555 636 L 560 620 L 566 636 L 573 618 L 578 636" fill="none" stroke="#4d8f24" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 805 622 L 810 606 L 816 622 L 822 608 L 827 622" fill="none" stroke="#4d8f24" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Bottom-left & Bottom-right Wooden Picket Fences */}
          <g fill="#c98e54" stroke="#4a280d" strokeWidth="2.8" strokeLinejoin="round">
            <polygon points="15,575 170,655 170,670 15,590" fill="#a66c37" />
            <rect x="20" y="540" width="17" height="90" rx="7" />
            <rect x="52" y="560" width="17" height="90" rx="7" />
            <rect x="84" y="580" width="17" height="90" rx="7" />
            <rect x="116" y="600" width="17" height="90" rx="7" />
            <rect x="148" y="618" width="17" height="90" rx="7" />

            <polygon points="1005,645 1152,575 1152,590 1005,660" fill="#a66c37" />
            <rect x="1018" y="610" width="17" height="86" rx="7" />
            <rect x="1052" y="592" width="17" height="86" rx="7" />
            <rect x="1086" y="574" width="17" height="86" rx="7" />
            <rect x="1120" y="556" width="17" height="86" rx="7" />
          </g>
        </svg>

        {/* TOP-LEFT: Player Avatar Frame & Resource Strip */}
        <div
          style={{ left: 'max(0.5rem, env(safe-area-inset-left, 0px))' }}
          className="absolute top-1.5 sm:top-2 z-30 flex items-start gap-1.5 sm:gap-2 safe-top"
        >
          <button
            type="button"
            onClick={() => setActiveModal('settings')}
            title="Hồ sơ chủ trại"
            className="w-9 h-10 sm:w-14 sm:h-16 [@media(max-height:500px)]:w-9 [@media(max-height:500px)]:h-10 rounded-lg bg-[#f6e3ba] border-2 sm:border-3 border-[#5c3618] shadow-lg flex flex-col items-center justify-center p-0.5 sm:p-1 cursor-pointer hover:brightness-105 shrink-0"
          >
            <svg viewBox="0 0 40 40" className="w-6 h-6 sm:w-9 sm:h-9 [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-6">
              <circle cx="20" cy="14" r="7" fill="#fde68a" stroke="#451a03" strokeWidth="1.8" />
              <path d="M 13 13 Q 20 5 27 13" fill="#451a03" />
              <circle cx="17.5" cy="14" r="1.2" fill="#1c1917" />
              <circle cx="22.5" cy="14" r="1.2" fill="#1c1917" />
              <path d="M 10 38 Q 10 23 20 23 Q 30 23 30 38 Z" fill="#0ea5e9" stroke="#451a03" strokeWidth="1.8" />
            </svg>
            <span className="text-[8px] sm:text-[9px] font-extrabold text-[#4a280d] leading-none font-mono-nums">
              Lv.{farm.level}
            </span>
          </button>

          <div className="flex flex-col gap-0.5 sm:gap-1">
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-0.5 sm:py-1 [@media(max-height:500px)]:py-0.5 rounded-xl bg-[#4a280d]/85 border-2 border-[#c88d4b] shadow-md text-amber-50">
              <span className="flex items-center gap-0.5 sm:gap-1 text-[11px] sm:text-sm [@media(max-height:500px)]:text-[11px] font-mono-nums font-extrabold text-amber-300">
                <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                {farm.coins.toLocaleString('vi-VN')}
              </span>
              <span className="text-amber-500/70">|</span>
              <span className="flex items-center gap-0.5 sm:gap-1 text-[11px] sm:text-sm [@media(max-height:500px)]:text-[11px] font-mono-nums font-extrabold text-sky-300">
                <Gem className="w-3 h-3 sm:w-4 sm:h-4 text-sky-400" />
                {farm.gems}
              </span>
              <button
                type="button"
                onClick={() => {
                  const next = !farm.soundEnabled;
                  soundFx.enabled = next;
                  setFarm((prev) => (prev ? { ...prev, soundEnabled: next } : prev));
                }}
                aria-label="Bật tắt âm thanh"
                className="ml-0.5 text-amber-200 hover:text-white cursor-pointer"
              >
                {farm.soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            </div>

            {/* XP progress bar */}
            <div className="w-28 sm:w-48 [@media(max-height:500px)]:w-28 h-1.5 sm:h-2.5 rounded-full bg-[#3c1e08]/80 border border-[#c88d4b] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-lime-300 transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* TOP-CENTER: Blue Ribbon Greeting Banner & Vietnam Clock */}
        <div className="absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 [@media(max-height:500px)]:gap-0.5 safe-top max-w-[46vw] sm:max-w-[54vw]">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="relative px-2.5 sm:px-6 [@media(max-height:500px)]:px-3 py-0.5 sm:py-1 [@media(max-height:500px)]:py-0.5 rounded-xl bg-gradient-to-b from-[#60a5fa] to-[#3b82f6] border-2 border-[#1e40af] shadow-lg flex items-center gap-1.5">
              {isCoupleLive && currentNeighbor?.isPartner && (
                <span className="w-2 h-2 rounded-full bg-lime-300 animate-pulse shrink-0" title="Đã kết nối Live" />
              )}
              <span className="font-display font-extrabold text-[11px] sm:text-base [@media(max-height:500px)]:text-xs text-white drop-shadow whitespace-nowrap truncate max-w-[140px] sm:max-w-[260px]">
                {currentNeighbor
                  ? `Thăm: ${currentNeighbor.farmerName}`
                  : farm.farmGreeting}
              </span>
            </div>

            {currentNeighbor && (
              <button
                type="button"
                onClick={() => {
                  setVisitingNeighborId(null);
                  setSelectedPigId(null);
                }}
                className="px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-900 text-white text-[10px] sm:text-sm font-bold flex items-center gap-1 shadow-lg cursor-pointer whitespace-nowrap"
              >
                <Home className="w-3 h-3 sm:w-4 sm:h-4" /> Về Trại
              </button>
            )}
          </div>

          {/* Vietnam Clock & Daily Reset Status Badge + Neighbor Action Bar */}
          {currentNeighbor ? (
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <span
                title="Nhấn vào một chú heo bất kỳ của đối phương để trộm (tối đa 2 lần/ngày)"
                className="px-2 py-0.5 rounded-full bg-violet-800/95 border border-violet-300 text-amber-100 text-[9px] sm:text-xs font-extrabold whitespace-nowrap shadow"
              >
                🥷 Trộm: {stealsRemaining}/2 hôm nay
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFx.playChest();
                  sendPartnerAction({
                    type: 'PING_HEART',
                    senderName: farm.playerName,
                    text: 'Vừa ghé thăm chuồng bạn nè 💕',
                  });
                  setFarm((prev) =>
                    prev
                      ? {
                          ...prev,
                          lovePoints: prev.lovePoints + 1,
                          neighbors: prev.neighbors.map((n) =>
                            n.id === currentNeighbor.id ? { ...n, hearts: n.hearts + 1 } : n
                          ),
                        }
                      : prev
                  );
                  pushFeedback(50, 26, `💕 Thả tim cho ${currentNeighbor.farmerName}!`, 'love');
                }}
                className="px-2 py-0.5 rounded-full bg-pink-600/95 hover:bg-pink-500 border border-pink-200 text-white text-[9px] sm:text-xs font-bold flex items-center gap-1 shadow cursor-pointer whitespace-nowrap"
              >
                <Heart className="w-3 h-3 fill-white" /> {currentNeighbor.hearts}
              </button>
              {(currentNeighbor.isRealFriend || currentNeighbor.isPartner) && !isShortLandscape && (
                <button
                  type="button"
                  onClick={handleShareMyFriendCard}
                  className="px-2.5 py-0.5 rounded-lg bg-[#4a280d]/90 hover:bg-[#5c3618] border border-amber-300 text-amber-100 text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
                >
                  <Share2 className="w-3 h-3" /> Gửi Chuồng Mình
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setActiveModal('quests')}
              title="Giờ Việt Nam (UTC+7) · Nhấn để xem Nhiệm Vụ Hằng Ngày & Đếm Ngược Reset 0:00"
              className="px-2 py-0.5 rounded-full bg-[#4a280d]/90 hover:bg-[#5c3618] border border-[#c88d4b] text-amber-100 text-[9px] sm:text-xs font-mono font-bold shadow-md flex items-center gap-1 cursor-pointer transition hover:scale-102 whitespace-nowrap"
            >
              <span>🇻🇳</span>
              <span className="text-amber-200">{vnClock.timeStr}</span>
              <span className="text-amber-500/70">·</span>
              <span className="hidden md:inline text-amber-300/90">{vnClock.dateStr}</span>
              <span className="md:hidden text-amber-300/90">{vnClock.shortDate}</span>
            </button>
          )}
        </div>

        {/* TOP-RIGHT: 2-Device Couple Mode Button */}
        <div
          style={{ right: 'max(0.5rem, env(safe-area-inset-right, 0px))' }}
          className="absolute top-1.5 sm:top-2 z-30 flex items-center gap-1.5 safe-top"
        >
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveModal('couple');
            }}
            className={`px-2 sm:px-3.5 py-1 sm:py-1.5 [@media(max-height:500px)]:py-1 rounded-xl border-2 text-white text-[10px] sm:text-xs font-extrabold flex items-center gap-1 sm:gap-1.5 shadow-lg cursor-pointer whitespace-nowrap ${
              isCoupleLive
                ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 border-emerald-950'
                : 'bg-gradient-to-b from-pink-500 to-rose-600 border-rose-950 hover:brightness-110'
            }`}
          >
            {isCoupleLive ? (
              <span className="w-2 h-2 rounded-full bg-lime-200 animate-pulse" />
            ) : (
              <Heart className="w-3.5 h-3.5 fill-pink-100" />
            )}
            <span>{isCoupleLive ? '2 Máy Đang Nối' : 'Chơi 2 Máy'}</span>
            <span className="font-mono-nums text-pink-100">· {farm.lovePoints}</span>
          </button>
        </div>

        {/* LIVE CROSS-DEVICE TOAST */}
        {liveBannerMsg && (
          <div className="absolute top-11 sm:top-14 left-1/2 -translate-x-1/2 z-40 px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl bg-pink-600/95 border-2 border-white text-white text-[11px] sm:text-sm font-bold shadow-xl whitespace-nowrap max-w-[90vw] truncate">
            {liveBannerMsg}
          </div>
        )}

        {/* TOP-CENTER: Active Tool Banner */}
        {activeTool !== 'hand' && (
          <div className="absolute top-11 sm:top-14 left-1/2 -translate-x-1/2 z-30 px-3 py-0.5 sm:py-1 rounded-xl bg-[#4a280d]/90 border-2 border-amber-400 text-amber-100 text-[10px] sm:text-xs font-bold flex items-center gap-2 shadow-lg whitespace-nowrap">
            <span>{toolHints[activeTool]}</span>
            <button
              type="button"
              onClick={() => setActiveTool('hand')}
              className="px-2 py-0.5 rounded bg-amber-400 text-amber-950 font-extrabold cursor-pointer"
            >
              Xong
            </button>
          </div>
        )}

        {/* LEFT EDGE: 3 Circular Quest & Wheel Badges matching screenshot */}
        <div
          style={{ left: 'max(0.5rem, env(safe-area-inset-left, 0px))' }}
          className="absolute top-[22%] sm:top-[28%] z-30 flex flex-col gap-1.5 sm:gap-3 [@media(max-height:500px)]:scale-80 origin-left"
        >
          {/* 1. Feed / Red Parcel Quest Badge (0/15) */}
          <button
            type="button"
            onClick={() => setActiveModal('quests')}
            title={feedQuest?.title}
            className="relative w-12 h-12 rounded-full bg-gradient-to-b from-[#fef3c7] to-[#e7c58c] border-3 border-[#6d411c] shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition"
          >
            <YardItemSprite type="red_cube" size={28} />
            <span className="absolute -bottom-1.5 px-1.5 py-0.5 rounded bg-[#4a280d] text-amber-100 text-[10px] font-mono-nums font-extrabold leading-none border border-amber-300/60">
              {Math.min(feedQuest?.progress || 0, feedQuest?.target || 15)}/{feedQuest?.target || 15}
            </span>
          </button>

          {/* 2. Scroll Quest Badge (0/3) */}
          <button
            type="button"
            onClick={() => setActiveModal('quests')}
            title={raiseQuest?.title}
            className="relative w-12 h-12 rounded-full bg-gradient-to-b from-[#fef3c7] to-[#e7c58c] border-3 border-[#6d411c] shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition"
          >
            <svg viewBox="0 0 36 36" className="w-7 h-7">
              <rect x="8" y="6" width="20" height="24" rx="3" fill="#fffbeb" stroke="#78350f" strokeWidth="2" />
              <line x1="12" y1="13" x2="24" y2="13" stroke="#b45309" strokeWidth="2" />
              <line x1="12" y1="18" x2="24" y2="18" stroke="#b45309" strokeWidth="2" />
              <line x1="12" y1="23" x2="20" y2="23" stroke="#b45309" strokeWidth="2" />
            </svg>
            <span className="absolute -bottom-1.5 px-1.5 py-0.5 rounded bg-[#4a280d] text-amber-100 text-[10px] font-mono-nums font-extrabold leading-none border border-amber-300/60">
              {Math.min(raiseQuest?.progress || 0, raiseQuest?.target || 3)}/{raiseQuest?.target || 3}
            </span>
          </button>

          {/* 3. Lucky Roulette Wheel Badge */}
          <button
            type="button"
            onClick={() => setActiveModal('wheel')}
            title="Vòng Quay May Mắn"
            className="relative w-12 h-12 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border-3 border-[#6d411c] shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition"
          >
            <svg viewBox="0 0 36 36" className="w-8 h-8">
              <circle cx="18" cy="18" r="14" fill="#ef4444" stroke="#450a0a" strokeWidth="2" />
              <path d="M 18 18 L 18 4 A 14 14 0 0 1 32 18 Z" fill="#facc15" />
              <path d="M 18 18 L 18 32 A 14 14 0 0 1 4 18 Z" fill="#3b82f6" />
              <circle cx="18" cy="18" r="4" fill="#ffffff" stroke="#450a0a" strokeWidth="1.5" />
            </svg>
            <span className="absolute -bottom-1.5 px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-extrabold leading-none border border-red-950">
              Quay
            </span>
          </button>
        </div>

        {/* FARM BUILDINGS */}
        <FarmBuildings
          waterLevel={displayedWater}
          isGuardDogActive={isGuardDogActive}
          isNeighborMode={Boolean(currentNeighbor)}
          onClickOven={() => {
            if (!currentNeighbor) handleFeedAll();
          }}
          onClickWell={handleRefillWater}
          onClickDoghouse={() => {
            if (!currentNeighbor) {
              if (isGuardDogActive) {
                soundFx.playClick();
                pushFeedback(14, 70, 'Gâu! Cún đang bảo vệ chuồng rất tốt!', 'love');
              } else {
                setActiveModal('shop');
              }
            }
          }}
          onClickBarn={() => {
            if (!currentNeighbor) setActiveModal('breeding');
          }}
          onClickTrough={handleRefillWater}
          onClickScratchPost={handleScratchPost}
        />

        {/* YARD DROPS (Red Star Cubes, Treasure Chests, Poop) */}
        {displayedDrops.map((drop) => (
          <button
            key={drop.id}
            type="button"
            onClick={() => handleCollectDrop(drop)}
            style={{
              left: `${drop.x}%`,
              top: `${drop.y}%`,
              zIndex: Math.round(drop.y),
            }}
            title={
              drop.type === 'chest'
                ? 'Mở Rương Báu'
                : drop.type === 'poop'
                ? 'Dọn sạch để nhận xu'
                : 'Nhặt Hộp Quà Đỏ'
            }
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-115 active:scale-90 focus:outline-none ${
              activeTool === 'shovel' && drop.type === 'poop' ? 'ring-2 ring-amber-300 rounded-full' : ''
            }`}
          >
            <YardItemSprite type={drop.type} size={drop.type === 'chest' ? 44 : 34} />
          </button>
        ))}

        {/* ROAMING PIGS */}
        {displayedPigs.map((pig) => (
          <button
            key={pig.id}
            type="button"
            onClick={() => handleClickPig(pig)}
            style={{
              left: `${pig.x}%`,
              top: `${pig.y}%`,
              zIndex: Math.round(pig.y) + 5,
              transition: 'left 1.05s linear, top 1.05s linear',
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:brightness-105 focus:outline-none"
          >
            <PigSprite
              breedId={pig.breedId}
              stage={pig.stage}
              facing={pig.facing}
              isMoving={pig.isMoving}
              isSick={pig.isSick}
              isBouncing={Boolean(bouncingPigs[pig.id])}
              moodBubble={pig.moodBubble}
              size={isShortLandscape ? 58 : 76}
              selected={selectedPigId === pig.id}
            />
          </button>
        ))}

        {/* FLOATING FEEDBACK TEXT */}
        {feedbacks.map((fb) => (
          <div
            key={fb.id}
            style={{ left: `${fb.x}%`, top: `${fb.y}%` }}
            className={`animate-float-up pointer-events-none absolute z-50 px-2.5 py-0.5 rounded-full font-display font-extrabold text-xs sm:text-sm whitespace-nowrap shadow-md border ${
              fb.tone === 'coin'
                ? 'bg-amber-300 text-amber-950 border-amber-700'
                : fb.tone === 'gem'
                ? 'bg-sky-400 text-sky-950 border-sky-800'
                : fb.tone === 'warn'
                ? 'bg-rose-500 text-white border-rose-900'
                : fb.tone === 'heal'
                ? 'bg-emerald-400 text-emerald-950 border-emerald-800'
                : 'bg-pink-300 text-pink-950 border-pink-700'
            }`}
          >
            {fb.text}
          </div>
        ))}

        {/* PIG INSPECTOR CARD */}
        {selectedPig && (
          <PigInspector
            pig={selectedPig}
            isNeighborMode={Boolean(currentNeighbor)}
            neighborPigCount={currentNeighbor?.pigs.length ?? 0}
            stealsRemaining={stealsRemaining}
            feedCount={farm.inventory['feed_standard'] || 0}
            deluxeFeedCount={farm.inventory['feed_deluxe'] || 0}
            medCount={farm.inventory['medicine_pill'] || 0}
            vitaminCount={farm.inventory['vitamin_boost'] || 0}
            onClose={() => setSelectedPigId(null)}
            onFeed={handleFeedPig}
            onPet={handlePetPig}
            onHeal={handleHealPig}
            onVitamin={handleVitaminPig}
            onSell={handleSellPig}
            onStorePig={handleStorePig}
            onStealPig={handleStealPig}
          />
        )}
      </div>

      {/* BOTTOM WOODEN HUD CONSOLE */}
      <BottomHud
        pigCount={farm.pigs.length}
        barnCapacity={farm.barnCapacity}
        storedPigCount={farm.storedPigs?.length || 0}
        unlockedBreeds={farm.unlockedBreeds}
        activeTool={activeTool}
        feedCount={farm.inventory['feed_standard'] || 0}
        medCount={farm.inventory['medicine_pill'] || 0}
        neighbors={farm.neighbors}
        visitingNeighborId={visitingNeighborId}
        p2pConnected={isCoupleLive}
        hasUnclaimedQuest={hasUnclaimedQuest}
        hasUnclaimedAchievement={hasUnclaimedAchievement}
        canClaimDailyGift={canClaimDailyGift}
        onSelectTool={(t) => {
          soundFx.playClick();
          setActiveTool(t);
        }}
        onOpenShop={() => {
          soundFx.playClick();
          setActiveModal('shop');
        }}
        onOpenInventory={() => {
          soundFx.playClick();
          setActiveModal('inventory');
        }}
        onOpenDex={() => {
          soundFx.playClick();
          setActiveModal('dex');
        }}
        onOpenAchievements={() => {
          soundFx.playClick();
          setActiveModal('achievements');
        }}
        onOpenQuests={() => {
          soundFx.playClick();
          setActiveModal('quests');
        }}
        onOpenBreeding={() => {
          soundFx.playClick();
          setActiveModal('breeding');
        }}
        onOpenSettings={() => {
          soundFx.playClick();
          setActiveModal('settings');
        }}
        onClaimDailyGift={handleClaimDailyGift}
        onVisitNeighbor={(id) => {
          soundFx.playClick();
          setVisitingNeighborId(id);
          setSelectedPigId(null);
        }}
        onInviteNeighbor={() => {
          soundFx.playClick();
          setActiveModal('friend');
        }}
      />

      {/* MODALS */}
      {activeModal === 'shop' && (
        <ShopModal
          state={farm}
          onClose={() => setActiveModal(null)}
          onBuyPig={handleBuyPig}
          onBuySupply={handleBuySupply}
          onExpandBarn={handleExpandBarn}
          onHireDog={handleHireDog}
        />
      )}

      {activeModal === 'inventory' && (
        <InventoryModal
          state={farm}
          onClose={() => setActiveModal(null)}
          onFeedAll={handleFeedAll}
          onHealAll={handleHealAll}
          onGoShop={() => setActiveModal('shop')}
          onStorePig={handleStorePig}
          onReleasePig={handleReleasePig}
          onSellStoredPig={handleSellStoredPig}
        />
      )}

      {activeModal === 'dex' && (
        <DexModal state={farm} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'breeding' && (
        <BreedingModal
          state={farm}
          onClose={() => setActiveModal(null)}
          onBreed={handleBreed}
          onClaimIncubator={handleClaimIncubator}
          onSellPig={handleSellPig}
          onStorePig={handleStorePig}
          onRenamePig={(pigId, newName) => {
            setFarm((prev) =>
              prev
                ? {
                    ...prev,
                    pigs: prev.pigs.map((p) =>
                      p.id === pigId ? { ...p, nickname: newName } : p
                    ),
                  }
                : prev
            );
          }}
        />
      )}

      {activeModal === 'quests' && (
        <QuestsModal
          state={farm}
          onClose={() => setActiveModal(null)}
          onClaimQuest={handleClaimQuest}
        />
      )}

      {activeModal === 'achievements' && (
        <AchievementsModal
          state={farm}
          onClose={() => setActiveModal(null)}
          onClaimAchievement={handleClaimAchievement}
        />
      )}

      {activeModal === 'wheel' && (
        <WheelModal
          state={farm}
          onClose={() => setActiveModal(null)}
          onSpin={handleSpinWheel}
        />
      )}

      {activeModal === 'couple' && (
        <CoupleModal
          state={farm}
          partnerFarm={partnerFarm}
          p2pState={p2pState}
          p2pError={p2pError}
          roomStatus={roomStatus}
          initialOfferToken={initialOfferToken}
          initialAnswerToken={initialAnswerToken}
          onClose={() => setActiveModal(null)}
          onJoinRoom={(code) => {
            const clean = normalizeRoomCode(code);
            if (!clean) return;
            setFarm((prev) => (prev ? { ...prev, roomCode: clean, partnerDeviceId: undefined } : prev));
          }}
          onRegenerateRoom={() => {
            const nextCode = generateRoomCode();
            setFarm((prev) => (prev ? { ...prev, roomCode: nextCode, partnerDeviceId: undefined } : prev));
          }}
          onCreateOffer={handleCreateOffer}
          onAcceptOffer={handleAcceptOffer}
          onAcceptAnswer={handleAcceptAnswer}
          onDisconnectP2P={() => {
            p2pRef.current?.close();
            setP2pState('idle');
          }}
          onSendLiveHeart={(text) => {
            sendPartnerAction({
              type: 'PING_HEART',
              senderName: farm.playerName,
              text,
            });
            setFarm((prev) => (prev ? { ...prev, lovePoints: prev.lovePoints + 1 } : prev));
          }}
          onSendLiveCoins={(amount, note) => {
            if (farm.coins < amount) return;
            sendPartnerAction({
              type: 'ACTION_GIFT_COINS',
              senderName: farm.playerName,
              amount,
              note,
            });
            setFarm((prev) =>
              prev ? { ...prev, coins: prev.coins - amount, lovePoints: prev.lovePoints + 3 } : prev
            );
          }}
          onSendLivePig={(pigId, note) => {
            const target = farm.pigs.find((p) => p.id === pigId);
            if (!target || farm.pigs.length <= 1) return;
            sendPartnerAction({
              type: 'ACTION_GIFT_PIG',
              senderName: farm.playerName,
              breedId: target.breedId,
              nickname: target.nickname,
              note,
            });
            setFarm((prev) =>
              prev
                ? {
                    ...prev,
                    pigs: prev.pigs.filter((p) => p.id !== pigId),
                    lovePoints: prev.lovePoints + 5,
                  }
                : prev
            );
          }}
          onVisitPartner={() => {
            if (partnerFarm) {
              setVisitingNeighborId(partnerFarm.id);
              setSelectedPigId(null);
            }
          }}
          onCoupleBreed={handleCoupleBreed}
          onSendPacketComplete={handleSendPacketComplete}
          onReceivePacket={handleReceivePacket}
        />
      )}

      {activeModal === 'friend' && (
        <FriendModal
          state={farm}
          p2pConnected={isCoupleLive}
          onClose={() => setActiveModal(null)}
          onAddFriend={handleAddFriendFromPacket}
          onVisitNeighbor={(id) => {
            soundFx.playClick();
            setVisitingNeighborId(id);
            setSelectedPigId(null);
          }}
          onRemoveFriend={handleRemoveFriend}
          onAddNpcNeighbor={handleInviteNeighbor}
          onOpenLiveConnect={() => setActiveModal('couple')}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          state={farm}
          onClose={() => setActiveModal(null)}
          onToggleSound={() => {
            const next = !farm.soundEnabled;
            soundFx.enabled = next;
            setFarm((prev) => (prev ? { ...prev, soundEnabled: next } : prev));
          }}
          onUpdateProfile={(playerName, farmGreeting) => {
            setFarm((prev) => (prev ? { ...prev, playerName, farmGreeting } : prev));
          }}
          onExportSave={() => farmRepository.exportJson(farm)}
          onImportSave={(raw) => {
            try {
              const imported = farmRepository.importJson(raw);
              soundFx.enabled = imported.soundEnabled;
              setFarm(imported);
              farmRepository.save(imported);
              return true;
            } catch {
              return false;
            }
          }}
          onResetFarm={async () => {
            const fresh = await farmRepository.reset();
            setVisitingNeighborId(null);
            setSelectedPigId(null);
            setFarm(fresh);
          }}
        />
      )}

      {/* iPhone Portrait-to-Landscape Prompt */}
      {isPortraitMobile && !dismissRotatePrompt && (
        <div className="fixed inset-0 z-[100] bg-[#2c1b0e]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-amber-50">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-4 animate-bounce">
            <RotateCw className="w-9 h-9 text-amber-300" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-amber-200 mb-2">
            Hãy Xoay Ngang iPhone!
          </h2>
          <p className="text-sm text-amber-100/90 max-w-xs leading-relaxed mb-5">
            Chuồng Heo Vui Vẻ được thiết kế chuẩn màn hình ngang để bạn và người yêu chơi thoải mái nhất.
          </p>
          <button
            type="button"
            onClick={() => setDismissRotatePrompt(true)}
            className="px-4 py-2 rounded-xl bg-amber-600/40 border border-amber-300/40 text-amber-100 text-xs font-bold cursor-pointer"
          >
            Tạm thời tiếp tục màn hình dọc
          </button>
        </div>
      )}
    </div>
  );
}
