# AIRTIME — Design System Documentation

> *A field guide to television.*  
> A TV-series discovery product with the soul of a printed weekly guide and the  
> rigor of a newsroom. This document defines every visual decision in the product.

---

## 1. Concept

Television is a **time-based** medium: it airs, it returns, it occupies a slot in
your week. Almost every streaming product pretends otherwise — infinite scroll,
algorithm soup, no clocks, no nights, no seasons.

**AIRTIME** leans the other way. It is modeled on the great broadcast-era
artifacts: the weekly *TV Guide*, the newspaper listings page, the channel
chalkboard at a neighborhood video shop, the film journal. Discovery here is
**editorial**: a critic tells you what matters, a schedule tells you when, and a
dense index lets you hunt.

Three artifacts define the visual language:

| Artifact | What it gives the UI |
|---|---|
| The printed weekly guide | Hairline rules, dense rows, mono times, channel numbers, issue dates |
| The film journal | Serif display type, pull quotes, criticism, generous whitespace, colophon |
| The broadcast signal | "ON AIR" pulse, signal-strength ratings, test bars, tuning ticker |

**What this product is not.** Not a dark-mode glassmorphism dashboard. Not a
purple-gradient hero with a floating card. Not a grid of rounded thumbnail
cards with star ratings. If a decision smells like generic streaming-platform
AI output, it is rejected.

---

## 2. Design principles

1. **Paper, not glass.** The surface is warm, printed, imperfect. Everything
   sits *on* the paper; nothing floats *through* it. Shadows are used once or
   twice in the whole product, and always as a printed overprint, never as a
   Material elevation.
2. **Time is the primary axis.** Timeslots, "airs tonight", countdowns, issue
   numbers — temporal metadata is first-class typography, not a caption afterthought.
3. **Editorial hierarchy over visual noise.** One cover story per viewport.
   The biggest element on the page is always typography or key art — never a badge.
4. **Density is a feature.** The Index and the Schedule reward scanning.
   Hairlines and mono numerals let rows sit close together without confusion.
5. **Warmth through imperfection.** Fraunces' *wonk* axis, paper grain, a
   slightly-too-big italic — the hand-set feeling. We polish the grid and then
   deliberately bend one or two things per page.
6. **Criticism is the product.** Copy is written, never lorem-ipsum. Every show
   has a thesis. Discovery = taste, not inventory.

---

## 3. Brand & voice

- **Name:** AIRTIME — always uppercase, always two syllables, never "AirTime" or "Air Time".
- **Tagline:** *Television, considered.* (used in the masthead mark and footer)
- **Voice:** The critic who is also a friend. Opinionated, specific, calm.
  Writes "The most patient thriller of the decade," not "A thrilling mystery
  you won't want to miss!"
- **Issue framing:** The site is published in weekly issues. *"Issue No. 47 —
  Week of March 9, 2026."* This gives every screen a date, an edition number,
  and a reason to return.

---

## 4. Color system

A warm, earthy, **print-inspired** palette. No neon, no gradients, no glass.
Every color has a job and a contrast pair.

### 4.1 Core tokens

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#EFE9DC` | Default surface. Warm bone. The "page". |
| `--paper-deep` | `#E6DEC9` | Alternate panels, the Index, pressed states. |
| `--paper-warm` | `#F7F2E7` | Raised cards, pull-quote wells (subtle lift). |
| `--ink` | `#1D1A15` | Primary text, rules at 100%. Warm printer's black. |
| `--ink-60` | `#57503F` | Secondary text, metadata. |
| `--ink-40` | `#8C8573` | Tertiary text, disabled, hairlines on light. |
| `--accent` | `#B8401F` | "Tuner red" — the **recording light**. One accent only. Links, ON AIR, key highlights, the active tab. |
| `--accent-deep` | `#8E2F15` | Accent hover/pressed, dark-surface accent. |
| `--sage` | `#7E8470` | Muted olive — genre tags, editorial secondary. |
| `--gold` | `#BE9136` | Mustard — "signal" highlights, countdown numerals, test bars. |
| `--night` | `#15120D` | Dark sections (Tonight / prime time). Deep warm black. |
| `--night-paper` | `#E9E2D0` | Text on night sections. Slightly warmer than paper. |
| `--night-60` | `#9A917C` | Secondary text on night. |

### 4.2 Usage rules

- **Accent budget.** `--accent` appears at most ~6 times per viewport outside
  of imagery. It is a recording light: it means *live, important, now*. If it
  is everywhere it means nothing.
- **Hairlines** are `--ink` at 12–16% opacity (or `--ink-40`), never grays
  pulled from a neutral palette — they must stay warm.
