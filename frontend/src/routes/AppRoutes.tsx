import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import TicketPage from '../pages/TicketPage';
import EventsListPage from '../pages/EventsListPage';
import EventDetailsPage from '../pages/EventDetailsPage';
import CreateEventPage from '../pages/CreateEventPage';
import ProfilePage from '../pages/ProfilePage';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import HomePage from '../pages/HomePage';

import AttendeeLayout from '../components/layout/AttendeeLayout';
import Dashboard from '../pages/attendee/Dashboard';
import MyTickets from '../pages/attendee/MyTickets';
import Notifications from '../pages/attendee/Notifications';

import OrganizerLayout from '../components/layout/OrganizerLayout';
import OrganizerDashboard from '../pages/organizer/Dashboard';
import EventsList from '../pages/organizer/EventsList';
import EventDetail from '../pages/organizer/EventDetail';
import Attendees from '../pages/organizer/Attendees';
import LiveMonitoring from '../pages/organizer/LiveMonitoring';
import Volunteers from '../pages/organizer/Volunteers';
import Resources from '../pages/organizer/Resources';
import Incidents from '../pages/organizer/Incidents';
import Predictions from '../pages/organizer/Predictions';
import Reports from '../pages/organizer/Reports';

import VolunteerLayout from '../components/layout/VolunteerLayout';
import VolunteerDashboard from '../pages/volunteer/Dashboard';
import Opportunities from '../pages/volunteer/Opportunities';
import OpportunityDetail from '../pages/volunteer/OpportunityDetail';
import MyApplications from '../pages/volunteer/MyApplications';
import MyShifts from '../pages/volunteer/MyShifts';
import ShiftDetail from '../pages/volunteer/ShiftDetail';
import MyTasks from '../pages/volunteer/MyTasks';
import VolunteerNotifications from '../pages/volunteer/Notifications';

import ScannerLayout from '../components/layout/ScannerLayout';
import ScannerHome from '../pages/scanner/ScannerHome';
import SelectGate from '../pages/scanner/SelectGate';
import QRScannerPage from '../pages/scanner/QRScannerPage';
import ScanHistory from '../pages/scanner/ScanHistory';

import EventDetails from '../pages/EventDetails';
import AttendeeDetails from '../pages/registration/AttendeeDetails';
import AttendeePayment from '../pages/registration/AttendeePayment';
import RegistrationSuccess from '../pages/registration/RegistrationSuccess';
import VolunteerDetails from '../pages/registration/VolunteerDetails';
import VolunteerReview from '../pages/registration/VolunteerReview';
import VolunteerApplicationSuccess from '../pages/registration/VolunteerApplicationSuccess';

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
      {/* No Navbar on the login/signup pages */}
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

      {/* Organizer routes with their own layout */}
      <Route path="/organizer" element={<OrganizerLayout />}>
        <Route index element={<Navigate to="/organizer/dashboard" replace />} />
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="events" element={<EventsList />} />
        <Route path="events/create" element={<CreateEventPage />} />
        <Route path="events/:eventId" element={<EventDetail />} />
        <Route path="attendees" element={<Attendees />} />
        <Route path="monitoring" element={<LiveMonitoring />} />
        <Route path="volunteers" element={<Volunteers />} />
        <Route path="resources" element={<Resources />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="predictions" element={<Predictions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Volunteer routes with their own layout */}
      <Route path="/volunteer" element={<VolunteerLayout />}>
        <Route index element={<Navigate to="/volunteer/dashboard" replace />} />
        <Route path="dashboard" element={<VolunteerDashboard />} />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="opportunities/:opportunityId" element={<OpportunityDetail />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="shifts" element={<MyShifts />} />
        <Route path="shifts/:shiftId" element={<ShiftDetail />} />
        <Route path="tasks" element={<MyTasks />} />
        <Route path="notifications" element={<VolunteerNotifications />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route element={<ScannerLayout />}>
        <Route path="/scanner" element={<ScannerHome />} />
        <Route path="/scanner/event/:eventId" element={<SelectGate />} />
        <Route path="/scanner/event/:eventId/gate/:gateId" element={<QRScannerPage />} />
        <Route path="/scanner/history" element={<ScanHistory />} />
      </Route>


      {/* Existing pages keep the Navbar via MainLayout */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/ticket" element={<MainLayout><TicketPage /></MainLayout>} />
      <Route path="/events" element={<MainLayout><EventsListPage /></MainLayout>} />
      {/* <Route path="/events/:id" element={<MainLayout><EventDetailsPage /></MainLayout>} /> */}
      <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
      <Route path="/events/new" element={<MainLayout><CreateEventPage /></MainLayout>} />

      {/* Event details + attendee/volunteer registration flow */}
      <Route path="/events/:eventId" element={<MainLayout><EventDetails /></MainLayout>} />
      <Route path="/events/:eventId/register/attendee" element={<MainLayout><AttendeeDetails /></MainLayout>} />
      <Route path="/events/:eventId/register/attendee/payment" element={<MainLayout><AttendeePayment /></MainLayout>} />
      <Route path="/events/:eventId/registration-success" element={<MainLayout><RegistrationSuccess /></MainLayout>} />
      <Route path="/events/:eventId/register/volunteer" element={<MainLayout><VolunteerDetails /></MainLayout>} />
      <Route path="/events/:eventId/register/volunteer/review" element={<MainLayout><VolunteerReview /></MainLayout>} />
      <Route path="/events/:eventId/volunteer/application-success" element={<MainLayout><VolunteerApplicationSuccess /></MainLayout>} />
    </Routes>
  );
}
