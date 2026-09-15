# EventPulse

EventPulse is a modern event management platform designed to simplify planning, registrations, ticketing, volunteer coordination, and on-site check-in for different event stakeholders.

## Overview

The project brings together four major roles into one connected experience:

- Attendees can browse events, register, and manage tickets
- Organizers can track events, attendees, and event performance
- Volunteers can view opportunities and shifts
- Scanner staff can validate entry using QR-based check-in flows

This app is built as a full event ecosystem prototype with a strong focus on usability, clean dashboards, and streamlined event operations.

## Features

- Event discovery and registration flow for attendees
- Digital ticket management with QR-based access
- Organizer dashboard for attendance, event metrics, and operations
- Volunteer opportunity listings, applications, and shift tracking
- Scanner interface for fast entry validation and gate management
- Profile management, notifications, and settings pages
- Ticket transfer, reminders, and event updates
- Responsive multi-role UI for desktop and mobile devices
- Event-specific pages for ticket details, attendee flow, and volunteer actions
- Clean modern dashboard design focused on event operations and user experience

## Tech Stack

- React + TypeScript
- Vite
- React Router
- Tailwind CSS
- Lucide React icons
- HTML5 QR code scanning support

## Project Structure

```text
EventPulse/
├── README.md
├── backend/
│   └── (backend service scaffold for future API development)
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
└── .gitignore
```

## Getting Started on Your PC

### 1. Install Node.js

Make sure Node.js and npm are installed on your computer.

- Download from: https://nodejs.org/
- Verify installation:

```bash
node -v
npm -v
```

### 2. Open the project folder

```bash
cd "C:\Users\Anushka Verma\OneDrive\Desktop\Sem 5\SE\Project\EventPulse"
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
```

### 4. Run the app locally

```bash
npm run dev
```

After the command starts successfully, Vite will show a local URL such as:

```text
http://localhost:5173
```

Open that URL in your browser to view the project.

### 5. Build for production

```bash
npm run build
```

This creates a production-ready build in the frontend build folder.

## Role-Based Experience

### Attendee
- View upcoming events
- Register and purchase tickets
- Track ticket status and QR code
- Receive reminders and updates

### Organizer
- Manage event listings and attendee activity
- Review check-ins and operational metrics
- Coordinate event planning and communication

### Volunteer
- Browse opportunities
- Apply for roles and manage shifts
- Track responsibilities and tasks

### Scanner
- Select event and gate
- Scan admission QR codes
- Validate ticket status in real time

## Notes

- The current project is a polished frontend prototype with mock data and UI flows.
- The backend folder is reserved for future API integration and server-side logic.
- This repository is ideal for demonstrating event lifecycle management in a software engineering project context.

## Project Goal

EventPulse aims to create a smooth, modern event experience where attendees, organizers, volunteers, and staff can work together efficiently across the entire event lifecycle, from registration and ticketing to check-in, coordination, and post-event operations.

## Why This Project Matters

Modern events involve multiple moving parts: registrations, staffing, ticket validation, communication, and live operations. EventPulse addresses that complexity by combining these workflows into a single streamlined platform, making events easier to manage and more enjoyable for everyone involved.

## Ideal Use Cases

- College festivals and campus events
- Conferences and seminars
- Workshops and community meetups
- Tech events and hackathons
- Multi-day event operations with staffing and check-in needs
