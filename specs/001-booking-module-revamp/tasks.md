# Tasks: Booking Module Revamp

**Input**: Design documents from `/specs/001-booking-module-revamp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, configure build tooling, and establish project structure for co-located frontend + backend

- [x] T001 Install new production dependencies (express, zod, cors) and dev dependencies (concurrently, tsx, @types/express, @types/cors) in package.json
- [x] T002 Update npm scripts in package.json: add "dev" (concurrently vite + tsx watch), "dev:client", "dev:server", "start" commands per quickstart.md
- [x] T003 Add Vite proxy configuration for `/api` → `http://localhost:3001` in vite.config.ts
- [x] T004 Create directory structure: `src/components/booking/`, `src/lib/`, `server/`, `server/routes/`, `server/lib/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, constants, server infrastructure, and core business logic that ALL user stories depend on

**WARNING**: No user story work can begin until this phase is complete

- [x] T005 [P] Define shared TypeScript interfaces (Booking, Condition, TimeSlot, AvailabilityResponse, BookingRequest, ApiError) in src/lib/types.ts per data-model.md
- [x] T006 [P] Create constants file with 11 conditions (slugs + titles + descriptions), clinic hours (weekdays 16:30–21:00, Saturday 08:00–21:00), slot duration (30 min), and booking window (4 weeks) in src/lib/constants.ts per data-model.md
- [x] T007 [P] Create server-side type definitions in server/types.ts mirroring src/lib/types.ts for server use
- [x] T008 Create Express server entry point with CORS middleware, JSON body parser, and route mounting on port 3001 in server/index.ts
- [x] T009 [P] Implement in-memory booking store (Map-based) with createBooking, getBookingById, getAllBookings, getBookingsByDate, isSlotAvailable, cancelBooking functions in server/lib/store.ts per data-model.md
- [x] T010 [P] Implement time slot generation logic: generateSlotsForDate (creates 30-min slots based on day of week), getAvailableSlots (filters against booked slots), getDayClinicHours in server/lib/slots.ts
- [x] T011 [P] Create server-side Zod validation schemas for booking request (name max 100, UK phone regex, email, condition slug enum, date format + range, startTime format + range) in server/lib/validation.ts per contracts/api.md

**Checkpoint**: Server infrastructure ready — API routes and frontend components can now be built

---

## Phase 3: User Story 1 - Select Condition (Priority: P1) MVP

**Goal**: Patient can view and select from 11 physiotherapy conditions in a booking form with a visual step indicator

**Independent Test**: Navigate to the booking section, view the condition dropdown, select a condition, verify the form shows Step 1 as active and advances to Step 2 on selection

### Implementation for User Story 1

- [x] T012 [P] [US1] Create StepIndicator component showing 3 steps (Condition, Date & Time, Your Details) with active/completed/upcoming states, matching site design (dark navy, blue accents, Outfit font) in src/components/booking/StepIndicator.tsx
- [x] T013 [P] [US1] Create ConditionSelect component with dropdown listing all 11 conditions from constants.ts, validation error display, and "Next" button; styled with inline styles matching site design (glassmorphism card, Cormorant heading, Outfit labels) in src/components/booking/ConditionSelect.tsx
- [x] T014 [US1] Create BookingForm orchestrator component managing multi-step state (currentStep, selectedCondition, selectedDate, selectedTime, patientDetails, booking result); render StepIndicator + ConditionSelect for Step 1; use Framer Motion AnimatePresence for step transitions in src/components/booking/BookingForm.tsx
- [x] T015 [US1] Create client-side Zod validation schema for condition selection (required, must be valid slug from constants) in src/lib/validation.ts

**Checkpoint**: Condition selection step is functional — user can see conditions and select one with validation

---

## Phase 4: User Story 2 - Choose Date and Time Slot (Priority: P1)

**Goal**: Patient can pick a date from a 4-week calendar (excluding Sundays/past dates) and select an available 30-minute time slot with real-time availability

**Independent Test**: Select a condition, view the calendar, pick a valid date, verify time slots appear with correct count (9 weekday / 26 Saturday), verify booked slots show as unavailable

### Implementation for User Story 2

- [x] T016 [US2] Implement GET /api/availability route: validate date query param, check within 4-week window and not Sunday/past, call getAvailableSlots, return slots with clinic hours and day of week per contracts/api.md in server/routes/availability.ts
- [x] T017 [US2] Register availability route in Express server in server/index.ts
- [x] T018 [P] [US2] Create DatePicker component showing a calendar grid for the next 4 weeks; disable Sundays and past dates; highlight selected date; styled with inline styles (dark card background, blue accent for selected, Outfit font) with Framer Motion entrance animation in src/components/booking/DatePicker.tsx
- [x] T019 [P] [US2] Create TimeSlotPicker component that fetches GET /api/availability?date= on date selection, displays 30-min slots in a grid, marks unavailable slots as disabled, clears selection on date change; styled with inline styles (slot buttons with available/unavailable/selected states) in src/components/booking/TimeSlotPicker.tsx
- [x] T020 [US2] Integrate DatePicker and TimeSlotPicker into BookingForm Step 2: render both when currentStep is 2, pass selectedDate/selectedTime state, add "Back" and "Next" buttons with validation (both date and time required) in src/components/booking/BookingForm.tsx

**Checkpoint**: Date and time selection is functional — user can browse calendar, pick date, see available slots, and select one

---

## Phase 5: User Story 3 - Patient Details and Submit (Priority: P1)

**Goal**: Patient enters name, phone (UK format), email, and consents to privacy policy; form validates and submits to API; system prevents double-booking

**Independent Test**: Complete Steps 1-2, enter valid patient details, submit, verify booking is created with unique reference; try invalid phone/email and verify inline errors; try booking same slot twice and verify 409 conflict

### Implementation for User Story 3

- [x] T021 [US3] Implement POST /api/book route: validate request body with Zod schema, check slot availability via store.isSlotAvailable, create booking via store.createBooking, trigger WhatsApp notification (fire-and-forget), return 201 with booking + derived fields (endTime, conditionTitle) or 400/409 errors per contracts/api.md in server/routes/book.ts
- [x] T022 [US3] Register book route in Express server in server/index.ts
- [x] T023 [P] [US3] Implement WhatsApp notification function: format booking details into message, support Meta Graph API and Twilio providers via env vars, fallback to console.log if unconfigured; async fire-and-forget with error catching in server/lib/whatsapp.ts
- [x] T024 [P] [US3] Create PatientDetails component with Full Name input (max 100 chars), Phone Number input (placeholder: "+44 7700 900123"), Email input, mandatory consent checkbox with privacy policy link; inline validation errors per field; styled with inline styles (glassmorphism card, matching form input styles from existing contact section) in src/components/booking/PatientDetails.tsx
- [x] T025 [US3] Add client-side Zod schemas for patient details (name required + max 100, UK phone regex, valid email, consent boolean required true) in src/lib/validation.ts
- [x] T026 [US3] Integrate PatientDetails into BookingForm Step 3: render when currentStep is 3, add "Back" and "Book Appointment" buttons, on submit POST to /api/book with all collected data, handle 201 (advance to confirmation), 400 (show validation errors), 409 (show conflict message + prompt to reselect time), loading state during submission, network error handling with retry in src/components/booking/BookingForm.tsx

**Checkpoint**: Full booking flow works end-to-end — condition → date/time → details → submit → booking created on server

---

## Phase 6: User Story 4 - Booking Confirmation (Priority: P2)

**Goal**: After successful booking, patient sees a confirmation screen with booking reference, all details, and option to book another appointment

**Independent Test**: Complete a full booking, verify confirmation screen shows reference (8-char uppercase), patient name, condition title, date (human-readable), time range (12-hour format), email, phone; click "Book Another" and verify form resets

### Implementation for User Story 4

- [x] T027 [US4] Create Confirmation component displaying: animated checkmark icon, "Booking Confirmed!" heading (Cormorant), booking details card (reference, name, condition, date, time range, email, phone) styled with glassmorphism, and "Book Another Appointment" button; use Framer Motion for entrance animation in src/components/booking/Confirmation.tsx
- [x] T028 [US4] Integrate Confirmation into BookingForm: render when booking is successfully created (post-submission state), pass booking response data, wire "Book Another" button to reset all state (currentStep → 1, clear all selections) in src/components/booking/BookingForm.tsx

**Checkpoint**: Confirmation screen displays after booking — full patient-facing flow is complete

---

## Phase 7: User Story 5 - CTA Navigation and Contact Section Integration (Priority: P2)

**Goal**: All existing CTA buttons navigate to the booking form; booking form replaces the contact form in the Contact section while keeping contact info visible

**Independent Test**: Click "Book Now" in navbar, "Call Us Now" in hero, "Book a Consultation" in about section — all smooth-scroll to booking; contact info (phone, address, hours) remains visible alongside the form

### Implementation for User Story 5

- [x] T029 [US5] Update all CTA buttons in src/App.tsx: change NavBar "Book Now" button from `tel:` link to `href="#contact"` smooth scroll; change hero "Call Us Now" from `tel:` to `href="#contact"`; change about "Book a Consultation" from `tel:` to `href="#contact"`; update mobile menu "Book Now" similarly
- [x] T030 [US5] Replace the existing contact form (name, email, phone, condition dropdown, description textarea, submit button) in the ContactSection of src/App.tsx with the BookingForm component; keep the contact info column (phone number, email, address, clinic hours) visible alongside the booking form
- [x] T031 [US5] Import BookingForm component and all required booking dependencies in src/App.tsx; ensure the `#contact` anchor ID is on the section containing the booking form

