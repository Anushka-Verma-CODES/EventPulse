import { useParams } from "react-router-dom";
import EventHero from "../components/events/EventHero";
import RegistrationOptions from "../components/events/RegistrationOptions";
import TicketMarketplace from "../components/events/TicketMarketplace";
import EventOverview from "../components/events/EventOverview";
import EventFAQ from "../components/events/EventFAQ";
import LiveEntryStatus from "../components/events/LiveEntryStatus";
import { mockEventDetail } from "../lib/registrationMockData";

// This is a fuller version of the Event Details page than the original
// EventDetailsPage — replace that route's element with this component,
// or merge these sections into your existing file, whichever is easier
// given what else that file already does.
export default function EventDetails() {
  const { eventId } = useParams();
  const resolvedEventId = eventId ?? mockEventDetail.id;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <EventHero />

      <div className="mt-6">
        <RegistrationOptions eventId={resolvedEventId} />
      </div>

      <div className="mt-6">
        <TicketMarketplace />
      </div>

      <div className="mt-6">
        <EventOverview />
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
