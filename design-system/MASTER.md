# Advanced TicTacToe — Design System

## Product
Gaming / competitive board game. Dark-first, readable at a glance.

## Colors (CSS variables in `src/styles/globals.css`)
- **Background** `--color-bg`
- **Surface** `--color-surface`, `--color-surface-elevated`
- **Player X** cool (`--color-x` / `playerX`)
- **Player O** warm (`--color-o` / `playerO`)
- **Accent** `--color-accent` (CTAs, active board ring)

## Typography
- **Font:** Inter (layout)
- **Body:** 16px minimum
- **Headings:** 24px / 32px

## Touch & a11y
- Minimum tap target: 44×44px (cells, buttons)
- Visible focus rings on interactive elements
- `prefers-reduced-motion`: disable decorative animation

## Motion
- Micro-interactions: 150–250ms
- Cell press: `active:scale-95`

## Components
- `Button`, `Card`, `Badge`, `Avatar` in `src/components/ui/`
- Game board: `UltimateBoard`, `SmallBoard`, `Cell`
