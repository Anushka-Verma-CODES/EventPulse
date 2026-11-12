
import type { EventItem, NewEventInput } from '../../../types/event';
import { getAuthHeaders } from '../../../lib/authApi';
import { API_BASE_URL } from '../../../lib/apiConfig';

type BackendEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  price: string;
  bannerImage: string | null;
  status: 'draft' | 'published' | 'cancelled';
  organizerId: string;
  createdAt: string;
  updatedAt: string;
};

type BackendRegistration = {
  id: string;
  attendeeId: string;
  eventId: string;
  registeredAt: string;
  qrToken: string | null;
  isCheckedIn: boolean;
  checkedInAt: string | null;
};

export type ScannerGate = {
  id: string;
  eventId: string;
  name: string;
  code: string;
  capacity: number | null;
  isActive: boolean;
};

export type ScannerEventAssignment = {
  id: string;
  eventId: string;
  scannerUserId: string;
  gateId: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  event?: BackendEvent;
  gate?: ScannerGate | null;
};

export type MyRegistration = BackendRegistration & {
  event: BackendEvent;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    const message = Array.isArray(error?.message)
      ? error.message.join(', ')
      : error?.message;

    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

function mapBackendEvent(event: BackendEvent): EventItem {
  const startDate = new Date(event.startDate);

  return {
    id: event.id,
    name: event.title,
    date: startDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    }),
    startDate: event.startDate,
    endDate: event.endDate,
    venue: event.location,
    category: event.category,
    shortDescription: event.description,
    fullDescription: event.description,
    capacityTotal: event.capacity,
    price: Number(event.price),
    capacityRegistered: 0,
    isRegistered: false,
    imageUrl: event.bannerImage || '/event-hero.png',
    gates: [],
  };
}

export async function getEvents(): Promise<EventItem[]> {
  const events = await request<BackendEvent[]>('/events');

  return events.map(mapBackendEvent);
}

export async function getMyEvents(): Promise<BackendEvent[]> {
  return request<BackendEvent[]>('/events/my-events');
}

export async function getMyScannerAssignments(): Promise<ScannerEventAssignment[]> {
  const assignments = await request<ScannerEventAssignment[]>(
    '/volunteers/scanner/me/events',
  );

  return assignments.filter(
    (assignment) => assignment.isActive && assignment.event,
  );
}

export async function getMyScannerEvents(): Promise<BackendEvent[]> {
  const assignments = await getMyScannerAssignments();

  return assignments.map(
    (assignment) => assignment.event as BackendEvent,
  );
}

export async function getEventById(
  eventId: string,
): Promise<EventItem | null> {
  try {
    const event = await request<BackendEvent>(`/events/${eventId}`);

    return mapBackendEvent(event);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }

    throw error;
  }
}

export async function registerForEvent(
  eventId: string,
): Promise<{ success: boolean; message?: string; registrationId?: string }> {
  try {
    const registration = await request<BackendRegistration>('/registrations', {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    });

    return {
      success: true,
      message: 'Successfully registered for this event.',
      registrationId: registration.id,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to register for this event.',
    };
  }
}

export async function registerPurchasedTicket(
  eventId: string,
): Promise<{ success: boolean; message?: string }> {
  return registerForEvent(eventId);
}

export async function getMyRegistrations(): Promise<MyRegistration[]> {
  return request<MyRegistration[]>('/registrations/my-registrations');
}

export async function createEvent(
  input: NewEventInput,
): Promise<EventItem> {
  if (
    !input.startDate ||
    !input.endDate ||
    !input.startTime ||
    !input.endTime
  ) {
    throw new Error('Please provide the event start and end dates and times.');
  }

  const startDate = new Date(
    `${input.startDate}T${input.startTime}:00`,
  );

  const endDate = new Date(
    `${input.endDate}T${input.endTime}:00`,
  );

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    throw new Error('Please provide valid event dates and times.');
  }

  if (endDate <= startDate) {
    throw new Error('Event end date and time must be after the start date and time.');
  }

  const created = await request<BackendEvent>('/events', {
    method: 'POST',
    body: JSON.stringify({
      title: input.name.trim(),
      description: input.fullDescription.trim(),
      category: input.category,
      location: input.venue.trim(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      capacity: input.capacityTotal,
      price: input.price,
      bannerImage: input.bannerImage,
    }),
  });

  return mapBackendEvent(created);
}
