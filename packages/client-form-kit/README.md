# @client-form-kit

The customer-facing delivery-details form, in one implementation.

Two surfaces render it, and a customer fills it in both cases:

| Host | Reached by | Transport |
|---|---|---|
| `external-operations-app` | a link emailed or texted to the customer | single-use token over HTTP |
| `admin-app` | a device handed over the counter in the store | team-scoped socket room |

## What the kit owns

The three steps, their validation and navigation, the terms document, the rules
gate, the consent block, the items ledger, and the stationery theme.

## What the host owns

The route, every screen around the form (loading, expired, thank-you, "waiting
for a request"), and how the answers travel. The last of these reaches the kit
as `ClientFormPorts`:

```ts
const ports: ClientFormPorts = {
  submit: async (data) => ({ status: 'submitted' }),
  refreshConfig: async () => config,   // optional
}
```

`submit` returns one of three outcomes, never a transport error:

- `submitted` — accepted; the kit calls `onSubmitted`
- `rejected` — correctable; `message` is shown inline. Set `refreshConfig: true`
  when stale configuration caused it and the kit will re-read it, drop any terms
  acceptance, and keep every answer already typed
- `terminated` — over, and the host has already replaced the screen

Anything transport-shaped — an expired token, a dropped socket — is classified
in the host's adapter, so the kit never learns what a token is.

## Capabilities are configuration, not branches

Terms, rules, media and the marketing opt-in are driven entirely by
`ClientFormConfig`. A host with nothing configured passes
`EMPTY_CLIENT_FORM_CONFIG` and gets the reduced form. There is no host flag
anywhere in the kit, and adding a capability to one surface is a config change,
not a code change.

`config` is read once at mount. A host that swaps it wholesale remounts the
provider under a new `key`; one whose config can change mid-session supplies
`ports.refreshConfig`.

## Media

`MEDIA_PLACEMENTS` mirrors
`Delivery_app_BK/services/domain/client_form/media_placement.py`. A value missing
from that list is dropped by `mapClientFormConfig`, so the two must not drift.

The enum holds three placements, and `ClientFormFrame` renders all of them:

| Placement | Where | Phone |
|---|---|---|
| `sidebar_left` | vertical strip left of the form column | not rendered |
| `sidebar_right` | vertical strip right of the form column | not rendered |
| `carousel` | product cards under the form | under the form |

Every media component returns `null` for an unconfigured placement, so a team
with no media configured gets exactly the centred column the form has always
been. Nothing is opt-in.

The media components take their items as props and read no context, so they run
wherever there is a config — including screens with no form session behind them:
an in-store device showing what is on offer while it waits for a request, or a
confirmation screen rendered after the provider has unmounted. `ClientFormFrame`
takes `config` for the same reason, which is why it is passed rather than read.

## Usage

```tsx
import '@client-form-kit/styles/client-form.css'
import { ClientFormFrame, ClientFormProvider, ClientFormSteps } from '@client-form-kit'

<div className="client-form-theme">
  <ClientFormProvider
    meta={meta}
    config={config}
    ports={ports}
    storage={{ storageNamespace, savedLocationsIntentKey }}
    onSubmitted={handleSubmitted}
  >
    <ClientFormFrame>
      <header>…</header>
      <ClientFormSteps />
    </ClientFormFrame>
  </ClientFormProvider>
</div>
```

Two things are easy to miss and both fail quietly:

- **The theme class.** Tokens are scoped to `.client-form-theme` rather than
  `:root`, because the admin app is dark everywhere except this route. Without
  a wrapping element carrying the class the form renders unstyled.
- **The sizing scale.** Every size in the kit reads a `--cf-*` token rather than
  a literal, and `client-form.css` redefines the whole set under
  `@media (pointer: coarse), (max-width: 900px)` — the counter tablet and the
  phone. A host rendering its own masthead or notice must read the tokens too
  (`text-[length:var(--cf-title)]`, `var(--cf-body)`, …); a literal there is a
  block of text that stays desktop-sized while the form around it grows.
- **The Tailwind source.** Each host must scan this package —
  `@source "../../packages/client-form-kit/src";` under Tailwind v4, or a
  `content` glob under v3 — or every utility class here is purged.

`storage` namespaces the saved delivery locations and the remembered phone
prefix. A shared in-store device and a customer's own browser must never be
handed the same one.
