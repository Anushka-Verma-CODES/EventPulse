import { ReactNode } from "react";

type AlertTone = "error" | "success" | "info";

interface AlertProps {
  tone: AlertTone;
  children: ReactNode;
}

const toneStyles: Record<AlertTone, string> = {
  error: "bg-[#FDECEC] text-[#8A2626] border-[#F6C6C6]",
  success: "bg-[#E9F9F1] text-[#0E5C3D] border-[#B9EBD3]",
  info: "bg-[#EAF0FF] text-[#1E3B8A] border-[#C9D8FF]",
};

export default function Alert({ tone, children }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3 py-2.5 text-sm ${toneStyles[tone]}`}
    >
      {children}
    </div>
  );
}
