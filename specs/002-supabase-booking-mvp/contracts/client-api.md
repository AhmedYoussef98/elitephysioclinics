# Client API Contracts

**Feature**: 002-supabase-booking-mvp
**Date**: 2026-03-21

All client-server communication happens via the Supabase JS client. No REST API endpoints — the frontend calls Supabase RPC functions and direct table queries.

---

## Public (Anonymous) Operations

These operations use the `anon` key and require no authentication.

### Book an Appointment

```typescript
const { data, error } = await supabase.rpc('book_appointment', {
  p_patient_name: 'John Smith',
  p_patient_phone: '+44 7700 900123',
  p_patient_email: 'john@example.com',
  p_condition_slug: 'back-pain-sciatica',
  p_condition_title: 'Back Pain and Sciatica',
  p_date: '2026-03-25',
  p_start_time: '17:00'
})
```

**Response (success)**:
```json
{
  "success": true,
  "data": {
    "id": "a0eebc99-...",
    "bookingReference": "A0EEBC99",
    "patientName": "John Smith",
    "patientPhone": "+44 7700 900123",
    "patientEmail": "john@example.com",
    "conditionSlug": "back-pain-sciatica",
    "conditionTitle": "Back Pain and Sciatica",
    "date": "2026-03-25",
    "startTime": "17:00:00",
    "endTime": "17:30:00",
    "status": "confirmed"
  }
}
```

**Response (error — slot taken)**:
```json
{
  "success": false,
  "error": "This time slot was just booked by someone else. Please select another time."
}
```

---

### Get Unavailable Slots for a Date

```typescript
const { data, error } = await supabase.rpc('get_unavailable_slots', {
  booking_date: '2026-03-25'
})
```

**Response**:
```json
[
  { "start_time": "17:00:00", "end_time": "17:30:00", "reason": "booked" },
  { "start_time": "18:00:00", "end_time": "18:30:00", "reason": "blocked" }
]
```

---

### Get Blocked Dates in Range

```typescript
const { data, error } = await supabase.rpc('get_blocked_dates', {
  from_date: '2026-03-21',
  to_date: '2026-04-18'
})
```

**Response**:
```json
[
  { "blocked_date": "2026-04-01" },
  { "blocked_date": "2026-04-02" },
  { "blocked_date": "2026-04-03" }
]
```

---

### Read Blocked Periods (for calendar)

```typescript
const { data, error } = await supabase
  .from('blocked_periods')
  .select('*')
  .gte('end_date', '2026-03-21')
  .lte('start_date', '2026-04-18')
```

---

### Read Blocked Slots (for time picker)

```typescript
const { data, error } = await supabase
  .from('blocked_slots')
  .select('*')
  .eq('date', '2026-03-25')
```

---

## Authenticated (Admin) Operations

These operations require the user to be logged in via Supabase Auth.

### Authentication

```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@elitephysioclinics.co.uk',
  password: '...'
})

// Logout
await supabase.auth.signOut()

// Get current session
const { data: { session } } = await supabase.auth.getSession()

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => { ... })
```

---

### List Appointments (with filters)

```typescript
let query = supabase
  .from('appointments')
  .select('*')
  .order('date', { ascending: true })
  .order('start_time', { ascending: true })

// Optional filters
if (statusFilter) query = query.eq('status', statusFilter)
if (dateFrom) query = query.gte('date', dateFrom)
if (dateTo) query = query.lte('date', dateTo)

const { data, error } = await query
```

---

### Update Appointment Status

```typescript
// Cancel
const { error } = await supabase
  .from('appointments')
  .update({ status: 'cancelled' })
  .eq('id', appointmentId)

// Mark completed
const { error } = await supabase
  .from('appointments')
  .update({ status: 'completed' })
  .eq('id', appointmentId)
```

---

### Reschedule Appointment

```typescript
// 1. Mark original as rescheduled
await supabase
  .from('appointments')
  .update({ status: 'rescheduled' })
  .eq('id', originalId)

// 2. Create new appointment at new date/time
const { data } = await supabase.rpc('book_appointment', {
  p_patient_name: original.patient_name,
  p_patient_phone: original.patient_phone,
  p_patient_email: original.patient_email,
  p_condition_slug: original.condition_slug,
  p_condition_title: original.condition_title,
  p_date: newDate,
  p_start_time: newTime
})
```

---

### Create Appointment (Admin)

Same as public booking — uses `book_appointment` RPC. The authenticated role has INSERT permission, and the RPC function runs as SECURITY DEFINER.

---

### Manage Blocked Periods

```typescript
// Create
const { error } = await supabase
  .from('blocked_periods')
  .insert({ start_date: '2026-04-01', end_date: '2026-04-05', reason: 'Annual leave' })

// Delete
const { error } = await supabase
  .from('blocked_periods')
  .delete()
  .eq('id', periodId)
```

---

### Manage Blocked Slots

```typescript
// Create
const { error } = await supabase
  .from('blocked_slots')
  .insert({ date: '2026-03-25', start_time: '18:00', end_time: '18:30', reason: 'Break' })

// Delete
const { error } = await supabase
  .from('blocked_slots')
  .delete()
  .eq('id', slotId)
```
