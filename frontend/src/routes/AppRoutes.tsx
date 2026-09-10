import { Routes, Route } from 'react-router-dom';
import TicketPage from '../pages/TicketPage';
import EventsListPage from '../pages/EventsListPage';
import EventDetailsPage from '../pages/EventDetailsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/ticket" element={<TicketPage />} />
      <Route path="/events" element={<EventsListPage />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />
    </Routes>
  );
}