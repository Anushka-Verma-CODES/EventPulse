
import { useEffect, useState } from "react";
import { loadRazorpayCheckout } from "../../features/payments/razorpay";
import {
  createResalePaymentOrder,
  getTicketListings,
  verifyResalePayment,
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

  const [isPaying, setIsPaying] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");
  const [paymentError, setPaymentError] = useState(false);

  async function loadListings() {
    try {
      setError("");
      const result = await getTicketListings(eventId);
      setListings(result);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load resale tickets."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!eventId) {
      setError("Event ID is missing.");
      setLoading(false);
      return;
    }

    loadListings();
  }, [eventId]);

  async function handlePurchase() {
    if (!selectedListing || isPaying) {
      return;
    }

    setIsPaying(true);
    setPaymentNotice("");
    setPaymentError(false);

    try {
      // Load Razorpay Checkout.
      await loadRazorpayCheckout();

      // Create an order using the listing's actual database price.
      const order = await createResalePaymentOrder(
        selectedListing.id
      );

      const RazorpayCheckout = window.Razorpay;

      if (!RazorpayCheckout) {
        throw new Error("Razorpay Checkout is unavailable.");
      }

      const checkout = new RazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "EventPulse",
        description: `Resale ticket ${order.ticketCode}`,
        order_id: order.orderId,

        theme: {
          color: "#2563EB",
        },

        modal: {
          ondismiss: () => {
            setIsPaying(false);
            setPaymentNotice(
              "Payment cancelled. No successful payment was verified."
            );
            setPaymentError(true);
          },
        },

        // Razorpay calls this after successful checkout.
        handler: async (response) => {
          try {
            setPaymentNotice(
              "Payment received. Verifying payment and transferring your ticket..."
            );

            // Never transfer the ticket before backend verification.
            const result = await verifyResalePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setPaymentNotice(
              result.message ||
                "Payment successful. Your ticket has been transferred."
            );

            setPaymentError(false);
            setSelectedListing(null);

            // Refresh listings from PostgreSQL.
            await loadListings();
          } catch (err: unknown) {
            setPaymentNotice(
              err instanceof Error
                ? `${err.message} If your payment was deducted, contact support before retrying.`
                : "Payment verification failed. Contact support before retrying."
            );

            setPaymentError(true);
          } finally {
            setIsPaying(false);
          }
        },
      });

      checkout.on("payment.failed", (response) => {
        setPaymentNotice(
          response.error?.description ||
            "Payment failed. Please try again."
        );

        setPaymentError(true);
        setIsPaying(false);
      });

      checkout.open();
    } catch (err: unknown) {
      setPaymentNotice(
        err instanceof Error
          ? err.message
          : "Unable to start Razorpay checkout."
      );

      setPaymentError(true);
      setIsPaying(false);
    }
  }

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
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadListings();
            }}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center text-sm text-[#64748B]">
          No attendee tickets are listed for sale yet.
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {listings
            .filter((listing) => listing.status === "AVAILABLE")
            .map((listing) => (
              <div
                key={listing.id}
                className="flex flex-col items-start justify-between gap-4 rounded-xl bg-[#F8FAFC] p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[#1E293B]">
                      {listing.ticketCode}
                    </span>

                    <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-xs font-medium text-[#16A34A]">
                      Available
                    </span>
                  </div>

                  <div className="mt-1 text-sm text-[#64748B]">
                    Listed by {listing.sellerName} &middot;{" "}
                    {listing.reason}
                  </div>
                </div>

                <div className="shrink-0 text-left sm:text-right">
                  <div className="text-xs text-[#94A3B8]">
                    PRICE
                  </div>

                  <div className="text-lg font-bold text-[#2563EB]">
                    ₹{listing.price}
                  </div>

                  <button
                    type="button"
                    disabled={isPaying}
                    onClick={() => {
                      setSelectedListing(listing);
                      setPaymentNotice("");
                      setPaymentError(false);
                    }}
                    className="mt-1 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] disabled:opacity-50"
                  >
                    Buy ticket
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {paymentNotice && (
        <div
          className={`mt-4 rounded-xl border p-4 text-sm ${
            paymentError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {paymentNotice}
        </div>
      )}

      {selectedListing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close purchase dialog"
            disabled={isPaying}
            className="absolute inset-0 cursor-default bg-black/30"
            onClick={() => setSelectedListing(null)}
          />

          <div className="relative z-10 w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#1E293B]">
              Confirm ticket purchase
            </h3>

            <p className="mt-2 text-sm text-[#64748B]">
              You are purchasing ticket{" "}
              <strong>{selectedListing.ticketCode}</strong>.
            </p>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-[#F8FAFC] p-4">
              <span className="text-sm text-[#64748B]">
                Total amount
              </span>

              <span className="text-xl font-bold text-[#2563EB]">
                ₹{selectedListing.price}
              </span>
            </div>

            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              <strong>Razorpay Test Mode</strong>
              <p className="mt-1 text-xs leading-5">
                You will be redirected to Razorpay Checkout.
                Your ticket will be transferred only after the
                backend verifies successful payment.
              </p>
            </div>

            <p className="mt-3 text-xs leading-5 text-[#64748B]">
              Seller payouts are not automated yet. Test
              payments are collected by the EventPulse
              Razorpay account.
            </p>

            <button
              type="button"
              onClick={handlePurchase}
              disabled={isPaying}
              className="mt-5 w-full rounded-lg bg-[#2563EB] py-3 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPaying
                ? "Processing..."
                : `Continue to pay ₹${selectedListing.price}`}
            </button>

            <button
              type="button"
              disabled={isPaying}
              onClick={() => setSelectedListing(null)}
              className="mt-2 w-full rounded-lg border border-[#E2E8F0] py-2.5 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
