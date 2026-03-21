# Research: Supabase Booking System

**Feature**: 002-supabase-booking-mvp
**Date**: 2026-03-21

## Decision 1: Client-Side Architecture (Express → Supabase JS)

**Decision**: Remove Express backend entirely. React frontend communicates directly with Supabase via `@supabase/supabase-js`.

**Rationale**:
- The Supabase schema already has SECURITY DEFINER RPC functions (`book_appointment`, `get_unavailable_slots`, `get_blocked_dates`) that handle all booking logic server-side in PostgreSQL
- RLS policies protect patient data — anon users can only INSERT appointments, not SELECT them
- Double-booking prevention is handled by a partial unique index at the database level
- Eliminates the need to host/deploy a separate Node.js server
- Supabase JS client works directly in the browser with the `anon` key (safe to expose)

**Alternatives Considered**:
- **Keep Express as middleware**: Rejected — adds deployment complexity with no benefit since all validation and business logic runs in PostgreSQL functions
- **Hybrid (Express for WhatsApp only)**: Rejected — Supabase Edge Functions handle this use case without a separate server

---

## Decision 2: Routing (react-router)

**Decision**: Install `react-router` v7 for client-side routing.

**Rationale**:
- Need two distinct routes: `/` (main website) and `/clinic-portal` (admin panel)
- Current app has no router — it's a single-page site rendered entirely in App.tsx
- React Router v7 unified the package: install `react-router` (not `react-router`), import from `"react-router"`
- Protected route pattern via an `<Outlet>` wrapper that checks Supabase auth session
- Use "library mode" (declarative `BrowserRouter` + `Routes`) — no framework mode or Vite plugin needed

**Implementation Pattern**:
```
main.tsx → BrowserRouter + AuthProvider
  App.tsx → Routes
    "/" → HomePage (current App.tsx content)
    "/clinic-portal/login" → LoginPage
    <ProtectedRoute> (checks auth session)
      "/clinic-portal/*" → AdminLayout → Outlet → child routes
```

**Auth State Management**: Use an `AuthProvider` React context that wraps the app, calls `supabase.auth.getSession()` on mount and listens via `onAuthStateChange`. Exposes `session`, `user`, `loading`, `signIn`, `signOut` to all components.

**Alternatives Considered**:
- **TanStack Router**: More type-safe but heavier; overkill for 2-3 routes
- **Manual hash routing**: Fragile, no browser history support
- **Separate Vite project for admin**: Unnecessary complexity for a single-admin clinic

---

## Decision 3: WhatsApp Notifications (Supabase Edge Functions)

**Decision**: Deploy a Supabase Edge Function (Deno) triggered by a database webhook on INSERT to the appointments table.

**Rationale**:
- Supabase Edge Functions run on Deno Deploy — serverless, no infrastructure to manage
- Database webhooks can trigger functions on specific table events (INSERT, UPDATE, DELETE)
- The function formats the booking details and sends via WhatsApp Business API (Meta Cloud API or Twilio)
- Fire-and-forget: if the function fails, the booking still succeeds (it was already inserted)
- Existing WhatsApp message format from `server/lib/whatsapp.ts` can be adapted

**Implementation**:
1. Create Edge Function: `supabase/functions/whatsapp-notify/index.ts`
2. Configure database webhook: trigger on INSERT to `appointments` table
3. Function receives the new row payload, formats message, calls WhatsApp API
4. Store WhatsApp credentials as Supabase secrets (not in client code)

**Alternatives Considered**:
- **PostgreSQL triggers + pg_net**: Could call webhooks from SQL, but less flexible and harder to debug
- **Client-side notification**: Security risk — would expose WhatsApp API credentials in browser
- **Polling from admin panel**: Not real-time, requires admin to be actively watching

---

## Decision 4: Admin Authentication (Supabase Auth)

**Decision**: Use Supabase Auth with email/password for admin login. Single pre-created admin user.

**Rationale**:
- Supabase Auth is built-in, no additional services needed
- Email signup disabled — admin user created manually in Supabase dashboard
- Session managed via JWT tokens stored in localStorage by the Supabase client
- RLS policies use `authenticated` role to gate access to appointment data
- `onAuthStateChange` listener handles session expiry and auto-redirect

**Session Configuration**:
- Default Supabase session duration: 1 hour access token, 1 week refresh token
- Access token auto-refreshes silently via the Supabase client
- On session expiry (refresh token expired): redirect to `/clinic-portal/login`

**Alternatives Considered**:
- **Custom JWT + bcrypt**: Reinventing the wheel; Supabase Auth handles all this
- **Magic link (passwordless)**: Simpler UX but requires email delivery setup; email/password is sufficient for a single admin

---

## Decision 5: Supabase Client Configuration

**Decision**: Single shared Supabase client instance in `src/lib/supabase.ts`.

**Rationale**:
- Vite exposes env vars prefixed with `VITE_` to the client bundle
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are safe to expose (anon key is public by design)
- Single instance ensures consistent auth state across components
- The `service_role` key is NEVER used client-side — only in Edge Functions via Supabase secrets

**Configuration**:
```
.env (gitignored):
  VITE_SUPABASE_URL=https://olocjihupxnaurfywlnv.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Decision 6: Project Structure Changes

**Decision**: Minimal structural changes — keep existing component structure, add admin components and routing.

**Rationale**:
- Current `src/components/booking/` works well and only needs API call changes
- Add `src/components/admin/` for admin panel components
- Add `src/lib/supabase.ts` for the client
- Move current App.tsx content to be rendered under the `/` route
- Remove `server/` directory entirely
- Update `vite.config.ts` to remove the `/api` proxy
- Update `package.json` to remove Express-related dependencies and scripts

**Files to Remove**:
- `server/` (entire directory)
- Express, cors, concurrently, tsx dependencies

**Files to Add**:
- `src/lib/supabase.ts`
- `src/components/admin/*.tsx`
- `.env` (gitignored)
- `.env.example` (committed, no real keys)

**Files to Modify**:
- `src/main.tsx` — add BrowserRouter
- `src/App.tsx` — add Routes, keep website content as default route
- `src/components/booking/BookingForm.tsx` — use Supabase RPC instead of fetch
- `src/components/booking/TimeSlotPicker.tsx` — use Supabase RPC instead of fetch
- `src/components/booking/DatePicker.tsx` — fetch blocked dates from Supabase
- `package.json` — add supabase-js, react-router; remove express deps
- `vite.config.ts` — remove API proxy
- `tsconfig.json` — remove server from includes
