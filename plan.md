# BribedIndia — Project Plan

## 1. Vision

BribedIndia is an **open transparency platform** that crowd-sources anonymous, structured reports of bribery and institutional misconduct, visualizes them on a national map, and turns millions of individual experiences into verifiable patterns — so a single citizen's story becomes evidence of a system.

**Core promise (from the tagline):** *"No account. No name. No trace. Just the facts — department, amount, what happened. That's enough to change things."*

The platform never claims to prove guilt. It collects, clusters, and surfaces *patterns*. Its credibility comes from a conservative, human-in-the-loop verification model: anonymity is absolute, automation only flags, and only a human admin can confirm a pattern as real. The design language is intentionally "editorial of record" — a trust-first aesthetic of serif headline, monochrome data, and restraint, borrowed from newspapers and transparency watchdogs rather than consumer product UI.

## 2. Non-Negotiable Product Principles

1. **Anonymity is structural** — no citizen accounts, no identity capture, no IP-based features, no uploads that could be traced.
2. **The platform never "proves" corruption** — public labels are *Unverified* / *Pending Review* / *Verified* (a neutral scale), never "guilty" or "confirmed." **Verified means a human admin confirmed a credible pattern, not that an individual allegation or person has been proven guilty.** This clarification is stated explicitly in the public UI/methodology text (landing "How It Works", case study, and a small methodology note) and in the admin panel.
3. **A pattern, not a person** — data aggregates at the department+state+service level; no named individuals, no real ongoing cases.
4. **Automation flags, humans confirm** — the only path to Verified is manual admin action.

## 3. Tech Stack (fixed, not substitutable)

| Layer | Technology | Role |
|---|---|---|
| SPA | React + Vite | App shell |
| Styling | Tailwind CSS | Design token system |
| Charts (map) | amCharts 5 + `am5geodata_indiaHigh` | India choropleth |
| Charts (analytics) | Recharts | Line + bar charts |
| Routing | react-router-dom | Page routing |
| Icons | lucide-react (thin-line only) | Icons |
| Backend | Supabase Postgres | Data store |
| Auth | Supabase Auth | Admin login ONLY |

Public users never authenticate. Supabase Auth exists solely to protect `/admin`.

## 4. Design System (applies to every page)

- **Background** `#F5F3EF` (warm off-white) — never pure white.
- **Primary text** `#1A1A1A` (near-black) — never pure black.
- **Accent** `#F2C94C` (mustard) — **only** for status tags, highlighted table tabs/cells, small callout backgrounds. Never a large fill or button background.
- **Borders** `#E0DED8`, 1px hairlines. **No shadows. No rounded cards.**
- **Primary CTA** solid `#1A1A1A`, white text, sharp corners, uppercase — e.g. `REPORT A BRIBE`.
- **Headlines/section titles** — Playfair Display (serif). **Body/table/form/nav** — Inter (grotesque).
- **Tables** — no row shading, 1px hairline dividers, numbers right-aligned, headers in small uppercase letter-spaced Inter.
- **Corners** — sharp everywhere (no `border-radius` on buttons, inputs, tags, cards). Strict.
- **Nav bar** — *BribedIndia* wordmark top-left in serif italic; links `REPORTS · DEPARTMENTS · DISTRICTS · COMPARE` in uppercase Inter; `REPORT A BRIBE` black button top-right; sticky on every page.

## 5. Data Model (Supabase Postgres)

**`reports`**

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | default `gen_random_uuid()` |
| report_type | text | check in (`paid_bribe`,`refused_to_pay`) |
| department_code | text | 9 fixed codes |
| department_other | text nullable | for code `T` |
| state | text | 28 states + 8 UTs |
| district | text | free text |
| service | text | |
| approx_month | int | |
| approx_year | int | |
| bribe_amount | numeric nullable | |
| description | text | |
| has_evidence | boolean | default false |
| status | text | check in (`unverified`,`pending_review`,`verified`) default `unverified` |
| created_at | timestamptz | default now() |

**`admin_users`** — use Supabase Auth's built-in users table (do not create a custom one). Seed one admin: `admin@bribedindia.demo` / `Demo@1234`.

### Fixed reference data (exactly these)
- **9 Departments:** Police (P), Municipal Corporation (MC), Revenue/Land Records (RV), RTO (R), Passport Office (PC), Income Tax (IT), Food & Drug Administration (F&D), Electricity Board (EB), Other/Not listed (T → reveals free-text `department_other`).
- **Report types (2):** "I paid a bribe" (default) / "I refused to pay".
- **States:** all 28 + 8 UTs (district is free text for MVP).

## 6. Credibility Rule (exact logic)

- Every report starts `unverified`.
- A scheduled/triggered function: when **≥3 reports share the same `department_code + state + normalized service` within a clearly defined **90-day rolling window**, set *all* matching reports → `pending_review`. "Normalized service" means the `service` free-text is lowercased and trimmed before clustering so near-duplicate entries ("Driving licence renewal" vs "driving license renewal") cluster together.
- `pending_review` → `verified` **only** via manual admin action ("Mark Cluster as Verified").
- No automatic path to verified. Public UI never implies "proven."
- **Verification wording (public + admin):** Verified means a human admin confirmed a credible pattern of reports — it is *not* confirmation that any individual allegation or person is guilty. This sentence appears on the landing page methodology/How-It-Works, the case-study page, and the admin panel.

## 6b. Anti-Spam (server-side, MVP)

