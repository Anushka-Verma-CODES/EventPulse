import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getMyRegistrations,
  type MyRegistration,
} from "../../features/events/api/eventsApi";
import {
  createTicketListing,
  getTicketListings,
  type TicketPaymentMethod,
} from "../../features/tickets/api/ticketListingsApi";
import { QRDisplay } from "../../features/tickets/components/QRDisplay";

type TicketDetails = {
  registrationId: string;
  eventId: string;
  eventName: string;
  imageUrl: string;
  date: string;
  venue: string;
  ticketCode: string;
  category: string;
  qrToken: string | null;
};

function mapRegistrationToTicket(
  registration: MyRegistration,
): TicketDetails {
  const event = registration.event;

  return {
    registrationId: registration.id,
    eventId: event.id,
    eventName: event.title,
    imageUrl: event.bannerImage || "/event-hero.png",
    date: new Date(event.startDate).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }),
    venue: event.location,
    ticketCode: `EP-${registration.id.slice(0, 8).toUpperCase()}`,
    category: event.category,
    qrToken: registration.qrToken,
  };
}

export default function TicketDetail() {
  const { ticketId } = useParams();

  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListedForResale, setIsListedForResale] = useState(false);
  const [isCheckingListing, setIsCheckingListing] = useState(false);
  const [transferNotice, setTransferNotice] = useState<string | null>(null);
  const [sellerName, setSellerName] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<TicketPaymentMethod>("UPI");
  const [paymentAccount, setPaymentAccount] = useState("");
  const [price, setPrice] = useState("350");
  const [reason, setReason] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTicket() {
      setLoading(true);
      setLoadError("");
      setTicket(null);
      setIsListedForResale(false);
      setIsCheckingListing(false);
      setIsTransferFormOpen(false);
      setTransferNotice(null);

      try {
        const registrations = await getMyRegistrations();

        if (!isMounted) return;

        const registration = registrations.find(
          (item) => item.id === ticketId,
        );

        if (registration) {
          const ticketDetails = mapRegistrationToTicket(registration);
          setTicket(ticketDetails);
          setIsCheckingListing(true);

          try {
            const listings = await getTicketListings(ticketDetails.eventId);

            if (!isMounted) return;

            const alreadyListed = listings.some(
              (listing) =>
                listing.ticketCode === ticketDetails.ticketCode &&
                listing.status === "AVAILABLE",
            );

            setIsListedForResale(alreadyListed);
          } catch {
            if (!isMounted) return;

            setTransferNotice(
              "Unable to check your resale listing. Please refresh the page and try again.",
            );
          } finally {
            if (isMounted) {
              setIsCheckingListing(false);
            }
          }
        }
      } catch (error) {
        if (!isMounted) return;

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load your registration.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (ticketId) {
      loadTicket();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [ticketId]);

  async function handleTransferSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!ticket || isSubmitting || isListedForResale) return;

    if (Number(price) <= 0) {
      setTransferNotice("Please enter a valid selling price.");
      return;
    }

    setIsSubmitting(true);
    setTransferNotice(null);

    try {
      const listings = await getTicketListings(ticket.eventId);
      const alreadyListed = listings.some(
        (listing) =>
          listing.ticketCode === ticket.ticketCode &&
          listing.status === "AVAILABLE",
      );

      if (alreadyListed) {
        setIsListedForResale(true);
        setIsTransferFormOpen(false);
        setTransferNotice("This ticket is already listed for resale.");
        return;
      }

      await createTicketListing({
        eventId: ticket.eventId,
        ticketCode: ticket.ticketCode,
        sellerName: sellerName.trim(),
        price: Number(price),
        paymentMethod,
        paymentAccount: paymentAccount.trim(),
        reason: reason.trim(),
      });

      setIsListedForResale(true);
      setIsTransferFormOpen(false);
      setTransferNotice(
        "Your ticket listing was submitted successfully.",
      );
    } catch (error) {
      setTransferNotice(
        error instanceof Error
          ? error.message
          : "Unable to publish the ticket listing. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-[#64748B]">
        Loading ticket...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-red-600">{loadError}</p>
        <Link
          to="/attendee/tickets"
          className="mt-3 inline-block text-sm font-medium text-[#2563EB] hover:underline"
        >
          Back to My Tickets
        </Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-[#64748B]">
          This registration could not be found.
        </p>
        <Link
          to="/attendee/tickets"
          className="mt-3 inline-block text-sm font-medium text-[#2563EB] hover:underline"
        >
          Back to My Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/attendee/tickets"
          className="text-sm font-semibold text-[#2563EB] hover:underline"
        >
          Back to My Tickets
        </Link>

        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#94A3B8]">
          Event registration
        </span>
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
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#BFDBFE]">
                    {ticket.category}
                  </p>
                  <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                    {ticket.eventName}
                  </h1>
                </div>

                <span className="rounded-full bg-[#DCFCE7] px-3 py-1.5 text-xs font-bold text-[#166534]">
                  Registration Confirmed
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex items-center gap-3 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DCFCE7] text-sm font-bold text-[#15803D]">
                ✓
              </span>

              <div>
                <p className="text-sm font-bold text-[#166534]">
                  Registration confirmed
                </p>
                <p className="text-xs text-[#4D7C0F]">
                  Your registration has been retrieved from EventPulse.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Date
                </p>
                <p className="mt-1.5 text-sm font-semibold text-[#1E293B]">
                  {ticket.date}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Access gate
                </p>
                <p className="mt-1.5 text-sm font-semibold text-[#1E293B]">
                  Main Entry
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Venue
                </p>
                <p className="mt-1.5 text-sm font-semibold text-[#1E293B]">
                  {ticket.venue}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Registration reference
                </p>
                <p className="mt-1.5 break-all font-mono text-sm font-bold tracking-wide text-[#1E293B]">
                  {ticket.ticketCode}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-2 border-t border-dashed border-[#CBD5E1] pt-5 text-xs text-[#64748B]">
              <div className="flex items-start justify-between gap-3">
                <span>Event ID</span>
                <span className="break-all text-right font-mono font-semibold text-[#475569]">
                  {ticket.eventId}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span>Registration ID</span>
                <span className="break-all text-right font-mono font-semibold text-[#475569]">
                  {ticket.registrationId}
                </span>
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-[#BFDBFE] bg-[#EFF6FF] p-5 text-center shadow-sm sm:p-6 lg:sticky lg:top-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1D4ED8]">
            Registration QR
          </p>

          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          {ticket.qrToken ? (
          <QRDisplay value={ticket.qrToken} size={210} />
            ) : (
          <p className="py-8 text-sm text-amber-700">
          QR ticket is not available yet. Please refresh later or contact support.
          </p>
        )}
          </div>

          <p className="mt-4 text-sm font-semibold text-[#1E3A8A]">
            Your registration reference
          </p>

          <p className="mt-1 text-xs leading-5 text-[#64748B]">
            This QR represents your registration. Gate scanning and entry
            validation must be implemented separately before using it as
            an actual entry pass.
          </p>
        </aside>
      </div>

      <section className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        {transferNotice && (
          <div className="mb-5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm font-medium text-[#1D4ED8]">
            {transferNotice}
          </div>
        )}

        {isCheckingListing ? (
          <p className="text-sm text-[#64748B]">Checking resale listing...</p>
        ) : isListedForResale ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCFCE7] text-lg font-bold text-[#15803D]">
              ✓
            </span>
            <div>
              <p className="text-sm font-bold text-[#166534]">
                Listed for resale
              </p>
              <p className="mt-1 text-sm text-[#64748B]">
                Your ticket is available to other attendees in the resale marketplace.
              </p>
            </div>
          </div>
        ) : !isTransferFormOpen ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#1E293B]">
                Can&apos;t attend anymore?
              </p>
              <p className="mt-1 text-sm text-[#64748B]">
                List your ticket for another attendee.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setTransferNotice(null);
                setIsTransferFormOpen(true);
              }}
              className="rounded-xl border border-[#2563EB] px-4 py-3 text-sm font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
            >
              Sell or transfer ticket
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleTransferSubmit}
            className="rounded-2xl bg-[#F8FAFC] p-4 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2563EB]">
                  Resale listing
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#1E293B]">
                  Transfer this ticket
                </h2>
                <p className="mt-1 text-sm text-[#64748B]">
                  Add the details buyers will see on the event page.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsTransferFormOpen(false)}
                className="text-sm font-semibold text-[#64748B] hover:text-[#1E293B]"
              >
                Cancel
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-[#334155]">
                Seller name
                <input
                  required
                  value={sellerName}
                  onChange={(event) => setSellerName(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
                />
              </label>

              <label className="text-sm font-medium text-[#334155]">
                Asking price (INR)
                <input
                  required
                  min="1"
                  type="number"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
                />
              </label>

              <label className="text-sm font-medium text-[#334155]">
                Payment method
                <select
                  value={paymentMethod}
                  onChange={(event) => {
                    setPaymentMethod(
                      event.target.value as TicketPaymentMethod,
                    );
                    setPaymentAccount("");
                  }}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
                >
                  <option>UPI</option>
                  <option>Credit / Debit Card</option>
                  <option>Bank Transfer</option>
                </select>
              </label>

              <label className="text-sm font-medium text-[#334155]">
                {paymentMethod === "UPI"
                  ? "UPI ID for receiving payment"
                  : paymentMethod === "Bank Transfer"
                    ? "Bank account number"
                    : "Card payout reference"}
                <input
                  required
                  value={paymentAccount}
                  onChange={(event) =>
                    setPaymentAccount(event.target.value)
                  }
                  placeholder={
                    paymentMethod === "UPI"
                      ? "example@upi"
                      : paymentMethod === "Bank Transfer"
                        ? "Enter bank account number"
                        : "Enter payout card reference"
                  }
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
                />
              </label>

              <label className="text-sm font-medium text-[#334155] sm:col-span-2">
                Reason for selling
                <textarea
                  required
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  placeholder="For example: I can no longer attend"
                  className="mt-1.5 w-full resize-y rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || Number(price) <= 0}
              className="mt-5 w-full rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#93C5FD]"
            >
              {isSubmitting
                ? "Publishing listing..."
                : "Publish ticket for sale"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
