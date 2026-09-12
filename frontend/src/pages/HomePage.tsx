import Hero from "../components/home/Hero";
import ValueStrip from "../components/home/ValueStrip";
import ProblemSection from "../components/home/ProblemSection";
import HowItWorks from "../components/home/HowItWorks";
import CoreFeatures from "../components/home/CoreFeatures";
import BeforeDuringAfter from "../components/home/BeforeDuringAfter";
import LiveOperationsPreview from "../components/home/LiveOperationsPreview";
import TicketTransfer from "../components/home/TicketTransfer";
import BuiltForEveryone from "../components/home/BuiltForEveryone";
import PredictivePlanning from "../components/home/PredictivePlanning";
import ExploreEvents from "../components/home/ExploreEvents";
import TeamSection from "../components/home/TeamSection";
import FaqSection from "../components/home/FaqSection";
import { FinalCta, Footer } from "../components/home/FinalCtaAndFooter";

// Navbar is not included here — it renders globally from App.tsx
// (via <Navbar /> above <AppRoutes />), so this page starts at Hero.
//
// The faint dot-grid background below is a subtle texture, not a color
// change — it uses the same neutral gray (#E2E8F0) as the borders
// elsewhere on the page, so it reads as "textured paper" rather than
// a colored wash. Deliberately avoided any purple/blue gradient-mesh
// look since that's become a generic "AI product" cliché.
export default function HomePage() {
  return (
    <div
      className="bg-[#FCFCFD]"
      style={{
        backgroundImage: "radial-gradient(#E2E8F0 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <Hero />
      <ValueStrip />
      <ProblemSection />
      <HowItWorks />
      <CoreFeatures />
      <BeforeDuringAfter />
      <LiveOperationsPreview />
      <TicketTransfer />
      <BuiltForEveryone />
      <PredictivePlanning />
      <ExploreEvents />
      <TeamSection />
      <FaqSection />
      <FinalCta />
      <Footer />
    </div>
  );
}
