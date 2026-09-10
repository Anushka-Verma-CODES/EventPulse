import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { EventItem } from '../types/event';
import { getEventById, registerForEvent } from '../features/events/api/eventsApi';
import { getCategoryStyle } from '../features/events/utils/categoryStyles';

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

  if (loading) return <div className="text-center mt-10 text-gray-500">Loading event…</div>;
  if (!event) return <div className="text-center mt-10 text-red-500">Event not found</div>;

  const seatsLeft = event.capacityTotal - event.capacityRegistered;
  const percentFull = (event.capacityRegistered / event.capacityTotal) * 100;
  const style = getCategoryStyle(event.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* banner */}
      <div className={`h-56 bg-gradient-to-br ${style.gradient} relative flex items-end`}>
        <div className="max-w-3xl mx-auto w-full px-6 pb-6">
          <Link to="/events" className="text-white/80 text-sm hover:text-white">← Back to events</Link>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-3xl">{style.icon}</span>
            <h1 className="text-3xl font-bold text-white">{event.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-8 pb-12">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <span>📅 {event.date}</span>
            <span>📍 {event.venue}</span>
            <span className={`font-semibold ${style.accent}`}>{event.category}</span>
          </div>

          <p className="text-gray-700 leading-relaxed mb-8">{event.fullDescription}</p>

          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>{event.capacityRegistered} registered</span>
              <span>{seatsLeft} seats left</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${style.gradient}`}
                style={{ width: `${percentFull}%` }}
              />
            </div>
          </div>

          {event.isRegistered ? (
            <div className="text-center py-3 bg-green-50 text-green-700 rounded-lg font-semibold text-sm border border-green-200">
              ✓ You're registered for this event
            </div>
          ) : (
            <button
              onClick={handleRegister}
              disabled={registering || seatsLeft === 0}
              className={`w-full text-white rounded-lg py-3 text-sm font-semibold transition
                          bg-gradient-to-r ${style.gradient} hover:opacity-90
                          disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {registering ? 'Registering…' : seatsLeft === 0 ? 'Fully booked' : 'Register for this event'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}