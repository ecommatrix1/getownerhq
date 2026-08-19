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
