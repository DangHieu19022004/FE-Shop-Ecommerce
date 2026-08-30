# Dorm Mart frontend

## Scope

- This repository contains the Dorm Mart Vue frontend.
- Keep generated and dependency directories (`dist/`, `node_modules/`) out of source changes.
- Reuse components in `src/components/base/` before creating new primitives.

## Commands

Run commands from the repository root.

```sh
npm install
npm run dev
npm run build
npm run test:e2e
```

## Runtime and structure

- Vue 3, Vite and plain JavaScript.
- `src/main.js` installs the router, provides `i18nCommon` and imports shared styles.
- Customer, authentication and admin views live in `src/views/dormmart/`.
- Shared controls live in `src/components/base/`; Dorm Mart-specific components live in `src/components/dormmart/`.
- Routes and authentication guards are defined in `src/router/index.js`.
- API access is organized under `src/services/`; shared endpoint configuration lives in `src/config/apiConfig.js`.
- Static fallback data remains structured like backend DTOs so it can later map to MySQL-backed API responses.
- Brand colors and reusable icon classes live in `src/assets/styles/brand-colors.scss` and `src/assets/styles/brand-icons.scss`.
- Screen-specific styles live in `src/assets/styles/screens/`.
- Shared UI text belongs in `src/i18n/i18nCommon.js`, grouped by screen or feature.

## API behavior

- The primary API defaults to `https://trandanghieu.online:7173/api`.
- Network failures and status codes 502, 503 or 504 retry against `https://127.0.0.0:7173/api`.
- Hosts, port, protocol, path, timeout and complete base URLs can be overridden with `VITE_*` environment variables defined in `src/config/apiConfig.js`.
- `src/services/axios.js` attaches the bearer token, unwraps response data, retries the fallback host and handles token refresh.

## Naming conventions

- JavaScript variables and API response properties: `PascalCase`.
- Functions: `camelCase`.
- CSS classes: `kebab-case`.
- Enums/constants representing enum values: `UPPERCASE`.
- Environment variables: `SCREAMING_SNAKE_CASE` with the Vite `VITE_` prefix.

## Verification

- Run `npm run build` after source changes.
- For user-facing flows, run the dev server and verify the relevant route in a browser.
- Run `npm run test:e2e` when the affected flow is covered by Playwright tests.
