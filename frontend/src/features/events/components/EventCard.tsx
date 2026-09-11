import { Link } from 'react-router-dom';
import type { EventItem } from '../../../types/event';

interface EventCardProps {
  event: EventItem;
}

const categoryBadge: Record<string, string> = {
  'Tech Fest': 'badge-primary',
  Workshop: 'badge-accent',
  Cultural: 'badge-secondary',
};

export function EventCard({ event }: EventCardProps) {
  const seatsLeft = event.capacityTotal - event.capacityRegistered;
  const percentFull = (event.capacityRegistered / event.capacityTotal) * 100;
  const isFillingUp = seatsLeft < event.capacityTotal * 0.15;
  const badgeClass = categoryBadge[event.category] ?? 'badge-neutral';

  return (
    <Link to={`/events/${event.id}`} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-300">
      <div className="card-body gap-3">
        <div className="flex justify-between items-start">
          <h3 className="card-title text-base">{event.name}</h3>
          <span className={`badge ${badgeClass} badge-sm`}>{event.category}</span>
        </div>

        <p className="text-sm text-base-content/60">
          {event.date} · {event.venue}
        </p>

        <p className="text-sm text-base-content/80 line-clamp-2">{event.shortDescription}</p>

        <progress
          className="progress progress-primary w-full"
          value={percentFull}
          max={100}
        />

        <div className="flex justify-between items-center">
          {event.isRegistered ? (
            <span className="badge badge-success badge-sm">Registered</span>
          ) : isFillingUp ? (
            <span className="text-xs text-warning font-medium">{seatsLeft} seats left</span>
          ) : (
            <span className="text-xs text-base-content/50">{seatsLeft} seats left</span>
          )}
          <span className="text-sm font-medium text-primary">View details →</span>
        </div>
      </div>
    </Link>
  );
}