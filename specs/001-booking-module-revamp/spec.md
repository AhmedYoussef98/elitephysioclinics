# Feature Specification: Booking Module Revamp

**Feature Branch**: `001-booking-module-revamp`
**Created**: 2026-03-20
**Status**: Draft
**Input**: User description: "I want to change the booking module in this project here to what that project has https://github.com/AhmedYoussef98/Elite-Clinic.git I want the exact structure and way of booking however it must match the original design here in this codebase"

## Clarifications

### Session 2026-03-20

- Q: Where should the booking form be placed in the single-page layout? → A: Replace the existing Contact form with the booking form; keep the contact info (phone, address, hours) visible alongside it.
- Q: Should the booking form include a data consent mechanism for UK GDPR compliance? → A: Yes, add a mandatory consent checkbox with link to privacy policy before submission.
- Q: Should patients receive a confirmation email after booking? → A: Not now — deferred to a future phase. Patients rely on the on-screen confirmation for this iteration.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select Condition and Book Appointment (Priority: P1)

A patient visits the clinic website and wants to book a physiotherapy appointment. They click "Book Now" from the navigation or any CTA button and are presented with a multi-step booking form. In Step 1, they select their condition from a list of available physiotherapy conditions (e.g., Back Pain & Sciatica, Frozen Shoulder, Sports Injuries). Once selected, they proceed to Step 2.

**Why this priority**: This is the core booking entry point. Without condition selection, no booking can proceed. It delivers the primary value of converting website visitors into booked patients.

**Independent Test**: Can be fully tested by navigating to the booking section, viewing the condition dropdown, selecting a condition, and verifying the form advances to Step 2.

**Acceptance Scenarios**:

1. **Given** a user is on the booking section, **When** they view the condition selector, **Then** they see all 11 physiotherapy conditions listed with clear display names
2. **Given** a user has not selected a condition, **When** they try to proceed to Step 2, **Then** they see a validation error requiring condition selection
3. **Given** a user selects a condition, **When** they confirm their selection, **Then** the form advances to the Date & Time step with a visual step indicator showing progress

---

### User Story 2 - Choose Date and Time Slot (Priority: P1)

After selecting a condition, the patient picks a date from a calendar showing the next 4 weeks of availability. Sundays are excluded (clinic closed). Past dates are disabled. After selecting a date, available 30-minute time slots are displayed. Weekday slots run from 4:30 PM to 9:00 PM; Saturday slots run from 8:00 AM to 9:00 PM. Slots already booked by other patients are shown as unavailable.

**Why this priority**: Date and time selection is essential to complete a booking. Without it, the appointment cannot be scheduled.

**Independent Test**: Can be tested by selecting a condition, viewing the calendar, selecting a valid date, and verifying time slots appear with correct availability.

**Acceptance Scenarios**:

1. **Given** a user is on the Date & Time step, **When** they view the calendar, **Then** they see dates for the next 4 weeks with Sundays and past dates disabled
2. **Given** a user selects a weekday date, **When** time slots load, **Then** they see 30-minute slots from 4:30 PM to 9:00 PM (9 slots)
3. **Given** a user selects a Saturday date, **When** time slots load, **Then** they see 30-minute slots from 8:00 AM to 9:00 PM (26 slots)
4. **Given** a time slot is already booked by another patient, **When** a user views available slots for that date, **Then** the booked slot is visually marked as unavailable and cannot be selected
5. **Given** a user selects a date and then changes to a different date, **When** the new date loads, **Then** any previously selected time slot is cleared and new availability is shown

---

### User Story 3 - Enter Patient Details and Submit (Priority: P1)

After selecting a date and time, the patient enters their personal details: full name, phone number (UK format), and email address. All fields are validated before submission. Upon successful submission, the system confirms the booking and prevents double-booking of the same time slot.

**Why this priority**: Collecting patient information and confirming the booking completes the core booking flow. Without this, no appointment is actually created.

**Independent Test**: Can be tested by completing Steps 1 and 2, entering valid patient details, submitting, and verifying a booking confirmation is returned.

**Acceptance Scenarios**:

1. **Given** a user is on the Your Details step, **When** they view the form, **Then** they see fields for Full Name, Phone Number, Email Address, and a mandatory consent checkbox linking to the privacy policy
2. **Given** a user enters an invalid phone number (not UK format), **When** they submit, **Then** they see a validation error on the phone field
3. **Given** a user enters an invalid email address, **When** they submit, **Then** they see a validation error on the email field
4. **Given** a user submits valid details for an available slot, **When** the booking is processed, **Then** the system creates the booking with a unique reference and returns a confirmation
5. **Given** two users attempt to book the same time slot simultaneously, **When** the second submission is processed, **Then** it is rejected with a conflict error and the user is asked to select a different slot

---

### User Story 4 - View Booking Confirmation (Priority: P2)

After a successful booking, the patient sees a confirmation screen showing their booking reference (first 8 characters of a unique ID), patient name, condition, date (human-readable format), time window (start and end in 12-hour format), email, and phone number. They also have the option to book another appointment.

**Why this priority**: Confirmation provides trust and a reference for the patient. It is essential for a good experience but the booking itself functions without it.

**Independent Test**: Can be tested by completing a full booking and verifying the confirmation screen displays all booking details correctly.

**Acceptance Scenarios**:

1. **Given** a booking is successfully created, **When** the confirmation screen loads, **Then** it displays the booking reference, patient name, condition title, date, time range, email, and phone
2. **Given** a user is on the confirmation screen, **When** they click "Book Another Appointment", **Then** the form resets to Step 1 with all fields cleared

---

### User Story 5 - Navigate Booking from Existing CTAs (Priority: P2)

