Use this tool to maintain durable user and project knowledge — small, recurring preferences and facts that should persist across conversations in this workspace.

**When to use:**
- You notice a durable preference the user keeps applying: language ("always reply in Hinglish"), name, formatting style, tone, tooling choices, or repeated corrections.
- The user explicitly asks you to remember something ("yaad rakhna", "remember that...").
- You need to recall what is already known before answering (use action `list`).

**When NOT to use:**
- One-off facts about the current task only — those belong in the conversation, not knowledge.
- Large instructions or project conventions — those belong in AGENTS.md / skills, not here.
- Secrets, credentials, or tokens — never store those.

**Guidance for writing an entry:**
- `name`: short label, e.g. "Language preference".
- `useWhen`: when the entry applies, e.g. "Whenever communicating with the user". Write "Always" when it applies to every conversation.
- `content`: the durable instruction, one or two sentences, written as a rule the agent must follow.

**Examples:**

```json
{ "action": "add", "name": "Language preference", "useWhen": "Whenever communicating with the user", "content": "Always use Hinglish when communicating with the user." }
```

```json
{ "action": "list" }
```

```json
{ "action": "update", "id": "kb-...", "name": "Language preference", "useWhen": "Whenever communicating with the user", "content": "Always use Hindi when communicating with the user." }
```

```json
{ "action": "remove", "id": "kb-..." }
```

Do not add more than one entry for the same preference — use `update` instead of adding a duplicate.
