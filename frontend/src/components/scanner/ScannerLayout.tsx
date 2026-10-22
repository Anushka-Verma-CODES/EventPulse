import { NavLink, Outlet } from "react-router-dom";
import ScannerHeader from "../scanner/ScannerHeader";

const navigation = [
  { label: "Dashboard", to: "/scanner/dashboard", end: true },
  { label: "My Events", to: "/scanner/events", end: true },
  { label: "Scan History", to: "/scanner/history", end: true },
];

export default function ScannerLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      <ScannerHeader />

      <div className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <nav
          aria-label="Scanner navigation"
          className="mx-auto mb-6 flex w-full max-w-[1440px] gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-[1440px] min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
