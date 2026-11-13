import { CouplePacket } from '../types/game';

export type P2PConnectionState =
  | 'idle'
  | 'gathering'
  | 'waiting_answer'
  | 'answering'
  | 'connecting'
  | 'connected'
  | 'error';

export interface LiveFarmSnapshot {
  deviceId?: string;
  senderName: string;
  farmName: string;
  greeting: string;
  level: number;
  waterLevel: number;
  guardDogActiveUntil?: number;
  pigs: Array<{
    id: string;
    breedId: string;
    nickname: string;
    growth: number;
    x: number;
    y: number;
    facing: 'left' | 'right';
    isSick: boolean;
  }>;
  drops: Array<{
    id: string;
    type: 'red_cube' | 'chest' | 'poop' | 'coin_bag';
    x: number;
    y: number;
    value: number;
  }>;
}

export type P2PMessage =
  | { type: 'FARM_SYNC'; payload: LiveFarmSnapshot }
  | { type: 'PING_HEART'; senderName: string; text: string }
  | { type: 'ACTION_PET'; senderName: string; pigId: string }
  | { type: 'ACTION_WATER'; senderName: string }
  | { type: 'ACTION_GIFT_COINS'; senderName: string; amount: number; note: string }
  | { type: 'ACTION_GIFT_PIG'; senderName: string; breedId: string; nickname: string; note: string }
  | { type: 'ACTION_STEAL_PIG'; senderName: string; pigId: string; breedId: string; nickname: string };

function uint8ToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToUint8(str: string): Uint8Array {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function compressString(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  if (typeof CompressionStream !== 'undefined') {
    try {
      const cs = new CompressionStream('deflate-raw');
      const writer = cs.writable.getWriter();
      writer.write(bytes);
      writer.close();
      const compressed = await new Response(cs.readable).arrayBuffer();
      return 'z:' + uint8ToBase64Url(new Uint8Array(compressed));
    } catch {
      // Fallback to raw base64url
    }
  }
  return 'r:' + uint8ToBase64Url(bytes);
}

async function decompressString(token: string): Promise<string> {
  if (token.startsWith('z:') && typeof DecompressionStream !== 'undefined') {
    const bytes = base64UrlToUint8(token.slice(2));
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    writer.write(new Uint8Array(bytes));
    writer.close();
    const decompressed = await new Response(ds.readable).arrayBuffer();
    return new TextDecoder().decode(decompressed);
  }
  if (token.startsWith('r:')) {
    return new TextDecoder().decode(base64UrlToUint8(token.slice(2)));
  }
  return new TextDecoder().decode(base64UrlToUint8(token));
}

function compactSdp(sdp: string): string {
  const lines = sdp.split(/\r?\n/);
  const keep: string[] = [];
  let candidateCount = 0;
  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith('a=candidate:')) {
      // Prioritize srflx / host UDP candidates, cap at 5 to keep QR compact
      if (candidateCount < 5 && (line.includes(' udp ') || line.includes(' UDP ') || line.includes('srflx'))) {
        keep.push(line);
        candidateCount++;
      }
      continue;
    }
    if (
      line.startsWith('v=') ||
      line.startsWith('o=') ||
      line.startsWith('s=') ||
      line.startsWith('t=') ||
      line.startsWith('m=') ||
      line.startsWith('c=') ||
      line.startsWith('a=ice-ufrag:') ||
      line.startsWith('a=ice-pwd:') ||
      line.startsWith('a=ice-options:') ||
      line.startsWith('a=fingerprint:') ||
      line.startsWith('a=setup:') ||
      line.startsWith('a=mid:') ||
      line.startsWith('a=sctp-port:') ||
      line.startsWith('a=max-message-size:') ||
      line.startsWith('a=group:')
    ) {
      keep.push(line);
    }
  }
  return keep.join('\r\n') + '\r\n';
}

export async function encodeSignal(type: 'offer' | 'answer', sdp: string): Promise<string> {
  const payload = JSON.stringify({ t: type === 'offer' ? 'o' : 'a', s: compactSdp(sdp) });
  const packed = await compressString(payload);
  return `${type === 'offer' ? 'HEO_O:' : 'HEO_A:'}${packed}`;
}

export async function decodeSignal(raw: string): Promise<{ type: 'offer' | 'answer'; sdp: string }> {
  const trimmed = raw.trim();
  let body = trimmed;
  if (trimmed.startsWith('HEO_O:') || trimmed.startsWith('HEO_A:')) {
    body = trimmed.slice(6);
  }
  const json = await decompressString(body);
  const parsed = JSON.parse(json) as { t: 'o' | 'a'; s: string };
  return {
    type: parsed.t === 'o' ? 'offer' : 'answer',
    sdp: parsed.s,
  };
}