- **Night sections** (Tonight schedule, footer) invert paper/ink but keep the
  same warmth. Text on night is `--night-paper`, rules at 14% opacity.
- Test bars (section dividers) use muted versions: `#B8401F`, `#BE9136`,
  `#7E8470`, `#57503F`, `#1D1A15` — each at full saturation but thin (3–4px)
  so they read as a printer's mark, not decoration.

### 4.3 Contrast (WCAG 2.1)

| Pair | Ratio | Use |
|---|---|---|
| `--ink` on `--paper` | 13.4:1 | Body text |
| `--ink-60` on `--paper` | 5.9:1 | Metadata, captions |
| `--paper` on `--night` | 14.1:1 | Night body text |
| `--accent` on `--paper` | 5.4:1 | Links ≥ 16px |
| `--night-paper` on `--accent-deep` | 5.1:1 | Accent blocks on night |

Small accent text under 16px is always underlined or paired with an icon.

---

## 5. Typography

Four families, each with one job. Set via Google Fonts.

| Family | Axis / styles | Job |
|---|---|---|
| **Fraunces** | Variable: `opsz 9..144`, `wght 300..900`, `SOFT 0..100`, `WONK 0..1` | Display headlines, cover titles, pull quotes. Organic, warm, slightly hand-set. |
| **Newsreader** | 400 / 500 italic | Editorial body — criticism, blurbs, article excerpts. |
| **Inter** | 400 / 500 / 600 | UI: nav, labels, buttons, metadata labels. |
| **JetBrains Mono** | 400 / 500 / 700 | Times, channel numbers, episode codes, countdowns, issue numbers. |

### 5.1 Display scale (desktop)

| Token | Size / line-height / tracking | Family | Usage |
|---|---|---|---|
| `display-1` | clamp(3.2rem, 7.5vw, 6.8rem) / 0.98 / −0.02em, `wght 560, SOFT 60, WONK 1` | Fraunces | Cover-story title (hero). |
| `display-2` | clamp(2.2rem, 4.5vw, 3.6rem) / 1.04 / −0.015em, `wght 500` | Fraunces | Section titles. |
| `display-3` | 1.6rem / 1.15 / −0.01em, `wght 480, italic` | Fraunces italic | Article titles in Journal. |
| `eyebrow` | 0.72rem / 1 / +0.22em, 600 uppercase | Inter | Section labels — "CRITICS' JOURNAL", "TONIGHT". |
| `pull-quote` | 1.55rem / 1.35 / −0.01em, `wght 380, SOFT 80, WONK 1` | Fraunces | Critic pull quotes. |

### 5.2 Body & UI scale

| Token | Size / line-height | Family | Usage |
|---|---|---|---|
| `body-editorial` | 1.0625rem / 1.7 | Newsreader 400 | Blurbs, excerpts, criticism. |
| `body-ui` | 0.9375rem / 1.55 | Inter 400 | UI copy. |
| `meta` | 0.75rem / 1.4 / +0.06em | Inter 500 uppercase | Labels ("DRAMA · 3 SEASONS"). |
| `mono-sm` | 0.78rem / 1.3 | JetBrains Mono 400 | Times, codes, numbers. |
| `mono-lg` | 1.05rem / 1 | JetBrains Mono 700 | Countdowns, channel badges. |

### 5.3 Typographic rules

- **Italics carry opinion.** Critic quotes and the words *tonight*, *returns*,
  *finale* in editorial copy are italicized Newsreader/Fraunces. Never for decoration.
- **Mono is the schedule.** Every time, channel, and number is JetBrains Mono.
  Proportional numerals are forbidden for temporal metadata.
- **No all-caps without tracking.** Any uppercase Inter gets +0.14–0.24em
  tracking, and never below 0.7rem.
- **One serif family per sentence.** Fraunces and Newsreader never appear in
  the same block; Fraunces is the headline, Newsreader is the paragraph.
- **Em dashes and curly quotes.** The copy uses — and " " throughout.

---

## 6. Texture & material

- **Paper grain.** A fixed full-viewport SVG `feTurbulence` noise layer,
  opacity 5–6%, `mix-blend-mode: multiply` on paper and `overlay` on night.
  Pointer-events none, z-index above content but below modals. This is the
  single most important "organic" decision — every screenshot must feel printed.
- **Halftone.** A faint radial-dot pattern (SVG, 3–5% opacity) used inside the
  cover-story image well and the ON AIR block. Never on body text.
