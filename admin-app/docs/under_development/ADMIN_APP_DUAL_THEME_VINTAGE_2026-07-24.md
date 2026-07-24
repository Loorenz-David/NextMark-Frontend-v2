# Admin App — Dual Theming (Dark ↔ Vintage)

**Status:** Under development — not started
**Author of plan:** Claude (analysis + scoping)
**Implementer:** Codex
**Date:** 2026-07-24
**Scope:** `Front_end/admin-app` only. No backend changes. No other app changes.

---

## 1. Objective

Introduce a **runtime-switchable theme system** in the admin app with two themes:

| Theme | Key | Description |
|---|---|---|
| `dark` | `dark` | The **current** design, pixel-identical. Default. |
| `vintage` | `vintage` | Aged-paper stationery look, matching the external client form. |

The theme is persisted in `localStorage` under `beyo.admin.theme` and applied via a
`data-theme` attribute on `<html>`.

### Non-goals

- Do **not** redesign layout, spacing, typography scale, or component structure.
- Do **not** add a third theme or OS `prefers-color-scheme` detection.
- Do **not** touch `driver-app`, `external-operations-app`, `tracking-order-app`, or `packages/`.
- Do **not** refactor components beyond the class-string substitutions described here.

### Hard constraint (acceptance gate)

> **With `data-theme="dark"`, the app must render pixel-identical to `main` before this change.**

Every dark-theme token value is a verbatim copy of the literal it replaces. If a screen
changes appearance in dark mode, the mapping is wrong — fix the mapping, do not adjust the design.

---

## 2. Measured current state

Numbers gathered from `admin-app/src` on 2026-07-24. Re-run the commands in §10 to verify.

| Metric | Count |
|---|---|
| `.ts` / `.tsx` files total | 1,758 |
| Files containing `className` | 415 |
| `var(--color-*)` usages | 1,626 across 304 files |
| **Hardcoded Tailwind palette utilities** | **1,000 across 204 files** |
| Distinct hardcoded utility strings | 209 |
| Raw hex literals in TS/TSX | 162 across 59 files |
| `rounded-*` utilities | ~700, incl. 12 distinct arbitrary radii |
| `admin-glass-*` / `admin-surface-*` class usages | ~130 across TSX |

### The two halves

**Half A — already centralized.** The 1,626 `var(--color-*)` usages all resolve to the token
block at `src/index.css:11-45`. These files are **not edited at all** by this work — they become
theme-aware for free once the token block is split per theme.

**Half B — the actual work.** The 1,000 hardcoded utilities cannot respond to a theme attribute.
`bg-white/[0.04]` is a literal. Converting these to tokens is the prerequisite that makes
theming possible at all.

### Why `--color-*` is the right contract

Two independent proofs that `--color-*` is already the cross-theme naming contract:

1. `packages/shared-inputs` reads exactly six tokens: `--color-text`, `--color-muted`,
   `--color-border-accent`, `--color-page`, `--color-primary`, `--color-ligth-bg`.
   (Note the existing typo `ligth` — **preserve it**, it is load-bearing.)
2. `packages/client-form-kit/src/styles/client-form.css:44-53` **already** re-expresses the
   full vintage palette in those same `--color-*` names, so the vintage form can render
   inside the dark admin app.

The vintage palette therefore already speaks this app's token language. Reuse it — do not
invent a parallel naming scheme.

---

## 3. Architecture

### Layer placement

Per `Front_end/AGENTS.md` and `CLAUDE.md`, theme is **app-level state** (like session, env,
bootstrap), not feature state. It lives in `src/app/theme/`. Feature code must **never** read
the theme value or branch on it — features consume tokens only.

```
src/app/theme/
  theme.types.ts        # ThemeName union + constants
  theme.store.ts        # Zustand store, localStorage-backed
  ThemeProvider.tsx     # applies data-theme to <html>
  index.ts              # public surface of the module
```

### Token layering in `index.css`

Three layers, in this order:

1. **Primitives** — per-theme raw values, defined under theme selectors. Named after the
   client-form-kit vocabulary (`--paper`, `--ink`, `--rule`, `--accent`).
2. **`@theme inline`** — maps Tailwind's `--color-*` namespace onto the primitives.
   The `inline` keyword is **mandatory**: it makes Tailwind emit `var(--ink)` rather than
   resolving the value at build time, which is what allows runtime switching.
3. **Structural classes** — `admin-glass-*`, `app-icon-*`, auroras. These differ
   *structurally* between themes (blur vs. flat), so they need theme-scoped rule bodies,
   not just different values.

> **Codex: verify layer 2 works before proceeding.** Build the app and inspect the emitted CSS.
> If `@theme inline` resolves values at build time instead of emitting `var()`, stop and
> report — the whole plan depends on this. Fallback if it fails: skip `@theme` entirely and
> use `bg-[var(--color-surface-raised)]` arbitrary-value syntax throughout the codemod.

