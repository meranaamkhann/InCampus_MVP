# InCampus — Frontend

Next.js 15 (App Router) frontend for InCampus, wired against the Spring Boot
backend. Dark-first "digital student ID" design system — glass cards,
electric-blue "verified" accent, amber for events/energy.

> ✅ Verified in-sandbox: `npm install`, `npm run build`, and `npm run lint`
> all pass clean (20/20 routes compiled, zero ESLint warnings). The only
> thing that didn't run in my sandbox was the actual Google Fonts network
> fetch (`fonts.googleapis.com` isn't reachable there) — that's a sandbox
> network restriction, not a code issue, and will resolve normally wherever
> you run `npm run dev`/`build` with real internet access.

## Tech stack

- Next.js 15.5 (App Router) + TypeScript
- Tailwind CSS (custom HSL design tokens, dark/light via `.light` class)
- Radix UI primitives (Dialog, Dropdown, Tabs) — hand-styled, not the shadcn CLI output
- Zustand (auth store + live notification-count store, persisted to `localStorage` where relevant)
- Axios (API client with JWT attach + 401 handling)
- @stomp/stompjs (realtime chat + notifications over the backend's STOMP endpoint)
- Google Maps JavaScript API (loaded dynamically, no extra npm package) for the events map view
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
├── events/       # EventCard, EventsMap (Google Maps JS API)
├── communities/  # CommunityCard
├── chat/         # RoomList, ChatWindow
└── shared/       # IdCardHero (landing page signature element)

lib/
├── api.ts                 # axios instance, JWT interceptor, 401 handling
├── auth-store.ts           # zustand store (persisted session)
├── notification-store.ts    # zustand store (live unread count, not persisted)
├── websocket.ts               # STOMP client wrapper (chat + notifications)
├── theme-provider.tsx          # dark/light toggle
└── utils.ts                     # cn(), formatRelativeTime(), initials()

hooks/
├── useAuth.ts               # login/verifyOtp/logout
├── useRealtimeSession.ts     # STOMP connect + notification subscription + presence heartbeat
└── usePaginated.ts            # generic infinite-scroll pagination hook
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
| Chat | REST history + STOMP realtime send/typing wired. Online presence updates via a heartbeat (`useRealtimeSession`) every 40s while the app is open, not just while actively chatting. |
| Notifications | Fully realtime — `useRealtimeSession` subscribes to `/user/queue/notifications` on login, so the topbar bell updates instantly. The notifications page keeps the shared unread-count store in sync when marking items read. |
| Admin dashboard | Analytics, report resolution, **and user search + ban/unban** all wired. |
| Search | Students, communities, **events, and colleges** — four tabs, all backed by real endpoints. |
| Google Maps | Events page has a List/Map toggle; the map view plots any event with lat/lng using the Maps JS API (loaded dynamically, needs `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`). The create-event form has optional lat/lng fields. A general "nearby places" layer independent of events (coffee shops/libraries/etc as their own category) isn't built. |
| Image uploads | `CreatePostComposer` now does a real upload — file picker → `POST /api/media/upload` → Cloudinary URL comes back and gets attached to the post. No more raw-URL text field. |
| Loading skeletons | Basic pulse skeletons on feed/profile/admin. Not exhaustive across every page. |
| Optimistic UI | Done for likes, saves, follow, join/leave (community, event, study partner). |

## What's still genuinely open

- **Presence heartbeat interval (40s) vs. Redis TTL (60s) on the backend** — comfortably under, but if you change one, check the other.
- **No general "nearby places" map layer** — only events with lat/lng show up on the map; coffee shops/libraries/parks as their own discoverable category would need a separate Places API integration.
- **Admin user search re-fetches full profiles per result** (`UserManagementPanel` does an N+1-style `Promise.all` of profile fetches after search) — fine at MVP scale, but worth a dedicated admin-list endpoint that returns ban status directly if the user base grows.
