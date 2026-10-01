# Azonation — frontend (frozen)

> **This repo is frozen.** New work happens in `../../azonation-app` (Vue) and
> `../../azonation-api` (Laravel). Use this repo only as the reference when moving
> features (roadmap §2 parity rule). Fix something here only if it blocks the move.

Vue 3 (script setup) + Vite + Tailwind + vue-router + vue-i18n. Backend is the sibling repo
`../azonation-backend` (Laravel). **Read `docs/ROADMAP.md` first** (decisions, modules,
pricing, build order) and the newest note in `docs/handoff/`.

## Starting and ending a session

- Start: read `docs/ROADMAP.md`, then the latest `docs/handoff/*.md`, then continue the
  step marked `doing` (or the next `todo`).
- End: add a handoff note (`docs/handoff/YYYY-MM-DD-<topic>.md`, template in
  `docs/handoff/README.md`) and update the step status in the roadmap. Commit both.
- One task per session keeps it fast and cheap.

## Run and check

- Dev server: `npm run dev` → http://localhost:5173 (API at http://localhost:8000).
- Build check: `npx vite build` (must pass before committing).
- Test in the browser as the three account types. Local test logins are in
  `../azonation-backend/storage/app/local-test-accounts.txt` (git-ignored; organisation,
  member of org 10, Super Admin). Clean up any test data you create.
- Branch: `phase-0-security` (not merged to `master` yet). Commit messages in plain English.

## Design system: Azonation Calm

- Use the shared components in `src/components/ui` (auto-imported): AzPageHeader, AzCard,
  AzButton, AzInput, AzSelect, AzTextarea, AzCheckbox, AzModal (`v-model:open`,
  `layer="top"` for a dialog over a dialog), AzDataTable (columns `{key,label,value,sortable}`,
  slots `cell-*`, `actions`, `mobile`), AzSegmented, AzBadge (tones success/warning/danger/
  info/neutral), AzMenu (items `{label,icon,onSelect,separatorBefore}`), AzAvatar,
  AzEmptyState, AzSkeleton, AzListToolbar, AzPagination, AzAppearanceSettings, AzRichText.
- Colours only from tokens: `bg-canvas`, `bg-surface`, `bg-surface-2`, `border-line`,
  `text-ink`, `text-ink-2`, `text-ink-muted`, `primary`, `primary-soft(-ink)`,
  `success|warning|danger(-soft)`, `rounded-card|control`, `shadow-card|pop`.
  Never raw `bg-white` / `text-gray-*` (breaks dark mode).
- Plain words for non-technical users, 48px tap targets, one primary button per screen,
  works on phones (list pages use the AzDataTable `mobile` slot).
- No SweetAlert: use `useToast()` and `useConfirm()` (`src/composables`).
- List pages: `useListView` + AzListToolbar + AzDataTable + AzPagination + `useListExport`.

## Shared code to reuse

- API: `authStore.fetchProtectedApi(url, params, method)` / `fetchPublicApi` /
  `uploadProtectedApi` (`src/store/authStore.js`). Returns data, or `{status:false, errors}`
  on failure — never throws. The store sends the current organisation (`X-Org-Id`).
- Access: route `meta.permission` + `src/router/orgAccess.js` (`canOpenOrgRoute`,
  `isActingForOrg`); role-holders use the organisation dashboard for permitted pages.
- Account routes per user type: `useAccountRoutes()`.
- Money/dates: `src/helpers/billing.js` (`money`, `rate`, `shortDate`, `statusTone`…),
  `src/helpers/format.js`. Permissions: `src/helpers/permissions.js`.
  Safe HTML: `src/helpers/sanitizeHtml.js` (`vSafeHtml`, `richTextHtml`, `safeUrl`).
- Feature components: `src/components/{auth,public,family,attendance}`.

## Translations (English + Bangla)

- Every visible string goes in both `src/i18n/locales/en.js` and `bn.js`, grouped by page
  (e.g. `family: { … }`). New groups go before the final `};`.
- vue-i18n gotchas: a bare `@` breaks the message — write `{'@'}`. `|` means plural forms
  (`"no one | 1 person | {n} people"`, call `t(key, { n }, n)`). Arrays of objects are read
  with `tm()` + `rt()`.

## Do not

- Do not rebuild or remove the Super Admin shop (`src/views/SuperAdmin/E-commerce`) until
  its roadmap step.
- Do not put secrets or test passwords in the repo or in chat.
