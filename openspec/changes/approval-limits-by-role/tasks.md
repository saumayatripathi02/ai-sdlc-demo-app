# Tasks

## 1. Single-approver limits

- [ ] 1.1 Implement the Manager approval limit for invoices up to 50,000 and verify the exact-50,000 case passes in unit tests.
- [ ] 1.2 Implement the Director approval limit for invoices up to 500,000 and verify the exact-500,000 case passes.
- [ ] 1.3 Add negative tests for amounts just above each limit and verify the invalid approval is rejected with a clear reason.
- [ ] 1.4 Add the manager-on-75,000 rejection case and verify invoice state remains unchanged.

## 2. Two-approver rule

- [ ] 2.1 Implement the invoice-above-500,000 requirement for two distinct approvers and verify a Director-only approval is kept pending.
- [ ] 2.2 Add the same-director-twice rejection case and verify the duplicate approver id is rejected.
- [ ] 2.3 Add the manager-as-second-approver rejection case and verify the second approver must be a Director.
- [ ] 2.4 Add the manager-as-first-approver case and verify the invoice remains pending until a distinct Director approval is recorded.
- [ ] 2.5 Add the rejected-attempt unchanged-state case and verify status, approvals, and amount are identical after rejection.
