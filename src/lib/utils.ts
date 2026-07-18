export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

export function timeUntil(iso: string): { label: string; tone: 'soon' | 'upcoming' | 'past' } {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = t - now;
  if (diff < 0) return { label: 'Ended', tone: 'past' };
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    const hours = Math.floor(diff / 3600000);
    if (hours === 0) {
      const mins = Math.max(1, Math.floor(diff / 60000));
      return { label: `Starts in ${mins}m`, tone: 'soon' };
    }
    return { label: `Starts in ${hours}h`, tone: 'soon' };
  }
  if (days <= 7) return { label: `In ${days}d`, tone: 'soon' };
  return { label: `In ${days}d`, tone: 'upcoming' };
}

export function categoryColor(category: string): { bg: string; text: string; ring: string } {
  switch (category) {
    case 'Technical':
      return { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200' };
    case 'Cultural':
      return { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200' };
    case 'Sports':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' };
    case 'Workshop':
      return { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' };
    default:
      return { bg: 'bg-ink-100', text: 'text-ink-700', ring: 'ring-ink-200' };
  }
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function classNames(...c: (string | false | undefined | null)[]): string {
  return c.filter(Boolean).join(' ');
}
