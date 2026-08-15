# Component Index

Source: beautified production bundle `original-beautified.js` (119,310 lines),
a compiled Vue 3 SFC bundle for the Kimi Code web client.

Total components: **154**

Extracted to individual files in this directory are 14 key components; the rest
can be sliced from the bundle using the same `__name` delimiters. To re-extract a
component `Foo` starting at line `L`, take lines `L` up to the next `__name:` line
minus one (for `App` — the last — take up to line 119066).

| # | Component | Bundle line | Description | Extracted file |
|---|-----------|-------------|-------------|----------------|
| 1 | `IconButton` | 12705 | Icon-only clickable button/toolbar control. |  |
| 2 | `Icon` | 12745 | Renders an SVG icon asset (>50 built-in icon glyphs). |  |
| 3 | `ActionToast` | 12775 | Transient toast notification for action feedback. |  |
| 4 | `AuthStateIcon` | 12868 | Icon reflecting the current auth/provider state. |  |
| 5 | `Badge` | 12934 | Small status/severity badge used across contexts. |  |
| 6 | `Banner` | 12964 | Prominent informational/status banner. |  |
| 7 | `Spinner` | 13000 | Loading spinner indicator. |  |
| 8 | `Button` | 13086 | Generic button component with variants and busy state. |  |
| 9 | `Card` | 13129 | Layout card container. |  |
| 10 | `Checkbox` | 13156 | Boolean checkbox input. |  |
| 11 | `ContextRing` | 13206 | Ring/indicator showing active agent or context state. |  |
| 12 | `Dialog` | 13255 | Modal dialog shell (overlay, focus, escape handling). |  |
| 13 | `EmptyState` | 13438 | Empty-state placeholder with icon and message. |  |
| 14 | `Field` | 13459 | Form field label/helper wrapper. |  |
| 15 | `Input` | 13484 | Text input control. |  |
| 16 | `Kbd` | 13540 | Renders a keyboard-key chip. |  |
| 17 | `Menu` | 13563 | Dropdown/popover menu container. |  |
| 18 | `MenuItem` | 13586 | Single selectable menu item. |  |
| 19 | `Tooltip` | 13627 | Hover tooltip wrapper. |  |
| 20 | `PanelHeader` | 13800 | Header bar for a panel with title and actions. |  |
| 21 | `Pill` | 13866 | Small pill/tag chip. |  |
| 22 | `ScrollArea` | 13903 | Scrollable region wrapper with scrollbar styling. |  |
| 23 | `SegmentedControl` | 14122 | Segmented/radio-style option switcher. |  |
| 24 | `Select` | 14254 | Dropdown select input with options. |  |
| 25 | `StatusDot` | 14514 | Small colored status dot. |  |
| 26 | `Switch` | 14558 | Boolean toggle switch. |  |
| 27 | `Toast` | 14597 | Toast notification system entry. |  |
| 28 | `SearchSessionsDialog` | 23354 | Modal for searching/filtering past sessions. |  |
| 29 | `CheckboxNode` | 45932 | TipTap checkbox list-item node renderer. |  |
| 30 | `EmojiNode` | 46010 | TipTap emoji node renderer. |  |
| 31 | `FootnoteReferenceNode` | 46023 | TipTap footnote reference node renderer. |  |
| 32 | `HtmlInlineNode` | 46215 | TipTap inline HTML node renderer. |  |
| 33 | `InlineCodeNode` | 46307 | TipTap inline code node renderer. |  |
| 34 | `ImageNode` | 46997 | TipTap image node renderer with gallery handling. |  |
| 35 | `NodeChildRenderer` | 47347 | Generic TipTap node child renderer. |  |
| 36 | `PreCodeNode` | 47557 | TipTap preformatted/code block node renderer. |  |
| 37 | `TextNode` | 48435 | TipTap text content node renderer. |  |
| 38 | `ReferenceNode` | 49007 | TipTap reference/link node renderer. |  |
| 39 | `SuperscriptNode` | 49045 | TipTap superscript node renderer. |  |
| 40 | `SubscriptNode` | 49112 | TipTap subscript node renderer. |  |
| 41 | `StrongNode` | 49179 | TipTap bold/strong node renderer. |  |
| 42 | `StrikethroughNode` | 49245 | TipTap strikethrough node renderer. |  |
| 43 | `LinkNode` | 49314 | TipTap hyperlink node renderer. |  |
| 44 | `InsertNode` | 49594 | TipTap inserted mark node renderer. |  |
| 45 | `HighlightNode` | 49660 | TipTap highlight mark node renderer. |  |
| 46 | `EmphasisNode` | 49726 | TipTap emphasis (italic) node renderer. |  |
| 47 | `HardBreakNode` | 49792 | TipTap hard line-break node renderer. |  |
| 48 | `SimpleInlineRenderer` | 49802 | Simplified inline content renderer for editor output. |  |
| 49 | `BlockquoteNode` | 49899 | TipTap blockquote node renderer. |  |
| 50 | `DefinitionListNode` | 50007 | TipTap definition-list node renderer. |  |
| 51 | `FootnoteAnchorNode` | 50096 | TipTap footnote anchor node renderer. |  |
| 52 | `FootnoteNode` | 50132 | TipTap footnote container node renderer. |  |
| 53 | `HeadingNode` | 50182 | TipTap heading node renderer (h1-h6). |  |
| 54 | `ListItemNode` | 50284 | TipTap list item node renderer. |  |
| 55 | `ListNode` | 50513 | TipTap bullet/ordered list node renderer. |  |
| 56 | `HtmlBlockNode` | 50601 | TipTap HTML block node renderer. |  |
| 57 | `ParagraphNode` | 50919 | TipTap paragraph node renderer. |  |
| 58 | `TableNode` | 51249 | TipTap table node renderer. |  |
| 59 | `FallbackComponent` | 51691 | Fallback renderer for unknown TipTap node types. |  |
| 60 | `VmrContainerNode` | 51697 | TipTap container node renderer for custom marks. |  |
| 61 | `HeightEstimationProbes` | 55992 | Probe elements for estimating virtualized item heights. |  |
| 62 | `NodeRenderer` | 56455 | Virtualized TipTap node renderer. |  |
| 63 | `AdmonitionNode` | 63295 | TipTap admonition/note callout node renderer. |  |
| 64 | `Markdown` | 64339 | Renders markdown text to rich HTML (shiki/math/mermaid). | yes |
| 65 | `UpdateIndicator` | 64812 | Update-status indicator shown in the app frame. |  |
| 66 | `UserMenu` | 77820 | User account dropdown menu. |  |
| 67 | `SessionEmojiPicker` | 79106 | Emoji picker for choosing a session icon. |  |
| 68 | `SessionRow` | 79452 | Single session row in the sidebar list. |  |
| 69 | `WorkspaceGroup` | 80166 | Sidebar group rendering workspaces and their sessions. |  |
| 70 | `PinnedSessionList` | 80609 | Sidebar list of pinned/favorite sessions. |  |
| 71 | `Sidebar` | 80860 | Main left navigation sidebar (workspaces, sessions, collapse). | yes |
| 72 | `ResizeHandle` | 82302 | Draggable handle for resizing the sidebar width. |  |
| 73 | `OutputPanel` | 82368 | Panel rendering output/tool activity content. |  |
| 74 | `AgentTool` | 82400 | Renders an agent/sub-agent tool call result. |  |
| 75 | `ToolDisclosure` | 82659 | Collapsible wrapper around a tool-call result. |  |
| 76 | `AskUserTool` | 82797 | Renders an ask-user / question tool call. |  |
| 77 | `BashTool` | 83089 | Renders a bash/shell tool call (command + output). |  |
| 78 | `HighlightedCode` | 83319 | Syntax-highlighted code block (shiki). |  |
| 79 | `EditTool` | 83622 | Renders an edit-file tool call with diff. |  |
| 80 | `GenericTool` | 83794 | Fallback renderer for an unknown tool call. |  |
| 81 | `GlobTool` | 83891 | Renders a glob file-search tool call. |  |
| 82 | `GoalTool` | 84020 | Renders a goal-mode tool call. |  |
| 83 | `GrepTool` | 84161 | Renders a grep file-search tool call. |  |
| 84 | `AuthMedia` | 84292 | Auth-managed media asset with signing. |  |
| 85 | `MediaTool` | 84396 | Renders a media (image/asset) tool call. |  |
| 86 | `PlanTool` | 84540 | Renders a plan-mode / plan tool call. |  |
| 87 | `ReadTool` | 84691 | Renders a read-file tool call with content. |  |
| 88 | `SwarmTool` | 85020 | Renders a swarm/subagent-fanout tool call. |  |
| 89 | `StatusGlyph` | 85453 | Small status glyph/icon for tool outcomes. |  |
| 90 | `TodoTool` | 85487 | Renders a todo-list tool call. |  |
| 91 | `WebFetchTool` | 85623 | Renders a web-fetch tool call. |  |
| 92 | `ToolCall` | 85724 | Top-level renderer dispatching by tool name. |  |
| 93 | `ThinkingBlock` | 86056 | Collapsible model thinking block. |  |
| 94 | `ActivityRun` | 86285 | Renders an activity/tool run with status steps. |  |
| 95 | `MessageTime` | 86606 | Timestamp label for a message. |  |
| 96 | `NotificationCard` | 86666 | Notification card in the notifications area. |  |
| 97 | `TurnFold` | 87182 | Collapsible fold around a turn's details. |  |
| 98 | `TurnFilesSummary` | 87461 | Summary of files touched within a turn. |  |
| 99 | `ActivityNotice` | 87672 | Notice banner for activity/state transitions. |  |
| 100 | `CronNotice` | 87692 | Notice banner for scheduled/cron activity. |  |
| 101 | `MediaLightbox` | 90746 | Fullscreen lightbox viewer for media. |  |
| 102 | `MediaThumb` | 90899 | Clickable thumbnail for a media asset. |  |
| 103 | `AttachmentChip` | 91034 | Chip representing a file/attachment in input. |  |
| 104 | `KimiMascot` | 91214 | Decorative Kimi mascot illustration. |  |
| 105 | `WorkingIndicator` | 91322 | Animated indicator while the agent is working. |  |
| 106 | `ChatPane` | 91433 | Connects conversation list, pane and composer into the chat view. | yes |
| 107 | `ChatHeader` | 93058 | Header for a chat session (title, branch, git, actions). | yes |
| 108 | `SlashMenu` | 96353 | Slash-command autocomplete menu in the composer. |  |
| 109 | `MentionMenu` | 96427 | Mention/@ autocomplete menu in the composer. |  |
| 110 | `Composer` | 97200 | Message input/composer with command menu, attach, submit. | yes |
| 111 | `GoalPanel` | 99242 | Panel showing goal-mode objective and progress. |  |
| 112 | `QuestionCard` | 99280 | Card for an ask-user question awaiting an answer. |  |
| 113 | `ApprovalCard` | 99866 | Card for a permission/approval request. |  |
| 114 | `TasksPane` | 100834 | Pane listing the current task queue. |  |
| 115 | `TodoCard` | 101088 | Card for a single todo item. |  |
| 116 | `ChatDock` | 101170 | Floating dock attaching chat actions to the pane. |  |
| 117 | `ConversationToc` | 101904 | Table of contents / outline for a conversation. |  |
| 118 | `TranscriptSearch` | 102297 | Search UI over the conversation transcript. |  |
| 119 | `KimiDoodle` | 102665 | Decorative Kimi doodle/placeholder illustration. |  |
| 120 | `ConversationPane` | 102851 | Central conversation pane orchestrating turns, tools, approvals. | yes |
| 121 | `FilePreview` | 105096 | Preview panel for a file's rendered content. |  |
| 122 | `ThinkingPanel` | 106037 | Panel showing the current model's thinking. |  |
| 123 | `AgentDetailPanel` | 106167 | Panel with details for a running sub-agent. |  |
| 124 | `SideChatPanel` | 106377 | Collapsible side panel docked to the conversation. |  |
| 125 | `DiffView` | 106582 | File diff viewer (added/removed/changed hunks). | yes |
| 126 | `TurnDiffPanel` | 107125 | Panel showing git diffs for a turn. |  |
| 127 | `ModelPicker` | 107265 | Modal/popover to pick a model and star favorites. | yes |
| 128 | `LoginDialog` | 107774 | Login flow dialog (OAuth start/poll/cancel). | yes |
| 129 | `LanguageSwitcher` | 108033 | Language selection control. |  |
| 130 | `ProviderForm` | 108187 | Form for creating/editing a model provider. | yes |
| 131 | `AddProviderFlow` | 108857 | Multi-step flow to add a new provider (catalog/registry/manual). | yes |
| 132 | `ProvidersPanel` | 109644 | Panel listing configured providers with model counts. | yes |
| 133 | `PlanUpgradeCard` | 109934 | Card promoting a plan upgrade / usage limits. |  |
| 134 | `PlanUsageCard` | 109997 | Card showing current plan usage and limits. |  |
| 135 | `SecondaryModelPicker` | 110286 | Popover for choosing the secondary/budget model. |  |
| 136 | `SettingsDialog` | 110900 | Main settings dialog (appearance, providers, model, account). | yes |
| 137 | `AddWorkspaceDialog` | 112530 | Dialog to create/add a workspace. |  |
| 138 | `ConfirmDialog` | 113055 | Generic confirmation dialog. |  |
| 139 | `ConfirmDialogHost` | 113148 | Host that mounts one-off confirm dialogs. |  |
| 140 | `StatusPanel` | 113196 | Panel showing app/auth/server status. |  |
| 141 | `WarningToasts` | 113338 | Toast stack for warnings/errors. |  |
| 142 | `MobileTopBar` | 113618 | Top bar for mobile layouts. |  |
| 143 | `BottomSheet` | 113723 | Bottom-sheet container (mobile). |  |
| 144 | `MobileSwitcherSheet` | 113824 | Mobile sheet for switching sessions/workspaces. |  |
| 145 | `MobileSettingsSheet` | 114418 | Mobile sheet exposing settings. |  |
| 146 | `BrandLogo` | 115144 | Brand/manufacturer logo mark. |  |
| 147 | `OnboardingLoginStep` | 115283 | Login step of the onboarding wizard. |  |
| 148 | `OnboardingWizard` | 115614 | Multi-step onboarding wizard. |  |
| 149 | `GlobalLoading` | 115922 | Full-screen app loading screen. |  |
| 150 | `KapDebugView` | 115981 | Debug view for diagnosing app state. |  |
| 151 | `DebugPanel` | 116465 | Debug/status inspection panel. |  |
| 152 | `ServerAuthDialog` | 117452 | Dialog for server-side authentication. |  |
| 153 | `InternalBuildBanner` | 117549 | Banner marking an internal/development build. |  |
| 154 | `App` | 117599 | Root app component (shell, layout, global state wiring). | yes |

Note: descriptions are inferred from each component's name, props and behavior
