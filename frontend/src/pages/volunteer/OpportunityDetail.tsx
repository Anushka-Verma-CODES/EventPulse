
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ApplyModal from "../../components/volunteer/ApplyModal";

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  location: string;
  startDate: string;
  endDate?: string;
  status?: string;
};

export default function OpportunityDetail() {
  const { opportunityId } = useParams();
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      if (!opportunityId) {
        setError("No event was specified.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setEvent(null);

        const response = await fetch(
          `http://localhost:3000/events/${opportunityId}`
        );

        if (response.status === 404) {
          throw new Error("This event could not be found.");
        }

        if (!response.ok) {
          throw new Error("Unable to load this event. Please try again.");
        }

        const data: EventItem = await response.json();

        if (data.status && data.status.toLowerCase() !== "published") {
          throw new Error("This event is not currently available.");
        }

        setEvent(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading this event."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [opportunityId]);

  function formatDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date to be announced";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <p className="text-sm text-[#64748B]">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1E293B]">
          Event unavailable
        </h2>
        <p className="mt-2 text-sm text-[#64748B]">
          {error || "This volunteer opportunity could not be found."}
        </p>
        <Link
          to="/volunteer/opportunities"
          className="mt-4 inline-block text-sm font-medium text-[#2563EB] hover:underline"
        >
          Back to Opportunities
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/volunteer/opportunities"
        className="text-sm font-medium text-[#2563EB] hover:underline"
      >
        &larr; Back to Opportunities
      </Link>

      <h2 className="mt-4 text-2xl font-bold text-[#1E293B]">
        {event.title}
      </h2>

      <p className="mt-1 text-base font-medium text-[#1E293B]">
        Volunteer Opportunity
      </p>

      <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#64748B]">
        <span>&#128197; {formatDate(event.startDate)}</span>
        {event.endDate && event.endDate !== event.startDate && (
          <span>&#127991; Ends {formatDate(event.endDate)}</span>
        )}
        <span>&#128205; {event.location}</span>
      </div>

      <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#1E293B]">
          About the Event
        </h3>
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#64748B]">
          {event.description || "No event description has been provided."}
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#1E293B]">
          Volunteer Application
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#64748B]">
          Interested in helping at this event? Submit your application with
          your reason for volunteering and your availability. The organizer
          will review your application.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-[#1E293B]">
            Want to volunteer?
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Apply to be considered for this event.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsApplyOpen(true)}
          className="shrink-0 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8]"
        >
          Apply as Volunteer
        </button>
      </div>

      {isApplyOpen && (
        <ApplyModal
          eventId={event.id}
          eventName={event.title}
          role="Volunteer"
          onClose={() => setIsApplyOpen(false)}
        />
      )}
    </div>
  );
}
