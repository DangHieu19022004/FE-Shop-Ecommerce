# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Scope

- Work only inside `FE-Shop-Ecommerce/` unless task changes frontend-backend API contract.
- Read root `../CLAUDE.md` first for repo-wide rules.
- Use `frontend-task` skill for Vue/UI work. Use `fullstack-contract` if request or response shape changes.
- Ignore generated or dependency folders: `node_modules/`, `dist/`.

## Commands

Run commands from `FE-Shop-Ecommerce/`.

```sh
npm install
npm run dev
npm run build
npm run preview
```

Notes:
- `package.json` currently defines only `dev`, `build`, `preview`.
- No lint or test scripts exist yet.
- No single-test command exists yet because no test runner is configured.

## Runtime and toolchain

- Vite + Vue 3 app, plain JavaScript source despite Vue 3 template defaults.
- Node version from `package.json`: `^20.19.0 || >=22.12.0`.
- Alias `@` points to `./src` in `vite.config.js`.
- Vite dev server proxies `/api` to `https://localhost:7173` with `secure: false` for local backend certs.
- Shared API base URL comes from `VITE_API_BASE_URL`, fallback `https://localhost:7173/api` in `src/services/axios.js`.

## Big picture architecture

### App shell

- Entry flow: `src/main.js` creates app, installs router, mounts `App.vue`.
- `src/App.vue` is intentionally thin and renders only `<router-view />` plus global stylesheet imports.
- Main page shell lives in `src/views/MainLayout.vue`: navbar, sidebar, shared overlay, shared alert, shared toast container, and routed content area.

### Routing model

- Router defined in `src/router/index.js`.
- Single top-level layout route at `/` renders `MainLayout`.
- Feature screens render as child routes under that layout.
- Current default redirect lands on salary composition workflow.

### Feature organization

- Reusable UI primitives live under `src/components/`.
  - `base/` contains generic inputs, buttons, tables, selectors, loaders.
  - `overlay/` contains alert, overlay, toast pieces.
- Layout chrome lives in `src/layouts/`.
- Business features live under `src/feat/`.
  - Current feature areas: `salarycomposition/` and `salarycompositionsystems/`.
- Shared constants live in `src/constants/`.
- Browser persistence keys live in `src/stores/`, but this is not Pinia or Vuex; currently simple exported constants/helpers.

### Data flow

- API access goes through small service modules in `src/services/`.
- `src/services/axios.js` is shared HTTP client.
  - unwraps successful responses to `response.data`
  - normalizes failures to `{ status, message, data }`
  - central place for future auth header / token refresh logic
- Feature views import service modules directly. No global state layer.
- Most screen state stays local in feature components via `ref`, `computed`, `watch`, `onMounted`.

### Salary composition module

This is current center of app, spread across route, feature views, and services.

- `src/feat/salarycomposition/SalaryComposition.vue` is orchestration-heavy screen.
  - owns fetch lifecycle, paging, search debounce, sort, status filter, org filter, bulk actions, row selection, local toasts
  - opens child form and popup flows
  - persists grid column config through backend API
- `src/services/salaryCompositionService.js` wraps CRUD, paging, advanced filter paging, bulk delete, bulk status update.
- `src/services/gridConfigService.js` persists per-grid column settings to backend.
- `src/services/organizationService.js` supplies organization tree for filters.
- `src/services/salaryCompositionSystemService.js` supplies system catalog data used when importing system salary compositions.

## Working conventions worth preserving

- Keep page-level orchestration inside feature screen components unless extracting repeated logic pays off.
- Reuse existing service modules before adding new HTTP wrappers.
- Preserve current API response assumption: components expect service calls to already return backend payload, not raw Axios response.
- When changing grid/table behavior, inspect both feature component and `gridConfigService` usage because column visibility, order, width, and pinning persist through backend.
- When changing salary composition filters or paging, inspect both GET `/Paging` and POST `/Paging` paths. Advanced filters switch code path from query params to JSON body.
- Local persistence currently uses browser `localStorage` directly for UI state such as sidebar collapse and pending toast handoff.

## Verification

- Small UI/code change: `npm run build`
- Local manual dev check: `npm run dev`
- If command fails because backend is needed, verify whether screen depends on `/api` proxy before concluding frontend issue.
