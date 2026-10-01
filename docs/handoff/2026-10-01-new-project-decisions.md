# 2026-10-01 — Decisions for the new projects

## Done
- Roadmap updated: new repos `azonation-api` + `azonation-app` (later `azonation-site`) in
  `D:\xampp\htdocs\Azonation\`; old repos frozen; parity rule; Sanctum session cookies
  (JWT/Passport later); Google + Microsoft + Apple sign-in; 10 languages with RTL;
  domains (azonation.com / .org / .net); marketing site plan.
- Paperless additions, email + Newsletters, Directory in the roadmap.

## Half-finished
- Nothing.

## Next step
- Roadmap step 2: **feature inventory** of the current apps, as the parity checklist.
  Source: `azonation-frontend/src/router/*.js` + views, `azonation-backend/routes/api.php`,
  `routes/console.php`, permissions table, notifications/mails, settings pages.
  Group every item by its target module (roadmap §3). Save as
  `docs/FEATURE-INVENTORY.md` (move it to `azonation-app/docs/` once that repo exists).
- Then step 3: create `azonation-api` and `azonation-app`.

## Open questions for the owner
- Real monthly prices per package per region (needed when Billing moves).
- Create the GitHub repos `azonation-api` and `azonation-app` (owner), or set up the
  GitHub command-line tool so they can be created from a session.

## Notes / gotchas found
- Old repos: frozen — fix only if something blocks the move.
