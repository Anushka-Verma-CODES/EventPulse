import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { CreateEventForm } from '../features/events/components/CreateEventForm';

export default function CreateEventPage() {
  const bgRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!bgRef.current) return;
    const rect = bgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    bgRef.current.style.setProperty('--spot-x', `${x}%`);
    bgRef.current.style.setProperty('--spot-y', `${y}%`);
  }

  return (
    <div
      ref={bgRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden bg-base-200 py-10 px-6"
    >
      {/* animated blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="blob blob-primary" />
        <div className="blob blob-accent" />
        <div className="blob blob-secondary" />
        {/* mouse-tracked spotlight */}
        <div className="spotlight" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto">
        <Link to="/events" className="link link-hover text-sm text-base-content/60">
          ← Back to events
        </Link>

        <div className="card bg-base-100/90 backdrop-blur-sm shadow-lg border border-base-300 mt-4">
          <div className="card-body">
            <h1 className="card-title text-2xl mb-4">Create a new event</h1>
            <CreateEventForm />
          </div>
        </div>
      </div>

    <style>{`
  .blob {
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.35;
    animation: drift 18s ease-in-out infinite;
  }
  .blob-primary {
    background: #C98A3E;
    top: -100px;
    left: -80px;
    animation-delay: 0s;
  }
  .blob-accent {
    background: #8B5A2B;
    bottom: -120px;
    right: -60px;
    animation-delay: 4s;
  }
  .blob-secondary {
    background: #D9B26A;
    top: 40%;
    left: 55%;
    animation-delay: 8s;
  }
  @keyframes drift {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(40px, -30px) scale(1.08); }
    66% { transform: translate(-30px, 30px) scale(0.95); }
  }
  .spotlight {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      300px circle at var(--spot-x, 50%) var(--spot-y, 50%),
      rgba(201, 138, 62, 0.15),
      transparent 70%
    );
    transition: background 0.15s ease;
  }
`}</style>
    </div>
  );
}