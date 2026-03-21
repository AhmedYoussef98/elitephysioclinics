# Implementation Plan: Supabase Booking System

**Branch**: `002-supabase-booking-mvp` | **Date**: 2026-03-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-supabase-booking-mvp/spec.md`

## Summary

Replace the in-memory Express backend with direct Supabase client calls from the React frontend. The booking form will persist appointments to Supabase via RPC functions. A new admin panel at `/clinic-portal` (behind Supabase Auth) enables the clinic owner to manage appointments, create manual bookings, and control availability. WhatsApp notifications are handled by a Supabase Edge Function triggered on new appointment inserts.

## Technical Context

**Language/Version**: TypeScript 5.2.2 + React 18.2
**Primary Dependencies**: @supabase/supabase-js (new), react-router (new), Framer Motion 11.0, Lucide React 0.441, Zod 4.3
**Storage**: Supabase (PostgreSQL) — tables: appointments, blocked_periods, blocked_slots
**Testing**: Manual testing via browser + Supabase dashboard
**Target Platform**: Web browser (desktop + mobile responsive)
**Project Type**: Single-page web application with client-side routing
**Performance Goals**: Admin panel interactive in <3s, booking form submission <2s
**Constraints**: Supabase free tier, single admin user, 30-minute appointment slots
**Scale/Scope**: ~50 appointments/day, 1 admin user, 12 condition types

## Constitution Check

*No constitution file found. Skipping gate check.*

## Project Structure

### Documentation (this feature)

```text
specs/002-supabase-booking-mvp/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research decisions
├── data-model.md        # Entity model and database schema
├── quickstart.md        # Setup and run guide
├── checklists/
│   └── requirements.md  # Spec quality checklist
├── contracts/
│   ├── schema.sql       # Complete Supabase SQL schema
│   ├── supabase-setup.md # Step-by-step Supabase setup guide
│   └── client-api.md    # Client API contract (RPC + queries)
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── main.tsx                    # MODIFIED: Add BrowserRouter wrapper
├── App.tsx                     # MODIFIED: Add Routes, keep website as "/" route
├── index.css                   # MODIFIED: Add admin panel styles
├── lib/
│   ├── supabase.ts             # NEW: Supabase client instance
│   ├── constants.ts            # EXISTING: Conditions, clinic hours
│   ├── types.ts                # MODIFIED: Add admin types, remove server types
│   └── validation.ts           # EXISTING: Zod schemas (reused)
├── context/
│   └── AuthContext.tsx         # NEW: Auth provider (session, signIn, signOut)
├── components/
│   ├── booking/                # EXISTING: Modified to use Supabase
│   │   ├── BookingForm.tsx     # MODIFIED: Submit via supabase.rpc()
│   │   ├── ConditionSelect.tsx # UNCHANGED
│   │   ├── Confirmation.tsx    # UNCHANGED
│   │   ├── DatePicker.tsx      # MODIFIED: Fetch blocked dates from Supabase
│   │   ├── PatientDetails.tsx  # UNCHANGED
│   │   ├── StepIndicator.tsx   # UNCHANGED
│   │   └── TimeSlotPicker.tsx  # MODIFIED: Fetch slots via supabase.rpc()
│   └── admin/                  # NEW: Admin panel components
│       ├── ProtectedRoute.tsx  # Outlet wrapper, redirects if no session
│       ├── LoginForm.tsx       # Email/password login form
│       ├── AdminLayout.tsx     # Admin shell (nav, header, logout)
│       ├── AppointmentList.tsx # Filterable appointment table
│       ├── AppointmentActions.tsx # Reschedule/cancel/complete modals
│       ├── CreateAppointment.tsx  # Manual appointment creation form
│       └── AvailabilityManager.tsx # Block dates/slots management
└── remotion/
    └── HeroComposition.tsx     # UNCHANGED

.env                            # NEW: Supabase keys (gitignored)
.env.example                    # NEW: Template without real keys
```

### Files to Remove

```text
server/                         # ENTIRE DIRECTORY
├── index.ts
├── types.ts
├── lib/
│   ├── slots.ts
│   ├── store.ts
│   ├── validation.ts
│   └── whatsapp.ts
└── routes/
    ├── availability.ts
    └── book.ts
