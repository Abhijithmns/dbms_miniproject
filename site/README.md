# getit — Community Interface

getit is a Reddit-style community interface customized for the DBMS mini-project. The UI focuses on subgetits, posts, comments, voting, and anonymous demo identities.

## Stack

- Next.js App Router, React, TypeScript, and Tailwind CSS
- MySQL 8 and Redis remain available for the backend implementation
- Static demo data now; backend/API integration can be added later

## Run locally

Requires Node.js 24 and pnpm.

```sh
cd site
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Build the static interface

```sh
pnpm typecheck
pnpm lint
pnpm build
pnpm start
```

The static build is written to `out/`. The generated directory should not be edited directly; change files under `src/` and rebuild.

## Project mapping

- Component 10: this customized Next.js interface
- The UI demonstrates a home feed, subgetits, topics, comments, upvotes, downvotes, and generated usernames.

## License

The original template is MIT licensed. The MIT license file is retained in this project.
