# Advanced TicTacToe — Design System

**Read this file before changing UI, layout, or navigation.**  
Tokens and components live here; product-specific rules are in **Conventions** below.

---

## Conventions (do not skip)

These rules exist because we have repeated the same mistakes. Follow them unless the user explicitly asks otherwise.

### Layout shell

| Region | Width | Notes |
|--------|--------|--------|
| **Header / navbar** | **Full viewport** | `<header>` and its inner row span `w-full`. Use horizontal padding only (`px-4 sm:px-6 lg:px-8`). **Do not** put `max-w-6xl` or `mx-auto` on the header inner container. |
| **Main content** | **Constrained** | `<main>` uses `mx-auto max-w-6xl px-4 py-8` (see `src/app/layout.tsx`). Page sections use **content width tiers** below — not ad-hoc `max-w-*` per route. |

The navbar background, border, and controls must feel edge-to-edge; only page body content is centered in a column.

### Content width

**Source of truth:** `src/lib/layout.ts` → `contentWidth`, `heroTextWidth`.

Pick a tier from **content type**, not URL. Do not invent new `max-w-*` values on pages without updating this table and `layout.ts`.

| Tier | Class (`contentWidth.*`) | Use for | Routes / components |
|------|--------------------------|---------|---------------------|
| **Shell** | (layout only) `max-w-6xl` | App column cap | `<main>` in `layout.tsx` |
| **Dashboard** | *(none — full shell width)* | Multi-section home | `/` |
| **Standard** | `standard` → `max-w-3xl` | Card-stack hub pages | `/play`, `/play/online`, `/activity` |
| **Game** | `game` → `max-w-2xl` | Ultimate board + game chrome | `/play/local`, `/game/[id]` |
| **Prose** | `prose` → `max-w-4xl` | Long-form reading + diagrams | `/rules` |
| **Narrow** | `narrow` → `max-w-lg` | Focused forms (join, codes) | `/join` |
| **Hero text** | `heroTextWidth` → `max-w-2xl` | Lead copy line length only | Home hero, rules hero — **not** the page column |
| **Overlay** | `max-w-md` (local to component) | Modals / waiting room / game-over panel | `GameOverOverlay`, `WaitingRoomPanel` |

Example:

```tsx
import { contentWidth } from "@/lib/layout";

export default function ActivityPage() {
  return (
    <div className={`${contentWidth.standard} space-y-8`}>
      …
    </div>
  );
}
```

### Navigation — single source of truth

- Top-level routes: `src/lib/navigation.ts` → `primaryNav` (currently **Play**, **Leaderboard**, **Rules**).
- Header desktop nav, mobile drawer, and active states all consume `primaryNav`. **Do not** hard-code duplicate nav links elsewhere.
- Logo/title links **home** (`/`); home is not a nav item.

### No duplicate actions (CTAs)

**Do not add a button or link that does the same thing as one the user already has**, unless it is a deliberate, documented exception.

| Action | Already available via | Do not add on pages |
|--------|----------------------|---------------------|
| Start / Play | Header **Play** (`/play`) | Extra “Play now”, “Get started”, hero Play buttons |
| Rules | Header **Rules** | Redundant “Rules” buttons in hero (inline text link is OK) |
| Sign in | Header `UserMenu` | Second sign-in buttons in page body |
| Account settings | Header Clerk **UserButton** | Duplicate name/email forms or “Manage account” pages |
| Theme | Header `ThemeSwitcher` (desktop) / mobile drawer | Duplicate theme toggles in page content |

**Allowed exceptions** (only when truly needed):

1. **Mobile home** — compact **Play** in header when `sm` nav is hidden (`Header.tsx`, `sm:hidden`, home only).
2. **End of long informational content** — one contextual CTA after reading (e.g. “Go to Play” at the bottom of `/rules`).
3. **In-flow task completion** — actions tied to a specific entity (e.g. “Resume game” on a card, mode cards on `/play`, copy link in waiting room).
4. **Game screen** — restart / forfeit / rematch in `GameHeader` / `GameOverOverlay` (not global nav).

When unsure: **remove the duplicate** or ask the user.

### Signed-in user area

Account settings (name, email, password, sign out) live in the header **Clerk UserButton** only — no separate account/profile page.

Game-specific data (stats, finished-game history) lives on **`/activity`**, linked from:

- Header **Activity** pill (signed-in `UserMenu`, not `primaryNav`)
- Home **Your record** teaser (`StatsTeaser`) → “View activity”

**Ranked rating** (Elo) appears on `/activity` and the global **`/leaderboard`** (`primaryNav`). Ranked matchmaking is in-flow on `/play?step=multiplayer` (auto-find **Ranked**); sign-in required. Casual/async stats (W/L/streak) stay separate from Elo.

