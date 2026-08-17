# PROJECT MEMORY & KNOWLEDGE LOG — getOwnerHQ

## 1. Project Goal & Overview
- **Application Name**: `getOwnerHQ` (`getownerhq.in`)
- **Target Audience**: Gym Owners in India (managing signups, expiry tracking, WhatsApp reminders, billing).
- **Architecture**: Multi-tenant SaaS Cloud Web App (React + Vite + Supabase + Vercel). Mobile-first responsive design.

---

## 2. Tech Stack & Standards
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS.
- **Backend / Database / Auth**: Supabase (PostgreSQL with Row Level Security, Supabase Auth).
- **Payment Integration**: Cashfree Payments (Cashfree JS SDK v3 with `_modal` checkout flow).
- **Icons & Typography**: `lucide-react`, Google Fonts (*Barlow Condensed*, *IBM Plex Mono*, *Inter*).
- **Hosting & Edge Delivery**: Vercel (Edge CDN).

---

## 3. UI/UX Design System
- **Theme Support**: Dark mode & Light mode via `ThemeContext`.
- **Palette**: Deep Navy (`#1E3A5F`), Amber CTA (`#E8A33D`), Slate Dark (`#0F172A`), Semantic Emerald Green (`#10B981`), Red Expiry Alert (`#EF4444`).
- **Typography Rules**: Numbers, dates, prices in `IBM Plex Mono` for clean tabular alignment; headings in `Barlow Condensed`; body in `Inter`.
- **Accessibility**: Status displayed using both text labels and color badges. Touch targets optimized for 375px+ mobile screens.

---

## 4. Investigation & Diagnosis Log

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

## 5. Resolution Plan & Execution Log
- [x] **Step 1: Add CDN Cache Control Header in `vercel.json`**:
  - Added `"Cache-Control": "public, max-age=0, s-maxage=0, must-revalidate"` to [`vercel.json`](file:///c:/Users/ASUS/Downloads/omni%20P/antigravity/vercel.json#L10-L13).
  - Forces Vercel Edge CDN nodes to bypass stale cached HTTP security headers and serve updated `X-Frame-Options: SAMEORIGIN` and CSP with `frame-src`.
- [ ] **Step 2: Push to Git / Deploy to Vercel**:
  - Push commit to GitHub (`git add . && git commit -m "..." && git push origin main`).
- [ ] **Step 3: Verify Live Edge CDN Headers**:
  - Re-run HTTP live header test script to verify `X-Frame-Options: SAMEORIGIN` and `frame-src` are returned by live CDN.
