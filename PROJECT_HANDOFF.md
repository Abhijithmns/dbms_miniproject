# getit project handoff

Last updated: 2026-11-05

This file is intentionally uncommitted. Update it after meaningful work so another AI can continue without reconstructing the project history.

## Project

getit is a Reddit-like DBMS mini-project using:

- Next.js frontend in `site/`
- Go HTTP API in `backend/`
- MariaDB database `dbms_miniproject`
- Redis for the NoSQL/cache component
- Docker Compose for MariaDB, Redis, and the Go API

The database dump is `dbms_miniproject.sql` in the repository root. It contains the schema but no data inserts.

## Rubric status

| Component | Status | Notes |
|---|---|---|
| 1. ER diagram | Done | `docs/er_diagram.png` exists. |
| 2. Relational schema | Done | `docs/relational_schema.png` exists. |
| 3. SQL DDL with constraints | Done/verify | `dbms_miniproject.sql` contains the ten tables and foreign keys. |
| 4. NoSQL/vector database | Implemented/verify | Redis Compose service and Go health endpoint are present; saved-post Redis operations need runtime evidence. |
| 5. Technology justification | Implemented | Added `docs/technology-justification.md`. |
| 6. DML operations | Implemented script | `sql/evaluation_6_dml.sql` contains transactional INSERT, UPDATE, SELECT, and safe DELETE. Needs execution evidence. |
| 7. Nested/recursive queries and joins | Implemented script | `sql/evaluation_7_queries.sql` contains joins, nested/correlated queries, and recursive comment CTE. Needs execution evidence. |
| 8. Procedures/functions/triggers/CTEs | Implemented script | `sql/evaluation_8_advanced.sql` contains a function, procedure, triggers, and windowed CTE. Needs MariaDB execution verification. |
| 9. NoSQL/vector CRUD feature | Implemented/verify | Go API exposes Redis saved-post create/read/delete endpoints using Redis sets. Needs runtime evidence. |
| 10. Next.js interface | Implemented/verify | Post links now preserve the selected slug; post detail renders that post's title/body/tags and API-backed comments only. Owner-only post editing/deletion, comment replies/edit/delete/votes, awards, subgetit join/leave, messages, and moderation screens are wired. |
| 11. Backend/API integration | Implemented/verify | Modular Go API passes `GOCACHE=/tmp/getit-go-cache go test ./...`; nullable profile images are handled safely. Docker/runtime smoke test remains. |
| 12. Authentication and two roles | Implemented/verify | Added moderator-only user listing, role assignment/removal, and `/moderation` UI. Needs Docker smoke-test evidence. |
| 13. Documentation/Git/GitHub | Pending | Keep this handoff file uncommitted; create clean human-readable commits locally when Git is writable. |
| 14. Originality/modification/viva | Ongoing | Document design decisions and individual contributions. |

## Database schema confirmed from dump

Tables:

- `app_user`
- `post`
- `comment`
- `comment_votes`
- `votes_on`
- `subreddit`
- `joins`
- `award`
- `awarded_to`
- `private_message`

Important attributes include profile images, post/comment karma, parent comments, moderator fields, award post association, message read status, and all timestamp fields.

## Current implementation

### Docker

`docker-compose.yml` currently defines:

- MariaDB 11.4 with the root dump mounted into `/docker-entrypoint-initdb.d/`
- Redis 7
- Go API on port 8080
- MariaDB port 3306 and Redis port 6379 exposed locally

The MariaDB service uses a fresh Docker volume. The dump is schema-only, so sample rows must be seeded separately.

Run from the repository root:

```bash
docker compose up --build
```

This has not been successfully run in the restricted agent environment because external Go module downloads are unavailable.

### Go API

The backend is modular enough to continue splitting into `auth.go`, `handlers.go`, and `config.go`. It targets the existing schema and exposes core routes for:

- health
- registration, login, logout, current user
- posts and post creation
- comments and replies
- post/comment votes
- profile lookup/update
- subgetit listing and join/leave
- private messages and read status
- owner-authorized post/comment editing and deletion
- moderator role management and award assignment

Before treating it as complete, run locally:

```bash
cd backend
go mod tidy
go test ./...
```

Then run the Compose stack and test:

```bash
curl http://localhost:8080/api/health
```

## Known blockers and cautions

- Git metadata is read-only in the current agent environment, so commits cannot be created here. Do not claim commits were made.
- The linked reference repository `https://github.com/Uttam1916/DBMSMiniProject` could not be fetched from this environment because network/DNS access is blocked.
- The dump contains no sample data. Docker starts with empty tables unless seed data is added.
- Redis saved-post operations are wired through a small RESP client in `backend/redis.go`; they still need a Docker smoke test.
- The Go API needs a real local/Docker build and endpoint smoke test before being called complete.
- Do not overwrite the user's MariaDB database. Docker should use its own named volume by default.
- `pnpm lint` and `pnpm typecheck` pass. A local `pnpm build` began but stalled in the restricted environment, so production build verification should be rerun locally.

## Recommended next sequence

1. Run and capture results for the SQL scripts in `sql/`.
2. Make the Go API compile with network access and fix any compile/runtime issues.
3. Run and verify `sql/seed_demo.sql` in the Docker MariaDB initialization.
4. Run the Redis saved-post endpoints and capture evidence for components 4 and 9.
5. Run the Compose stack and test frontend-to-API behavior for authentication, posts, comments, votes, profiles, joins, awards, and messages.
6. Run the moderator endpoints and capture evidence for component 12.
7. Rerun `pnpm build` outside the restricted environment and finish final documentation/screenshots.
8. When Git is writable, commit in small natural commits; do not commit this handoff file unless explicitly requested.

