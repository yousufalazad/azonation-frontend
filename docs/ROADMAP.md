# Azonation roadmap

The single source of truth for decisions and the build order. Both repos use it
(frontend: `azonation-frontend`, backend: `azonation-backend`, side by side in
`D:\xampp\htdocs\Azonation\azonation`). Update the status and the decision log as work lands.

Status keys: `todo` · `doing` · `done` · `later`

---

## 1. Product

Azonation is a global SaaS for running organisations (clubs, societies, associations,
alumni groups, charities, professional bodies). UK is the origin and headquarters; every
other country is an operating area. Prices are set per region.

Users are often non-technical volunteers on phones: plain words, big tap targets, one main
action per screen, English and Bangla (more languages later), light and dark mode.
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
| Frameworks | Upgrade to latest Laravel (13, needs PHP 8.3+), Vue 3.5.x, Vite, Tailwind 4 **before** the restructure | Cheapest now, pre-launch |

---

## 3. Modules

### Core (always on, every plan)

| # | Part | Includes |
|---|---|---|
| 1 | Accounts & Access | Sign-in, sign-up, Google login, roles & permissions, language, theme |
| 2 | Organisation | Profile, logo, administrator, founders, history, recognition, success stories |
| 3 | Member area | Member home, my organisations, profile, My family (member-owned, private by default) |
| 4 | Membership | Members, unlinked/former, membership types, renewals, "paid until", shared family numbers |
| 5 | Committees | Committees, members, role titles |
| 6 | Meetings | Meetings, attendance, guests, minutes |
| 7 | Documents | Office documents (limited by storage) |
| 8 | Notifications | In-app, email, reminders; **email to members** (all, a membership type, a committee, fees overdue, chosen people), replies to the organisation, send history, **monthly email allowance per plan** (extra packs as add-on) |
| 9 | Reports (basic) | Summary reports; advanced reports in higher plans |
| 10 | Support (basic) | Help centre, tickets, contact. Priority support = flag on the top plan |
| 11 | Billing | Plans (bands), regional prices, entitlements, add-ons, invoices, receipts, storage limits, referral credits |
| 12 | Super Admin | Platform settings, customers, billing admin, support inbox, roles, module switches |

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
| 8 | Web | Public site at azonation.com/web/org-name from public data; own domain (CNAME + auto SSL) | Basic free with badge; own domain + no badge paid |
| 9 | Secretarial — automation | Automatic announcements, reminders, fee chasing | Monthly add-on |
| 10 | Secretarial — human service | In person / virtual assistant under written authorisation, action log | Packages or hours (later) |
| 11 | Directory | Member directory + business/professional directory (see §6) | Included from middle plan |
| 12 | Ideas board | Anyone posts community project/event ideas with impact and budget; organisations adopt them into Projects | Free |
| 13 | Community (small) | Public organisation pages, **organisation directory**, follow an organisation, public event listing. **No social feed.** | Free |
| 14 | Newsletters | Designed issues with the organisation's logo, sections, content pulled from Azonation (events, projects, new members), schedule, drafts, test send, non-member subscribers with sign-up form, open/click counts, public archive (can show on Web) | Included from middle/top plan or add-on; uses the email allowance |

### Azonation's own

| Module | Summary |
|---|---|
| Shop | Only Azonation (Super Admin) sells digital or physical products (ID cards, badges, certificates, templates), paid into Azonation's account. Existing shop to be reshaped. |

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
| 2 | **Band billing + member limits** on current code (monthly price per package per region, limit checks, Billing page, Super Admin plans, Pricing page) | todo |
| 3 | **Module switches** on current code: Super Admin → Modules (platform), Organisation → Modules (per org), entitlement checks in routes and menu, audit log | todo |
| 4 | Upgrade Laravel, PHP, Vue, Vite, Tailwind; full test pass | todo |
| 5 | Restructure into modules (backend `nwidart/laravel-modules`, frontend `src/modules`) | todo |
| 6 | Web module | todo |
| 7 | Voting module | todo |
| 8 | Directory module (member + business) and organisation directory in Community | todo |
| 8a | Email to members (core) with allowance + sending service; then Newsletters module | todo |
| 9 | Secretarial automation | todo |
| 10 | Collections (Stripe Connect + bring-your-own-gateway) — after legal check | todo |
| 11 | Ideas board | todo |
| 12 | Community (small) | todo |
| 13 | Shop reshaped (Azonation-only) | todo |
| 14 | Secretarial human service | later |

Deployment checklist (before first launch): merge `phase-0-security` (frontend) and
`security/tenant-authorization` (backend); `php artisan migrate`; cron
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
