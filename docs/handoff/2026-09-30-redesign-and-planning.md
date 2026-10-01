# 2026-09-30 — Redesign finished, upgrade planned

## Done
- Whole app (except the shop) rebuilt in Azonation Calm, dark mode, English + Bangla.
- Sign-in pages, public pages, Pricing (real plans), My family / Member families, family
  headcount on events, members see "fee paid until".
- Workflow test as organisation, member and Super Admin; fixes committed.
- Backend: backup copies removed; migrations synced with the live DB (fresh install works);
  role/permission `org_type_user_id` default 1 removed.
- Both branches pushed: frontend `phase-0-security`, backend `security/tenant-authorization`.
  Pull requests not created yet (owner does it on GitHub).
- Roadmap, CLAUDE.md files and this handoff folder written.

## Half-finished
- Nothing in progress.

## Next step
- Roadmap step 2: **band billing + member limits**.
  - `management_pricings`: monthly price per package per region (replace per-member-per-day).
  - BillingService: one monthly line per package + add-ons; retire daily member count job.
  - Member limit check when adding members (linked, unlinked, rejoin); 90% warning; upgrade
    button; Super Admin temporary exception.
  - Organisation Billing page (package, "92 of 100 members", price, change package);
    Super Admin → Plans (limits + monthly prices per region); Pricing page shows monthly prices.
  - Upgrade immediate + pro rata for that month; downgrade from next month if members fit.
  - Current prices are demo data (Free = 0).

## Open questions for the owner
- Real monthly prices per package per region (BD, UK first). Placeholders until then.
- Pull requests to create and merge on GitHub.

## Notes / gotchas found
- Browser pane screenshots are sometimes stale; confirm with `get_page_text` / JS.
- Attendance is saved from the Save bar at the bottom (not per tap).
- Invoice 1 (old test data) lists a Stripe payment but shows Paid 0.00.
- Renewal cycle name "Binnual" (typo, data): fix in Super Admin → Settings → Renewal cycles.
