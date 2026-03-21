# Quickstart: Booking Module Revamp

**Date**: 2026-03-20
**Branch**: `001-booking-module-revamp`

## Prerequisites

- Node.js 18+ (for `crypto.randomUUID()` support)
- npm 9+

## Setup

```bash
# Switch to feature branch
git checkout 001-booking-module-revamp

# Install dependencies (includes new: express, zod, cors, concurrently, tsx)
npm install

# Start development (runs Vite + Express concurrently)
npm run dev
```

## Development URLs

| Service          | URL                          |
|------------------|------------------------------|
| Frontend (Vite)  | http://localhost:5173        |
| API Server       | http://localhost:3001        |
| API Proxy        | http://localhost:5173/api/*  |

Vite proxies `/api/*` to the Express server during development.

## New Dependencies

### Production

| Package    | Purpose                              |
|------------|--------------------------------------|
| express    | API server for booking endpoints     |
| zod        | Schema validation (client + server)  |
| cors       | Cross-origin requests (dev)          |
| uuid       | Booking ID generation (fallback)     |

### Development

| Package      | Purpose                                    |
|--------------|--------------------------------------------|
| concurrently | Run Vite + Express in parallel             |
| tsx          | Run TypeScript server without compilation  |
| @types/express | TypeScript types for Express            |
| @types/cors    | TypeScript types for CORS               |

## New npm Scripts

```json
{
  "dev": "concurrently \"vite\" \"tsx watch server/index.ts\"",
  "dev:client": "vite",
  "dev:server": "tsx watch server/index.ts",
  "build": "tsc && vite build",
  "start": "node server/dist/index.js"
}
```

## Key Files to Modify

| File         | Change                                                     |
|--------------|------------------------------------------------------------|
| src/App.tsx  | Replace contact form with BookingForm component            |
| src/App.tsx  | Update CTA buttons from `tel:` links to `#contact` anchors |
| vite.config.ts | Add proxy configuration for `/api` → localhost:3001     |
| package.json | Add new dependencies and scripts                           |

## Key Files to Create

| File                              | Purpose                        |
|-----------------------------------|--------------------------------|
| server/index.ts                   | Express server entry point     |
| server/routes/book.ts             | POST /api/book endpoint        |
| server/routes/availability.ts     | GET /api/availability endpoint |
| server/lib/store.ts               | In-memory booking store        |
| server/lib/slots.ts               | Time slot generation           |
| server/lib/validation.ts          | Server-side Zod schemas        |
| server/lib/whatsapp.ts            | WhatsApp notifications         |
| src/components/booking/BookingForm.tsx    | Main 3-step form       |
| src/components/booking/ConditionSelect.tsx | Step 1               |
| src/components/booking/DatePicker.tsx      | Step 2a              |
| src/components/booking/TimeSlotPicker.tsx  | Step 2b              |
| src/components/booking/PatientDetails.tsx  | Step 3               |
| src/components/booking/StepIndicator.tsx   | Progress indicator   |
| src/components/booking/Confirmation.tsx    | Success screen       |
| src/lib/constants.ts              | Shared conditions & config     |
| src/lib/validation.ts             | Client-side validation         |
| src/lib/types.ts                  | Shared TypeScript interfaces   |

## Environment Variables (optional)

```env
# WhatsApp Notification (optional — falls back to console.log)
WHATSAPP_PROVIDER=meta|twilio
WHATSAPP_TOKEN=your_api_token
WHATSAPP_FROM=your_sender_number
WHATSAPP_TO=clinic_recipient_number

# Server
PORT=3001
```

## Testing the Booking Flow

1. Open http://localhost:5173
2. Click "Book Now" in the navigation
3. Select a condition from the dropdown
4. Pick a date from the calendar (not Sunday)
5. Select an available time slot
6. Enter patient details (name, UK phone, email)
7. Check the consent checkbox
8. Submit — verify confirmation screen appears
9. Check terminal for WhatsApp notification log
