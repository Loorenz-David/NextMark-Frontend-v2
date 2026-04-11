# Messaging Context Snapshot (Frontend)

## Date
- 2026-03-19

## Purpose
This file captures the current messaging-feature implementation context so work can resume later from the debugging stage without re-discovering the new editor architecture and UI decisions.

## Scope Implemented
1. Settings-shell modernization for the `messaging` feature.
2. SMS template editor redesign into a phone-preview composition workflow.
3. Email template editor redesign into a live email-preview canvas workflow.
4. Page-level scrolling cleanup for SMS and email editors.
5. Shared editor and warning visual alignment with the dark-glass admin system.

## Messaging Feature Shell
1. `MessagesMainPage` owns the feature hero and page-level scrolling.
2. `MessagesLayout` owns the SMS/Email tab shell and should not trap inner scroll.
3. The correct scroll behavior is:
   - outer messaging page scrolls
   - SMS/email editor surfaces do not create their own primary scroll container
4. If scrolling breaks again, inspect:
   - `src/features/messaging/pages/MessagesMainPage.tsx`
   - `src/features/messaging/layout/MessagesLayout.tsx`
   - editor route pages for any reintroduced `overflow-y-auto` / `overflow-hidden`

## SMS Editor Architecture
1. `SmsTemplateEditor` is SMS-local and no longer relies on the generic stacked `TemplateEditor` layout.
2. Layout contract:
   - left: `SmsPhonePreview`
   - right: `SmsLabelsPanel`
   - top: workflow strip explaining compose -> insert labels
3. `SmsPhonePreview` contains the real Slate editor inside the outgoing message bubble.
4. Labels are still inserted through shared `insertLabel(...)`.
5. Visual decisions already locked:
   - darker phone shell
   - reduced bubble glow
   - clearer relationship between labels panel and message bubble
6. SMS editor page must scroll at page level, not inside the phone preview card.

## Email Editor Architecture
1. `EmailTemplateEditor` is now email-local and no longer uses the previous stacked `Header / Body / Footer Buttons` form sections.
2. Layout contract:
   - left: `EmailTemplatePreviewCanvas`
   - right: `EmailLabelsPanel` + `EmailPrimaryCtaEditor`
3. Editable regions:
   - `header` is edited inside the live preview and is single-line
   - `body` is edited inside the live preview and is multi-line
4. Label insertion is focus-aware:
   - inserts into the last focused region
   - defaults to `Body` if none focused yet
   - clicking a label should not shift the interaction away from the active region
5. Footer CTA contract:
   - the builder exposes one primary footer button
   - it maps to `footerButtons[0]`
   - extra legacy `footerButtons[1+]` remain preserved and untouched
6. The old editor-facing iframe preview is out of scope and replaced in the editor view by the live canvas.

## Shared Editor/Field Notes
1. `SlateEditor` now accepts additive styling/focus hooks used by SMS/email custom canvases.
2. `InputWarning` was restyled to a dark translucent warning surface and is used by newer forms/popups.
3. Phone prefix dropdowns were standardized to dark glass in the shared phone-field owners.

## Likely Debug Resume Points
1. Cursor or label-insertion bugs:
   - `src/shared/inputs/TemplateEditor/withLabels.ts`
   - `src/shared/inputs/TemplateEditor/SlateEditor.tsx`
   - SMS/email local editor components
2. Scroll regressions:
   - messaging page root
   - messaging layout shell
   - editor pages reintroducing inner overflow
3. Preview styling regressions:
   - `SmsPhonePreview.tsx`
   - `EmailTemplatePreviewCanvas.tsx`
4. CTA persistence questions:
   - `src/features/messaging/emailMessage/types/emailTemplate.ts`
   - `src/features/messaging/emailMessage/hooks/useEmailMessageEditor.ts`

## Resume Instruction
When resuming messaging debugging, load this file first, then inspect the SMS/email local editor components before changing shared editor primitives.
