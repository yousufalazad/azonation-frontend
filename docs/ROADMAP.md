# Azonation roadmap

> **Moved on 2026-10-01.** The live roadmap is `azonation-app/docs/ROADMAP.md`
> (`D:/xampp/htdocs/Azonation/azonation-app`). This copy is kept for history and is no longer updated.

The single source of truth for decisions and the build order. Update the status and the
decision log as work lands.

**Repos**

| Repo | What | Where | State |
|---|---|---|---|
| `azonation-frontend` | Current Vue app | `D:\xampp\htdocs\Azonation\azonation\azonation-frontend` | **Frozen** (reference only, no new features) |
| `azonation-backend` | Current Laravel API | `D:\xampp\htdocs\Azonation\azonation\azonation-backend` | **Frozen** (reference only) |
| `azonation-api` | New Laravel API, modular | `D:\xampp\htdocs\Azonation\azonation-api` | To create |
| `azonation-app` | New Vue app, modular | `D:\xampp\htdocs\Azonation\azonation-app` | To create |
| `azonation-site` | Marketing site (Nuxt) | `D:\xampp\htdocs\Azonation\azonation-site` | After the app foundation |

This roadmap moves to `azonation-app/docs/ROADMAP.md` when that repo exists.

Status keys: `todo` · `doing` · `done` · `later`

---

## 1. Product

Azonation is a global SaaS for running organisations (clubs, societies, associations,
alumni groups, charities, professional bodies). UK is the origin and headquarters; every
other country is an operating area. Prices are set per region.

