import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000)); // simulate
    setLoading(false);
    setError('Demo mode — backend not connected yet.');
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: '#000000',
      color: '#ffffff',
    }}
      className="auth-grid"
    >
      {/* ─── Left Panel — Minimal Brand ────────────────── */}
      <div style={{
        position: 'relative',
        background: '#0c0c0c',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px',
        borderRight: '1px solid #262626',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          {/* Logo */}
          <div style={{
            width: '48px', height: '48px', borderRadius: '6px',
            background: '#E50914',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
            </svg>
          </div>

          <h1 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '32px', fontWeight: 800,
            color: '#ffffff', lineHeight: 1.1,
            marginBottom: '12px', letterSpacing: '-0.02em',
          }}>
            Welcome back to{' '}
            <span style={{ color: '#E50914' }}>
              EventPulse
            </span>
          </h1>
          <p style={{ color: '#a3a3a3', fontSize: '14px', lineHeight: 1.6 }}>
            Manage events, track registrations, and scan tickets — all in one place.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '36px', textAlign: 'left' }}>
            {[
              'Instant QR ticket generation',
              'Real-time attendance tracking',
              'Volunteer check-in tools',
            ].map(item => (
              <div key={item} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '4px',
                background: '#121212',
                border: '1px solid #262626',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E50914', flexShrink: 0 }} />
                <span style={{ color: '#e5e5e5', fontSize: '13px', fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right Panel — Form ─────────────────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px',
        background: '#000000',
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <h2 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '24px', fontWeight: 800,
            color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.01em',
          }}>
            Sign In
          </h2>
          <p style={{ color: '#737373', fontSize: '14px', marginBottom: '28px' }}>
            New to EventPulse?{' '}
            <Link to="/signup" style={{ color: '#E50914', fontWeight: 600 }}>Sign up now</Link>
          </p>

          {/* Social buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <SocialButton icon={<GoogleIcon />} label="Google" onClick={() => {}} />
            <SocialButton icon={<GithubIcon />} label="GitHub" onClick={() => {}} />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '24px',
          }}>
            <div style={{ flex: 1, height: '1px', background: '#262626' }} />
            <span style={{ fontSize: '12px', color: '#737373', fontWeight: 500 }}>or continue with email</span>
            <div style={{ flex: 1, height: '1px', background: '#262626' }} />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '4px', marginBottom: '16px',
              background: 'rgba(229,9,20,0.1)', border: '1px solid #E50914',
              color: '#ffffff', fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField label="Email address">
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-base"
                autoComplete="email"
                required
              />
            </FormField>

            <FormField label="Password" action={
              <Link to="/forgot" style={{ fontSize: '12px', color: '#737373' }}>Forgot password?</Link>
            }>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base"
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: '#737373', cursor: 'pointer', padding: '2px',
                  }}
                >
                  {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </FormField>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                borderRadius: '4px', border: 'none',
                background: loading
                  ? '#525252'
                  : '#E50914',
                color: 'white', fontSize: '14px', fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginTop: '4px',
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#737373', marginTop: '28px' }}>
            By continuing, you agree to EventPulse's{' '}
            <Link to="/terms" style={{ color: '#a3a3a3' }}>Terms</Link> and{' '}
            <Link to="/privacy" style={{ color: '#a3a3a3' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .auth-grid {
            grid-template-columns: 1fr !important;
          }
          .auth-grid > div:first-child {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function FormField({
  label, children, action,
}: {
  label: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5' }}>{label}</label>
        {action}
      </div>
      {children}
    </div>
  );
}

function SocialButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        padding: '10px', borderRadius: '4px',
        background: '#121212',
        border: '1px solid #262626',
        color: '#e5e5e5', fontSize: '13px', fontWeight: 500,
        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#404040';
        (e.currentTarget as HTMLElement).style.color = '#ffffff';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#262626';
        (e.currentTarget as HTMLElement).style.color = '#e5e5e5';
      }}
    >
      {icon} {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

