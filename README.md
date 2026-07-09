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
which was missing before. The first version of `mvnw.cmd` I shipped had a
broken PowerShell one-liner that spat out garbage on Windows — replaced
with a plain, classic-style batch script that behaves the same from
`cmd.exe` or PowerShell.

## UI/UX polish pass (this round)

Focused on the specific gaps called out as "what still needs improvement":
onboarding, email verification UX, loading/empty/error states, mobile
responsiveness, and silent failures that gave zero user feedback.

**Real bugs found and fixed, not just polish:**
- Mobile had **no navigation at all** — the sidebar was `hidden md:flex`
  with nothing replacing it below that breakpoint. Added a bottom tab bar
  (`MobileNav`) plus a slide-in drawer (`MobileDrawer`) for the items that
  don't fit in five tabs.
- The Messages page **completely ignored the `?room=` query param** that
  the profile page's "Message" button relies on — clicking it opened your
  most recent chat instead of the person you actually clicked. Fixed, and
  the page is now properly responsive (was a fixed 280px two-column grid
  that broke on small screens).
- The profile page's Follow button **always showed "Follow" even if you
  already followed that person** — the backend never told the frontend the
  actual follow state. Added `followedByCurrentUser` to the profile API
  response (`UserService.getProfile` now takes a viewer id) to fix this at
  the source rather than papering over it client-side.
- Half a dozen action buttons (community join/leave, event join/interested,
  friend accept/reject/send, post like/save) had **zero error handling** —
  a failed request just silently did nothing, or in a few cases left the UI
  in a wrong optimistic state with no way to know something went wrong.
  All now roll back correctly and show a toast on failure.

**New, reusable pieces added:**
- A toast notification system (`components/ui/toaster.tsx` +
  `lib/toast-store.ts`) — `@radix-ui/react-toast` was a dependency from day
  one but was never actually wired up until now.
- `EmptyState`, `ErrorState`, and `Skeleton`/`CardSkeletonGrid`/
  `ListSkeleton` components, applied consistently across Feed, Events,
  Communities, Study Partners, Projects, Friends, Notifications, and
  Messages instead of each page rolling its own (or no) loading/empty text.
- `OtpInput` — 6-box code entry with auto-advance, paste support, and
  auto-submit on completion — plus a resend cooldown timer, replacing the
  plain single text field.
- Signup is now a 2-step wizard (Account → College) with a progress
  indicator instead of one long form, with per-step validation.

Everything above was verified the same way as before: `npm install`,
`npm run build`, and `npm run lint` all pass clean in my sandbox (20/20
routes). The backend changes (new `UserProfileResponse` field, changed
`UserService.getProfile` signature) were checked against every call site by
hand and via `grep` — but same caveat as always: my sandbox has no route to
Maven Central (`repo.maven.apache.org` returns `403 host_not_allowed` here),
so I still can't run `mvn compile` myself. Run `./mvnw clean compile` as
the first thing after extracting this.

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
