# AdaptiveCash Documents & Signing — starter repository

This repository is deliberately incomplete: infrastructure and deterministic dependencies are provided, while the candidate owns the platform composition, Documents feature and reliable signing POST.

## Prerequisites

- Node.js 22 (or a version allowed by `package.json`)
- npm 10+
- .NET 10 SDK

## Included and ready

- React 19, TypeScript and Vite
- two portal apps (`branch-portal`, `customer-portal`)
- Fluent UI v9 and TanStack Query providers
- `router-lite` based on the browser History API
- typed `DocumentsApi` with tenant header, AbortSignal and ProblemDetails errors
- deterministic frontend fixtures and controllable mock API
- .NET 10 Minimal API
- EF Core SQLite file database and seed data
- fake signature provider with success, pre-acceptance 503 and post-acceptance 504 behavior
- list/detail/session read endpoints
- a compile-safe `501 Candidate TODO` POST endpoint
- xUnit test project and candidate test skeletons

## Install and run

```bash
npm install
# commit the generated package-lock.json with the solution
npm run check
npm run api
npm run dev:branch
npm run dev:customer
```

API: `http://localhost:5080`  
Branch Portal: `http://localhost:5173`  
Customer Portal: `http://localhost:5174`

The apps proxy `/api` to the .NET API.

## Tenant fixtures

| App | Tenant | Permissions |
|---|---|---|
| Branch Portal | `branch-demo` | `Documents.View`, `Documents.Sign` |
| Customer Portal | `customer-demo` | `Documents.View` |

Every API request must carry `X-Tenant-Id`.

## Candidate-owned implementation

1. Implement `packages/platform-core`.
2. Implement `packages/documents-feature` once and compose it into both apps.
3. Replace the placeholder app screens.
4. Complete `POST /api/documents/{documentId}/signing-sessions`.
5. Enable and complete backend candidate tests.
6. Add at least six required frontend behavior tests.
7. Copy and complete the templates:
   - `DECISIONS.template.md` → `DECISIONS.md`
   - `AI-NOTES.template.md` → `AI-NOTES.md`
   - `TIMELOG.template.md` → `TIMELOG.md`

## Fake provider scenarios

The fake provider accepts a `FakeProviderScenario` chosen by the POST implementation:

- `Success`
- `UnavailableBeforeAcceptance` — simulate `503`
- `TimeoutAfterAcceptance` — provider accepted, response was lost; simulate `504`

A practical implementation may map a test-only header such as `X-Fake-Provider-Scenario` to this enum. Do not let test-only behavior leak into production assumptions.

## Required checks

```bash
npm run check
dotnet test AdaptiveCash.TakeHome.sln
```

The starter has baseline frontend tests and two read-endpoint backend tests. The POST tests are intentionally skipped until the candidate implements that endpoint.
