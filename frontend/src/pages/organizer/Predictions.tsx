
import { useCallback, useEffect, useMemo, useState } from "react";
import HistoricalTrafficChart from "../../components/organizer/HistoricalTrafficChart";
import { getMyEvents } from "../../features/events/api/eventsApi";
import { API_BASE_URL } from "../../lib/apiConfig";
import { getAuthHeaders } from "../../lib/authApi";

type OrganizerEvent = {
  id: string;
  name?: string;
  title?: string;
  status?: string;
};

type PredictionWindow = {
  entries: number;
  start?: string;
  end?: string;
};

type GatePrediction = {
  gateId: string;
  gateName: string;
  gateCode: string;
  isActive: boolean;
  currentWindow: PredictionWindow;
  previousWindow: {
    entries: number;
  };
  thirdWindow: {
    entries: number;
  };
  predictedEntries: number;
  trafficLevel: string;
  recommendation: string;
};

type PredictionResponse = {
  eventId: string;
  eventTitle?: string;
  generatedAt?: string;
  totalCurrentEntries: number;
  totalPredictedEntries: number;
  activeGates: number;
  gates: GatePrediction[];
};

function getTrafficStyles(level: string) {
  switch (level?.toLowerCase()) {
    case "moderate":
      return "bg-amber-100 text-amber-700";
    case "high":
      return "bg-orange-100 text-orange-700";
    case "very high":
    case "very_high":
      return "bg-red-100 text-red-700";
    default:
      return "bg-emerald-100 text-emerald-700";
  }
}

function getTrafficLabel(level: string) {
  if (level?.toLowerCase() === "very_high") {
    return "Very High";
  }

  return level || "Normal";
}

