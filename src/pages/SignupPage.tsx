import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/Logo';

export function SignupPage() {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email.trim(), form.password, form.full_name.trim());
    if (error) {
      setLoading(false);
      setError(error);
      return;
    }
    // Email confirmation is OFF — sign in immediately
    const { error: signInError } = await signIn(form.email.trim(), form.password);
    setLoading(false);
    if (signInError) {
      setSuccess(true);
      setError(null);
      return;
    }
    navigate('/');
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-ink-950 px-4 py-12">
      <div className="absolute inset-0 bg-grid opacity-[0.15]" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" />
        </div>
        <div className="card p-7">
          <h1 className="font-display text-xl font-bold text-ink-900">Create your account</h1>
          <p className="mt-1 text-sm text-ink-500">Join FESTGO to register for college fest events.</p>

          {success ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 size={16} />
                Account created!
              </div>
              <p className="mt-1">
                You can now{' '}
                <Link to="/login" className="font-semibold underline">
                  sign in
                </Link>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="label">Full name</label>
                <div className="relative">
                  <User size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    required
                    className="input pl-9"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="e.g. Aisha Khan"
                    autoComplete="name"
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="email"
                    required
                    className="input pl-9"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@college.edu"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      type="password"
                      required
                      className="input pl-9"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min 6 characters"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Confirm</label>
                  <div className="relative">
                    <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      type="password"
                      required
                      className="input pl-9"
                      value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-accent w-full">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                Create account
              </button>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-ink-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">
              Sign in
            </Link>
          </p>
        </div>
        <p className="mt-4 text-center text-xs text-ink-400">
          The first account you sign up with becomes the admin.
        </p>
      </div>
    </div>
  );
}