All existing "Book Now", "Call Us Now", and "Book a Consultation" buttons across the website are updated to navigate users to the booking section instead of triggering a phone call. The booking form replaces the existing Contact form within the Contact section, while the contact information (phone number, address, clinic hours) remains visible alongside it. The booking form integrates seamlessly into the existing single-page application layout and matches the current design language.

**Why this priority**: Ensures users can discover and access the booking flow from all existing touchpoints. Important for conversion but the booking module can function independently.

**Independent Test**: Can be tested by clicking each CTA button on the page and verifying it scrolls to the booking form.

**Acceptance Scenarios**:

1. **Given** a user clicks "Book Now" in the navigation bar, **When** the page responds, **Then** it smooth-scrolls to the booking section
2. **Given** a user clicks "Call Us Now" in the hero section, **When** the page responds, **Then** it smooth-scrolls to the booking section
3. **Given** a user clicks "Book a Consultation" in the about section, **When** the page responds, **Then** it smooth-scrolls to the booking section

---

### Edge Cases

- What happens when a user tries to book on a date that becomes fully booked while they are filling in their details? The system rejects the submission with a conflict error and prompts the user to select a different time slot.
- What happens when a user's browser timezone differs from the clinic's timezone (UK)? All dates and times are displayed in the clinic's local timezone (UK/London) regardless of the user's browser timezone.
- What happens when the 4-week booking window rolls forward overnight? The calendar dynamically calculates available dates from the current date, so new dates appear and old dates become unavailable automatically.
- How does the system handle network errors during submission? The user sees a clear error message and can retry without losing their entered data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a multi-step booking form with 3 steps: (1) Condition Selection, (2) Date & Time, (3) Patient Details
- **FR-002**: System MUST show a visual step indicator displaying the current step and completion status of previous steps
- **FR-003**: System MUST present 11 physiotherapy conditions for selection: Back Pain & Sciatica, Neck Pain & Whiplash, Arthritis, Sports Injuries, Work-Related Injury, Muscles/Tendons/Ligaments Injuries, Ankle & Knee Injuries, Frozen Shoulder, Tennis Elbow, Post-Surgery Rehabilitation, Disc Prolapses
- **FR-004**: System MUST display a calendar showing available dates within a 4-week window from today
- **FR-005**: System MUST exclude Sundays and past dates from the calendar
- **FR-006**: System MUST show 30-minute time slots based on clinic hours: weekdays 4:30 PM–9:00 PM, Saturdays 8:00 AM–9:00 PM
- **FR-007**: System MUST check slot availability in real-time and prevent selection of already-booked slots
- **FR-008**: System MUST collect patient name (max 100 characters), phone number (UK format validation), and email address
- **FR-008a**: System MUST display a mandatory consent checkbox with a link to the clinic's privacy policy; the form cannot be submitted without consent
- **FR-009**: System MUST validate all form fields (including consent checkbox) before allowing submission, with inline error messages
- **FR-010**: System MUST prevent double-booking by enforcing a unique constraint on (date, startTime) combinations
- **FR-011**: System MUST generate a unique booking reference for each confirmed appointment
- **FR-012**: System MUST display a confirmation screen with full booking details after successful submission
- **FR-013**: System MUST allow users to initiate a new booking from the confirmation screen
- **FR-014**: System MUST replace all existing phone-call CTAs ("Book Now", "Call Us Now", "Book a Consultation") with navigation to the booking form, which replaces the existing Contact form within the Contact section
- **FR-015**: System MUST match the existing website design language: dark navy backgrounds, blue accents, serif headings, sans-serif body text, glassmorphism effects, and smooth animations
- **FR-016**: System MUST be fully responsive across mobile, tablet, and desktop screen sizes
- **FR-017**: System MUST send a WhatsApp notification to the clinic when a new booking is created
- **FR-018**: System MUST provide an availability endpoint that returns available slots for a given date

### Key Entities

- **Booking**: Represents a confirmed patient appointment. Key attributes: unique ID, patient name, patient phone, patient email, condition, date, start time, status (confirmed/cancelled), creation timestamp
- **Condition**: A physiotherapy condition/service the clinic treats. Key attributes: unique slug identifier, display title, description
- **Time Slot**: A 30-minute window during clinic operating hours. Attributes: start time, end time, availability status. Computed dynamically based on clinic hours and existing bookings

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the full booking process (condition selection through confirmation) in under 2 minutes
- **SC-002**: 95% of booking form submissions complete without validation errors on first attempt (clear field labels and input hints guide users)
- **SC-003**: No double-bookings occur — each time slot is exclusively reserved for one patient
- **SC-004**: The booking form renders correctly and is fully functional on mobile, tablet, and desktop screen sizes
- **SC-005**: All existing CTA buttons on the website successfully navigate users to the booking form
- **SC-006**: The booking interface is visually consistent with the rest of the website in terms of colors, fonts, spacing, and animation style
- **SC-007**: Clinic receives a notification for every new booking within 30 seconds of submission

## Assumptions

- The clinic operates in UK timezone (Europe/London) and all times are displayed accordingly
- Slot duration is fixed at 30 minutes with no variable-length appointments
- There is no doctor/therapist selection — the clinic manages internal staff assignment separately
- The booking form replaces the existing Contact form within the Contact section; the contact information (phone, address, hours) remains visible alongside the booking form
- WhatsApp notification uses an external messaging service configured with clinic credentials
- Initial implementation uses in-memory storage for bookings; persistent database storage is a future enhancement
- No patient authentication or account creation is required — booking is open to all visitors
- Booking cancellation is handled separately and is not part of this initial booking flow specification
- Patient confirmation email is deferred to a future phase; patients use the on-screen confirmation as their booking reference for now
