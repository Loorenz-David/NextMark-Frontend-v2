import type { AiPanelTheme } from './types'

export const defaultTheme: AiPanelTheme = {
  accent: '#8BE3C8',
  background: 'rgba(12, 16, 18, 0.76)',
  surface: '#202628',
  surfaceAlt: '#293033',
  text: '#F5F7F5',
  muted: '#9FA8A4',
  border: 'rgba(255,255,255,0.12)',
  shadow: '0 30px 90px rgba(0,0,0,0.34)',
  fontFamily: '"SF Pro Display", "Avenir Next", "Segoe UI", sans-serif',
  launcher: {
    launcherAccent: '#8BE3C8',
    border: 'rgba(93, 223, 255, 0.57)',
    text: '#F5F7F5',
    fontSize: 17,
    fontWeight: 700,
    shadow: '0 10px 40px rgba(0, 152, 172, 0.24)',
    background: 'rgba(31, 52, 63, 0.7)',
    fontFamily: '"SF Pro Display", "Avenir Next", "Segoe UI", sans-serif',
  },
  composer: {
    background: '#202628',
    border: 'rgba(255,255,255,0.12)',
    text: '#F5F7F5',
    placeholderText: '#9FA8A4',
    shadow: '0 18px 48px rgba(0,0,0,0.24)',
    fontFamily: '"SF Pro Display", "Avenir Next", "Segoe UI", sans-serif',
    muted: '#9FA8A4',
    accent: '#8BE3C8',
  },
  header: {
    backgroundColor: '#2a2a2a5e',
    border: 'rgba(255,255,255,0.12)',
    text: '#F5F7F5',
    placeholderText: '#9FA8A4',
    shadow: '0 18px 48px rgba(0,0,0,0.24)',
    fontFamily: '"SF Pro Display", "Avenir Next", "Segoe UI", sans-serif',
    muted: '#9FA8A4',
    accent: '#8BE3C8',
  }

}

export function mergeAiPanelTheme(theme?: Partial<AiPanelTheme>): AiPanelTheme {
  return {
    ...defaultTheme,
    ...theme,
  }
}
