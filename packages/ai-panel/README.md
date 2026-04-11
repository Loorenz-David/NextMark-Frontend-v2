# @nextmark/ai-panel

Installable AI companion panel for React applications. Any app can mount the
panel by satisfying the host contract below — the package owns all UI,
layout persistence, and conversation state.

Import only from the root barrel. Deep imports into package internals are
forbidden.

---

## Package boundary

**The package owns:**
- Floating panel UI (desktop) and bottom-sheet UI (mobile)
- Transcript rendering (user, assistant, status, error messages)
- Action button and tool-trace accordion rendering
- Drag, resize, and panel-position persistence via `localStorage`
- Thread ID persistence via `localStorage`
- Conversation state, loading states, and retry logic

**The host app owns:**
- HTTP transport layer and auth headers
- Thread creation / message routing to the backend
- Action execution (navigation, store mutations, clipboard, etc.)
- App-specific context attached to messages (`AiMessageContext`)
- Theme customisation (via `AiPanelConfig.theme`)

---

## Integration steps

### 1 — Implement `AiTransportAdapter`

Wire your app's HTTP client to the backend thread API. The package calls
these three methods; you own the transport layer entirely.

\`\`\`ts
import type { AiTransportAdapter } from '@nextmark/ai-panel'

export const myTransport: AiTransportAdapter = {
  async createThread() {
    const res = await apiClient.post('/ai/threads')
    return { threadId: res.data.thread_id }
  },

  async sendMessage({ threadId, message, context }) {
    const res = await apiClient.post(\`/ai/threads/\${threadId}/messages\`, {
      message,
      context,
    })
    return mapBackendResponseToAiPanelResponse(res.data)
  },

  // Optional — rehydrates conversation history when the panel re-opens.
  async loadThread(threadId) {
    const res = await apiClient.get(\`/ai/threads/\${threadId}\`)
    return mapBackendThreadToAiThreadState(res.data)
  },
}
\`\`\`

### 2 — Implement `AiActionHandler` (optional)

The panel calls `resolveAction` when the user clicks a structured action
button. Map `action.type` to your app's runtime operations.

\`\`\`ts
import type { AiActionHandler } from '@nextmark/ai-panel'

const resolveAction: AiActionHandler = (action) => {
  switch (action.type) {
    case 'navigate':
      router.push(action.payload.path)
      break
    case 'apply_order_filters':
      orderStore.setFilters(action.payload.filters)
      break
    case 'copy_text':
      navigator.clipboard.writeText(action.payload.text)
      break
  }
}
\`\`\`

### 3 — Mount `AiPanelProvider`

Place the provider near the app shell root, after auth/session providers.
Pass your transport adapter, optional action handler, and configuration.

\`\`\`tsx
import { AiPanelProvider } from '@nextmark/ai-panel'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AiPanelProvider
      transport={myTransport}
      resolveAction={resolveAction}
      title="My AI"
      subtitle="Your AI assistant"
      storageKey="my-app:ai-panel"
      launcherLabel="AI"
    >
      {children}
    </AiPanelProvider>
  )
}
\`\`\`

### 4 — Use the controller (optional)

\`useAiPanel()\` returns \`AiPanelController\` — open the panel, send a message
programmatically, or clear the conversation from anywhere in the tree.

\`\`\`ts
const { open, send, isOpen } = useAiPanel()

// Open and pre-fill a message with app context:
send("Summarise today's orders", { route: window.location.pathname })
\`\`\`

---

## Message context

\`AiMessageContext\` is the base shape for the context object attached to each
message. Extend it in your app with app-specific fields.

\`\`\`ts
import type { AiMessageContext } from '@nextmark/ai-panel'

type AdminContext = AiMessageContext & {
  app_scope: 'admin'
  activeWorkspace?: string
}
\`\`\`

The package passes \`context\` through to \`transport.sendMessage\` verbatim. The
backend contract for expected context fields is in
\`docs/GPT_AI_PANEL_RESPONSE_CONTRACT.md\`.

---

## Configuration reference

All \`AiPanelConfig\` fields are optional.

| Field | Type | Default | Description |
|---|---|---|---|
| \`title\` | \`string\` | — | Panel header title |
| \`subtitle\` | \`string\` | — | Panel header subtitle |
| \`placeholder\` | \`string\` | — | Composer input placeholder |
| \`storageKey\` | \`string\` | \`'nextmark-ai-panel'\` | localStorage namespace |
| \`mobileBreakpoint\` | \`number\` | \`1000\` | px width below which the bottom sheet renders |
| \`viewportMargin\` | \`number\` | \`24\` | px margin from viewport edges |
| \`defaultOpen\` | \`boolean\` | \`false\` | Open panel on first render |
| \`desktopSize\` | \`{ width, height }\` | \`460x640\` | Panel dimensions in px |
| \`launcherLabel\` | \`string\` | — | Text label on the floating launcher |
| \`theme\` | \`Partial<AiPanelTheme>\` | Dark glass-morphism | Visual theme overrides |
| \`renderEmptyState\` | \`ReactNode\` | — | Content shown when conversation is empty |

---

## Backend contract

See \`docs/GPT_AI_PANEL_RESPONSE_CONTRACT.md\` for the full backend endpoint
specification including request shapes, response shapes, and the thread model.

Key rules:
- Frontend sends only the latest user message — never the full transcript.
- \`thread_id\` is the stable conversation key; frontend persists it locally.
- \`actions\` and \`tool_trace\` are explicit contract fields, never parsed from prose.
