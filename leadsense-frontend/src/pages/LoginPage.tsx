import { useState } from 'react';
import { Zap, Eye, EyeOff, LogIn } from 'lucide-react';
import { useLogin } from '../hooks/useAuth';

export function LoginPage() {
  const login = useLogin();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    login.mutate({ email: email.trim(), password });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg,#0a0a0f 0%,#0f172a 60%,#1e3a8a 100%)' }}
    >
      {/* Background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: 'rgba(37,99,235,.08)' }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full"
          style={{ background: 'rgba(37,99,235,.05)' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#fff',
            boxShadow: '0 4px 0 #0a0a0f, 0 24px 60px rgba(0,0,0,.5)',
          }}
        >
          {/* Header stripe */}
          <div
            className="px-8 py-7"
            style={{ background: 'linear-gradient(110deg,#0a0a0f,#1e3a8a)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
                  boxShadow: '0 3px 0 #1d4ed8, 0 6px 20px rgba(37,99,235,.4)',
                }}
              >
                <Zap size={20} color="#fff" />
              </div>
              <div>
                <h1 className="text-lg font-black text-white tracking-widest uppercase">
                  LeadSense
                </h1>
                <p className="text-xs font-medium" style={{ color: '#4b6ca8' }}>
                  CRM Platform
                </p>
              </div>
            </div>
            <h2 className="text-2xl font-black text-white">Welcome back</h2>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold mb-2 uppercase tracking-widest"
                style={{ color: '#64748b' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="input-3d"
                style={{ fontSize: 14 }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold mb-2 uppercase tracking-widest"
                style={{ color: '#64748b' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-3d"
                  style={{ fontSize: 14, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#a8a29e', background: 'none', border: 'none', cursor: 'pointer' }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={login.isPending}
              className="btn-3d btn-primary w-full"
              style={{ marginTop: 8, fontSize: 14, padding: '12px 0' }}
            >
              {login.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="spin rounded-full inline-block"
                    style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff' }}
                  />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn size={16} /> Sign In
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div
            className="px-8 py-4 text-center"
            style={{ borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}
          >
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              © 2026 Amantya Technologies · LeadSense CRM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
