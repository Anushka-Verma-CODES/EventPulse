export type ProfileRole = "attendee" | "volunteer" | "organizer" | "scanner";

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
}

export const roleBadgeLabel: Record<ProfileRole, string> = {
  attendee: "ATTENDEE",
  volunteer: "VOLUNTEER",
  organizer: "ORGANIZER",
  scanner: "SCANNER STAFF",
};

export const initialsByRole: Record<ProfileRole, string> = {
  attendee: "RS",
  volunteer: "RS",
  organizer: "RS",
  scanner: "AK",
};

const basePersonalInfo: PersonalInfo = {
  fullName: "Rajat Sharma",
  email: "rajat@example.com",
  phone: "+91 98765 43210",
  organization: "Thapar Institute",
};

export const personalInfoByRole: Record<ProfileRole, PersonalInfo> = {
  attendee: basePersonalInfo,
  volunteer: basePersonalInfo,
  organizer: basePersonalInfo,
  scanner: {
    fullName: "Amit Kumar",
    email: "amit.kumar@example.com",
    phone: "+91 91234 56780",
    organization: "Thapar Institute",
  },
};

// ---- Attendee & Volunteer shared academic info ----
export const attendeeAcademicInfo = {
  studentId: "1024160049",
  department: "Computer Engineering",
  year: "3rd Year",
};

// ---- Attendee ----
export const attendeeActivityStats = [
  { label: "Registered Events", value: "8" },
  { label: "Tickets Purchased", value: "8" },
  { label: "Attended Events", value: "6" },
  { label: "Reviews Submitted", value: "4" },
];

export const attendeeUpcomingEvent = {
  name: "Tech Fest 2026",
  date: "15 October 2026",
  venue: "Thapar Institute",
  ticket: "Student",
  status: "Confirmed",
};

export const attendeeInterestCategories = [
  { label: "Technology", checked: true },
  { label: "Workshops", checked: true },
  { label: "Competitions", checked: true },
  { label: "Sports", checked: false },
  { label: "Cultural", checked: false },
];

// ---- Volunteer ----
export const volunteerActivityStats = [
  { label: "Events Volunteered", value: "5" },
  { label: "Shifts Completed", value: "12" },
  { label: "Hours Completed", value: "34" },
  { label: "Tasks Completed", value: "48" },
];

export const volunteerSkillsList = [
  "Communication",
  "Event Management",
  "Crowd Management",
  "Technical Support",
  "Team Coordination",
];

export const volunteerPreferredRoles = [
  "Gate Management",
  "Registration Desk",
  "Crowd Management",
  "Technical Support",
];

export const volunteerAvailability = [
  { label: "Morning", checked: true },
  { label: "Afternoon", checked: true },
  { label: "Evening", checked: false },
];

export const volunteerCertificates = [
  { event: "Tech Fest 2026", title: "Volunteer Certificate", issuedOn: "20 October 2026" },
];

// ---- Organizer ----
export const organizerOrgDetails = {
  organization: "Thapar Institute",
  department: "Technical Society",
  organizerId: "ORG-001",
  contactEmail: "organizer@example.com",
};

export const organizerActivityStats = [
  { label: "Events Created", value: "12" },
  { label: "Upcoming Events", value: "4" },
  { label: "Registrations", value: "2,840" },
  { label: "Volunteers Managed", value: "86" },
];

// ---- Scanner ----
export const scannerStaffInfo = {
  staffId: "STF-001",
  organization: "Thapar Institute",
  staffRole: "QR Scanner Staff",
};

export const scannerCurrentAssignment = {
  event: "Tech Fest 2026",
  date: "15 October 2026",
  gate: "Gate 2",
  shift: "9:00 AM \u2013 1:00 PM",
  role: "QR Scanner Staff",
  status: "Assigned",
};

export const scannerActivityStats = [
  { label: "Total Scans", value: "842" },
  { label: "Valid Scans", value: "798" },
  { label: "Rejected Scans", value: "44" },
];

export const scannerTodayStats = [
  { label: "Scans", value: "128" },
  { label: "Valid", value: "121" },
  { label: "Rejected", value: "7" },
];

export const scannerRecentScans = [
  { ticketId: "TKT-10291", result: "Valid", time: "10:14 AM" },
  { ticketId: "TKT-10292", result: "Valid", time: "10:15 AM" },
  { ticketId: "TKT-10293", result: "Already Used", time: "10:16 AM" },
  { ticketId: "TKT-9999", result: "Invalid", time: "10:17 AM" },
];

export const scannerAssignedEvents = [
  { event: "Tech Fest 2026", date: "15 October", gate: "Gate 2", status: "Upcoming" },
  { event: "Cultural Fest 2026", date: "22 October", gate: "Gate 1", status: "Upcoming" },
  { event: "Sports Meet", date: "2 November", gate: "Gate 3", status: "Completed" },
];

// ---- Notifications per role ----
export const notificationTogglesByRole: Record<ProfileRole, string[]> = {
  attendee: [
    "Event Registration",
    "Event Reminders",
    "Ticket Updates",
    "Ticket Transfer Updates",
    "Event Changes",
  ],
  volunteer: [
    "Application Updates",
    "Shift Assignments",
    "Shift Reminders",
    "Task Updates",
    "Event Updates",
  ],
  organizer: [
    "New Registrations",
    "Volunteer Applications",
    "Incident Alerts",
    "Event Updates",
    "Report Notifications",
  ],
  scanner: [
    "Shift Reminders",
    "Assignment Updates",
    "Event Updates",
    "Staff Notifications",
  ],
};
