import { Routes, Route } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import TicketPage from '../pages/TicketPage';
import EventsListPage from '../pages/EventsListPage';
import EventDetailsPage from '../pages/EventDetailsPage';
import CreateEventPage from '../pages/CreateEventPage';
import ProfilePage from '../pages/ProfilePage';
import Login from '../pages/auth/Login';

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* No Navbar on the login page */}
      <Route path="/login" element={<Login />} />

      {/* Existing pages keep the Navbar via MainLayout */}
      <Route path="/ticket" element={<MainLayout><TicketPage /></MainLayout>} />
      <Route path="/events" element={<MainLayout><EventsListPage /></MainLayout>} />
      <Route path="/events/:id" element={<MainLayout><EventDetailsPage /></MainLayout>} />
      <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
      <Route path="/events/new" element={<MainLayout><CreateEventPage /></MainLayout>} />
    </Routes>
  );
}