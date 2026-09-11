import { Link } from 'react-router-dom';
import { CreateEventForm } from '../features/events/components/CreateEventForm';

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-base-200 py-10 px-6">
      <div className="max-w-xl mx-auto">
        <Link to="/events" className="link link-hover text-sm text-base-content/60">
          ← Back to events
        </Link>

        <div className="card bg-base-100 shadow-sm border border-base-300 mt-4">
          <div className="card-body">
            <h1 className="card-title text-2xl mb-4">Create a new event</h1>
            <CreateEventForm />
          </div>
        </div>
      </div>
    </div>
  );
}