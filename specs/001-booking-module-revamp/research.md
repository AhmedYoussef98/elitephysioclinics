# Research: Booking Module Revamp

**Date**: 2026-03-20
**Feature**: [spec.md](./spec.md)

## R1: Backend Architecture for Vite SPA

**Decision**: Add a co-located Express server alongside the Vite frontend

**Rationale**: The current project is a pure frontend Vite + React SPA with no server-side capabilities. The booking module requires API endpoints for booking creation (POST /api/book) and slot availability (GET /api/availability). Express is the lightest-weight option that maps directly to the reference project's Next.js API route patterns. Vite's built-in proxy configuration forwards `/api/*` to Express during development. In production, Express can serve the built static files and handle API requests from a single process.

**Alternatives considered**:
- **Next.js migration**: Would provide API routes natively but requires migrating the entire project away from Vite — too invasive for adding a booking module
- **Serverless functions (Vercel/Netlify)**: Adds deployment platform lock-in and complicates local development for an in-memory store
- **Vite plugin middleware**: Limited support, not well-documented for production use

## R2: In-Memory Storage Pattern

**Decision**: Use a JavaScript `Map<string, Booking>` for booking storage, matching the reference project

**Rationale**: The spec explicitly states in-memory storage for the initial phase. A Map provides O(1) lookup by ID and simple iteration for date-based queries. This matches the reference project's `store.ts` pattern exactly. Data is lost on server restart, which is acceptable for MVP.

**Alternatives considered**:
- **SQLite**: Persistent but adds a dependency and complexity not needed for MVP
- **JSON file**: Persistent but introduces file I/O complexity and race conditions
- **localStorage/IndexedDB**: Client-side only — cannot enforce double-booking prevention across users

## R3: Validation Library

**Decision**: Use Zod for both client-side and server-side validation

**Rationale**: The reference project uses Zod for schema validation. Zod provides type-safe schema definitions that integrate naturally with TypeScript, and schemas can be shared between client and server for consistency. The booking form validates: patient name (max 100 chars), UK phone format (`/^(\+44|0)[\s\-]?[\d\s\-]{9,12}$/`), valid email, condition slug (one of 11 values), date (YYYY-MM-DD, within 4-week window, not Sunday, not past), and start time (HH:MM, within clinic hours).

**Alternatives considered**:
- **Yup**: Similar capability but Zod has better TypeScript inference
- **Manual validation**: Error-prone, no schema reuse between client/server

## R4: WhatsApp Notification Integration

**Decision**: Fire-and-forget WhatsApp notification via Meta Graph API or Twilio, with console fallback for development

**Rationale**: The reference project implements a dual-provider pattern (Meta Graph API and Twilio) with environment variable configuration. If neither is configured, it logs to console. Notifications are sent asynchronously after booking creation and do not block the API response. This pattern is robust — booking succeeds even if notification fails.

**Alternatives considered**:
- **Blocking notification**: Would delay booking confirmation and risk timeout
- **Message queue**: Over-engineered for fire-and-forget with in-memory storage

## R5: Date/Time Handling for UK Timezone

**Decision**: Use date strings (YYYY-MM-DD) and time strings (HH:MM) without timezone conversion. All times represent UK clinic local time.

**Rationale**: The clinic operates in a single timezone (Europe/London). Storing and displaying dates as simple strings avoids timezone conversion complexity. The calendar generates dates client-side based on the current date, and the server validates that submitted dates fall within the 4-week window. No timezone-aware library (e.g., date-fns-tz) is needed for MVP.

**Alternatives considered**:
- **UTC storage with timezone conversion**: Adds complexity for a single-timezone clinic
- **Luxon/date-fns-tz**: Unnecessary dependency for simple string-based dates

## R6: Frontend Component Architecture

**Decision**: Create dedicated booking components in `src/components/booking/` using inline styles matching the existing App.tsx pattern

**Rationale**: The current project uses inline style objects throughout App.tsx (no CSS modules, no Tailwind, no styled-components). The booking components must follow this same pattern for visual consistency. Framer Motion is already available for animations. Components will be imported into App.tsx and rendered in place of the existing contact form.

**Alternatives considered**:
- **CSS modules**: Would introduce a different styling pattern than the rest of the codebase
- **Tailwind CSS**: Would require installation and configuration, introducing a new paradigm

## R7: Unique Booking Reference Generation

**Decision**: Use the `crypto.randomUUID()` API (Node.js built-in) for server-side ID generation, display first 8 characters as the booking reference

**Rationale**: Matches the reference project pattern. `crypto.randomUUID()` is available in Node.js 19+ and all modern browsers. No external UUID library needed. The 8-character prefix provides sufficient uniqueness for display purposes while the full UUID is used internally.

**Alternatives considered**:
- **uuid package**: External dependency for something built into the runtime
- **nanoid**: Shorter IDs but different format than reference project

## R8: Concurrent Dev Server Setup

**Decision**: Use `concurrently` to run Vite dev server and Express server simultaneously during development

**Rationale**: Development requires both the frontend (Vite on port 5173) and backend (Express on port 3001) running together. The `concurrently` npm package runs both with a single `npm run dev` command. Vite's proxy config forwards `/api/*` requests to the Express server.

**Alternatives considered**:
- **Single process with Vite middleware**: Limited Express compatibility
- **Manual terminal management**: Poor developer experience