---

## 4. Phase 1 — Token layer (`src/index.css`)

### 4.1 Primitive sets

Replace the current `:root { ... }` block at `src/index.css:11-45` with the structure below.

**Dark primitives must be verbatim copies of today's values.** They are listed here from the
current file — cross-check against `git show HEAD:src/index.css` before writing.

```css
:root,
[data-theme="dark"] {
  /* ── surfaces ─────────────────────────────────────────── */
  --paper:            #182224;                      /* was --color-page */
  --paper-raised:     rgba(255, 255, 255, 0.04);
  --paper-hover:      rgba(255, 255, 255, 0.06);
  --paper-sunken:     rgba(255, 255, 255, 0.10);
  --paper-subtle:     rgba(255, 255, 255, 0.03);
  --surface:          rgba(255, 255, 255, 0.06);    /* was --color-surface */
  --overlay:          rgba(4, 8, 10, 0.54);
  --shade:            rgba(0, 0, 0, 0.05);

  /* ── ink ──────────────────────────────────────────────── */
  --ink:              rgba(248, 251, 252, 0.94);
  --ink-soft:         rgba(206, 220, 224, 0.68);
  --ink-faint:        rgba(255, 255, 255, 0.45);
  --ink-inverse:      #182224;

  /* ── rules ────────────────────────────────────────────── */
  --rule-subtle:      rgba(255, 255, 255, 0.06);
  --rule:             rgba(255, 255, 255, 0.12);
  --rule-strong:      rgba(255, 255, 255, 0.22);
  --rule-emphasis:    rgba(255, 255, 255, 0.75);

  /* ── brand ────────────────────────────────────────────── */
  --accent:           #83ccb9;
  --accent-soft:      rgb(86, 201, 181);
  --accent-ink:       #f8fbfc;

  /* ── status ───────────────────────────────────────────── */
  --danger:           #ef4444;   /* red-500  */
  --danger-soft:      #fca5a5;   /* red-300  */
  --danger-bg:        rgba(239, 68, 68, 0.12);
  --danger-border:    rgba(248, 113, 113, 0.25);

  --warning:          #fcd34d;   /* amber-300 */
  --warning-soft:     #fde68a;   /* amber-200 */
  --warning-bg:       rgba(252, 211, 77, 0.12);
  --warning-border:   rgba(252, 211, 77, 0.25);

  --success:          #6ee7b7;   /* emerald-300 */
  --success-soft:     #a7f3d0;   /* emerald-200 */
  --success-bg:       rgba(110, 231, 183, 0.12);
  --success-border:   rgba(110, 231, 183, 0.25);

  --info:             #7dd3fc;   /* sky-300 */
  --info-soft:        #bae6fd;   /* sky-200 */
  --info-bg:          rgba(125, 211, 252, 0.12);
  --info-border:      rgba(125, 211, 252, 0.25);

  /* ── radii ────────────────────────────────────────────────
     Tailwind v4 backs `rounded-*` with these theme vars, so redefining them
     re-themes every standard `rounded-*` usage with ZERO file edits. Dark must
     therefore keep Tailwind's defaults verbatim, plus the pre-existing
     `--radius-xl: 1.5rem` override already present at index.css:43. */
  --radius-xs:        0.125rem;
  --radius-sm:        0.25rem;
  --radius-md:        0.375rem;
  --radius-lg:        0.5rem;
  --radius-xl:        1.5rem;   /* pre-existing app override — NOT the TW default */
  --radius-2xl:       1rem;
  --radius-3xl:       1.5rem;

  /* ── elevation ────────────────────────────────────────── */
  --shadow-panel:     0 24px 70px rgba(0, 0, 0, 0.28);
  --shadow-popover:   0 26px 60px rgba(0, 0, 0, 0.36);
}
```