Users are often non-technical volunteers on phones: plain words, big tap targets, one main
action per screen, light and dark mode, **10 languages** (§2a).
Design system: **Azonation Calm** (see each repo's CLAUDE.md).

---

## 2. Architecture decisions

| Decision | Choice | Why |
|---|---|---|
| Shape | **Modular monolith** (one Laravel app + one Vue app, split into modules). Not microservices. | One developer, pre-launch. Microservices multiply servers and failure cases; a module can still be moved out later. |
| Backend modules | `nwidart/laravel-modules`, one folder per module (routes, controllers, models, migrations, config, tests) | Standard, keeps each module self-contained |
| Frontend modules | `src/modules/<name>/` (pages, routes, i18n, components), loaded only if the organisation has the module | Smaller downloads, clear ownership |
| Module rule | A module never reads or writes another module's tables. It uses the other module's service class or Laravel events. | Makes switching modules off safe |
| Switching | **Entitlements**: per organisation, per module: on/off + limits + source (plan / add-on / trial / manual). Plus a platform-wide switch per module. Checked on every server route and in the menu. Data is kept when off. | Sell modules, trials, emergency off switch |
| Stored procedures | **Not used.** Logic stays in Laravel. Use constraints, indexes, transactions, views or summary tables when needed. | Keeps tenant checks, modules and notifications in one place |
| Frameworks | **New projects** on the latest Laravel (13, PHP 8.3+), Vue 3.5.x, Vite, Tailwind 4 — no in-place upgrade | Pre-launch, demo data only |
| Move strategy | Features are **moved and adapted** module by module from the frozen repos, not rewritten. Code may be improved or modernised while moving (owner's approval, 2026-10-01) as long as every feature and security rule is kept. Database tidied as each module moves (true booleans, consistent names such as `org_id`). Only reference data is seeded; demo data is not moved. | Keeps the security fixes and the Azonation Calm redesign |
| **Parity rule** | Every current feature must exist in the new projects. A **feature inventory** (every page, API route, permission, schedule, email/notification, setting) is written first and ticked per module, with its security checks, 10 languages, dark mode and phone layout. Old repos are retired only when every item is ticked. | Owner: "don't miss my current features" |
| Authentication | **Sanctum session cookies** for the browser app (HttpOnly cookie, CSRF, instant logout/access removal). Later: Sanctum tokens for native phone apps; short-lived **signed JWT (RS256)** issued by Laravel for service-to-service calls if microservices are added; Laravel Passport (OAuth2) or scoped tokens for a public API (top-plan "API access"). Identity lives in its own core part (Accounts & Access). | Most secure for browsers; JWT/OAuth can be added alongside later |
| Sign-in methods | Email + password, **Google, Microsoft (personal + work/school), Apple** from the start (Socialite + socialiteproviders). Link a provider to an existing account only when the provider confirms the email. Several methods per person, managed in Security. Apple: save the name on first sign-in; allow "Hide My Email" addresses. | Owner has Apple Developer Program and owns azonation.com |

### 2a. Languages (from the start)

English (source), Bangla, Arabic, Urdu, Hindi, Spanish, French, Portuguese, German, Italian.

- Arabic and Urdu are **right to left**: layouts use start/end (not left/right), icons and arrows mirror.
- Fonts: Noto Sans, Noto Sans Bengali, Noto Sans Arabic, Noto Nastaliq Urdu (taller lines), Noto Sans Devanagari.
- Missing translation falls back to English. Translation files per module per language.
- AI drafts translations; native speakers review key screens (sign-up, billing, membership, emails) before launch in a country.
- Person's app language and the **organisation's language** (emails, newsletters, certificates) are separate.
- German words are long: buttons and labels must wrap.

### 2b. Domains and addresses

| Address | Use |
|---|---|
| `azonation.com` | Marketing site (`azonation-site`, Nuxt, pre-built pages in all 10 languages: `azonation.com/bn/…`) |
| `app.azonation.com` | The app (`azonation-app`) |
| `api.azonation.com` | The API (`azonation-api`); same parent domain as the app so Sanctum cookies work |
| `org-name.azonation.org` | Organisation websites (Web module); own domain as a paid option |
| `files.azonation.net` | Uploaded files (kept off the main domain for security) |
| `mail.azonation.net` | Email sending domain (protects azonation.com's reputation) |
| Later | `status.azonation.com`, `staging-app.azonation.com` |

### 2c. Marketing site (azonation-site)

Landing page: headline + Start free / See pricing → who it's for → what it does (by job) →
3 steps → trust (data belongs to the organisation, privacy, UK company, GDPR, payments go
straight to the organisation) → 10 languages → pricing teaser (local currency) → stories →
FAQ → Start free. Other pages: one page per feature/module, solutions by organisation type,
Pricing, For members, About, Contact, Help, Blog, Legal. Shares Azonation Calm colours and fonts.

---

## 3. Modules

### Core (always on, every plan)

| # | Part | Includes |
|---|---|---|
| 1 | Accounts & Access | Sign-in, sign-up, Google login, roles & permissions, language, theme |
| 2 | Organisation | Profile, logo, administrator, founders, history, recognition, success stories |
| 3 | Member area | Member home, my organisations, profile, My family (member-owned, private by default) |
| 4 | Membership | Members, unlinked/former, membership types, renewals, "paid until", shared family numbers; **online membership application** (organisation's own join fields, photo/documents, approve/reject → creates the member and, with Collections, the fee request); **basic digital membership card** (photo, number, type, valid until, QR code to verify; card designs in higher plans, printed cards via Shop) |
| 5 | Committees | Committees, members, role titles; **committee handover** after an election (access passes to new officers, old officers' access ends, handover checklist) |
| 6 | Meetings | Meetings, attendance, guests, minutes |
| 7 | Documents | Office documents (limited by storage) |
| 8 | Notifications | In-app, email, reminders; **email to members** (all, a membership type, a committee, fees overdue, chosen people), replies to the organisation, send history, **monthly email allowance per plan** (extra packs as add-on); **noticeboard** (one-way announcements in the member area, no comments) |
| 9 | Reports (basic) | Summary reports; advanced reports in higher plans |
| 10 | Support (basic) | Help centre, tickets, contact. Priority support = flag on the top plan |
| 11 | Billing | Plans (bands), regional prices, entitlements, add-ons, invoices, receipts, storage limits, referral credits |
| 12 | Super Admin | Platform settings, customers, billing admin, support inbox, roles, module switches |
| 13 | Tasks | Action points from minutes become tasks with a person and due date; automatic reminders |
| 14 | Calendar | One calendar of meetings, events, deadlines, renewals; add to Google/Outlook (iCal) |
| 15 | Audit log & data tools | Who changed what and when; member data export and deletion requests (UK GDPR) |

### Optional modules (per organisation; in a plan or bought as an add-on)

| # | Module | Summary | Charging |
|---|---|---|---|
| 1 | Finance | Organisation's books: funds, income, expenses, reports (exists as Fund management) | Included from middle plan |
| 2 | Collections | Members pay fees, tickets, donations online **straight into the organisation's own account** | Add-on, or small fee per payment |
| 3 | Events | Events, attendance, guests, reports, family headcount (exists) | In plans |
| 4 | Projects | Projects, participants, guests, reports (exists) | In plans |
| 5 | Assets | Equipment, holder, handover history (exists) | In plans |
| 6 | Planning | Strategic plans, year plans (exists) | Included from middle plan, not sold alone |
| 7 | Voting | Polls, motions, elections (secret ballot, eligibility, proxy, tamper-proof results) | Polls included; elections per election by voter band |
| 8 | Web | Public site at `org-name.azonation.org` from public data; own domain (CNAME + auto SSL) | Basic free with badge; own domain + no badge paid |
| 9 | Secretarial — automation | Automatic announcements, reminders, fee chasing | Monthly add-on |
| 10 | Secretarial — human service | In person / virtual assistant under written authorisation, action log | Packages or hours (later) |
| 11 | Directory | Member directory + business/professional directory (see §6) | Included from middle plan |
| 12 | Ideas board | Anyone posts community project/event ideas with impact and budget; organisations adopt them into Projects | Free |
| 13 | Community (small) | Public organisation pages, **organisation directory**, follow an organisation, public event listing. **No social feed.** | Free |
| 14 | Newsletters | Designed issues with the organisation's logo, sections, content pulled from Azonation (events, projects, new members), schedule, drafts, test send, non-member subscribers with sign-up form, open/click counts, public archive (can show on Web) | Included from middle/top plan or add-on; uses the email allowance |
| 15 | Forms & surveys | Build a form (sign-ups, feedback, RSVP, applications), share a link, see answers as a table or chart | In plans or add-on |
| 16 | Certificates | Automatic PDF certificates (membership, event participation, volunteering, appreciation) with a QR code to verify | In plans; can come with Events/Projects |
| 17 | Approvals & e-signatures | Committee members approve or sign minutes, resolutions, expense claims in the app; record of who signed and when | In higher plans or add-on |

### Azonation's own

| Module | Summary |
|---|---|
| Shop | Only Azonation (Super Admin) sells digital or physical products (ID cards, badges, certificates, templates), paid into Azonation's account. Existing shop to be reshaped. |

### Platform features (not modules)

**Phone app (PWA):** install Azonation on a phone like an app, push notifications, faster loading.

### Later ideas (not scheduled yet)

| Idea | Fits in |
|---|---|
| QR check-in at meetings and events (attendance marks itself) | Meetings / Events |
| Event tickets with QR codes | Events + Collections |
| Expense claims (photo of receipt → treasurer approves → Finance records) | Finance |
| Donor and fundraising (donor records, receipts, campaigns, UK Gift Aid) | New module: Fundraising |
| Volunteering (shifts, sign-ups, hours → Certificates) | New module (with Projects, Ideas) |
| Room and equipment booking | Assets |
| Branches and chapters (national organisation with district branches) | New module, large organisations |
| Birthday and anniversary greetings | Secretarial automation |
| Integrations: Zoom/Meet links, Xero/QuickBooks export, calendar sync, API for top plans | Platform |
| AI helper (draft minutes, summarise, translate English ↔ Bangla, answer members' questions) | New paid module, AI credits |

Keep optional modules to about 18: fold small features into existing modules rather than adding more.

### Shared building blocks (never sold)

Payments layer (gateways) · Entitlements · Storage service · Email sending service (provider such as Amazon SES / Postmark / Mailgun, allowance counting, bounce and complaint tracking) · Azonation Calm components · translations.

### Add-ons (not modules)

Extra email packs · sending from the organisation's own domain (SPF/DKIM; pairs with Web own domain) · later **SMS / WhatsApp message credits** (used by email-to-members, Newsletters and Secretarial reminders).

### One-off service

Setup and data import (e.g. member list from Excel), fixed price, any plan.

---

## 4. Money: three flows

| Flow | Who pays whom | Where |
|---|---|---|
| **Billing** | Organisation → Azonation (plans, add-ons) | Core, Super Admin |
| **Collections** | Member → the **organisation's own account** (fees, tickets, donations) | Optional module |
| **Finance** | No money moves: the organisation's records (cash, bank, online) | Optional module |

Payments layer = gateway code shared by all three (Azonation's merchant account for Billing
and Shop; the organisation's own connected account for Collections).

**Rules (decided):**
- Azonation **never holds or passes on** organisations' money. Otherwise UK Payment Services
  Regulations / FCA authorisation apply.
- Stripe Connect: **Standard or Express accounts with direct charges** (organisation is
  merchant of record; Stripe does KYC). Application fee for Azonation if charged. Avoid
  destination charges.
- Where Stripe Connect is unavailable (e.g. Bangladesh): **bring your own gateway**
  (SSLCommerz, bKash, Nagad merchant account in the organisation's name).
- Hosted checkout only (PCI SAQ A). Terms: member's payment is between member and
  organisation; refunds, disputes, tax, charity law, Gift Aid are the organisation's.
- Get this confirmed by a UK payments/fintech solicitor and an accountant (VAT) before launch.

---

## 5. Pricing (decided)

- **Packages are member bands.** Each package has a **member limit** (`management_packages.max_member`)
  and a **fixed monthly price per region**. Billing stays **monthly**.
- **No daily member counting** for price. (Old per-member-per-day rates and daily count tables
  are retired; old records kept.)
- Free package = **price 0**, never invoices. Current prices in the DB are demo data.
- Counted towards the limit: **active members, linked and unlinked**. Not former/terminated,
  never family.
- At 90%: warning. At the limit: adding new members pauses with an Upgrade button. Existing
  members are never removed. Super Admin can allow a temporary exception.
- Upgrade: immediate, that month charged pro rata at the higher price. Downgrade: from next
  month, only if members fit.
- Later: annual payment with discount; charity/non-profit discount.
- Before launch: work out cost per organisation per month (email/SMS, servers, payment fees,
  support) and set band prices above it.
- Real prices per region are entered by the owner in Super Admin → Plans.

---

## 6. Directory module (decided: all three types)

1. **Member directory** (inside an organisation): name, photo, membership type, committee
   role, plus contact fields each member chooses to show.
2. **Business / professional directory**: members list their business or profession;
   searchable by members, or public if the organisation allows.
3. **Organisation directory** (public, part of Community, free): find organisations by
   country, city, type, interest.

Privacy rules: nothing shown by default except name and photo; member chooses field by
field; member can hide completely; same-organisation members only (unless a business
directory is made public); **no bulk export by members**; former members disappear at once.

---

## 7. Email rules (decided)

- Newsletters always carry an unsubscribe link (UK PECR/GDPR and similar laws). Service messages
  (meeting notices, fee reminders) follow the member's notification settings, separate from newsletters.
- Non-member subscribers need clear consent: tick box + confirmation email. No uploading lists of
  people who never agreed.
- Default sender: Azonation's sending domain on behalf of the organisation ("Dhaka Alumni via
  Azonation"), reply-to the organisation. Own-domain sending is a paid add-on.
- Track bounces and spam complaints; Super Admin can pause an organisation's sending.

---

## 8. Build order

| # | Step | Status |
|---|---|---|
| 0 | Redesign (Azonation Calm), security fixes, member families, migrations synced with DB | done |
| 1 | Write roadmap + CLAUDE.md + handoff notes | done |
| 2 | **Feature inventory** of the current apps (parity checklist: pages, routes, permissions, schedules, emails, settings), grouped by target module — `docs/FEATURE-INVENTORY.md` | done |
| 3 | **Create `azonation-api` + `azonation-app`**: latest Laravel/Vue/Vite/Tailwind 4, `nwidart/laravel-modules`, `src/modules`, Sanctum, permissions, 10-language i18n with RTL, Azonation Calm components copied, CLAUDE.md, tests, seeders for reference data | todo |
| 4 | **Foundation**: Accounts & Access (email, Google, Microsoft, Apple), organisations, current-organisation security, entitlements + module switches (Super Admin → Modules, per organisation), audit log, Super Admin basics | todo |
| 5 | **Move core parts** (tick the inventory): Membership → Committees → Meetings → Documents → Notifications → **Billing with band pricing + member limits** → Support → Member area (incl. My family) → Reports | todo |
| 5a | **Move existing modules**: Finance, Events (incl. family headcount), Projects, Assets, Planning | todo |
| 5b | **Switch over**: full workflow test as organisation, member, Super Admin; inventory fully ticked; old repos archived | todo |
| 5c | `azonation-site` marketing site (Nuxt) | todo |
| 6 | Web module | todo |
| 7 | Voting module | todo |
| 8 | Directory module (member + business) and organisation directory in Community | todo |
| 8a | Email to members (core) with allowance + sending service; then Newsletters module | todo |
| 8b | Core additions: online membership application, basic digital card, tasks, calendar, committee handover, noticeboard, audit log & data tools | todo |
| 8c | Phone app (PWA) with push notifications | todo |
| 8d | Forms & surveys, Certificates, Approvals & e-signatures modules | todo |
| 9 | Secretarial automation | todo |
| 10 | Collections (Stripe Connect + bring-your-own-gateway) — after legal check | todo |
| 11 | Ideas board | todo |
| 12 | Community (small) | todo |
| 13 | Shop reshaped (Azonation-only) | todo |
| 14 | Secretarial human service | later |

Deployment checklist (before first launch, now for the new repos): `php artisan migrate`; cron
`* * * * * php artisan schedule:run`; `APP_DEBUG=false`; change mail password; delete local
test accounts; limit the app's DB user to data rights only; seed reference data (countries,
plans, renewal cycles…) — seeders or data export still to be set up.

---

## 9. Decision log

| Date | Decision |
|---|---|
| 2026-09-29 | Azonation Calm design, dark mode, English + Bangla |
| 2026-09-30 | Role-holders manage their organisation from the organisation dashboard |
| 2026-09-30 | Shop kept as is until reshaped; later Azonation-only |
| 2026-09-30 | Family information belongs to the member; private by default; shared per organisation as numbers (default) or details; event headcount |
| 2026-09-30 | Modular monolith, not microservices |
| 2026-09-30 | Azonation never holds organisations' money (direct to organisation) |
| 2026-09-30 | Community starts small, no social feed |
| 2026-09-30 | Meetings and Documents in core; Events, Projects, Assets, Planning as modules; priority support = top-plan flag |
| 2026-09-30 | Pricing = member bands, regional monthly prices, no daily counting |
| 2026-09-30 | No stored procedures |
| 2026-09-30 | Directory module: member + business directory; organisation directory in Community |
| 2026-09-30 | Email to members = core feature with monthly allowance; Newsletters = optional module; SMS/WhatsApp later as credits |
| 2026-10-01 | New repos `azonation-api` + `azonation-app` (+ `azonation-site` later) in `D:\xampp\htdocs\Azonation\`; old repos frozen; move module by module with a feature-inventory parity checklist; DB tidied per module |
| 2026-10-01 | Auth: Sanctum session cookies; JWT for services and Passport/tokens for public API later. Sign-in: email, Google, Microsoft, Apple from the start |
| 2026-10-01 | 10 languages from the start (en, bn, ar, ur, hi, es, fr, pt, de, it), RTL included |
| 2026-10-01 | Domains: azonation.com (site, app., api.), azonation.org (organisation websites), azonation.net (files, mail) |
| 2026-10-01 | Paperless additions: core (membership application, digital card, tasks, calendar, committee handover, noticeboard, audit log), modules (Forms & surveys, Certificates, Approvals & e-signatures), PWA; later-ideas list kept |