- **Overprint rules.** Section dividers are 1px ink at 14%. Card boundaries are
  hairlines, not boxes-with-shadows. When a card needs lift (pull quotes,
  preview pop), use `--paper-warm` + 1px hairline + a single 0 18px 40px −24px
  `--ink` shadow at 22% — a press shadow, not an elevation.
- **Rounding is minimal.** 2px on image wells and buttons ("printed corner"),
  0 everywhere else. No 16px+ radii anywhere in the product.

---

## 7. Motifs & iconography

No icon font, no emoji in the interface. The product's "icons" are its
**broadcast vernacular**:

1. **Channel badge** — a 34–40px square, 1.5px ink border, mono two-digit
   number (`04`, `13`). On night, inverted (ink fill, paper number). Used
   before every title in schedules and the Index.
2. **Signal rating** — four bars (2, 4, 6, 8px wide... 4, 7, 10, 13px tall),
   filled `--accent` to the rating, remainder ink at 20%. Replaces stars.
   Tooltip: "Signal: strong". Animates on row hover.
3. **Timeslot** — mono `21:00` in a fixed 56px column, right-aligned, with a
   1px tick mark extending into the row at 40% opacity.
4. **ON AIR** — a 6px dot in `--accent` with a 2s ease pulse (opacity + scale
   ring), next to mono "ON AIR". Used in the masthead and on live rows.
5. **Test bars** — a 4px-tall strip of 5 muted colors as section breaks
   between major chapters. A print registration mark, not decoration.
6. **Frequency mark** — decorative mono text in footers and section corners:
   `CH 04 · 21:00 · 50.000 MHz`. Pure flavor, low contrast.
7. **Tuning ticker** — a CSS marquee of titles separated by `·`, mono,
   10% ink, with a single accent "LIVE" tag. Pauses on hover.

---

## 8. Layout system

### 8.1 Grid

- **Desktop:** 12 columns, 1184px max content width, 24px gutters, 64px side
  margins (fluid below 1280px). Section vertical rhythm: 96–128px.
- **Tablet (≤1024):** 8 columns, 32px margins.
- **Mobile (≤640):** 4 columns, 20px margins, section rhythm 64–72px.

### 8.2 Page anatomy

```
┌──────────────────────────────────────────────────────────┐
│ TICKER (tuning marquee, 32px tall, mono, ink-10%)        │
├──────────────────────────────────────────────────────────┤
│ MASTHEAD (issue no. · date · ON AIR | wordmark | search) │
├──────────────────────────────────────────────────────────┤
│ COVER STORY (asymmetric: 7/12 type + 5/12 key art well)  │
│   eyebrow · display-1 · editorial blurb · critics + CTA  │
├──────────────────────────────────────────────────────────┤
│ TEST BARS ─────────────────────────────────────────────  │
├──────────────────────────────────────────────────────────┤
│ TONIGHT ON THE DIAL (night section, schedule rows)       │
│   21:00 ▏CH 04  TIDE COUNTY         · drama   ▮▮▮  ›    │
│   row hover → floating preview card follows cursor       │
├──────────────────────────────────────────────────────────┤
│ CRITICS' JOURNAL (editorial: 1 lead + 2 essays, quotes)  │
├──────────────────────────────────────────────────────────┤
│ RETURNING SOON (3 countdown cards, gold numerals)        │
├──────────────────────────────────────────────────────────┤
│ THE INDEX (A–Z list, genre tabs, channel + signal)       │
├──────────────────────────────────────────────────────────┤
│ COLOPHON / FOOTER (night, giant wordmark, frequencies)   │
└──────────────────────────────────────────────────────────┘
```

### 8.3 Layout rules

- **Asymmetry is required** in the hero and journal: the 7/5 split, never
  centered. The page is allowed one centered element (the masthead wordmark).
- **Rules before boxes.** Adjacent blocks are separated by hairlines, not card
  chrome. The only true "cards" are: the schedule hover preview, countdown
  wells, and pull quotes.
- **Whitespace is a material.** Section padding ≥ 96px desktop. Dense blocks
  (schedule, index) are *visually* dense but sit inside generous margins.
- **No decorative floating shapes.** Every non-text element is either key
  art, a motif (§7), or texture (§6).

---

## 9. Components

### 9.1 Buttons

- **Primary ("Tune in"):** `--ink` fill, `--paper` text, 2px radius, 14px/28px
  padding, Inter 600 0.85rem +0.06em tracking. Hover: fill `--accent-deep`,
  text `--night-paper`, 4px press offset downward. A 1px mono "▶" (play glyph)
  may precede label, 0.75em.
