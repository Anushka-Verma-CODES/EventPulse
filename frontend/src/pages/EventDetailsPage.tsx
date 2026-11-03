
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { EventItem } from '../types/event';

import {
  getEventById,
  registerForEvent,
} from '../features/events/api/eventsApi';

import TicketMarketplace from '../components/events/TicketMarketplace';

const categoryBadge: Record<string, string> = {
  'Tech Fest': 'bg-[#3B82F6] text-white',
  Workshop: 'bg-[#2563EB] text-white',
  Cultural: 'bg-[#93C5FD] text-[#1E3A8A]',
  Other: 'bg-[#6B7280] text-white',
};

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    getEventById(id)
      .then((data) => {
        setEvent(data ?? null);
      })
      .catch((error) => {
        console.error('Event request failed:', error);
        setEvent(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  async function handleRegister() {
    if (!event) return;

    setRegistering(true);

    try {
      const result = await registerForEvent(event.id);

      if (result.success) {
        setEvent({
          ...event,
          isRegistered: true,
          capacityRegistered: event.capacityRegistered + 1,
        });
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-20 flex justify-center">
        <span className="loading loading-spinner loading-lg text-[#3B82F6]"></span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mt-10 text-center text-[#EF4444]">
        Event not found
      </div>
    );
  }

  const seatsLeft = event.capacityTotal - event.capacityRegistered;

  const percentFull =
    event.capacityTotal > 0
      ? (event.capacityRegistered / event.capacityTotal) * 100
      : 0;

  const badgeClass =
    categoryBadge[event.category] ?? 'bg-[#6B7280] text-white';

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5">
          <Link
            to="/events"
            className="text-sm font-medium text-[#64748B] transition hover:text-[#2563EB]"
          >
            ← Back to events
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <figure className="h-56 w-full overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.name}
              className="h-full w-full object-cover"
            />
          </figure>

          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-[#1E293B]">
                {event.name}
              </h1>

              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}
              >
                {event.category}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm text-[#64748B]">
              <p>
                <span className="font-semibold text-[#334155]">
                  Starts:
                </span>{' '}
                {new Date(event.startDate).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                  timeZone: 'Asia/Kolkata',
                })}
              </p>

              <p>
                <span className="font-semibold text-[#334155]">
                  Ends:
                </span>{' '}
                {new Date(event.endDate).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                  timeZone: 'Asia/Kolkata',
                })}
              </p>

              <p>
                <span className="font-semibold text-[#334155]">
                  Venue:
                </span>{' '}
                {event.venue}
              </p>
            </div>

            <p className="mt-4 text-sm leading-7 text-[#475569]">
              {event.fullDescription}
            </p>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs text-[#94A3B8]">
                <span>{event.capacityRegistered} registered</span>
                <span>{seatsLeft} seats left</span>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full rounded-full bg-[#2563EB] transition-all"
                  style={{
                    width: `${Math.min(percentFull, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-6">
              {event.isRegistered ? (
                <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm font-medium text-[#166534]">
                  You&apos;re registered for this event
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering || seatsLeft <= 0}
                  className="w-full rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#93C5FD]"
                >
                  {registering
                    ? 'Registering…'
                    : seatsLeft <= 0
                      ? 'Fully booked'
                      : 'Register for this event'}
                </button>
              )}
            </div>

            <section className="mt-8 border-t border-[#E2E8F0] pt-6">
              <TicketMarketplace eventId={event.id} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
