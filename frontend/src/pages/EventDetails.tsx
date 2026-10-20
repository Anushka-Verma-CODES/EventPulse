import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EventHero from "../components/events/EventHero";
import RegistrationOptions from "../components/events/RegistrationOptions";
import TicketMarketplace from "../components/events/TicketMarketplace";
import EventOverview from "../components/events/EventOverview";
import EventFAQ from "../components/events/EventFAQ";
import LiveEntryStatus from "../components/events/LiveEntryStatus";
import {
  getEventById,
  getMyRegistrations,
} from "../features/events/api/eventsApi";
import type { EventItem } from "../types/event";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(true);
  const [registrationError, setRegistrationError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Event ID is missing.");
      setLoading(false);
      setRegistrationLoading(false);
      setRegistrationError("Event ID is missing.");
      return;
    }

    setLoading(true);
    setEvent(null);
    setError("");

    setIsRegistered(false);
    setRegistrationLoading(true);
    setRegistrationError("");

    getEventById(id)
      .then((result) => {
        if (!result) {
          setError("Event not found.");
          return;
        }

        setEvent(result);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Failed to load event."
        );
      })
      .finally(() => {
        setLoading(false);
      });

    getMyRegistrations()
      .then((registrations) => {
        setIsRegistered(
          registrations.some((registration) => registration.eventId === id)
        );
        setRegistrationError("");
      })
      .catch((err: unknown) => {
        setRegistrationError(
          err instanceof Error
            ? err.message
            : "Unable to check registration status."
        );
      })
      .finally(() => {
        setRegistrationLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p>Loading event...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-red-600">{error || "Event not found."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <EventHero event={event} />

      <div className="mt-6">
        <RegistrationOptions
          eventId={event.id}
          price={event.price}
          isRegistered={isRegistered}
          registrationLoading={registrationLoading}
          registrationError={registrationError}
        />
      </div>

      <div className="mt-6">
        <TicketMarketplace eventId={event.id} />
      </div>

      <div className="mt-6">
        <EventOverview event={event} />
      </div>

      <div className="mt-6">
        <LiveEntryStatus />
      </div>

      <div className="mt-6">
        <EventFAQ />
      </div>
    </div>
  );
}