- **Secondary:** transparent, 1.5px ink border, ink text. Hover: ink fill
  inverts to paper text.
- **Tertiary (text link):** accent, 1px underline offset 3px, underline grows
  on hover from left.

### 9.2 Schedule row

`21:00 ▏CH [04] ▏TITLE (serif 1.15rem) · meta (mono, ink-40) ▏signal bars ▏›`

- 56px time column · 56px channel · 1fr title · auto meta · 64px signal · 32px arrow
- Row padding 18px 0; hairline between rows.
- **Hover:** background `--paper-warm`; title shifts 6px right (0.25s ease);
  arrow fills accent; a floating preview card (key art + thesis + timeslot)
  appears near the cursor, press-shadow, 280px wide, `pointer-events: none`.
- **Live row:** ON AIR dot + accent timeslot.

### 9.3 Genre tabs (Index)

Text-only tabs in a hairline-bordered strip: `All · Drama · Thriller ·
Anthology · Sci-Fi · Horror`. Active: ink underline 2px + accent count badge
(mono). On filter, rows fade/translate in with stagger (30ms/row). Counts
recompute live.

### 9.4 Countdown well

`--paper-deep` panel, 1px hairline, key art at 16:9 top, gold mono numerals
(`12`) at 3.2rem with `days` label, serif title, Newsreader blurb. Hairline
between cards. On hover, numerals gain `--accent`.

### 9.5 Pull quote

`--paper-warm` well, 1px hairline, Fraunces 380 italic-ish quote with a 3px
accent rule at left, critic attribution in meta style.

### 9.6 Masthead

Thin top rule, then: issue + date + ON AIR (left), giant centered wordmark
(Airtime, Fraunces 800, letterspacing −0.03em, with the dot of the "i"
replaced by an accent square), nav + search (right). Second hairline below.

### 9.7 Footer (colophon)

Night section. Giant 9vw wordmark in `--night-paper` at 12% opacity as
backdrop; three columns: About / The Guide / Signal (frequencies, issue info);
bottom row: © 2026 AIRTIME — *Television, considered.* and a mono "SET 04 ·
CAL 02 · END OF BROADCAST".

---

## 10. Motion

Motion is **mechanical, quiet, and physical** — like a VCR or a printing
press, not a spring physics toy.

| Motion | Spec | Where |
|---|---|---|
| Reveal | `opacity 0→1, translateY 14px→0`, 700ms `cubic-bezier(0.22, 1, 0.36, 1)`, 80px viewport threshold, once. | All sections, staggered 60ms for rows. |
| Ticker | `translateX` linear 40s, −100% loop, pause on hover. | Top marquee. |
| ON AIR pulse | 2s ease-in-out infinite, opacity 1↔0.35 + scale ring. | Masthead, live rows. |
| Row hover | bg 180ms, title translate 250ms ease-out, arrow 200ms. | Schedule, Index. |
| Preview card | opacity 0→1 160ms, follows cursor with 0.08 lerp. | Schedule hover. |
| Signal bars | bar heights stagger 0→n, 40ms each, 300ms, on first reveal & hover. | Ratings. |
| Countdown | numerals count up on reveal (900ms, ease-out). | Returning Soon. |
| Filter transition | rows fade+translate 220ms, 30ms stagger; layout reflow instant. | Index. |
| Test bars | static (they are print marks — they do not move). | Dividers. |

**Rules:** no bounces, no springs, no parallax, no auto-playing video, no
scroll-jacking. Easing is either linear (ticker) or the single "press" curve
above. All motion respects `prefers-reduced-motion` (instant, no ticker).

---

## 11. Accessibility

- Focus ring: 2px `--accent` offset 3px, always visible on keyboard.
- Every row and card is a real `<a>` / `<button>`; the hover preview has a
  `aria-hidden` focus-equivalent via `:focus-visible`.
- Signal bars expose `aria-label="Rated 4 of 5 — strong signal"`.
- Ticker is `aria-hidden` (decorative repetition) with a static equivalent
  elsewhere; it also pauses for any pointer/keyboard focus within.
- Contrast pairs audited in §4.3; night and light sections both pass AA for
  body text.
- Images: descriptive alt text ("Key art: a half-submerged village at dusk")
  — never "image1.jpg".
- Reduced motion: all §10 animations collapse to instant states; grain stays
  (static, 6% opacity is vestibular-safe).

---

## 12. Responsive behavior

