---
name: write-approval-tests
description: "Use when writing invoice approval tests: boundary checks, negative cases, and assertions that a rejected approval leaves the invoice unchanged."
---

# Write approval-rule tests

Use this skill when adding or revising tests for invoice approval business rules.

## Required coverage

Always cover the following:
- exact boundary values for each approval limit
- the negative case just above a limit
- the same-user check by id, not name
- a rejected approval leaves the invoice unchanged
- a rejected attempt returns a clear reason and no state mutation
- role checks for Manager and Director approvals

## Test strategy

- Assert behaviour, not implementation.
- Prefer checking the invoice object before and after a failed approval attempt.
- Validate both positive and negative approval outcomes.
- For boundaries, write tests for exactly 50,000 and exactly 500,000.
- For the second approver rule, verify the second approver must be a Director and the user cannot be the same person.
- Keep tests small and explicit; a failing rule should make at least one test fail.

## Example assertions

```js
const before = structuredClone(invoice);
const result = service.approve(invoice.id, manager);

expect(result.ok).toBe(false);
expect(result.reason).toBe('The second approver must be a Director.');
expect(invoice).toEqual(before);
```

## Checklist

Before finishing, confirm:
- boundary values are tested
- negative paths are tested
- rejected state remains unchanged
- same-user checks use user id
- no route or UI logic is being tested
