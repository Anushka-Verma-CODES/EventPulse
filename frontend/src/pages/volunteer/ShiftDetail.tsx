import { useState } from "react";
import { useParams } from "react-router-dom";
import { shifts } from "../../lib/volunteerMockData";
import StatusBadge from "../../components/volunteer/StatusBadge";

function currentTimeLabel() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ShiftDetail() {
  const { shiftId } = useParams();
  const shift = shifts.find((s) => s.id === shiftId) ?? shifts[0];

  const [checkIn, setCheckIn] = useState<string | null>(shift.checkIn);
  const [checkOut, setCheckOut] = useState<string | null>(shift.checkOut);

  function handleCheckIn() {
    setCheckIn(currentTimeLabel());
  }

  function handleCheckOut() {
    setCheckOut(currentTimeLabel());
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">{shift.event}</h2>
      <p className="mt-1 text-base font-medium text-[#1E293B]">{shift.role}</p>
      <p className="mt-1 text-sm text-[#64748B]">
        {shift.date} &bull; {shift.time}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-xs text-[#64748B]">Location</div>
          <div className="mt-1 text-sm font-medium text-[#1E293B]">{shift.location}</div>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-xs text-[#64748B]">Organizer</div>
          <div className="mt-1 text-sm font-medium text-[#1E293B]">{shift.organizer}</div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1E293B]">Shift Status</h3>
          <StatusBadge status={shift.status} />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-[#1E293B]">Your Responsibilities</h3>
        <ul className="flex flex-col gap-1.5 text-sm text-[#64748B]">
          {shift.responsibilities.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 text-[#16A34A]">&#10003;</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-[#1E293B]">Shift Attendance</h3>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-xs text-[#64748B]">Check-in</div>
            <div className="text-sm font-medium text-[#1E293B]">{checkIn ?? "\u2014"}</div>
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Check-out</div>
            <div className="text-sm font-medium text-[#1E293B]">{checkOut ?? "\u2014"}</div>
          </div>
          {checkIn && checkOut && <StatusBadge status="Completed" />}
        </div>

        <div className="mt-4 flex gap-2">
          {!checkIn && (
            <button
              type="button"
              onClick={handleCheckIn}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
            >
              Check In
            </button>
          )}
          {checkIn && !checkOut && (
            <button
              type="button"
              onClick={handleCheckOut}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
            >
              Check Out
            </button>
          )}
          {checkIn && !checkOut && (
            <span className="self-center text-sm text-[#16A34A]">
              &#10003; Checked in successfully
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
