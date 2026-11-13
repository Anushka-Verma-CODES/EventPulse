import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { getAuthHeaders } from "../../lib/authApi";
import { getMyEvents } from "../../features/events/api/eventsApi";

const VITE_API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : window.location.hostname === "172.16.78.105"
      ? "http://172.16.78.105:3000"
      : "https://eventpulse-toa3.onrender.com";

type OrganizerEvent = {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
};

type OrganizerAttendee = {
  id: string;
  attendeeId: string;
  eventId?: string;
  name: string;
  email: string;
  eventName: string;
  registeredOn: string;
  status: string;
  checkedInAt: string | null;
  gate: string;
};

type Resource = {
  id: string;
  eventId: string;
  name: string;
  totalQuantity: number;
  usedQuantity: number;
  availableQuantity: number;
  unit: string;
  status: string;
};

type VolunteerAssignment = {
  id: string;
  volunteerId: string;
  eventId: string;
  assignedRole: string;
  status: "assigned" | "in_progress" | "completed" | "cancelled" | string;
  hoursWorked: string | number;
  completedAt: string | null;
  createdAt: string;
  volunteer?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  event?: {
    id: string;
    title: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  } | null;
};

type Incident = {
  id: string;
  eventId: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical" | string;
  status: "open" | "in_progress" | "resolved" | string;
  location: string | null;
  resolvedAt: string | null;
  createdAt: string;
  event?: {
    id: string;
    title: string;
  } | null;
  reportedBy?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
};

type GateSummary = {
  gate: string;
  checkIns: number;
};

type ReportSection =
  | "Attendance"
  | "Gate Performance"
  | "Volunteer Performance"
  | "Incidents"
  | "Resources";

const reportSections: ReportSection[] = [
  "Attendance",
  "Gate Performance",
  "Volunteer Performance",
  "Incidents",
  "Resources",
];

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(`${VITE_API_BASE_URL}${path}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message = Array.isArray(error?.message)
      ? error.message.join(", ")
      : error?.message;

    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

function formatDate(value: string) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatDateTime(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function escapeCsvCell(value: string | number | null | undefined) {
  const text = String(value ?? "");

  const safeText = /^[\t\r ]*[=+\-@]/.test(text)
    ? `'${text}`
    : text;

  return `"${safeText.replace(/"/g, '""')}"`;
}

