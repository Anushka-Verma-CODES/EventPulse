export const mockVolunteer = {
  name: "Rajat Sharma",
  email: "rajat@example.com",
  initials: "RS",
};

export const volunteerStats = [
  { label: "Active Shifts", value: "2" },
  { label: "Upcoming Shifts", value: "3" },
  { label: "Hours Completed", value: "18.5" },
  { label: "Applications", value: "4" },
];

export const nextShift = {
  event: "Tech Fest 2026",
  role: "Registration Desk",
  location: "Gate 1",
  date: "18 Sept 2026",
  time: "9:00 AM \u2013 12:00 PM",
  status: "Confirmed",
};

export const myEvents = [
  { event: "Tech Fest 2026", role: "Registration Desk", date: "18 Sept \u2022 TIET", status: "Confirmed" },
  { event: "Developer Workshop", role: "Technical Support", date: "22 Sept \u2022 TIET", status: "Confirmed" },
];

export const recentActivity = [
  { text: "Shift completed", context: "Tech Fest \u2014 Registration Desk", time: "2 hours ago" },
  { text: "Application approved", context: "Developer Workshop", time: "Yesterday" },
  { text: "New shift assigned", context: "Gate 2 Support", time: "2 days ago" },
];

export const opportunities = [
  {
    id: "tech-fest-registration",
    event: "Tech Fest 2026",
    role: "Registration Desk",
    date: "18 Sept 2026",
    location: "TIET, Patiala",
    time: "9:00 AM \u2013 12:00 PM",
    positionsAvailable: 8,
    description: "Help attendees with registration and guide them toward the appropriate gates.",
    responsibilities: [
      "Verify registration information",
      "Guide attendees",
      "Handle basic queries",
      "Coordinate with event staff",
    ],
    requirements: ["Good communication", "Punctuality", "Basic event coordination"],
  },
  {
    id: "dev-workshop-technical",
    event: "Developer Workshop",
    role: "Technical Support",
    date: "22 Sept 2026",
    location: "Innovation Centre, TIET",
    time: "10:00 AM \u2013 2:00 PM",
    positionsAvailable: 5,
    description: "Assist with AV setup, laptop connectivity, and troubleshooting during sessions.",
    responsibilities: [
      "Set up projector and audio",
      "Troubleshoot speaker laptops",
      "Assist attendees with Wi-Fi access",
    ],
    requirements: ["Basic technical knowledge", "Punctuality"],
  },
];

export const applications = [
  { event: "Tech Fest 2026", role: "Registration Desk", appliedOn: "10 Sept", shift: "9 AM\u201312 PM", status: "Approved" },
  { event: "Developer Workshop", role: "Technical Support", appliedOn: "11 Sept", shift: "10 AM\u20132 PM", status: "Pending" },
  { event: "Sports Meet", role: "Event Support", appliedOn: "8 Sept", shift: "8 AM\u201311 AM", status: "Rejected" },
];

export const shifts = [
  {
    id: "tech-fest-registration-shift",
    event: "Tech Fest 2026",
    role: "Registration Desk",
    date: "18 Sept 2026",
    time: "9:00 AM \u2013 12:00 PM",
    location: "Gate 1",
    organizer: "EventPulse Team",
    status: "Confirmed",
    responsibilities: [
      "Assist attendee registration",
      "Guide attendees",
      "Coordinate with Gate 1 staff",
      "Report entry problems",
    ],
    checkIn: null as string | null,
    checkOut: null as string | null,
  },
  {
    id: "dev-workshop-technical-shift",
    event: "Developer Workshop",
    role: "Technical Support",
    date: "22 Sept 2026",
    time: "10:00 AM \u2013 2:00 PM",
    location: "Innovation Centre",
    organizer: "EventPulse Team",
    status: "Upcoming",
    responsibilities: ["Set up projector and audio", "Troubleshoot speaker laptops"],
    checkIn: null as string | null,
    checkOut: null as string | null,
  },
];

export const tasks = [
  {
    id: "prepare-desk",
    name: "Prepare registration desk",
    description: "Prepare badges, registration sheets and required stationery.",
    event: "Tech Fest 2026",
    shift: "Registration Desk \u2022 9:00 AM \u2013 12:00 PM",
    priority: "High",
    dueTime: "8:45 AM",
    completed: true,
  },
  {
    id: "check-list",
    name: "Check registration list",
    description: "Cross-check the printed registration list against the online sheet.",
    event: "Tech Fest 2026",
    shift: "Registration Desk \u2022 9:00 AM \u2013 12:00 PM",
    priority: "High",
    dueTime: "8:50 AM",
    completed: true,
  },
  {
    id: "late-registrations",
    name: "Assist late registrations",
    description: "Help attendees who missed the registration window.",
    event: "Tech Fest 2026",
    shift: "Registration Desk \u2022 9:00 AM \u2013 12:00 PM",
    priority: "Medium",
    dueTime: "11:00 AM",
    completed: false,
  },
  {
    id: "report-issues",
    name: "Report registration issues",
    description: "Log any recurring issues for the organizer's post-event report.",
    event: "Tech Fest 2026",
    shift: "Registration Desk \u2022 9:00 AM \u2013 12:00 PM",
    priority: "Low",
    dueTime: "12:00 PM",
    completed: false,
  },
];

export const notifications = [
  {
    id: "n1",
    title: "Application Approved",
    message: "Your application for Tech Fest 2026 has been approved.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: "n2",
    title: "New Shift Assigned",
    message: "You have been assigned to Gate 1 from 9:00 AM \u2013 12:00 PM.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "n3",
    title: "Shift Reminder",
    message: "Your Tech Fest shift starts tomorrow at 9:00 AM.",
    time: "Yesterday",
    read: true,
  },
];
