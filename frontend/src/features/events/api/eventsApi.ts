
import type { EventItem, NewEventInput } from '../../../types/event';
import { getAuthHeaders } from '../../../lib/authApi';

const API_BASE_URL = 'http://localhost:3000';

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
): Promise<{ success: boolean; message?: string }> {
  try {
    await request<BackendRegistration>('/registrations', {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    });

    return {
      success: true,
      message: 'Successfully registered for this event.',
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
  if (!input.date || !input.startTime || !input.endTime) {
    throw new Error(
      'Please provide the event date, start time, and end time.',
    );
  }

  const startDate = new Date(`${input.date}T${input.startTime}:00`);
  const endDate = new Date(`${input.date}T${input.endTime}:00`);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    throw new Error('Please provide a valid event date and time.');
  }

  if (endDate <= startDate) {
    throw new Error('End time must be later than start time.');
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
      price: 0,
      bannerImage: null,
    }),
  });

  return mapBackendEvent(created);
}
