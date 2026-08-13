# BYOK Patch for Copilot Chat Extension

This patch modifies `byokProvider.ts` to enable BYOK (Bring Your Own Key) mode.

## Change
`isBYOKEnabled()` now always returns `true` (was requiring copilotToken.isInternal || isIndividual).

## File Location
Original: `vscode-copilot-chat/src/extension/byok/common/byokProvider.ts`

## Usage
1. Clone vscode-copilot-chat repo
2. Replace `src/extension/byok/common/byokProvider.ts` with this file
3. Build the extension
