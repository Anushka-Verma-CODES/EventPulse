
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVolunteerApplication } from "../../lib/registrationMockData";
import { registerForEvent } from "../../features/events/api/eventsApi";
import {
  createPaymentOrder,
  verifyPayment,
} from "../../features/payments/api/paymentsApi";

interface RegistrationOptionsProps {
  eventId: string;
  price: number;
  isRegistered: boolean;
  registrationLoading: boolean;
  registrationError?: string;
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  modal: {
    ondismiss: () => void;
  };
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (
    event: "payment.failed",
    handler: (response: {
      error?: { description?: string };
    }) => void,
  ) => void;
}

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayOptions,
    ) => RazorpayInstance;
  }
}

export default function RegistrationOptions({
  eventId,
  price,
  isRegistered,
  registrationLoading,
  registrationError,
}: RegistrationOptionsProps) {
  const volunteerApp = getVolunteerApplication(eventId);

  const [registered, setRegistered] = useState(isRegistered);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  useEffect(() => {
    setRegistered(isRegistered);
  }, [isRegistered]);

  async function handleAttendeeRegistration() {
    if (
      submitting ||
      registered ||
      isRegistered ||
      registrationLoading
    ) {
      return;
    }

    setSubmitting(true);
    setMessage("");
    setMessageIsError(false);

    try {
      if (price > 0) {
        if (!window.Razorpay) {
          throw new Error(
            "Razorpay Checkout could not be loaded. Please refresh the page and try again.",
          );
        }

        const order = await createPaymentOrder(eventId);

        const checkout = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "EventPulse",
          description: `Ticket for ${order.eventName}`,
          order_id: order.orderId,
          theme: {
            color: "#2563EB",
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
              setMessage("Payment cancelled. You have not been registered.");
              setMessageIsError(true);
            },
          },
          handler: async (response) => {
            try {
              setMessage("Verifying payment...");
              setMessageIsError(false);

              const result = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              setRegistered(true);
              setMessage(
                result.message ||
                  "Payment successful! You are registered for this event.",
              );
              setMessageIsError(false);
            } catch (error) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Payment verification failed. Please contact support before trying to pay again.",
              );
              setMessageIsError(true);
            } finally {
              setSubmitting(false);
            }
          },
        });

        checkout.on("payment.failed", (response) => {
          setMessage(
            response.error?.description ||
              "Payment failed. Please try again.",
          );
          setMessageIsError(true);
          setSubmitting(false);
        });

        checkout.open();
        return;
      }

      const result = await registerForEvent(eventId);

      if (result.success) {
        setRegistered(true);
        setMessage(
          result.message || "Successfully registered for this event.",
        );
      } else {
        setMessage(result.message || "Registration failed.");
        setMessageIsError(true);
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start registration. Please try again.",
      );
      setMessageIsError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const hasAttendeeRegistration = registered || isRegistered;

  const formattedPrice =
    price === 0
      ? "Free"
      : `₹${price.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#1E293B]">
        How would you like to participate?
      </h2>

      {(message || registrationError) && (
        <p
          role="status"
          aria-live="polite"
          className={`mt-3 text-sm ${
            messageIsError || registrationError
              ? "text-red-600"
              : "text-[#16A34A]"
          }`}
        >
          {message || registrationError}
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E2E8F0] p-5">
          <div className="text-2xl">&#127903;&#65039;</div>

          <h3 className="mt-2 text-base font-semibold text-[#1E293B]">
            Attend this event
          </h3>

          <p className="mt-1 text-sm text-[#64748B]">
            Get your ticket and QR entry pass.
          </p>

          <p className="mt-3 text-xl font-bold text-[#1E293B]">
            {formattedPrice}
          </p>

          <ul className="mt-3 flex flex-col gap-1 text-sm text-[#64748B]">
            <li>&#10003; Access to the event</li>
            <li>&#10003; Digital QR ticket</li>
            <li>&#10003; Secure ticket validation</li>
            <li>&#10003; Ticket transfer option</li>
          </ul>

          {registrationLoading ? (
            <p className="mt-4 text-sm text-[#64748B]">
              Checking registration...
            </p>
          ) : hasAttendeeRegistration ? (
            <div className="mt-4">
              <div className="mb-2 text-sm font-medium text-[#16A34A]">
                &#10003; Registered as Attendee
              </div>

              <Link
                to="/attendee/tickets"
                className="block rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-center text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
              >
                View Ticket
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAttendeeRegistration}
              disabled={submitting || registrationLoading}
              className="mt-4 block w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Processing..."
                : price > 0
                  ? `Pay ${formattedPrice}`
                  : "Register for Free"}
            </button>
          )}
        </div>

        <div className="rounded-xl border border-[#E2E8F0] p-5">
          <div className="text-2xl">&#129309;</div>

          <h3 className="mt-2 text-base font-semibold text-[#1E293B]">
            Volunteer at this event
          </h3>

          <p className="mt-1 text-sm text-[#64748B]">
            Apply for available volunteer roles. Free to apply.
          </p>

          <ul className="mt-3 flex flex-col gap-1 text-sm text-[#64748B]">
            <li>&#10003; Choose volunteer opportunities</li>
            <li>&#10003; Get assigned shifts</li>
            <li>&#10003; Manage event tasks</li>
            <li>&#10003; Receive volunteer record</li>
          </ul>

          <div className="mt-3 text-xs font-medium text-[#64748B]">
            No registration fee &middot; Application required
          </div>

          {volunteerApp ? (
            <div className="mt-4">
              <div className="mb-2 text-sm font-medium text-[#D97706]">
                &#10003; Volunteer Application{" "}
                {volunteerApp.status === "Pending"
                  ? "Submitted"
                  : volunteerApp.status}
              </div>

              <Link
                to="/volunteer/applications"
                className="block rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-center text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
              >
                View Application
              </Link>
            </div>
          ) : (
            <Link
              to={`/events/${eventId}/register/volunteer`}
              className="mt-4 block rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-center text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
            >
              Register as Volunteer
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
