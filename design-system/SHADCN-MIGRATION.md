# Shadcn UI migration checklist

**Status:** Complete (Phases 0–5, May 2026)  
**Scope:** App shell primitives and form/dialog patterns — not a rewrite of game board UI or product conventions.  
**Source of truth for product UI rules:** [`MASTER.md`](./MASTER.md)

---

## Goals

- [x] Adopt shadcn/ui (Radix + Tailwind + copy-paste components).
- [x] Keep multi-theme behavior (`data-theme`, `themes.css`, `ThemeProvider`).
- [x] Keep semantic game tokens (`playerX`, `playerO`, `--color-active-board`).
- [x] Preserve MASTER.md conventions (navbar, CTAs, `contentWidth`, `primaryNav`).
- [x] Minimize churn: stable import paths (`@/components/ui/Button`, etc.).

## Non-goals (unchanged)

- [x] No Tailwind v3 → v4 migration.
- [x] No home/rules/board visual redesign.
- [x] No Clerk / Convex changes.

---

## Phase 0 — Tooling ✓

- [x] `components.json`, `src/lib/utils.ts` (`cn`), dependencies installed manually (CLI init skipped on Windows).
- [x] `tailwind.config.ts` extended; `tailwindcss-animate` plugin.
- [x] **File naming:** PascalCase for `Button.tsx`, `Card.tsx`, `Badge.tsx`, `Avatar.tsx` (Windows case-collapse); lowercase for `dialog.tsx`, `sheet.tsx`, `input.tsx`, `label.tsx`, `radio-group.tsx`, `table.tsx`.
- [x] **Style:** New York (`components.json`).
- [x] `npm run lint` / `test` / `build` pass.

---

## Phase 1 — Theme bridge ✓

- [x] Shadcn aliases in `themes.css` (`:root`, `[data-theme]`).
- [x] Dual token docs in MASTER.md **Colors**.
- [x] `prefers-reduced-motion` unchanged in `globals.css`.

---

## Phase 2 — Primitives ✓

- [x] `Button.tsx` — CVA + `primary`/`secondary`/`ghost`/`danger`, `loading`, `ButtonLook`.
- [x] `Card.tsx` — shadcn card + default `p-6`.
- [x] `Badge.tsx` — accent-tinted default.
- [x] All prior consumers unchanged imports.

---

## Phase 3 — Overlays & forms ✓

- [x] `dialog.tsx` + `TitledDialog` (replaces legacy `Modal.tsx`).
- [x] `PublicGamesModal` → `TitledDialog`.
- [x] `sheet.tsx` → `MobileNav`.
- [x] `input.tsx` / `label.tsx` → join flows.
- [x] `radio-group.tsx` → `PlayStepCreate` (not native `<select>`).

---

## Phase 4 — Feature polish ✓

| Area | Done | Notes |
|------|------|-------|
| Play wizard / create | ✓ | `RadioGroup` on `PlayStepCreate` |
| Activity / leaderboard | ✓ | `Table` + `Avatar` on stats, leaderboard, rating history, game history |
| Queue indicators | — | Deferred: optional `Alert` only |
| Game overlays | ✓ | `AlertDialog` (`GameOverOverlay`), `GamePanelDialog` (`WaitingRoomPanel`) |
| Theme switcher | ✓ | `DropdownMenu` + radio items |
| Rules / home | ✓ | Existing primitives only |

---

## Phase 5 — Cleanup & documentation ✓

- [x] Removed `Modal.tsx`; use `TitledDialog` from `dialog.tsx`.
- [x] No raw hex in `src/components/` or `src/app/` (hex only in `themes.css` / `themes.ts`).
- [x] `MASTER.md` — Components file list, Colors dual-token table, modal convention.
- [x] `.cursor/rules/ui-design-system.mdc` — primitives + **Modals** rule (#12).
- [x] This checklist updated; decisions log filled.

---

## Testing ✓

### Automated

- [x] `npm run lint`
- [x] `npm run test`
- [x] `npm run build`
- [x] `npm run test:e2e` (existing home + local game specs)

### Manual (spot-check before release)

- [ ] All themes via ThemeSwitcher on `/`, `/play`, `/join`.
- [ ] `/play?step=multiplayer` — public games `TitledDialog` open/close, Escape.
- [ ] Mobile — sheet menu, queue cancel in drawer.

---

## Decisions log

| Date | Item | Decision |
|------|------|----------|
| 2026-05 | File naming | PascalCase `Button`/`Card`/`Badge`/`Avatar`; lowercase Radix files |
| 2026-05 | shadcn style | New York |
| 2026-05 | Modals | `TitledDialog` in `dialog.tsx`; no `Modal.tsx` |
| 2026-05 | Select / Tabs | Skipped — radio cards + URL wizard steps sufficient |
| 2026-05 | DropdownMenu | Skipped — ThemeSwitcher grid + Clerk UserButton |

---

## Definition of done ✓

- [x] Phases 0–5 complete.
- [x] `src/components/ui/` shadcn-based; `Modal.tsx` removed.
- [x] Themes work for all `ThemeId` in `src/lib/themes.ts`.
- [x] MASTER.md + `.mdc` updated.
- [x] E2E run on integration branch.

---

## Optional follow-ups (not blocking)

- `Alert` on queue indicators for queue errors/status.
- `npx shadcn@latest add` for future components (use PascalCase on Windows for any file that collides).

## Extended polish (May 2026)

- [x] `dropdown-menu.tsx` → `ThemeSwitcher`
- [x] `alert-dialog.tsx` → `GameOverOverlay`
- [x] `GamePanelDialog` → `WaitingRoomPanel` (+ shadcn `Input` for room code)
