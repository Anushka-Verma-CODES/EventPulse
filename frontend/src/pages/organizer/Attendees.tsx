
import { useEffect, useState } from "react";
import { getAuthHeaders } from "../../lib/authApi";
import StatusBadge from "../../components/organizer/StatusBadge";

const API_BASE_URL = "http://localhost:3000";

const filters = ["All", "Checked In", "Not Checked In"];

type Attendee = {
  id: string;
  attendeeId: string;
  name: string;
  email: string;
  ticket: string;
  eventName: string;
  registeredOn: string;
  status: string;
  checkedInAt: string | null;
  gate: string;
};

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Attendees() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAttendees() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/registrations/organizer/attendees`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        const responseError = await response.json().catch(() => null);
        const message = Array.isArray(responseError?.message)
          ? responseError.message.join(", ")
          : responseError?.message;

        throw new Error(
          message || `Failed to load attendees (${response.status}).`,
        );
      }

      const data: Attendee[] = await response.json();
      setAttendees(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load attendees.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAttendees();
  }, []);

  const checkedInCount = attendees.filter(
    (attendee) => attendee.status === "Checked In",
  ).length;

  const notCheckedInCount = attendees.length - checkedInCount;

  const query = search.trim().toLowerCase();

  const filtered = attendees
    .filter(
      (attendee) =>
        activeFilter === "All" || attendee.status === activeFilter,
    )
    .filter(
      (attendee) =>
        attendee.name.toLowerCase().includes(query) ||
        attendee.email.toLowerCase().includes(query) ||
        attendee.ticket.toLowerCase().includes(query) ||
        attendee.eventName.toLowerCase().includes(query),
    );

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">Attendees</h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">
            {attendees.length}
          </div>
          <div className="mt-1 text-xs text-[#64748B]">Registered</div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">
            {checkedInCount}
          </div>
          <div className="mt-1 text-xs text-[#64748B]">Checked In</div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">
            {notCheckedInCount}
          </div>
          <div className="mt-1 text-xs text-[#64748B]">
            Not Checked In
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-[#64748B] hover:bg-[#F8FAFC]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, ticket or event"
          className="w-full max-w-xs rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadAttendees()}
            className="font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        {loading ? (
          <div className="px-4 py-12 text-center text-sm text-[#64748B]">
            Loading attendees...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="font-medium text-[#1E293B]">
              {attendees.length === 0
                ? "No registrations yet."
                : "No attendees match your search or filter."}
            </p>
            <p className="mt-1 text-sm text-[#64748B]">
              {attendees.length === 0
                ? "Attendees will appear here when they register for your events."
                : "Try another search term or filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Ticket</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Registered</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Gate</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((attendee) => (
                  <tr key={attendee.id}>
                    <td className="px-4 py-3 font-medium text-[#1E293B]">
                      {attendee.name}
                    </td>

                    <td className="px-4 py-3 text-[#64748B]">
                      {attendee.email}
                    </td>

                    <td className="px-4 py-3 text-[#64748B]">
                      {attendee.ticket}
                    </td>

                    <td className="px-4 py-3 text-[#64748B]">
                      {attendee.eventName}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[#64748B]">
                      {formatDate(attendee.registeredOn)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={attendee.status} />
                    </td>

                    <td className="px-4 py-3 text-[#64748B]">
                      {attendee.gate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-3 text-sm text-[#64748B]">
        Showing {filtered.length} of {attendees.length} registrations
      </div>
    </div>
  );
}
