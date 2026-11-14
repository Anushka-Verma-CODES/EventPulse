
import { useEffect, useState } from "react";
import StatGrid from "./StatGrid";
import {
  volunteerAvailability,
  volunteerCertificates,
} from "../../lib/profileMockData";
import {
  getMyVolunteerProfile,
  updateMyVolunteerProfile,
  getMyVolunteerActivity,
} from "../../features/volunteers/api/volunteersApi";
import type { VolunteerActivityStats } from "../../features/volunteers/api/volunteersApi";

function parseList(value: string): string[] {
  return [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

// This section appears inside the Personal Information card.
export function VolunteerSkillsSection() {
  const [volunteerId, setVolunteerId] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillsDraft, setSkillsDraft] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSkills() {
      try {
        const profile = await getMyVolunteerProfile();

        if (isMounted) {
          setVolunteerId(`VOL-${profile.id.toUpperCase()}`);
          setSkills(profile.skills);
          setSkillsDraft(profile.skills.join(", "));
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your skills.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadSkills();

    return () => {
      isMounted = false;
    };
  }, []);

  async function saveSkills() {
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const profile = await updateMyVolunteerProfile({
        skills: parseList(skillsDraft),
      });

      setSkills(profile.skills);
      setSkillsDraft(profile.skills.join(", "));
      setIsEditing(false);
      setSuccess("Your skills have been saved.");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your skills.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mt-5 border-t border-gray-100 pt-5">
        <h3 className="mb-3 text-sm font-semibold text-[#1E293B]">
          Volunteer Information
        </h3>
        <p className="text-sm text-[#64748B]">
          Loading volunteer information...
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 border-t border-gray-100 pt-5">
      <h3 className="mb-3 text-sm font-semibold text-[#1E293B]">
        Volunteer Information
      </h3>

      <div className="mb-4">
        <div className="text-xs text-[#64748B]">Volunteer ID</div>
        <div className="mt-1 text-sm font-semibold text-[#2563EB]">
          {volunteerId || "—"}
        </div>
      </div>

      <h4 className="mb-2 text-sm font-medium text-[#1E293B]">
        Skills
      </h4>

      {error && (
        <p role="alert" className="mb-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="mb-3 text-sm text-green-700">
          {success}
        </p>
      )}

      {isEditing ? (
        <>
          <label
            htmlFor="volunteer-skills"
            className="mb-2 block text-xs text-[#64748B]"
          >
            Enter skills separated by commas
          </label>

          <textarea
            id="volunteer-skills"
            value={skillsDraft}
            onChange={(event) => setSkillsDraft(event.target.value)}
            placeholder="Communication, Event Management, First Aid"
            rows={3}
            className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={saveSkills}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Skills"}
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                setSkillsDraft(skills.join(", "));
                setIsEditing(false);
                setError("");
              }}
              className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC] disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-[#F8FAFC] px-3 py-1 text-sm text-[#1E293B]"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-[#64748B]">
                No skills added yet.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setSkillsDraft(skills.join(", "));
              setIsEditing(true);
              setError("");
              setSuccess("");
            }}
            className="mt-3 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
          >
            Edit Skills
          </button>
        </>
      )}
    </div>
  );
}

