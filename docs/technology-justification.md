# Technology justification

## MariaDB

MariaDB is the system of record because getit contains strongly related entities: users, posts, comments, subgetits, votes, awards, joins, and private messages. Foreign keys enforce ownership and cascading behavior, while transactions protect vote and karma updates.

## Go

The API uses Go's standard `net/http` server and `database/sql` package. Go gives the project a small, typed backend with explicit SQL and low runtime overhead. Authentication is session-cookie based, and handlers enforce ownership and moderator authorization before mutations.

## Redis

Redis is used for fast user-specific saved-post sets and health monitoring. Saved posts do not replace MariaDB records; Redis stores a fast, disposable NoSQL view keyed by user ID. MariaDB remains authoritative for posts and users.

## Next.js

Next.js provides the component-based interface, static page structure, client-side forms, and reusable UI components for posts, comments, profiles, messages, and moderation.

## Docker

Docker Compose gives every team member the same MariaDB schema, Redis service, and API network. The supplied dump initializes the database and the idempotent seed adds demo records for evaluation.
