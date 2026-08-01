# AdaptiveCash Documents & Signing

A Documents & Signing vertical slice shared by two portal applications. The Documents feature
is implemented once and composed into both portals through a module contract; the portals
differ only in their tenant and permissions.

See `DECISIONS.md` for architecture and trade-offs, `AI-NOTES.md` for AI usage, and
`TIMELOG.md` for how the time was spent.

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+
- .NET 10 SDK

## Run it

Three processes. The API first, since both portals proxy `/api` to it.

```bash
npm install

npm run api            # http://localhost:5080
npm run dev:branch     # http://localhost:5173
npm run dev:customer   # http://localhost:5174
```

The API creates and seeds `src/Portal.Api/portal-takehome.db` on first start. To reset it,
stop the API, delete the `portal-takehome.db*` files, and start it again.

## Checks

```bash
npm run check                        # typecheck, frontend tests, both production builds
dotnet test AdaptiveCash.TakeHome.sln
```

Both pass: 13 frontend tests across 4 files, 9 backend tests, 0 skipped.

## Fixtures

No login. Each portal hardcodes its user and tenant, which is what a real identity provider
would supply.

| Portal | Tenant | Permissions |
|---|---|---|
| Branch (`:5173`) | `branch-demo` | `Documents.View`, `Documents.Sign`, `documents.viewAmount` |
| Customer (`:5174`) | `customer-demo` | `Documents.View` |

Seeded documents are `BR-DOC-001..003` for `branch-demo` and `CU-DOC-001..002` for
`customer-demo`. `BR-DOC-001` starts as `ReadyForSignature`, so it is the one to sign.

Every API request carries `X-Tenant-Id`. Requesting another tenant's document returns `404`.

## Trying the signing flow

Open `BR-DOC-001` in the Branch Portal and press **Sign document**. After confirming, the
document moves to `Signing` and the session panel tracks the provider:

`Pending` → `AwaitingProvider` (≈2s, countdown appears) → `Verified` (≈7s)

Polling then stops and the list refreshes itself. The Customer Portal never shows a Sign
action, and the Amount column only appears for a user holding `documents.viewAmount`.

### Forcing the failure paths

The fake provider takes a test-only header. It defaults to `Success` when absent, so
production behaviour does not depend on it.

```bash
# 503 — provider refused before accepting; retry with the SAME key succeeds
curl -i -X POST http://localhost:5080/api/documents/BR-DOC-001/signing-sessions \
  -H 'X-Tenant-Id: branch-demo' -H 'Idempotency-Key: demo-1' \
  -H 'X-Fake-Provider-Scenario: UnavailableBeforeAcceptance' \
  -H 'Content-Type: application/json' -d '{"documentId":"BR-DOC-001"}'

# 504 — provider accepted but the response was lost; retry with the SAME key reconciles
#        onto that acceptance instead of creating a second session
curl -i -X POST http://localhost:5080/api/documents/BR-DOC-001/signing-sessions \
  -H 'X-Tenant-Id: branch-demo' -H 'Idempotency-Key: demo-2' \
  -H 'X-Fake-Provider-Scenario: TimeoutAfterAcceptance' \
  -H 'Content-Type: application/json' -d '{"documentId":"BR-DOC-001"}'
```

Repeating a POST with a *new* key while a session is live returns `409` with
`code: ACTIVE_SESSION` and the existing session ID, which the UI attaches to rather than
retrying.

## Layout

```
apps/
  branch-portal/          composition root: config + module list
  customer-portal/        the same, different tenant and permissions
packages/
  platform-core/          shell, module contract, tenant/user/permission context, providers
  documents-feature/      routes, pages, query and mutation hooks, signing flow
  api-client/             typed client with tenant header, AbortSignal, ProblemDetails
  router-lite/            History API router
  design-tokens/          Fluent theme and CSS tokens
  shared-ui/              shared presentational components
  testing/                fixtures, mock API, test setup
src/
  Portal.Api/
    Application/          business rules and the ports they depend on
    Infrastructure/       adapters: repositories, fake provider, tenant context
    Data/                 EF Core model and seed data
    Endpoints/            HTTP mapping only
  Portal.Api.Tests/
```
