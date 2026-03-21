# Data Model: Booking Module Revamp

**Date**: 2026-03-20
**Feature**: [spec.md](./spec.md)

## Entities

### Booking

Represents a confirmed patient appointment at the clinic.

| Field          | Type                          | Constraints                                                    |
|----------------|-------------------------------|----------------------------------------------------------------|
| id             | string (UUID)                 | Primary key, auto-generated via `crypto.randomUUID()`          |
| patientName    | string                        | Required, max 100 characters                                   |
| patientPhone   | string                        | Required, UK format: `/^(\+44|0)[\s\-]?[\d\s\-]{9,12}$/`     |
| patientEmail   | string                        | Required, valid email format                                   |
| conditionSlug  | string                        | Required, must match one of 11 defined condition slugs         |
| date           | string (YYYY-MM-DD)           | Required, within 4-week window, not Sunday, not past           |
| startTime      | string (HH:MM)                | Required, must fall within clinic hours for given day           |
| status         | "confirmed" \| "cancelled"    | Default: "confirmed"                                           |
| createdAt      | string (ISO 8601)             | Auto-generated at creation time                                |

**Uniqueness constraint**: One confirmed booking per (date, startTime) combination. A cancelled booking does not block the slot.

**Derived fields** (computed, not stored):
- `endTime`: startTime + 30 minutes
- `conditionTitle`: looked up from Conditions list by conditionSlug
- `bookingReference`: first 8 characters of `id`, uppercased

### Condition (Static / Configuration)

Represents a physiotherapy condition the clinic treats. Defined as a static array — not stored in a database.

| Field       | Type   | Description                          |
|-------------|--------|--------------------------------------|
| slug        | string | Unique identifier (kebab-case)       |
| title       | string | Human-readable display name          |
| description | string | Full condition description           |

**Values** (11 conditions):

| Slug                      | Title                                    |
|---------------------------|------------------------------------------|
| back-pain-sciatica        | Back Pain and Sciatica                   |
| neck-pain-whiplash        | Neck Pain and Whiplash                   |
| arthritis                 | Arthritis                                |
| sports-injuries           | Sports Injuries                          |
| work-related-injury       | Work Related Injury or Pain              |
| muscle-tendon-ligament    | Muscles, Tendons and Ligaments Injuries  |
| ankle-knee                | Ankle and Knee Injuries/Problems         |
| frozen-shoulder           | Frozen Shoulder                          |
| tennis-elbow              | Tennis Elbow                             |
| post-surgery-rehab        | Rehabilitation Following Surgery         |
| disc-prolapses            | Disc Prolapses                           |

### TimeSlot (Computed / Ephemeral)

Represents a 30-minute appointment window. Generated dynamically — never stored.

| Field     | Type    | Description                                      |
|-----------|---------|--------------------------------------------------|
| startTime | string  | HH:MM format (e.g., "16:30")                    |
| endTime   | string  | HH:MM format (e.g., "17:00"), startTime + 30min |
| available | boolean | false if a confirmed booking exists at this slot |

**Generation rules**:

| Day       | Start  | End   | Slot Count |
|-----------|--------|-------|------------|
| Mon–Fri   | 16:30  | 21:00 | 9          |
| Saturday  | 08:00  | 21:00 | 26         |
| Sunday    | Closed | —     | 0          |

## Relationships

```
Booking.conditionSlug → Condition.slug (lookup, not FK)
Booking.(date, startTime) → TimeSlot (availability check)
```

## State Transitions

```
[New Booking Request]
        │
        ▼
  ┌──────────┐     slot taken     ┌──────────┐
  │ Validate  │ ───────────────►  │ 409 Error │
  │  Input    │                   └──────────┘
  └────┬─────┘
       │ valid + slot available
       ▼
  ┌──────────┐
  │ Confirmed │ (status: "confirmed")
  └────┬─────┘
       │ cancellation (future scope)
       ▼
  ┌──────────┐
  │ Cancelled │ (status: "cancelled", slot freed)
  └──────────┘
```

## Storage

**Initial implementation**: In-memory `Map<string, Booking>` keyed by booking ID.

- All bookings lost on server restart (acceptable for MVP)
- No persistence layer, no migrations
- Future enhancement: migrate to PostgreSQL or similar
