# AI SDLC Assignment

## Approach

The interaction log records an initial request to scaffold an ESM Node.js/Express app with Vitest, npm scripts, and empty application/test folders before adding business logic. The repository history then records two commits on the feature branch: `f7ad220` replaces the ASP.NET Core-specific project guide and adds interaction logging setup; `70ddd91` adds the Node.js invoice approval application, Playwright setup, agent/skill files, and the OpenSpec change.

The current approval rules are documented in `AGENTS.md` and the OpenSpec change: Managers may approve through 50,000; Directors through 500,000; invoices above 500,000 require two distinct approvers, with a Director as the second approver. Rejected attempts must leave invoice state unchanged. The domain layer is the source of truth, with unit tests and a small Playwright flow covering behavior.

## AGENTS.md: Before and After

| Area | Previous guide | Current guide |
| --- | --- | --- |
| Stack | ASP.NET Core 8 Web API | Node.js/Express API |
| Layout | `backend/src/InvoiceApp.*`, xUnit tests | `src/domain`, `src/repositories`, `src/api`, `src/public`, and Vitest unit tests |
| API conventions | Controllers, `ApiControllerBase`, `Handle(...)`, and `[RequireRole(...)]` | Express routes and sign-in middleware; centralized API error mapping; business rules stay out of routes and `server.js` |
| Approval policy | Approver/Admin roles; no monetary thresholds stated | Manager/Director thresholds, a two-distinct-approver rule above 500,000, and unchanged-state rejection requirements |
| Commands | `dotnet run` and `dotnet test` | `npm start`, `npm test`, `npm run mutate`, and Playwright instructions |
| Additional guidance | Demo approver/admin accounts and general security rules | Review verdict expectations, interaction logging, boundary/negative tests, and Manager/Director demo-account guidance |

## Agent Output Comparison

The interaction log stores prompts and tool names, not assistant response bodies. It includes a scaffold prompt asking the agent to read `AGENTS.md`, but no paired run without the guide and no captured response text. Therefore the output comparison cannot be reported from the available record.

| Run | Evidence / output |
| --- | --- |
| With `AGENTS.md` | Prompt is recorded; response output is not. `[Paste captured output here if available.]` |
| Without `AGENTS.md` | No paired run is recorded. `[Run and capture a comparison if required.]` |

## Skills, Hooks, and Agents

### Skills

Repository skill files present:

- `log-interaction`
- `openspec-apply-change`
- `openspec-archive-change`
- `openspec-explore`
- `openspec-propose`
- `openspec-sync-specs`
- `openspec-update-change`
- `review-pr`
- `write-approval-tests`

The audit log does not record named skill invocations. The `log-interaction` skill was consulted for this assignment draft; prior use of the other skills is not established by the log.

### Hook

`.github/hooks/log-interaction.json` registers `node scripts/log-interaction.js` for `userPromptSubmitted`, `preToolUse`, `postToolUse`, `sessionStart`, and `sessionEnd`. The repository audit log is `ai-log/interactions.log`.

### Agents

Agent definition files present under `.github/agents`:

- `implementer`
- `mutation-analyst`
- `reviewer`
- `spec-writer`
- `test-writer`

The interaction log does not identify any named custom-agent invocation, so these are listed as repository-defined agents, not as confirmed prior uses.

## OpenSpec Files

The approval-limits change is `openspec/changes/approval-limits-by-role`:

- `.openspec.yaml`
- `proposal.md`
- `design.md`
- `tasks.md`
- `specs/invoice-approval-limits/spec.md`

The repository-level OpenSpec configuration is `openspec/config.yaml`. The task checklist in `tasks.md` is unchecked in the current repository copy.

## Commits and PR

Commits on the current feature branch relative to `origin/main`, in chronological order:

- `f7ad220` — `logging and agents md setup`
- `70ddd91` — `added playright openspec`

Pull request supplied with the assignment: [PR #1](https://github.com/saumayatripathi02/ai-sdlc-demo-app/pull/1).

## Review Lessons

- The checked-in `mutation.txt` reports a 55.73% mutation score, with 25 surviving mutants and 33 mutants without coverage. This points to missing behavioral assertions around approval/rejection guards and invoice status values.
- The recorded Playwright failure expects a Manager approval of a 750,000 invoice to be rejected with a limit error. However, the OpenSpec says a Manager may be the first approver above 500,000, with the invoice remaining pending until a distinct Director approves. The captured page shows the invoice as `PendingApproval` with the Manager listed as an approver. Align the E2E scenario with the specification before treating the empty error message as an application defect.
- The E2E test also expects the invoice status to be `Draft`, while the captured page shows `PendingApproval`; assertions should reflect the intended two-approver flow and verify unchanged state only for an actually rejected attempt.
- No separate review report or review verdicts are recorded in the repository/log. The current `AGENTS.md` requires every review finding to be marked fixed, dismissed with a reason, or deferred with a reason.

## Video

Video link: https://nagarro-my.sharepoint.com/:v:/r/personal/saumaya_tripathi02_nagarro_com/Documents/Recordings/me-20261101_074145-Meeting%20Recording.mp4?d=w3b06062e74154b9fb211e4b44464a465&csf=1&web=1&e=gMd93d&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D
