import { CalendarDays } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  const icon = size === 'sm' ? 16 : size === 'lg' ? 26 : 20;
  const text = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dims} rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 grid place-items-center shadow-sm`}>
        <CalendarDays size={icon} className="text-sky-400" strokeWidth={2.5} />
      </div>
      <span className={`font-display font-extrabold tracking-tight ${text} text-ink-900`}>
        FEST<span className="text-sky-500">GO</span>
      </span>
    </div>
  );
}
