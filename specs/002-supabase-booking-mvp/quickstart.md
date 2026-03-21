# Quickstart: Supabase Booking System

**Feature**: 002-supabase-booking-mvp
**Date**: 2026-03-21

## Prerequisites

- Node.js 18+
- Supabase project created with schema deployed (see `contracts/supabase-setup.md`)
- Admin user created in Supabase Auth dashboard

## Setup

### 1. Install new dependencies

```bash
npm install @supabase/supabase-js react-router
```

### 2. Remove Express dependencies

```bash
npm uninstall express cors @types/express @types/cors concurrently tsx
```

### 3. Create environment file

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://olocjihupxnaurfywlnv.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Create `.env.example` (committed to git, no real keys):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run development server

```bash
npm run dev
```

This now runs only the Vite dev server (no Express needed).

## Key Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Main clinic website with booking form |
| `/clinic-portal` | Authenticated | Admin dashboard |
| `/clinic-portal/login` | Public | Admin login page |

## Testing the Booking Flow

1. Open `http://localhost:5173`
2. Navigate to the booking section
3. Select a condition, date, time slot, enter patient details
4. Submit — should see confirmation with booking reference
5. Check Supabase Table Editor — appointment should appear in `appointments` table

## Testing the Admin Panel

1. Open `http://localhost:5173/clinic-portal`
2. Should redirect to login page
3. Log in with the admin email/password created in Supabase dashboard
4. Should see the appointment created in step above
5. Test reschedule, cancel, and create actions

## Database Access

- **Supabase Dashboard**: https://supabase.com/dashboard (Table Editor, SQL Editor)
- **RPC Functions**: Called via `supabase.rpc('function_name', { params })`
- **Direct queries**: Admin panel uses `supabase.from('appointments').select()` etc.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No API key" error | Check `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| Booking fails silently | Check Supabase dashboard → Logs for RPC errors |
| Admin can't see appointments | Verify RLS policies exist (run schema.sql again if needed) |
| Login fails | Check admin user exists in Supabase Auth → Users |
| Slots not showing | Verify `get_unavailable_slots` function exists in Database → Functions |
