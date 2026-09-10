import { Link } from 'react-router-dom';
import type { EventItem } from '../../../types/event';
import { getCategoryStyle } from '../utils/categoryStyles';

interface EventCardProps {
  event: EventItem;
}

export function EventCard({ event }: EventCardProps) {
  const seatsLeft = event.capacityTotal - event.capacityRegistered;
  const percentFull = (event.capacityRegistered / event.capacityTotal) * 100;
  const isFillingUp = seatsLeft < event.capacityTotal * 0.15;
  const style = getCategoryStyle(event.category);

  return (
    <Link
      to={`/events/${event.id}`}
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm
                 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      {/* banner */}
      <div className={`h-28 bg-gradient-to-br ${style.gradient} relative flex items-end p-4`}>
        <span className="absolute top-3 right-3 text-2xl">{style.icon}</span>
        <span className="text-white text-xs font-semibold bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">
          {event.category}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-gray-700">
          {event.name}
        </h3>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            📅 {event.date}
          </span>
          <span className="flex items-center gap-1">
            📍 {event.venue}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">{event.shortDescription}</p>

        {/* capacity bar */}
        <div className="mt-auto pt-2">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full bg-gradient-to-r ${style.gradient}`}
              style={{ width: `${percentFull}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            {event.isRegistered ? (
              <span className="text-xs font-semibold text-green-600">✓ Registered</span>
            ) : isFillingUp ? (
              <span className="text-xs font-semibold text-amber-600">Only {seatsLeft} seats left</span>
            ) : (
              <span className="text-xs text-gray-400">{seatsLeft} seats left</span>
            )}
            <span className={`text-xs font-semibold ${style.accent}`}>View details →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}