| Breakpoint | Behavior |
|---|---|
| ≥1025px | Full anatomy (§8.2), cursor preview card, 3-col journal. |
| 641–1024px | Hero stacks type-over-art; schedule collapses time+channel into one column; journal 2-col; countdown 3-col → 1-col row with art left. |
| ≤640px | Masthead wraps (wordmark center, nav below, horizontally scrollable); schedule becomes a compact list (time inline, signal hidden behind `···`); Index rows keep title+channel, hide meta; preview card disabled (tap expands a press-card instead); countdown 1-col; footer wordmark 18vw. |
| Reduced motion | See §11. |

---

## 13. Do / Don't

**Do**
- Write real criticism. Every show has a one-sentence thesis.
- Use mono for every number, time, and code.
- Let the paper grain and the wordmark do the "branding".
- Break the grid once per screen (italic, oversized quote, asymmetric hero).
- Keep the accent rare.

**Don't**
- Don't use gradients, glassmorphism, or blur panels.
- Don't use star ratings, emoji, or generic icon sets.
- Don't use purple/indigo or pure white/pure black anywhere.
- Don't center the hero.
- Don't autoplay video or hijack scroll.
- Don't add a second accent color for "variety".

---

## 14. File structure

```
.
├── DESIGN.md                 ← this document
├── preview.html              ← static, self-contained design preview
├── public/images/*.jpg       ← 10 cinematic key-art plates
└── src/
    ├── App.tsx               ← page assembly
    ├── index.css             ← tokens, fonts, grain, keyframes
    ├── data/shows.ts         ← catalogue (titles, channels, slots, theses)
    ├── hooks/useReveal.ts    ← IntersectionObserver reveal hook
    └── components/
        ├── Ticker.tsx
        ├── Masthead.tsx
        ├── CoverStory.tsx
        ├── TestBars.tsx
        ├── TonightSchedule.tsx
        ├── CriticsJournal.tsx
        ├── ReturningSoon.tsx
        ├── ShowIndex.tsx
        └── Colophon.tsx
```

Two files beyond the list above: `components/Motifs.tsx` holds the shared
broadcast motifs used by more than one section (channel badge, signal bars,
ON AIR, frequency mark), and `lib/scroll.ts` the guarded anchor travel used by
the search field and the footer genre chips.

---

## 15. Implementation notes

- Fonts: Google Fonts `<link>` with Fraunces variable (`ital,opsz,SOFT,WONK,wght`),
  Newsreader (400;500 italic), Inter (400;500;600), JetBrains Mono (400;500;700).
- Grain: inline SVG data-URI in CSS, `position: fixed; inset: 0; pointer-events: none;
  z-index: 60; opacity: .055; mix-blend-mode: multiply`.
- The build inlines assets (single-file output); images in `public/images/` are
  referenced relatively and served from the same origin.
- Data is editorial content, not marketing copy — update `src/data/shows.ts`
  to change the guide. All dates/times are issue-scoped and intentionally
  fixed to the issue week (they are *the guide*, not live TV).

---

## 16. Implementation ledger

Decisions taken where the document left a choice open, so the next reader can
tell a deviation from a mistake:

- **Signal scale.** §7.2 gives four bars; §11 gives the label
  `Rated 4 of 5 — strong signal`. Four bars are drawn, and the fifth level is
  *empty* — so a rating of 4 reads as “4 of 5, all four bars lit”, and the
  accessible string matches §11 exactly. Words: 1 faint · 2 fair · 3 good · 4 strong.
- **Wordmark case.** §3 mandates uppercase AIRTIME, §9.6 describes the dot of
  the “i”. The mark is set uppercase in Fraunces 800 with a single accent square
  above the first I — one accent, not two.
- **Hover tint on night.** §9.2 asks for `--paper-warm` on row hover, which
  would flash a light bar across a night section. Night rows take
  `rgba(233,226,208,.07)` instead; the light `--paper-warm` surface is reserved
  for the press-shadowed preview card, which is what the section is built to show.
- **Countdown arithmetic.** Days are measured from the issue date
  (`ISSUE.dateISO`, 9 March 2026 21:00), never from the wall clock, so the
  numbers in Issue No. 47 stay true to the issue (§15).
- **Ticker contrast.** “10% ink” in §8.2 is applied as the strip's tint and
  rule; the scrolled text itself is `--ink-60` so it is readable.
- **Search.** The masthead search is real: it filters the Index live and
  announces the number of entries through `aria-live`. The Index tabs and the
  footer genre chips write to the same state, so every route into the list
  behaves identically.
- **Rows are links.** Schedule rows point at their Index entry
  (`#index-<slug>`); the selected entry expands a press-card with the key art,
  the thesis and the blurb. On ≤640px, where the floating preview is disabled,
  a tap expands the schedule row itself instead (§12).
