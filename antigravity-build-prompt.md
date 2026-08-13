# ANTIGRAVITY BUILD PROMPT — getOwnerHQ.com
### Copy everything below this line into Antigravity as your project mission.

---

## PROJECT OVERVIEW

Build **getOwnerHQ** — a multi-tenant SaaS website for small and medium gym owners in India to manage member signups, track membership expiry, and send manual renewal reminders via WhatsApp.

This is a **WEBSITE**, not a mobile app. Mobile-first responsive design, works in any phone/desktop browser, no app store involved.

Two user types:
1. **Gym Owner** — signs up, logs in, pays a subscription, manages their gym's members from a dashboard
2. **Gym Member** — never logs in; scans a QR code, fills a short public form, done

---

## TECH STACK (fixed — do not substitute)

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend / Database / Auth:** Supabase (Postgres + Supabase Auth + Row Level Security)
- **Hosting:** Vercel (frontend deploys from this repo)
- **QR generation:** `qrcode.react` npm package
- **Icons:** `lucide-react`
- **Domain:** getownerHQ.com

Reuse and extend the existing `Gym Ledger` React demo code as the visual/UX starting point — do not redesign the component structure from scratch, but replace all `localStorage` calls with real Supabase queries.

---

## SUPABASE SCHEMA (already finalized — implement exactly this)

Run this schema first via Supabase SQL Editor. Tables: `gyms`, `gym_plans`, `members`, `payments`, `reminder_logs`.

Critical requirements:
- Every table except `gyms` has a `gym_id` foreign key
- Row Level Security (RLS) enabled on ALL tables
- Owners can only see/edit rows where `gym_id` belongs to a gym they own (`owner_user_id = auth.uid()`)
- A special public INSERT policy allows anonymous (not logged in) visitors to insert into `members` ONLY with `status = 'pending'` — this is what makes the public QR form work without login
- Unique constraint on `(gym_id, mobile)` in `members` to block duplicate signups from the same phone number for the same gym — **one mobile number can only ever belong to ONE member per gym.** If two different people try to register under the same number (e.g. a family sharing one phone), the second attempt must be rejected with a clear error message, not silently overwritten and not allowed to create a second profile. Enforce this both in the database (unique constraint, already listed above) and in the registration form UI (show "This number is already registered" instead of a generic error)
- `gyms.subscription_status` tracks billing state: `trial | active | past_due | cancelled`
- Never expose the Supabase `service_role` key anywhere in frontend code — only the public `anon` key is used client-side

---

## PAGES / SCREENS TO BUILD (complete list — build all of these)

### PUBLIC PAGES (no login required)

**1. Marketing Homepage** (`/`)
- Hero section: clear headline about solving membership renewal chaos for gym owners
- 3-4 feature highlights with icons (QR self-registration, expiry dashboard, WhatsApp reminders, payment ledger)
- Pricing section showing subscription tiers (see PRICING below)
- "Start Free Trial" CTA button → goes to Sign Up
- Simple footer (contact, terms, privacy)
- Design: professional, modern, minimalist — generous white space, one strong accent color, no clutter, no stock-photo cheesiness

**2. Owner Sign Up** (`/signup`)
- Email + password (Supabase Auth `signUp`)
- On success: create a row in `gyms` table linked to the new `owner_user_id`, ask for Gym Name + City to finish setup
- Auto-generate a unique `slug` from the gym name (e.g. "Powerhouse Gym" → `powerhouse-gym`, append random suffix if taken)
- New gyms start with `subscription_status = 'trial'`, `trial_ends_at = now() + 14 days`

**3. Owner Login** (`/login`)
- Email + password (Supabase Auth `signInWithPassword`)
- "Forgot password" link using Supabase's built-in reset flow
- On success, redirect to `/dashboard`

**4. Member Self-Registration** (`/r/[gym-slug]`) — THIS IS THE QR DESTINATION
- Look up the gym by slug, show gym name + city at top (branded to that gym)
- Step 1 form fields: **Full Name, Mobile Number only.** No email field. No photo. No ID upload. Keep this to two fields, nothing more.
- Step 2: Real OTP verification via SMS (see OTP section below) — not a fake/simulated OTP
- On verify: insert into `members` with `status = 'pending'`, `gym_id` from the slug lookup
- Success screen: "You're registered! See the front desk to activate your plan." — clear next step, no confusion
- Must load fast on a cheap Android phone with average mobile data — no heavy animations, no large images

