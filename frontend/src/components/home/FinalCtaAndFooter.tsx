
import { Link } from "react-router-dom";

export function FinalCta() {
  return (
    <section className="bg-[#EFF6FF] py-16 text-center">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-2xl font-bold text-[#1E293B]">
          Ready to experience better event management?
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
          Explore upcoming events or get started with EventPulse
          to manage your own events.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8]"
          >
            Get Started
          </Link>

          <Link
            to="/events"
            className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
          >
            Explore Events
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-2 text-sm font-semibold text-[#1E293B]">
            EventPulse
          </div>

          <p className="text-xs leading-relaxed text-[#64748B]">
            A web-based event operations platform for planning,
            managing and monitoring events.
          </p>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#1E293B]">
            Explore
          </div>

          <ul className="flex flex-col gap-2 text-xs text-[#64748B]">
            <li>
              <Link to="/" className="hover:text-[#2563EB]">
                Home
              </Link>
            </li>
            <li>
              <Link to="/events" className="hover:text-[#2563EB]">
                Explore Events
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#1E293B]">
            Account
          </div>

          <ul className="flex flex-col gap-2 text-xs text-[#64748B]">
            <li>
              <Link to="/login" className="hover:text-[#2563EB]">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-[#2563EB]">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#1E293B]">
            Project Team
          </div>

          <ul className="flex flex-col gap-1 text-xs text-[#64748B]">
            <li>Arpit Goswami</li>
            <li>Anushka Verma</li>
            <li>Rajat Sharma</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-[#64748B] sm:flex-row">
          <span>
            © 2026 EventPulse · Thapar Institute of Engineering and Technology
          </span>
          <span>Built as a Software Engineering project</span>
        </div>
      </div>
    </footer>
  );
}
