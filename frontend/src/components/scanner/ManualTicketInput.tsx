import { FormEvent, useState } from "react";

interface ManualTicketInputProps {
  onSubmit: (code: string) => void;
  onCancel: () => void;
}

export default function ManualTicketInput({ onSubmit, onCancel }: ManualTicketInputProps) {
  const [code, setCode] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!code.trim()) return;
    onSubmit(code);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <label className="text-base font-medium text-[#1E293B]">Enter Ticket Code</label>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="TKT-10291"
        autoFocus
        className="mt-2 w-full rounded-lg border border-[#E2E8F0] px-4 py-4 text-center text-lg font-medium uppercase tracking-wide outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
      />
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-[#E2E8F0] px-4 py-3.5 text-base font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-[#2563EB] px-4 py-3.5 text-base font-medium text-white hover:bg-[#1D4ED8]"
        >
          Validate Ticket
        </button>
      </div>
    </form>
  );
}
