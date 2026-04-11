# AI Panel Package — Developer Context

Package: `@nextmark/ai-panel`
Path: `packages/ai-panel/`
Last updated: 2026-03-24

---

## What this package is

A self-contained floating AI panel that hosts can mount with transport + action handlers.
The package owns:

- floating UI (desktop and mobile)
- transcript rendering
- interaction handling (question/confirm/continue)
- panel/thread persistence
- loading and diagnostics instrumentation

---

## Layer map

```
AiPanelProvider
  ├─ capability selection state (auto/manual + selected id)
  ├─ config passthrough (renderEmptyState, renderBlock, mapLegacyDataToBlocks, diagnostics)
  ├─ useAiPanelLayoutState
  ├─ useAiPanelConversation
  │    ├─ thread/message state
  │    ├─ send/load/retry
   │    ├─ capability context injection
   │    ├─ optional loading-status polling
  │    ├─ message retention cap
   │    └─ action execution state
  └─ AiPanelOverlay
       └─ AiPanelSurface (DesktopPanel / MobileSheet)
            ├─ AiPanelHeader
            ├─ AiPanelTranscript (windowed render + load older)
            ├─ AiPanelBlockingInteraction
            └─ AiPanelComposer (message input + capability select)
```

---

## Key contracts

### `AiTransportAdapter`

```ts
{
  createThread() -> { threadId }
  sendMessage({
    threadId,
    message,
    context?,
    narrative_policy?,
    __interaction_response__?,
    confirm_accepted?,
    interaction_form?,
  }) -> AiPanelResponse
  loadThread?(threadId) -> AiThreadState
  pollLoadingStatus?({ threadId, lastMessage? }) -> { message? }
}
```

### Capability transport (composer -> backend)

Each send includes capability context:

- `context.capability_mode`: `auto` or `manual`
- `context.capability_id`: present when mode is `manual`

Current default capability options (host can override via `AiPanelConfig.capabilityOptions`):

- `statistical_reasoning`
- `operations`
- `app_configuration`

Current send behavior:

- `auto` mode sends `{ capability_mode: 'auto' }`
- `manual` mode sends `{ capability_mode: 'manual', capability_id }`

### Action routing

Forwarded to host `resolveAction` (standard):

- `navigate`
- `apply_order_filters`
- `copy_text`
- `open_settings`

Handled internally by conversation hook (never delegated):

- `interaction:answer_question`
- `interaction:confirm`
- `interaction:cancel`

---

## Conversation and performance behavior

### Message retention

- `maxMessages` is configurable in provider config.
- Default `DEFAULT_MAX_MESSAGES = 60`.
- Outgoing user, assistant, and error appends are clamped to the retention limit.
- Current thread restore path is not clamped yet; persisted thread history is restored as returned by `loadThread`.

### Transcript rendering

- Transcript renders recent messages first (`INITIAL_VISIBLE_MESSAGES = 20`).
- Older history can be loaded in steps (`LOAD_OLDER_STEP = 20`).
- Auto-load when user scrolls near top and hidden history exists.
- Scroll position is preserved when older messages are inserted.

### Loading status polling

- When `transport.pollLoadingStatus` exists, the hook polls every 1500ms while a request is active.
- Polling result is additive UI state only; polling failures do not fail the main send request.
- Returned loading text is cleared when the request finishes.

### Diagnostics metrics

If diagnostics are enabled, package emits metrics:

- `conversation:thread_load`
- `conversation:append_message`
- `conversation:poll_status`
- `transcript:load_older`
- `transcript:render_window`

Configured via `AiPanelConfig.diagnostics`.

Current behavior:

- transcript metrics are forwarded correctly from provider -> overlay -> surface -> transcript
- conversation-level append/load/poll metrics are defined in the contract but are not currently emitted by `useAiPanelConversation`

### Loading status UX

Transcript shows a transport-provided loading status message when available.
Fallback text remains: `The assistant is resolving the next step.`

---

## Rendering details

`AiPanelMessageCard` honors intent/hints:

- `intent = blocks_only` hides narrative
- `intent = narrative_only` hides blocks
- section titles from `rendering_hints`
- optional raw data preview suppression
- typed warnings and proposal/tool status notices
- host-provided `renderBlock` takes precedence for custom block rendering

Entity-collection heavy blocks use compact rendering with expand/collapse controls.

Blocking interactions (`question` / `confirm`) currently replace the composer until handled.
The panel close button is disabled when the latest blocking interaction is marked `required`.
The header clear button remains available but is disabled while loading or when there are no messages.

---

## Persistence

- Default storage key: `nextmark-ai-panel`.
- Persists thread id and layout position.
- On mount, if `loadThread` exists, thread history is restored.

---

## File reference

| File | Responsibility |
|---|---|
| `src/types.ts` | Shared types and contracts (transport, config, diagnostics, capabilities) |
| `src/AiPanelProvider.tsx` | Package entrypoint; wires layout + conversation + overlay |
| `src/hooks/useAiPanelConversation.ts` | Thread state, send flow, capability context injection, retention, loading-status polling, action execution state |
| `src/hooks/useAiPanelLayoutState.ts` | Open/close, drag, panel and launcher positions |
| `src/components/AiPanelTranscript.tsx` | Windowed transcript rendering and load-older behavior |
| `src/components/AiPanelMessageCard.tsx` | Narrative/block/actions rendering and compact expand behavior |
| `src/components/AiPanelBlockingInteraction.tsx` | Required question/confirm flow UI |
| `src/components/AiPanelComposer.tsx` | Input + capability selector |
| `src/components/AiPanelHeader.tsx` | Panel close and clear controls |
| `src/diagnostics.ts` | Shared metric emission helper |
| `src/layout.ts` | Local storage read/write for thread/layout |
| `src/message.ts` | Message factory and clipboard/json helpers |
