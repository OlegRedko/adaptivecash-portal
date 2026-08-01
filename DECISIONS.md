# Decisions

## Package boundaries

```
apps/branch-portal        composition root: config + module list, ~20 lines
apps/customer-portal      identical file, different tenant and permissions
packages/platform-core    shell, module contract, tenant/user/permission context, providers
packages/documents-feature routes, pages, query and mutation hooks, signing flow
```

The two apps differ only in a `PortalConfig` object. Every screen comes from
`documents-feature`, registered through `createDocumentsModule()`, which contributes
navigation, routes and the permission each route requires. `documents-feature` imports
`platform-core`; neither package imports an app.

Adding a second business module means appending to the `modules` array — the shell derives
its navigation and routing from whatever the modules declare, so nothing in the shell needs
editing.

`platform-core` defines the ports it needs and knows nothing about documents.
`shared-ui`, `design-tokens`, `router-lite` and `api-client` were provided and are unchanged.

On the backend the same inversion applies: `Application/Signing` holds the business rules and
declares the interfaces it depends on; `Infrastructure/Repositories` implements them.
`SigningSessionService` has no EF Core import, so it is testable with fakes.

## State ownership

| State | Owner | Example |
|---|---|---|
| Server state | TanStack Query | documents, signing sessions |
| URL state | `router-lite` + `useDocumentFilters` | search, status, selected document |
| Local UI state | `useState` | confirmation dialog open |
| Non-render state | `useRef` | single-flight guard, idempotency key |
| Durable state | database | documents, sessions, idempotency records |

No Zustand or Redux. Nothing needed sharing across features, and adding a client store for
data the server already owns would have created a second source of truth.

Filters live in the URL, so refresh and back/forward restore them, and the drawer is driven by
`/documents/:documentId` rather than component state — a deep link opens it directly.

## Query-key strategy

```ts
list:    ['documents', tenantId, 'list', search, status]
detail:  ['documents', tenantId, 'detail', documentId]
session: ['signing-sessions', tenantId, sessionId]
```

Tenant sits directly after the namespace, so `['documents', tenantId]` is a prefix that
invalidates everything for one tenant and cannot touch another's cache. Two portals in one
browser profile keep separate caches even for the same document ID.

Search and status are part of the key rather than filter arguments, so a slow response for an
old filter resolves into its own cache entry instead of overwriting the current one.
`keepPreviousData` keeps the previous rows visible while a new key loads.

## Idempotency lifecycle and 409/503/504 behaviour

The key is generated once per attempt and held in a ref. It is reused for every retry of that
attempt, and only cleared by `startNewAttempt()` after a terminal `Failed` or `Expired`.

| Response | Backend | UI |
|---|---|---|
| `201` | Record completed, session stored | Track the session, poll |
| `200` | Key replayed, existing session returned | Same as 201 |
| `409 ACTIVE_SESSION` | Document already has a live session | Attach to `existingSessionId`, no Retry offered |
| `409 IDEMPOTENCY_KEY_REUSED` | Same key, different request fingerprint | Surface the error, no retry |
| `503` | Provider refused before accepting | Retry with the **same** key |
| `504` | Provider accepted, response lost | Retry with the **same** key, which reconciles |

Durability comes from an `IdempotencyRecord` row guarded by a unique index on
`(TenantId, Operation, Key)`. Concurrency is handled twice over: the loser of the insert race
reads the winner's result, and the session ID is derived from
`SHA256(tenant|document|key)` so a duplicate insert collides on the primary key instead of
creating a second session.

The 504 path is the interesting one. The provider stores its acceptance and then the response
is lost, so the retry looks up `provider.FindAsync(...)` before creating anything and adopts
what already exists. After 503 nothing was accepted, so the same key genuinely re-attempts.

The UI never assigns a status. Polling reads `GET /api/signing-sessions/{id}` every 2s and
stops when the server reports a terminal status; invalidation then happens in an effect, so
the query function has no write side effects.

## Deliberately not implemented

- **No paging or virtualisation.** The list renders the whole result set. With ~250 seeded
  documents per tenant this is already visible, and it is the first thing I would change.
- **Amount column is hardcoded to 0.** No amount exists in the schema or API. The column is
  present and gated on `documents.viewAmount` to demonstrate the permission, nothing more.
- **Type column shows the document title.** There is no separate type field.
- **The drawer reads its document from the loaded list** rather than fetching independently.
  A deep link to `/documents/:id` before the list resolves shows a fallback message.
  `useDocumentQuery` exists for this and is currently unused.
- **Mobile is a horizontally scrolling table**, not the card layout the brief suggests.
- **No ESLint config.** Prettier is configured; lint was cut for time.
- **Idempotency records are never expired.** A production system would need a retention job.
- **Accessibility is unaudited.** Semantic elements, dialog focus handling, `aria-live`
  regions and non-colour status indicators are in place, but nothing was verified with a
  screen reader or an automated axe run.

## What would change for production

**Authentication is the largest gap.** `TenantContext` reads `X-Tenant-Id` from a header with
no authenticated principal behind it, so any client can claim any tenant. This came with the
starter and I left it, but it means the tenant boundary is currently a convention rather than
a control. In production the tenant would be derived from a validated token, and the frontend
permission checks would stay what they are — a way to avoid showing actions that will fail,
never a security boundary.

**The provider progression is driven by reads.** `GET /api/signing-sessions/{id}` advances the
simulated status and writes it. That was the starter's behaviour and I kept it while moving it
into a service. A real provider would deliver a callback, or a background worker would
reconcile; the read path would then be a pure read.

Also for production: a retention policy for idempotency records, structured logging with a
correlation ID propagated from the frontend, server-side paging, and a hosted job to expire
sessions rather than relying on someone polling them.