- A **basic server-side submission rate limit / throttle** guards the public report form (e.g. per-IP or per-session cooldown — no more than N submissions per time window, with a friendly "too many submissions" response).
- This is deliberately simple: no CAPTCHA, no sophisticated anti-abuse, no distributed tracking. It exists to blunt trivial spam, not to be a hardened abuse system.

## 7. Seed Data Strategy (before demo, never empty)

Insert **507+ reports**, distributed to look organic, not even:
- Status split: **419 verified, 67 unverified, remainder pending_review.**
- Dominant departments (heavily weighted): **Police, RTO, Municipal Corporation, Revenue/Land Records**.
- Spread across states/districts with realistic skew; `approx_month/year` spread over the last ~3 years.

## 8. Pages (build order)

### Tier 1
- **`/` Landing + Map** — sticky nav; hero `TRANSPARENCY MAP`; subheading; full India choropleth shaded single-hue `#F5F3EF`→`#1A1A1A`; gradient legend "Fewer → More reports" + number range; on click → active state scales ~1.05 + info panel (state name serif, 3 stat blocks Total/Pending/Verified, Latest Reports list of 5 with dept icon, amount, relative date, status tag colors); "How It Works" dual 3-step strips (Filing / Verification); stat strip (total reports, states, departments); `REPORT A BRIBE` in nav + large at bottom.
- **`/report` Wizard** — 3 steps, numbered circle progress (1-2-3, filled/outlined). Step 1: toggle cards + 9 department grid (+ free-text when Other) + Next disabled until both chosen. Step 2: state dropdown, district text, service text, month+year dropdowns, bribe amount, description. Step 3: summary with per-field Edit links → Submit → full-page confirmation.

### Tier 2
- **`/departments`** — ledger table (Rank, Department, Reports, Avg Bribe, Most Common), sort tabs (Most Reports / Highest Bribes), row → detail (trend line chart + top-3 states).
- **`/districts`** — same pattern grouped by district (Rank, District, State, Reports, Avg Bribe). Named "Districts" (not "Cities") because district is currently free-text and the data is not normalized enough to accurately represent cities.
- **`/compare`** — compare-states/departments toggle, two selectors, side-by-side stat blocks (Total, Avg Bribe, Refusal Success %), Recharts bar comparison.
- **Analytics** (`/analytics`) — reports/month line (last 6 mo), top-5 departments horizontal bars.
- **`/case-studies`** — one hardcoded long-form editorial, sections: What Happened → Where It Occurred → The Pattern Identified → What Followed. Fictional (e.g. RTO license renewals in a city). No real named individuals / ongoing cases.
- **`/admin`** — build LAST, keep minimal. `/admin/login` (email+password → Supabase Auth). `/admin/dashboard` (protected) — table of `pending_review` reports grouped by department+state cluster, one "Mark Cluster as Verified" button per cluster. Basic clean UI, not tied to editorial design.

## 9. Out of Scope (explicitly NOT built)

- Citizen user accounts, evidence file upload/storage, email notifications, real anonymity infrastructure, multi-language support, anonymous receipt-code lookup, integration with real government systems, and *sophisticated* anti-abuse (CAPTCHA, distributed rate-limiting, bot farms). A basic server-side rate limit/throttle IS in scope (see §6b). Stub or skip everything else.

## 10. Limitations & Risks

**Product/Data**
- **Self-selection bias** — reports come from people with access & willingness; not a representative corruption census.
- **No ground truth** — reports are unverified claims; even "Verified" only means an admin confirmed a *pattern*, not that any individual is guilty. Defamation risk is real, hence anonymized aggregation.
- **District is free-text** → inconsistency ("Mumbai" vs "Mumbai Suburban") weakens district-level analytics; this is why the page is named `/districts` and presented as un-normalized data.
- **Anti-spam is basic by design** — a server-side throttle blunts trivial spam, but a coordinated campaign could still inflate counts; mitigated partially by the manual verification gate.
- **Single hardcoded case study** — no CMS; content is static.
- **Verification depends on a human admin** — if the admin doesn't act, pending clusters stagnate; no SLA.

**Technical**
- **amCharts 5 + India geodata** — clean rendering and the ~1.05 active-scale effect require careful event wiring; licensing (amCharts is commercial) must be confirmed; map labels/data for small UTs can clutter.
- **Admin-only Supabase Auth** — public visitors read via anonymous PostgreSQL access (requires properly scoped RLS policies: public read, no write; admin write via backend).
- **Rolling-window cluster trigger** — Postgres scheduled/trigger logic must be deterministic and testable; the 90-day window and the `department_code + state + normalized service` key must be explicit to avoid flapping statuses.
- **Recharts + Tailwind hand-styling** — no design-system component lib; all charts must be manually theme-matched to the editorial tokens (avoid default palettes).
- **Seed realism** — "look real, not even" is subjective; over-smoothing reads as fake.
- **Zero custom backend edge-cases** — only a basic rate-limit/throttle on submissions; no CAPTCHA, no distributed abuse protection → the deployed prototype is demo-grade, not hardened production. Real-world launch would require far more.

## 11. Suggested Build Order

1. Scaffold Vite + Tailwind + design tokens & fonts; sticky nav shell.
2. Supabase schema, RLS, admin auth, seed script (507+).
3. Landing/map page (amCharts) + credibility trigger.
4. Report wizard + insert flow (with server-side rate limit).
5. Departments, Districts, Compare, Analytics (Recharts).
6. Case studies.
7. Admin login + verification dashboard.
8. Polish tokens/consistency pass; manual QA of all pages.
