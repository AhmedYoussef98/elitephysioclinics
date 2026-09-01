# Deployment

The site builds with Vite to `dist/` and runs on either Vercel or Netlify.
Both hosts serve the same single-page app and the same booking-email function.

## Routes

| Route                    | Access        | Notes                              |
| ------------------------ | ------------- | ---------------------------------- |
| `/`                      | Public        | Clinic website and booking form    |
| `/privacy-policy`        | Public        |                                    |
| `/clinic-portal/login`   | Public        | Admin sign-in (Supabase Auth)      |
| `/clinic-portal`         | Authenticated | Admin dashboard                    |

Every route is client-side, so the host must fall back to `index.html` for
unknown paths — `vercel.json` on Vercel, `public/_redirects` on Netlify.

## Environment variables

Set these in the host's project settings. The two `VITE_`-prefixed values are
read at **build time** and baked into the bundle, so a redeploy is required
after changing them.

| Variable                  | Used by      | Required                       |
| ------------------------- | ------------ | ------------------------------ |
| `VITE_SUPABASE_URL`       | Browser      | Yes — booking and admin portal |
| `VITE_SUPABASE_ANON_KEY`  | Browser      | Yes — booking and admin portal |
| `RESEND_API_KEY`          | Email function | Only for booking emails      |
| `SUPABASE_URL`            | Email function | No — falls back to `VITE_SUPABASE_URL` |
| `SUPABASE_ANON_KEY`       | Email function | No — falls back to `VITE_SUPABASE_ANON_KEY` |

Without the Supabase values the app still builds and the marketing site renders,
but booking and the admin portal cannot reach the database.

## Vercel

Zero-config apart from `vercel.json`, which sets the Vite preset, rewrites
unknown paths to `index.html`, and maps the booking form's
`/.netlify/functions/send-booking-email` call to `api/send-booking-email.ts`.
That file is a thin adapter around the Netlify handler so both hosts send
identical mail from one implementation.

Note that new Vercel projects enable **Vercel Authentication**, which puts every
deployment behind a Vercel login. Turn it off under
*Project → Settings → Deployment Protection* to make the site publicly reachable.

## Netlify

`netlify.toml` sets the build command, publish directory and functions
directory; `public/_redirects` provides the SPA fallback.

## Database

The Supabase schema lives in `specs/002-supabase-booking-mvp/contracts/schema.sql`
for new installs. An existing database needs
`supabase/migrations/20260702000000_booking_review_fixes.sql` applied once via
the Supabase SQL Editor. Admin users are created in the Supabase Auth dashboard.
