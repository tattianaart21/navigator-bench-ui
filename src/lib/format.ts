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

export function durationBetween(start: string, end: string | null): string {
  if (!end) return "—";
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  const sec = Math.round((b - a) / 1000);
  if (sec < 60) return `${sec} с`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m} мин ${s} с`;
}
