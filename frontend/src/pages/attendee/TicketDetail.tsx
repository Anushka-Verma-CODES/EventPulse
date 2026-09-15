import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { getEvents } from "../../features/events/api/eventsApi";
import {
  createTicketListing,
  type TicketPaymentMethod,
} from "../../features/tickets/api/ticketListingsApi";
import { QRDisplay } from "../../features/tickets/components/QRDisplay";

type TicketDetails = {
  eventId: string;
  eventName: string;
  imageUrl: string;
  date: string;
  venue: string;
  gate: string;
  ticketCode: string;
  category: string;
};

export default function TicketDetail() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferNotice, setTransferNotice] = useState<string | null>(null);
  const [sellerName, setSellerName] = useState("Rohan Mehta");
  const [paymentMethod, setPaymentMethod] = useState<TicketPaymentMethod>("UPI");
  const [paymentAccount, setPaymentAccount] = useState("rohan.mehta@upi");
  const [price, setPrice] = useState("350");
  const [reason, setReason] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTicket() {
      const events = await getEvents();
      if (!isMounted) return;

      const event = events.find((item) => `${item.id}-ticket` === ticketId && item.isRegistered);
      if (event) {
        const ticketIndex = events.filter((item) => item.isRegistered).indexOf(event) + 1;
        const ticketCode = `EP-${String(ticketIndex).padStart(4, "0")}`;

        setTicket({
          eventId: event.id,
          eventName: event.name,
          imageUrl: event.imageUrl,
          date: event.date,
          venue: event.venue,
          gate: event.gates[0]?.name ?? "Main Entry",
          ticketCode,
          category: event.category,
        });
      }

      setLoading(false);
    }

    loadTicket();

    return () => {
      isMounted = false;
    };
  }, [ticketId]);

  async function handleTransferSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ticket) return;

    setIsSubmitting(true);
    setTransferNotice(null);

    await createTicketListing({
      eventId: ticket.eventId,
      ticketCode: ticket.ticketCode,
      sellerName: sellerName.trim(),
      price: Number(price),
      paymentMethod,
      paymentAccount: paymentAccount.trim(),
      reason: reason.trim(),
    });

    setIsSubmitting(false);
    setIsTransferFormOpen(false);
    setTransferNotice("Your ticket is now listed for sale on the event page.");
  }

  if (loading) {
    return <div className="text-sm text-[#64748B]">Loading ticket...</div>;
  }

  if (!ticket) {
    return (
      <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-[#64748B]">This ticket could not be found.</p>
        <Link to="/attendee/tickets" className="mt-3 inline-block text-sm font-medium text-[#2563EB] hover:underline">
          Back to My Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/attendee/tickets" className="text-sm font-semibold text-[#2563EB] hover:underline">
          Back to My Tickets
        </Link>
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#94A3B8]">Digital ticket</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <section className="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="relative h-56 overflow-hidden sm:h-64">
            <img
              src={ticket.imageUrl}
              alt={ticket.eventName}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/event-hero.png";
              }}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-[#0F172A]/85 px-5 py-5 text-white sm:px-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#BFDBFE]">{ticket.category}</p>
                  <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{ticket.eventName}</h1>
                </div>
                <span className="rounded-full bg-[#DCFCE7] px-3 py-1.5 text-xs font-bold text-[#166534]">Confirmed</span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex items-center gap-3 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DCFCE7] text-sm font-bold text-[#15803D]">✓</span>
              <div>
                <p className="text-sm font-bold text-[#166534]">Ready for entry</p>
                <p className="text-xs text-[#4D7C0F]">Keep this pass ready when you arrive.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Date</p>
                <p className="mt-1.5 text-sm font-semibold text-[#1E293B]">{ticket.date}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Access gate</p>
                <p className="mt-1.5 text-sm font-semibold text-[#1E293B]">{ticket.gate}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Venue</p>
                <p className="mt-1.5 text-sm font-semibold text-[#1E293B]">{ticket.venue}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Ticket code</p>
                <p className="mt-1.5 font-mono text-sm font-bold tracking-wide text-[#1E293B]">{ticket.ticketCode}</p>
              </div>
            </div>

            <div className="mt-7 flex items-center justify-between border-t border-dashed border-[#CBD5E1] pt-5 text-xs text-[#64748B]">
              <span>Event ID</span>
              <span className="font-mono font-semibold text-[#475569]">{ticket.eventId}</span>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-[#BFDBFE] bg-[#EFF6FF] p-5 text-center shadow-sm sm:p-6 lg:sticky lg:top-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1D4ED8]">Scan to enter</p>
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <QRDisplay
              value={`eventpulse:${ticket.eventId}:${ticket.ticketCode}:${ticket.eventName}`}
              size={210}
            />
          </div>
          <p className="mt-4 text-sm font-semibold text-[#1E3A8A]">Show this QR code at the gate</p>
          <p className="mt-1 text-xs leading-5 text-[#64748B]">Brightness up, screenshot ready, entry quick.</p>
        </aside>
      </div>

      <section className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        {transferNotice && (
          <div className="mb-5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm font-medium text-[#166534]">
            {transferNotice}
          </div>
        )}

        {!isTransferFormOpen ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#1E293B]">Can&apos;t attend anymore?</p>
              <p className="mt-1 text-sm text-[#64748B]">List this verified ticket for another attendee.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsTransferFormOpen(true)}
              className="rounded-xl border border-[#2563EB] px-4 py-3 text-sm font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
            >
              Sell or transfer ticket
            </button>
          </div>
        ) : (
          <form onSubmit={handleTransferSubmit} className="rounded-2xl bg-[#F8FAFC] p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2563EB]">Resale listing</p>
                <h2 className="mt-1 text-xl font-bold text-[#1E293B]">Transfer this ticket</h2>
                <p className="mt-1 text-sm text-[#64748B]">Add the details buyers will see on the event page.</p>
              </div>
              <button type="button" onClick={() => setIsTransferFormOpen(false)} className="text-sm font-semibold text-[#64748B] hover:text-[#1E293B]">
                Cancel
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-[#334155]">
                Seller name
                <input required value={sellerName} onChange={(event) => setSellerName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]" />
              </label>
              <label className="text-sm font-medium text-[#334155]">
                Asking price (INR)
                <input required min="1" type="number" value={price} onChange={(event) => setPrice(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]" />
              </label>
              <label className="text-sm font-medium text-[#334155]">
                Payment method
                <select value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value as TicketPaymentMethod); setPaymentAccount(""); }} className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]">
                  <option>UPI</option>
                  <option>Credit / Debit Card</option>
                  <option>Bank Transfer</option>
                </select>
              </label>
              <label className="text-sm font-medium text-[#334155]">
                {paymentMethod === "UPI" ? "UPI ID for receiving payment" : paymentMethod === "Bank Transfer" ? "Bank account number" : "Card payout reference"}
                <input required value={paymentAccount} onChange={(event) => setPaymentAccount(event.target.value)} placeholder={paymentMethod === "UPI" ? "example@upi" : paymentMethod === "Bank Transfer" ? "Enter bank account number" : "Enter payout card reference"} className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]" />
              </label>
              <label className="text-sm font-medium text-[#334155] sm:col-span-2">
                Reason for selling
                <textarea required value={reason} onChange={(event) => setReason(event.target.value)} rows={3} placeholder="For example: I can no longer attend" className="mt-1.5 w-full resize-y rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]" />
              </label>
            </div>

            <button type="submit" disabled={isSubmitting || Number(price) <= 0} className="mt-5 w-full rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#93C5FD]">
              {isSubmitting ? "Publishing listing..." : "Publish ticket for sale"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