**Checkpoint**: All CTAs navigate to booking form — website is fully integrated with the new booking module

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Responsive refinements, animation polish, and visual consistency across all booking components

- [x] T032 Responsive design pass across all booking components: verify mobile (<768px), tablet (768–1024px), and desktop (>1024px) layouts; adjust calendar grid, time slot grid, form layouts, and step indicator for each breakpoint using the existing useBreakpoint() hook pattern in src/components/booking/*.tsx
- [x] T033 Animation polish: add Framer Motion whileInView entrance animations to the booking section matching the existing sections' animation pattern (opacity 0→1, y offset); add smooth step transitions; add loading spinner during availability fetch and booking submission in src/components/booking/*.tsx
- [x] T034 Run quickstart.md validation: test full booking flow end-to-end per quickstart.md steps 1–9; verify booking appears in server console log; verify WhatsApp console fallback fires

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–7)**: All depend on Foundational phase completion
  - US1 (Phase 3): No story dependencies — can start after Phase 2
  - US2 (Phase 4): Depends on US1 (builds on BookingForm orchestrator from T014)
  - US3 (Phase 5): Depends on US2 (builds on BookingForm with Steps 1+2)
  - US4 (Phase 6): Depends on US3 (needs successful booking to show confirmation)
  - US5 (Phase 7): Depends on US1 at minimum (needs BookingForm component to import into App.tsx); can run after Phase 3 but best after Phase 6
- **Polish (Phase 8)**: Depends on all user stories being complete

### Within Each User Story

- Server routes before frontend components that call them (US2: availability route → DatePicker/TimeSlotPicker; US3: book route → PatientDetails submit)
- Components before orchestrator integration (individual step components before BookingForm updates)
- Validation schemas can be built in parallel with components

### Parallel Opportunities

- Phase 2: T005, T006, T007 (types/constants) can all run in parallel; T009, T010, T011 (store/slots/validation) can all run in parallel after types
- Phase 3: T012, T013 (StepIndicator, ConditionSelect) can run in parallel
- Phase 4: T018, T019 (DatePicker, TimeSlotPicker) can run in parallel after availability route
- Phase 5: T023, T024 (WhatsApp, PatientDetails) can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all type/constant definitions together:
Task: "Define shared TypeScript interfaces in src/lib/types.ts"
Task: "Create constants file in src/lib/constants.ts"
Task: "Create server-side types in server/types.ts"

# Then launch all server logic together:
Task: "Implement in-memory store in server/lib/store.ts"
Task: "Implement slot generation in server/lib/slots.ts"
Task: "Create Zod validation schemas in server/lib/validation.ts"
```

## Parallel Example: Phase 4 (User Story 2)

```bash
# After availability route is ready, launch both pickers:
Task: "Create DatePicker component in src/components/booking/DatePicker.tsx"
Task: "Create TimeSlotPicker component in src/components/booking/TimeSlotPicker.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1–3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (condition selection)
4. Complete Phase 4: User Story 2 (date & time)
5. Complete Phase 5: User Story 3 (patient details & submit)
6. **STOP and VALIDATE**: Test full booking flow end-to-end
7. Deploy/demo if ready — core booking works without confirmation screen or CTA rewiring

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 → Condition selection works → Partial demo
3. Add US2 → Date/time selection works → Partial demo
4. Add US3 → Full booking works end-to-end → **MVP!**
5. Add US4 → Confirmation screen → Better UX
6. Add US5 → CTA integration → Fully integrated website
7. Polish → Responsive + animations → Production ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1–US3 are sequential dependencies (each step builds on BookingForm orchestrator)
- US4 and US5 can be done in either order after US3
- No test tasks included — tests were not requested in the spec
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
