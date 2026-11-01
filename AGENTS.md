# Project conventions for AI agents

Invoice approval demo app: Node.js (Express) API with a small static web UI.

## Layout

- `src/domain`: business rules only. No Express, no storage code. `approvalService` owns the invoice lifecycle (Draft, PendingApproval, Approved, Rejected).
- `src/repositories`: repository interfaces and the in-memory implementation.
- `src/api`: routes, sign-in middleware, error mapping. No business logic here.
- `src/public`: static web UI.
- `tests/unit`: Vitest tests, one file per module under test, named `<module>.test.js`. Use the fake repository.
- `e2e`: Playwright tests (`tests/`) and page objects (`pages/`).
- `openspec`: specifications and change proposals.
- `docs/use-cases`: short briefs for features we may build.

## Approval rules (source of truth)

- A Manager may approve invoices up to 50,000 (inclusive).
- A Director may approve invoices up to 500,000 (inclusive).
- Above 500,000 an invoice needs two distinct approvers; the second must be a Director.
- The same user can never count as both approvers on one invoice.
- A rejected attempt returns a clear reason, and the invoice is left completely unchanged (status, approvals, amounts).
- Check the limits and the second-approver rules in the domain layer, never in routes or the UI.

## Conventions

- Business rules go in `src/domain`, never in routes or `server.js`.
- Service errors map to 404, 409 and 400 in one place in the API layer.
- Every endpoint requires sign-in; restrict actions by role.
- Every new rule needs unit tests, including boundaries (exactly 50,000 and exactly 500,000) and the negative cases.
- Write tests for behaviour, not implementation. A rejected approval must assert that the invoice is unchanged.
- Clear names; no one-letter variables or boolean flag parameters.
- E2E tests use page objects and role-based locators (`getByRole`, `getByLabel`), never CSS or XPath.

## Commands

- Run the app: `npm start`, then open http://localhost:5000
- Unit tests: `npm test`
- Mutation tests: `npm run mutate`
- End-to-end tests: `cd e2e && npm install && npx playwright install chromium && npm test`

## Review expectations

- Each change is small and lands as its own commit with a message saying what and why.
- Review every generated test: would it fail if the rule were broken?
- Flag any layering violation, any state change on a rejected approval, and any rule that exists only in the UI.
- Every review finding gets a verdict: fixed, dismissed (with reason) or deferred (with reason).

## Logging

- AI interactions are logged to `ai-log/interactions.log` by the hook in `.github/hooks`. Do not edit or delete it.

## Demo accounts (not real credentials)

- Keep the existing demo accounts; add `demo.manager`, `demo.director` and `demo.director2` with the same placeholder password pattern.

## Never

- Commit real credentials, tokens or customer data.
- Add business logic to routes, `server.js` or the UI.