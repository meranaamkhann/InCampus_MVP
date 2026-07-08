# InCampus — Backend

Verified-college-student social network. This is the **backend skeleton**
(Spring Boot 3 / Java 21) — the full package structure, entities, security
layer, and REST/WebSocket API surface are in place; deeper business logic
(hardening, edge cases, notification wiring) gets filled in module-by-module
in the phases below.

> ⚠️ This was scaffolded without the ability to run `mvn compile` against
> Maven Central (sandboxed network). Build it locally first — see
> [Known things to check](#known-things-to-check-on-first-build) below.

## Tech stack

- Java 21, Spring Boot 3.3
- Spring Security + JJWT (access token + rotating opaque refresh token)
- Spring Data JPA + PostgreSQL + Flyway
- Spring WebSocket (STOMP) for realtime chat/notifications
- Redis (presence/online status, future caching)
- Cloudinary (media uploads)
- springdoc-openapi (Swagger UI at `/swagger-ui.html`)

## Project structure

```
src/main/java/com/incampus/
├── IncampusApplication.java
├── config/            # Security, WebSocket, CORS, OpenAPI, Cloudinary, JPA auditing, dev seeder
├── security/           # JwtService, JwtAuthFilter, UserPrincipal, UserDetailsServiceImpl
├── common/
│   ├── BaseEntity.java        # UUID id, audit timestamps, soft delete — every entity extends this
│   ├── enums/                 # Shared enums (Role, PostType, ReportStatus, ...)
│   ├── exception/              # ApiException + GlobalExceptionHandler
│   ├── response/                # ApiResponse<T>, PageResponse<T>
│   └── util/                    # OtpUtil, EmailService
└── modules/
    ├── auth/            # signup + OTP verify, login, refresh*, logout, forgot/reset password
    ├── user/             # profile, follow graph, search
    ├── post/             # feed (campus-only), all 10 post types, likes, saves
    ├── comment/          # nested comments (one level of replies)
    ├── like/              # generic Like entity, reused by posts + comments
    ├── community/       # create/join/leave communities
    ├── event/             # create/join/interested/leave, upcoming feed
    ├── studypartner/    # study partner posts + join
    ├── project/          # project cards + join-request accept/reject
    ├── friend/            # send/accept/reject/remove, naive suggested-friends
    ├── chat/              # 1:1 chat rooms, REST history + STOMP realtime, Redis presence
    ├── notification/    # central notify() + STOMP push to /user/queue/notifications
    ├── report/            # user-facing report submission
    └── admin/             # ban/unban, remove post, moderation queue, analytics
```

*\*Refresh token rotation (`POST /api/auth/refresh`) is stubbed —
`AuthServiceImpl.refresh()` throws `UnsupportedOperationException` with a
note on why (needs the userId encoded alongside the opaque token to look the
hash up). This is flagged as the first thing to finish in Phase 2.*

## What's fully wired vs. stubbed

| Module | Status |
|---|---|
| Auth (signup/OTP/login/logout/forgot-reset) | Functional |
| User profile + follow graph | Functional |
| Posts (all types), likes, saves, campus feed | Functional |
| Comments (nested one level) | Functional |
| Communities | Functional |
| Events | Functional |
| Study partner posts | Functional |
| Project matching | Functional |
| Friends | Functional (suggested-friends is a naive same-college query — see TODO in `FriendServiceImpl`) |
| Chat (REST history/rooms + STOMP send/typing) | Functional, but **not yet cross-wired to Notifications** |
| Notifications | `notify()` works and pushes over STOMP, but **no other module calls it yet** — see `TODO(Phase 7 - Notifications)` comments scattered through Post/Comment/Friend/Event/Project/Chat services |
| Admin | Functional (ban/unban, remove post, resolve reports, basic analytics) |
| Search (students/clubs/events/colleges) | User search only; Community search by name only; Event search not yet built |
| Refresh token rotation | Stubbed — see above |
| Map (nearby coffee shops/libraries/etc via Google Maps) | Not started — Events store lat/lng, ready for a frontend map layer |

## Running locally

### Option A — Docker Compose (recommended)

```bash
cp .env.example .env   # fill in JWT_SECRET at minimum
docker compose up --build
```

This starts Postgres, Redis, Adminer (DB UI at `localhost:8081`), and the
backend at `localhost:8080`.

### Option B — run backend directly, infra in Docker

```bash
docker compose up postgres redis -d
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Swagger UI: `http://localhost:8080/swagger-ui.html`

### Seed data

With the `dev` profile active, `DataSeeder` creates 3 sample users (all
pre-verified, password `password123`), 2 communities, and 1 event — but only
if the `users` table is empty. Sample login: `asad@galgotiacollege.edu` /
`password123`.

## Known things to check on first build

Since I couldn't reach Maven Central to compile this in the sandbox:

1. **Dependency versions** — double-check `pom.xml` versions
   (`spring-boot-starter-parent 3.3.2`, `jjwt 0.12.6`, `mapstruct 1.6.0`,
   `bucket4j_jdk17-core 8.10.1`) are still current/resolvable; bump if Maven
   complains.
2. **Bucket4j is a dependency but not yet wired into any filter** — rate
   limiting on `/api/auth/**` and post creation is a TODO, not implemented.
3. **MapStruct is on the classpath but unused** — all DTO mapping is
   currently done by hand in `toResponse()` methods. Fine for now; swap to
   MapStruct mappers if the hand-written mapping gets tedious.
4. Run `mvn clean compile` first thing to catch any import/annotation
   processor issues before writing more code on top.

## Suggested next steps (in order)

1. Fix `AuthServiceImpl.refresh()` — decide on refresh token format (prefix
   with userId) and finish rotation + revocation.
2. Wire the `TODO(Phase 7 - Notifications)` calls — every module that
   should notify someone already has the exact call commented at the exact
   spot it belongs.
3. Add Bucket4j rate limiting on auth + post-creation endpoints.
4. Harden `FriendServiceImpl.getSuggestedFriends` — move the same-college
   filter into the query and exclude existing friends/pending requests.
5. Build out the Next.js frontend against this API (Phase 9).
