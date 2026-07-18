import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles, TrendingUp } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { EventGrid } from '../components/EventGrid';
import { EmptyState } from '../components/EmptyState';
import { CATEGORIES } from '../lib/supabase';
import { classNames } from '../lib/utils';

export function HomePage() {
  const navigate = useNavigate();
  const { events, loading, error } = useEvents();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchCat = category === 'All' || e.category === category;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        (e.description ?? '').toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [events, query, category]);

  const upcomingCount = events.filter((e) => new Date(e.event_date).getTime() > Date.now()).length;
  const totalRegistrations = events.reduce((s, e) => s + e.registration_count, 0);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-100 bg-ink-950">
        <div className="absolute inset-0 bg-grid opacity-[0.15]" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <span className="chip ring-1 ring-white/15 bg-white/5 text-sky-300">
              <Sparkles size={13} />
              College Fest Management System
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-white text-balance sm:text-5xl">
              One platform to <span className="text-sky-400">organize</span>, discover &amp; register for college events.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-300 sm:text-lg">
              FESTGO replaces paperwork and manual registration with a centralized digital workflow — admins create
              events, students explore the lineup, and participants register in seconds.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#events" className="btn-accent">
                <TrendingUp size={16} />
                Browse Events
              </a>
              <a href="#stats" className="btn-outline border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/20">
                How it works
              </a>
            </div>
          </div>

          {/* Stats */}
          <div id="stats" className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Stat label="Total Events" value={events.length} />
            <Stat label="Upcoming" value={upcomingCount} />
            <Stat label="Registrations" value={totalRegistrations} />
            <Stat label="Categories" value={CATEGORIES.length} />
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900">Explore Events</h2>
            <p className="mt-1 text-sm text-ink-500">Find an event, view details, and register your spot.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, venues..."
                className="input pl-9 sm:w-64"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <SlidersHorizontal size={14} className="shrink-0 text-ink-400" />
              {['All', ...CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={classNames(
                    'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition',
                    category === c
                      ? 'bg-ink-900 text-white'
                      : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Failed to load events: {error}
          </div>
        )}

        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No events match your filters"
            hint="Try a different category or clear your search to see all events."
          />
        ) : (
          <EventGrid events={filtered} onSelect={(id) => navigate(`/event/${id}`)} />
        )}
      </section>

      {/* Features */}
      <section className="border-t border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Feature
              title="For Organizers"
              desc="Create events, set capacity, and track registrations in real time from a single admin dashboard."
              step="01"
            />
            <Feature
              title="For Students"
              desc="Browse the fest lineup, filter by category, and view full event details with one click."
              step="02"
            />
            <Feature
              title="For Participants"
              desc="Register for events in seconds with instant confirmation and live spot availability."
              step="03"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-100 bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-ink-500 sm:px-6 lg:px-8">
          FESTGO · College Fest Management System · Built with React, Supabase &amp; Express-style data layer.
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
      <div className="font-display text-2xl font-extrabold text-white">{value}</div>
      <div className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</div>
    </div>
  );
}

function Feature({ title, desc, step }: { title: string; desc: string; step: string }) {
  return (
    <div className="card p-5">
      <div className="mb-3 inline-grid h-9 w-9 place-items-center rounded-lg bg-sky-50 font-display text-sm font-bold text-sky-600">
        {step}
      </div>
      <h3 className="font-display text-base font-bold text-ink-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{desc}</p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="h-44 w-full animate-pulse bg-ink-100" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-ink-100" />
            <div className="h-3 w-full animate-pulse rounded bg-ink-100" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-ink-100" />
            <div className="h-1.5 w-full animate-pulse rounded-full bg-ink-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
