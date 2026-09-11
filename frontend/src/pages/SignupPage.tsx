import { useState } from 'react';
import { Link } from 'react-router-dom';

type Role = 'student' | 'organizer';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
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
      {/* ─── Left Panel — Brand ─────────────────────────────────── */}
      <div style={{
        position: 'relative',
        background: '#0c0c0c',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px',
        borderRight: '1px solid #262626',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
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
            fontFamily: 'Inter, sans-serif', fontSize: '32px', fontWeight: 800,
            color: '#ffffff', lineHeight: 1.1, marginBottom: '12px', letterSpacing: '-0.02em',
          }}>
            Join{' '}
            <span style={{ color: '#E50914' }}>
              EventPulse
            </span>
          </h1>
          <p style={{ color: '#a3a3a3', fontSize: '14px', lineHeight: 1.6 }}>
            Whether you're attending or organizing — EventPulse has you covered.
          </p>

          {/* Role badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '36px' }}>
            <RoleFeatureCard
              title="Students"
              desc="Register for events and access digital pass"
            />
            <RoleFeatureCard
              title="Organizers"
              desc="Create events, track attendance & volunteers"
            />
          </div>
        </div>
      </div>

      {/* ─── Right Panel — Form ─────────────────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px',
        background: '#000000',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <h2 style={{
            fontFamily: 'Inter, sans-serif', fontSize: '24px', fontWeight: 800,
            color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.01em',
          }}>
            Create Your Account
          </h2>
          <p style={{ color: '#737373', fontSize: '14px', marginBottom: '28px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#E50914', fontWeight: 600 }}>Sign in</Link>
          </p>

          {/* Role Selector */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', display: 'block', marginBottom: '10px' }}>
              Account Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <RoleButton
                selected={role === 'student'}
                onClick={() => setRole('student')}
                label="Student"
                desc="Attending events"
                id="role-student"
              />
              <RoleButton
                selected={role === 'organizer'}
                onClick={() => setRole('organizer')}
                label="Organizer"
                desc="Creating events"
                id="role-organizer"
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '4px', marginBottom: '16px',
              background: 'rgba(229,9,20,0.1)', border: '1px solid #E50914',
              color: '#ffffff', fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', display: 'block', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Rohan Mehta"
                className="input-base"
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', display: 'block', marginBottom: '6px' }}>
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="input-base"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="signup-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="input-base"
                  autoComplete="new-password"
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
                    color: '#737373', cursor: 'pointer',
                  }}
                >
                  {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {/* Password strength bar */}
              {password.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ height: '3px', borderRadius: '99px', background: '#262626', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '99px',
                      width: `${Math.min((password.length / 16) * 100, 100)}%`,
                      background: password.length < 6
                        ? '#E50914' : password.length < 10
                        ? '#d97706' : '#22c55e',
                      transition: 'width 0.3s, background 0.3s',
                    }} />
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: password.length < 6 ? '#E50914' : password.length < 10 ? '#d97706' : '#22c55e',
                    marginTop: '4px', display: 'block',
                  }}>
                    {password.length < 6 ? 'Weak' : password.length < 10 ? 'Moderate' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px', borderRadius: '4px', border: 'none',
                background: loading ? '#525252' : '#E50914',
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
                  Creating account…
                </>
              ) : `Join as ${role === 'student' ? 'Student' : 'Organizer'}`}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#737373', marginTop: '20px' }}>
            By signing up, you agree to our{' '}
            <Link to="/terms" style={{ color: '#a3a3a3' }}>Terms</Link> and{' '}
            <Link to="/privacy" style={{ color: '#a3a3a3' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .auth-grid > div:first-child { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function RoleButton({
  selected, onClick, label, desc, id,
}: {
  selected: boolean; onClick: () => void;
  label: string; desc: string; id: string;
}) {
  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      style={{
        padding: '12px', borderRadius: '4px',
        border: selected ? '1px solid #E50914' : '1px solid #262626',
        background: selected ? '#171717' : '#121212',
        cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: 600, color: selected ? '#ffffff' : '#a3a3a3' }}>{label}</div>
      <div style={{ fontSize: '11px', color: selected ? '#a3a3a3' : '#737373', marginTop: '2px' }}>{desc}</div>
    </button>
  );
}

function RoleFeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{
      padding: '16px', borderRadius: '4px',
      background: '#121212',
      border: '1px solid #262626',
      textAlign: 'left',
    }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: '#a3a3a3', lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
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

