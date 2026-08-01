# Time log

Boundaries are commit timestamps from 1 August 2026. Implementation ran from the repository
being created at `12:47` to the last code commit at `21:14` — 8h27m of wall clock, roughly
8 hours of actual work once breaks are excluded. Documentation followed afterwards.

- `12:47` — Repository created from the unmodified starter. Found it does not build as
  delivered: no TypeScript, Vitest, jsdom or Testing Library in any `package.json`, and the
  xUnit project missing `using Xunit`.
- `12:47–13:48` — Fixed the toolchain. Added the missing dev dependencies, registered the
  xUnit global using, added `bin/` and `obj/` to `.gitignore` plus a `.gitattributes`.
  `npm run check` and `dotnet build` green.
- `13:48–15:28` — First Documents page: layout, header, sidebar, filters and table markup
  against Fluent UI.
- `15:28–17:08` — Wired the list to the API. `GET /api/documents` returned `500`; traced it to
  SQLite being unable to `ORDER BY` a `DateTimeOffset` and fixed it by sorting after
  materialising. Added `/api/documents/statuses` for the filter.
- `17:08–19:10` — `platform-core`: portal shell, module contract, tenant/user/permission
  context, providers. Composed the same Documents feature into both portals, moved the header
  and sidebar into the shell, replaced manual fetching with TanStack Query, and moved the
  detail view into a URL-driven drawer.
- `19:10–20:25` — Signing flow. Implemented `POST /api/documents/{id}/signing-sessions` with
  durable idempotency, concurrency handling and 409/503/504 semantics, then extracted it into
  an `Application/Signing` service with its own ports. Frontend confirmation dialog,
  synchronous single-flight guard and idempotency key lifecycle.
- `20:25–21:07` — Status polling and countdown. Polling stops at a terminal status and
  invalidates the document queries; countdown derived from the absolute `expiresAt`. Closed
  the loop so the document status mirrors the session. Fixed a drawer close that stalled
  because a URL change re-rendered the whole table.
- `21:07–21:14` — Tests: 9 frontend behaviour tests and 9 backend integration tests.
- `21:14` — Implementation stopped here.
- `21:20–21:23` — `DECISIONS.md`, `AI-NOTES.md`, `TIMELOG.md`, README.

Remaining scope and the reasons for cutting it are listed in `DECISIONS.md` under
"Deliberately not implemented".
