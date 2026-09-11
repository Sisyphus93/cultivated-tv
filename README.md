# AIRTIME

**Television, considered.**

A weekly TV-series guide with the soul of a printed listings page and the rigor of a
film journal. Criticism tells you what matters, a schedule tells you when, a dense
index lets you hunt.

> This branch replaces the previous "Noir" discovery dashboard (TMDB + Stremio deep
> links). That app is preserved in the git history, tagged by its old README;
> everything here is the guide.

---

## The idea

Television is a time-based medium: it airs, it returns, it occupies a slot in your
week. Most streaming UIs pretend otherwise — infinite scroll, no clocks, no seasons.
AIRTIME leans the other way and borrows from three artifacts:

| Artifact | What it gives the UI |
| --- | --- |
| The printed weekly guide | Hairline rules, dense rows, mono times, channel numbers, issue dates |
| The film journal | Serif display type, pull quotes, criticism, colophon |
| The broadcast signal | ON AIR pulse, signal-strength bars, test cards, a tuning ticker |

The site is published in issues — *Issue No. 47, Week of March 9, 2026* — so every
screen carries a date and a reason to come back. All dates in the guide are pinned to
the issue week on purpose: this is a printed thing, not a live feed.

## What is on the page

1. **Tuning ticker** — a slow mono marquee; pauses for pointer or keyboard focus.
2. **Masthead** — issue number, date, ON AIR, the wordmark (the tittle of the “i” is
   an accent square), section nav, and a search that filters the Index live.
3. **Cover story** — 7/12 type against 5/12 key art, one thesis, three critics with
   signal bars, one call to action.
4. **Tonight on the dial** — a night section of schedule rows: `21:00 ▏CH 04 ▏TITLE ▏
   meta ▏▮▮▮ ▏›`. Hover lifts a press-shadowed card that follows the cursor; keyboard
   focus gets the same card anchored to the row; on phones a tap expands the row.
5. **Critics’ journal** — a lead piece with a pull quote and two essays, with a
   drop cap and a “Continue” that actually continues.
6. **Returning soon** — three countdown wells, gold numerals counting up on reveal.
7. **The Index** — A–Z by filing title, genre tabs with live counts, every row
   expandable into its full entry (key art, thesis, blurb, credits).
8. **Colophon** — giant wordmark at 12%, About / The Guide / Signal, sign-off.

## Design system

[`DESIGN.md`](DESIGN.md) is the source of truth: tokens, type scale, texture, motifs,
components, motion, responsiveness, accessibility, and a ledger of the places where
the specification left a choice to make.

[`preview.html`](preview.html) is a static, build-free render of the same system —
swatches, the type scale, every motif, buttons, a schedule row, a countdown well —
for checking the palette and the grain without starting a dev server.

Rules worth repeating: warm paper, never glass · one accent (tuner red), used about
six times per viewport · mono for every time, channel and number · no gradients, no
blur, no star ratings, no radius above 2px · shadows are press shadows, twice in the
whole product · criticism is the product, so copy is written, never lorem.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build → dist/index.html (JS + CSS inlined)
npm run typecheck
```

`npm run preview` serves `dist/`. Key art lives in `public/images/` and is referenced
relatively, so the folder can be hosted from any static origin (Vercel, Netlify, a
subdirectory, a USB stick).

## Editing the guide

Everything the site prints comes from [`src/data/shows.ts`](src/data/shows.ts): the
issue, the ten series with their channels, slots, episode codes, theses and blurbs,
the journal pieces, the ticker, the frequency marks. Add a show there and it appears in
Tonight, the Index and (if it has a premiere date) the countdowns.

```
src/
├── App.tsx                    page assembly, in anatomy order
├── index.css                  tokens, type, texture, motifs, components, motion
├── data/shows.ts              the catalogue — editorial content, not marketing copy
├── hooks/useReveal.ts         IntersectionObserver reveal (80px threshold, once)
├── lib/scroll.ts              guarded anchor travel
└── components/
    ├── Ticker.tsx  Masthead.tsx  CoverStory.tsx  TestBars.tsx
    ├── TonightSchedule.tsx  CriticsJournal.tsx  ReturningSoon.tsx
    └── ShowIndex.tsx  Colophon.tsx  Motifs.tsx
```

## Type

Four families, one job each, loaded from Google Fonts: **Fraunces** (variable,
`opsz`/`wght`/`SOFT`/`WONK`) for display, **Newsreader** for editorial body, **Inter**
for UI, **JetBrains Mono** for time. If fonts.googleapis.com is unreachable the page
falls back to Iowan/Georgia and the system mono stack, and the grid still holds.

## Accessibility

Focus rings are 2px accent at 3px offset · every row is a real `<a>` and every filter
a real `<button>` · signal bars expose `aria-label="Rated 4 of 5 — strong signal"` ·
the ticker is `aria-hidden` with the schedule as its static equivalent · countdown
numerals announce their final value, not the animation · key art carries descriptive
alt text · all motion collapses to instant under `prefers-reduced-motion`, and the
paper grain stays because a static 5.5% overlay is vestibular-safe.
