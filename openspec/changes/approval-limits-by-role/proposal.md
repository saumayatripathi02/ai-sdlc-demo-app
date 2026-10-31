# Proposal

## Why

The invoice approval flow needs role-based approval limits enforced consistently in the domain layer so that a Manager and a Director follow the correct thresholds and multi-approver rules. Without this change, approval behavior is underspecified and risks allowing invalid approvals or ambiguous rejection states.

## What Changes

- Enforce Manager approval limits at 50,000 and below.
- Enforce Director approval limits at 500,000 and below.
- Require two distinct approvers for invoices above 500,000, with the second approver required to be a Director.
- Prevent the same user from counting as both approvers on the same invoice.
- Ensure rejected attempts return a clear reason and leave the invoice completely unchanged.
- Add explicit scenarios covering boundary values, role transitions, and invalid approval sequences.

## Capabilities

### New Capabilities
- `invoice-approval-limits`: covers approval-role limits, second-approver rules, and unchanged-state behavior for rejected attempts.

### Modified Capabilities
- None.

## Impact

- Domain approval logic in `src/domain`.
- Approval service tests in `tests/unit`.
- Repository-backed approval behavior for invoice state and approvals tracking.
- API and UI behavior may need to surface rejection reasons clearly without embedding business logic in routes or presentation.
