---
name: review-pr
description: "Use when reviewing a PR for invoice approval rule changes. Return one finding per block with id, severity, file, description and suggested fix."
---

# Review PR checklist

Review the diff for business-rule correctness and project layering. Keep output deterministic.

## Required checks

- Layering violations: business rules in routes, UI, or server files
- State changes on rejected approval attempts
- Same-user checks by id, not by name or role
- Boundary operators: exactly 50,000, exactly 500,000, and above 500,000
- Tests that would not fail if the rule were broken
- Rules that exist only in the UI instead of the domain layer

## Output format

Return one finding per block with this exact structure:

```text
Finding: <id>
Severity: <severity>
File: <file>
Description: <description>
Suggested fix: <suggested fix>
```

## Review verdict rules

- If a bug is confirmed, produce a finding.
- If the issue is acceptable and justified, mark it as dismissed with reason in the description.
- If the issue is not yet actionable, mark it as deferred with reason in the description.
- Never fabricate a file path. Use the exact path from the diff.
- Keep findings concise and directly tied to the rule.
