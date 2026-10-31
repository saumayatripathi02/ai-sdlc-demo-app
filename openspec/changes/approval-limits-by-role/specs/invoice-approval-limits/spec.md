# Spec Delta

## Purpose

This capability defines the approval thresholds and multi-approver rules for invoice decisions so role-based approval is consistent, testable, and safe for rejection attempts.

## ADDED Requirements

### Requirement: Manager approval limit
A Manager MUST approve invoices up to 50,000 inclusive. A Manager approval above that amount MUST be rejected as invalid unless the invoice is being processed under the two-approver path.

#### Scenario: Manager approves exactly 50,000
- **WHEN** a Manager approves an invoice for 50,000
- **THEN** the approval MUST be accepted and the invoice MUST move to the approved state

#### Scenario: Manager approves one above the limit
- **WHEN** a Manager approves an invoice for 50,001
- **THEN** the approval MUST be rejected with a clear reason and the invoice MUST remain unchanged

#### Scenario: Manager on a 75,000 invoice
- **WHEN** a Manager is the only approver on a 75,000 invoice
- **THEN** the invoice MUST remain pending and the approval MUST be rejected as not allowed by the current rule set

### Requirement: Director approval limit
A Director MUST approve invoices up to 500,000 inclusive. A Director approval above that amount MUST remain subject to the second-approver rule rather than automatically succeeding.

#### Scenario: Director approves exactly 500,000
- **WHEN** a Director approves an invoice for 500,000
- **THEN** the approval MUST be accepted and the invoice MUST move to the approved state

#### Scenario: Director approves one above the limit
- **WHEN** a Director approves an invoice for 500,001
- **THEN** the approval MUST be rejected unless a valid second approver condition is satisfied and the invoice MUST remain unchanged if not

### Requirement: Two-approver rule for invoices above 500,000
Any invoice above 500,000 MUST require two distinct approvers, and the second approver MUST be a Director.

#### Scenario: Director on 600,000 alone stays pending
- **WHEN** a Director approves a 600,000 invoice as the first approver and no second approver has yet been recorded
- **THEN** the invoice MUST remain pending and MUST NOT be considered approved

#### Scenario: Same director twice on 600,000
- **WHEN** the same Director attempts to count twice on a 600,000 invoice
- **THEN** the second approval attempt MUST be rejected because the approvers must be distinct users

#### Scenario: Manager as second approver on 600,000
- **WHEN** a Manager attempts to act as the second approver on a 600,000 invoice
- **THEN** the approval MUST be rejected because the second approver must be a Director

#### Scenario: Manager as first approver on 600,000
- **WHEN** a Manager approves first on a 600,000 invoice
- **THEN** the invoice MUST remain pending until a distinct Director approval is recorded

### Requirement: Rejected approval leaves invoice unchanged
A rejected approval attempt MUST return a clear reason and MUST leave status, approval list, and amount unchanged.

#### Scenario: Rejected attempt leaves invoice identical
- **WHEN** an approval attempt is rejected for an invoice that fails a rule
- **THEN** the invoice MUST keep the same status, approvals, and amount as before the rejected attempt

### Requirement: Distinct approver identity
The same user MUST never count as both approvers on one invoice, even when the same role is used.

#### Scenario: Duplicate approver by id
- **WHEN** the same user id is used for both approvers on the same invoice
- **THEN** the second approval MUST be rejected as invalid and the invoice MUST remain unchanged
