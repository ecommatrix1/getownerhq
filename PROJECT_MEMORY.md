# PROJECT MEMORY & KNOWLEDGE LOG — getOwnerHQ

## 1. Project Goal & Overview
- **Application Name**: `getOwnerHQ` (`getownerhq.in`)
- **Target Audience**: Gym Owners in India (managing signups, expiry tracking, WhatsApp reminders, billing).
- **Architecture**: Multi-tenant SaaS Cloud Web App (React + Vite + Supabase + Vercel). Mobile-first responsive design.

---

## 2. Tech Stack & Standards
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS.
- **Backend / Database / Auth**: Supabase (PostgreSQL with Row Level Security, Supabase Auth).
- **Payment Integration**: Cashfree Payments (Server-side Session Creation + Server-side Verification + Webhooks + Cashfree JS SDK v3 `_modal` checkout flow).
- **Icons & Typography**: `lucide-react`, Google Fonts (*Barlow Condensed*, *IBM Plex Mono*, *Inter*).
- **Hosting & Edge Delivery**: Vercel (Edge CDN).

---

## 3. UI/UX Design System
- **Theme Support**: Dark mode & Light mode via `ThemeContext`.
- **Palette**: Deep Navy (`#1E3A5F`), Amber CTA (`#E8A33D`), Slate Dark (`#0F172A`), Semantic Emerald Green (`#10B981`), Red Expiry Alert (`#EF4444`).
- **Typography Rules**: Numbers, dates, prices in `IBM Plex Mono` for clean tabular alignment; headings in `Barlow Condensed`; body in `Inter`.
- **Accessibility**: Status displayed using both text labels and color badges. Touch targets optimized for 375px+ mobile screens.

---

## 4. Cashfree Subscription Architecture
1. **Server-Side Session Creation**: `POST /api/create-cashfree-session` calls Cashfree Orders/Subscriptions API using `CASHFREE_CLIENT_ID` and `CASHFREE_CLIENT_SECRET`. Credentials never leak to frontend.
2. **Mandate Authorization Overlay**: `cashfree.checkout({ paymentSessionId, redirectTarget: '_modal' })` presents the official Cashfree checkout modal to the user.
3. **Server-Side Verification**: `POST /api/verify-cashfree-session` queries Cashfree API (`/pg/orders/{order_id}`). Supabase plan (`Growth`/`Starter`, `active`) is updated **ONLY** when `order_status === 'PAID'`.
4. **Webhooks**: `POST /api/cashfree-webhook` handles async recurring payment events.

---

## 5. Investigation & Diagnosis Log

### Issue: `/dashboard/billing` Content Blocked in Production
- **User Symptom**: Chrome displays `"This content is blocked. Contact the site owner to fix the issue."` with a sad document icon on `https://www.getownerhq.in/#/dashboard/billing`.
- **Empirical Test Performed**: Executed live HTTP header inspection against Vercel Edge node (`bom1::...`).

#### Live HTTP Header Test Results:
```http
Status: 200
server: Vercel
x-vercel-cache: HIT
age: 564
x-frame-options: DENY
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; img-src 'self' data: https: blob:; connect-src 'self' https: wss:;
```

#### Exact Root Cause Analysis:
1. **Vercel Edge CDN Caching (`x-vercel-cache: HIT`)**:
   - Vercel's Edge CDN cached the old `vercel.json` response headers from earlier deployments.
   - Even after code was pushed to `main`, Vercel served stale cached headers (`age: 564`) with `x-frame-options: DENY` and a restrictive Content Security Policy without `frame-src`.
2. **Browser Enforcement**:
   - Chrome receives `x-frame-options: DENY` from Vercel Edge.
   - Chrome immediately blocks modal frames / page frame rendering and renders the sad document icon error page: `"This content is blocked. Contact the site owner to fix the issue."`.

---

