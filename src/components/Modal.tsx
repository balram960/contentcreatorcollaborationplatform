import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxWidth?: string;
};

export function Modal({ open, onClose, children, title, maxWidth = 'max-w-lg' }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-up"
        onClick={onClose}
        style={{ animationDuration: '0.2s' }}
      />
      <div
        className={`relative z-10 w-full ${maxWidth} max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl animate-pop`}
      >
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white/95 px-5 py-4 backdrop-blur">
            <h3 className="font-display text-base font-bold text-ink-900">{title}</h3>
            <button onClick={onClose} className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900">
              <X size={18} />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-lg bg-white/90 p-1.5 text-ink-500 shadow-sm transition hover:bg-white hover:text-ink-900"
          >
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