```

### Edge Function (Supabase-hosted)

```text
supabase/functions/whatsapp-notify/
└── index.ts                    # Deno Edge Function for WhatsApp notifications
```

**Structure Decision**: Single-project frontend-only architecture. The Express backend is removed entirely. All server-side logic runs in Supabase (PostgreSQL functions + Edge Functions). React handles both the patient booking form and the admin panel via client-side routing.

## Implementation Phases

### Phase 1: Foundation — Supabase Client + Booking Integration (P1)

**Goal**: Working booking form that persists to Supabase. No admin panel yet.

1. Install dependencies (`@supabase/supabase-js`, `react-router`). Note: React Router v7 imports from `"react-router"` not `"react-router-dom"`
2. Remove Express dependencies and `server/` directory
3. Create `.env` and `.env.example`
4. Create `src/lib/supabase.ts` — Supabase client instance
5. Update `src/components/booking/TimeSlotPicker.tsx`:
   - Replace `fetch('/api/availability?date=...')` with `supabase.rpc('get_unavailable_slots', { booking_date })`
   - Map response to existing `TimeSlot` interface
6. Update `src/components/booking/DatePicker.tsx`:
   - Fetch blocked dates via `supabase.rpc('get_blocked_dates', { from_date, to_date })`
   - Disable blocked dates in calendar
7. Update `src/components/booking/BookingForm.tsx`:
   - Replace `fetch('/api/book', ...)` with `supabase.rpc('book_appointment', { ... })`
   - Handle the JSON response (`success: true/false`)
   - Map successful response to existing `BookingWithCondition` type for confirmation
8. Update `vite.config.ts` — remove `/api` proxy
9. Update `package.json` — remove Express scripts, update `dev` to run only Vite
10. Update `tsconfig.json` — remove `server` from includes

**Verification**: Complete a booking on localhost → see it in Supabase Table Editor.

### Phase 2: Routing + Admin Auth (P2)

**Goal**: Admin panel accessible at `/clinic-portal` with login.

1. Create `src/context/AuthContext.tsx` — AuthProvider with:
   - `supabase.auth.getSession()` on mount for initial session
   - `supabase.auth.onAuthStateChange()` listener for updates
   - Exposes: `session`, `user`, `loading`, `signIn()`, `signOut()`
   - Cleanup subscription on unmount
2. Update `src/main.tsx` — wrap App in `BrowserRouter` + `AuthProvider`
3. Update `src/App.tsx`:
   - Import from `"react-router"` (v7 unified package)
   - Wrap current website content in a Route for `"/*"`
   - Add route for `/clinic-portal/login` → `LoginForm`
   - Add `ProtectedRoute` wrapper (uses `useAuth()` + `<Outlet />`)
   - Nest `/clinic-portal/*` → `AdminLayout` inside ProtectedRoute
4. Create `src/components/admin/LoginForm.tsx`:
   - Email + password form using `useAuth().signIn()`
   - Redirect to `/clinic-portal` on success (preserve intended destination via `location.state`)
   - Error display for invalid credentials
5. Create `src/components/admin/ProtectedRoute.tsx`:
   - Uses `useAuth()` to check session
   - Shows loading spinner while `loading` is true
   - Redirects to `/clinic-portal/login` if no session
   - Renders `<Outlet />` if authenticated
6. Create `src/components/admin/AdminLayout.tsx`:
   - Header with clinic name + logout button (uses `useAuth().signOut()`)
   - Navigation (Appointments, Availability)
   - `<Outlet />` for nested child routes

**Verification**: Navigate to `/clinic-portal` → redirected to login → log in → see admin shell.

### Phase 3: Appointment Management (P2-P3)

**Goal**: View, filter, cancel, reschedule, and manually create appointments.

1. Create `src/components/admin/AppointmentList.tsx`:
   - Fetch appointments: `supabase.from('appointments').select('*').order('date')`
   - Filters: status dropdown, date range picker
   - Table display: date, time, patient name, condition, status, actions
   - Color-coded status badges
2. Create `src/components/admin/AppointmentActions.tsx`:
   - Cancel: confirm dialog → update status to 'cancelled'
   - Complete: update status to 'completed'
   - Reschedule: date/time picker modal → mark old as 'rescheduled' + create new via RPC
3. Create `src/components/admin/CreateAppointment.tsx`:
   - Form with: patient name, phone, email, condition, date, time
   - Reuse validation from `src/lib/validation.ts`
   - Submit via `supabase.rpc('book_appointment', { ... })`
   - Show success/error feedback

**Verification**: Create, view, reschedule, cancel appointments from admin panel.

### Phase 4: Availability Management (P4)

**Goal**: Admin can block dates/slots, reflected in patient booking form.

1. Create `src/components/admin/AvailabilityManager.tsx`:
   - Two sections: Blocked Periods + Blocked Slots
   - Blocked Periods: list existing, add new (date range + reason), delete
   - Blocked Slots: list existing, add new (date + time + reason), delete
   - All operations via `supabase.from('blocked_periods')` / `supabase.from('blocked_slots')`
2. DatePicker already fetches blocked dates (from Phase 1) — verify integration

**Verification**: Block a date in admin → refresh booking form → date is disabled.

### Phase 5: WhatsApp Edge Function (P1 — FR-005)

**Goal**: Clinic owner gets WhatsApp notification on new bookings.

1. Create Supabase Edge Function `supabase/functions/whatsapp-notify/index.ts`
2. Configure database webhook in Supabase dashboard (INSERT on appointments)
3. Store WhatsApp API credentials as Supabase secrets
4. Adapt message format from existing `server/lib/whatsapp.ts`

**Note**: This can be deferred to after the core system is working. The admin panel provides visibility into bookings even without notifications.

**Verification**: Create a booking → clinic owner receives WhatsApp message.

## Complexity Tracking

No constitution violations to track.
