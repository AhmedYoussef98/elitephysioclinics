# Feature Specification: Supabase Booking System — Production

**Feature Branch**: `002-supabase-booking-mvp`
**Created**: 2026-03-20
**Updated**: 2026-03-21
**Status**: Draft
**Input**: User description: "Skip Phase 1 (WhatsApp MVP). Build the real booking system using Supabase with persistent storage, real-time availability, admin control panel, and appointment management."

## Clarifications

### Session 2026-03-21

- Q: Should the system use the existing Express backend or communicate with Supabase directly from the client? → A: Fully client-side — React talks to Supabase JS directly. Express backend will be removed.
- Q: How should WhatsApp notifications work without the Express backend? → A: Supabase Edge Function triggered on new appointment insert sends WhatsApp notification via Twilio/Meta API.
- Q: What URL path should the admin panel use? → A: `/clinic-portal` — a non-obvious, professional path. No link to it from the main website.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Patient Books an Appointment with Persistent Storage (Priority: P1)

A patient visits the clinic website, completes the multi-step booking form (condition, date/time, personal details), and the appointment is saved to the Supabase database via direct client-side calls. The patient sees a confirmation screen with a booking reference number. A serverless function sends a WhatsApp notification to the clinic owner. The appointment appears in the admin control panel.

**Why this priority**: This is the core feature — without persistent booking, nothing else works. Replaces the current in-memory storage with real database persistence.

**Independent Test**: Can be fully tested by completing a booking, verifying the confirmation screen shows a reference number, and checking that the appointment appears in the Supabase database.

**Acceptance Scenarios**:

1. **Given** a patient completes the booking form, **When** they submit, **Then** the appointment is saved to the database with status "confirmed" and the patient sees a confirmation screen with a booking reference.
2. **Given** a patient selects a date and time, **When** the availability is checked, **Then** already-booked slots are shown as unavailable (real-time from the database).
3. **Given** an appointment is successfully created, **When** the booking completes, **Then** a WhatsApp notification is sent to the clinic owner via a serverless function with the booking details.
4. **Given** two patients attempt to book the same slot simultaneously, **When** both submit, **Then** only one succeeds and the other receives a "slot no longer available" message.

---

### User Story 2 - Clinic Owner Views and Manages Appointments (Priority: P2)

The clinic owner navigates to `/clinic-portal`, logs in with email and password, and accesses a secure admin control panel where they can see all appointments in a calendar/list view, filter by date or status, and take actions on individual appointments (view details, reschedule, cancel).

**Why this priority**: The clinic needs visibility into all bookings and the ability to manage them. Without this, the owner must check the database directly.

**Independent Test**: Can be fully tested by logging into the admin panel at `/clinic-portal`, viewing listed appointments, and performing a reschedule and a cancellation.

**Acceptance Scenarios**:

1. **Given** the clinic owner is logged in, **When** they open the admin panel, **Then** they see all appointments sorted by date with key details (patient name, condition, date, time, status).
2. **Given** the clinic owner views an appointment, **When** they click "Reschedule", **Then** they can select a new date and time, and the appointment is updated.
3. **Given** the clinic owner views an appointment, **When** they click "Cancel", **Then** they are asked to confirm, and the appointment status changes to "cancelled".
4. **Given** the clinic owner wants to find specific appointments, **When** they filter by date range or status (confirmed, cancelled, completed), **Then** only matching appointments are displayed.

---

### User Story 3 - Clinic Owner Manually Creates Appointments (Priority: P3)

The clinic owner can create appointments on behalf of patients directly from the admin panel — for walk-in patients, phone bookings, or referrals. These appointments follow the same validation rules as patient-created bookings.

**Why this priority**: Not all patients book online. The clinic needs a single source of truth for all appointments regardless of how they were made.

**Independent Test**: Can be fully tested by creating an appointment from the admin panel and verifying it appears in the calendar and blocks the time slot.

**Acceptance Scenarios**:

1. **Given** the clinic owner is on the admin panel, **When** they click "Add Appointment", **Then** they can enter patient details, select a condition, date, and available time slot.
2. **Given** the clinic owner creates an appointment, **When** it is saved, **Then** the time slot is marked as booked and unavailable for online bookings.

---

### User Story 4 - Clinic Owner Controls Availability (Priority: P4)

The clinic owner can close specific time slots, block entire days (vacation/holiday), or modify clinic operating hours from the admin panel. These changes are immediately reflected in the patient-facing booking form.

**Why this priority**: The clinic needs to control when patients can book — for holidays, staff absence, or special schedules.

**Independent Test**: Can be fully tested by blocking a day in the admin panel and verifying that the date appears as unavailable in the patient booking form.

**Acceptance Scenarios**:

1. **Given** the clinic owner wants to take a vacation, **When** they select a date range and mark it as "closed", **Then** those dates are immediately unavailable in the patient booking form.
2. **Given** the clinic owner wants to block a specific time slot, **When** they select the slot and mark it as "blocked", **Then** that slot is shown as unavailable to patients.
3. **Given** the clinic owner has blocked dates, **When** they view the admin calendar, **Then** blocked dates are visually distinct from regular days.
4. **Given** a patient tries to book on a blocked date, **When** they view the calendar, **Then** the date is disabled and cannot be selected.

---

### Edge Cases

