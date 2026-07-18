import { CalendarX2 } from 'lucide-react';

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white/60 px-6 py-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-400">
        <CalendarX2 size={26} />
      </div>
      <h3 className="font-display text-base font-semibold text-ink-800">{title}</h3>
      {hint && <p className="mt-1 max-w-sm text-sm text-ink-500">{hint}</p>}
    </div>
  );
}
