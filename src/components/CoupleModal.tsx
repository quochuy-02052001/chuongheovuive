import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Check,
  Coins,
  Copy,
  Gift,
  Heart,
  Link2,
  QrCode,
  Radio,
  Send,
  Share2,
  Sparkles,
  Unplug,
  X,
} from 'lucide-react';
import { BREED_MAP, PIG_BREEDS } from '../data/pigBreeds';
import { decodeCouplePacket, encodeCouplePacket } from '../services/farmRepository';
import {
  P2PConnectionState,
  buildShareUrl,
  extractGiftFromInput,
  extractSignalFromInput,
} from '../services/p2pSession';
import { RoomSyncStatus, buildRoomInviteUrl } from '../services/roomSync';
import { CouplePacket, FarmState, NeighborFarm } from '../types/game';
import { PigSprite } from './PigSprite';

interface CoupleModalProps {
  state: FarmState;
  partnerFarm: NeighborFarm | null;
  p2pState: P2PConnectionState;
  p2pError: string | null;
  roomStatus: RoomSyncStatus;
  initialOfferToken: string;
  initialAnswerToken: string;
  onClose: () => void;
  onJoinRoom: (roomCode: string) => void;
  onRegenerateRoom: () => void;
  onCreateOffer: () => Promise<string>;
  onAcceptOffer: (offerToken: string) => Promise<string>;
  onAcceptAnswer: (answerToken: string) => Promise<void>;
  onDisconnectP2P: () => void;
  onSendLiveHeart: (text: string) => void;
  onSendLiveCoins: (amount: number, note: string) => void;
  onSendLivePig: (pigId: string, note: string) => void;
  onVisitPartner: () => void;
  onCoupleBreed: (myPigId: string, partnerPigId: string) => void;
  onSendPacketComplete: (giftCoins: number, giftPigId: string | null, loveNote: string) => void;
  onReceivePacket: (packet: CouplePacket) => void;
}

