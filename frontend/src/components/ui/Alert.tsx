import { ReactNode } from "react";

type AlertTone = "error" | "success" | "info";

interface AlertProps {
  tone: AlertTone;
  children: ReactNode;
}

const toneStyles: Record<AlertTone, string> = {
  error: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
  success: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]",
  info: "bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]",
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