### Play flow wizard (`/play`)

- **Continue playing** — `ActiveGamesList` (compact) at the top of every wizard step (`choose`, `multiplayer`, `create`); not replaced by the public-games modal.
- **Steps** (query `?step=`): default **choose** (Local | Multiplayer) → **multiplayer** (auto-find, browse public modal, create, inline join code) → **create** (visibility, pace, rules).
- **Auto-find** — inline enqueue (quick realtime, ranked, async); header queue indicators unchanged.
- **Public lobby** — modal lists `visibility: public` waiting rooms; private rooms stay code/link only.
- **Legacy URLs** — `/play/online`, `/play/ranked` redirect into the wizard.

`/profile` and `/history` redirect to `/activity`. Do not reintroduce an Account tab or duplicate Clerk profile UI.

### Copy on home

- Hero should **not** push a primary Play CTA or call out header **Play** in copy; modes and rules card cover discovery (see `src/app/page.tsx`).

### Play nav badge (`ActiveGamesBadge`)

- Count on header **Play** = in-progress games only (`status !== "waiting"`). **Waiting for opponent** rooms stay in `ActiveGamesList` on `/play` but do not increment the badge. Prioritize **your turn** when any exist. Tooltip / `aria-label` describe the count; do not rely on the number alone.
- Quick-match **queue** (`matchmakingQueue`) is separate — use `MatchmakingQueueIndicator`, not the badge.
- **Hide the badge** only on `/game/*` — you are already in that match. Keep it visible on `/`, `/play`, and all other routes so the count does not flicker away when navigating home or the play hub.
- **Play hub** (`/play`) must list in-progress games at the top when any exist (`ActiveGamesList`, compact) so users who follow the badge see what to resume.

### Quick match queue (`MatchmakingQueueIndicator`)

- Realtime quick match queue is **server-persisted** (`matchmakingQueue`); do **not** cancel on route change.
- While queued, show **`MatchmakingQueueIndicator`** in the header (desktop pill + mobile menu drawer) with **Cancel**; `MatchmakingQueueListener` in `providers.tsx` redirects when a game is created.
- Shared hook: `src/hooks/useMatchmakingQueue.ts`. Online play page may duplicate Cancel on small screens (`sm:hidden`) when the header pill is cramped.

### Theming

- Themes: `src/lib/themes.ts`, CSS variables in `src/styles/themes.css`.
- Use semantic Tailwind tokens (`bg-surface`, `text-muted`, `border-border`, `text-accent`) — not raw hex in components.
- `ThemeSwitcher` + `ThemeProvider` own theme persistence; do not reimplement `localStorage` theme logic in pages.

### Convex / backend

- UI work does not change Convex patterns; for backend, read `convex/_generated/ai/guidelines.md` first.

---

## Product

Gaming / competitive board game. Dark-first, readable at a glance.

## Colors (CSS variables)

Defined per theme in `src/styles/themes.css`, wired through `src/styles/globals.css`.

- **Background** `--color-bg`
- **Surface** `--color-surface`, `--color-surface-elevated`
- **Player X** cool (`--color-x` / `playerX`)
- **Player O** warm (`--color-o` / `playerO`)
- **Accent** `--color-accent` (CTAs, active board ring)

## Typography

- **Font:** Inter (`src/app/layout.tsx`)
- **Body:** 16px minimum
- **Headings:** 24px / 32px

## Touch & a11y

- Minimum tap target: 44×44px (cells, buttons)
- Visible focus rings on interactive elements
- `prefers-reduced-motion`: disable decorative animation (see `globals.css`)

## Motion

- Micro-interactions: 150–250ms
- Cell press: `active:scale-95`

## Components

| Area | Location |
|------|-----------|
| Primitives | `src/components/ui/` — `Button`, `Card`, `Badge`, `Avatar` |
| Layout widths | `src/lib/layout.ts` — `contentWidth`, `heroTextWidth` |
| Shell | `src/components/layout/` — `Header`, `MobileNav`, `NavLink`, `UserMenu`, `ThemeSwitcher` |
| Activity | `src/components/activity/` — `ActivityStats`, `GameHistoryList`, `StatsTeaser` |
| Game | `src/components/game/` — `UltimateBoard`, `SmallBoard`, `Cell`, overlays |

Extend existing components before adding one-off styled duplicates.

## Updating this doc

When conventions change, update **this file and** `.cursor/rules/ui-design-system.mdc` in the same task:

1. Add or edit rules under **Conventions** here (detail, tables, examples).
2. Mirror project-wide rules as short bullets under **Non-negotiables** in the Cursor rule.

Triggers: user corrects a repeated mistake, new nav/route, layout shell change, or new global UI pattern. Do not leave updates only in code comments or chat.
