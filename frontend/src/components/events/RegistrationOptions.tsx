
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getMyRegistrations,
  registerForEvent,
} from "../../features/events/api/eventsApi";
import {
  createPaymentOrder,
  verifyPayment,
} from "../../features/payments/api/paymentsApi";
import { loadRazorpayCheckout } from "../../features/payments/razorpay";
import ApplyModal from "../volunteer/ApplyModal";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../lib/authApi";
import { API_BASE_URL } from "../../lib/apiConfig";

interface RegistrationOptionsProps {
  eventId: string;
  eventName: string;
  price: number;
  isRegistered: boolean;
  registrationLoading: boolean;
  registrationError?: string;
}

type ApplicationStatus = "pending" | "accepted" | "rejected";

interface VolunteerApplication {
  id: string;
  eventId: string;
  status: ApplicationStatus;
}

export default function RegistrationOptions({
  eventId,
  eventName,
  price,
  isRegistered,
  registrationLoading,
  registrationError,
}: RegistrationOptionsProps) {
  const navigate = useNavigate();
  const { profile, isAuthenticated, isLoading: authLoading } = useAuth();

  const isVolunteer = profile?.roles.includes("volunteer") ?? false;

  const [registered, setRegistered] = useState(isRegistered);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  const [volunteerApplications, setVolunteerApplications] = useState<
    VolunteerApplication[]
  >([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  useEffect(() => {
    setRegistered(isRegistered);
  }, [isRegistered]);

  async function fetchVolunteerApplications() {
    if (!isAuthenticated || !isVolunteer) {
      setVolunteerApplications([]);
      setApplicationsLoading(false);
      return;
    }

    setApplicationsLoading(true);
    setApplicationsError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/volunteers/me/applications`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        const responseData = await response.json().catch(() => null);
        const errorMessage = responseData?.message;

        throw new Error(
          Array.isArray(errorMessage)
            ? errorMessage.join(" ")
            : errorMessage || "Unable to load your volunteer applications.",
        );
      }

      const data: VolunteerApplication[] = await response.json();

      setVolunteerApplications(
        data.filter((application) => application.eventId === eventId),
      );
    } catch (error) {
      setApplicationsError(
        error instanceof Error
          ? error.message
          : "Unable to load your volunteer applications.",
      );
    } finally {
      setApplicationsLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (isAuthenticated && isVolunteer) {
      fetchVolunteerApplications();
    } else {
      setVolunteerApplications([]);
      setApplicationsError("");
      setApplicationsLoading(false);
    }
  }, [eventId, authLoading, isAuthenticated, isVolunteer]);

  async function openRegisteredTicket(registrationId?: string) {
    let ticketId = registrationId;

    if (!ticketId) {
      const registrations = await getMyRegistrations();
      ticketId = registrations.find(
        (registration) => registration.eventId === eventId,
      )?.id;
    }

    if (ticketId) {
      navigate(`/attendee/tickets/${ticketId}`);
    } else {
      navigate("/attendee/tickets");
    }
  }

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
        await loadRazorpayCheckout();

        const order = await createPaymentOrder(eventId);

        const RazorpayCheckout = window.Razorpay;

        if (!RazorpayCheckout) {
          throw new Error("Razorpay Checkout is unavailable. Please try again.");
        }

        const checkout = new RazorpayCheckout({
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
              await openRegisteredTicket(result.registrationId);
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
        await openRegisteredTicket(result.registrationId);
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

  const existingVolunteerApplication = volunteerApplications.find(
    (application) => application.eventId === eventId,
  );

  const formattedPrice =
    price === 0
      ? "Free"
      : `₹${price.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  function getApplicationStatusLabel(status: ApplicationStatus) {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Rejected";
    }
  }

  function getApplicationStatusColor(status: ApplicationStatus) {
    switch (status) {
      case "pending":
        return "text-[#D97706]";
      case "accepted":
        return "text-[#16A34A]";
      case "rejected":
        return "text-red-600";
    }
  }

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

          {authLoading ? (
            <p className="mt-4 text-sm text-[#64748B]">
              Checking account...
            </p>
          ) : !isAuthenticated ? (
            <div className="mt-4">
              <p className="mb-2 text-xs text-[#64748B]">
                Log in with a volunteer account to apply.
              </p>
              <Link
                to="/login"
                className="block rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-center text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
              >
                Log In to Apply
              </Link>
            </div>
          ) : !isVolunteer ? (
            <p className="mt-4 text-sm text-[#64748B]">
              Volunteer applications are available to accounts with the
              volunteer role.
            </p>
          ) : applicationsLoading ? (
            <p className="mt-4 text-sm text-[#64748B]">
              Checking your application...
            </p>
          ) : existingVolunteerApplication ? (
            <div className="mt-4">
              <div
                className={`mb-2 text-sm font-semibold ${getApplicationStatusColor(
                  existingVolunteerApplication.status,
                )}`}
              >
                &#10003; {getApplicationStatusLabel(
                  existingVolunteerApplication.status,
                )}
              </div>

              <Link
                to="/volunteer/applications"
                className="block rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-center text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
              >
                View Application
              </Link>
            </div>
          ) : applicationsError ? (
            <div className="mt-4">
              <p className="mb-2 text-xs text-red-600">
                {applicationsError}
              </p>
              <button
                type="button"
                onClick={fetchVolunteerApplications}
                className="w-full rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
              >
                Retry
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsApplyOpen(true)}
              className="mt-4 block w-full rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-center text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
            >
              Apply as Volunteer
            </button>
          )}
        </div>
      </div>

      {isApplyOpen && (
        <ApplyModal
          eventId={eventId}
          eventName="Event"
          role="Volunteer"
          onClose={() => setIsApplyOpen(false)}
          onSubmitted={fetchVolunteerApplications}
        />
      )}
    </div>
  );
}
