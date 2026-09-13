import { useState } from "react";

interface ManualCodeEntryProps {
  onSubmit: (code: string) => void;
}

export function ManualCodeEntry({ onSubmit }: ManualCodeEntryProps) {
  const [code, setCode] = useState("");

  const submit = () => {
    if (!code.trim()) return;
    onSubmit(code.trim());
    setCode("");
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-2 text-sm font-medium text-gray-700">Enter ticket code manually</div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="TKT-10291"
          autoFocus
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={submit}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Validate
        </button>
      </div>
    </div>
  );
}
