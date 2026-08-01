# AI notes

## Tools and models used

Claude (Opus 5) via Claude Code, used as a pair-programming assistant throughout the
assignment. JetBrains Rider and WebStorm for editing and running the API and the portals.

## Generated areas

Most of the code in this repository was written with AI assistance, then reviewed and in
several places corrected or restructured by me. Roughly:

- **Written by me first, then reviewed:** the initial `DocumentsPage` layout, the page header
  and sidebar markup, `DocumentsFilters`, `DocumentsTable`, `useDocumentFilters`, the
  `/api/documents/statuses` endpoint, the client-side sort fix in `DocumentEndpoints`, and the
  split of `DocumentDetails` into its own folder.
- **Generated, then reviewed and adjusted by me:** `platform-core` (shell, module contract,
  permission context), the signing flow (`useSignDocument`, `SignDocumentDialog`,
  `SigningSessionPanel`, `useCountdown`), the backend `Application/Signing` layer, and the
  test suites.
- **Directed by me, implemented by AI:** the split of the signing logic out of the endpoint
  into a service with its own ports, and the later move of the repository implementations into
  `Infrastructure/Repositories`. The first attempt put the enum, result record, interface and
  implementation in a single file; I asked for it to be redone following single responsibility.

## AI mistake 1 — a known defect reintroduced in new code

Earlier in the session the assistant itself identified that EF Core's SQLite provider cannot
translate `DateTimeOffset` in an `ORDER BY`, which was breaking `GET /api/documents`. I fixed
that endpoint by sorting after materialising the query.

When the assistant later wrote `POST /api/documents/{id}/signing-sessions`, it used
`.OrderByDescending(x => x.CreatedAt)` in the active-session lookup — the same defect, in new
code, after having flagged the limitation.

**How I found it:** the endpoint compiled and the assistant reported "Build succeeded", but
signing from the UI returned a bare `500` with only a trace ID. I pulled the actual exception
out of the Rider console and it was `System.NotSupportedException: SQLite does not support
expressions of type 'DateTimeOffset' in ORDER BY clauses`, pointing at line 58 of the new
endpoint. The lesson I took: a successful build says nothing about a query that only fails at
translation time, and generated persistence code has to be exercised, not just compiled.

## AI mistake 2 — a defect reported that did not exist

The assistant told me twice that `packages/testing/src/index.ts` contained a broken
`export * from './theme'` with no matching file, and described it as a starter bug worth
documenting.

It was not true. The assistant had run `cat` over two `index.ts` files without separators and
read a line belonging to `packages/design-tokens/src/index.ts`, where `theme.ts` does exist.
`packages/testing/src/index.ts` was always correct.

**How I found it:** I opened the file to make the fix and there were only two export lines. I
asked about it and the claim was withdrawn. It would otherwise have gone into `DECISIONS.md`
as a defect in the provided starter, which would have been wrong in a document a reviewer
reads closely.

## Checks run manually

- `npm run check` (typecheck, 13 frontend tests across 4 files, both production builds) —
  passing.
- `dotnet test AdaptiveCash.TakeHome.sln` — 9 tests, 0 failed, 0 skipped.
- Both portals run manually against the API: signed a document in Branch Portal and watched
  the session move `Pending` → `AwaitingProvider` → `Verified`, the countdown appear, polling
  stop, and the list refresh itself.
- Confirmed the Customer Portal never renders a Sign action, and that a customer-tenant
  request for a branch document returns `404`.
- Exercised `201`, `200` replay, `409` on both codes, `503` and `504` against the running API
  with explicit requests before wiring the UI to them.
- Reset and reseeded the SQLite database to confirm the flow from a clean state.

## Unverified areas

- **Accessibility was not audited.** No screen reader pass and no axe run. Focus handling and
  `aria-live` regions were written deliberately but only reasoned about, not measured.
- **Mobile layout was not tested on a device or at 375px.** The table scrolls horizontally
  inside its own container; I did not verify how that feels in practice.
- **The `Expired` path was never observed.** The fake provider issues a five-minute
  `expiresAt` and I did not wait one out or manipulate the clock, so the countdown reaching
  zero and the server reporting `Expired` is reasoned about rather than seen.
- **The `Failed` path was only reached in a backend test**, not through the UI, because it
  requires a document ID ending in `FAIL` and none is seeded.
- **Concurrency was verified against SQLite only**, through six parallel requests in one
  process. The unique constraint is the real guarantee, but I have not run this against a
  second API instance or a different database engine.