// These sections appear as separate cards below Personal Information.
export default function VolunteerSection() {
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);

  const [activity, setActivity] = useState<VolunteerActivityStats>({
    eventsCompleted: 0,
    totalVolunteerHours: 0,
    activeAssignments: 0,
  });

  const [rolesDraft, setRolesDraft] = useState("");

  const [isEditingRoles, setIsEditingRoles] = useState(false);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(true);

  const [savingSection, setSavingSection] = useState("");
  const [error, setError] = useState("");
  const [activityError, setActivityError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const profile = await getMyVolunteerProfile();

        if (isMounted) {
          setPreferredRoles(profile.preferredRoles);
          setAvailability(profile.availability);
          setRolesDraft(profile.preferredRoles.join(", "));
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your volunteer profile.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }

      try {
        const stats = await getMyVolunteerActivity();

        if (isMounted) setActivity(stats);
      } catch (err: unknown) {
        if (isMounted) {
          setActivityError(
            err instanceof Error
              ? err.message
              : "Unable to load volunteer activity.",
          );
        }
      } finally {
        if (isMounted) setIsActivityLoading(false);
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function saveSection(
    section: "preferredRoles" | "availability",
    values: string[],
  ) {
    setError("");
    setSuccess("");
    setSavingSection(section);

    try {
      const profile = await updateMyVolunteerProfile({
        [section]: values,
      });

      setPreferredRoles(profile.preferredRoles);
      setAvailability(profile.availability);
      setRolesDraft(profile.preferredRoles.join(", "));
      setSuccess("Your changes have been saved.");

      if (section === "preferredRoles") setIsEditingRoles(false);
      if (section === "availability") setIsEditingAvailability(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your changes.",
      );
    } finally {
      setSavingSection("");
    }
  }

  function toggleAvailability(label: string) {
    setAvailability((previous) =>
      previous.includes(label)
        ? previous.filter((item) => item !== label)
        : [...previous, label],
    );
  }

  const activityStats = [
    {
      label: "Events Completed",
      value: String(activity.eventsCompleted),
    },
    {
      label: "Volunteer Hours",
      value: String(activity.totalVolunteerHours),
    },
    {
      label: "Active Assignments",
      value: String(activity.activeAssignments),
    },
  ];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-[#64748B]">
          Loading volunteer details...
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      {/* Preferred Roles */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-[#1E293B]">
          Preferred Roles
        </h3>

        {isEditingRoles ? (
          <>
            <label
              htmlFor="volunteer-roles"
              className="mb-2 block text-xs text-[#64748B]"
            >
              Enter preferred roles separated by commas
            </label>

            <textarea
              id="volunteer-roles"
              value={rolesDraft}
              onChange={(event) => setRolesDraft(event.target.value)}
              placeholder="Registration Desk, Event Coordination"
              rows={3}
              className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={savingSection !== ""}
                onClick={() =>
                  saveSection("preferredRoles", parseList(rolesDraft))
                }
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {savingSection === "preferredRoles"
                  ? "Saving..."
                  : "Save Preferences"}
              </button>

              <button
                type="button"
                disabled={savingSection !== ""}
                onClick={() => {
                  setRolesDraft(preferredRoles.join(", "));
                  setIsEditingRoles(false);
                  setError("");
                }}
                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC] disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {preferredRoles.length > 0 ? (
              <ul className="flex flex-col gap-1.5 text-sm text-[#1E293B]">
                {preferredRoles.map((role) => (
                  <li key={role}>&#10003; {role}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#64748B]">
                No preferred roles added yet.
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setRolesDraft(preferredRoles.join(", "));
                setIsEditingRoles(true);
                setError("");
                setSuccess("");
              }}
              className="mt-3 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
            >
              Edit Preferences
            </button>
          </>
        )}
      </div>

      {/* Availability */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-[#1E293B]">
          Availability
        </h3>

        <div className="flex flex-col gap-2">
          {volunteerAvailability.map((item) => (
            <label
              key={item.label}
              className="flex items-center gap-2 text-sm text-[#1E293B]"
            >
              <input
                type="checkbox"
                checked={availability.includes(item.label)}
                disabled={!isEditingAvailability || savingSection !== ""}
                onChange={() => toggleAvailability(item.label)}
                className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
              {item.label}
            </label>
          ))}
        </div>

        {isEditingAvailability ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={savingSection !== ""}
              onClick={() => saveSection("availability", availability)}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {savingSection === "availability"
                ? "Saving..."
                : "Save Availability"}
            </button>

            <button
              type="button"
              disabled={savingSection !== ""}
              onClick={async () => {
                setError("");

                try {
                  const profile = await getMyVolunteerProfile();
                  setAvailability(profile.availability);
                } catch (err: unknown) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Unable to reload availability.",
                  );
                }

                setIsEditingAvailability(false);
              }}
              className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC] disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsEditingAvailability(true);
              setError("");
              setSuccess("");
            }}
            className="mt-3 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
          >
            Edit Availability
          </button>
        )}
      </div>

      {/* Volunteer Activity */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-[#1E293B]">
          Volunteer Activity
        </h3>

        {isActivityLoading ? (
          <p className="text-sm text-[#64748B]">
            Loading activity statistics...
          </p>
        ) : activityError ? (
          <p role="alert" className="text-sm text-red-600">
            {activityError}
          </p>
        ) : (
          <StatGrid stats={activityStats} />
        )}
      </div>

      {/* Certificates */}
      {volunteerCertificates.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-[#1E293B]">
            Certificates
          </h3>

          {volunteerCertificates.map((cert) => (
            <div
              key={cert.event}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <div className="font-medium text-[#1E293B]">
                  {cert.event}
                </div>
                <div className="text-[#64748B]">
                  {cert.title} &bull; Issued: {cert.issuedOn}
                </div>
              </div>

              <button
                type="button"
                className="text-xs font-medium text-[#2563EB] hover:underline"
              >
                View Certificate
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
