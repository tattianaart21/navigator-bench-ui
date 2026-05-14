export function formatIso(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      dateStyle: "short",
      timeStyle: "medium",
    });
  } catch {
    return iso;
  }
}

export function durationBetween(start: string | null, end: string | null): string {
  if (!start || !end) return "—";
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  const sec = Math.round((b - a) / 1000);
  if (sec < 60) return `${sec} с`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m} мин ${s} с`;
}

/** Длительность от старта до текущего момента (для запуска «В работе»). */
export function durationSince(start: string | null): string {
  if (!start) return "—";
  const sec = Math.max(0, Math.round((Date.now() - new Date(start).getTime()) / 1000));
  if (sec < 60) return `${sec} с`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m} мин ${s} с`;
}

/** Длительность выполнения в секундах (для графиков). */
export function durationSeconds(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const sec = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000);
  return Number.isFinite(sec) && sec >= 0 ? sec : null;
}