### AUTHENTICATED OWNER PAGES (behind login)

**5. Dashboard** (`/dashboard`)
- Scoreboard strip at top: counts for All / Expiring (≤3 days) / Pending / Active / Expired — clicking a count filters the list below
- Search bar (name or phone)
- Member cards grid, each showing name, phone, status badge (color-coded), expiry date
- Each card has two actions: "Activate/Renew" and "Send WhatsApp Reminder" (manual click-to-send `wa.me` link, pre-filled message — NOT automated sending)
- "Add Member Manually" button (for walk-ins without QR)
- Empty states for each filter (e.g. "No pending QR scans yet — print your standee from Settings")

**6. Activate/Renew Drawer** (slide-out panel, triggered from dashboard)
- Select membership plan (dropdown of this gym's `gym_plans`)
- Set start date, auto-calculate expiry date from plan duration
- Enter amount paid + payment mode (Cash/UPI/Card/Bank Transfer)
- On submit: update `members` row, insert a `payments` row, generate a receipt number
- **This is where an OPTIONAL photo-capture button can live for v2 later — do NOT build this now, leave a clearly commented placeholder in the code for future use, nothing more**

**7. Payments Ledger** (`/dashboard/payments`)
- Table of all payment receipts for this gym: member name, amount, mode, plan, date, receipt number
- Filterable by date range
- Exportable to CSV (simple client-side CSV export, no backend needed)

**8. WhatsApp Templates** (`/dashboard/whatsapp`)
- List of pre-written message templates (7-day reminder, 3-day reminder, expiry-day reminder, win-back after expiry, welcome/activation confirmation, payment receipt)
- Each template has editable placeholder text the owner can customize per gym
- This screen only builds `wa.me` links with pre-filled text — it does NOT send anything automatically. Make this limitation clear in the UI with a small note: "Click to open WhatsApp and send manually."

**9. Settings** (`/dashboard/settings`)
- Gym profile form: name, tagline, owner name, owner mobile, city, address, UPI ID
- Membership Plans manager: add/edit/delete plans (name, duration in months, price)
- Notification toggle: auto-prioritize "Expiring" filter on dashboard load
- **QR Code Standee generator:** large QR code linking to `getownerhq.com/r/[slug]`, printable A5 poster with simple instructions ("1. Scan with Phone Camera / 2. Enter Name & Mobile / 3. Show pass at reception"), print button

**10. Billing / Subscription** (`/dashboard/billing`)
- Shows current plan, trial countdown if on trial, next billing date
- Plan selector (see PRICING below) with "Upgrade" / "Change Plan" buttons
- Integrates Razorpay Subscriptions for payment — on successful payment, update `gyms.subscription_status = 'active'` via a Supabase Edge Function webhook (never trust the frontend alone to mark a subscription active — always confirm via Razorpay's webhook)
- Clear cancellation flow

---

## OWNER SUBSCRIPTION PRICING (build this into the Billing page)

Two flat monthly tiers by member count, WhatsApp manual reminders included at every tier (no separate automation charge for MVP):

| Plan | Members | Price/month |
|---|---|---|
| Starter | Under 100 | ₹499 |
| Growth | 100+ | ₹999 |

- First month free for all new signups (handled via `trial_ends_at` logic, no card required to start trial)
- Design the `gyms` table and Billing UI so a THIRD tier can be added later without a schema change — `subscription_plan` is already a free-text field, not a hardcoded enum, so adding a future higher tier is just a new row in the pricing config, not a migration
- Do NOT build a separate automation add-on tier in this version — that's a future feature, not MVP

---

## OTP VERIFICATION (real, not simulated)

- Use an SMS provider — MSG91 or Twilio (India routes) — integrated via a Supabase Edge Function so the API key never touches the frontend
- Edge Function 1: `send-otp` — generates a 4-6 digit code, stores it server-side with a short expiry (5 minutes), sends via SMS
- Edge Function 2: `verify-otp` — checks the submitted code against the stored one, returns success/fail
- Never display the OTP code on-screen in production (the old demo did this for testing only — remove entirely)
- Rate-limit OTP requests per phone number (max 3 per 10 minutes) to prevent abuse/cost blowout

---

## EXPIRY STATUS AUTOMATION

- Implement the `refresh_member_statuses()` Postgres function (already written in the schema) that recalculates every member's status daily:
  - `expired` if expiry date has passed
  - `expiring` if expiry date is within 3 days
  - `active` otherwise
  - `pending` if no plan activated yet
- Schedule it once a day using Supabase's `pg_cron` extension

---

## DESIGN SYSTEM (carry over from the existing demo, refine for "modern minimalist")

- **Colors:** Deep navy `#1E3A5F` (primary/headers), warm amber `#E8A33D` (accents/CTAs), off-white `#FAFAF8` (background), near-black `#1C1F26` (text), semantic green `#2E9E5B` (success/active), red `#D93025` (expired/urgent)
- **Fonts:** Barlow Condensed (bold display headings), IBM Plex Mono (all numbers — prices, phone numbers, dates — for clean alignment), Inter (body text)
- **Principles:**
  - Generous white space, no visual clutter
  - Large touch targets everywhere (this is used on phones at a gym front desk, often with sweaty/gloved hands)
  - Status always shown with both color AND text label (not color alone — accessibility)
  - Every screen should be understandable to a non-technical gym owner within 5 seconds of looking at it
  - No unnecessary animation or motion — clarity over flash
  - Mobile-first: design and test every screen at 375px width first, then scale up

---

## SECURITY REQUIREMENTS (non-negotiable)

1. Row Level Security enabled and tested on every table before considering any feature "done"
2. `service_role` key exists ONLY in Supabase Edge Functions / server-side code — grep the entire frontend codebase before finishing to confirm it appears nowhere in client-side files
3. All public form inputs (name, mobile) validated both client-side (UX) and via Postgres `check` constraints (real enforcement)
4. OTP endpoints rate-limited to prevent SMS-cost abuse by bad actors
5. Passwords never handled directly — always via Supabase Auth's built-in methods
6. Every Supabase query from the frontend uses the `anon` key with RLS enforcing access — no query should ever be able to return another gym's data, verify this by testing with two different gym accounts before shipping

---

## EXPLICITLY DO NOT BUILD (out of scope for this version)

- ❌ No photo upload field on the public registration form
- ❌ No ID proof / Aadhaar / government ID upload anywhere
- ❌ No automated/scheduled WhatsApp or SMS sending — reminders are manual click-to-send only
- ❌ No native mobile app (iOS/Android) — website only
- ❌ No multi-location/multi-branch support yet — one gym per owner for now
- ❌ No member login/portal — members never authenticate, they only appear via QR self-registration or manual staff entry

---

## FINAL VERIFICATION CHECKLIST (Antigravity — confirm all before calling this complete)

- [ ] Project builds with zero TypeScript errors and zero console errors
- [ ] Two test gym accounts created — confirm Owner A cannot see Owner B's members, plans, or payments under any circumstance
- [ ] Public QR registration form works end-to-end with real OTP send + verify
- [ ] Duplicate phone number for the same gym is correctly rejected
- [ ] Dashboard scoreboard counts match actual filtered member counts
- [ ] WhatsApp button opens `wa.me` with correctly pre-filled, personalized message text
- [ ] A5 QR standee prints cleanly (test via browser print preview)
- [ ] Billing page correctly reflects trial vs active vs past_due states
- [ ] `service_role` key does not appear anywhere in `/src` or any client-bundled file
- [ ] Entire flow tested on a real mobile browser at 375px width, not just desktop
- [ ] Site deploys successfully to Vercel and is reachable at the connected getownerHQ.com domain

---

## Antigravity — start with the Supabase schema and auth wiring first, then build screens in this order: Sign Up/Login → Dashboard (empty state) → Settings/QR generator → Public Registration Form → Activate/Renew Drawer → Payments Ledger → WhatsApp Templates → Billing. Show me a working build after each major screen before moving to the next — do not build all 10 screens silently and present everything at once.
