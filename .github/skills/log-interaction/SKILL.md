---
name: log-interaction
description: Append a JSON log line for each AI interaction to the repository audit log after a task finishes.
---

# Log AI interactions

After every task, before you finish, call the repository logging script and pass an event JSON object on stdin.

Use:

```bash
printf '%s\n' '{"event":"userPromptSubmitted","sessionId":"manual-session","prompt":"Describe the task you just completed","agent":"GitHub Copilot"}' | node ./scripts/log-interaction.js
```

Do this after each task, even for quick clarifying questions or tool-driven work.

Rules:
- Always log a single JSON event per task completion.
- Use the event name that matches the moment: `userPromptSubmitted`, `preToolUse`, `postToolUse`, `sessionStart`, or `sessionEnd` when relevant.
- Keep the prompt short and redact anything that looks like a password, token, secret, or key.
- Never log full environment variables, raw credentials, or authorization headers.
- The script writes to `ai-log/interactions.log` and creates `ai-log/` if it is missing.