```css
[data-theme="vintage"] {
  /* Values sourced from packages/client-form-kit/src/styles/client-form.css */
  --paper:            #efe7d7;
  --paper-raised:     #f6f1e6;
  --paper-hover:      #f0e8d9;
  --paper-sunken:     #e7dcc7;
  --paper-subtle:     #f3ece0;
  --surface:          #f6f1e6;
  --overlay:          rgba(46, 42, 36, 0.42);
  --shade:            rgba(46, 42, 36, 0.05);

  --ink:              #2e2a24;
  --ink-soft:         #6c6252;
  --ink-faint:        #9a8e7b;
  --ink-inverse:      #f6f1e6;

  --rule-subtle:      #e0d5bd;
  --rule:             #d3c6ac;
  --rule-strong:      #b5a684;
  --rule-emphasis:    #8a7c5e;

  --accent:           #8a4b2f;   /* burnt sienna */
  --accent-soft:      #a9714f;
  --accent-ink:       #f6f1e6;

  /* Earthy status colours — saturated web colours read as plastic on paper. */
  --danger:           #8f3128;
  --danger-soft:      #a85a4a;
  --danger-bg:        rgba(143, 49, 40, 0.10);
  --danger-border:    rgba(143, 49, 40, 0.28);

  --warning:          #8a6a1f;
  --warning-soft:     #a98a42;
  --warning-bg:       rgba(138, 106, 31, 0.10);
  --warning-border:   rgba(138, 106, 31, 0.28);

  --success:          #4a6b3f;
  --success-soft:     #6d8a5e;
  --success-bg:       rgba(74, 107, 63, 0.10);
  --success-border:   rgba(74, 107, 63, 0.28);

  --info:             #3d5a6c;
  --info-soft:        #5d7b8d;
  --info-bg:          rgba(61, 90, 108, 0.10);
  --info-border:      rgba(61, 90, 108, 0.28);

  /* Printed forms are square. The whole scale collapses — and because Tailwind
     v4 resolves `rounded-*` through these vars, this single block flattens
     ~530 existing `rounded-*` usages without touching a file. */
  --radius-xs:        2px;
  --radius-sm:        3px;
  --radius-md:        4px;
  --radius-lg:        6px;
  --radius-xl:        6px;
  --radius-2xl:       10px;
  --radius-3xl:       10px;

  /* Paper does not float. Shadows become hairlines. */
  --shadow-panel:     0 1px 0 0 var(--rule);
  --shadow-popover:   0 6px 18px rgba(46, 42, 36, 0.14);
}
```

### 4.2 Tailwind bridge + legacy aliases

```css
@theme inline {
  --color-page:            var(--paper);
  --color-surface:         var(--surface);
  --color-surface-subtle:  var(--paper-subtle);
  --color-surface-raised:  var(--paper-raised);
  --color-surface-hover:   var(--paper-hover);
  --color-surface-sunken:  var(--paper-sunken);
  --color-overlay:         var(--overlay);
  --color-shade:           var(--shade);

  --color-text:            var(--ink);
  --color-muted:           var(--ink-soft);
  --color-faint:           var(--ink-faint);
  --color-text-inverse:    var(--ink-inverse);

  --color-border-subtle:   var(--rule-subtle);
  --color-border:          var(--rule);
  --color-border-accent:   var(--rule-strong);
  --color-border-emphasis: var(--rule-emphasis);

  --color-primary:         var(--accent);
  --color-primary-foreground: var(--accent-ink);

  --color-danger:          var(--danger);
  --color-danger-bg:       var(--danger-bg);
  --color-danger-border:   var(--danger-border);
  --color-warning:         var(--warning);
  --color-warning-bg:      var(--warning-bg);
  --color-warning-border:  var(--warning-border);
  --color-success:         var(--success);
  --color-success-bg:      var(--success-bg);
  --color-success-border:  var(--success-border);
  --color-info:            var(--info);
  --color-info-bg:         var(--info-bg);
  --color-info-border:     var(--info-border);
}
```

This single block does double duty: it generates the Tailwind utilities
(`bg-surface-raised`, `text-muted`, `border-danger-border`, …) **and** emits the
`--color-*` custom properties at `:root`, keeping all 1,626 existing `var(--color-*)`
usages working and making them theme-aware.

> **Radii are deliberately NOT in this block.** Tailwind already owns the `--radius-*`
> namespace and emits `.rounded-xl { border-radius: var(--radius-xl) }`. Declaring the
> scale inside the `[data-theme="…"]` blocks (§4.1) overrides Tailwind's defaults by normal
> cascade — attribute selector beats `:root` — and switches at runtime. Putting them in
> `@theme` too would be redundant and risks a self-referential definition.
> This mechanism is already proven in the current file at `index.css:43`.

### 4.3 Legacy tokens still referenced by name

These exist in the current file and are referenced by app or package code. Keep them,
defined per theme, mapped onto primitives. **Do not rename or "fix" them.**

`--color-ligth-bg` (typo intentional), `--color-secondary`, `--color-turques`,
`--color-turques-r`, `--color-muted-r`, `--color-light-blue`, `--color-light-blue-r`,
`--color-blue-500`, `--color-dark-blue`, `--color-green-turquess`, `--color-danger-r`,
`--bg-app-color`, `--glass-surface`, `--glass-surface-weak`, `--glass-surface-strong`,
`--glass-overlay`, `--glass-highlight`, `--radius-xl`, `--vh`.

> Audit each with `grep -rn "\-\-color-turques" src packages` before deciding its vintage
> value. Several are only used by the map and by chart code.

### 4.4 Font

