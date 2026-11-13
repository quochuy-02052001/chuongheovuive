import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  Check,
  Copy,
  Heart,
  Radio,
  Share2,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { decodeCouplePacket, encodeCouplePacket } from '../services/farmRepository';
import { buildShareUrl, extractGiftFromInput } from '../services/p2pSession';
import { CouplePacket, FarmState, NeighborFarm } from '../types/game';

interface FriendModalProps {
  state: FarmState;
  p2pConnected: boolean;
  onClose: () => void;
  onAddFriend: (packet: CouplePacket, visitNow: boolean) => void;
  onVisitNeighbor: (neighborId: string) => void;
  onRemoveFriend: (neighborId: string) => void;
  onAddNpcNeighbor: () => void;
  onOpenLiveConnect: () => void;
}

export const FriendModal: React.FC<FriendModalProps> = ({
  state,
  p2pConnected,
  onClose,
  onAddFriend,
  onVisitNeighbor,
  onRemoveFriend,
  onAddNpcNeighbor,
  onOpenLiveConnect,
}) => {
  const [friendInput, setFriendInput] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const myFriendToken = useMemo(
    () =>
      encodeCouplePacket(state, {
        loveNote: state.loveNote || state.farmGreeting,
        giftCoins: 0,
        giftPigBreedId: null,
      }),
    [state]
  );

  const myShareUrl = useMemo(() => buildShareUrl('friend', myFriendToken), [myFriendToken]);

  useEffect(() => {
    QRCode.toDataURL(myShareUrl, { width: 150, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [myShareUrl]);

  const handleShareMyCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Kết bạn Chuồng Heo: ${state.playerName}`,
          text: `${state.playerName} (Lv.${state.level}) gửi thẻ kết bạn Chuồng Heo! Bấm vào link để kết bạn & qua thăm chuồng mình nhé 🐷`,
          url: myShareUrl,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    try {
      await navigator.clipboard.writeText(myShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      setStatusMsg({ ok: true, text: 'Đã copy link/mã kết bạn của bạn! Gửi qua Zalo/iMessage cho bạn bè nhé.' });
    } catch {
      setStatusMsg({ ok: false, text: 'Không copy tự động được, bạn hãy bôi đen mã để copy.' });
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(myShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      setStatusMsg({ ok: true, text: 'Đã copy link/mã kết bạn!' });
    } catch {
      // ignore
    }
  };

  const handleSubmitFriend = (visitNow: boolean) => {
    setStatusMsg(null);
    const extracted = extractGiftFromInput(friendInput);
    if (!extracted) {
      setStatusMsg({
        ok: false,
        text: 'Link hoặc mã chưa hợp lệ. Hãy dán link ?friend=... hoặc mã bắt đầu bằng HEO2:...',
      });
      return;
    }
    try {
      const packet = decodeCouplePacket(extracted);
      onAddFriend(packet, visitNow);
      setFriendInput('');
      if (visitNow) {
        onClose();
      } else {
        setStatusMsg({
          ok: true,
          text: `Đã kết bạn với ${packet.senderName}! Thẻ bạn bè đã hiện ở thanh phía dưới — bấm vào là qua thăm ngay.`,
        });
      }
    } catch {
      setStatusMsg({ ok: false, text: 'Mã kết bạn bị lỗi hoặc không đầy đủ.' });
    }
  };

  const realFriends: NeighborFarm[] = state.neighbors.filter((n) => n.isRealFriend || n.isPartner);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="parchment-panel w-full max-w-3xl max-h-[92vh] rounded-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-[#8b5a2b] to-[#b47b44] border-b-3 border-[#4a280d] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Users className="w-5 h-5 text-amber-100 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-xl font-extrabold text-amber-50 truncate">
                Kết Bạn Nông Trại
              </h2>
              <p className="text-[11px] text-amber-100/90 truncate">
                Kết bạn xong thẻ sẽ hiện ngay ở thanh Bạn Bè phía dưới — chỉ cần bấm là qua thăm!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-xl bg-[#4a280d]/70 hover:bg-[#4a280d] border border-amber-200/40 text-white flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3 sm:p-4 overflow-y-auto farm-scroll flex-1 space-y-3">
          {statusMsg && (
            <div
              className={`px-3 py-2 rounded-xl border text-xs font-bold ${
                statusMsg.ok
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                  : 'bg-rose-100 border-rose-400 text-rose-900'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Left: My Friend Card + QR */}
            <div className="p-3 rounded-xl bg-white/90 border-2 border-[#c29b68] space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#3c1e08]">
                    1. Gửi Thẻ Kết Bạn Của Bạn
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-400 text-[10px] font-bold text-amber-900">
                    {state.playerName} · Lv.{state.level}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="QR Kết Bạn"
                      className="w-24 h-24 rounded-lg border border-[#c29b68] bg-white p-1 shrink-0"
                    />
                  )}
                  <div className="text-[11px] text-[#6d411c] space-y-1.5">
                    <p>
                      Bạn bè mở link hoặc dùng Camera iPhone quét QR này sẽ tự thêm bạn vào thanh <strong>Bạn Bè</strong> bên dưới & qua thăm chuồng bạn ngay!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleShareMyCard}
                  className="flex-1 px-3 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" /> Gửi Link Kết Bạn
                </button>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Đã Copy' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Right: Paste Friend Link / Code */}
            <div className="p-3 rounded-xl bg-white/90 border-2 border-[#c29b68] space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-[#3c1e08] flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  2. Dán Link / Mã Của Bạn Bè Để Kết Bạn
                </div>
                <textarea
                  value={friendInput}
                  onChange={(e) => setFriendInput(e.target.value)}
                  rows={3}
                  placeholder="Dán link ?friend=... hoặc mã HEO2:... của người yêu / bạn bè vào đây"
                  className="w-full p-2 rounded-xl bg-[#fff9ea] border border-[#b47b44] text-xs font-mono"
                />
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={!friendInput.trim()}
                  onClick={() => handleSubmitFriend(true)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-300 text-white text-xs font-bold cursor-pointer"
                >
                  Kết Bạn & Qua Thăm Ngay
                </button>
                <button
                  type="button"
                  disabled={!friendInput.trim()}
                  onClick={() => handleSubmitFriend(false)}
                  className="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-stone-300 text-white text-xs font-bold cursor-pointer shrink-0"
                >
                  Lưu Bạn
                </button>
              </div>
            </div>
          </div>

          {/* Friends Quick Jump + Live P2P + Sample Neighbor */}
          <div className="p-3 rounded-xl bg-[#fff9ea]/90 border-2 border-[#c29b68] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-[#3c1e08]">
                Bạn Bè Hiện Tại (Bấm để qua thăm)
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLiveConnect();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                    p2pConnected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-pink-100 hover:bg-pink-200 text-pink-900 border border-pink-400'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  {p2pConnected ? 'Đang Nối Live 2 Máy' : 'Nối Live 2 Máy (P2P)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddNpcNeighbor();
                    setStatusMsg({ ok: true, text: 'Đã thêm 1 hàng xóm mẫu vào thanh Bạn Bè bên dưới!' });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#e7d6b7] hover:bg-[#dec79f] text-[#5c3618] text-[11px] font-bold cursor-pointer"
                >
                  + Hàng Xóm Mẫu
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {realFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-xl bg-white border border-[#c29b68] shadow-xs"
                >
                  {friend.isPartner && (
                    <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 shrink-0" />
                  )}
                  <span className="text-xs font-bold text-[#3c1e08]">
                    {friend.farmerName} (Lv.{friend.level})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onVisitNeighbor(friend.id);
                      onClose();
                    }}
                    className="ml-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Qua Thăm
                  </button>
                  {friend.id !== 'partner_farm' && (
                    <button
                      type="button"
                      onClick={() => onRemoveFriend(friend.id)}
                      title="Xóa bạn"
                      className="p-1 rounded-lg text-rose-600 hover:bg-rose-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
