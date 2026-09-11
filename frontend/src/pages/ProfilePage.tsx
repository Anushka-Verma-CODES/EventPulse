import { useEffect, useState } from 'react';
import type { User } from '../types/user';
import type { EventItem } from '../types/event';
import { getCurrentUser, getMyRegisteredEvents } from '../features/profile/api/profileApi';
import { ProfileHeader } from '../features/profile/components/ProfileHeader';
import { RegisteredEventsList } from '../features/profile/components/RegisteredEventsList';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCurrentUser(), getMyRegisteredEvents()]).then(([u, e]) => {
      setUser(u);
      setEvents(e);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-base-200 py-10 px-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <ProfileHeader user={user} />

        <div>
          <h2 className="text-lg font-semibold mb-3">My Registered Events</h2>
          <RegisteredEventsList events={events} />
        </div>
      </div>
    </div>
  );
}