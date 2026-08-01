# Time log

Derived from commit timestamps on 1 August 2026. Wall-clock boundaries, so short breaks are
included in the blocks below.

- `11:30–12:47` — Read the assignment pack, explored the starter, set up the repository.
  Found that the starter does not build as delivered: no TypeScript, Vitest, jsdom or
  Testing Library in any `package.json`, and the xUnit project missing `using Xunit`.
- `12:47–13:48` — Fixed the toolchain. Added the missing dev dependencies, registered the
  xUnit global using, added `bin/`/`obj/` to `.gitignore` and a `.gitattributes`.
  `npm run check` and `dotnet build` green.
- `13:48–15:28` — First Documents page: layout, header, sidebar, filters and table markup
  against Fluent UI.
- `15:28–17:08` — Wired the list to the API. Hit `GET /api/documents` returning `500` and
  traced it to SQLite being unable to `ORDER BY` a `DateTimeOffset`; fixed by sorting after
  materialising. Added `/api/documents/statuses` for the filter.
- `17:08–19:10` — `platform-core`: portal shell, module contract, tenant/user/permission
  context, providers. Composed the same Documents feature into both portals, moved the header
  and sidebar into the shell, replaced manual fetching with TanStack Query, and moved the
  detail view into a URL-driven drawer.
- `19:10–20:25` — Signing flow. Implemented `POST /api/documents/{id}/signing-sessions` with
  durable idempotency, concurrency handling and 409/503/504 semantics; extracted it into an
  `Application/Signing` service with its own ports. Frontend confirmation dialog, synchronous
  single-flight guard and idempotency key lifecycle.
- `20:25–21:07` — Status polling and countdown. Polling stops at a terminal status and
  invalidates the document queries; countdown derived from the absolute `expiresAt`. Closed
  the loop so the document status mirrors the session. Fixed a drawer close that stalled
  because a URL change re-rendered the whole table.
- `21:07–21:14` — Tests: 9 frontend behaviour tests and 9 backend integration tests.
- `21:14–21:45` — `DECISIONS.md`, `AI-NOTES.md`, `TIMELOG.md`, README.

Stopped here. Remaining scope and the reasons for cutting it are listed in `DECISIONS.md`
under "Deliberately not implemented".
