
import { getAuthHeaders } from '../../../lib/authApi';

export type TicketPaymentMethod =
  | 'UPI'
  | 'Credit / Debit Card'
  | 'Bank Transfer';

export interface TicketListing {
  id: string;
  eventId: string;
  ticketCode: string;
  sellerName: string;
  price: number;
  paymentMethod: TicketPaymentMethod;
  paymentAccount: string;
  reason: string;
  status: 'AVAILABLE' | 'SOLD';
  createdAt?: string;
}

const API_BASE_URL = 'http://localhost:3000';

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

export async function getTicketListings(
  eventId: string,
): Promise<TicketListing[]> {
  return request<TicketListing[]>(
    `/ticket-listings?eventId=${encodeURIComponent(eventId)}`,
  );
}

export async function createTicketListing(
  listing: Omit<TicketListing, 'id' | 'status' | 'createdAt'>,
): Promise<TicketListing> {
  return request<TicketListing>('/ticket-listings', {
    method: 'POST',
    body: JSON.stringify(listing),
  });
}

export async function purchaseTicketListing(
  listingId: string,
  buyerPayment: { method: TicketPaymentMethod; detail: string },
): Promise<{
  success: boolean;
  transactionId?: string;
  payoutMethod?: TicketPaymentMethod;
  payoutAccount?: string;
}> {
  if (!buyerPayment.detail.trim()) {
    return { success: false };
  }

  throw new Error(
    'Purchasing resale listings is not connected to the backend yet.',
  );
}
