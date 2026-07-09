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
    ├── auth/            # signup + OTP verify, login, refresh (rotation), logout, forgot/reset password
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
    ├── admin/             # ban/unban, remove post, moderation queue, analytics
    └── media/             # Cloudinary upload proxy (POST /api/media/upload)
```

## What's fully wired vs. stubbed

| Module | Status |
|---|---|
| Auth (signup/OTP/login/logout/forgot-reset/**refresh rotation**) | Fully functional, including refresh token rotation with reuse detection |
| User profile + follow graph + college search | Functional |
| Posts (all types), likes, saves, campus feed | Functional |
| Comments (nested one level) | Functional |
| Communities | Functional |
| Events (create/join/interested/leave/**search**) | Functional |
| Study partner posts | Functional |
| Project matching | Functional |
| Friends | Functional (suggested-friends is a naive same-college query — see TODO in `FriendServiceImpl`) |
| Chat (REST history + STOMP realtime send/typing) | Functional |
| Notifications | **All producing modules now call `notify()`**: likes, comments, friend requests/accepts, new followers, event joins/interest, project + study-partner join requests, chat messages. Pushed live over `/user/queue/notifications`. |
| Rate limiting | Bucket4j in-memory per-IP limiter on `/api/auth/**` (`RateLimitFilter`), configurable via `app.rate-limit.auth-requests-per-minute` |
| Media uploads | `POST /api/media/upload` proxies to Cloudinary server-side — frontend never touches the Cloudinary secret |
| Admin | Functional (ban/unban, remove post, resolve reports, analytics) |
| Search | Students, communities, **events, and colleges** all searchable |
| Map (nearby coffee shops/libraries/etc) | Events store lat/lng and the frontend now renders them on a Google Map; a dedicated "nearby places" layer (coffee shops/libraries independent of events) is not built |

## What's still genuinely open

- **Suggested friends** is a naive same-college filter done in application code, not a real query — fine at MVP scale, flagged in `FriendServiceImpl` for when it needs to scale.
- **Chat sends a notification on every single message.** This is correct per the original spec ("Messages" is a listed notification type) but will feel spammy for an active conversation — consider suppressing it when the recipient is actively subscribed to that room, if that matters for your use case.
- **MapStruct is on the classpath but unused** — DTO mapping is still hand-written in `toResponse()` methods. Not a bug, just unused dependency weight.
- **Community/event moderation on ACTIONED reports** doesn't yet cascade automatically (e.g., auto soft-delete the reported post) — `ReportServiceImpl.resolve()` has the TODO marking exactly where that logic goes.

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

## What was actually verified vs. what to check yourself

I don't have Maven Central access in my sandbox, so **I could not run `mvn
compile` on this backend** — unlike the frontend (Next.js/npm), which I did
install, build, and lint successfully in-sandbox. Treat the backend as
carefully written but not compiler-verified. First things to do locally:

1. Run `mvn clean compile` before writing anything on top of this — catch
   any import or annotation-processor issues immediately.
2. Double-check `pom.xml` versions are still current/resolvable
   (`spring-boot-starter-parent 3.3.2`, `jjwt 0.12.6`, `mapstruct 1.6.0`,
   `bucket4j_jdk17-core 8.10.1`) — bump if Maven complains about any of them.
3. Bucket4j's rate-limit filter (`RateLimitFilter`) is in-memory and
   per-instance — fine for a single-instance MVP deploy, but won't share
   state if you scale to multiple backend instances. Swap to Bucket4j's
   Redis/Lettuce integration at that point.

## Suggested next steps (in order)

1. Harden `FriendServiceImpl.getSuggestedFriends` — move the same-college
   filter into the query and exclude existing friends/pending requests,
   instead of filtering in memory.
2. Decide whether chat messages should suppress the per-message
   notification when the recipient is actively viewing that room (currently
   every message fires a `NotificationType.MESSAGE` notify() call).
3. Wire automatic moderation cascade in `ReportServiceImpl.resolve()` — when
   a report is marked `ACTIONED`, actually soft-delete the reported
   post/comment or ban the reported user based on `targetType`.
4. Swap hand-written DTO mapping for MapStruct if it gets tedious — the
   dependency is already on the classpath, just unused.
5. Build out the Next.js frontend against this API (mostly done — see the
   frontend README for what's left there).
