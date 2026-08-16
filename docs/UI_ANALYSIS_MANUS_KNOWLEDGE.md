# UI Analysis: Manus AI Knowledge System

## Overview

Two screenshots from `manus.im/app/JIgE...` showing the **Knowledge Recall** feature in Manus AI agent.

---

## Image 1: Knowledge Recall in Conversation

### Device Info
- **Screen:** Mobile (Android), portrait orientation
- **Resolution:** 1080x2412 pixels
- **Status bar:** Time 6:55, 5G VoLTE, Bluetooth on, Battery 42%

### UI Layout (Top to Bottom)

| Section | Content | Height (approx) |
|---------|---------|-----------------|
| Status bar | Time, network, battery icons | ~40px |
| URL bar | `manus.im/app/JIgE...` | ~60px |
| App header | Hamburger menu, "Manus 1." title, action icons (star, share, bar-chart, more, embed) | ~60px |
| AI Avatar | Manus logo (hand icon + "manus" text) | ~40px |
| AI Response | Hinglish text about knowledge recall research | ~280px |
| **Work items (circled)** | Blue dot + "Record research questions and..." dropdown | ~40px |
| **Knowledge recall** | ⚡ icon + "Knowledge recalled (1)" + chevron, "Language preference" | ~80px |
| File activity | 📄 "Editing files todo.md +4" | ~40px |
| Progress indicator | "Review public do... 2/4" with dropdown | ~50px |
| Input area | "Ask Manus anything, no credits charged" | ~60px |
| Bottom toolbar | +, GitHub+1, monitor, mic, stop button | ~60px |
| Footer | Disclaimer text | ~40px |

### Red Circle Annotation
- **Location:** Around "Knowledge recalled (1)" section
- **Type:** Hand-drawn red circle/oval
- **Purpose:** Highlights the knowledge recall feature
- **Elements inside circle:**
  - ⚡ Lightning bolt icon (cyan/green)
  - "Knowledge recalled (1)" text (white)
  - Chevron (expandable)
  - "Language preference" (gray/muted text)

---

## Image 2: Edit Knowledge Dialog

### Device Info
- **Screen:** Mobile (Android), portrait orientation
- **Resolution:** 1080x2412 pixels
- **Status bar:** Time 6:56, 5G VoLTE, Bluetooth on, Battery 42%

### Dialog Layout

| Element | Position | Width | Height |
|---------|----------|-------|--------|
| Dialog container | Center of screen, ~90% width | ~900px | ~1100px |
| Title "Edit Knowledge" | Top-left | ~300px | ~50px |
| Close (X) button | Top-right corner | ~40px | ~40px |
| Name label | Below title | ~80px | ~30px |
| Name input | Below label | Full width (~800px) | ~50px |
| Name value | "Language preference" | — | — |
| Clear (X) button | Right side of name input | ~30px | ~30px |
| "Use when" label | Below name | ~120px | ~30px |
| "Use when" input | Below label | Full width | ~50px |
| Use when value | "Whenever communicating with the user" | — | — |
| "Content" label | Below use-when | ~100px | ~30px |
| Content textarea | Below label | Full width (~800px) | ~350px |
| Content value | "Always use Hinglish when communicating with the user." | — | — |
| Character count | Bottom-right of textarea | ~80px | ~20px |
| Count value | "53 / 2000" | — | — |
| Delete button | Bottom-left | ~180px | ~50px |
| Cancel button | Bottom-center-right | ~150px | ~50px |
| Save button | Bottom-right | ~150px | ~50px |

### Button Styles

| Button | Background | Text Color | Border | Border Radius |
|--------|------------|------------|--------|---------------|
| Delete | Transparent/dark | Red (#FF4444) | Red 1px solid | ~8px |
| Cancel | Dark gray (#333) | White | None | ~8px |
| Save | White (#FFF) | Black | None | ~8px |

### Dialog Properties
- **Background:** Dark (#1A1A1A or similar)
- **Overlay:** Semi-transparent black
- **Border radius:** ~16px
- **Padding:** ~24px all sides

---

## Knowledge System Architecture

### Data Model

```typescript
interface Knowledge {
  id: string;
  name: string;           // e.g., "Language preference"
  useWhen: string;        // e.g., "Whenever communicating with the user"
  content: string;        // e.g., "Always use Hinglish..."
  maxLength: 2000;       // Character limit
}
```

### Recall Flow

```
User sends message
    ↓
Agent checks for relevant knowledge
    ↓
Knowledge matched (if "Use when" condition is met)
    ↓
"Knowledge recalled (N)" appears in work items
    ↓
Knowledge content injected into agent context
```

### UI Components

1. **Knowledge Card** (in conversation)
   - ⚡ icon (cyan) for knowledge recall
   - Count indicator "(1)"
   - Expandable chevron
   - Name shown below

2. **Edit Dialog**
   - Modal overlay
   - Three fields: Name, Use When, Content
   - Character counter
   - Three actions: Delete, Cancel, Save

---

## Key Observations

1. **No borders on knowledge items** - Clean, flat design
2. **Red circle annotation** - User marked the recall feature
3. **Hinglish preference** - Language set to Hinglish (Hindi + English)
4. **2000 char limit** - Content field has max length
5. **Auto-recall** - Knowledge triggers based on "Use when" condition

---

*Analysis created: 2026-08-16*
*Source: manus.im screenshots*
