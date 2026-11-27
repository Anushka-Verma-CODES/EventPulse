# EventPulse

EventPulse is a full-stack event management platform that covers the whole event lifecycle: discovery, registration, ticketing and payments, volunteer coordination, QR-based gate check-in, and live crowd monitoring.

It serves four roles from one account system: **Attendees**, **Organizers**, **Volunteers**, and **Scanner Staff**.

- **Frontend (live):** https://event-pulse-lovat.vercel.app
- **Backend API:** hosted on Render (`https://eventpulse-toa3.onrender.com`)

---

## Features

### Attendees
- Browse and search events, view event details and FAQs
- Register for events and pay through Razorpay
- Digital tickets with QR codes, downloadable as PDF
- Resell or transfer tickets through the ticket marketplace
- Live entry status for each gate (crowd level and wait time)
- In-app and browser push notifications

### Organizers
- Create, edit, and publish events
- Dashboard with registrations, revenue, and check-in metrics
- Attendee list and reports
- Live monitoring of gates with configurable crowd thresholds
- Historical traffic charts and attendance predictions
- Volunteer management: review applications, assign shifts, approve hours
- Resource tracking and incident reporting
- Assign scanner staff to events and gates

### Volunteers
- Browse volunteer opportunities and apply
- Track applications, shifts, and tasks
- Log hours for organizer review

### Scanner Staff
- Select an assigned event and gate
- Scan attendee QR codes with the device camera, or enter ticket codes manually
- Instant valid / invalid / already-used results
- Scan history for the session

### Platform
- JWT authentication with password reset by email
- One account can activate multiple roles
- Real-time updates over WebSockets (Socket.IO)
- Web push notifications (VAPID) via a service worker
- Light and dark themes, responsive on desktop and mobile

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS + daisyUI, Lucide icons, html5-qrcode, react-qr-code, jsPDF, Socket.IO client |
| Backend | NestJS, TypeScript, TypeORM, PostgreSQL, Passport JWT, bcrypt, class-validator, Socket.IO |
| Integrations | Razorpay (payments), Brevo (transactional email), web-push (browser notifications) |
| Hosting | Vercel (frontend), Render (backend), Neon (PostgreSQL) |
| Tooling | Jest, Supertest, ESLint, oxlint, Prettier |

---

## Project Structure

```text
EventPulse/
├── backend/                 NestJS REST + WebSocket API
│   └── src/
│       ├── auth/            Login, signup, JWT, password reset, profile, role activation
│       ├── users/           User entity and role assignments
│       ├── events/          Event CRUD
│       ├── registrations/   Registrations, tickets, QR check-in, scan attempts
│       ├── payments/        Razorpay order creation and verification
│       ├── ticket-listings/ Ticket resale / transfer marketplace
│       ├── gates/           Event gates, crowd thresholds, live entry status
│       ├── volunteers/      Applications, assignments, hours, scanner assignments
│       ├── resources/       Event resource tracking
│       ├── incidents/       Incident reporting
│       └── notifications/   In-app notifications, Socket.IO gateway, web push
├── frontend/                React + Vite single-page app
│   ├── public/              Static assets and service worker (sw.js)
│   └── src/
│       ├── pages/           Route pages, grouped by role (attendee, organizer, volunteer, scanner)
│       ├── components/      Shared and role-specific UI components
│       ├── features/        API clients and feature components
│       ├── context/         Auth, theme, notification and scanner state
│       ├── routes/          App routes and protected-route guard
│       └── lib/             API config, HTTP client, socket setup
└── Documentation/           SRS, test cases, UML/DFD/ER diagrams, presentation
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later, and npm
- A PostgreSQL database — local, or a free hosted one such as [Neon](https://neon.tech/)
- Optional: Razorpay test keys, a Brevo API key, and VAPID keys if you want payments, email and push notifications to work

### 1. Clone the repository

```bash
git clone <repository-url>
cd EventPulse
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and fill in the values:

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | API port (default `3000`) |
| `NODE_ENV` | No | Set to `development` to let TypeORM auto-create tables |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Long random string used to sign tokens |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Yes | Web push keys — generate with `npx web-push generate-vapid-keys` |
| `VAPID_SUBJECT` | Yes | Contact for push, e.g. `mailto:admin@example.com` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | For payments | Razorpay test-mode keys |
| `BREVO_API_KEY` / `BREVO_SENDER_EMAIL` / `BREVO_SENDER_NAME` | For emails | Used to send password-reset emails |

> The database connection uses SSL. With `NODE_ENV=development`, the schema is synchronized automatically on startup — don't use that setting against a production database.

Start the API in watch mode:

```bash
npm run start:dev
```

The API runs at `http://localhost:3000`.

### 3. Set up the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

When the frontend runs on `localhost`, it automatically talks to `http://localhost:3000`. To point it at a different backend, create `frontend/.env` with:

```env
VITE_API_BASE_URL=https://your-backend-url
```

If you serve the frontend from a different origin, add that origin to the CORS list in [backend/src/main.ts](backend/src/main.ts).

---

## Available Scripts

### Backend (`backend/`)

| Command | Description |
|---|---|
| `npm run start:dev` | Start with hot reload |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run the compiled build |
| `npm test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |
| `npm run test:cov` | Test coverage report |
| `npm run lint` | Lint with oxlint |
| `npm run format` | Format with Prettier |

### Frontend (`frontend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with ESLint |

---

## API Overview

All routes are served from the backend base URL. Protected routes expect an `Authorization: Bearer <token>` header.

| Route prefix | Purpose |
|---|---|
| `/auth` | Register, login, profile, settings, password change/reset, role activation |
| `/events` | Event listing, details, create/update/delete, gates and live entry status |
| `/events/:eventId/gate-thresholds` | Crowd thresholds per gate |
| `/registrations` | Register for events, view tickets, QR check-in |
| `/payments` | Create and verify Razorpay orders |
| `/ticket-listings` | List, buy and transfer tickets |
| `/volunteers` | Applications, assignments, hours, scanner assignments |
| `/resources` | Event resources |
| `/incidents` | Incident reports |
| `/notifications` | Notifications and push subscriptions |

---

## Documentation

The [Documentation](Documentation/) folder contains the software-engineering deliverables for the project:

- Project report and SRS (`Eventpulse.pdf`, `EventPulse EST Report.pdf`, `Eventpulse mst file.pdf`)
- Test cases (`Eventpulse TestCase.xlsx`)
- Use case, sequence, activity (swimlane), state, collaboration and component diagrams
- DFD (level 0 and level 1) and ER diagram
- Front/back ID-card designs for each role
- Presentation slides (`SE PPT.pdf`)

---

## Team

- Arpit Goswami
- Anushka Verma
- Rajat Sharma

Built as a Software Engineering project (Semester 5).
