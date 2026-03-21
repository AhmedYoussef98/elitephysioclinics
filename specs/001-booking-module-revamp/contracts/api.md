# API Contracts: Booking Module Revamp

**Date**: 2026-03-20
**Base URL**: `/api`

## POST /api/book

Create a new booking.

### Request

```json
{
  "patientName": "John Smith",
  "patientPhone": "+44 7700 900123",
  "patientEmail": "john@example.com",
  "conditionSlug": "back-pain-sciatica",
  "date": "2026-03-25",
  "startTime": "17:00"
}
```

| Field          | Type   | Required | Validation                                                |
|----------------|--------|----------|-----------------------------------------------------------|
| patientName    | string | Yes      | Non-empty, max 100 characters                             |
| patientPhone   | string | Yes      | UK format: `/^(\+44|0)[\s\-]?[\d\s\-]{9,12}$/`          |
| patientEmail   | string | Yes      | Valid email format                                        |
| conditionSlug  | string | Yes      | One of 11 defined condition slugs                         |
| date           | string | Yes      | YYYY-MM-DD, within 4-week window, not past, not Sunday    |
| startTime      | string | Yes      | HH:MM, within clinic hours for given day                  |

### Response: 201 Created

```json
{
  "booking": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "patientName": "John Smith",
    "patientPhone": "+44 7700 900123",
    "patientEmail": "john@example.com",
    "conditionSlug": "back-pain-sciatica",
    "conditionTitle": "Back Pain and Sciatica",
    "date": "2026-03-25",
    "startTime": "17:00",
    "endTime": "17:30",
    "status": "confirmed",
    "createdAt": "2026-03-20T14:30:00.000Z"
  }
}
```

### Response: 400 Bad Request

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "patientPhone", "message": "Invalid UK phone number format" }
  ]
}
```

### Response: 409 Conflict

```json
{
  "error": "Time slot already booked",
  "message": "The selected time slot on 2026-03-25 at 17:00 is no longer available. Please select a different time."
}
```

---

## GET /api/availability

Get available time slots for a specific date.

### Request

Query parameters:

| Parameter | Type   | Required | Validation                                             |
|-----------|--------|----------|--------------------------------------------------------|
| date      | string | Yes      | YYYY-MM-DD, within 4-week window, not past, not Sunday |

**Example**: `GET /api/availability?date=2026-03-25`

### Response: 200 OK

```json
{
  "date": "2026-03-25",
  "dayOfWeek": "Wednesday",
  "clinicHours": {
    "start": "16:30",
    "end": "21:00"
  },
  "slots": [
    { "startTime": "16:30", "endTime": "17:00", "available": true },
    { "startTime": "17:00", "endTime": "17:30", "available": false },
    { "startTime": "17:30", "endTime": "18:00", "available": true },
    { "startTime": "18:00", "endTime": "18:30", "available": true },
    { "startTime": "18:30", "endTime": "19:00", "available": true },
    { "startTime": "19:00", "endTime": "19:30", "available": true },
    { "startTime": "19:30", "endTime": "20:00", "available": true },
    { "startTime": "20:00", "endTime": "20:30", "available": true },
    { "startTime": "20:30", "endTime": "21:00", "available": true }
  ]
}
```

### Response: 400 Bad Request

```json
{
  "error": "Invalid date",
  "message": "Date must be in YYYY-MM-DD format and within the next 4 weeks"
}
```

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "Short error description",
  "message": "Human-readable explanation (optional)",
  "details": [
    { "field": "fieldName", "message": "Field-specific error" }
  ]
}
```

| HTTP Status | Usage                                         |
|-------------|-----------------------------------------------|
| 201         | Booking created successfully                  |
| 200         | Availability data returned                    |
| 400         | Validation failure (invalid input)            |
| 409         | Slot already booked (double-booking prevented) |
| 500         | Unexpected server error                       |