function exportAttendanceCsv(
  attendees: OrganizerAttendee[],
  reportTitle: string,
) {
  const headers = [
    "Attendee Name",
    "Email",
    "Event",
    "Registered On",
    "Check-in Status",
    "Check-in Time",
    "Gate",
  ];

  const rows = attendees.map((attendee) => [
    attendee.name,
    attendee.email,
    attendee.eventName,
    formatDateTime(attendee.registeredOn),
    attendee.status,
    formatDateTime(attendee.checkedInAt),
    attendee.gate || "—",
  ]);

  const csvContent = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const fileName = reportTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  link.href = downloadUrl;
  link.download = `eventpulse-attendance-${fileName || "report"}-${new Date().toISOString().slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(downloadUrl);
}

function exportAttendancePdf(
  attendees: OrganizerAttendee[],
  reportTitle: string,
  registrationCount: number,
  checkedInCount: number,
  attendanceRate: number,
) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 10;
  const tableWidth = pageWidth - margin * 2;

  const columns = [
    { title: "Attendee", width: 37 },
    { title: "Email", width: 48 },
    { title: "Event", width: 43 },
    { title: "Registered", width: 36 },
    { title: "Status", width: 28 },
    { title: "Check-in Time", width: 48 },
    { title: "Gate", width: tableWidth - 240 },
  ];

  const rowHeight = 11;
  const headerHeight = 10;

  let currentY = 0;

  const getFileName = () =>
    reportTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "report";

  function drawPageHeading() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(30, 41, 59);
    doc.text("EventPulse - Attendance Report", margin, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Event: ${reportTitle}`, margin, 23);
    doc.text(
      `Generated: ${new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })}`,
      margin,
      29,
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`Registrations: ${registrationCount}`, margin, 39);
    doc.text(`Checked In: ${checkedInCount}`, margin + 55, 39);
    doc.text(
      `Not Checked In: ${registrationCount - checkedInCount}`,
      margin + 105,
      39,
    );
    doc.text(`Attendance Rate: ${attendanceRate}%`, margin + 185, 39);

    currentY = 46;
  }

  function drawTableHeader() {
    doc.setFillColor(239, 246, 255);
    doc.rect(margin, currentY, tableWidth, headerHeight, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 64, 175);

    let currentX = margin;

    columns.forEach((column) => {
      doc.text(
        column.title,
        currentX + 2,
        currentY + 6.5,
      );

      currentX += column.width;
    });

    currentY += headerHeight;
  }

  function drawNewPage() {
    doc.addPage();
    drawPageHeading();
    drawTableHeader();
  }

  function fitText(value: string, width: number) {
    const lines = doc.splitTextToSize(
      value || "—",
      width - 4,
    );

    return lines[0] || "—";
  }

  drawPageHeading();
  drawTableHeader();

  if (attendees.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "No attendance records found.",
      margin + 2,
      currentY + 8,
    );
  }

  attendees.forEach((attendee, index) => {
    if (currentY + rowHeight > pageHeight - margin) {
      drawNewPage();
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, tableWidth, rowHeight, "F");
    }

    const values = [
      attendee.name,
      attendee.email,
      attendee.eventName,
      formatDateTime(attendee.registeredOn),
      attendee.status,
      formatDateTime(attendee.checkedInAt),
      attendee.gate || "—",
    ];

    let currentX = margin;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);

    values.forEach((value, columnIndex) => {
      const column = columns[columnIndex];

      doc.text(
        fitText(value, column.width),
        currentX + 2,
        currentY + 6.8,
      );

      currentX += column.width;
    });

    doc.setDrawColor(226, 232, 240);
    doc.line(
      margin,
      currentY + rowHeight,
      margin + tableWidth,
      currentY + rowHeight,
    );

    currentY += rowHeight;
  });

  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - margin,
      pageHeight - 5,
      { align: "right" },
    );
  }

  doc.save(
    `eventpulse-attendance-${getFileName()}-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

function exportVolunteerCsv(
  assignments: VolunteerAssignment[],
  reportTitle: string,
) {
  const headers = [
    "Volunteer Name",
    "Email",
    "Event",
    "Assigned Role",
    "Assignment Status",
    "Hours Worked",
    "Assigned On",
    "Completed At",
  ];

  const rows = assignments.map((assignment) => [
    assignment.volunteer?.fullName || "Volunteer unavailable",
    assignment.volunteer?.email || "—",
    assignment.event?.title || "Event unavailable",
    assignment.assignedRole,
    assignment.status,
    Number(assignment.hoursWorked) || 0,
    formatDateTime(assignment.createdAt),
    formatDateTime(assignment.completedAt),
  ]);

  const csvContent = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
].join("\r\n");

const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fileName = reportTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  link.href = downloadUrl;
  link.download = `eventpulse-volunteer-performance-${fileName || "report"}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

function exportVolunteerPdf(
  assignments: VolunteerAssignment[],
  reportTitle: string,
  totalVolunteers: number,
  completedAssignments: number,
  totalHours: number,
) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const tableWidth = pageWidth - margin * 2;
  const columns = [
    { title: "Volunteer", width: 38 },
    { title: "Email", width: 48 },
    { title: "Event", width: 43 },
    { title: "Assigned Role", width: 39 },
    { title: "Status", width: 29 },
    { title: "Hours", width: 17 },
    { title: "Assigned On", width: 35 },
    { title: "Completed At", width: tableWidth - 249 },
  ];
  const rowHeight = 11;
  let currentY = 0;

  function drawHeading() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(30, 41, 59);
    doc.text("EventPulse - Volunteer Performance Report", margin, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Event: ${reportTitle}`, margin, 23);
    doc.text(
      `Generated: ${new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })}`,
      margin,
      29,
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`Volunteers: ${totalVolunteers}`, margin, 39);
    doc.text(`Completed Assignments: ${completedAssignments}`, margin + 55, 39);
    doc.text(`Recorded Hours: ${totalHours.toFixed(2)}`, margin + 135, 39);
    currentY = 46;
  }

  function drawTableHeader() {
    doc.setFillColor(239, 246, 255);
    doc.rect(margin, currentY, tableWidth, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 64, 175);

    let currentX = margin;
    columns.forEach((column) => {
      doc.text(column.title, currentX + 2, currentY + 6.5);
      currentX += column.width;
    });
    currentY += 10;
  }

  function drawNewPage() {
    doc.addPage();
    drawHeading();
    drawTableHeader();
  }

  function fitText(value: string, width: number) {
    const lines = doc.splitTextToSize(value || "—", width - 4);
    return lines[0] || "—";
  }

  drawHeading();
  drawTableHeader();

  if (assignments.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("No volunteer assignments found.", margin + 2, currentY + 8);
  }

  assignments.forEach((assignment, index) => {
    if (currentY + rowHeight > pageHeight - margin) {
      drawNewPage();
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, tableWidth, rowHeight, "F");
    }

    const values = [
      assignment.volunteer?.fullName || "Volunteer unavailable",
      assignment.volunteer?.email || "—",
      assignment.event?.title || "Event unavailable",
      assignment.assignedRole || "—",
      assignment.status.replace(/_/g, " "),
      String(Number(assignment.hoursWorked) || 0),
      formatDateTime(assignment.createdAt),
      formatDateTime(assignment.completedAt),
    ];

    let currentX = margin;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);

    values.forEach((value, columnIndex) => {
      const column = columns[columnIndex];
      doc.text(fitText(value, column.width), currentX + 2, currentY + 6.8);
      currentX += column.width;
    });

    doc.setDrawColor(226, 232, 240);
    doc.line(
      margin,
      currentY + rowHeight,
      margin + tableWidth,
      currentY + rowHeight,
    );
    currentY += rowHeight;
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 5, {
      align: "right",
    });
  }

  const fileName =
    reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    "report";
  doc.save(
    `eventpulse-volunteer-performance-${fileName}-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

