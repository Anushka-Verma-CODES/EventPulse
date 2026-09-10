import { Routes, Route } from 'react-router-dom';
import TicketPage from '../pages/TicketPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/ticket" element={<TicketPage />} />
    </Routes>
  );
}