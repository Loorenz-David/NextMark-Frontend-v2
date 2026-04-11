# AI Panel Package — Documentation

Documentation index for the `@nextmark/ai-panel` package.

← [Back to packages docs](../../packages/docs/README.md)

---

## Existing references

| Document | Description |
|---|---|
| [README.md](../README.md) | Package overview, quick-start usage, and host integration guide |
| [CONTEXT.md](../CONTEXT.md) | Architecture, layer map, component tree, conversation hook, capability model, and persistence |
| [AI_PANEL_BACKEND_BLOCKS_CONTRACT.md](../AI_PANEL_BACKEND_BLOCKS_CONTRACT.md) | Backend block contract — all supported block kinds, fields, and rendering expectations |
| [AI_PANEL_STATISTICS_BLOCKS_CONTRACT.md](../AI_PANEL_STATISTICS_BLOCKS_CONTRACT.md) | Statistics block contract — analytics layout variants and data shape specifications |
| [GPT_AI_PANEL_RESPONSE_CONTRACT.md](../../../docs/GPT_AI_PANEL_RESPONSE_CONTRACT.md) | AI panel backend response contract specification (workspace-level) |

---

## Source structure

| Path | Responsibility |
|---|---|
| `src/types.ts` | Shared types and contracts (transport, config, diagnostics, capabilities) |
| `src/host-contract.ts` | Host integration contract — props, callbacks, and extension points |
| `src/AiPanelProvider.tsx` | Package entrypoint; wires layout state, conversation, and overlay |
| `src/context.ts` | React context definition for panel state consumers |
| `src/constants.ts` | Package-level defaults (max messages, storage key, breakpoints, panel sizes) |
| `src/hooks/useAiPanelConversation.ts` | Thread state, send flow, capability context injection, retention, loading-status polling |
| `src/hooks/useAiPanelLayoutState.ts` | Open/close, drag, panel and launcher positions |
| `src/hooks/useThreadInteractions.ts` | Blocking interaction state machine (question / confirm) |
| `src/components/AiPanelOverlay.tsx` | Open/closed panel switch and prop forwarding |
| `src/components/AiPanelSurface.tsx` | Desktop panel / mobile sheet shell |
| `src/components/AiPanelHeader.tsx` | Panel close and clear controls |
| `src/components/AiPanelLauncher.tsx` | Floating launcher button |
| `src/components/AiPanelTranscript.tsx` | Windowed transcript rendering and load-older behavior |
| `src/components/AiPanelMessageCard.tsx` | Narrative/block/actions rendering and compact expand behavior |
| `src/components/AiPanelBlockingInteraction.tsx` | Required question/confirm flow UI |
| `src/components/AiPanelComposer.tsx` | Text input, capability selector, and send flow |
| `src/components/AiPanelLoadingStatus.tsx` | Loading status text indicator |
| `src/diagnostics.ts` | Shared metric emission helper |
| `src/layout.ts` | Local storage read/write for thread id and layout position |
| `src/message.ts` | Message factory and clipboard/JSON helpers |
| `src/proposal.ts` | Proposal state model |
| `src/markdown.tsx` | Markdown rendering utilities |
| `src/theme.ts` | Package-level theme tokens |
| `src/styles.ts` | Package-level style utilities |
| `src/index.ts` | Public package barrel — exports the host integration surface |

---

## Planned docs

The following documents will be added here as the package evolves.

- `host-integration.md` — step-by-step guide for wiring a new host app into the panel (transport, block renderer, capability options, diagnostics)
- `block-rendering.md` — how host `renderBlock` overrides work, default block fallback chain, and block kind catalogue
- `capability-model.md` — capability options, auto vs manual mode, context forwarding per message
- `conversation-lifecycle.md` — thread creation, persistence, retention trimming, clear, and restore flow
- `diagnostics.md` — metric emission contract, transport diagnostics fields, and how to wire a host diagnostics adapter
- `loading-status.md` — polling model, UI lifecycle, and transport contract for `pollLoadingStatus`
- `blocking-interactions.md` — question/confirm interaction state machine and host handling
- `layout-persistence.md` — how panel position, size, and open state are persisted via local storage
- `changelog.md` — version history and breaking changes to the host integration contract