function exportGateCsv(gates: GateSummary[], reportTitle: string) {
  const headers = ["Gate", "Check-ins", "Share of Check-ins (%)"];
  const totalCheckIns = gates.reduce((total, gate) => total + gate.checkIns, 0);
  const rows = gates.map((gate) => [
    gate.gate,
    gate.checkIns,
    totalCheckIns > 0 ? ((gate.checkIns / totalCheckIns) * 100).toFixed(1) : "0.0",
  ]);
  const csvContent = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ].join("\r\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fileName = reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "report";
  link.href = downloadUrl;
  link.download = `eventpulse-gate-performance-${fileName}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

function exportGatePdf(gates: GateSummary[], reportTitle: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalCheckIns = gates.reduce((total, gate) => total + gate.checkIns, 0);
  let currentY = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(30, 41, 59);
  doc.text("EventPulse - Gate Performance Report", margin, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Event: ${reportTitle}`, margin, 25);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`, margin, 32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`Total check-ins: ${totalCheckIns}`, margin, 41);

  doc.setFillColor(239, 246, 255);
  doc.rect(margin, currentY, pageWidth - margin * 2, 10, "F");
  doc.setFontSize(9);
  doc.setTextColor(30, 64, 175);
  doc.text("Gate", margin + 3, currentY + 6.5);
  doc.text("Check-ins", pageWidth - margin - 45, currentY + 6.5);
  doc.text("Share", pageWidth - margin - 20, currentY + 6.5);
  currentY += 10;

  gates.forEach((gate, index) => {
    if (currentY + 10 > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, pageWidth - margin * 2, 10, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(doc.splitTextToSize(gate.gate || "Unassigned gate", 105)[0] || "Unassigned gate", margin + 3, currentY + 6.5);
    doc.text(String(gate.checkIns), pageWidth - margin - 45, currentY + 6.5);
    const share = totalCheckIns > 0 ? ((gate.checkIns / totalCheckIns) * 100).toFixed(1) : "0.0";
    doc.text(`${share}%`, pageWidth - margin - 20, currentY + 6.5);
    currentY += 10;
  });

  if (gates.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("No gate check-in records found.", margin + 2, currentY + 8);
  }

  const fileName = reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "report";
  doc.save(`eventpulse-gate-performance-${fileName}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

