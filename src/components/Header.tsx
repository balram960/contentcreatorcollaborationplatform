import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, LogOut, ShieldCheck, Ticket, User, Menu, X, ClipboardList } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../hooks/useAuth';
import { classNames, initials } from '../lib/utils';

export function Header() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItem = (to: string, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => {
        navigate(to);
        setMenuOpen(false);
      }}
      className="btn-ghost"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center transition hover:opacity-80">
            <Logo />
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1.5 sm:flex">
            {navItem('/', 'Events', <Ticket size={16} />)}
            {user && navItem('/my-registrations', 'My Registrations', <ClipboardList size={16} />)}
            {isAdmin && navItem('/admin', 'Admin', <ShieldCheck size={16} />)}
            {user ? (
              <div className="ml-1 flex items-center gap-2">
                <button
                  onClick={() => navigate('/my-registrations')}
                  className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-ink-800 transition hover:bg-ink-50"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                    {initials(profile?.full_name || user.email || 'U')}
                  </span>
                  <span className="hidden md:inline max-w-[140px] truncate">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                </button>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                  }}
                  className="btn-ghost"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="btn-primary ml-1">
                <LogIn size={16} /> Sign in
              </button>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-2 text-ink-700 hover:bg-ink-100 sm:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="space-y-1 border-t border-ink-100 py-3 sm:hidden">
            <button onClick={() => { navigate('/'); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100">
              <Ticket size={16} /> Events
            </button>
            {user && (
              <button onClick={() => { navigate('/my-registrations'); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100">
                <ClipboardList size={16} /> My Registrations
              </button>
            )}
            {isAdmin && (
              <button onClick={() => { navigate('/admin'); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100">
                <ShieldCheck size={16} /> Admin
              </button>
            )}
            {user ? (
              <div className="flex items-center justify-between rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                    {initials(profile?.full_name || user.email || 'U')}
                  </span>
                  <span className="text-sm font-semibold text-ink-800">{profile?.full_name || user.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={async () => {
                    await signOut();
                    setMenuOpen(false);
                    navigate('/');
                  }}
                  className={classNames('btn-ghost')}
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            ) : (
              <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="btn-primary mx-3 mt-2 w-[calc(100%-1.5rem)]">
                <LogIn size={16} /> Sign in
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
