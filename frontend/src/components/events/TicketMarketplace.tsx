import { useState } from "react";
import { marketplaceListings, buyListing } from "../../lib/marketplaceMockData";

export default function TicketMarketplace() {
  const [listings, setListings] = useState(marketplaceListings);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [purchasedTicketId, setPurchasedTicketId] = useState<string | null>(null);

  const availableCount = listings.filter((l) => l.status === "Available").length;
  const activeListing = listings.find((l) => l.id === buyingId);

  function handleConfirmPurchase() {
    if (!buyingId) return;
    const result = buyListing(buyingId);
    if (!result) return;

    setListings((prev) =>
      prev.map((l) => (l.id === buyingId ? { ...l, status: "Sold" } : l))
    );
    setPurchasedTicketId(result.newTicketId);
  }

  function closeModal() {
    setBuyingId(null);
    setPurchasedTicketId(null);
  }

  if (availableCount === 0 && listings.every((l) => l.status === "Sold")) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#1E293B]">
            Tickets available from attendees
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Verified resale listings from people who can no longer attend.
          </p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#2563EB]">
          {availableCount} available
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="flex items-center justify-between gap-4 rounded-xl bg-[#F8FAFC] p-5"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#1E293B]">{listing.id}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    listing.status === "Available"
                      ? "bg-[#DCFCE7] text-[#16A34A]"
                      : "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                >
                  {listing.status}
                </span>
              </div>
              <div className="mt-1 text-sm text-[#64748B]">
                Listed by {listing.sellerName} &middot; {listing.reason}
              </div>
              <div className="text-xs text-[#94A3B8]">
                Payment preference: {listing.paymentPreference}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-[#94A3B8]">PRICE</div>
              <div className="text-lg font-bold text-[#2563EB]">&#8377;{listing.price}</div>
              <button
                type="button"
                disabled={listing.status !== "Available"}
                onClick={() => setBuyingId(listing.id)}
                className="mt-1 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy ticket
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeListing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={closeModal} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
            {purchasedTicketId ? (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0FDF4] text-[#16A34A]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#1E293B]">Ticket Transferred to You</h3>
                <p className="mt-2 text-sm text-[#64748B]">
                  {activeListing.sellerName}&apos;s ticket has been transferred and a new QR
                  ticket has been issued in your name.
                </p>
                <div className="mt-3 rounded-lg bg-[#F8FAFC] p-3 text-sm">
                  <span className="text-[#64748B]">New Ticket ID</span>
                  <div className="font-semibold text-[#1E293B]">{purchasedTicketId}</div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-4 w-full rounded-lg bg-[#2563EB] py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8]"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-[#1E293B]">Confirm Purchase</h3>
                <p className="mt-1 text-sm text-[#64748B]">
                  Listing {activeListing.id} from {activeListing.sellerName}
                </p>

                <div className="mt-4 flex items-center justify-between rounded-lg bg-[#F8FAFC] p-3 text-sm">
                  <span className="text-[#64748B]">Amount</span>
                  <span className="font-semibold text-[#1E293B]">&#8377;{activeListing.price}</span>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-lg bg-[#F8FAFC] p-3 text-sm">
                  <span className="text-[#64748B]">Payment via</span>
                  <span className="font-medium text-[#1E293B]">{activeListing.paymentPreference}</span>
                </div>

                <p className="mt-3 text-xs text-[#94A3B8]">
                  Once payment is confirmed, the seller&apos;s ticket is invalidated and a new
                  QR ticket is issued directly to your account.
                </p>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-lg border border-[#E2E8F0] py-2.5 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPurchase}
                    className="flex-1 rounded-lg bg-[#2563EB] py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8]"
                  >
                    Pay &#8377;{activeListing.price}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
