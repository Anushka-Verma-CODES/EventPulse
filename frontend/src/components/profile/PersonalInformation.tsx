import { useState } from "react";
import type { PersonalInfo } from "../../lib/profileMockData";

interface PersonalInformationProps {
  info: PersonalInfo;
  onSave: (info: PersonalInfo) => void;
}

export default function PersonalInformation({ info, onSave }: PersonalInformationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(info);

  function handleSave() {
    onSave(draft);
    setIsEditing(false);
  }

  function handleCancel() {
    setDraft(info);
    setIsEditing(false);
  }

  const fields: { key: keyof PersonalInfo; label: string }[] = [
    { key: "fullName", label: "Full Name" },
    { key: "email", label: "Email Address" },
    { key: "phone", label: "Phone Number" },
    { key: "organization", label: "College / Organization" },
  ];

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-[#1E293B]">Personal Information</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key}>
            <div className="text-xs text-[#64748B]">{field.label}</div>
            {isEditing ? (
              <input
                value={draft[field.key]}
                onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
            ) : (
              <div className="mt-1 text-sm font-medium text-[#1E293B]">{info[field.key]}</div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        {isEditing ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
          >
            Edit Information
          </button>
        )}
      </div>
    </div>
  );
}
