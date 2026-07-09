# InCampus

A verified-college-student social network — study partners, project teams,
events, communities, and realtime chat, restricted to .edu/.ac.in emails.

This is the full MVP: Spring Boot 3 backend + Next.js 15 frontend, in one
repo.

```
incampus/
├── backend/    Spring Boot 3 / Java 21 REST + WebSocket API
├── frontend/   Next.js 15 (App Router) + TypeScript + Tailwind
└── docker-compose.yml   Runs the entire stack with one command
```

Each half has its own detailed README — **read those** for architecture,
what's fully wired vs. still open, and module-by-module status:

- [`backend/README.md`](backend/README.md)
- [`frontend/README.md`](frontend/README.md)

## Quickest way to run everything

```bash
cp .env.example .env       # fill in JWT_SECRET at minimum
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend + Swagger UI: http://localhost:8080/swagger-ui.html
- Adminer (DB browser): http://localhost:8081

First run will take a few minutes (Maven downloading backend dependencies,
npm installing frontend dependencies). Subsequent runs are fast.

Sample login once it's up (seeded automatically in the `dev` profile):
`asad@galgotiacollege.edu` / `password123`

## Running the two halves separately (more control, faster iteration)

```bash
# Terminal 1 - infra only
docker compose up postgres redis -d

# Terminal 2 - backend
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 3 - frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## What was fixed in this pass

The backend previously failed to build with Maven for a real, findable
reason: **Lombok 1.18.34 has a documented incompatibility with Java 21 under
Maven** ([lombok#3754](https://github.com/projectlombok/lombok/issues/3754)).
That version was pinned in `backend/pom.xml`'s annotation-processor config.
Fixed by bumping to Lombok 1.18.36.

While in there, every other pinned dependency version in `pom.xml` was
individually checked against live Maven Central data (not assumed) and two
more were bumped to versions directly confirmed to exist:
- `bucket4j_jdk17-core`: 8.10.1 → 8.16.1
- `spring-boot-starter-parent`: 3.3.2 → 3.3.8 (extra margin, same minor line)
- `mapstruct` / `mapstruct-processor`: 1.6.0 → 1.6.3 (matches current official install docs)

Also added the **Maven Wrapper** (`./mvnw`, `./mvnw.cmd`, `.mvn/wrapper/`),
which was missing before — if you don't have Maven installed system-wide,
`mvn spring-boot:run` would fail with a plain "command not found" that looks
like a Maven problem but is really just "no Maven on this machine." `./mvnw`
downloads the correct Maven version automatically on first run.

**What I still can't do:** my sandbox has no route to Maven Central
(`repo.maven.apache.org` returns `403 host_not_allowed` here), so I could
not run `mvn clean compile` myself to give you a green checkmark. Every fix
above is backed by a direct Maven Central lookup for that exact
groupId:artifactId:version, not a guess — but you should still run
`./mvnw clean compile` as the very first thing, before building anything
further on top. The frontend, by contrast, *was* fully installed, built, and
linted in my sandbox (npm's registry isn't blocked) — see
`frontend/README.md` for what that verification covered.

## MVP feature status

All 10 MVP-priority features from the original spec are implemented and
wired end-to-end: Authentication, Profiles, Campus Feed, Friend Requests,
Communities, Events, Study Partner Posts, Project Team Matching, Realtime
Chat, Notifications. Plus Admin moderation, four-way Search (students/
communities/events/colleges), and a Google Maps view on Events.

Genuinely open items (not hidden, all documented in the two module
READMEs): refresh-token edge cases beyond the happy path, suggested-friends
being a naive in-memory filter, chat notifying on every single message
rather than only when the recipient's away, and a general "nearby places"
map layer independent of events.