`src/index.css:41` sets `font-family` on `:root`. Move it into the theme blocks:

```css
:root, [data-theme="dark"] {
  font-family: 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, -apple-system,
               BlinkMacSystemFont, sans-serif;
}
[data-theme="vintage"] {
  font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia,
               'Times New Roman', serif;
  -webkit-font-smoothing: antialiased;
}
```

All faces are system fonts. Nothing is fetched.

---

## 5. Phase 2 — Theme runtime

### 5.1 No-flash bootstrap (do this first)

`admin-app/index.html` is currently minimal. Add a **blocking, non-module** script in `<head>`,
before the app bundle. Without this, every page load flashes the default theme before React
mounts.

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem('beyo.admin.theme');
      document.documentElement.setAttribute(
        'data-theme', t === 'vintage' ? 'vintage' : 'dark'
      );
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
</script>
```

Notes:
- Must **not** be `type="module"` — module scripts are deferred and run after paint.
- The `try/catch` matters: `localStorage` throws in Safari private mode.
- Anything unrecognised falls back to `dark`.

### 5.2 Store

`src/app/theme/theme.types.ts`:

```ts
export const THEME_STORAGE_KEY = 'beyo.admin.theme'
export const THEMES = ['dark', 'vintage'] as const
export type ThemeName = (typeof THEMES)[number]
export const DEFAULT_THEME: ThemeName = 'dark'
export const isThemeName = (v: unknown): v is ThemeName =>
  typeof v === 'string' && (THEMES as readonly string[]).includes(v)