function exportIncidentCsv(incidents: Incident[], reportTitle: string) {
  const headers = ["Title", "Description", "Event", "Location", "Severity", "Status", "Reported By", "Reporter Email", "Reported At", "Resolved At"];
  const rows = incidents.map((incident) => [
    incident.title,
    incident.description,
    incident.event?.title || "Event unavailable",
    incident.location || "—",
    incident.severity,
    incident.status,
    incident.reportedBy?.fullName || "Reporter unavailable",
    incident.reportedBy?.email || "—",
    formatDateTime(incident.createdAt),
    formatDateTime(incident.resolvedAt),
  ]);
  const csvContent = [headers.map(escapeCsvCell).join(","), ...rows.map((row) => row.map(escapeCsvCell).join(","))].join("\r\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fileName = reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "report";
  link.href = downloadUrl;
  link.download = `eventpulse-incidents-${fileName}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

function exportIncidentPdf(incidents: Incident[], reportTitle: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const margin = 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const tableWidth = pageWidth - margin * 2;
  const columns = [
    { title: "Incident", width: 38 },
    { title: "Event", width: 35 },
    { title: "Location", width: 30 },
    { title: "Severity", width: 22 },
    { title: "Status", width: 27 },
    { title: "Reported By", width: 34 },
    { title: "Reported At", width: 36 },
    { title: "Resolved At", width: tableWidth - 222 },
  ];
  const rowHeight = 12;
  let currentY = 45;

  const drawHeading = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text("EventPulse - Incident Report", margin, 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Event: ${reportTitle}`, margin, 23);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`, margin, 30);
    currentY = 37;
  };
  const drawTableHeader = () => {
    doc.setFillColor(239, 246, 255);
    doc.rect(margin, currentY, tableWidth, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(30, 64, 175);
    let x = margin;
    columns.forEach((column) => {
      doc.text(column.title, x + 2, currentY + 6);
      x += column.width;
    });
    currentY += 9;
  };
  const fit = (value: string, width: number) => doc.splitTextToSize(value || "—", width - 4)[0] || "—";
  drawHeading();
  drawTableHeader();

  incidents.forEach((incident, index) => {
    if (currentY + rowHeight > pageHeight - margin) {
      doc.addPage();
      drawHeading();
      drawTableHeader();
    }
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, tableWidth, rowHeight, "F");
    }
    const values = [
      incident.title,
      incident.event?.title || "Event unavailable",
      incident.location || "—",
      incident.severity,
      incident.status.replace(/_/g, " "),
      incident.reportedBy?.fullName || "Reporter unavailable",
      formatDateTime(incident.createdAt),
      formatDateTime(incident.resolvedAt),
    ];
    let x = margin;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    values.forEach((value, columnIndex) => {
      const column = columns[columnIndex];
      doc.text(fit(value, column.width), x + 2, currentY + 7);
      x += column.width;
    });
    currentY += rowHeight;
  });

  if (incidents.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("No incident records found.", margin + 2, currentY + 8);
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 5, { align: "right" });
  }
  const fileName = reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "report";
  doc.save(`eventpulse-incidents-${fileName}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="text-2xl font-semibold text-[#1E293B]">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-[#334155]">
        {label}
      </div>
      <p className="mt-1 text-xs text-[#64748B]">{description}</p>
    </div>
  );
}

