import { Link } from 'react-router-dom';
import { CreateEventForm } from '../features/events/components/CreateEventForm';

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5">
          <Link to="/events" className="text-sm font-medium text-[#64748B] transition hover:text-[#2563EB]">
            ← Back to events
          </Link>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-[#1E293B]">Create a new event</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Set up details, venue, capacity, and entry gates for your event.
            </p>
          </div>

          <CreateEventForm />
        </div>
      </div>
    </div>
  );
}