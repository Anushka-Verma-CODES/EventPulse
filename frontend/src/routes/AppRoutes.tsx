import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import TicketPage from '../pages/TicketPage';
import EventsListPage from '../pages/EventsListPage';
import EventDetailsPage from '../pages/EventDetailsPage';
import CreateEventPage from '../pages/CreateEventPage';
import ProfilePage from '../pages/ProfilePage';
import Login from '../pages/auth/Login';
import HomePage from '../pages/HomePage';
import Signup from '../pages/auth/Signup';
import AttendeeLayout from '../components/layout/AttendeeLayout';
import Dashboard from '../pages/attendee/Dashboard';
import MyTickets from '../pages/attendee/MyTickets';
import Notifications from '../pages/attendee/Notifications';

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
      <Route path="/register" element={<Signup />} />

      {/* Attendee routes with their own layout */}
      <Route path="/attendee" element={<AttendeeLayout />}>
        <Route index element={<Navigate to="/attendee/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tickets" element={<MyTickets />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Existing pages keep the Navbar via MainLayout */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/ticket" element={<MainLayout><TicketPage /></MainLayout>} />
      <Route path="/events" element={<MainLayout><EventsListPage /></MainLayout>} />
      <Route path="/events/:id" element={<MainLayout><EventDetailsPage /></MainLayout>} />
      <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
      <Route path="/events/new" element={<MainLayout><CreateEventPage /></MainLayout>} />
    </Routes>
  );
}