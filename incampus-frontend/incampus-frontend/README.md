# InCampus — Frontend

Next.js 15 (App Router) frontend for InCampus, wired against the Spring Boot
backend. Dark-first "digital student ID" design system — glass cards,
electric-blue "verified" accent, amber for events/energy.

> ⚠️ Like the backend, this was scaffolded without the ability to run
> `npm install` against the real npm registry in the sandbox (network is
> allowlisted but a full install wasn't run here), so **run `npm install`
> and `npm run dev` locally as the first step** to catch any version drift.

## Tech stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS (custom HSL design tokens, dark/light via `.light` class)
- Radix UI primitives (Dialog, Dropdown, Tabs) — hand-styled, not the shadcn CLI output
- Zustand (auth store, persisted to `localStorage`)
- Axios (API client with JWT attach + 401 handling)
- @stomp/stompjs (realtime chat + notifications over the backend's STOMP endpoint)
- Framer Motion (hero card animation)
- lucide-react (icons)

## Structure

```
app/
├── page.tsx                  # Landing page (marketing)
├── globals.css               # Design tokens (dark default, .light overrides)
├── (auth)/                   # login, signup, verify-otp, forgot/reset-password
└── (dashboard)/              # authenticated app shell (sidebar + topbar)
    ├── feed/                 # campus post feed + composer
    ├── communities/
    ├── events/
    ├── study-partners/
    ├── projects/
    ├── friends/              # pending requests + suggested friends
    ├── messages/             # chat room list + realtime chat window
    ├── notifications/
    ├── posts/[postId]/       # single post + comments
    ├── profile/[userId]/     # public profile, follow, message
    ├── profile/edit/
    ├── search/               # user + community search results
    └── admin/                # analytics + moderation queue

components/
├── ui/           # Button, Card, Input, Textarea, Label, Avatar, Badge, Dialog
├── layout/       # MarketingNav, Sidebar, TopBar
├── feed/         # PostCard, CreatePostComposer, CommentSection
├── events/       # EventCard
├── communities/  # CommunityCard
├── chat/         # RoomList, ChatWindow
└── shared/       # IdCardHero (landing page signature element)

lib/
├── api.ts              # axios instance, JWT interceptor, 401 handling
├── auth-store.ts        # zustand store (persisted session)
├── websocket.ts          # STOMP client wrapper (chat + notifications)
├── theme-provider.tsx    # dark/light toggle
└── utils.ts              # cn(), formatRelativeTime(), initials()

hooks/
├── useAuth.ts        # login/verifyOtp/logout
└── usePaginated.ts   # generic infinite-scroll pagination hook
```

## Running locally

```bash
cp .env.example .env.local   # point at your running backend
npm install
npm run dev
```

Requires the backend running at `NEXT_PUBLIC_API_URL` (default
`http://localhost:8080/api`) — see the backend README for `docker compose up`.

## What's wired vs. what's left

| Area | Status |
|---|---|
| Auth (signup/OTP/login/forgot-reset) | Fully wired to backend |
| Feed, posts (all types), likes, saves, comments | Fully wired |
| Communities, Events, Study Partners, Projects | Fully wired |
| Friends (pending requests, suggested, accept/reject) | Fully wired |
| Profile view + edit, follow/unfollow | Fully wired |
| Chat | REST history + STOMP realtime send/typing wired. **Online presence badge relies on the backend's Redis-based `PresenceService`, which currently only marks a user online when they send a message or type — there's no heartbeat loop from the frontend yet.** Add a `setInterval` calling `/app/presence.heartbeat` if you want presence to reflect "app is open," not just "actively chatting." |
| Notifications | List + mark read/unread wired. Real-time push (`/user/queue/notifications`) is implemented on the backend but **not yet subscribed to from the frontend** — the topbar bell currently only polls `/notifications/unread-count` every 30s. Wire a STOMP subscription in `TopBar` or a global provider for instant updates. |
| Admin dashboard | Analytics + report resolution wired. No user ban/unban UI yet (backend endpoints exist: `POST /admin/users/{id}/ban` / `/unban`) — add an admin users table when you get to it. |
| Search | Users + communities only. Backend doesn't yet have an events/colleges search endpoint (see backend README) — add those API + UI together. |
| Google Maps ("nearby coffee shops/libraries/etc") | Not started. Events already store `latitude`/`longitude` — this is a clean addition once you're ready, using `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. |
| Image uploads | Post composer currently takes a raw Cloudinary URL via text input — no actual upload widget yet. Wire the Cloudinary unsigned-upload flow (or a signed one via the backend) next. |
| Loading skeletons | Basic pulse skeletons on feed/profile/admin. Not exhaustive across every page. |
| Optimistic UI | Done for likes, saves, follow, join/leave (community, event, study partner). |

## Suggested next steps (in order)

1. Wire the STOMP notification subscription in `TopBar` (or a top-level
   provider) so the bell updates instantly instead of polling.
2. Add a presence heartbeat (`setInterval` → `/app/presence.heartbeat`) so
   "online" reflects app-open, not just active-typing.
3. Real Cloudinary upload widget in `CreatePostComposer` (currently a raw URL field).
4. Google Maps layer on the Events page using the lat/lng already being collected.
5. Admin user management table (ban/unban) — backend endpoints already exist.