export function extractSignalFromInput(text: string): string | null {
  const trimmed = text.trim();
  // Match URL parameter ?join=... or ?ans=...
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const join = url.searchParams.get('join');
      if (join) return join;
      const ans = url.searchParams.get('ans');
      if (ans) return ans;
    }
  } catch {
    // ignore URL parse error
  }
  const match = trimmed.match(/HEO_[OA]:[zr]:[A-Za-z0-9_-]+/);
  if (match) return match[0];
  if (trimmed.startsWith('HEO_O:') || trimmed.startsWith('HEO_A:')) return trimmed;
  return null;
}

export function extractGiftFromInput(text: string): string | null {
  const trimmed = text.trim();
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const gift = url.searchParams.get('gift') || url.searchParams.get('friend');
      if (gift) return gift;
    }
  } catch {
    // ignore
  }
  const match = trimmed.match(/HEO2:[A-Za-z0-9+/=_-]+/);
  return match ? match[0] : null;
}

export function buildShareUrl(param: 'join' | 'ans' | 'gift' | 'friend', token: string): string {
  if (window.location.protocol === 'file:') {
    return token;
  }
  const base = `${window.location.origin}${window.location.pathname}`;
  const url = new URL(base);
  url.searchParams.set(param, token);
  return url.toString();
}

export type P2PEventHandlers = {
  onStateChange: (state: P2PConnectionState, error?: string) => void;
  onMessage: (msg: P2PMessage) => void;
};

export class ServerlessP2PSession {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private handlers: P2PEventHandlers;

  constructor(handlers: P2PEventHandlers) {
    this.handlers = handlers;
  }

  private createPeerConnection(): RTCPeerConnection {
    this.close();
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        this.handlers.onStateChange('connected');
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        this.handlers.onStateChange('error', 'Mất kết nối giữa 2 máy. Hãy kết nối lại.');
      }
    };

    pc.ondatachannel = (event) => {
      this.attachDataChannel(event.channel);
    };

    this.pc = pc;
    return pc;
  }

  private attachDataChannel(channel: RTCDataChannel) {
    this.dc = channel;
    channel.onopen = () => {
      this.handlers.onStateChange('connected');
    };
    channel.onclose = () => {
      this.handlers.onStateChange('idle');
    };
    channel.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as P2PMessage;
        this.handlers.onMessage(msg);
      } catch {
        // Ignore malformed message
      }
    };
  }

  private waitForIceComplete(pc: RTCPeerConnection, timeoutMs = 2400): Promise<void> {
    if (pc.iceGatheringState === 'complete') return Promise.resolve();
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, timeoutMs);
      const check = () => {
        if (pc.iceGatheringState === 'complete') {
          clearTimeout(timer);
          pc.removeEventListener('icegatheringstatechange', check);
          resolve();
        }
      };
      pc.addEventListener('icegatheringstatechange', check);
    });
  }

  async createOfferToken(): Promise<string> {
    this.handlers.onStateChange('gathering');
    const pc = this.createPeerConnection();
    const dc = pc.createDataChannel('pigfarm', { ordered: true });
    this.attachDataChannel(dc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await this.waitForIceComplete(pc);

    const sdp = pc.localDescription?.sdp || offer.sdp || '';
    const token = await encodeSignal('offer', sdp);
    this.handlers.onStateChange('waiting_answer');
    return token;
  }

  async acceptOfferAndCreateAnswer(offerToken: string): Promise<string> {
    this.handlers.onStateChange('answering');
    const decoded = await decodeSignal(offerToken);
    if (decoded.type !== 'offer') {
      throw new Error('Đây không phải mã mời (Offer).');
    }

    const pc = this.createPeerConnection();
    await pc.setRemoteDescription({ type: 'offer', sdp: decoded.sdp });
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await this.waitForIceComplete(pc);

    const sdp = pc.localDescription?.sdp || answer.sdp || '';
    const token = await encodeSignal('answer', sdp);
    this.handlers.onStateChange('connecting');
    return token;
  }

  async acceptAnswer(answerToken: string): Promise<void> {
    if (!this.pc) {
      throw new Error('Hãy tạo mã mời trên máy này trước khi nhập mã trả lời.');
    }
    this.handlers.onStateChange('connecting');
    const decoded = await decodeSignal(answerToken);
    if (decoded.type !== 'answer') {
      throw new Error('Đây không phải mã trả lời (Answer).');
    }
    await this.pc.setRemoteDescription({ type: 'answer', sdp: decoded.sdp });
  }

  send(msg: P2PMessage): boolean {
    if (!this.dc || this.dc.readyState !== 'open') return false;
    try {
      this.dc.send(JSON.stringify(msg));
      return true;
    } catch {
      return false;
    }
  }

  isConnected(): boolean {
    return Boolean(this.dc && this.dc.readyState === 'open');
  }

  close() {
    if (this.dc) {
      try {
        this.dc.close();
      } catch {
        // ignore
      }
      this.dc = null;
    }
    if (this.pc) {
      try {
        this.pc.close();
      } catch {
        // ignore
      }
      this.pc = null;
    }
  }
}

export type { CouplePacket };
