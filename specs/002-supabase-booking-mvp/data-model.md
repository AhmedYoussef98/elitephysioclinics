# Data Model: Supabase Booking System

**Feature**: 002-supabase-booking-mvp
**Date**: 2026-03-21
**Storage**: Supabase (PostgreSQL)

## Entities

### Appointment

Represents a booked time slot linking a patient to a specific date and time.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | `gen_random_uuid()` |
| booking_reference | TEXT | UNIQUE, NOT NULL | First 8 chars of UUID, uppercased |
| patient_name | TEXT | NOT NULL | Full name |
| patient_phone | TEXT | NOT NULL | UK format: +44 or 0-prefix |
| patient_email | TEXT | NOT NULL | Valid email |
| condition_slug | TEXT | NOT NULL, CHECK enum | Must match one of 12 predefined slugs |
| condition_title | TEXT | NOT NULL | Human-readable condition name |
| date | DATE | NOT NULL | Appointment date |
| start_time | TIME | NOT NULL | Slot start (e.g., 17:00) |
| end_time | TIME | NOT NULL | Always start_time + 30 minutes |
| status | TEXT | NOT NULL, DEFAULT 'confirmed' | One of: confirmed, cancelled, completed, rescheduled |
| notes | TEXT | nullable | Admin notes |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Immutable |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Auto-updated via trigger |

**Indexes**:
- `idx_unique_active_slot` — UNIQUE partial index on `(date, start_time) WHERE status NOT IN ('cancelled')` — prevents double-booking
- `idx_appointments_date` — on `(date)`
- `idx_appointments_status` — on `(status)`
- `idx_appointments_date_status` — composite on `(date, status)`

**Condition Slug Enum Values**:
`back-pain-sciatica`, `neck-pain-whiplash`, `arthritis`, `sports-injuries`, `work-related-injury`, `muscle-tendon-ligament`, `ankle-knee`, `frozen-shoulder`, `tennis-elbow`, `post-surgery-rehab`, `disc-prolapses`, `other`

**State Transitions**:
```
confirmed → cancelled    (admin cancels)
confirmed → completed    (admin marks done)
confirmed → rescheduled  (admin reschedules → new appointment created as confirmed)
```
No transitions from `cancelled`, `completed`, or `rescheduled` (terminal states).

---

### Blocked Period

Represents a date range when the clinic is fully closed (vacation, holidays).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | `gen_random_uuid()` |
| start_date | DATE | NOT NULL | First day blocked |
| end_date | DATE | NOT NULL | Last day blocked (inclusive) |
| reason | TEXT | nullable | e.g., "Annual leave", "Bank holiday" |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Constraints**:
- `valid_date_range` — CHECK `end_date >= start_date`

**Indexes**:
- `idx_blocked_periods_dates` — on `(start_date, end_date)`

---

### Blocked Slot

Represents a single time slot on a specific date that is manually blocked.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | `gen_random_uuid()` |
| date | DATE | NOT NULL | The date of the blocked slot |
| start_time | TIME | NOT NULL | Slot start |
| end_time | TIME | NOT NULL | Slot end (typically +30 min) |
| reason | TEXT | nullable | e.g., "Break", "Maintenance" |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Constraints**:
- `unique_blocked_slot` — UNIQUE on `(date, start_time)`

**Indexes**:
- `idx_blocked_slots_date` — on `(date)`

---

### Admin User

Managed entirely by Supabase Auth. No custom table required.

| Field | Source | Notes |
|-------|--------|-------|
| id | `auth.users.id` | Supabase-managed UUID |
| email | `auth.users.email` | Login credential |
| last_sign_in_at | `auth.users.last_sign_in_at` | Tracked by Supabase |

Created manually in Supabase dashboard. Email signup disabled for public users.

---

## Relationships

```
Appointment ──── (no FK) ──── Blocked Period
Appointment ──── (no FK) ──── Blocked Slot
```

Entities are independent. Conflict detection is handled at the application/function level:
- `book_appointment()` checks both `blocked_periods` and `blocked_slots` before inserting
- `get_unavailable_slots()` unions booked appointments with blocked slots

---

## Database Functions (RPC)

| Function | Access | Purpose |
|----------|--------|---------|
| `get_unavailable_slots(booking_date DATE)` | anon, authenticated | Returns all booked + blocked time slots for a date. No patient PII exposed. |
| `get_blocked_dates(from_date DATE, to_date DATE)` | anon, authenticated | Returns fully blocked dates in a range (from blocked_periods). |
| `book_appointment(name, phone, email, slug, title, date, time)` | anon, authenticated | Atomic booking: validates blocked dates/slots, prevents double-booking, returns JSON result. |
| `handle_updated_at()` | trigger | Auto-updates `updated_at` on appointment modification. |

---

## Row Level Security (RLS)

| Table | anon | authenticated |
|-------|------|---------------|
| appointments | INSERT only | SELECT, INSERT, UPDATE, DELETE |
| blocked_periods | SELECT only | SELECT, INSERT, UPDATE, DELETE |
| blocked_slots | SELECT only | SELECT, INSERT, UPDATE, DELETE |

Patient PII is protected: anonymous users cannot SELECT appointments. Availability is exposed only through SECURITY DEFINER functions.

---

## Schema Reference

Full SQL implementation: [`contracts/schema.sql`](contracts/schema.sql)
