import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { EventItem } from '../types/event';
import { getEventById, registerForEvent } from '../features/events/api/eventsApi';

const categoryBadge: Record<string, string> = {
  'Tech Fest': 'badge-primary',
  Workshop: 'badge-accent',
  Cultural: 'badge-secondary',
};

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!id) return;
    getEventById(id).then((data) => {
      setEvent(data ?? null);
      setLoading(false);
    });
  }, [id]);

  async function handleRegister() {
    if (!event) return;
    setRegistering(true);
    const result = await registerForEvent(event.id);
    if (result.success) {
      setEvent({ ...event, isRegistered: true, capacityRegistered: event.capacityRegistered + 1 });
    }
    setRegistering(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }
  if (!event) return <div className="text-center mt-10 text-error">Event not found</div>;

  const seatsLeft = event.capacityTotal - event.capacityRegistered;
  const percentFull = (event.capacityRegistered / event.capacityTotal) * 100;
  const badgeClass = categoryBadge[event.category] ?? 'badge-neutral';

  return (
    <div className="min-h-screen bg-base-200 py-10 px-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/events" className="link link-hover text-sm text-base-content/60">
          ← Back to events
        </Link>

        <div className="card bg-base-100 shadow-sm border border-base-300 mt-4">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <h1 className="card-title text-2xl">{event.name}</h1>
              <span className={`badge ${badgeClass}`}>{event.category}</span>
            </div>

            <p className="text-sm text-base-content/60 mb-4">
              {event.date} · {event.venue}
            </p>

            <p className="text-base-content/80 leading-relaxed mb-4">{event.fullDescription}</p>

            <div className="mb-2">
              <div className="flex justify-between text-xs text-base-content/50 mb-1">
                <span>{event.capacityRegistered} registered</span>
                <span>{seatsLeft} seats left</span>
              </div>
              <progress className="progress progress-primary w-full" value={percentFull} max={100} />
            </div>

            <div className="card-actions mt-4">
              {event.isRegistered ? (
                <div className="alert alert-success w-full">
                  <span>You're registered for this event</span>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering || seatsLeft === 0}
                  className="btn btn-primary w-full"
                >
                  {registering
                    ? 'Registering…'
                    : seatsLeft === 0
                    ? 'Fully booked'
                    : 'Register for this event'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}