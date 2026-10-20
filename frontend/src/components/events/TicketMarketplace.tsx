
import { useEffect, useState } from "react";
import {
  getTicketListings,
  type TicketListing,
} from "../../features/tickets/api/ticketListingsApi";

interface TicketMarketplaceProps {
  eventId: string;
}

export default function TicketMarketplace({
  eventId,
}: TicketMarketplaceProps) {
  const [listings, setListings] = useState<TicketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedListing, setSelectedListing] =
    useState<TicketListing | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      setLoading(true);
      setError("");

      try {
        const result = await getTicketListings(eventId);

        if (!cancelled) {
          setListings(result);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load resale tickets."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (eventId) {
      loadListings();
    } else {
      setListings([]);
      setError("Event ID is missing.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const availableCount = listings.filter(
    (listing) => listing.status === "AVAILABLE"
  ).length;

  return (
    <section className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#1E293B]">
            Tickets available from attendees
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Resale listings from people who can no longer attend.
          </p>
        </div>

        <span className="whitespace-nowrap rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#2563EB]">
          {availableCount} available
        </span>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-[#64748B]">
          Loading available tickets...
        </p>
      ) : error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : listings.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center text-sm text-[#64748B]">
          No attendee tickets are listed for sale yet.
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-col items-start justify-between gap-4 rounded-xl bg-[#F8FAFC] p-5 sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[#1E293B]">
                    {listing.ticketCode}
                  </span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      listing.status === "AVAILABLE"
                        ? "bg-[#DCFCE7] text-[#16A34A]"
                        : "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    {listing.status === "AVAILABLE"
                      ? "Available"
                      : "Sold"}
                  </span>
                </div>

                <div className="mt-1 text-sm text-[#64748B]">
                  Listed by {listing.sellerName} &middot; {listing.reason}
                </div>

                <div className="mt-1 text-xs text-[#94A3B8]">
                  Payment preference: {listing.paymentMethod}
                </div>
              </div>

              <div className="shrink-0 text-left sm:text-right">
                <div className="text-xs text-[#94A3B8]">PRICE</div>

                <div className="text-lg font-bold text-[#2563EB]">
                  &#8377;{listing.price}
                </div>

                <button
                  type="button"
                  disabled={listing.status !== "AVAILABLE"}
                  onClick={() => setSelectedListing(listing)}
                  className="mt-1 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedListing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close ticket details"
            className="absolute inset-0 cursor-default bg-black/30"
            onClick={() => setSelectedListing(null)}
          />

          <div className="relative z-10 w-full max-w-sm rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#1E293B]">
              Ticket details
            </h3>

            <p className="mt-1 text-sm text-[#64748B]">
              Listing {selectedListing.ticketCode} from{" "}
              {selectedListing.sellerName}
            </p>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-[#F8FAFC] p-3 text-sm">
              <span className="text-[#64748B]">Price</span>
              <span className="font-semibold text-[#1E293B]">
                &#8377;{selectedListing.price}
              </span>
            </div>

            <div className="mt-2 rounded-lg bg-[#F8FAFC] p-3 text-sm">
              <p className="text-[#64748B]">Seller's payment preference</p>
              <p className="mt-1 font-medium text-[#1E293B]">
                {selectedListing.paymentMethod}
              </p>
            </div>

            <p className="mt-3 text-xs leading-5 text-[#64748B]">
              {selectedListing.reason}
            </p>

            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              Ticket purchasing and payment processing are not connected yet.
              No payment has been made and no ticket has been transferred.
            </p>

            <button
              type="button"
              onClick={() => setSelectedListing(null)}
              className="mt-5 w-full rounded-lg bg-[#2563EB] py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
