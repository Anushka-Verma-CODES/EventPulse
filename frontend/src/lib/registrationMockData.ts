export interface EventDetail {
  id: string;
  name: string;
  tags: string[];
  date: string;
  time: string;
  venue: string;
  venueAddress: string;
  description: string;
  highlights: string[];
  capacity: number;
  category: string;
  faqs: { question: string; answer: string }[];
  gates: { name: string; status: "Normal" | "High"; scansPerMin: number }[];
}

export const mockEventDetail: EventDetail = {
  id: "tech-fest-2026",
  name: "Tech Fest 2026",
  tags: ["Technology", "Competition", "Workshop"],
  date: "15 October 2026",
  time: "10:00 AM – 5:00 PM",
  venue: "Thapar Institute, Patiala",
  venueAddress: "Thapar Institute of Engineering and Technology, Patiala, Punjab",
  description:
    "Tech Fest 2026 brings together students, developers, and innovators for a day of competitions, workshops, and hands-on sessions across web development, AI, and robotics.",
  highlights: [
    "Hands-on workshops led by industry professionals",
    "Coding and robotics competitions with cash prizes",
    "Networking sessions with sponsors and alumni",
    "Live project showcases from student teams",
  ],
  capacity: 2000,
  category: "Tech",
  faqs: [
    {
      question: "Can I transfer my ticket to someone else?",
      answer: "Yes — go to My Tickets and use the Transfer Ticket option before the event starts.",
    },
    {
      question: "Is there an entry fee for volunteers?",
      answer: "No. Volunteer applications don't require any payment.",
    },
    {
      question: "What should I bring on the day?",
      answer: "Your QR ticket (digital is fine) and a valid student/photo ID.",
    },
  ],
  gates: [
    { name: "Gate 1", status: "Normal", scansPerMin: 12 },
    { name: "Gate 2", status: "High", scansPerMin: 35 },
    { name: "Gate 3", status: "Normal", scansPerMin: 8 },
  ],
};

export const volunteerRoleOptions = [
  "Registration Desk",
  "Gate Management",
  "Crowd Management",
  "Technical Support",
  "Hospitality",
  "Event Coordination",
  "Help Desk",
];

export const volunteerShiftOptions = [
  { id: "shift-1", label: "9:00 AM – 12:00 PM", role: "Registration Desk" },
  { id: "shift-2", label: "12:00 PM – 3:00 PM", role: "Gate Management" },
  { id: "shift-3", label: "3:00 PM – 6:00 PM", role: "Technical Support" },
];

// Volunteer application demo state is separate from attendee ticket registration.
interface VolunteerApplication {
  applicationId: string;
  status: "Pending" | "Approved" | "Rejected";
}

const volunteerApplications: Record<string, VolunteerApplication> = {};

export function getVolunteerApplication(eventId: string) {
  return volunteerApplications[eventId] ?? null;
}

export function submitVolunteerApplication(eventId: string) {
  const application: VolunteerApplication = {
    applicationId: `VOL-${Math.floor(10000 + Math.random() * 89999)}`,
    status: "Pending",
  };
  volunteerApplications[eventId] = application;
  return application;
}
