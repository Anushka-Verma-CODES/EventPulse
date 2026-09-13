export const mockOrganizer = {
  name: "Rajat Sharma",
  email: "rajat@example.com",
  initials: "RS",
};

export const quickStats = [
  { label: "Total Events", value: "12" },
  { label: "Upcoming Events", value: "4" },
  { label: "Total Registrations", value: "2,840" },
  { label: "Total Check-ins", value: "1,920" },
];

export const organizerEvents = [
  {
    id: "tech-fest-2026",
    name: "Tech Fest 2026",
    date: "18 Oct 2026",
    venue: "Main Auditorium",
    registered: 1850,
    capacity: 2000,
    status: "Upcoming",
  },
  {
    id: "developer-workshop",
    name: "Developer Workshop",
    date: "25 Oct 2026",
    venue: "Innovation Centre",
    registered: 120,
    capacity: 200,
    status: "Upcoming",
  },
  {
    id: "cultural-evening",
    name: "Cultural Evening",
    date: "2 Nov 2026",
    venue: "University Grounds",
    registered: 640,
    capacity: 800,
    status: "Draft",
  },
];

export const weeklyAttendance = [
  { day: "Mon", value: 900 },
  { day: "Tue", value: 1400 },
  { day: "Wed", value: 1100 },
  { day: "Thu", value: 1750 },
  { day: "Fri", value: 1420 },
];

export const recentActivity = [
  { text: "25 new registrations", context: "Tech Fest 2026" },
  { text: "Volunteer application received", context: "Developer Workshop" },
  { text: "Incident resolved", context: "Cultural Evening" },
  { text: "Ticket transferred", context: "Tech Fest 2026" },
];

export const attendees = [
  { name: "Rajat Sharma", email: "rajat@email.com", ticket: "General", registeredOn: "12 Oct", status: "Checked In", gate: "Gate 2" },
  { name: "Priya Sharma", email: "priya@email.com", ticket: "VIP", registeredOn: "11 Oct", status: "Checked In", gate: "Gate 1" },
  { name: "Aman Kumar", email: "aman@email.com", ticket: "Student", registeredOn: "13 Oct", status: "Not Checked In", gate: "-" },
  { name: "Neha Verma", email: "neha@email.com", ticket: "General", registeredOn: "10 Oct", status: "Checked In", gate: "Gate 3" },
];

export const gateStats = [
  { name: "Gate 1", entries: 520, scansPerMin: 8, status: "Normal" },
  { name: "Gate 2", entries: 710, scansPerMin: 15, status: "Busy" },
  { name: "Gate 3", entries: 190, scansPerMin: 5, status: "Normal" },
];

export const recentScans = [
  { time: "10:42:18", gate: "Gate 2", result: "Valid" },
  { time: "10:42:15", gate: "Gate 1", result: "Valid" },
  { time: "10:42:11", gate: "Gate 2", result: "Duplicate" },
  { time: "10:42:07", gate: "Gate 3", result: "Valid" },
];

export const volunteerOverview = [
  { label: "Total Volunteers", value: "24" },
  { label: "Assigned", value: "18" },
  { label: "Pending Applications", value: "6" },
  { label: "Present", value: "15" },
];

export const volunteers = [
  { name: "Aman Kumar", role: "Gate Volunteer", event: "Tech Fest", shift: "10 AM\u20132 PM", status: "Assigned" },
  { name: "Priya Sharma", role: "Registration Desk", event: "Tech Fest", shift: "9 AM\u201312 PM", status: "Assigned" },
];

export const volunteerApplications = [
  { applicant: "Aman Kumar", role: "Gate Volunteer", event: "Tech Fest", appliedOn: "12 Oct", status: "Pending" },
  { applicant: "Priya Sharma", role: "Registration Desk", event: "Tech Fest", appliedOn: "11 Oct", status: "Accepted" },
];

export const volunteerShifts = [
  { location: "Gate 1", time: "10:00 AM \u2013 1:00 PM" },
  { location: "Gate 2", time: "1:00 PM \u2013 4:00 PM" },
  { location: "Registration Desk", time: "9:00 AM \u2013 12:00 PM" },
];

export const resources = [
  { name: "Food", percentage: 80, status: "Available", used: 800, total: 1000 },
  { name: "Water", percentage: 92, status: "Available", used: 920, total: 1000 },
  { name: "Badges", percentage: 60, status: "Low", used: 600, total: 1000 },
  { name: "Chairs", percentage: 85, status: "Available", used: 850, total: 1000 },
];

export const incidents = [
  {
    title: "High Crowd Density at Gate 2",
    reportedAt: "10:38 AM",
    location: "Gate 2",
    status: "Open",
    priority: "High",
  },
  {
    title: "Projector not working",
    reportedAt: "11:12 AM",
    location: "Main Hall",
    status: "Resolved",
    priority: "Medium",
  },
];

export const predictionCards = [
  { label: "Expected Attendance", value: "1,850", unit: "attendees" },
  { label: "Peak Arrival", value: "10:15 AM", unit: "" },
  { label: "Gate Risk", value: "Gate 2", unit: "High" },
  { label: "Volunteer Demand", value: "18", unit: "volunteers" },
];

export const predictedResources = [
  { name: "Water", value: "2,000 bottles" },
  { name: "Badges", value: "1,900" },
  { name: "Chairs", value: "500" },
];

export const reportSummary = [
  { label: "Registrations", value: "1,850" },
  { label: "Checked In", value: "1,420" },
  { label: "No Shows", value: "430" },
  { label: "Attendance Rate", value: "77%" },
];

export const reportSections = [
  "Attendance",
  "Gate Performance",
  "Volunteer Performance",
  "Incidents",
  "Resources",
];
