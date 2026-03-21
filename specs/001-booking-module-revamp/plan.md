# Implementation Plan: Booking Module Revamp

**Branch**: `001-booking-module-revamp` | **Date**: 2026-03-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-booking-module-revamp/spec.md`

## Summary

Replace the existing contact form in the Contact section with a 3-step multi-step booking form (Condition → Date & Time → Patient Details) modeled after the Elite-Clinic reference project. The booking form must visually match the current site's design language (dark navy, blue accents, Cormorant Garamond + Outfit fonts, glassmorphism, Framer Motion animations). A lightweight Express API server provides booking creation and availability endpoints with in-memory storage. WhatsApp notifications are sent to the clinic on each booking.

## Technical Context

**Language/Version**: TypeScript 5.2.2
**Primary Dependencies**: React 18.2, Vite 5.0.8, Framer Motion 11.0, Lucide React 0.441, Express (new), Zod (new), uuid (new)
**Storage**: In-memory Map (initial phase; no database)
**Testing**: Vitest (new — no testing framework currently configured)
**Target Platform**: Web browser (responsive: mobile, tablet, desktop)
**Project Type**: Single-page web application with co-located API server
**Performance Goals**: Booking completion < 2 minutes, slot availability response < 1 second
**Constraints**: UK timezone for all dates/times, 30-min fixed slots, no authentication required
**Scale/Scope**: Single clinic, ~50 bookings/day expected, 4-week rolling window

## Constitution Check

*No constitution file found. Skipping gate checks.*

## Project Structure

### Documentation (this feature)

```text
specs/001-booking-module-revamp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md           # REST API contracts
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── booking/
│       ├── BookingForm.tsx       # Main 3-step form orchestrator
│       ├── ConditionSelect.tsx   # Step 1: condition dropdown
│       ├── DatePicker.tsx        # Step 2a: calendar grid
│       ├── TimeSlotPicker.tsx    # Step 2b: time slot grid
│       ├── PatientDetails.tsx    # Step 3: name, phone, email, consent
│       ├── StepIndicator.tsx     # Visual progress indicator
│       └── Confirmation.tsx      # Booking success screen
├── lib/
│   ├── constants.ts             # Conditions, clinic hours, config
│   ├── validation.ts            # Client-side Zod schemas
│   └── types.ts                 # Shared TypeScript interfaces
├── App.tsx                      # Updated: booking replaces contact form
├── main.tsx
├── index.css                    # Updated: booking-specific styles
└── remotion/
    └── HeroComposition.tsx

server/
├── index.ts                     # Express server entry point
├── routes/
│   ├── book.ts                  # POST /api/book
│   └── availability.ts         # GET /api/availability
├── lib/
│   ├── store.ts                 # In-memory booking store (Map)
│   ├── slots.ts                 # Slot generation & availability logic
│   ├── validation.ts            # Server-side Zod schemas
│   └── whatsapp.ts              # WhatsApp notification (fire-and-forget)
└── types.ts                     # Server-side type definitions
```

**Structure Decision**: Co-located frontend (Vite + React) and backend (Express) in the same repository. The current project is a pure frontend SPA with no backend. Adding a lightweight Express server alongside Vite provides the API endpoints needed for booking and availability without migrating to a full-stack framework. Vite's dev server proxy forwards `/api/*` requests to Express during development. In production, both are deployed together or the Express server serves the built static files.

## Complexity Tracking

No constitution violations to justify.
