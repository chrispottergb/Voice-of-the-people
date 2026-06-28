# Voice of the People — Project Handoff

## What This Is
Civic engagement platform connecting Wisconsin voters to candidates in their specific voting districts. Mobile-first (Expo React Native for iOS + Android) with Supabase backend.

## Supabase Project
- **URL**: https://ywjrrppeozvktvkpatmc.supabase.co
- **Project ID**: ywjrrppeozvktvkpatmc
- **CLI**: `npx supabase` (v2.108.0 installed globally)
- To link: `npx supabase link --project-ref ywjrrppeozvktvkpatmc` (requires SUPABASE_ACCESS_TOKEN)
- To push migrations: `npx supabase db push`

## Git Branch
Always develop on: `claude/wisconsin-votp-seed-dzi3ac`

## Stack
- **Mobile**: Expo ~51 + Expo Router v3 (file-based routing)
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Language**: TypeScript throughout
- **State**: Zustand (`store/auth-store.ts`)
- **District resolution**: Google Civic Information API → Supabase → Upstash Redis cache

## File Structure (built by agent swarm — check git status)
```
supabase/
  config.toml                    ← linked to ywjrrppeozvktvkpatmc
  migrations/001_initial_schema.sql
  seed/wisconsin_districts.sql   ← all 232 WI districts + ~600 offices
lib/
  types.ts                       ← all TypeScript interfaces
  supabase.ts                    ← Supabase client (uses EXPO_PUBLIC_* vars)
  district-resolver.ts           ← address → district IDs via Google Civic API
store/
  auth-store.ts                  ← Zustand session/profile store
app/
  _layout.tsx                    ← root layout, auth listener
  index.tsx                      ← redirect: auth→tabs or login
  (auth)/
    _layout.tsx
    login.tsx
    register.tsx
    verify-address.tsx           ← address → district resolution UI
  (tabs)/
    _layout.tsx
    index.tsx                    ← home feed
    districts.tsx
    candidates.tsx
    questions.tsx
    profile.tsx
  (admin)/                       ← TODO: needs building
    _layout.tsx
    index.tsx                    ← admin dashboard (premium UI)
    upload.tsx                   ← voter registration PDF/CSV upload
scripts/
  seed-wisconsin.ts
  validate-seed.ts
```

## Outstanding Tasks (build these next)
1. **Admin panel** (`app/(admin)/`) — secure sign-in with admin role check, premium dashboard UI (Linear/Stripe/Vercel aesthetic, dark mode, sparkline metrics, data table with drawer)
2. **Voter registration upload** (`app/(admin)/upload.tsx`) — PDF or CSV file picker, parse voter data, bulk insert to `profiles` table
3. **Supabase link + push migrations** — needs `SUPABASE_ACCESS_TOKEN` from user
4. **Add `zustand` to package.json** — `"zustand": "^4.5.4"` in dependencies
5. **Add `babel-plugin-module-resolver`** to devDependencies

## Wisconsin Districts Seeded
- 8 Congressional (WI-01 to WI-08)
- 33 State Senate
- 99 State Assembly
- 72 Counties (all named correctly)
- 20 Top Municipalities

## Env Vars Needed
```
EXPO_PUBLIC_SUPABASE_URL=https://ywjrrppeozvktvkpatmc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard>
GOOGLE_CIVIC_API_KEY=<from Google Cloud Console>
UPSTASH_REDIS_REST_URL=<from Upstash>
UPSTASH_REDIS_REST_TOKEN=<from Upstash>
```

## Admin Panel Spec (build this)
- Route: `app/(admin)/` — protected, only `role = 'admin'` profiles
- Secure sign-in: email/password + check profile.role === 'admin', else deny
- Dashboard: premium dark UI matching Linear/Vercel aesthetic
  - Sidebar: collapsible, workspace selector, nav items, user deck
  - Header: cmd+K palette bar, breadcrumbs, action buttons
  - Metric cards: total voters, total candidates, total questions, active districts — with sparklines
  - Data table: all registered users, status badges, context menu per row
  - Slide-out drawer: user detail, tabs (Overview / Questions / Audit Log)
- Upload screen: PDF or CSV voter registration forms
  - File picker (expo-document-picker)
  - Parse CSV: columns = full_name, email, address, district_id
  - Bulk upsert to profiles with verified_voter=true
  - Progress bar, success/error per row

## How to Resume
1. `git checkout claude/wisconsin-votp-seed-dzi3ac`
2. `git pull origin claude/wisconsin-votp-seed-dzi3ac`
3. Check what files exist: `git status` and `ls -R app/ lib/ supabase/`
4. Build admin panel per spec above
5. Push + create/update PR
