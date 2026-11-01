# Invoice Approval Demo

A small Node.js/Express API and static web UI for demonstrating invoice approval workflows. Approval rules live in the domain layer; the UI and API surface the domain results.

## Approval Rules

- Managers can approve invoices up to 50,000 inclusive when a single approver is sufficient.
- Directors can approve invoices up to 500,000 inclusive.
- Invoices above 500,000 require two distinct approvers. The second approver must be a Director.
- A rejected attempt returns a reason and leaves the invoice status, approvals, and amount unchanged.

## Requirements

- Node.js and npm

## Run Locally

```sh
npm install
npm start
```

Open <http://localhost:5000>.

## Tests

Run the unit tests:

```sh
npm test
```

Run mutation tests:

```sh
npm run mutate
```

Run the Playwright end-to-end tests:

```sh
cd e2e
npm install
npx playwright install chromium
npx playwright test
```

The `e2e` package's `npm test` script is currently a placeholder, so invoke Playwright directly. The Playwright `webServer` configuration currently contains a checkout-specific path (`/c/Project/ai-sdlc-demo-app`); update that path in `e2e/playwright.config.js` if your checkout is elsewhere.

## Project Layout

- `src/domain`: invoice lifecycle and approval rules
- `src/repositories`: repository implementations
- `src/api`: Express routes, sign-in, and API error mapping
- `src/public`: static web UI
- `tests/unit`: Vitest unit tests
- `e2e`: Playwright tests and page objects
- `openspec`: specifications and change proposals

See [AGENTS.md](AGENTS.md) for project conventions and [ASSIGNMENT.md](ASSIGNMENT.md) for assignment notes.
