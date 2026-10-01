# 2026-10-01 — Feature inventory (roadmap step 2)

## Done
- `docs/FEATURE-INVENTORY.md`: the parity checklist, generated from both frozen repos and
  grouped by target module (roadmap §3):
  - plain-English **Features** per module, then every page (address, route name, file,
    permission) and every API route (method, route, controller, access rule)
  - 229 page addresses (163 pages + 66 old-link redirects), 487 API routes,
    109 permissions, scheduled jobs, 5 console commands, 5 emails, 2 in-app notifications
  - cross-cutting features (design system, themes, translations, exports, attachments,
    attendance components, organisation access, server security, phone layout)
  - **Access rules to define when moving**: 53 organisation routes with no permission or
    owner rule in the old app (membership 20, billing 14, organisation 9, committees 5,
    access 5). Example: membership terminations have no `terminated-member.*` check.
- Roadmap step 2 marked done.

## Half-finished
- Nothing.

## Next step
- Roadmap step 3: create `azonation-api` and `azonation-app` in `D:\xampp\htdocs\Azonation\`
  (GitHub repos exist, private, empty). Latest Laravel + `nwidart/laravel-modules`, latest
  Vue + Vite + Tailwind 4 + `src/modules`, Sanctum, permissions, 10-language i18n with RTL,
  Azonation Calm components copied, CLAUDE.md, tests, reference-data seeders. Move the
  roadmap, inventory and handoff notes into `azonation-app/docs/`.
- Check first: PHP version on the PC (XAMPP has 8.2.4; Laravel 13 needs 8.3+) and Composer.

## Open questions for the owner
- Review the inventory's Features lists: anything missing?
- PHP 8.3+ needed for the new API (XAMPP update or a separate PHP install).
- Real monthly prices per package per region (needed in step 5, Billing).

## Notes / gotchas found
- The inventory generator scripts were one-off (scratchpad); the document itself is the source.
