import type { AiPanelDiagnosticsConfig, AiPanelMetricName } from './types'

export function emitPanelMetric(
  diagnostics: AiPanelDiagnosticsConfig | undefined,
  name: AiPanelMetricName,
  detail: Record<string, unknown>,
): void {
  if (!diagnostics?.enabled) {
    return
  }

  const metric = {
    name,
    timestamp: Date.now(),
    detail,
  }

  if (diagnostics.emitToConsole) {
    // Intentionally compact and prefixed to simplify filtering in console.
    console.info('[ai-panel-metric]', metric)
  }

  diagnostics.onMetric?.(metric)
}
