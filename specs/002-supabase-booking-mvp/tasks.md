# Tasks: Supabase Booking System

**Input**: Design documents from `/specs/002-supabase-booking-mvp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — manual testing via browser + Supabase dashboard.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, create Supabase client, remove Express backend, update configs.

- [x] T001 Install @supabase/supabase-js and react-router dependencies via npm
- [x] T002 Uninstall Express dependencies: express, cors, @types/express, @types/cors, concurrently, tsx
- [x] T003 [P] Create .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in project root
- [x] T004 [P] Create .env.example with placeholder values (no real keys) in project root
- [x] T005 [P] Add .env to .gitignore if not already present
- [x] T006 Create src/lib/supabase.ts — Supabase client singleton using import.meta.env.VITE_SUPABASE_URL and import.meta.env.VITE_SUPABASE_ANON_KEY
- [x] T007 [P] Update vite.config.ts — remove the /api proxy to localhost:3001
- [x] T008 [P] Update package.json — remove dev:server script, change dev script to run only Vite (remove concurrently)
- [x] T009 [P] Update tsconfig.json — remove "server" from includes array
- [x] T010 Remove server/ directory entirely (index.ts, types.ts, lib/, routes/)

**Checkpoint**: Project compiles with Supabase client available. No Express references remain.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, auth context, and routing structure. MUST complete before admin user stories.

**Warning**: No admin story work can begin until this phase is complete.

- [x] T011 Update src/lib/types.ts — add Supabase booking response types (BookAppointmentResponse with success/error/data fields), add UnavailableSlot type (start_time, end_time, reason), add BlockedDate type (blocked_date)
- [x] T012 Create src/context/AuthContext.tsx — AuthProvider component with: getSession() on mount, onAuthStateChange listener, expose session/user/loading/signIn/signOut via useAuth() hook, cleanup subscription on unmount
- [x] T013 Update src/main.tsx — wrap App component in BrowserRouter (from "react-router") and AuthProvider
- [x] T014 Update src/App.tsx — import Routes and Route from "react-router", wrap current website content as the "/" route using a Route element, add placeholder comment for admin routes (added in Phase 4)

**Checkpoint**: Foundation ready — routing works, auth context available, types defined. User story implementation can begin.

---

## Phase 3: User Story 1 — Patient Books with Persistent Storage (Priority: P1) MVP

**Goal**: Booking form persists appointments to Supabase. Patient sees confirmation with reference number. Blocked dates/slots reflected in calendar and time picker.

**Independent Test**: Complete a booking on localhost → confirmation screen shows reference → appointment appears in Supabase Table Editor → booked slot appears unavailable on refresh.

### Implementation for User Story 1

- [x] T015 [P] [US1] Update src/components/booking/TimeSlotPicker.tsx — replace fetch('/api/availability?date=...') with supabase.rpc('get_unavailable_slots', { booking_date }), map response to TimeSlot interface (mark unavailable slots from both 'booked' and 'blocked' reasons)
- [x] T016 [P] [US1] Update src/components/booking/DatePicker.tsx — add useEffect to fetch blocked dates via supabase.rpc('get_blocked_dates', { from_date, to_date }) for the 4-week booking window, disable blocked dates alongside Sundays and past dates
- [x] T017 [US1] Update src/components/booking/BookingForm.tsx — replace fetch('/api/book', ...) POST with supabase.rpc('book_appointment', { p_patient_name, p_patient_phone, p_patient_email, p_condition_slug, p_condition_title, p_date, p_start_time }), handle JSON response (success: true → map data to BookingWithCondition for confirmation, success: false → display error message), handle double-booking error

**Checkpoint**: User Story 1 is fully functional. Patients can book appointments that persist to Supabase. This is the MVP — stop and validate here before proceeding.

---

## Phase 4: User Story 2 — Clinic Owner Views and Manages Appointments (Priority: P2)

**Goal**: Admin panel at /clinic-portal with login. View all appointments with filters. Cancel and reschedule appointments.

**Independent Test**: Navigate to /clinic-portal → redirected to login → log in with admin credentials → see appointment list → filter by status → cancel an appointment → reschedule an appointment.

**Depends on**: Phase 2 (AuthContext, routing)

### Implementation for User Story 2

- [x] T018 [P] [US2] Create src/components/admin/LoginForm.tsx — email/password form, call useAuth().signIn(), redirect to /clinic-portal on success (preserve intended destination via location.state), display error for invalid credentials, styled with clinic branding
- [x] T019 [P] [US2] Create src/components/admin/ProtectedRoute.tsx — use useAuth() hook, show loading spinner while loading is true, redirect to /clinic-portal/login if no session (pass current location in state), render Outlet if authenticated
- [x] T020 [US2] Create src/components/admin/AdminLayout.tsx — header with "Elite Physio Clinics — Admin" and logout button (useAuth().signOut()), sidebar/tab navigation for Appointments and Availability sections, Outlet for nested child routes
- [x] T021 [US2] Create src/components/admin/AppointmentList.tsx — fetch appointments via supabase.from('appointments').select('*').order('date').order('start_time'), add filters: status dropdown (all/confirmed/cancelled/completed/rescheduled) and date range inputs, table columns: date, time, patient name, phone, condition, status (color-coded badge), actions, loading and empty states
- [x] T022 [US2] Create src/components/admin/AppointmentActions.tsx — Cancel button: confirmation dialog then supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id), Complete button: update status to 'completed', Reschedule button: modal with date/time picker, mark original as 'rescheduled' then create new via supabase.rpc('book_appointment'), refresh list after each action
- [x] T023 [US2] Update src/App.tsx — add admin routes: /clinic-portal/login → LoginForm, wrap /clinic-portal/* in ProtectedRoute element, nest AdminLayout with index route → AppointmentList, import all admin components

**Checkpoint**: User Story 2 complete. Admin can log in, view appointments with filters, cancel and reschedule. Test independently at /clinic-portal.

---

## Phase 5: User Story 3 — Clinic Owner Manually Creates Appointments (Priority: P3)

**Goal**: Admin can create appointments on behalf of walk-in/phone patients from the admin panel.

**Independent Test**: Log into admin panel → click "New Appointment" → fill in patient details → select condition, date, time → submit → appointment appears in list and blocks the time slot for online bookings.

**Depends on**: Phase 4 (Admin panel exists)

### Implementation for User Story 3

- [x] T024 [US3] Create src/components/admin/CreateAppointment.tsx — form with fields: patient name, phone (UK format validation), email, condition dropdown (from CONDITIONS constant), date picker, time slot picker (showing only available slots via get_unavailable_slots RPC), consent auto-checked for admin-created bookings, submit via supabase.rpc('book_appointment'), success/error feedback, reuse Zod validation from src/lib/validation.ts
- [x] T025 [US3] Add "New Appointment" route and navigation in src/App.tsx and src/components/admin/AdminLayout.tsx — add route /clinic-portal/new → CreateAppointment, add "New Appointment" button/link in admin navigation

**Checkpoint**: User Story 3 complete. Admin can create appointments that block time slots. Test by creating an appointment and verifying it shows in the list and blocks the slot in the patient booking form.

---

## Phase 6: User Story 4 — Clinic Owner Controls Availability (Priority: P4)

**Goal**: Admin can block entire date ranges (vacation) and individual time slots. Changes immediately reflected in patient booking form.

**Independent Test**: Log into admin panel → go to Availability section → block a date range → verify those dates are disabled in patient booking calendar. Block an individual slot → verify that slot shows as unavailable in time picker.

**Depends on**: Phase 4 (Admin panel exists), Phase 3/US1 (DatePicker/TimeSlotPicker already fetch from Supabase)

### Implementation for User Story 4

- [x] T026 [US4] Create src/components/admin/AvailabilityManager.tsx — two sections: (1) Blocked Periods: list existing via supabase.from('blocked_periods').select('*').order('start_date'), add form with start_date, end_date, reason, insert via supabase.from('blocked_periods').insert(), delete button per row; (2) Blocked Slots: list existing via supabase.from('blocked_slots').select('*').order('date').order('start_time'), add form with date, start_time (dropdown of clinic hours), reason, insert via supabase.from('blocked_slots').insert(), delete button per row
- [x] T027 [US4] Add Availability route and navigation in src/App.tsx and src/components/admin/AdminLayout.tsx — add route /clinic-portal/availability → AvailabilityManager, add "Availability" link in admin navigation
- [x] T028 [US4] Verify end-to-end: block a date in admin → refresh patient booking form → date is disabled in DatePicker calendar. Block a slot → that slot shows as unavailable in TimeSlotPicker.

**Checkpoint**: User Story 4 complete. All availability management working. Patient booking form reflects admin changes in real time.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: WhatsApp notifications, styling, final validation.

- [ ] T029 [P] Create supabase/functions/whatsapp-notify/index.ts — Deno Edge Function that receives webhook payload on appointments INSERT, formats WhatsApp message with booking reference, patient name, condition, date, time, sends via Meta Cloud API or Twilio, uses Deno.env.get() for WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_ID (stored as Supabase secrets)
- [x] T030 [P] Add admin panel styles to src/index.css — admin layout, login form, appointment table, status badges (confirmed=green, cancelled=red, completed=blue, rescheduled=amber), availability manager forms, responsive design for admin panel
- [ ] T031 Configure WhatsApp database webhook in Supabase dashboard — create webhook trigger on INSERT to appointments table, point to whatsapp-notify Edge Function, deploy function with --no-verify-jwt flag
- [ ] T032 Run quickstart.md validation — complete end-to-end test: book as patient → verify in Supabase → log into admin → view/filter/reschedule/cancel → create manual booking → block dates → verify blocked in patient form

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — can start immediately after foundational
- **US2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1
- **US3 (Phase 5)**: Depends on US2 (admin panel must exist)
- **US4 (Phase 6)**: Depends on US2 (admin panel must exist), US1 (booking form fetches from Supabase)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent after foundational — no admin panel needed
- **US2 (P2)**: Independent after foundational — creates the admin panel
- **US3 (P3)**: Requires US2 admin panel — adds feature to it
- **US4 (P4)**: Requires US2 admin panel — adds feature to it. Also benefits from US1 (booking form already fetches blocked dates)

### Within Each User Story

- Components modifying different files marked [P] can run in parallel
- Within US2: LoginForm + ProtectedRoute [P], then AdminLayout, then AppointmentList, then AppointmentActions, then App.tsx wiring
- Sequential within US1: TimeSlotPicker [P] DatePicker, then BookingForm (depends on both being updated)

### Parallel Opportunities

- T003, T004, T005 can all run in parallel (different files)
- T007, T008, T009 can all run in parallel (different config files)
- T015, T016 can run in parallel (different booking components)
- T018, T019 can run in parallel (different admin components)
- US1 and US2 can run in parallel after Phase 2 (different file groups)
- T029, T030 can run in parallel (Edge Function vs CSS)

---

## Parallel Example: User Story 1

```text
# After Phase 2 is complete, launch these in parallel:
Task T015: "Update TimeSlotPicker.tsx — replace fetch with supabase.rpc('get_unavailable_slots')"
Task T016: "Update DatePicker.tsx — fetch blocked dates via supabase.rpc('get_blocked_dates')"