## 6. Resolution Plan & Execution Log
- [x] **Step 1: Backend Endpoints (`/api/*`)**:
  - Implemented [`api/create-cashfree-session.ts`](file:///c:/Users/ASUS/Downloads/omni%20P/antigravity/api/create-cashfree-session.ts), [`api/verify-cashfree-session.ts`](file:///c:/Users/ASUS/Downloads/omni%20P/antigravity/api/verify-cashfree-session.ts), and [`api/cashfree-webhook.ts`](file:///c:/Users/ASUS/Downloads/omni%20P/antigravity/api/cashfree-webhook.ts).
- [x] **Step 2: Vercel API Routing**:
  - Updated [`vercel.json`](file:///c:/Users/ASUS/Downloads/omni%20P/antigravity/vercel.json#L38-L43) rewrites to route `/api/*` to serverless functions.
- [x] **Step 3: Frontend Modal Wiring**:
  - Updated [`BillingPage.tsx`](file:///c:/Users/ASUS/Downloads/omni%20P/antigravity/src/pages/BillingPage.tsx#L50-L115) to require server-verified `PAID` status before activating plans.
- [x] **Step 4: Add CDN Cache Control Header in `vercel.json`**:
  - Added `"Cache-Control": "public, max-age=0, s-maxage=0, must-revalidate"` to [`vercel.json`](file:///c:/Users/ASUS/Downloads/omni%20P/antigravity/vercel.json#L10-L13).
  - Forces Vercel Edge CDN nodes to bypass stale cached HTTP security headers.
- [x] **Step 5: Production Vercel Deployment & Live Verification**:
  - Configured `tsconfig.json` to include `"types": ["vite/client", "node"]` and `"include": ["src", "api"]`.
  - Deployed directly to Vercel production (`npx vercel --prod --yes`).
  - Aliased to `https://www.getownerhq.in` at 14:51:15 GMT.
  - Live Edge Response verified: `Status: 200`, `x-vercel-cache: MISS`, `age: 0`, `X-Frame-Options: SAMEORIGIN`.
  - Automatic Plan Creation Fallback active for `Plan does not exist` on Cashfree Production.

---

## 7. Official WhatsApp Cloud API Engine (Multi-Tenant) — State & Resumption Log

### Current Status as of Sept 11, 2026:
- **Database**: Migration [`supabase/migrations/0008_whatsapp_engine.sql`](file:///c:/Users/ASUS/Downloads/antigravity/supabase/migrations/0008_whatsapp_engine.sql) is **EXECUTED & LIVE** in Supabase production.
  - Tables active: `whatsapp_accounts`, `whatsapp_events`, `whatsapp_messages`, `automation_jobs`.
  - RPC function active: `claim_whatsapp_events_batch(batch_size, worker_id, lease_duration_seconds)`.
  - Row Level Security (RLS) active on all 4 tables via `public.get_auth_gym_id()`.
- **Codebase**: Fully verified, committed (`7f71724`), and pushed to GitHub `origin main`.
- **Automated Verification**:
  - `npm test`: **ALL 24 automated unit & chaos tests passing** (AES-256-GCM, HMAC state, Webhook signature, Fencing tokens, pre-flight claim, cross-tenant isolation).
  - `npm run build`: **0 compilation errors**; Vite production packaging complete.
- **Implemented Architecture**:
  - `api/utils/encryption.ts`: Enterprise AES-256-GCM with random 12-byte IV, 16-byte Auth Tag, fail-closed on missing secret in production.
  - `api/utils/meta.ts`: Centralized Meta Graph API configuration (`META_GRAPH_VERSION = 'v21.0'`).
  - `api/whatsapp-connect.ts`: Secure OAuth initiation with Supabase JWT bearer session verification, gym ownership validation, and HMAC state.
  - `api/whatsapp-callback.ts`: Code exchange for ~60-day Long-Lived User Token, WABA auto-subscription (`/subscribed_apps`), and AES-256-GCM encrypted persistence.
  - `api/whatsapp-webhook.ts`: Zero-loss webhook receiver with HMAC signature verification, multi-tenant phone resolution, deep unrolling, and strict HTTP 500 on DB failure.
  - `api/whatsapp-worker.ts`: Atomic queue processor with 60-second dynamic lease and Optimistic Fencing Token validation (`locked_by` + `lease_until`).
  - `api/whatsapp-reminders.ts`: Scheduled renewal reminder dispatcher with Pre-Flight Claim Pattern, E.164 phone normalization, dual-write to legacy `reminder_logs`, and ambiguous network timeout classification.
  - `src/pages/WhatsAppTemplates.tsx`: Official WhatsApp status card with 1-click connect/reconnect; 100% preservation of manual `wa.me` links.
  - `vercel.json`: Added cron schedules (`*/5 * * * *` for worker, `0 4 * * *` for reminders).

---

### Exact Resumption Point for Tomorrow:
The user is currently on the browser screen:
**`Create a Meta for Developers account` ➔ Step: `About you`**

**Step-by-step resumption checklist:**
1. **Complete Developer Registration**:
   - In the browser tab, select **Developer** or **Owner/founder** and click **Complete Registration**.
2. **Create Meta App**:
   - Go to [developers.facebook.com/apps](https://developers.facebook.com/apps) ➔ Click **Create App**.
   - Type: **Other** ➔ **Business** ➔ Name: `OwnerHQ`.
3. **Copy Credentials**:
   - Navigate to **App settings ➔ Basic**:
     - Copy **App ID** (`META_APP_ID`).
     - Click **Show** to copy **App secret** (`META_APP_SECRET`).
4. **Configure WhatsApp Webhook**:
   - In left sidebar: **WhatsApp ➔ Configuration**.
   - Under **Webhook**, click **Edit**:
     - **Callback URL**: `https://www.getownerhq.in/api/whatsapp-webhook`
     - **Verify token**: (e.g. `ownerhq_whatsapp_webhook_2026`)
     - Click **Verify and Save**.
   - Under **Webhook fields**, click **Manage** ➔ Subscribe to **`messages`**.
5. **Set Vercel Environment Variables**:
   - In Vercel Project Settings ➔ Environment Variables:
     - `ENCRYPTION_SECRET`: (Any 32-character random string for AES-256-GCM)
     - `META_APP_ID`: (From Meta App Basic settings)
     - `META_APP_SECRET`: (From Meta App Basic settings)
     - `META_WEBHOOK_VERIFY_TOKEN`: (Matches the token entered in Meta webhook configuration)
     - `CRON_SECRET`: (Secret string to protect scheduled cron endpoints)
     - `META_GRAPH_VERSION`: `v21.0`
   - In Vercel ➔ Deployments, click **Redeploy** on the latest deployment.
### Verification & Production Canary (Sept 12, 2026):
- **Live Deployment**: `https://www.getownerhq.in` on Vercel (`dpl_4JmKZzcZPEPPeseAVZDq3guQGhrn`).
- **Webhook Handshake**: Verified live with Meta Graph API (`hub.mode=subscribe`, `hub.verify_token`). Subscribed to `messages`, `message_template_status_update`, `phone_number_quality_update`.
- **Canary Connection (Pilot Gym: NAWAAB89 GYM)**:
  - Meta Embedded OAuth completed successfully.
  - Long-lived token acquired and encrypted via AES-256-GCM in Supabase table `whatsapp_accounts`.
  - WABA auto-subscribed to webhooks (`/subscribed_apps`).
  - Status displayed in OwnerHQ Dashboard: **Connected (Active)**.
  - Manual `wa.me` fallback links completely intact and unaffected.
