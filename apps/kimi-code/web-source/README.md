# Kimi Code Web UI Source (Decompiled)

This directory contains decompiled/reconstructed source code from the Kimi Code Web UI.

## Origin
- **Bundle**: `index-HRJ6xRtC.js` from `@moonshot-ai/kimi-code@0.34.0`
- **Framework**: Vue 3.5 + Vite
- **Components**: 154 total
- **No source maps** — this is a decompilation from the minified bundle

## Files

### Bundles
- `original-bundle-minified.js` — Original unmodified bundle (2.1MB, from npm)
- `original-bundle-beautified.js` — Beautified with prettier (3.8MB, 119K lines)

### i18n
- `i18n/en.js` — English translations
- Chinese translations are embedded in `original-bundle-beautified.js` (search for `mz = {`)

### Components (14 key components extracted)
| Component | Lines | Description |
|-----------|-------|-------------|
| `SettingsDialog.js` | 1630 | Settings modal with tabs (General, Agent, Account, Providers, Advanced, Archived) |
| `ProvidersPanel.js` | 290 | Provider list and management |
| `ProviderForm.js` | 670 | Add/edit provider form |
| `AddProviderFlow.js` | 787 | Multi-step provider addition wizard |
| `ModelPicker.js` | 509 | Model selection dropdown |
| `LoginDialog.js` | 259 | Kimi login dialog |
| `App.js` | 1468 | Root application component |
| `Sidebar.js` | 1442 | Session sidebar with search, groups, pinned |
| `Composer.js` | 2042 | Message input with attachments, slash commands |
| `ChatHeader.js` | 3295 | Chat header with model info, PR status |
| `ChatPane.js` | 1625 | Chat message area |
| `ConversationPane.js` | 2245 | Full conversation view |
| `DiffView.js` | 543 | Code diff viewer |
| `Markdown.js` | 473 | Markdown renderer |

### Component Manifest
- `components/INDEX.md` — Full manifest of all 154 components

## How to extract more components

```bash
# Find component line number
grep -n '__name: "ComponentName"' original-bundle-beautified.js

# Extract (replace START and END with line numbers)
sed -n 'START,ENDp' original-bundle-beautified.js > components/ComponentName.js
```

## Notes
- Variable names are minified (single letters). Comments are stripped.
- Component structure is intact: `__name`, `props`, `emits`, `setup()`, render `return()`.
- CSS classes use `data-v-*` scoped style hashes.
- The original `.vue` source lives in MoonshotAI's private `code-app` repo (`apps/web`).
