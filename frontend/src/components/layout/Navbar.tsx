import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/events',    label: 'Events' },
  { to: '/ticket',    label: 'My Ticket' },
  { to: '/dashboard', label: 'Dashboard' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'all 0.2s ease',
        background: scrolled ? 'rgba(0, 0, 0, 0.96)' : '#000000',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #1f1f1f',
      }}
    >
      <nav
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/events"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}
        >
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            background: '#E50914',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                fill="white"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 800,
            fontSize: '18px',
            letterSpacing: '-0.02em',
            color: '#E50914',
            textTransform: 'uppercase',
          }}>
            Event<span style={{ color: '#FFFFFF' }}>Pulse</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'center' }}
             className="hidden-mobile">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                padding: '5px 12px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                color: isActive ? '#FFFFFF' : '#888888',
                background: isActive ? '#171717' : 'transparent',
                border: isActive ? '1px solid #262626' : '1px solid transparent',
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}
             className="hidden-mobile">
          <Link
            to="/login"
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#d4d4d4',
              border: '1px solid #262626',
              textDecoration: 'none',
              background: '#121212',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#ffffff';
              (e.currentTarget as HTMLElement).style.borderColor = '#404040';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = '#d4d4d4';
              (e.currentTarget as HTMLElement).style.borderColor = '#262626';
            }}
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'white',
              background: '#E50914',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#B81D24';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#E50914';
            }}
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="show-mobile"
          style={{
            background: 'none',
            border: '1px solid #262626',
            borderRadius: '4px',
            padding: '6px 8px',
            cursor: 'pointer',
            color: '#ffffff',
            display: 'none',
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{
          borderTop: '1px solid #1f1f1f',
          background: '#000000',
          padding: '12px 24px 16px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? '#ffffff' : '#888888',
                  background: isActive ? '#171717' : 'transparent',
                })}
              >
                {label}
              </NavLink>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/login" style={{
              flex: 1, textAlign: 'center', padding: '8px',
              borderRadius: '4px', fontSize: '13px', fontWeight: 500,
              color: '#d4d4d4', border: '1px solid #262626', background: '#121212',
              textDecoration: 'none',
            }}>Sign in</Link>
            <Link to="/signup" style={{
              flex: 1, textAlign: 'center', padding: '8px',
              borderRadius: '4px', fontSize: '13px', fontWeight: 600,
              color: 'white', background: '#E50914',
              textDecoration: 'none',
            }}>Get Started</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
