# Design

## Overview

The approval-limits-by-role change introduces role-based approval enforcement in the domain layer. The service will validate invoice approval attempts against the configured thresholds before changing invoice state, and it will reject invalid attempts without mutating invoice data.

## Domain design

- Keep all approval rules in `src/domain` and out of routes, server code, and UI code.
- Centralize invoice state transitions in the approval service.
- Treat the approval list as a set of distinct approver identities keyed by user `id`.
- Use a result object with `{ ok, reason }` for all business-rule failures, leaving the invoice untouched on rejection.

## Rule handling

### Single-approver limits
- Manager approvals are valid up to 50,000 inclusive.
- Director approvals are valid up to 500,000 inclusive.
- Approval attempts above that role-specific limit must fail with a clear reason and leave state unchanged.

### Multi-approver rule
- Invoices above 500,000 require two distinct approvers.
- The second approver must be a Director.
- The first approver may be a Manager or Director, but the second approver cannot be a Manager.
- The same user id cannot appear in both approval slots.
- If the invoice remains pending because the second rule is not yet satisfied, the invoice status should stay pending.

### Rejection semantics
- Rejected attempts must return a clear reason.
- Rejection must not mutate the invoice's amount, status, or approvals list.
- Invalid approvals should be rejected before any invoice state is modified.

## Test design

- Add unit tests for exact boundaries at 50,000 and 500,000.
- Add negative tests just above each limit.
- Add cases for 75,000 manager-only approval, 600,000 first-approver and second-approver sequences, same-user attempts, and rejected invoice immutability.
- Use a fake repository to validate state preservation without testing implementation details.

## Open Questions

- None at this stage; the rules are specific and testable.