```

`src/app/theme/theme.store.ts` — Zustand, following the existing store conventions in this
app (check `features/auth/login/store/authSessionStore.ts` for the house pattern before
writing). Requirements:

- State: `{ theme: ThemeName }`
- Actions: `setTheme(next: ThemeName)`, `toggleTheme()`
- Persists to `localStorage[THEME_STORAGE_KEY]` on change.
- Initialises from the `data-theme` attribute already stamped by the bootstrap script —
  **not** by re-reading `localStorage`. One reader, one source of truth.
- No `any`. Guard unknown values through `isThemeName`.

### 5.3 Provider

`src/app/theme/ThemeProvider.tsx` — subscribes to the store and writes
`document.documentElement.setAttribute('data-theme', theme)` in an effect. Renders children
unchanged. Wire it into the existing composition in `src/app/providers/`; place it
**outermost** so every subtree (including portals) sees the attribute.

Portals render at `document.body`, which is inside `<html>` — so the attribute selector
covers them automatically. No portal-specific token duplication needed (unlike
client-form-kit, which needs `.client-form-portal` because its tokens sit on a *subtree*
class rather than the root).

### 5.4 Toggle surface

The store + `localStorage` is the source of truth, per the requirement. A visible control is
optional and small — if wiring one, add it to the existing settings section registry
(`features/settings/registry/sectionRegistry.tsx`) rather than inventing a new surface.
Keep the control dumb: it calls `toggleTheme()` and renders the current value. No feature-level
theme logic.

---

## 6. Phase 3 — The mapping table

This is the core artifact. 209 distinct strings, 1,000 occurrences. Neutrals are handled by
**bucket rules**; status colours by **explicit table**.

### 6.1 Bucketing principle

Map by **elevation intent**, never by colour. `bg-white/[0.04]` means "lift this surface one
step" — which is *lighter* on dark and *warmer/darker* on paper. One token name, opposite
directions per theme. This is why a naive white→ink find-replace produces garbage.

### 6.2 Neutral buckets (~700 occurrences)

**`bg-white/*` → surface scale**

| Source opacities | Token utility |
|---|---|
| `[0.02]` `[0.025]` `[0.03]` `[0.035]` | `bg-surface-subtle` |
| `[0.04]` `[0.045]` `[0.05]` `[0.055]` `/5` `/6` | `bg-surface-raised` |
| `[0.06]` `[0.07]` `[0.08]` `/8` `/10` | `bg-surface-hover` |
| `[0.09]` `[0.1]` `[0.11]` `[0.12]` `/12` | `bg-surface-sunken` |
| `/24` `/40` `/92` and bare `bg-white` | **REVIEW — do not auto-map** (§6.5) |

**`border-white/*` → rule scale**

| Source opacities | Token utility |
|---|---|
| `[0.05]` `[0.06]` `/8` | `border-border-subtle` |
| `[0.08]` `/10` `/12` `/14` `/15` | `border-border` |
| `/18` `/20` `/22` `/25` `/30` | `border-border-accent` |
| `/45` `/70` `/75` `/80` | `border-border-emphasis` |

**`text-white/*` → ink scale**

| Source opacities | Token utility |
|---|---|
| bare, `/88` `/92` `/95` | `text-text` |
| `/60` `/62` `/64` `/68` `/70` `/72` `/75` `/76` `/80` `/82` | `text-muted` |
| `/24` `/40` `/42` `/45` `/46` `/48` `/56` | `text-faint` |

**`bg-black/*`**

| Source opacities | Token utility |
|---|---|
| `[0.02]` `[0.03]` `[0.04]` `/5` `/10` | `bg-shade` |
| `/20` `/28` `/34` `/35` `/38` `/40` `/50` `/60` | `bg-overlay` |
| bare `bg-black` | **REVIEW** |

**Misc neutrals:** `ring-white/[0.08]` → `ring-border`; `ring-white/30` → `ring-border-accent`;
`divide-white/8` → `divide-border-subtle`; `text-slate-100` → `text-text`;
`border-slate-300/25` → `border-border-accent`; `bg-slate-300/[0.10]` → `bg-surface-sunken`.

### 6.3 Status colour families (~250 occurrences)

Family assignment: **red / rose → danger**, **amber / yellow → warning**,
**emerald / green / lime → success**, **sky / cyan / blue → info**.

Role by utility prefix and shade:

| Source shape | Token |
|---|---|
| `text-{family}-{100..500}` (incl. `/opacity`) | `text-{status}` |
| `text-{family}-50/95`, `text-{family}-{100,200}` used as copy-on-tint | `text-{status}` |
| `bg-{family}-*` at opacity ≤ `/15` or `[0.06]`–`[0.14]` | `bg-{status}-bg` |
| `border-{family}-*` at any opacity | `border-{status}-border` |
| `stroke-{family}-400` | `stroke-{status}` |
| `bg-{family}-{400..700}` **solid, no opacity** | **REVIEW** — these are filled buttons/badges |

Worked examples from the real corpus:

```
text-red-500        → text-danger
text-red-400        → text-danger
text-red-300        → text-danger
text-rose-100       → text-danger
bg-red-500/[0.12]   → bg-danger-bg
bg-red-500/[0.06]   → bg-danger-bg
border-red-400/20   → border-danger-border
border-rose-300/35  → border-danger-border

text-amber-300      → text-warning
text-amber-100      → text-warning
text-amber-50/95    → text-warning
bg-amber-300/[0.12] → bg-warning-bg
border-amber-300/25 → border-warning-border

text-emerald-300    → text-success
bg-emerald-300/[0.12] → bg-success-bg
border-emerald-300/25 → border-success-border
stroke-emerald-400  → stroke-success

text-sky-100        → text-info
text-cyan-200/80    → text-info
bg-sky-300/[0.12]   → bg-info-bg
border-cyan-300/25  → border-info-border
```

### 6.4 Radii — mostly free, small codemod

**Do not tokenize standard `rounded-*` utilities.** Tailwind v4 already resolves them
through `--radius-*` theme variables, and this codebase already exploits that
(`--radius-xl: 1.5rem` at `index.css:43`). Redefining the scale per theme (§4.1) re-themes
all of these with **zero file edits**:

| Utility | Count | Action |
|---|---|---|
| `rounded-full` | 229 | **leave** — pills/avatars stay circular in both themes |
| `rounded-xl` | 85 | leave — driven by `--radius-xl` |
| `rounded-lg` | 81 | leave — driven by `--radius-lg` |
| `rounded-md` | 73 | leave — driven by `--radius-md` |
| `rounded-2xl` | 66 | leave — driven by `--radius-2xl` |
| `rounded` `rounded-sm` `rounded-none` | ~16 | leave |

Only the **arbitrary** radii need rewriting, because `rounded-[28px]` is a literal
(~160 occurrences across 12 distinct values):

| Source | Replace with |
|---|---|
| `rounded-[16px]` `rounded-[18px]` `rounded-[1.1rem]` | `rounded-2xl` |
| `rounded-[20px]` `rounded-[22px]` `rounded-[24px]` `rounded-[26px]` `rounded-[28px]` | `rounded-3xl` |

> **Dark-parity caveat — flag to the user before writing.** This is the one place the
> pixel-identical gate cannot hold exactly: `rounded-[28px]`, `[26px]`, `[24px]`, `[22px]`
> and `[20px]` all collapse onto `--radius-3xl` (1.5rem = 24px). Deltas are 0–4px on
> container corners.
>
> Two options — **ask the user which**:
> - **(a) Accept the drift** (recommended). Simplifies 12 radii to a real scale, which is
>   what makes the vintage theme coherent. Cost: sub-4px corner changes on some dark panels.
> - **(b) Preserve exactly.** Add dedicated tokens (`--radius-panel-sm/md/lg`) whose dark
>   values are the exact px and whose vintage values are 6–10px. Zero drift, larger token set.
>
> If unanswered, implement **(a)** and list every changed radius in the commit message.

### 6.5 REVIEW list — excluded from the codemod

These are **intentionally light surfaces** or **solid fills** that must not be blindly
tokenized. Codex must open each and decide individually.

**Bare `bg-white` (9 files)** — white surfaces that are deliberately white:

```
features/costumer/components/detail/CostumerDetailInfoSummary.tsx
features/costumer/components/detail/CostumerDetailOperatingHoursSummary.tsx
features/costumer/components/detail/CostumerDetailOrdersSection.tsx
features/messaging/emailMessage/components/EmailPreview.tsx
features/order/components/cards/DraggableOrderCard.tsx
features/order/components/cards/OrderGroupDragOverlayCard.tsx
features/order/components/clientFormLink/ClientFormLinkModal.tsx
features/plan/routeGroup/components/overlays/RouteGroupMarkerGroupOverlay.tsx
shared/inputs/Switch.tsx
```

**Light-palette usage (12 files)** — `text-gray-900`, `bg-blue-100`, `text-blue-700` etc.:

```
features/costumer/components/CostumerSearchBar/CostumerSearchBar.tsx
features/home-route-operations/components/TestSection.tsx
features/order/components/OrderMissingInfoNotifier.tsx
features/order/components/clientFormLink/ClientFormLinkModal.tsx
features/order/components/pageHeaders/OrderMainHeader.tsx
features/order/forms/orderForm/components/DeliveryWindowCalendar/DeliveryWindowCalendarShell.flow.ts
features/order/manualMessage/components/ManualMessageEventCard.tsx
shared/inputs/CustomTimePicker/components/PickerFooter.tsx
shared/inputs/OperatingHoursEditor.tsx
shared/inputs/TagInput.tsx
shared/inputs/address-autocomplete/SuggestionSelector.tsx
shared/spiners/loading-bar/LoadingBar.tsx
```

**Whole trees excluded — must stay light in both themes:**

- `features/templates/printDocument/**` — print/PDF templates. A printed document is white
  paper regardless of app theme. Excluding `*.pdf.ts` files is mandatory.
- `features/messaging/emailMessage/components/EmailPreview.tsx` and the email editor
  components — these render a preview of an *email*, whose appearance is fixed by the
  recipient's mail client, not by the admin theme.

Add these as explicit path exclusions in the codemod config.

---

## 7. Phase 4 — The codemod

### 7.1 Requirements

Write `scripts/theme-codemod.mjs` (Node, no new dependencies — use `node:fs` and
`node:path`). It must:

1. Accept `--dry-run` (default) and `--write`.
2. Read the mapping table from a sibling `scripts/theme-map.json` so the table is
   reviewable and diffable independently of the script logic.
3. Walk `src/**/*.{ts,tsx}`, skipping the exclusion paths from §6.5.
4. Replace only within `className` string contexts. **Word-boundary match on the full
   utility token** — `bg-white/[0.04]` must not partially match inside `bg-white/[0.045]`.
   Sort mapping keys longest-first before applying.
5. Preserve variant prefixes: `hover:`, `focus:`, `group-hover:`, `md:`, `dark:`, `data-[…]:`,
   `peer-*`, `aria-*`. Match on the utility *after* the final `:`.
6. Emit a report: per-file change counts, total replacements, and — critically — a
   **list of every hardcoded palette utility it did NOT map**, so nothing is silently missed.
7. Be idempotent. Running twice must produce no second-pass changes.

### 7.2 Execution order

```
node scripts/theme-codemod.mjs --dry-run   # review the report + unmapped list
node scripts/theme-codemod.mjs --write
npx tsc --noEmit
npm run build
git diff --stat
```

Commit the codemod result as **one commit, separate from Phase 1 and 2**, so it can be
reverted independently.

### 7.3 Guard against regression

After `--write`, run the executable regression guard:

```bash
npm run theme:regression
```

It checks both hardcoded palette utilities and numeric functional colours matching
`rgba?\([0-9]{1,3},\s*[0-9]{1,3},\s*[0-9]{1,3}`. Approved black shadows,
Phase 7b review values and mandatory exclusion paths are count-pinned in
`scripts/theme-functional-color-allowlist.json`, so new literals fail the guard.

Accepted debt: 39 inline black box-shadow literals retain their dark values. Vintage
therefore does not receive the token layer's hairline `--shadow-panel` treatment.

---

## 8. Phase 5 — Structural CSS

These need theme-scoped **rule bodies**, not just swapped values.

### 8.1 Glass panels (~130 usages, 5 classes)

`admin-glass-panel`, `admin-glass-panel-strong`, `admin-glass-popover`,
`admin-glass-divider`, `admin-surface-compact`, plus `admin-toolbar-strip`,
`admin-glass-action-bar`, `admin-backdrop-blur-md`, `admin-backdrop-blur-xl`.

Dark keeps its current definitions verbatim. Vintage overrides:

```css
[data-theme="vintage"] .admin-glass-panel,
[data-theme="vintage"] .admin-glass-panel-strong,
[data-theme="vintage"] .admin-glass-popover {
  background: var(--paper-raised);
  border: 1px solid var(--rule);
  box-shadow: none;
  backdrop-filter: none;
}
[data-theme="vintage"] .admin-glass-popover {
  box-shadow: var(--shadow-popover);
}
[data-theme="vintage"] .admin-backdrop-blur-md,
[data-theme="vintage"] .admin-backdrop-blur-xl,
[data-theme="vintage"] .admin-glass-action-bar {
  backdrop-filter: none;
  background: var(--paper-raised);
}
```

Rationale: blurred translucent glass is the defining gesture of the dark theme and the
*opposite* of printed stationery. Redefining 5 class bodies re-themes ~130 call sites.

### 8.2 Icon helper classes — **easy to miss, high impact**

`src/index.css:67-106` defines `.app-icon` (`#b5bbc5`), `.app-icon-white` (`#ffffff`),
`.app-icon-dark` (`#828282`), `.app-icon-page` (`var(--color-page)`). All hardcode hex and
set `fill`/`stroke` on descendant `path`.

`.app-icon-white` renders **invisible on cream paper**. Scope all four per theme:

```css
[data-theme="vintage"] .app-icon       { color: var(--ink-soft); }
[data-theme="vintage"] .app-icon-white,
[data-theme="vintage"] .app-icon-dark  { color: var(--ink); }
[data-theme="vintage"] .app-icon-white path,
[data-theme="vintage"] .app-icon-dark  path { color: var(--ink); }
```

Keep the `fill: currentColor; stroke: currentColor` mechanics unchanged.

### 8.3 Auroras, grid overlay, body gradient

`src/index.css:233-382` — `.admin-app-shell`, `.admin-shell-aurora--{one,two,three}`,
`.admin-auth-aurora--{one,two}`, `.admin-auth-grid`, the `admin-auth-lava` keyframes, plus
the `body` radial gradients at lines 55-58.

These use `mix-blend-mode: screen`, which **only works over a dark backdrop** — on paper it
produces washed-out grey smears. Do **not** try to recolor them.

**Switch them off in vintage** rather than deleting them. This keeps the dark theme intact
and is fully reversible:

```css
[data-theme="vintage"] .admin-shell-aurora,
[data-theme="vintage"] .admin-auth-aurora,
[data-theme="vintage"] .admin-auth-grid,
[data-theme="vintage"] .admin-app-shell::before { display: none; }

[data-theme="vintage"] .admin-app-shell { background: var(--paper); }
[data-theme="vintage"] body {
  background-image:
    radial-gradient(120% 70% at 50% 0%, rgba(255, 252, 245, 0.55), transparent 62%),
    radial-gradient(90% 60% at 50% 100%, rgba(150, 130, 96, 0.10), transparent 58%);
}
```

The vintage `body` gradient is lifted from the external app's `.vintage-paper-wash`
(`external-operations-app/src/index.css`) — the entire decorative budget of that design.

### 8.4 `shared/map/map.css` — separate task, assess first

360 lines, 53 colour literals: marker fills (`#0034c1`), tooltips (`rgba(8, 12, 30, 0.88)`),
route-line colours, cluster badges. Map markers must stay legible against **map tiles**, not
against the app background — so they are only partly a theming concern.

**Recommendation:** treat as a follow-up. Tokenize only the chrome that sits on the app
surface (tooltips, legends, control panels); leave marker/route colours alone in both themes.
Report findings rather than guessing. If the map tile layer itself has a light/dark variant,
switching it is a separate decision for the user.

### 8.5 Other CSS to sweep

`::selection` (line 108), `.popup-overlay` (line 150), `.scroll-thin` scrollbar colours
(lines 158-176, hardcoded `#d9d9d9`), `.local_delivery-color` / `.international_shipping-color`
/ `.store_pickup-color` (lines 178-186 — note `#ffff`, a malformed 4-digit hex; leave the
value alone unless verifying it renders as intended), `.slate-editor` rules.

---

## 9. Phase 6 — QA

### 9.1 Dark-theme regression (the gate)

Before any visual QA of vintage, prove dark is unchanged. Preferred method: capture
screenshots of the screens in §9.3 on `main`, re-capture after the change with
`data-theme="dark"`, and diff. Any delta is a mapping bug.

### 9.2 Switching correctness

- Toggle persists across full page reload.
- **No flash of wrong theme** on reload in either theme (hard-refresh, throttled network).
- Safari private mode (localStorage throws) falls back to dark without crashing.
- Portalled surfaces re-theme: popovers, dropdowns, modals, toasts, date/time pickers,
  address autocomplete, phone prefix list.
- Two tabs open: changing theme in one does not corrupt the other's state.

### 9.3 Screens to check in **both** themes

Orders list + order detail (all tabs) · Order form incl. delivery-window calendar ·
Route groups page + rail + stats overlay + map · Zones management + zone form ·
Plan / route operations · Messaging (SMS + email editors, template lists) ·
Client form config (rules, terms, media) · Settings (all sections) · Team + invitations ·
Infrastructure (vehicle, facility) · Item configurations · Integrations ·
Auth + trusted device · AI analytics · Print templates (**must be unchanged in both**) ·
External form pages.

### 9.4 Specific risks to verify in vintage

- Contrast: `--ink-faint` (`#9a8e7b`) on `--paper-raised` (`#f6f1e6`) is ~3.2:1 — acceptable
  for large/secondary text, **not** for body copy. Check every `text-faint` site.
- Focus rings and `:focus-within` states remain visible on paper.
- Disabled states still read as disabled without the dark theme's opacity tricks.
- Charts and any canvas/SVG data-viz with baked colours.
- Drag-and-drop overlays and ghost cards (several use bare `bg-white`).
- Skeleton/loading shimmers — these usually animate a white gradient.

---

## 10. Verification commands

```bash
cd Front_end/admin-app/src

# remaining hardcoded palette utilities (target: 0 outside review paths)
grep -roE '\b(bg|text|border|ring|from|to|via|fill|stroke|divide|shadow|outline)-(white|black|slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(-[0-9]{2,3})?(/(\[[0-9.]+\]|[0-9]{1,3}))?' \
  --include='*.tsx' --include='*.ts' . | wc -l

# distinct remaining, ranked — drives the next codemod pass
grep -rhoE '<same pattern>' --include='*.tsx' --include='*.ts' . | sort | uniq -c | sort -rn

# raw hex literals
grep -rn '#[0-9a-fA-F]\{3,8\}' --include='*.tsx' --include='*.ts' . | wc -l

# token usages that should NOT change (baseline 1626)
grep -ro 'var(--[a-z-]*' --include='*.tsx' --include='*.ts' . | wc -l
```

---

## 11. Commit sequence

One logical change per commit, each independently revertible:

1. `theme: add dual token blocks and Tailwind bridge` — `index.css` only. Dark unchanged.
2. `theme: add runtime theme store, provider and no-flash bootstrap` — `app/theme/`, `index.html`, providers.
3. `theme: add codemod script and mapping table` — `scripts/` only, no source edits.
4. `theme: tokenize hardcoded palette utilities` — the codemod output, 204 files.
5. `theme: scope glass, icon and aurora classes per theme` — structural CSS.
6. `theme: resolve review-list surfaces individually` — the §6.5 files.
7. *(optional)* `theme: add settings toggle control`
8. *(follow-up)* map.css

Verify `tsc --noEmit` and `npm run build` pass after **each** commit, not just at the end.

---

## 12. Rollback

- Commits 4–6 revert cleanly and independently.
- Reverting commit 1 alone would break commit 4's token references — revert in reverse order.
- Emergency kill switch without any revert: hardcode `data-theme="dark"` in `index.html`
  and remove the provider's effect. The app returns to the current design entirely.

---

## 13. Open questions for the user

0. **Radius drift in dark theme** (§6.4) — accept 0–4px corner changes to collapse 12
   arbitrary radii onto a real scale (option a, recommended), or preserve dark exactly with
   a larger token set (option b)? This is the only known violation of the pixel-identical
   gate. Plan assumes (a).
1. **Toggle surface** — localStorage-only (dev flag), or a visible control in Settings?
   Plan assumes localStorage-only with the control as an optional add-on (§5.4).
2. **Per-user vs per-device** — `localStorage` is per-device. Should theme instead persist
   on the user profile so it follows them across machines? That would need a backend field.
3. **Map** (§8.4) — tokenize map chrome now, or defer the whole map to a follow-up?
   Plan defers.
4. **Print/email templates** — confirmed they must stay light in both themes? Plan assumes yes.

---

## 14. Reference files

| Purpose | Path |
|---|---|
| Vintage palette source of truth | `packages/client-form-kit/src/styles/client-form.css` |
| Vintage reference implementation | `external-operations-app/src/features/clientForm/pages/ClientFormPage.tsx` |
| Vintage paper wash | `external-operations-app/src/index.css` |
| Current admin tokens | `admin-app/src/index.css:11-45` |
| Structural classes to scope | `admin-app/src/index.css:67-106, 233-448` |
| Map styles (follow-up) | `admin-app/src/shared/map/map.css` |
| Architecture contract | `Front_end/AGENTS.md`, `Front_end/CLAUDE.md` |
