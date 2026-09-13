import StatCard from "../../components/organizer/StatCard";
import StatusBadge from "../../components/organizer/StatusBadge";
import { volunteerOverview, volunteers, volunteerApplications, volunteerShifts } from "../../lib/organizerMockData";

export default function Volunteers() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">Volunteers</h2>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {volunteerOverview.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <div className="border-b border-[#E2E8F0] px-5 py-3 text-sm font-semibold text-[#1E293B]">
          Volunteers
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Shift</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {volunteers.map((v) => (
              <tr key={v.name}>
                <td className="px-4 py-3 font-medium text-[#1E293B]">{v.name}</td>
                <td className="px-4 py-3 text-[#64748B]">{v.role}</td>
                <td className="px-4 py-3 text-[#64748B]">{v.event}</td>
                <td className="px-4 py-3 text-[#64748B]">{v.shift}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={v.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <div className="border-b border-[#E2E8F0] px-5 py-3 text-sm font-semibold text-[#1E293B]">
          Applications
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
            <tr>
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Applied On</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {volunteerApplications.map((app) => (
              <tr key={app.applicant}>
                <td className="px-4 py-3 font-medium text-[#1E293B]">{app.applicant}</td>
                <td className="px-4 py-3 text-[#64748B]">{app.role}</td>
                <td className="px-4 py-3 text-[#64748B]">{app.event}</td>
                <td className="px-4 py-3 text-[#64748B]">{app.appliedOn}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-4 py-3">
                  {app.status === "Pending" && (
                    <div className="flex gap-2">
                      <button className="text-xs font-medium text-[#16A34A] hover:underline">
                        Accept
                      </button>
                      <button className="text-xs font-medium text-[#DC2626] hover:underline">
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-[#1E293B]">Volunteer Shifts</h3>
        <div className="flex flex-col divide-y divide-[#E2E8F0]">
          {volunteerShifts.map((shift) => (
            <div key={shift.location} className="flex items-center justify-between py-2.5 text-sm">
              <span className="font-medium text-[#1E293B]">{shift.location}</span>
              <span className="text-[#64748B]">{shift.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
