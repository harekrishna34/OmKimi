# UI Work — Done ✅

**Status:** UI work is done.

**Completed on:** 2026-08-16 (Sunday)
**Time:** 18:50 IST / 13:20 UTC

## What was done

The Kimi Code web UI now matches the original Railway UI exactly:

- Activity groups auto-open only while a tool is running and auto-collapse on settle
- One "Worked Xs" header per assistant turn (with live ticking duration); no header while streaming
- Thinking segments fold into the same activity group as adjacent tools
- Typed group summaries in the original format (e.g. `Read 1 file · Wrote 1 file`, `Ran 10 commands`)
- Thinking blocks toggle even while streaming; live elapsed tick while running
- Borderless tool rows matching the original `.tool-line` structure
- English + Chinese strings for all new labels

## Verification

- Typecheck clean
- 656 unit tests passing
- Live-verified in browser: fold / group / tool-row / thinking interactions all working

## Commit

- `d79ea7619` — fix(web): collapse activity groups like the original UI
