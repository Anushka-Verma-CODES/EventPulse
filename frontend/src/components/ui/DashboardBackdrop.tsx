export default function DashboardBackdrop() {
  return (
    <>
      <style>{`
        @keyframes dashboardGridDrift {
          from { background-position: 0 0, 0 0; }
          to { background-position: 32px 24px, -48px 0; }
        }

        @keyframes dashboardSweep {
          0%, 100% { opacity: 0.3; transform: translateX(-12%) skewX(-12deg); }
          50% { opacity: 0.62; transform: translateX(12%) skewX(-12deg); }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden bg-[#F1F6FF]"
      >
        <div
          className="absolute -inset-20 opacity-100"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37,99,235,0.11) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.11) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            animation: "dashboardGridDrift 18s linear infinite",
          }}
        />
        <div
          className="absolute -left-1/4 top-0 h-40 w-3/4 bg-gradient-to-r from-transparent via-[#93C5FD] to-transparent blur-2xl"
          style={{ animation: "dashboardSweep 9s ease-in-out infinite" }}
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#DBEAFE]/70 to-transparent" />
      </div>
    </>
  );
}