- What happens when the Supabase database is unreachable? The booking form should display a friendly error message suggesting the patient contact the clinic directly via phone or WhatsApp.
- What happens when the clinic owner reschedules an appointment to a slot that was just booked? The system should check slot availability before confirming the reschedule and alert the owner if the slot is taken.
- What happens when the clinic owner blocks a date that already has appointments? The system should warn the owner and list existing appointments, requiring confirmation before proceeding.
- What happens when the admin session expires? The system should redirect to the `/clinic-portal` login page with a message that the session has expired.
- What happens when a patient's browser loses connection mid-booking? The form should preserve entered data and allow retry when connectivity returns.
- What happens when the Supabase Edge Function for WhatsApp fails? The booking should still succeed (notification is fire-and-forget); the clinic owner can check new bookings in the admin panel.

## Requirements *(mandatory)*

### Functional Requirements

**Patient Booking (P1)**

- **FR-001**: System MUST persist all appointments in a database with fields for patient details, condition, date, time, status, and timestamps.
- **FR-002**: System MUST check real-time slot availability from the database when patients select a date.
- **FR-003**: System MUST prevent double-booking through database-level constraints.
- **FR-004**: System MUST generate a unique booking reference for each appointment.
- **FR-005**: System MUST send WhatsApp notifications to the clinic owner when a new appointment is booked, via a serverless function triggered on insert.
- **FR-006**: System MUST retain the existing multi-step booking form UI, validation, and user experience.
- **FR-007**: System MUST protect patient personal data — anonymous users cannot read other patients' details.
- **FR-008**: System MUST operate fully client-side — the React frontend communicates directly with Supabase, with no intermediary backend server.

**Admin Panel (P2-P3)**

- **FR-009**: System MUST provide a secure admin control panel at the `/clinic-portal` route, accessible only to authenticated clinic owners.
- **FR-010**: The `/clinic-portal` route MUST NOT be linked from any public-facing page — it is accessed by direct URL only.
- **FR-011**: Admin panel MUST allow viewing all appointments with filtering by date range and status.
- **FR-012**: Admin panel MUST allow rescheduling an appointment to a new date and time.
- **FR-013**: Admin panel MUST allow cancelling an appointment with a confirmation prompt.
- **FR-014**: Admin panel MUST allow manually creating new appointments on behalf of patients.
- **FR-015**: Admin panel MUST provide authentication with email/password login via Supabase Auth.
- **FR-016**: System MUST support appointment statuses: confirmed, cancelled, completed, rescheduled.

**Availability Control (P4)**

- **FR-017**: Admin panel MUST allow blocking specific dates or date ranges (vacation, holidays).
- **FR-018**: Admin panel MUST allow blocking individual time slots.
- **FR-019**: Blocked dates and slots MUST be immediately reflected in the patient-facing booking form.

### Key Entities

- **Appointment**: Represents a booked time slot. Key attributes: booking reference, patient name, patient phone, patient email, condition, date, start time, end time (30 minutes after start), status (confirmed/cancelled/completed/rescheduled), creation timestamp, last modified timestamp.
- **Blocked Period**: Represents a date range when the clinic is unavailable. Key attributes: start date, end date, reason (vacation, holiday, other).
- **Blocked Slot**: Represents a specific time slot on a specific date that is manually blocked. Key attributes: date, start time, end time, reason.
- **Admin User**: The clinic owner who manages appointments. Key attributes: email, role, last login. Authenticated via Supabase Auth.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of submitted appointments are persisted and retrievable from the admin panel.
- **SC-002**: Double-bookings are prevented with zero conflicting appointments across all booking channels (online and manual).
- **SC-003**: Clinic owner can reschedule, cancel, or create an appointment in under 30 seconds from the admin panel.
- **SC-004**: Availability changes (blocked dates/slots) are reflected in the patient booking form within 5 seconds.
- **SC-005**: The admin panel loads appointment data and is interactive within 3 seconds on a standard connection.
- **SC-006**: System handles the clinic's expected volume (up to 50 appointments per day) without degradation.
- **SC-007**: Patient personal data is not accessible to unauthenticated users through any channel.

## Assumptions

- The clinic already has a WhatsApp Business number that can receive patient messages.
- The clinic owner is the sole administrator (single admin user is sufficient).
- UK phone number format (+44 or 0-prefix) remains the standard for patient phone validation.
- The existing 30-minute appointment slot duration is correct and does not need to be configurable initially.
- Clinic operating hours (Mon-Fri 4:30 PM-9:00 PM, Saturday 8:00 AM-9:00 PM, Sunday closed) are the correct defaults.
- Supabase free tier is sufficient for the clinic's initial usage volume.
- Email notifications to patients are not required for the initial release — WhatsApp to the clinic owner is sufficient.
- The existing frontend design and component structure will be preserved; changes are limited to replacing in-memory storage with Supabase client and adding the admin panel at `/clinic-portal`.
- The Express backend (`/server` directory) will be removed as part of this feature.

## Scope Boundaries

**In Scope**:
- Fully client-side architecture (React + Supabase JS, no backend server)
- Supabase database for appointment storage
- Admin control panel at `/clinic-portal` for appointment management
- Availability/vacancy management (blocking dates and slots)
- Admin authentication via Supabase Auth
- WhatsApp notifications via Supabase Edge Function

**Out of Scope**:
- Patient accounts or patient login
- Email/SMS notifications to patients
- Online payment processing
- Multi-practitioner scheduling (single clinic owner)
- Recurring/repeat appointment booking
- Patient appointment history portal
- Integration with external calendar systems (Google Calendar, Outlook)
- Multi-language support
- Analytics or reporting dashboard
