import { LiveFarmSnapshot, P2PMessage } from './p2pSession';

export type RoomSyncStatus = 'idle' | 'connecting' | 'connected' | 'offline';

export interface RoomEventEnvelope {
  id: string;
  ts: number;
  fromDeviceId: string;
  msg: Exclude<P2PMessage, { type: 'FARM_SYNC' }>;
}

const DEVICE_ID_KEY = 'chuong_heo_device_id_v1';
const PROCESSED_EVENTS_KEY = 'chuong_heo_processed_events_v1';
const TOPIC_PREFIX = 'chuong_heo_vui_ve_2026';

const BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
];

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing && existing.length >= 6) return existing;
    const created = `dev_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
    localStorage.setItem(DEVICE_ID_KEY, created);
    return created;
  } catch {
    return `dev_${Math.random().toString(36).slice(2, 10)}`;
  }
}

function loadProcessedEventIds(): Set<string> {
  try {
    const raw = localStorage.getItem(PROCESSED_EVENTS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveProcessedEventIds(set: Set<string>) {
  try {
    const arr = Array.from(set).slice(-80);
    localStorage.setItem(PROCESSED_EVENTS_KEY, JSON.stringify(arr));
  } catch {
    // ignore quota
  }
}

export function buildRoomInviteUrl(roomCode: string, invitePacketToken?: string): string {
  if (typeof window === 'undefined' || window.location.protocol === 'file:') {
    return roomCode;
  }
  const base = `${window.location.origin}${window.location.pathname}`;
  const url = new URL(base);
  url.searchParams.set('room', roomCode);
  if (invitePacketToken) {
    url.searchParams.set('inv', invitePacketToken);
  }
  return url.toString();
}

function encodeUtf8String(str: string): Uint8Array<ArrayBuffer> {
  const bytes = textEncoder.encode(str);
  const out = new Uint8Array(2 + bytes.length);
  out[0] = (bytes.length >> 8) & 0xff;
  out[1] = bytes.length & 0xff;
  out.set(bytes, 2);
  return out;
}

function encodeRemainingLength(len: number): Uint8Array<ArrayBuffer> {
  const bytes: number[] = [];
  let x = len;
  do {
    let encodedByte = x % 128;
    x = Math.floor(x / 128);
    if (x > 0) encodedByte |= 128;
    bytes.push(encodedByte);
  } while (x > 0);
  return new Uint8Array(bytes);
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    out.set(arr, offset);
    offset += arr.length;
  }
  return out;
}

function buildConnectPacket(clientId: string): Uint8Array<ArrayBuffer> {
  const protoName = encodeUtf8String('MQTT');
  const headerRest = new Uint8Array([
    0x04, // Protocol Level 4 (MQTT 3.1.1)
    0x02, // Clean Session
    0x00, // Keep Alive MSB
    0x1e, // Keep Alive LSB (30s)
  ]);
  const clientBytes = encodeUtf8String(clientId);
  const body = concatBytes(protoName, headerRest, clientBytes);
  return concatBytes(new Uint8Array([0x10]), encodeRemainingLength(body.length), body);
}

function buildSubscribePacket(packetId: number, topics: string[]): Uint8Array<ArrayBuffer> {
  const pid = new Uint8Array([(packetId >> 8) & 0xff, packetId & 0xff]);
  const parts: Uint8Array[] = [pid];
  for (const t of topics) {
    parts.push(encodeUtf8String(t), new Uint8Array([0x00])); // QoS 0
  }
  const body = concatBytes(...parts);
  return concatBytes(new Uint8Array([0x82]), encodeRemainingLength(body.length), body);
}

function buildPublishPacket(topic: string, payload: string, retain: boolean): Uint8Array<ArrayBuffer> {
  const headerByte = retain ? 0x31 : 0x30;
  const topicBytes = encodeUtf8String(topic);
  const payloadBytes = textEncoder.encode(payload);
  const body = concatBytes(topicBytes, payloadBytes);
  return concatBytes(new Uint8Array([headerByte]), encodeRemainingLength(body.length), body);
}

export interface RoomSyncCallbacks {
  onStatusChange: (status: RoomSyncStatus) => void;
  onPartnerSnapshot: (snapshot: LiveFarmSnapshot, partnerDeviceId: string) => void;
  onIncomingEvent: (event: RoomEventEnvelope) => void;
}

export class RoomCloudSession {
  private roomCode = '';
  private deviceId: string;
  private callbacks: RoomSyncCallbacks;
  private ws: WebSocket | null = null;
  private brokerIndex = 0;
  private reconnectTimer: number | null = null;
  private pingTimer: number | null = null;
  private connectTimeout: number | null = null;
  private packetIdCounter = 1;
  private recvBuffer: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  private disposed = false;
  private isConnAcked = false;
  private processedIds: Set<string>;
  private pendingInboxByTarget: Record<string, RoomEventEnvelope[]> = {};
  private latestSnapshot: LiveFarmSnapshot | null = null;

  constructor(callbacks: RoomSyncCallbacks) {
    this.callbacks = callbacks;
    this.deviceId = getOrCreateDeviceId();
    this.processedIds = loadProcessedEventIds();
  }

  getDeviceId(): string {
    return this.deviceId;
  }

  connect(roomCode: string) {
    const clean = roomCode.trim().toUpperCase();
    if (!clean) return;
    if (this.roomCode === clean && this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.roomCode = clean;
    this.disposed = false;
    this.openSocket();
  }

  disconnect() {
    this.disposed = true;
    this.cleanupSocket();
    this.callbacks.onStatusChange('idle');
  }

  private cleanupSocket() {
    this.isConnAcked = false;
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pingTimer !== null) {
      window.clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.connectTimeout !== null) {
      window.clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }
    if (this.ws) {
      try {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
        this.ws.onclose = null;
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }
    this.recvBuffer = new Uint8Array(0);
  }

  private openSocket() {
    if (this.disposed || !this.roomCode || typeof WebSocket === 'undefined') return;
    this.cleanupSocket();
    this.callbacks.onStatusChange('connecting');

    const brokerUrl = BROKERS[this.brokerIndex % BROKERS.length];
    let ws: WebSocket;
    try {
      ws = new WebSocket(brokerUrl, 'mqtt');
      ws.binaryType = 'arraybuffer';
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws = ws;

    this.connectTimeout = window.setTimeout(() => {
      if (!this.isConnAcked && this.ws === ws) {
        this.brokerIndex = (this.brokerIndex + 1) % BROKERS.length;
        this.scheduleReconnect(1500);
      }
    }, 6500);

    ws.onopen = () => {
      if (this.disposed || this.ws !== ws) return;
      const clientId = `ch_${this.deviceId}_${Math.random().toString(36).slice(2, 6)}`;
      ws.send(buildConnectPacket(clientId));
    };

    ws.onmessage = (event) => {
      if (this.disposed || this.ws !== ws) return;
      if (event.data instanceof ArrayBuffer) {
        const chunk = new Uint8Array(event.data);
        this.recvBuffer = concatBytes(this.recvBuffer, chunk);
        this.drainPackets();
      }
    };

    ws.onerror = () => {
      if (this.disposed || this.ws !== ws) return;
      this.brokerIndex = (this.brokerIndex + 1) % BROKERS.length;
      this.scheduleReconnect(3500);
    };

    ws.onclose = () => {
      if (this.disposed || this.ws !== ws) return;
      this.isConnAcked = false;
      this.callbacks.onStatusChange('offline');
      this.scheduleReconnect(4000);
    };
  }

  private scheduleReconnect(delayMs = 3500) {
    if (this.disposed) return;
    this.cleanupSocket();
    this.callbacks.onStatusChange('offline');
    this.reconnectTimer = window.setTimeout(() => {
      this.openSocket();
    }, delayMs);
  }

  private drainPackets() {
    let offset = 0;
    while (offset + 2 <= this.recvBuffer.length) {
      const firstByte = this.recvBuffer[offset];
      let multiplier = 1;
      let remainingLength = 0;
      let lengthBytes = 0;
      let incomplete = false;

      while (true) {
        if (offset + 1 + lengthBytes >= this.recvBuffer.length) {
          incomplete = true;
          break;
        }
        const encodedByte = this.recvBuffer[offset + 1 + lengthBytes];
        remainingLength += (encodedByte & 127) * multiplier;
        lengthBytes++;
        if ((encodedByte & 128) === 0) break;
        multiplier *= 128;
        if (lengthBytes > 4) {
          this.recvBuffer = new Uint8Array(0);
          return;
        }
      }

      if (incomplete) break;

      const totalPacketLen = 1 + lengthBytes + remainingLength;
      if (offset + totalPacketLen > this.recvBuffer.length) break;

      const packetBody = this.recvBuffer.slice(offset + 1 + lengthBytes, offset + totalPacketLen);
      this.handlePacket(firstByte, packetBody);
      offset += totalPacketLen;
    }

    if (offset > 0) {
      this.recvBuffer = this.recvBuffer.slice(offset);
    }
  }

  private handlePacket(headerByte: number, body: Uint8Array) {
    const packetType = (headerByte >> 4) & 0x0f;

    // CONNACK
    if (packetType === 2) {
      if (body.length >= 2 && body[1] === 0) {
        this.isConnAcked = true;
        if (this.connectTimeout !== null) {
          window.clearTimeout(this.connectTimeout);
          this.connectTimeout = null;
        }
        this.callbacks.onStatusChange('connected');
        this.subscribeRoomTopics();
        this.startKeepAlive();
        if (this.latestSnapshot) {
          this.publishSnapshot(this.latestSnapshot);
        }
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          for (const [targetId, queue] of Object.entries(this.pendingInboxByTarget)) {
            if (queue.length > 0) {
              const topic = `${TOPIC_PREFIX}/${this.roomCode}/inbox/${targetId}`;
              this.ws.send(buildPublishPacket(topic, JSON.stringify(queue), true));
            }
          }
        }
      } else {
        this.brokerIndex = (this.brokerIndex + 1) % BROKERS.length;
        this.scheduleReconnect(3000);
      }
      return;
    }

    // PUBLISH
    if (packetType === 3) {
      if (body.length < 2) return;
      const topicLen = (body[0] << 8) | body[1];
      let cursor = 2 + topicLen;
      if (cursor > body.length) return;
      const topic = textDecoder.decode(body.slice(2, cursor));
      const qos = (headerByte >> 1) & 0x03;
      if (qos > 0) {
        cursor += 2; // Skip 2-byte Packet Identifier
      }
      if (cursor > body.length) return;
      const payloadStr = textDecoder.decode(body.slice(cursor));
      this.handleTopicMessage(topic, payloadStr);
    }
  }

  private subscribeRoomTopics() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.roomCode) return;
    const pid = this.packetIdCounter++;
    const stateTopic = `${TOPIC_PREFIX}/${this.roomCode}/state/+`;
    const inboxTopic = `${TOPIC_PREFIX}/${this.roomCode}/inbox/${this.deviceId}`;
    this.ws.send(buildSubscribePacket(pid, [stateTopic, inboxTopic]));
  }

  private startKeepAlive() {
    if (this.pingTimer !== null) window.clearInterval(this.pingTimer);
    this.pingTimer = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN && this.isConnAcked) {
        this.ws.send(new Uint8Array([0xc0, 0x00])); // PINGREQ
      }
    }, 20000);
  }

  private handleTopicMessage(topic: string, payloadStr: string) {
    if (!payloadStr) return;
    const statePrefix = `${TOPIC_PREFIX}/${this.roomCode}/state/`;
    const inboxPrefix = `${TOPIC_PREFIX}/${this.roomCode}/inbox/`;

    if (topic.startsWith(statePrefix)) {
      const senderDevId = topic.slice(statePrefix.length);
      if (!senderDevId || senderDevId === this.deviceId) return;
      try {
        const snap = JSON.parse(payloadStr) as LiveFarmSnapshot;
        if (snap && Array.isArray(snap.pigs)) {
          this.callbacks.onPartnerSnapshot({ ...snap, deviceId: senderDevId }, senderDevId);
        }
      } catch {
        // ignore malformed payload
      }
      return;
    }

    if (topic === `${inboxPrefix}${this.deviceId}`) {
      try {
        const list = JSON.parse(payloadStr) as RoomEventEnvelope[];
        if (!Array.isArray(list)) return;
        let changed = false;
        for (const ev of list) {
          if (!ev || !ev.id || ev.fromDeviceId === this.deviceId) continue;
          if (this.processedIds.has(ev.id)) continue;
          this.processedIds.add(ev.id);
          changed = true;
          this.callbacks.onIncomingEvent(ev);
        }
        if (changed) {
          saveProcessedEventIds(this.processedIds);
        }
      } catch {
        // ignore
      }
    }
  }

  publishSnapshot(snapshot: LiveFarmSnapshot) {
    const withDevice: LiveFarmSnapshot = { ...snapshot, deviceId: this.deviceId };
    this.latestSnapshot = withDevice;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isConnAcked || !this.roomCode) {
      return;
    }
    const topic = `${TOPIC_PREFIX}/${this.roomCode}/state/${this.deviceId}`;
    this.ws.send(buildPublishPacket(topic, JSON.stringify(withDevice), true));
  }

  sendEventToPartner(
    partnerDeviceId: string | undefined,
    msg: Exclude<P2PMessage, { type: 'FARM_SYNC' }>
  ): boolean {
    if (!partnerDeviceId || !this.roomCode) return false;
    const envelope: RoomEventEnvelope = {
      id: `ev_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`,
      ts: Date.now(),
      fromDeviceId: this.deviceId,
      msg,
    };
    const prevList = this.pendingInboxByTarget[partnerDeviceId] || [];
    const nextList = [...prevList.slice(-11), envelope];
    this.pendingInboxByTarget[partnerDeviceId] = nextList;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isConnAcked) {
      return false;
    }
    const topic = `${TOPIC_PREFIX}/${this.roomCode}/inbox/${partnerDeviceId}`;
    this.ws.send(buildPublishPacket(topic, JSON.stringify(nextList), true));
    return true;
  }
}