export const CoupleModal: React.FC<CoupleModalProps> = ({
  state,
  partnerFarm,
  p2pState,
  p2pError,
  roomStatus,
  initialOfferToken,
  initialAnswerToken,
  onClose,
  onJoinRoom,
  onRegenerateRoom,
  onCreateOffer,
  onAcceptOffer,
  onAcceptAnswer,
  onDisconnectP2P,
  onSendLiveHeart,
  onSendLiveCoins,
  onSendLivePig,
  onVisitPartner,
  onCoupleBreed,
  onSendPacketComplete,
  onReceivePacket,
}) => {
  const [tab, setTab] = useState<'room' | 'live' | 'async'>(
    initialOfferToken || initialAnswerToken ? 'live' : 'room'
  );
  const [roleStep, setRoleStep] = useState<'host' | 'guest'>(
    initialOfferToken ? 'guest' : 'host'
  );
  const [roomInput, setRoomInput] = useState('');
  const [roomQr, setRoomQr] = useState('');

  // Host states
  const [offerToken, setOfferToken] = useState('');
  const [offerQr, setOfferQr] = useState('');
  const [answerInput, setAnswerInput] = useState(initialAnswerToken || '');

  // Guest states
  const [offerInput, setOfferInput] = useState(initialOfferToken || '');
  const [answerToken, setAnswerToken] = useState('');
  const [answerQr, setAnswerQr] = useState('');

  // Live actions states
  const [liveNote, setLiveNote] = useState('Nhớ người yêu quá nè 💕');
  const [liveGiftPigId, setLiveGiftPigId] = useState('');

  // Async gift link states
  const [loveNote, setLoveNote] = useState(state.loveNote || 'Yêu thương gửi chuồng heo!');
  const [giftCoins, setGiftCoins] = useState(0);
  const [giftPigId, setGiftPigId] = useState('');
  const [giftUrl, setGiftUrl] = useState('');
  const [giftQr, setGiftQr] = useState('');
  const [incomingGiftText, setIncomingGiftText] = useState('');

  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const myAdults = state.pigs.filter((p) => p.growth >= 100);
  const partnerAdults = (partnerFarm?.pigs || []).filter((p) => p.growth >= 100);
  const [myBreedPigId, setMyBreedPigId] = useState(myAdults[0]?.id || '');
  const [partnerBreedPigId, setPartnerBreedPigId] = useState(partnerAdults[0]?.id || '');

  const currentRoomCode = state.roomCode || 'HEO123';
  const roomInviteUrl = React.useMemo(() => {
    const token = encodeCouplePacket(state, {
      loveNote: state.loveNote || state.farmGreeting,
      giftCoins: 0,
      giftPigBreedId: null,
    });
    return buildRoomInviteUrl(currentRoomCode, token);
  }, [currentRoomCode, state]);

  useEffect(() => {
    QRCode.toDataURL(roomInviteUrl, { width: 170, margin: 1 })
      .then(setRoomQr)
      .catch(() => {});
  }, [roomInviteUrl]);

  // Auto-generate QR whenever offerToken / answerToken / giftUrl changes
  useEffect(() => {
    if (!offerToken) {
      setOfferQr('');
      return;
    }
    const url = buildShareUrl('join', offerToken);
    QRCode.toDataURL(url, { width: 180, margin: 1 }).then(setOfferQr).catch(() => {});
  }, [offerToken]);

  useEffect(() => {
    if (!answerToken) {
      setAnswerQr('');
      return;
    }
    const url = buildShareUrl('ans', answerToken);
    QRCode.toDataURL(url, { width: 180, margin: 1 }).then(setAnswerQr).catch(() => {});
  }, [answerToken]);

  useEffect(() => {
    if (!giftUrl) {
      setGiftQr('');
      return;
    }
    QRCode.toDataURL(giftUrl, { width: 170, margin: 1 }).then(setGiftQr).catch(() => {});
  }, [giftUrl]);

  // If opened from ?join=... link, auto-run acceptOffer!
  useEffect(() => {
    if (initialOfferToken && !answerToken && p2pState === 'idle') {
      setRoleStep('guest');
      onAcceptOffer(initialOfferToken)
        .then((ans) => {
          setAnswerToken(ans);
          setStatusMsg({
            ok: true,
            text: 'Đã tạo Mã Trả Lời! Hãy gửi link/QR này lại cho máy người yêu để hoàn tất kết nối.',
          });
        })
        .catch((err) => {
          setStatusMsg({
            ok: false,
            text: err instanceof Error ? err.message : 'Không thể đọc mã mời.',
          });
        });
    }
  }, [initialOfferToken, answerToken, p2pState, onAcceptOffer]);

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // ignore
    }
  };

  const shareOrCopy = async (title: string, text: string, url: string, key: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // user cancelled share sheet, fallback copy
      }
    }
    await copyText(url, key);
  };

  const handleHostCreate = async () => {
    setStatusMsg(null);
    try {
      const token = await onCreateOffer();
      setOfferToken(token);
      setStatusMsg({
        ok: true,
        text: 'Đã tạo phòng! Người yêu chỉ cần mở link hoặc quét mã QR bằng Camera iPhone.',
      });
    } catch {
      setStatusMsg({ ok: false, text: 'Không tạo được mã P2P. Hãy thử lại.' });
    }
  };

  const handleHostAcceptAnswer = async () => {
    setStatusMsg(null);
    const extracted = extractSignalFromInput(answerInput);
    if (!extracted) {
      setStatusMsg({ ok: false, text: 'Link hoặc mã trả lời chưa đúng định dạng.' });
      return;
    }
    try {
      await onAcceptAnswer(extracted);
      setStatusMsg({ ok: true, text: 'Đang ghép nối 2 iPhone...' });
    } catch (err) {
      setStatusMsg({
        ok: false,
        text: err instanceof Error ? err.message : 'Không thể kết nối mã trả lời.',
      });
    }
  };

  const handleGuestJoin = async () => {
    setStatusMsg(null);
    const extracted = extractSignalFromInput(offerInput);
    if (!extracted) {
      setStatusMsg({ ok: false, text: 'Link hoặc mã mời chưa đúng định dạng.' });
      return;
    }
    try {
      const ans = await onAcceptOffer(extracted);
      setAnswerToken(ans);
      setStatusMsg({
        ok: true,
        text: 'Đã tạo Mã Trả Lời! Gửi link/QR này về cho máy Tạo Phòng.',
      });
    } catch (err) {
      setStatusMsg({
        ok: false,
        text: err instanceof Error ? err.message : 'Mã mời không hợp lệ hoặc đã hết hạn.',
      });
    }
  };

  const handleCreateGiftLink = async () => {
    const selectedPig = state.pigs.find((p) => p.id === giftPigId) || null;
    const token = encodeCouplePacket(state, {
      loveNote,
      giftCoins,
      giftPigBreedId: selectedPig ? selectedPig.breedId : null,
    });
    const url = buildShareUrl('gift', token);
    setGiftUrl(url);
    onSendPacketComplete(giftCoins, selectedPig ? selectedPig.id : null, loveNote);
    await shareOrCopy(
      'Quà Chuồng Heo Cặp Đôi',
      `${state.playerName} gửi quà Chuồng Heo cho bạn: "${loveNote}"`,
      url,
      'gift'
    );
  };

  const handleImportGift = () => {
    const extracted = extractGiftFromInput(incomingGiftText);
    if (!extracted) {
      setStatusMsg({ ok: false, text: 'Không tìm thấy mã quà HEO2:... trong nội dung vừa dán.' });
      return;
    }
    try {
      const packet = decodeCouplePacket(extracted);
      onReceivePacket(packet);
      setIncomingGiftText('');
      setStatusMsg({
        ok: true,
        text: `Đã nhận quà từ ${packet.senderName}: "${packet.loveNote}"!`,
      });
    } catch {
      setStatusMsg({ ok: false, text: 'Mã quà không hợp lệ.' });
    }
  };

  const isConnected = p2pState === 'connected' || (roomStatus === 'connected' && Boolean(state.partnerDeviceId));

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-1.5 sm:p-4 bg-black/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="parchment-panel w-full max-w-3xl max-h-[95dvh] rounded-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#be185d] to-[#db2777] border-b-3 border-[#4a280d] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Heart className="w-5 h-5 text-pink-100 fill-pink-200 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-sm sm:text-xl font-extrabold text-white truncate">
                Chơi Chung 2 Máy · Gửi Link Là Vào Ngay
              </h2>
              <p className="text-[10px] sm:text-[11px] text-pink-100 truncate">
                {roomStatus === 'connected'
                  ? `🟢 Phòng ${currentRoomCode} đang trực tuyến · Điểm gắn kết: ${state.lovePoints} 💕`
                  : `Gửi 1 link cho người yêu mở trên iPhone là tự kết nối · ${state.lovePoints} 💕`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-xl bg-rose-900/70 hover:bg-rose-800 border border-pink-200/40 text-white flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="px-3 sm:px-4 pt-2 pb-1.5 border-b border-[#78471e]/20 flex items-center gap-1.5 sm:gap-2 overflow-x-auto farm-scroll shrink-0">
          <button
            type="button"
            onClick={() => {
              setTab('room');
              setStatusMsg(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              tab === 'room'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-[#e7d6b7] text-[#5c3618]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> Gửi Link 1 Chạm (Khuyên Dùng)
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('live');
              setStatusMsg(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              tab === 'live'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-[#e7d6b7] text-[#5c3618]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            {p2pState === 'connected' ? 'P2P Đang Nối' : 'Ghép Đôi P2P'}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('async');
              setStatusMsg(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              tab === 'async'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-[#e7d6b7] text-[#5c3618]'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" /> Quà / Mã Offline
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 overflow-y-auto farm-scroll flex-1 space-y-3">
          {(p2pError || (statusMsg && !statusMsg.ok)) && (
            <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-400 text-rose-900 text-xs font-bold">
              {statusMsg && !statusMsg.ok ? statusMsg.text : p2pError}
            </div>
          )}
          {statusMsg && statusMsg.ok && (
            <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-bold">
              {statusMsg.text}
            </div>
          )}

          {tab === 'room' && (
            <div className="space-y-3">
              {/* 1-Link Instant Share Card */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-white/95 border-2 border-pink-300 shadow-xs space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-extrabold text-[#3c1e08]">
                        Mã Phòng Chung:
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-pink-100 border border-pink-400 font-mono-nums font-extrabold text-sm text-pink-900 tracking-wider">
                        {currentRoomCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          roomStatus === 'connected'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : roomStatus === 'connecting'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-stone-100 text-stone-700 border border-stone-300'
                        }`}
                      >
                        {roomStatus === 'connected'
                          ? '● Đã Kết Nối'
                          : roomStatus === 'connecting'
                          ? '◌ Đang Kết Nối...'
                          : '○ Chờ Mạng'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6d411c] mt-1">
                      Gửi link bên dưới qua Zalo / Messenger / iMessage cho người yêu — người yêu bấm vào là vào thẳng trang trại của bạn & chơi chung ngay!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onRegenerateRoom();
                      setStatusMsg({ ok: true, text: 'Đã tạo mã phòng mới!' });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#f5e6c8] hover:bg-[#ead4aa] border border-[#b47b44] text-[11px] font-bold text-[#5c3618] cursor-pointer"
                  >
                    Đổi Mã Phòng
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3 items-center pt-1">
                  {roomQr && (
                    <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-[#c29b68] mx-auto">
                      <img src={roomQr} alt="QR Vào Phòng Chơi Chung" className="w-24 h-24 sm:w-28 sm:h-28" />
                      <span className="text-[10px] font-bold text-[#6d411c]">Quét bằng Camera</span>
                    </div>
                  )}

                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          shareOrCopy(
                            'Mời vào Chuồng Heo Cặp Đôi 💕',
                            `${state.playerName} mời bạn vào chơi chung Chuồng Heo! Bấm link để vào ngay (Mã phòng: ${currentRoomCode})`,
                            roomInviteUrl,
                            'roomurl'
                          )
                        }
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:brightness-110 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" /> Gửi Link Cho Người Yêu
                      </button>
                      <button
                        type="button"
                        onClick={() => copyText(roomInviteUrl, 'roomurl')}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'roomurl' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'roomurl' ? 'Đã Copy Link!' : 'Copy Link'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                        placeholder="Hoặc nhập mã phòng người yêu (VD: AB12CD)"
                        maxLength={12}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#fff9ea] border border-[#b47b44] text-xs font-mono uppercase"
                      />
                      <button
                        type="button"
                        disabled={!roomInput.trim()}
                        onClick={() => {
                          onJoinRoom(roomInput.trim());
                          setStatusMsg({ ok: true, text: `Đang kết nối vào phòng ${roomInput.trim()}...` });
                          setRoomInput('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 text-white text-xs font-bold cursor-pointer shrink-0"
                      >
                        Vào Phòng
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Partner Live Actions Card */}
              {partnerFarm && (
                <div className="p-3 rounded-xl bg-pink-50/90 border-2 border-pink-300 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-extrabold text-pink-700">
                        {state.partnerDeviceId
                          ? '🟢 Người Yêu Đã Đồng Bộ Trong Phòng'
                          : '💕 Đối Tác Chuồng Đôi (Sẽ tự cập nhật khi người yêu mở link)'}
                      </div>
                      <div className="font-display font-extrabold text-base text-[#3c1e08]">
                        {partnerFarm.farmerName} · Lv.{partnerFarm.level} · {partnerFarm.pigs.length} bé heo
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onVisitPartner();
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-extrabold cursor-pointer shadow-xs"
                    >
                      Qua Thăm / Trộm Heo 🥷
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-white/90 border border-[#c29b68] space-y-1.5">
                      <div className="text-xs font-extrabold text-[#3c1e08]">Gửi Tim & Xu Sang Máy Kia</div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={liveNote}
                          onChange={(e) => setLiveNote(e.target.value)}
                          maxLength={50}
                          className="flex-1 px-2 py-1 rounded-lg bg-[#fff9ea] border border-[#b47b44] text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onSendLiveHeart(liveNote);
                            setStatusMsg({ ok: true, text: 'Đã thả tim sang máy người yêu!' });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          <Heart className="w-3 h-3 fill-white" /> Gửi
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[50, 200].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            disabled={state.coins < amt}
                            onClick={() => {
                              onSendLiveCoins(amt, liveNote);
                              setStatusMsg({ ok: true, text: `Đã chuyển ${amt} ₫ sang máy người yêu!` });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-stone-300 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Coins className="w-3 h-3" /> Tặng +{amt}₫
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/90 border border-[#c29b68] space-y-1.5">
                      <div className="text-xs font-extrabold text-[#3c1e08]">Tặng Heo Sang Máy Người Yêu</div>
                      {state.pigs.length <= 1 ? (
                        <p className="text-[11px] text-[#6d411c]">Cần ít nhất 2 heo trong chuồng mới tặng được.</p>
                      ) : (
                        <div className="flex gap-1.5">
                          <select
                            value={liveGiftPigId}
                            onChange={(e) => setLiveGiftPigId(e.target.value)}
                            className="flex-1 px-2 py-1 rounded-lg bg-[#fff9ea] border border-[#b47b44] text-xs font-bold"
                          >
                            <option value="">-- Chọn bé heo --</option>
                            {state.pigs.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.nickname} ({BREED_MAP[p.breedId]?.name})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={!liveGiftPigId}
                            onClick={() => {
                              if (!liveGiftPigId) return;
                              onSendLivePig(liveGiftPigId, liveNote);
                              setLiveGiftPigId('');
                              setStatusMsg({ ok: true, text: 'Đã chuyển bé heo sang chuồng người yêu!' });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 text-white text-xs font-bold cursor-pointer shrink-0"
                          >
                            Tặng
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'live' && (
            <>
              {isConnected ? (
                /* CONNECTED LIVE DASHBOARD */
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-500 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        2 iPhone Đang Kết Nối Trực Tiếp (P2P)
                      </div>
                      <div className="font-display font-extrabold text-base text-[#3c1e08] mt-0.5">
                        Người yêu: {partnerFarm?.farmerName || 'Đang đồng bộ...'} (Lv.{partnerFarm?.level || 1})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onVisitPartner();
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Qua Chuồng Người Yêu 💕
                      </button>
                      <button
                        type="button"
                        onClick={onDisconnectP2P}
                        className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Unplug className="w-3.5 h-3.5" /> Ngắt
                      </button>
                    </div>
                  </div>

                  {/* Send live love message & gifts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/90 border-2 border-[#c29b68] space-y-2">
                      <div className="text-xs font-extrabold text-[#3c1e08]">
                        Gửi Tim & Tin Nhắn Trực Tiếp
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={liveNote}
                          onChange={(e) => setLiveNote(e.target.value)}
                          maxLength={50}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#fff9ea] border border-[#b47b44] text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onSendLiveHeart(liveNote);
                            setStatusMsg({ ok: true, text: 'Đã thả tim sang máy người yêu!' });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          <Heart className="w-3.5 h-3.5 fill-white" /> Gửi
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-xs font-bold text-[#6d411c]">Tặng Xu Nhanh:</span>
                        {[50, 200].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            disabled={state.coins < amt}
                            onClick={() => {
                              onSendLiveCoins(amt, liveNote);
                              setStatusMsg({ ok: true, text: `Đã chuyển ${amt} ₫ sang máy người yêu!` });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-stone-300 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Coins className="w-3 h-3" /> +{amt}₫
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Send live pig */}
                    <div className="p-3 rounded-xl bg-white/90 border-2 border-[#c29b68] space-y-2">
                      <div className="text-xs font-extrabold text-[#3c1e08]">
                        Chuyển Thẳng 1 Bé Heo Sang Máy Người Yêu
                      </div>
                      {state.pigs.length <= 1 ? (
                        <p className="text-xs text-[#6d411c]">Cần ít nhất 2 heo trong chuồng mới tặng được.</p>
                      ) : (
                        <div className="flex gap-1.5">
                          <select
                            value={liveGiftPigId}
                            onChange={(e) => setLiveGiftPigId(e.target.value)}
                            className="flex-1 px-2 py-1.5 rounded-lg bg-[#fff9ea] border border-[#b47b44] text-xs font-bold"
                          >
                            <option value="">-- Chọn bé heo --</option>
                            {state.pigs.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.nickname} ({BREED_MAP[p.breedId]?.name})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={!liveGiftPigId}
                            onClick={() => {
                              if (!liveGiftPigId) return;
                              onSendLivePig(liveGiftPigId, liveNote);
                              setLiveGiftPigId('');
                              setStatusMsg({ ok: true, text: 'Đã chuyển bé heo sang chuồng người yêu!' });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 text-white text-xs font-bold cursor-pointer shrink-0"
                          >
                            Tặng Ngay
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Co-op Live Breeding */}
                  <div className="p-3 rounded-xl bg-white/90 border-2 border-pink-300 space-y-2">
                    <div className="text-xs font-extrabold text-pink-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Lai Heo Chung Từ Đàn Thật Của 2 Máy (Phí 50 ₫ · +5 💕)
                    </div>
                    {myAdults.length === 0 || partnerAdults.length === 0 ? (
                      <p className="text-xs text-[#6d411c]">
                        Cần ít nhất 1 heo trưởng thành (100%) ở mỗi máy để lai giống chung.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                        <select
                          value={myBreedPigId}
                          onChange={(e) => setMyBreedPigId(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#fff9ea] border border-[#b47b44] text-xs font-bold"
                        >
                          {myAdults.map((p) => (
                            <option key={p.id} value={p.id}>
                              Máy bạn: {BREED_MAP[p.breedId]?.name}
                            </option>
                          ))}
                        </select>
                        <select
                          value={partnerBreedPigId}
                          onChange={(e) => setPartnerBreedPigId(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#fff9ea] border border-[#b47b44] text-xs font-bold"
                        >
                          {partnerAdults.map((p) => (
                            <option key={p.id} value={p.id}>
                              Máy người yêu: {BREED_MAP[p.breedId]?.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={state.coins < 50 || state.pigs.length >= state.barnCapacity}
                          onClick={() => {
                            onCoupleBreed(myBreedPigId, partnerBreedPigId);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:bg-stone-300 text-white text-xs font-bold cursor-pointer"
                        >
                          Lai Chung Ngay 💕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* P2P HANDSHAKE SETUP FOR 2 SEPARATE IPHONES */
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRoleStep('host')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold border-2 cursor-pointer ${
                        roleStep === 'host'
                          ? 'bg-sky-600 text-white border-sky-900'
                          : 'bg-white/80 text-[#5c3618] border-[#c29b68]'
                      }`}
                    >
                      Máy 1: Tạo Phòng Mời
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleStep('guest')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold border-2 cursor-pointer ${
                        roleStep === 'guest'
                          ? 'bg-pink-600 text-white border-pink-900'
                          : 'bg-white/80 text-[#5c3618] border-[#c29b68]'
                      }`}
                    >
                      Máy 2: Tham Gia Phòng
                    </button>
                  </div>

                  {roleStep === 'host' ? (
                    <div className="p-3.5 rounded-xl bg-white/90 border-2 border-[#c29b68] space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-extrabold text-[#3c1e08]">
                            Bước 1: Tạo Link / Mã QR trên Máy 1
                          </div>
                          <p className="text-[11px] text-[#6d411c]">
                            Nếu ngồi cạnh nhau: Máy 2 mở Camera iPhone quét thẳng QR. Nếu ở xa: gửi link qua iMessage/Zalo.
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={p2pState === 'gathering'}
                          onClick={handleHostCreate}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-stone-400 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <QrCode className="w-4 h-4" />
                          {p2pState === 'gathering' ? 'Đang tạo...' : offerToken ? 'Tạo Lại Mã' : 'Tạo Link & QR Mời'}
                        </button>
                      </div>

                      {offerToken && (
                        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3 items-center pt-2 border-t border-[#e5cfa8]">
                          {offerQr && (
                            <div className="flex flex-col items-center bg-white p-2 rounded-xl border border-[#c29b68] mx-auto">
                              <img src={offerQr} alt="QR Mời Kết Nối" className="w-36 h-36" />
                              <span className="text-[10px] font-bold text-[#6d411c] mt-1">
                                Máy 2 quét QR bằng Camera
                              </span>
                            </div>
                          )}

                          <div className="space-y-2.5 min-w-0">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  shareOrCopy(
                                    'Mời chơi Chuồng Heo 2 Máy',
                                    `${state.playerName} mời bạn kết nối chuồng heo trực tiếp!`,
                                    buildShareUrl('join', offerToken),
                                    'offer'
                                  )
                                }
                                className="px-3.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <Share2 className="w-3.5 h-3.5" /> Gửi Link Cho Người Yêu
                              </button>
                              <button
                                type="button"
                                onClick={() => copyText(buildShareUrl('join', offerToken), 'offer')}
                                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                {copiedKey === 'offer' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {copiedKey === 'offer' ? 'Đã Copy Link!' : 'Copy Link'}
                              </button>
                            </div>

                            <div>
                              <label className="block text-xs font-extrabold text-[#3c1e08] mb-1">
                                Bước 2: Dán Link/Mã Trả Lời từ Máy 2 vào đây
                              </label>
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={answerInput}
                                  onChange={(e) => setAnswerInput(e.target.value)}
                                  placeholder="Dán link ?ans=... hoặc mã HEO_A:..."
                                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#fff9ea] border border-[#b47b44] text-xs font-mono"
                                />
                                <button
                                  type="button"
                                  disabled={!answerInput.trim()}
                                  onClick={handleHostAcceptAnswer}
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 text-white text-xs font-bold cursor-pointer shrink-0"
                                >
                                  Kết Nối!
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* GUEST VIEW */
                    <div className="p-3.5 rounded-xl bg-white/90 border-2 border-[#c29b68] space-y-3">
                      <div>
                        <label className="block text-xs font-extrabold text-[#3c1e08] mb-1">
                          Bước 1: Dán Link/Mã Mời từ Máy 1 (nếu chưa tự điền khi quét QR)
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={offerInput}
                            onChange={(e) => setOfferInput(e.target.value)}
                            placeholder="Dán link ?join=... hoặc mã HEO_O:..."
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#fff9ea] border border-[#b47b44] text-xs font-mono"
                          />
                          <button
                            type="button"
                            disabled={!offerInput.trim() || p2pState === 'answering'}
                            onClick={handleGuestJoin}
                            className="px-3.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:bg-stone-300 text-white text-xs font-bold cursor-pointer shrink-0"
                          >
                            {p2pState === 'answering' ? 'Đang xử lý...' : 'Tạo Mã Trả Lời'}
                          </button>
                        </div>
                      </div>

                      {answerToken && (
                        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3 items-center pt-2 border-t border-[#e5cfa8]">
                          {answerQr && (
                            <div className="flex flex-col items-center bg-white p-2 rounded-xl border border-[#c29b68] mx-auto">
                              <img src={answerQr} alt="QR Trả Lời" className="w-36 h-36" />
                              <span className="text-[10px] font-bold text-[#6d411c] mt-1">
                                Hoặc copy mã gửi lại Máy 1
                              </span>
                            </div>
                          )}
                          <div className="space-y-2 min-w-0">
                            <div className="text-xs font-extrabold text-[#3c1e08]">
                              Bước 2: Gửi Mã Trả Lời này lại cho Máy 1
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  shareOrCopy(
                                    'Mã Trả Lời Chuồng Heo',
                                    answerToken,
                                    buildShareUrl('ans', answerToken),
                                    'ans'
                                  )
                                }
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" /> Gửi Cho Máy 1
                              </button>
                              <button
                                type="button"
                                onClick={() => copyText(answerToken, 'ans')}
                                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                {copiedKey === 'ans' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {copiedKey === 'ans' ? 'Đã Copy!' : 'Copy Mã'}
                              </button>
                            </div>
                            <p className="text-[11px] text-[#6d411c]">
                              Sau khi Máy 1 dán mã này và bấm Kết Nối, 2 máy sẽ tự động thông nhau ngay lập tức!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {tab === 'async' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Send Gift Link / QR */}
              <div className="p-3.5 rounded-xl bg-white/90 border-2 border-[#c29b68] space-y-2.5">
                <div className="text-xs font-extrabold text-[#3c1e08] flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-pink-600" /> Gửi Link / QR Quà Tặng (1 Chạm)
                </div>
                <p className="text-[11px] text-[#6d411c]">
                  Dùng khi 2 người không online cùng lúc: gửi 1 link, người yêu bấm vào là nhận được heo & thăm chuồng bạn!
                </p>

                <input
                  type="text"
                  value={loveNote}
                  onChange={(e) => setLoveNote(e.target.value)}
                  maxLength={60}
                  placeholder="Lời nhắn..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#fff9ea] border border-[#b47b44] text-xs"
                />

                <div className="flex gap-1.5">
                  {[0, 100, 300].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      disabled={state.coins < amt}
                      onClick={() => setGiftCoins(amt)}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                        giftCoins === amt
                          ? 'bg-amber-500 text-white border-amber-700'
                          : 'bg-[#fff9ea] text-[#5c3618] border-[#c29b68]'
                      }`}
                    >
                      {amt === 0 ? 'Không Xu' : `+${amt}₫`}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1.5 overflow-x-auto farm-scroll pb-1">
                  <button
                    type="button"
                    onClick={() => setGiftPigId('')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border shrink-0 cursor-pointer ${
                      giftPigId === ''
                        ? 'bg-pink-600 text-white border-pink-800'
                        : 'bg-[#fff9ea] text-[#5c3618] border-[#c29b68]'
                    }`}
                  >
                    Không kèm heo
                  </button>
                  {state.pigs.length > 1 &&
                    state.pigs.map((p) => {
                      const b = BREED_MAP[p.breedId] || PIG_BREEDS[0];
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setGiftPigId(p.id)}
                          className={`px-2 py-0.5 rounded-lg border shrink-0 flex items-center gap-1 text-[11px] font-bold cursor-pointer ${
                            giftPigId === p.id
                              ? 'bg-pink-100 border-pink-600 text-pink-950'
                              : 'bg-white border-[#c29b68] text-[#4a280d]'
                          }`}
                        >
                          <PigSprite breedId={p.breedId} stage={p.stage} size={22} />
                          <span>{b.name}</span>
                        </button>
                      );
                    })}
                </div>

                <button
                  type="button"
                  onClick={handleCreateGiftLink}
                  className="w-full py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" /> Tạo & Gửi Link Quà
                </button>

                {giftQr && (
                  <div className="flex items-center gap-2 pt-1">
                    <img src={giftQr} alt="QR Quà" className="w-24 h-24 rounded border border-[#c29b68] bg-white p-1" />
                    <div className="text-[11px] text-[#6d411c] space-y-1">
                      <div>Người yêu quét QR bằng Camera iPhone hoặc bấm link vừa gửi là nhận ngay!</div>
                      <button
                        type="button"
                        onClick={() => copyText(giftUrl, 'gifturl')}
                        className="px-2.5 py-1 rounded bg-amber-600 text-white text-[11px] font-bold cursor-pointer"
                      >
                        {copiedKey === 'gifturl' ? 'Đã Copy Link!' : 'Copy Link Quà'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Receive Gift Link / Code */}
              <div className="p-3.5 rounded-xl bg-white/90 border-2 border-[#c29b68] space-y-2.5 flex flex-col">
                <div className="text-xs font-extrabold text-[#3c1e08] flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-emerald-600" /> Nhận Quà Từ Link / Mã
                </div>
                <p className="text-[11px] text-[#6d411c]">
                  Nếu người yêu gửi link qua Zalo/iMessage, chỉ cần bấm thẳng vào link. Hoặc dán link / mã <code className="font-mono font-bold">HEO2:...</code> vào đây:
                </p>
                <textarea
                  value={incomingGiftText}
                  onChange={(e) => setIncomingGiftText(e.target.value)}
                  rows={4}
                  placeholder="Dán link ?gift=... hoặc mã HEO2:..."
                  className="w-full p-2 rounded-xl bg-[#fff9ea] border border-[#b47b44] text-xs font-mono flex-1"
                />
                <button
                  type="button"
                  disabled={!incomingGiftText.trim()}
                  onClick={handleImportGift}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 text-white text-xs font-bold cursor-pointer"
                >
                  Nhận Quà & Cập Nhật Chuồng Người Yêu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
