import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { EventItem } from '../types/event';
import { getEventById, registerForEvent, registerPurchasedTicket } from '../features/events/api/eventsApi';
import {
  getTicketListings,
  purchaseTicketListing,
  type TicketListing,
  type TicketPaymentMethod,
} from '../features/tickets/api/ticketListingsApi';

const categoryBadge: Record<string, string> = {
  'Tech Fest': 'bg-[#3B82F6] text-white',
  Workshop: 'bg-[#2563EB] text-white',
  Cultural: 'bg-[#93C5FD] text-[#1E3A8A]',
};

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [ticketListings, setTicketListings] = useState<TicketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [selectedListing, setSelectedListing] = useState<TicketListing | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<TicketPaymentMethod>('UPI');
  const [paymentDetail, setPaymentDetail] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getEventById(id), getTicketListings(id)]).then(([data, listings]) => {
      setEvent(data ?? null);
      setTicketListings(listings);
      setLoading(false);
    });
  }, [id]);

  async function handleRegister() {
    if (!event) return;
    setRegistering(true);
    const result = await registerForEvent(event.id);
    if (result.success) {
      setEvent({ ...event, isRegistered: true, capacityRegistered: event.capacityRegistered + 1 });
    }
    setRegistering(false);
  }

  async function handlePurchase(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!selectedListing) return;

    setIsPaying(true);
    setPaymentNotice(null);
    const result = await purchaseTicketListing(selectedListing.id, {
      method: paymentMethod,
      detail: paymentDetail,
    });

    if (result.success) {
      const registration = registerPurchasedTicket(selectedListing.eventId);
      setTicketListings((listings) => listings.filter((listing) => listing.id !== selectedListing.id));
      if (registration.success && event) {
        setEvent({ ...event, isRegistered: true });
      }
      setSelectedListing(null);
      setPaymentDetail('');
      setPaymentNotice(
        `Payment successful. Transaction ID: ${result.transactionId}. Funds will be sent via ${result.payoutMethod} to ${result.payoutAccount}.`,
      );
    } else {
      setPaymentNotice('This ticket is no longer available. Please choose another listing.');
    }

    setIsPaying(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <span className="loading loading-spinner loading-lg text-[#3B82F6]"></span>
      </div>
    );
  }
  if (!event) return <div className="text-center mt-10 text-[#EF4444]">Event not found</div>;

  const seatsLeft = event.capacityTotal - event.capacityRegistered;
  const percentFull = (event.capacityRegistered / event.capacityTotal) * 100;
  const badgeClass = categoryBadge[event.category] ?? 'bg-[#6B7280] text-white';

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5">
          <Link to="/events" className="text-sm font-medium text-[#64748B] transition hover:text-[#2563EB]">
            ← Back to events
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <figure className="h-56 w-full overflow-hidden">
            <img src={event.imageUrl} alt={event.name} className="h-full w-full object-cover" />
          </figure>

          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-[#1E293B]">{event.name}</h1>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
                {event.category}
              </span>
            </div>

            <p className="mt-2 text-sm text-[#64748B]">
              {event.date} · {event.venue}
            </p>

            <p className="mt-4 text-sm leading-7 text-[#475569]">{event.fullDescription}</p>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs text-[#94A3B8]">
                <span>{event.capacityRegistered} registered</span>
                <span>{seatsLeft} seats left</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full rounded-full bg-[#2563EB] transition-all"
                  style={{ width: `${Math.min(percentFull, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-6">
              {event.isRegistered ? (
                <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm font-medium text-[#166534]">
                  You&apos;re registered for this event
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering || seatsLeft === 0}
                  className="w-full rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#93C5FD]"
                >
                  {registering
                    ? 'Registering…'
                    : seatsLeft === 0
                    ? 'Fully booked'
                    : 'Register for this event'}
                </button>
              )}
            </div>

            <section className="mt-8 border-t border-[#E2E8F0] pt-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#1E293B]">Tickets available from attendees</h2>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Verified resale listings from people who can no longer attend.
                  </p>
                </div>
                <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
                  {ticketListings.length} available
                </span>
              </div>

              {ticketListings.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center text-sm text-[#64748B]">
                  No attendee tickets are listed for sale yet.
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  {ticketListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[#1E293B]">{listing.ticketCode}</p>
                          <span className="rounded-full bg-[#DCFCE7] px-2 py-1 text-[11px] font-semibold text-[#166534]">
                            Available
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[#64748B]">
                          Listed by {listing.sellerName} · {listing.reason}
                        </p>
                        <p className="mt-1 text-xs text-[#94A3B8]">Payment preference: {listing.paymentMethod}</p>
                      </div>
                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Price</p>
                        <p className="mt-1 text-xl font-bold text-[#2563EB]">&#8377;{listing.price}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedListing(listing);
                            setPaymentNotice(null);
                          }}
                          className="mt-2 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1D4ED8]"
                        >
                          Buy ticket
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {paymentNotice && (
                <div className="mt-4 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm font-medium text-[#166534]">
                  {paymentNotice}
                </div>
              )}

              {selectedListing && (
                <form onSubmit={handlePurchase} className="mt-5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#1E293B]">Complete payment</h3>
                      <p className="mt-1 text-sm text-[#64748B]">
                        Buying {selectedListing.ticketCode} for &#8377;{selectedListing.price}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedListing(null)}
                      className="text-sm font-medium text-[#64748B] hover:text-[#1E293B]"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="mt-4 rounded-lg border border-[#BFDBFE] bg-white px-3 py-2.5 text-sm text-[#475569]">
                    Seller will receive payment via <span className="font-semibold text-[#1E293B]">{selectedListing.paymentMethod}</span>{' '}
                    at <span className="font-semibold text-[#1E293B]">{selectedListing.paymentAccount}</span>.
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {(['UPI', 'Credit / Debit Card', 'Bank Transfer'] as TicketPaymentMethod[]).map((method) => (
                      <label
                        key={method}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                          paymentMethod === method
                            ? 'border-[#2563EB] bg-white text-[#1E3A8A]'
                            : 'border-[#CBD5E1] bg-white/60 text-[#64748B]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="buyer-payment-method"
                          checked={paymentMethod === method}
                          onChange={() => {
                            setPaymentMethod(method);
                            setPaymentDetail('');
                          }}
                          className="h-4 w-4 accent-[#2563EB]"
                        />
                        {method}
                      </label>
                    ))}
                  </div>

                  <label className="mt-4 block text-sm font-medium text-[#334155]">
                    {paymentMethod === 'UPI'
                      ? 'Your UPI ID'
                      : paymentMethod === 'Credit / Debit Card'
                      ? 'Your card number'
                      : 'Your bank account number'}
                    <input
                      required
                      value={paymentDetail}
                      onChange={(event) => setPaymentDetail(event.target.value)}
                      placeholder={paymentMethod === 'UPI' ? 'example@upi' : 'Enter payment details'}
                      className="mt-1.5 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isPaying}
                    className="mt-4 w-full rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#93C5FD]"
                  >
                    {isPaying ? 'Processing payment...' : `Pay \u20B9${selectedListing.price}`}
                  </button>
                </form>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}