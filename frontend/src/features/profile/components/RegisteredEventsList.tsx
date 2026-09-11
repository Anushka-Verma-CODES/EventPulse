import { Link } from 'react-router-dom';
import type { EventItem } from '../../../types/event';

interface RegisteredEventsListProps {
  events: EventItem[];
}

export function RegisteredEventsList({ events }: RegisteredEventsListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center text-base-content/50 py-12">
        You haven't registered for any events yet.
        <div className="mt-3">
          <Link to="/events" className="link link-primary">Browse events →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => (
        <Link
          key={event.id}
          to={`/events/${event.id}`}
          className="card card-side bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow"
        >
          <figure className="w-32 shrink-0">
            <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
          </figure>
          <div className="card-body py-4">
            <h3 className="font-semibold">{event.name}</h3>
            <p className="text-sm text-base-content/60">{event.date} · {event.venue}</p>
            <span className="badge badge-success badge-sm w-fit mt-1">Registered</span>
          </div>
        </Link>
      ))}
    </div>
  );
}