export default function Predictions() {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [predictionData, setPredictionData] =
    useState<PredictionResponse | null>(null);

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);

      const response = await getMyEvents();
      const eventList = Array.isArray(response) ? response : [];

      const activeEvents = eventList.filter(
        (event: OrganizerEvent) => event.status !== "cancelled",
      );

      setEvents(activeEvents);

      setSelectedEventId((current) => {
        if (
          current &&
          activeEvents.some((event: OrganizerEvent) => event.id === current)
        ) {
          return current;
        }

        return activeEvents[0]?.id ?? "";
      });
    } catch (err) {
      console.error("Failed to load organizer events:", err);
      setError("Unable to load your events.");
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  const loadPredictions = useCallback(async () => {
    if (!selectedEventId) {
      setPredictionData(null);
      return;
    }

    try {
      setLoadingPredictions(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/events/${selectedEventId}/gate-predictions`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch gate predictions.");
      }

      const data: PredictionResponse = await response.json();
      setPredictionData(data);
    } catch (err) {
      console.error("Failed to load gate predictions:", err);
      setPredictionData(null);
      setError("Unable to load gate predictions. Please try again.");
    } finally {
      setLoadingPredictions(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (!selectedEventId) {
      setPredictionData(null);
      return;
    }

    loadPredictions();

    const interval = setInterval(() => {
      loadPredictions();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedEventId, loadPredictions]);

  const activeGates = useMemo(
    () => predictionData?.gates?.filter((gate) => gate.isActive) ?? [],
    [predictionData],
  );

  const historicalGates = useMemo(
    () =>
      activeGates.map((gate) => ({
        gateId: gate.gateId,
        gateName: gate.gateName,
        thirdWindowEntries: gate.thirdWindow?.entries ?? 0,
        previousWindowEntries: gate.previousWindow?.entries ?? 0,
        latestWindowEntries: gate.currentWindow?.entries ?? 0,
        predictedEntries: gate.predictedEntries ?? 0,
      })),
    [activeGates],
  );

  const selectedEvent = events.find(
    (event) => event.id === selectedEventId,
  );

  if (loadingEvents) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Loading your events...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">
            Gate Traffic Prediction
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Monitor recent gate entries and estimate traffic for the next
            five minutes.
          </p>
        </div>

        <button
          onClick={loadPredictions}
          disabled={!selectedEventId || loadingPredictions}
          className="rounded-lg border border-[#CBD5E1] bg-white px-4 py-2 text-sm font-medium text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingPredictions ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
        <label
          htmlFor="prediction-event"
          className="mb-2 block text-sm font-semibold text-[#334155]"
        >
          Select Event
        </label>

        <select
          id="prediction-event"
          value={selectedEventId}
          onChange={(event) => setSelectedEventId(event.target.value)}
          className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm text-[#334155] outline-none focus:border-blue-500 sm:max-w-md"
        >
          {events.length === 0 && (
            <option value="">No events available</option>
          )}

          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name || event.title || "Untitled Event"}
            </option>
          ))}
        </select>

        {selectedEvent && (
          <p className="mt-2 text-xs text-[#94A3B8]">
            Showing predictions for{" "}
            {selectedEvent.name || selectedEvent.title || "selected event"}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!selectedEventId && (
        <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center">
          <p className="font-medium text-[#334155]">
            No events available
          </p>
          <p className="mt-1 text-sm text-[#64748B]">
            Create an event to start viewing gate traffic predictions.
          </p>
        </div>
      )}

      {selectedEventId && loadingPredictions && !predictionData && (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
          Loading gate predictions...
        </div>
      )}

      {predictionData && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
              <p className="text-sm font-medium text-[#64748B]">
                Active Gates
              </p>
              <p className="mt-2 text-3xl font-bold text-[#1E293B]">
                {predictionData.activeGates ?? activeGates.length}
              </p>
              <p className="mt-1 text-xs text-[#94A3B8]">
                Currently active gates
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
              <p className="text-sm font-medium text-[#64748B]">
                Entries in Last 5 Minutes
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {predictionData.totalCurrentEntries ?? 0}
              </p>
              <p className="mt-1 text-xs text-[#94A3B8]">
                Successful check-ins
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
              <p className="text-sm font-medium text-[#64748B]">
                Predicted Entries
              </p>
              <p className="mt-2 text-3xl font-bold text-indigo-600">
                {predictionData.totalPredictedEntries ?? 0}
              </p>
              <p className="mt-1 text-xs text-[#94A3B8]">
                Estimated entries in the next 5 minutes
              </p>
            </div>
          </div>

          <HistoricalTrafficChart gates={historicalGates} />

          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#1E293B]">
                Gate-wise Predictions
              </h3>
              <p className="mt-1 text-sm text-[#64748B]">
                Current traffic conditions and estimated entries for each
                active gate.
              </p>
            </div>

            {activeGates.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center">
                <p className="font-medium text-[#334155]">
                  No active gates found
                </p>
                <p className="mt-1 text-sm text-[#64748B]">
                  Activate a gate to start monitoring its traffic.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {activeGates.map((gate) => {
                  const currentEntries =
                    gate.currentWindow?.entries ?? 0;

                  return (
                    <div
                      key={gate.gateId}
                      className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-[#1E293B]">
                            {gate.gateName}
                          </h4>
                          <p className="mt-1 text-xs text-[#94A3B8]">
                            Gate traffic status
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getTrafficStyles(
                            gate.trafficLevel,
                          )}`}
                        >
                          {getTrafficLabel(gate.trafficLevel)}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-slate-50 p-4">
                          <p className="text-xs text-[#64748B]">
                            Last 5 minutes
                          </p>
                          <p className="mt-1 text-2xl font-bold text-[#334155]">
                            {currentEntries}
                          </p>
                        </div>

                        <div className="rounded-lg bg-indigo-50 p-4">
                          <p className="text-xs text-indigo-600">
                            Next 5 min prediction
                          </p>
                          <p className="mt-1 text-2xl font-bold text-indigo-700">
                            {gate.predictedEntries ?? 0}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex justify-between text-xs text-[#64748B]">
                          <span>Recent traffic</span>
                          <span>{currentEntries} entries</span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{
                              width: `${Math.min(currentEntries, 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {gate.recommendation && (
                        <p className="mt-4 text-xs text-[#64748B]">
                          {gate.recommendation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-xs text-[#94A3B8]">
            Predictions use recent successful gate check-ins. They are
            estimates and should not be treated as confirmed entries.
            {predictionData.generatedAt &&
              ` Last updated: ${new Date(
                predictionData.generatedAt,
              ).toLocaleTimeString()}`}
          </p>
        </>
      )}
    </div>
  );
}