# Then sequentially:
Task T017: "Update BookingForm.tsx — replace fetch with supabase.rpc('book_appointment')"
```

## Parallel Example: User Story 2

```text
# Launch login and auth guard in parallel:
Task T018: "Create LoginForm.tsx"
Task T019: "Create ProtectedRoute.tsx"

# Then sequentially:
Task T020: "Create AdminLayout.tsx"
Task T021: "Create AppointmentList.tsx"
Task T022: "Create AppointmentActions.tsx"
Task T023: "Wire admin routes in App.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T014)
3. Complete Phase 3: User Story 1 (T015-T017)
4. **STOP and VALIDATE**: Book an appointment → see it in Supabase
5. Deploy if ready — booking works without admin panel

### Incremental Delivery

1. Setup + Foundational → Framework ready
2. Add US1 → Booking works with Supabase → **Deploy (MVP!)**
3. Add US2 → Admin can view/manage appointments → Deploy
4. Add US3 → Admin can create appointments → Deploy
5. Add US4 → Admin controls availability → Deploy
6. Add WhatsApp → Notifications active → Deploy

### Single Developer (Recommended)

Execute phases sequentially: 1 → 2 → 3 → 4 → 5 → 6 → 7

---

## Notes

- [P] tasks = different files, no dependencies — can be sent as parallel agent tasks
- [Story] label maps task to specific user story for traceability
- No test tasks generated (manual testing specified in plan.md)
- Commit after each phase completion
- Stop at any checkpoint to validate the story independently
- The .env file contains real Supabase keys — NEVER commit it
