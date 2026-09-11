import { Routes, Route } from 'react-router-dom';
import TicketPage from '../pages/TicketPage';
import EventsListPage from '../pages/EventsListPage';
import EventDetailsPage from '../pages/EventDetailsPage';
import CreateEventPage from '../pages/CreateEventPage';
import ProfilePage from '../pages/ProfilePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/ticket" element={<TicketPage />} />
      <Route path="/events" element={<EventsListPage />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/events/new" element={<CreateEventPage />} />
    </Routes>
  );
}