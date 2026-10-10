export interface ResetCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  progressPercent: number;
  nextResetFormatted: string;
}

export function getNextResetDate(fromDate: Date = new Date()): Date {
  const nextReset = new Date(fromDate);
  nextReset.setHours(5, 0, 0, 0);

  const currentDay = fromDate.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  let daysUntilWednesday = (3 - currentDay + 7) % 7;

  if (daysUntilWednesday === 0 && fromDate.getTime() >= nextReset.getTime()) {
    daysUntilWednesday = 7;
  }

  nextReset.setDate(fromDate.getDate() + daysUntilWednesday);
  return nextReset;
}

export function getLastResetDate(fromDate: Date = new Date()): Date {
  const nextReset = getNextResetDate(fromDate);
  const lastReset = new Date(nextReset);
  lastReset.setDate(lastReset.getDate() - 7);
  return lastReset;
}

export function getResetCountdown(now: Date = new Date()): ResetCountdown {
  const nextReset = getNextResetDate(now);
  const lastReset = getLastResetDate(now);

  const totalCycleMs = nextReset.getTime() - lastReset.getTime(); // 7 days
  const elapsedMs = Math.max(0, now.getTime() - lastReset.getTime());
  const diffMs = Math.max(0, nextReset.getTime() - now.getTime());

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  const progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalCycleMs) * 100));

  // Format date in Thai locale: e.g. วันพุธที่ 15 ต.ค. 05:00 น.
  const formatter = new Intl.DateTimeFormat('th-TH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    progressPercent,
    nextResetFormatted: formatter.format(nextReset),
  };
}
