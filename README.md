# Bet on Poker — Dealer Console

A fast, mobile-friendly **dealer console** for **Bet on Poker** with **6 boxes**.  
You deal cards, mark callouts by hand (no auto hand-reading), and announce under a **20-second** clock.

**Live demo (GitHub Pages):**  
https://rezanoel.github.io/bet-on-poker/

**Repository:**  
https://github.com/RezaNoel/bet-on-poker

---

## What it is

In Bet on Poker, six boxes play out a shared community board. As the dealer/announcer you need to:

1. Deal hole cards and the board
2. Call combinations, leading boxes, draws, and possibilities
3. Finish with the winner and the five best cards pushed up

This app is built for **speed on phone**: tap boxes, pick icon options, move to the next box, Confirm when the timer hits zero.

---

## Features

- **6 boxes** + community board (flop / turn / river)
- **Manual dealing** from a suit-grouped tray, plus **Auto Deal**
- **Confirm flow**
  - After hole cards → announce preflop (timer starts)
  - Confirm after 20s → auto-deals next street and starts the next announce
- **20s timer** auto-starts on timed announce stages; Confirm unlocks at `0`
- **Tap any box** to open a quick icon panel (works on the whole seat, not only the title)
- **First box tap** on flop/turn marks **Leading**
- Card preview **inside the options panel** (hole + board) so you don’t bounce back to the table
- River: pick winner, winning combo, then tap **5 cards** on the felt — they lift with animation
- Compact layout for phones; dealer tray stacks **under** the table on small screens

Nothing is calculated for you. You only select what applies; leave the rest empty.

---

## Announce checklist (manual)

### Preflop
- Pocket pair (+ rank)
- High card (+ rank)
- Straight / flush possibilities

### Flop
- Leading box(es)
- Made combos (Pair, Two Pair, 3 of a Kind, Straight, Flush, …)
- Straight draw / flush draw
- Extra straight / flush possibilities if time remains

### Turn
- Leading / active boxes
- What each active box needs to win

### River
- Winner box(es) + winning combination
- Select 5 best cards → push up

---

## Tech stack

| Piece | Choice |
| --- | --- |
| UI | React 19 + TypeScript |
| Build | Vite 7 |
| Motion | Framer Motion |
| Icons | Lucide React |
| Hosting | GitHub Pages (Actions) |

---

## Local development

Requirements: **Node.js 20+** (22 recommended).

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173/bet-on-poker/`).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## GitHub Pages

The site is deployed automatically on every push to `main` via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

- **Base path:** `/bet-on-poker/` (see `vite.config.ts`)
- **URL:** https://rezanoel.github.io/bet-on-poker/

To redeploy manually: **Actions → Deploy to GitHub Pages → Run workflow**.

---

## Project layout

```
src/
  App.tsx                 # Stage flow, Confirm, timer
  components/             # Table, boxes, tray, inspector, cards
  lib/
    deck.ts               # 52-card deck helpers
    gameState.ts          # Deal / confirm / callout state
    stages.ts             # Stage order + option lists
    boxMarks.ts           # Seat badges / icons
    optionIcons.ts        # Inspector icon options
  styles/                 # Felt theme + compact mobile layout
```

---

## Dealer tips (under 20 seconds)

1. **Auto Deal** hole cards → **Confirm** (timer starts)
2. Tap each box → hit icon tiles → **Next Box →**
3. When the timer hits 0 → **Confirm** (next street auto-deals)
4. On flop/turn, first box you tap is **Leading**
5. On river, mark winner → tap 5 cards on the board/holes → they rise

---

## License

Private/personal project unless otherwise noted by the repository owner.
