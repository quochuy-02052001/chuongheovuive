/**
 * Vietnam Timezone & Daily Reset Service
 * Vietnam is fixed UTC+7 (Asia/Ho_Chi_Minh) with no daylight saving time.
 */

export interface VietnamClock {
  timeStr: string;       // "15:42:08"
  shortTime: string;     // "15:42"
  dateStr: string;       // "Thứ Năm, 13/11/2026"
  shortDate: string;     // "13/11"
  dateKey: string;       // "2026-11-13" (for day rollover detection)
  countdownToMidnight: string; // "08:17:52"
  secondsToMidnight: number;
}

export function getVietnamDateKey(timestamp: number = Date.now()): string {
  // 7 hours ahead of UTC in ms
  const vnMs = timestamp + 7 * 3600000;
  const vnDate = new Date(vnMs);
  const yyyy = vnDate.getUTCFullYear();
  const mm = String(vnDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(vnDate.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getVietnamClock(timestamp: number = Date.now()): VietnamClock {
  const vnMs = timestamp + 7 * 3600000;
  const vnDate = new Date(vnMs);

  const hh = String(vnDate.getUTCHours()).padStart(2, '0');
  const min = String(vnDate.getUTCMinutes()).padStart(2, '0');
  const ss = String(vnDate.getUTCSeconds()).padStart(2, '0');
  const timeStr = `${hh}:${min}:${ss}`;
  const shortTime = `${hh}:${min}`;

  const dd = String(vnDate.getUTCDate()).padStart(2, '0');
  const mm = String(vnDate.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = vnDate.getUTCFullYear();
  const dateKey = `${yyyy}-${mm}-${dd}`;
  const shortDate = `${dd}/${mm}`;

  const dayOfWeek = vnDate.getUTCDay();
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dateStr = `${dayNames[dayOfWeek]}, ${dd}/${mm}/${yyyy}`;

  // Milliseconds elapsed since Vietnam midnight
  const msSinceMidnight = (vnDate.getUTCHours() * 3600 + vnDate.getUTCMinutes() * 60 + vnDate.getUTCSeconds()) * 1000 + vnDate.getUTCMilliseconds();
  const msRemaining = Math.max(0, 86400000 - msSinceMidnight);
  const totalSecondsRemaining = Math.floor(msRemaining / 1000);

  const remH = Math.floor(totalSecondsRemaining / 3600);
  const remM = Math.floor((totalSecondsRemaining % 3600) / 60);
  const remS = totalSecondsRemaining % 60;
  const countdownToMidnight = `${String(remH).padStart(2, '0')}:${String(remM).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;

  return {
    timeStr,
    shortTime,
    dateStr,
    shortDate,
    dateKey,
    countdownToMidnight,
    secondsToMidnight: totalSecondsRemaining,
  };
}
