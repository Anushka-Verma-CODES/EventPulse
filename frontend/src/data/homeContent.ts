export const valueProps = [
  { title: "Secure QR Tickets", description: "Single-use ticket validation helps prevent duplicate entry." },
  { title: "Real-Time Monitoring", description: "Track attendance and activity across event gates." },
  { title: "Volunteer Coordination", description: "Manage volunteer roles, applications and shifts." },
  { title: "Event Insights", description: "Understand attendance, operations and event performance." },
];

export const problems = [
  { number: "01", title: "Long Entry Queues", description: "Manual attendance and inefficient entry processes can slow down event check-in." },
  { number: "02", title: "Disconnected Tools", description: "Forms, spreadsheets and communication platforms make information difficult to manage." },
  { number: "03", title: "Volunteer Coordination", description: "Assigning roles and shifts manually can lead to confusion." },
  { number: "04", title: "Limited Visibility", description: "Organizers may not have a clear picture of attendance, gates, incidents and resources." },
];

export const howItWorksSteps = [
  { number: "01", label: "Plan", items: ["Create Event", "Set Capacity", "Configure Gates", "Manage Tickets", "Plan Volunteers"] },
  { number: "02", label: "Operate", items: ["QR Check-in", "Gate Monitoring", "Volunteer Coordination", "Incident Reporting", "Live Updates"] },
  { number: "03", label: "Analyze", items: ["Attendance Reports", "Event Insights", "Volunteer Performance", "Incident Summary", "Feedback"] },
];

export const coreFeatures = [
  { title: "QR Tickets", description: "Generate unique QR tickets and validate them during event check-in." },
  { title: "Event Management", description: "Create, edit, publish and manage event details." },
  { title: "Volunteer Management", description: "Manage volunteer applications, assignments and shifts." },
  { title: "Gate Monitoring", description: "Track ticket scans and entry activity at event gates." },
  { title: "Incident Reporting", description: "Report and track event-related incidents." },
  { title: "Resource Tracking", description: "Manage resources assigned to an event." },
  { title: "Notifications", description: "Receive important event and account updates." },
  { title: "Event Reports", description: "Review attendance and event operational information." },
];

export const lifecycleColumns = [
  { label: "Before", items: ["Create Event", "Set Capacity", "Configure Gates", "Manage Tickets", "Plan Volunteers"] },
  { label: "During", items: ["QR Check-in", "Gate Monitoring", "Volunteer Coordination", "Incident Reporting", "Live Updates"] },
  { label: "After", items: ["Attendance Report", "Event Insights", "Volunteer Performance", "Incident Summary", "Feedback"] },
];


export const ticketResaleSteps = [
  {
    number: "01",
    title: "List Your Ticket",
    description:
      "Eligible ticket holders can create a resale listing using their ticket details.",
  },
  {
    number: "02",
    title: "Set Your Price",
    description:
      "Choose a resale price that does not exceed the event's original ticket price.",
  },
  {
    number: "03",
    title: "Secure Checkout",
    description:
      "Other attendees can browse available listings and complete payment through Razorpay checkout.",
  },
];

export const roles = [
  { title: "Attendees", tagline: "Discover and attend events", items: ["Explore events", "Register", "Manage tickets", "Access QR tickets",  "Browse ticket resale listings",] },
  { title: "Organizers", tagline: "Plan and manage events", items: ["Create events", "Manage attendees", "Monitor gates", "Manage volunteers", "Track incidents", "View reports"] },
  { title: "Volunteers", tagline: "Find opportunities and manage responsibilities", items: ["Discover opportunities", "Apply for roles", "View shifts", "Track responsibilities"] },
  { title: "Event Staff", tagline: "Keep entry running smoothly", items: ["Select gates", "Scan QR tickets", "Validate tickets", "View scan results"] },
];

export const mockEvents = [
  { title: "Tech Fest 2026", date: "18 October 2026", venue: "Main Auditorium, Thapar Institute" },
  { title: "Developer Workshop", date: "25 October 2026", venue: "Innovation Centre" },
  { title: "Cultural Evening", date: "2 November 2026", venue: "University Grounds" },
];

export const teamMembers = [
  { initials: "AG", name: "Arpit Goswami", rollNo: "1024160134" },
  { initials: "AV", name: "Anushka Verma", rollNo: "1024160034" },
  { initials: "RS", name: "Rajat Sharma", rollNo: "1024160049" },
];

export const faqs = [
  { question: "What is EventPulse?", answer: "EventPulse is a web-based event operations platform designed to help manage event planning, registration, QR check-in, volunteers, gate monitoring and post-event operations." },
  { question: "Who can use EventPulse?", answer: "EventPulse is designed for attendees, organizers, volunteers and event scanner/staff users." },
  { question: "How does QR ticket validation work?", answer: "Each ticket has a unique QR code. During check-in, the system verifies that the ticket is valid, belongs to the correct event and has not already been checked in." },
  { question: "Can I transfer my ticket?", answer: "Yes. EventPulse provides an official ticket-transfer process where the original ticket is invalidated and a new ticket is issued to the recipient." },
  { question: "What happens if the same QR code is scanned twice?", answer: "After a successful check-in, another scan of the same ticket is rejected as a duplicate." },
  { question: "How does EventPulse help organizers?", answer: "Organizers can manage events, attendees, volunteers, gates, incidents, resources and post-event reports from one platform." },
  { question: "What is gate monitoring?", answer: "Gate monitoring allows organizers to track entries, scan activity and gate-level risk during an event." },
  { question: "Does EventPulse provide predictions?", answer: "The planned prediction module can estimate attendance, peak arrival time, gate congestion, volunteer demand and resource requirements." },
  {question: "Can I resell my ticket?",answer: "Eligible ticket holders can list their tickets for resale. The resale price cannot exceed the original event ticket price, and buyers can purchase available listings through the resale checkout."},
];
