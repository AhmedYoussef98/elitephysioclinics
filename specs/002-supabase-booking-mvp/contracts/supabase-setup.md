# Supabase Setup Guide — Elite Physio Clinics

Step-by-step instructions from account creation to a fully configured booking database.

---

## Step 1: Create a Supabase Account

1. Go to **https://supabase.com**
2. Click **Start your project** (or **Sign Up**)
3. Sign up with your **GitHub account** or **email/password**
4. Verify your email if prompted

---

## Step 2: Create a New Project

1. Once logged in, click **New Project**
2. Fill in:
   - **Organization**: Select your org (or create one — free tier is fine)
   - **Project name**: `elite-physio-clinics`
   - **Database password**: Choose a strong password — **save this somewhere safe**, you'll need it for direct database access
   - **Region**: Choose the closest to your clinic (e.g., `London (eu-west-2)` for UK)
   - **Plan**: Free tier is sufficient to start
3. Click **Create new project**
4. Wait 1-2 minutes for the project to provision

---

## Step 3: Get Your API Keys

Once the project is ready:

1. Go to **Project Settings** (gear icon in the left sidebar)
2. Click **API** in the settings menu
3. You'll see two important values — **copy and save both**:

| Key | Where to find | What it's for |
|-----|---------------|---------------|
| **Project URL** | Under "Project URL" | Your Supabase endpoint (e.g., `https://abcdefgh.supabase.co`) |
| **anon / public key** | Under "Project API keys" → `anon` `public` | Used by the booking form (client-side, safe to expose) |
| **service_role key** | Under "Project API keys" → `service_role` `secret` | **NEVER expose this** — used only server-side for admin operations |

You'll add these to your project as environment variables:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 4: Run the Database Schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy the entire contents of `schema.sql` (in this same directory) and paste it
4. Click **Run** (or press Cmd+Enter / Ctrl+Enter)
5. You should see "Success. No rows returned" — this means all tables, indexes, policies, and functions were created

---

## Step 5: Verify the Tables

1. Go to **Table Editor** in the left sidebar
2. You should see 3 tables:
   - `appointments` — where patient bookings are stored
   - `blocked_periods` — vacation/holiday date ranges
   - `blocked_slots` — individually blocked time slots
3. Click on each table to verify the columns were created correctly

---

## Step 6: Verify Row Level Security (RLS)

1. Go to **Authentication** → **Policies** in the left sidebar
2. You should see policies for each table:
   - **appointments**: anon can insert (create bookings), authenticated has full access
   - **blocked_periods**: anon can read, authenticated has full access
   - **blocked_slots**: anon can read, authenticated has full access

---

## Step 7: Verify Database Functions

1. Go to **Database** → **Functions** in the left sidebar
2. You should see 3 functions:
   - `get_unavailable_slots(booking_date)` — returns booked + blocked slots for a date
   - `get_blocked_dates(from_date, to_date)` — returns fully blocked dates in a range
   - `book_appointment(...)` — atomically creates a booking with double-booking protection

---

## Step 8: Create the Admin User

1. Go to **Authentication** → **Users** in the left sidebar
2. Click **Add user** → **Create new user**
3. Enter:
   - **Email**: Your clinic admin email (e.g., `admin@elitephysioclinics.co.uk`)
   - **Password**: A strong password for admin login
   - **Auto Confirm User**: Toggle ON (so the account is immediately active)
4. Click **Create user**

This user will be used to log into the admin panel.

---

## Step 9: Configure Authentication Settings

1. Go to **Authentication** → **Providers** in the left sidebar
2. Under **Email**, ensure:
   - **Enable Email Signup**: OFF (only the admin should have an account — you created it manually)
   - **Enable Email Confirmations**: OFF (for simplicity, since you created the user manually)
3. Go to **Authentication** → **URL Configuration**
4. Set:
   - **Site URL**: Your production URL (e.g., `https://elitephysioclinics.co.uk`)
   - **Redirect URLs**: Add your local dev URL too (e.g., `http://localhost:5173`)

---

## Step 10: Test the Setup

### Test 1: Check tables exist
In SQL Editor, run:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
```
Expected: `appointments`, `blocked_periods`, `blocked_slots`

### Test 2: Check functions exist
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
```
Expected: `handle_updated_at`, `get_unavailable_slots`, `get_blocked_dates`, `book_appointment`

### Test 3: Test booking function
```sql
SELECT public.book_appointment(
  'Test Patient',
  '+44 7700 900000',
  'test@example.com',
  'back-pain-sciatica',
  'Back Pain and Sciatica',
  CURRENT_DATE + 1,
  '17:00'::TIME
);
```
Expected: JSON with `"success": true` and booking details.

### Test 4: Verify the booking was created
```sql
SELECT * FROM public.appointments;
```
Expected: One row with the test booking.

### Test 5: Clean up test data
```sql
DELETE FROM public.appointments WHERE patient_name = 'Test Patient';
```

---

## Summary of What You've Done

| Step | What | Status |
|------|------|--------|
| 1 | Created Supabase account | |
| 2 | Created project `elite-physio-clinics` | |
| 3 | Saved Project URL and API keys | |
| 4 | Ran schema.sql in SQL Editor | |
| 5 | Verified 3 tables created | |
| 6 | Verified RLS policies active | |
| 7 | Verified 3 database functions | |
| 8 | Created admin user | |
| 9 | Configured auth settings | |
| 10 | Ran test queries | |

---

## Next Steps (Back in Your Code)

After completing the Supabase setup:

1. Install the Supabase client: `npm install @supabase/supabase-js`
2. Create a `.env` file with your keys (never commit this file):
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Create a Supabase client configuration file
4. Update the booking form to use Supabase instead of the Express backend
5. Build the admin panel with authenticated Supabase access
