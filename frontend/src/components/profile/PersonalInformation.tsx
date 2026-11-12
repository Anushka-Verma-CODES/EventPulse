
import { useEffect, useState } from "react";
import type { PersonalInfo } from "../../lib/profileMockData";
import { updateMyProfile } from "../../lib/authApi";
import { useAuth } from "../../context/AuthContext";

type ProfileFormInfo = PersonalInfo & {
  studentId: string;
  department: string;
  academicYear: string;
};

interface PersonalInformationProps {
  info: ProfileFormInfo;
  onSave: (updatedInfo: ProfileFormInfo) => void;
  showAttendeeFields: boolean;
  showOrganizerFields: boolean;
  organizerId: string;
  editRequest: number;
}

export default function PersonalInformation({
  info,
  onSave,
  showAttendeeFields,
  showOrganizerFields,
  organizerId,
  editRequest,
}: PersonalInformationProps) {
  const { refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<ProfileFormInfo>(info);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(info);
  }, [info]);

  useEffect(() => {
    if (editRequest > 0) {
      setIsEditing(true);
      setError("");
    }
  }, [editRequest]);

  const handleChange = (
    field: keyof ProfileFormInfo,
    value: string
  ) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setError("");

    if (!draft.fullName.trim() || !draft.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    try {
      setIsSaving(true);

      const updatedUser = await updateMyProfile({
        fullName: draft.fullName.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        organization: draft.organization.trim(),
        ...(showAttendeeFields
          ? {
              studentId: draft.studentId.trim(),
              department: draft.department.trim(),
              academicYear: draft.academicYear.trim(),
            }
          : showOrganizerFields
            ? {
                department: draft.department.trim(),
              }
            : {}),
      });

      const updatedInfo: ProfileFormInfo = {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone ?? "",
        organization: updatedUser.organization ?? "",
        studentId: updatedUser.studentId ?? "",
        department: updatedUser.department ?? "",
        academicYear: updatedUser.academicYear ?? "",
      };

      onSave(updatedInfo);
      await refreshProfile();

      setDraft(updatedInfo);
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(info);
    setError("");
    setIsEditing(false);
  };

  const renderField = (
    label: string,
    field: keyof ProfileFormInfo
  ) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-600">
        {label}
      </label>

      {isEditing ? (
        <input
          type="text"
          value={draft[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      ) : (
        <p className="text-sm font-medium text-[#1E293B]">
          {info[field] || "Not provided"}
        </p>
      )}
    </div>
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-[#1E293B]">
        Personal Information
      </h2>

      <p className="mb-5 text-sm text-gray-500">
        Manage your personal details.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {renderField("Full Name", "fullName")}
        {renderField("Email Address", "email")}
        {renderField("Phone Number", "phone")}

        {showAttendeeFields &&
          renderField("College / Organization", "organization")}
      </div>

      {showOrganizerFields && (
        <>
          <div className="my-5 border-t border-gray-100" />

          <h2 className="mb-1 text-lg font-semibold text-[#1E293B]">
            Organizer Details
          </h2>

          <p className="mb-5 text-sm text-gray-500">
            Manage your organization information.
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {renderField("Organization", "organization")}
            {renderField("Department / Society", "department")}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Organizer ID
              </label>
              <p className="break-all text-sm font-medium text-[#1E293B]">
                {organizerId || "Not available"}
              </p>
            </div>
          </div>
        </>
      )}

      {showAttendeeFields && (
        <>
          <div className="my-5 border-t border-gray-100" />

          <h3 className="mb-4 text-sm font-semibold text-[#1E293B]">
            Attendee Information
          </h3>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {renderField("Student ID", "studentId")}
            {renderField("Department", "department")}
            {renderField("Academic Year", "academicYear")}
          </div>
        </>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {isEditing && (
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