export default function Reports() {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [attendees, setAttendees] = useState<OrganizerAttendee[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [volunteerAssignments, setVolunteerAssignments] = useState<
    VolunteerAssignment[]
  >([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [activeSection, setActiveSection] =
    useState<ReportSection>("Attendance");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resourceError, setResourceError] = useState("");
  const [volunteerError, setVolunteerError] = useState("");
  const [incidentError, setIncidentError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadReports() {
      setLoading(true);
      setError("");

      try {
        const [eventData, attendeeData] = await Promise.all([
          getMyEvents(),
          fetchApi<OrganizerAttendee[]>(
            "/registrations/organizer/attendees",
          ),
        ]);

        if (!isActive) return;

        setEvents(eventData);
        setAttendees(attendeeData);
      } catch (requestError) {
        if (!isActive) return;

        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to load report data.";
        setError(message);
      } finally {
        if (isActive) setLoading(false);
      }

      try {
        const resourceData = await fetchApi<Resource[]>("/resources");
        if (isActive) {
          setResources(resourceData);
          setResourceError("");
        }
      } catch (requestError) {
        if (!isActive) return;
        setResourceError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load resource data.",
        );
      }

      try {
        const assignmentData = await fetchApi<VolunteerAssignment[]>(
          "/volunteers/organizer/assignments",
        );
        if (isActive) {
          setVolunteerAssignments(assignmentData);
          setVolunteerError("");
        }
      } catch (requestError) {
        if (!isActive) return;
        setVolunteerError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load volunteer assignment data.",
        );
      }

      try {
        const incidentData = await fetchApi<Incident[]>("/incidents");
        if (isActive) {
          setIncidents(incidentData);
          setIncidentError("");
        }
      } catch (requestError) {
        if (!isActive) return;
        setIncidentError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load incident data.",
        );
      }
    }

    void loadReports();

    return () => {
      isActive = false;
    };
  }, []);

  const selectedEvent = events.find(
    (event) => event.id === selectedEventId,
  );

  const filteredAttendees = useMemo(() => {
    if (selectedEventId === "all") return attendees;

    if (!selectedEvent) return [];

    return attendees.filter((attendee) =>
      attendee.eventId
        ? attendee.eventId === selectedEventId
        : attendee.eventName === selectedEvent.title,
    );
  }, [attendees, selectedEventId, selectedEvent]);

  const checkedInCount = filteredAttendees.filter(
    (attendee) => attendee.status === "Checked In",
  ).length;

  const registrationCount = filteredAttendees.length;
  const noShowCount = registrationCount - checkedInCount;

  const attendanceRate =
    registrationCount > 0
      ? Math.round((checkedInCount / registrationCount) * 100)
      : 0;

  const filteredResources =
    selectedEventId === "all"
      ? resources
      : resources.filter(
          (resource) => resource.eventId === selectedEventId,
        );

  const filteredVolunteerAssignments = useMemo(() => {
    if (selectedEventId === "all") return volunteerAssignments;

    return volunteerAssignments.filter(
      (assignment) => assignment.eventId === selectedEventId,
    );
  }, [volunteerAssignments, selectedEventId]);

  const totalVolunteerCount = new Set(
    filteredVolunteerAssignments.map((assignment) => assignment.volunteerId),
  ).size;

  const completedAssignmentCount = filteredVolunteerAssignments.filter(
    (assignment) => assignment.status === "completed",
  ).length;

  const totalVolunteerHours = filteredVolunteerAssignments.reduce(
    (total, assignment) => total + (Number(assignment.hoursWorked) || 0),
    0,
  );

  const gatePerformance = useMemo(() => {
    const gateCounts = new Map<string, number>();
    filteredAttendees.forEach((attendee) => {
      if (attendee.status !== "Checked In") return;
      const gateName = attendee.gate?.trim() || "Unassigned gate";
      gateCounts.set(gateName, (gateCounts.get(gateName) || 0) + 1);
    });
    return Array.from(gateCounts.entries())
      .map(([gate, checkIns]) => ({ gate, checkIns }))
      .sort((first, second) => second.checkIns - first.checkIns);
  }, [filteredAttendees]);

  const totalGateCheckIns = gatePerformance.reduce(
    (total, gate) => total + gate.checkIns,
    0,
  );

  const filteredIncidents = useMemo(() => {
    if (selectedEventId === "all") return incidents;
    return incidents.filter((incident) => incident.eventId === selectedEventId);
  }, [incidents, selectedEventId]);

  const openIncidentCount = filteredIncidents.filter(
    (incident) => incident.status === "open",
  ).length;
  const inProgressIncidentCount = filteredIncidents.filter(
    (incident) => incident.status === "in_progress",
  ).length;
  const resolvedIncidentCount = filteredIncidents.filter(
    (incident) => incident.status === "resolved",
  ).length;

  const reportTitle = selectedEvent
    ? selectedEvent.title
    : "All Events";

  const reportDate = selectedEvent
    ? formatDate(selectedEvent.startDate)
    : `${events.length} event${events.length === 1 ? "" : "s"}`;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">
            Event Reports
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Review registrations, attendance, and available event resources.
          </p>
        </div>

        <label className="text-sm font-medium text-[#334155]">
          Select event
          <select
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
            className="mt-1.5 block w-full min-w-52 rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 sm:w-auto"
          >
            <option value="all">All events</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-white p-5">
        <h3 className="text-lg font-semibold text-[#1E293B]">
          {reportTitle}
        </h3>
        <p className="mt-1 text-sm text-[#64748B]">{reportDate}</p>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
          Loading report data...
        </div>
      ) : !error ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard
              label="Registrations"
              value={registrationCount.toLocaleString()}
              description="Registered attendees"
            />
            <SummaryCard
              label="Checked In"
              value={checkedInCount.toLocaleString()}
              description="Successful check-ins"
            />
            <SummaryCard
              label="No Shows"
              value={noShowCount.toLocaleString()}
              description="Not checked in yet"
            />
            <SummaryCard
              label="Attendance Rate"
              value={`${attendanceRate}%`}
              description="Check-ins divided by registrations"
            />
          </div>

          <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#1E293B]">
              Report Sections
            </h3>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {reportSections.map((section) => {
                const isAvailable =
                  section === "Attendance" ||
                  section === "Resources" ||
                  section === "Volunteer Performance" ||
                  section === "Gate Performance" ||
                  section === "Incidents";

                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => setActiveSection(section)}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                      activeSection === section
                        ? "border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]"
                        : "border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <span className="font-medium">{section}</span>
                    <span
                      className={`text-xs ${
                        isAvailable
                          ? "text-[#15803D]"
                          : "text-[#64748B]"
                      }`}
                    >
                      {isAvailable ? "Available" : "Not connected"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 border-t border-[#E2E8F0] pt-5">
              {activeSection === "Attendance" && (
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-[#1E293B]">
                        Attendance Details
                      </h4>
                      <p className="mt-1 text-sm text-[#64748B]">
                        Registration and check-in records from the backend.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          exportAttendanceCsv(filteredAttendees, reportTitle)
                        }
                        disabled={filteredAttendees.length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
                      >
                        Export CSV
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          exportAttendancePdf(
                            filteredAttendees,
                            reportTitle,
                            registrationCount,
                            checkedInCount,
                            attendanceRate,
                          )
                        }
                        disabled={filteredAttendees.length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-medium text-[#334155] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Export PDF
                      </button>
                    </div>
                  </div>

                  {filteredAttendees.length === 0 ? (
                    <p className="mt-5 rounded-lg bg-[#F8FAFC] p-5 text-center text-sm text-[#64748B]">
                      No registrations found for this selection.
                    </p>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[650px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] text-xs uppercase text-[#64748B]">
                            <th className="px-3 py-3 font-medium">
                              Attendee
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Event
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Registered
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Status
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Check-in time
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAttendees.map((attendee) => (
                            <tr
                              key={attendee.id}
                              className="border-b border-[#F1F5F9] last:border-0"
                            >
                              <td className="px-3 py-3">
                                <div className="font-medium text-[#1E293B]">
                                  {attendee.name}
                                </div>
                                <div className="mt-0.5 text-xs text-[#64748B]">
                                  {attendee.email}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-[#475569]">
                                {attendee.eventName}
                              </td>
                              <td className="px-3 py-3 text-[#475569]">
                                {formatDateTime(attendee.registeredOn)}
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                    attendee.status === "Checked In"
                                      ? "bg-[#DCFCE7] text-[#166534]"
                                      : "bg-[#F1F5F9] text-[#475569]"
                                  }`}
                                >
                                  {attendee.status}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-[#475569]">
                                {formatDateTime(attendee.checkedInAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "Volunteer Performance" && (
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-[#1E293B]">
                        Volunteer Performance
                      </h4>
                      <p className="mt-1 text-sm text-[#64748B]">
                        Volunteer assignments and recorded work hours for the selected event.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          exportVolunteerCsv(
                            filteredVolunteerAssignments,
                            reportTitle,
                          )
                        }
                        disabled={filteredVolunteerAssignments.length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
                      >
                        Export CSV
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          exportVolunteerPdf(
                            filteredVolunteerAssignments,
                            reportTitle,
                            totalVolunteerCount,
                            completedAssignmentCount,
                            totalVolunteerHours,
                          )
                        }
                        disabled={filteredVolunteerAssignments.length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-medium text-[#334155] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Export PDF
                      </button>
                    </div>
                  </div>

                  {volunteerError ? (
                    <p className="mt-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
                      {volunteerError}
                    </p>
                  ) : (
                    <>
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <SummaryCard
                          label="Assigned Volunteers"
                          value={totalVolunteerCount}
                          description="Unique volunteers with assignments"
                        />
                        <SummaryCard
                          label="Completed Assignments"
                          value={completedAssignmentCount}
                          description="Assignments marked completed"
                        />
                        <SummaryCard
                          label="Recorded Hours"
                          value={totalVolunteerHours.toFixed(2)}
                          description="Total hours recorded across assignments"
                        />
                      </div>

                      {filteredVolunteerAssignments.length === 0 ? (
                        <p className="mt-5 rounded-lg bg-[#F8FAFC] p-5 text-center text-sm text-[#64748B]">
                          No volunteer assignments found for this selection.
                        </p>
                      ) : (
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full min-w-[850px] text-left text-sm">
                            <thead>
                              <tr className="border-b border-[#E2E8F0] text-xs uppercase text-[#64748B]">
                                <th className="px-3 py-3 font-medium">Volunteer</th>
                                <th className="px-3 py-3 font-medium">Event</th>
                                <th className="px-3 py-3 font-medium">Assigned Role</th>
                                <th className="px-3 py-3 font-medium">Status</th>
                                <th className="px-3 py-3 font-medium">Hours</th>
                                <th className="px-3 py-3 font-medium">Assigned On</th>
                                <th className="px-3 py-3 font-medium">Completed At</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredVolunteerAssignments.map((assignment) => (
                                <tr
                                  key={assignment.id}
                                  className="border-b border-[#F1F5F9] last:border-0"
                                >
                                  <td className="px-3 py-3">
                                    <div className="font-medium text-[#1E293B]">
                                      {assignment.volunteer?.fullName ||
                                        "Volunteer unavailable"}
                                    </div>
                                    <div className="mt-0.5 text-xs text-[#64748B]">
                                      {assignment.volunteer?.email || "—"}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 text-[#475569]">
                                    {assignment.event?.title || "Event unavailable"}
                                  </td>
                                  <td className="px-3 py-3 text-[#475569]">
                                    {assignment.assignedRole}
                                  </td>
                                  <td className="px-3 py-3">
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                        assignment.status === "completed"
                                          ? "bg-[#DCFCE7] text-[#166534]"
                                          : assignment.status === "in_progress"
                                            ? "bg-[#DBEAFE] text-[#1D4ED8]"
                                            : assignment.status === "cancelled"
                                              ? "bg-[#FEE2E2] text-[#991B1B]"
                                              : "bg-[#F1F5F9] text-[#475569]"
                                      }`}
                                    >
                                      {assignment.status.replace(/_/g, " ")}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3 text-[#475569]">
                                    {(Number(assignment.hoursWorked) || 0).toFixed(2)}
                                  </td>
                                  <td className="px-3 py-3 text-[#475569]">
                                    {formatDateTime(assignment.createdAt)}
                                  </td>
                                  <td className="px-3 py-3 text-[#475569]">
                                    {formatDateTime(assignment.completedAt)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeSection === "Gate Performance" && (
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-[#1E293B]">
                        Historical Gate Check-ins
                      </h4>
                      <p className="mt-1 text-sm text-[#64748B]">
                        Check-in totals grouped by gate from recorded attendance. This is historical reporting, not live monitoring.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => exportGateCsv(gatePerformance, reportTitle)}
                        disabled={gatePerformance.length === 0}
                        className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
                      >
                        Export CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => exportGatePdf(gatePerformance, reportTitle)}
                        disabled={gatePerformance.length === 0}
                        className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-medium text-[#334155] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Export PDF
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <SummaryCard
                      label="Recorded Check-ins"
                      value={totalGateCheckIns}
                      description="Successful check-ins across the selected event scope"
                    />
                    <SummaryCard
                      label="Gates with Check-ins"
                      value={gatePerformance.length}
                      description="Distinct gate labels present in check-in records"
                    />
                  </div>

                  {gatePerformance.length === 0 ? (
                    <p className="mt-5 rounded-lg bg-[#F8FAFC] p-5 text-center text-sm text-[#64748B]">
                      No gate check-in records found for this selection.
                    </p>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[500px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] text-xs uppercase text-[#64748B]">
                            <th className="px-3 py-3 font-medium">Gate</th>
                            <th className="px-3 py-3 font-medium">Check-ins</th>
                            <th className="px-3 py-3 font-medium">Share of Check-ins</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gatePerformance.map((gate) => (
                            <tr key={gate.gate} className="border-b border-[#F1F5F9] last:border-0">
                              <td className="px-3 py-3 font-medium text-[#1E293B]">{gate.gate}</td>
                              <td className="px-3 py-3 text-[#475569]">{gate.checkIns}</td>
                              <td className="px-3 py-3 text-[#475569]">
                                {totalGateCheckIns > 0
                                  ? `${((gate.checkIns / totalGateCheckIns) * 100).toFixed(1)}%`
                                  : "0.0%"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "Incidents" && (
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-[#1E293B]">
                        Incident History
                      </h4>
                      <p className="mt-1 text-sm text-[#64748B]">
                        Incident reports and resolution status recorded for your events.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => exportIncidentCsv(filteredIncidents, reportTitle)}
                        disabled={filteredIncidents.length === 0}
                        className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
                      >
                        Export CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => exportIncidentPdf(filteredIncidents, reportTitle)}
                        disabled={filteredIncidents.length === 0}
                        className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-medium text-[#334155] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Export PDF
                      </button>
                    </div>
                  </div>

                  {incidentError ? (
                    <p className="mt-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
                      {incidentError}
                    </p>
                  ) : (
                    <>
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <SummaryCard label="Open" value={openIncidentCount} description="Awaiting action" />
                        <SummaryCard label="In Progress" value={inProgressIncidentCount} description="Currently being handled" />
                        <SummaryCard label="Resolved" value={resolvedIncidentCount} description="Marked as resolved" />
                      </div>

                      {filteredIncidents.length === 0 ? (
                        <p className="mt-5 rounded-lg bg-[#F8FAFC] p-5 text-center text-sm text-[#64748B]">
                          No incident reports found for this selection.
                        </p>
                      ) : (
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full min-w-[1000px] text-left text-sm">
                            <thead>
                              <tr className="border-b border-[#E2E8F0] text-xs uppercase text-[#64748B]">
                                <th className="px-3 py-3 font-medium">Incident</th>
                                <th className="px-3 py-3 font-medium">Event</th>
                                <th className="px-3 py-3 font-medium">Location</th>
                                <th className="px-3 py-3 font-medium">Severity</th>
                                <th className="px-3 py-3 font-medium">Status</th>
                                <th className="px-3 py-3 font-medium">Reported By</th>
                                <th className="px-3 py-3 font-medium">Reported At</th>
                                <th className="px-3 py-3 font-medium">Resolved At</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredIncidents.map((incident) => (
                                <tr key={incident.id} className="border-b border-[#F1F5F9] last:border-0">
                                  <td className="px-3 py-3">
                                    <div className="font-medium text-[#1E293B]">{incident.title}</div>
                                    <div className="mt-0.5 max-w-xs truncate text-xs text-[#64748B]" title={incident.description}>
                                      {incident.description}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 text-[#475569]">{incident.event?.title || "Event unavailable"}</td>
                                  <td className="px-3 py-3 text-[#475569]">{incident.location || "—"}</td>
                                  <td className="px-3 py-3">
                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                      incident.severity === "critical" || incident.severity === "high"
                                        ? "bg-[#FEE2E2] text-[#991B1B]"
                                        : incident.severity === "medium"
                                          ? "bg-[#FEF3C7] text-[#92400E]"
                                          : "bg-[#F1F5F9] text-[#475569]"
                                    }`}>
                                      {incident.severity}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3">
                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                      incident.status === "resolved"
                                        ? "bg-[#DCFCE7] text-[#166534]"
                                        : incident.status === "in_progress"
                                          ? "bg-[#DBEAFE] text-[#1D4ED8]"
                                          : "bg-[#FEF3C7] text-[#92400E]"
                                    }`}>
                                      {incident.status.replace(/_/g, " ")}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="font-medium text-[#1E293B]">{incident.reportedBy?.fullName || "Reporter unavailable"}</div>
                                    <div className="mt-0.5 text-xs text-[#64748B]">{incident.reportedBy?.email || "—"}</div>
                                  </td>
                                  <td className="px-3 py-3 text-[#475569]">{formatDateTime(incident.createdAt)}</td>
                                  <td className="px-3 py-3 text-[#475569]">{formatDateTime(incident.resolvedAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeSection === "Resources" && (
                <div>
                  <h4 className="text-base font-semibold text-[#1E293B]">
                    Resource Summary
                  </h4>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Inventory quantities and stock status for the selected
                    event.
                  </p>

                  {resourceError ? (
                    <p className="mt-4 text-sm text-[#B91C1C]">
                      {resourceError}
                    </p>
                  ) : filteredResources.length === 0 ? (
                    <p className="mt-4 rounded-lg bg-[#F8FAFC] p-5 text-center text-sm text-[#64748B]">
                      No resources found for this selection.
                    </p>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[500px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] text-xs uppercase text-[#64748B]">
                            <th className="px-3 py-3 font-medium">
                              Resource
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Total
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Used
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Available
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredResources.map((resource) => (
                            <tr
                              key={resource.id}
                              className="border-b border-[#F1F5F9] last:border-0"
                            >
                              <td className="px-3 py-3 font-medium text-[#1E293B]">
                                {resource.name}
                              </td>
                              <td className="px-3 py-3 text-[#475569]">
                                {resource.totalQuantity} {resource.unit}
                              </td>
                              <td className="px-3 py-3 text-[#475569]">
                                {resource.usedQuantity}
                              </td>
                              <td className="px-3 py-3 text-[#475569]">
                                {resource.availableQuantity}
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                    resource.status === "Available"
                                      ? "bg-[#DCFCE7] text-[#166534]"
                                      : resource.status === "Low"
                                        ? "bg-[#FEF3C7] text-[#92400E]"
                                        : "bg-[#FEE2E2] text-[#991B1B]"
                                  }`}
                                >
                                  {resource.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeSection !== "Attendance" &&
                activeSection !== "Resources" &&
                activeSection !== "Volunteer Performance" &&
                activeSection !== "Gate Performance" &&
                activeSection !== "Incidents" && (
                  <div className="rounded-lg bg-[#F8FAFC] p-5">
                    <h4 className="font-semibold text-[#1E293B]">
                      {activeSection}
                    </h4>
                    <p className="mt-2 text-sm text-[#64748B]">
                      This report is not connected to a dedicated backend
                      data source yet. No mock figures are shown here.
                    </p>
                  </div>
                )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}