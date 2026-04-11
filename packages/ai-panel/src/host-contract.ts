/**
 * Host Integration Contract — @nextmark/ai-panel
 *
 * This file is the canonical reference for everything a host application must
 * implement to mount the AI panel. Re-exports the integration surface from
 * `types.ts` grouped by responsibility so the contract is clear at a glance.
 *
 * ─── How to integrate ────────────────────────────────────────────────────────
 *
 * 1. Implement `AiTransportAdapter` — wire your app's HTTP client to the
 *    backend thread API.
 *
 * 2. Optionally implement `AiActionHandler` — the panel calls this when the
 *    user clicks a structured action button returned by the assistant. Map
 *    `action.type` to your app's runtime operations (navigation, store
 *    mutations, clipboard, etc.).
 *
 * 3. Configure `AiPanelConfig` — title, theme, storage key, sizes.
 *
 * 4. Mount `AiPanelProvider` near the app shell root, passing `transport`,
 *    optional `resolveAction`, and config props.
 *
 * 5. Use `useAiPanel()` anywhere inside the provider tree to access the
 *    `AiPanelController` — open, send, clear, etc.
 *
 * ─── What the package owns ───────────────────────────────────────────────────
 *
 * - Floating panel UI (desktop + mobile sheet)
 * - Transcript rendering and scroll management
 * - Action button rendering
 * - Tool-trace accordion display
 * - Drag / resize / position persistence (localStorage)
 * - Thread ID persistence (localStorage)
 * - Conversation state and loading states
 *
 * ─── What the host owns ──────────────────────────────────────────────────────
 *
 * - HTTP transport layer and auth headers
 * - Thread creation / message routing
 * - Action execution (navigation, store mutations, etc.)
 * - App-specific context sent with each message (`AiMessageContext`)
 * - Theme values (via `AiPanelConfig.theme`)
 *
 * ─── Backend contract ────────────────────────────────────────────────────────
 *
 * See `docs/GPT_AI_PANEL_RESPONSE_CONTRACT.md` for the expected backend
 * endpoint shapes. The transport adapter is responsible for mapping your
 * backend's response into `AiPanelResponse`.
 */

// ─── Transport ───────────────────────────────────────────────────────────────

/** Backend integration interface. The host creates one instance per app. */
export type { AiTransportAdapter } from './types'

/**
 * Contextual metadata sent alongside each user message.
 * Extend this type in your app to add app-specific fields.
 */
export type { AiMessageContext } from './types'

// ─── Action handling ─────────────────────────────────────────────────────────

/** Callback invoked when the user clicks a structured action in the panel. */
export type { AiActionHandler } from './types'

/**
 * A structured action button surfaced by the assistant response.
 * The discriminant is `type` — handle all values your backend may return.
 */
export type { AiActionDescriptor } from './types'

/**
 * Structured display block in an assistant message.
 * The backend may return multiple blocks in one response.
 */
export type { AiMessageBlock, AiBlockKind, AiBlockEntityType, AiBlockLayout } from './types'

/**
 * Host-provided mapper for legacy `message.data` payloads.
 * Use this during migration before backend sends `message.blocks`.
 */
export type { AiLegacyDataToBlocksMapper } from './types'

/**
 * Host-provided renderer for structured blocks.
 * Use this to render app-specific cards or tables without coupling the package
 * to app code.
 */
export type { AiBlockRenderer, AiBlockRendererProps } from './types'

// ─── Configuration ────────────────────────────────────────────────────────────

/** Optional panel appearance and behaviour configuration. */
export type { AiPanelConfig } from './types'

/** Props for `<AiPanelProvider>`. Extends `AiPanelConfig` with runtime deps. */
export type { AiPanelProviderProps } from './types'

// ─── Runtime surface ─────────────────────────────────────────────────────────

/**
 * Controller returned by `useAiPanel()`. Use this to open, send messages,
 * or clear the conversation from outside the panel UI.
 */
export type { AiPanelController } from './types'

/** Props for the `<AiPanelLauncher>` manual trigger button. */
export type { AiPanelLauncherProps } from './types'
