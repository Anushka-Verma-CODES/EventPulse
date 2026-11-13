
import { useCallback, useEffect, useState } from "react";
import {
  getLiveEntryStatus,
  type LiveEntryStatusData,
} from "../../features/events/api/liveEntryStatusApi";

interface LiveEntryStatusProps {
  eventId: string;
}

export default function LiveEntryStatus({
  eventId,
}: LiveEntryStatusProps) {
  const [data, setData] = useState<LiveEntryStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStatus = useCallback(async () => {
    try {
      const result = await getLiveEntryStatus(eventId);
      setData(result);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load live entry status.",
      );
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    setLoading(true);
    setData(null);

    loadStatus();

    const interval = window.setInterval(() => {
      loadStatus();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [loadStatus]);

  const getTrafficColor = (level: string) => {
    switch (level) {
      case "Very High":
        return "text-red-700";
      case "High":
        return "text-orange-600";
      case "Moderate":
        return "text-yellow-600";
      default:
        return "text-green-600";
    }
  };

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <h2 className="text-lg font-semibold text-[#1E293B]">
            Live Entry Status
          </h2>
        </div>

        <span className="text-xs text-[#64748B]">
          Auto-refreshes every 15 seconds
        </span>
      </div>

      {loading && !data && (
        <p className="py-4 text-sm text-[#64748B]">
          Loading live entry information...
        </p>
      )}

      {error && !data && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {data && (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-[#64748B]">Total entries</p>
              <p className="mt-1 text-2xl font-semibold text-[#1E293B]">
                {data.totalEntries}
              </p>
              <p className="mt-1 text-xs text-[#64748B]">
                In the last {data.monitoringWindowMinutes} minutes
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-[#64748B]">Recommended gate</p>
              <p className="mt-1 text-xl font-semibold text-green-700">
                {data.recommendedGate?.gateName || "No active gates"}
              </p>
              <p className="mt-1 text-xs text-[#64748B]">
                Based on recent entry activity
              </p>
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1E293B]">
              Gate activity
            </h3>
            <span className="text-xs text-[#64748B]">
              Average scans/min
            </span>
          </div>

          {data.gates.length === 0 ? (
            <p className="py-4 text-sm text-[#64748B]">
              No active gates are configured for this event.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-[#E2E8F0]">
              {data.gates.map((gate) => (
                <div
                  key={gate.gateId}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-[#1E293B]">
                      {gate.gateName}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {gate.entries} entries in the last{" "}
                      {data.monitoringWindowMinutes} minutes
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-medium ${getTrafficColor(
                        gate.trafficLevel,
                      )}`}
                    >
                      ● {gate.trafficLevel}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {gate.scansPerMinute} scans/min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-xs text-[#94A3B8]">
            Last updated: {new Date(data.generatedAt).toLocaleTimeString()}
          </p>
        </>
      )}

      {error && data && (
        <p className="mt-3 text-xs text-orange-600">
          Refresh failed. Showing the last successfully loaded information.
        </p>
      )}
    </div>
  );
}
