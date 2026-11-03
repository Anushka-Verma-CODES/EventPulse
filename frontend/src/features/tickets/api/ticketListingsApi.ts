
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

const VITE_API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : window.location.hostname === "172.16.78.105"
      ? "http://172.16.78.105:3000"
      : "https://eventpulse-toa3.onrender.com";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${VITE_API_BASE_URL}${path}`, {
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

  if (response.status === 204) {
    return undefined as T;
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

export interface ResalePaymentOrder {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  eventName: string;
  ticketCode: string;
}

export interface ResalePaymentVerification {
  message: string;
  registrationId?: string;
}

export interface RazorpayVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function createResalePaymentOrder(
  listingId: string,
): Promise<ResalePaymentOrder> {
  return request<ResalePaymentOrder>('/payments/resale-orders', {
    method: 'POST',
    body: JSON.stringify({ listingId }),
  });
}

export async function verifyResalePayment(
  payload: RazorpayVerificationPayload,
): Promise<ResalePaymentVerification> {
  return request<ResalePaymentVerification>('/payments/resale-verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
