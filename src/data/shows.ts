/**
 * AIRTIME — the guide.
 *
 * Everything the product prints comes from this file: the issue, the catalogue,
 * the tonight schedule, the returns, the criticism and the ticker. Copy is
 * editorial, never marketing (§2.6). Dates are fixed to the issue week on
 * purpose — this *is* the guide, not live television (§15).
 */

export type Genre =
  | 'Drama'
  | 'Thriller'
  | 'Anthology'
  | 'Sci-Fi'
  | 'Horror'
  | 'Comedy'
  | 'Documentary'
  | 'Crime'
  | 'Mystery';

/** The Index tabs (§9.3). Every tab must have rows to show. */
export const INDEX_GENRES = ['Drama', 'Thriller', 'Anthology', 'Sci-Fi', 'Horror'] as const;
export type IndexGenre = (typeof INDEX_GENRES)[number];

/** The Index tab strip: the five genre tabs plus All (§9.3). */
export type IndexTab = 'All' | IndexGenre;

export const SIGNAL_WORDS: Record<number, string> = {
  1: 'faint',
  2: 'fair',
  3: 'good',
  4: 'strong',
};

export interface Critic {
  name: string;
  signal: number;
  note: string;
}

export interface Show {
  id: string;
  title: string;
  channel: string;
  /** Prime-time slot in the night grid, or null when the show is not tonight. */
  slot: string | null;
  runtime: string;
  episode: string;
  code: string;
  genres: Genre[];
  seasons: number;
  years: string;
  /** 1–4, drawn as four bars; 4 reads as “strong”. */
  signal: number;
  thesis: string;
  blurb: string;
  art: string;
  alt: string;
  credit: string;
  creators: string;
  live?: boolean;
  premiere: string | null;
  premiereLabel: string | null;
  status: 'tonight' | 'returning' | 'catalogue';
}

export const ISSUE = {
  no: 47,
  label: 'Issue No. 47',
  week: 'Week of March 9, 2026',
  published: 'Monday, March 9, 2026',
  /** Reference “now” — the countdowns are issue-scoped, never wall-clock. */
  dateISO: '2026-03-09T21:00:00',
  frequency: 'CH 04 · 21:00 · 50.000 MHz',
  signOff: 'SET 04 · CAL 02 · END OF BROADCAST',
} as const;

export const SHOWS: Show[] = [
  {
    id: 'tide-county',
    title: 'Tide County',
    channel: '04',
    slot: '21:00',
    runtime: '58 min',
    episode: 'S3 · E7 “The Long Water”',
    code: '307 · 58 MIN',
    genres: ['Drama', 'Thriller'],
    seasons: 3,
    years: '2021–',
    signal: 4,
    thesis: 'The most patient thriller of the decade, and the only one that lets a shoreline do the exposition.',
    blurb:
      'Three seasons in, Tide County still refuses the reveal. Ada Rourke holds on water for as long as a network will allow, and the cruelty of it is that the waiting is the subject: the county knows what happened in the harbour and has agreed, collectively, to keep fishing. This season has stopped pretending it is about a disappearance at all.',
    art: 'images/tide-county.jpg',
    alt: 'Key art: a half-submerged village at dusk, rooftops breaking the surface of a grey estuary.',
    credit: 'Key art — CH 04 unit still, S3 E7',
    creators: 'Created by Ada Rourke. Written by the Rourke–Deveraux room.',
    live: true,
    premiere: null,
    premiereLabel: null,
    status: 'tonight',
  },
  {
    id: 'a-slow-weather',
    title: 'A Slow Weather',
    channel: '11',
    slot: '20:00',
    runtime: '47 min',
    episode: 'S4 · E2 “Standing Water”',
    code: '402 · 47 MIN',
    genres: ['Drama'],
    seasons: 4,
    years: '2019–',
    signal: 3,
    thesis: 'A family drama that has quietly turned into the best documentary on television about the price of staying.',
    blurb:
      'The farm has outlasted two showrunners and one format quarrel, and it remains the only programme where a decision takes an entire episode to arrive. Season four opens with a bank letter and a dead tractor, which is to say: with the actual antagonist.',
    art: 'images/a-slow-weather.jpg',
    alt: 'Key art: two figures in oilskins at a farm gate under a low, weather-heavy sky.',
    credit: 'Key art — CH 11 unit still, S4',
    creators: 'Created by Tomasz Iles. Photographed on the Firth.',
    premiere: null,
    premiereLabel: null,
    status: 'tonight',
  },
  {
    id: 'the-quiet-room',
    title: 'The Quiet Room',
    channel: '07',
    slot: '20:15',
    runtime: '42 min',
    episode: 'S2 · E3 “Usher”',
    code: '203 · 42 MIN',
    genres: ['Anthology', 'Horror'],
    seasons: 2,
    years: '2025–',
    signal: 4,
    thesis: 'An anthology about the noise a building makes once nobody is listening to it any longer.',
    blurb:
      'Each episode is one room, one night, one person whose job is to keep it open. “Usher” is the strongest of the run: a cinema, a fire marshal, and a sound in the balcony that the mix refuses to explain. The horror is administrative, which is why it lands.',
    art: 'images/the-quiet-room.jpg',
    alt: 'Key art: an empty auditorium under a single worklight, dust moving through the beam.',
    credit: 'Key art — CH 07 publicity still, S2 E3',
    creators: 'Created by Nneka Boyle. Sound design credited on the title card.',
    premiere: null,
    premiereLabel: null,
    status: 'tonight',
  },
  {
    id: 'field-recordings',
    title: 'Field Recordings',
    channel: '05',
    slot: '21:30',
    runtime: '29 min',
    episode: 'S2 · E4 “Windshield”',
    code: '204 · 29 MIN',
    genres: ['Comedy'],
    seasons: 2,
    years: '2024–',
    signal: 3,
    thesis: 'The funniest show about work ever filmed in an actual workplace, because it has seen the invoices.',
    blurb:
      'A crew of four makes nature soundtracks in car parks and reservoirs. The comedy comes from competence under budget, not from incompetence for a laugh, and the half hour is exactly as long as it needs to be — a virtue the schedule has all but forgotten.',
    art: 'images/field-recordings.jpg',
    alt: 'Key art: a boom operator in a rain-lit car park at dusk, microphone angled at the sky.',
    credit: 'Key art — CH 05 unit still, S2',
    creators: 'Created by Bridget Fenn. Improvised dialogue, single-camera.',
    premiere: null,
    premiereLabel: null,
    status: 'tonight',
  },
  {
    id: 'longshore',
    title: 'Longshore',
    channel: '09',
    slot: '22:00',
    runtime: '51 min',
    episode: 'S1 · E9 “Slack Water”',
    code: '109 · 51 MIN',
    genres: ['Crime', 'Thriller'],
    seasons: 1,
    years: '2026',
    signal: 3,
    thesis: 'A procedural that keeps the procedure and throws away the certainty.',
    blurb:
      'Container-port crime, told in the vocabulary of manifests, tide tables and shift rosters. Writer Sam Oyelaran gives the detectives the same problem we have: too much paperwork and no motive that fits. Episode nine is the season’s best, and the ending is not an ending.',
    art: 'images/longshore.jpg',
    alt: 'Key art: a torch beam sweeping a stack of shipping containers at night, rain in the light.',
    credit: 'Key art — CH 09 unit still, S1 E9',
    creators: 'Created by Sam Oyelaran. Consulted by a former ports investigator.',
    premiere: null,
    premiereLabel: null,
    status: 'tonight',
  },
  {
    id: 'ninth-ward',
    title: 'Ninth Ward',
    channel: '06',
    slot: '22:30',
    runtime: '56 min',
    episode: 'S1 · E3 “Listening”',
    code: '103 · 56 MIN',
    genres: ['Documentary'],
    seasons: 1,
    years: '2026',
    signal: 4,
    thesis: 'Four hours of interviews that do more for the discipline of listening than any drama this year.',
    blurb:
      'No archive, no score, no fly-on-wall movement: chairs, kitchens and people who have already decided to tell the truth. The cut trusts a pause for eleven seconds, which on a Monday at 22:30 is either bravery or a scheduling accident. Take the bravery.',
    art: 'images/ninth-ward.jpg',
    alt: 'Key art: a front porch at night, two empty chairs, a ceiling fan stopped mid-turn.',
    credit: 'Key art — CH 06 still, S1 E3',
    creators: 'Directed by Alma Reyes-Kantor. Edited over fourteen months.',
    premiere: null,
    premiereLabel: null,
    status: 'tonight',
  },
  {
    id: 'the-glass-orchard',
    title: 'The Glass Orchard',
    channel: '13',
    slot: '23:00',
    runtime: '38 min',
    episode: 'S1 · E6 “Pollination”',
    code: '106 · 38 MIN',
    genres: ['Horror', 'Thriller'],
    seasons: 1,
    years: '2025–',
    signal: 3,
    thesis: 'Late-night horror with an economist’s eye for cost — the monster always sends a bill.',
    blurb:
      'A glasshouse co-operative, a crop that should not be fruiting, and a ledger nobody can balance. The show is funnier than its trailer admits and sadder than its fans allow. Watch the last eight minutes twice: the first time for what happens, the second for who agrees to it.',
    art: 'images/the-glass-orchard.jpg',
    alt: 'Key art: a greenhouse at midnight, fruit hanging from black glass under condensation.',
    credit: 'Key art — CH 13 unit still, S1 E6',
    creators: 'Created by Iva Sandoval. Shot in a working nursery.',
    premiere: null,
    premiereLabel: null,
    status: 'tonight',
  },
  {
    id: 'vespertine',
    title: 'Vespertine',
    channel: '02',
    slot: null,
    runtime: '54 min',
    episode: 'S3 · E1 “Nocturne for a Listening Post”',
    code: '301 · 54 MIN',
    genres: ['Sci-Fi', 'Thriller', 'Drama'],
    seasons: 2,
    years: '2022–',
    signal: 4,
    thesis: 'Hard science fiction that trusts its audience with a whiteboard and a grief, in that order.',
    blurb:
      'The listening-array drama returns after a twenty-month gap with its central conceit intact and its arithmetic checked. Season three is about a signal that arrives on schedule, which is the frightening part. Bring the patience you used to need for the finale of other shows.',
    art: 'images/vespertine.jpg',
    alt: 'Key art: a radio telescope array in a snowfield under a low green aurora.',
    credit: 'Key art — CH 02 publicity still, S3',
    creators: 'Created by Dr. Sena Achebe, with physics by the Cambridge group.',
    premiere: '2026-03-21T21:00:00',
    premiereLabel: 'Sat 21 Mar · CH 02 · 21:00',
    status: 'returning',
  },
  {
    id: 'the-understory',
    title: 'The Understory',
    channel: '12',
    slot: null,
    runtime: '44 min',
    episode: 'S2 · E1 “Rhizome”',
    code: '201 · 44 MIN',
    genres: ['Sci-Fi', 'Anthology', 'Drama'],
    seasons: 1,
    years: '2024–',
    signal: 3,
    thesis: 'An anthology of slow collapses, each one told from inside the roots rather than from the canopy.',
    blurb:
      'Six episodes, six systems: a watershed, a rail network, a library, a marriage, a soil sample and a pension fund. The first season’s library hour is still the best half hour the channel has broadcast. The new run is drier, and better.',
    art: 'images/the-understory.jpg',
    alt: 'Key art: a forest floor at dawn, mycelium lit through the leaf litter like wiring.',
    credit: 'Key art — CH 12 unit still, S2',
    creators: 'Created by Kofi Lindqvist. Six directors, one palette.',
    premiere: '2026-04-06T21:00:00',
    premiereLabel: 'Mon 6 Apr · CH 12 · 21:00',
    status: 'returning',
  },
  {
    id: 'marlow-and-finch',
    title: 'Marlow & Finch',
    channel: '08',
    slot: null,
    runtime: '60 min',
    episode: 'S6 · E1 “Terms”',
    code: '601 · 60 MIN',
    genres: ['Mystery', 'Drama', 'Thriller'],
    seasons: 5,
    years: '2015–',
    signal: 4,
    thesis: 'Twenty years of two people being civil about a murder, and still the best dialogue on the dial.',
    blurb:
      'The longest-running case on television reopens because a filing error makes it legally possible, which is the most Marlow & Finch explanation the writers could have chosen. Season six begins with an argument about a kettle; by the twentieth minute you will understand the entire previous five.',
    art: 'images/marlow-and-finch.jpg',
    alt: 'Key art: two overcoats beneath a station clock, photographed from below in cold light.',
    credit: 'Key art — CH 08 archive, S6',
    creators: 'Created by Pauline Osei-Garth.',
    premiere: '2026-04-20T21:00:00',
    premiereLabel: 'Mon 20 Apr · CH 08 · 21:00',
    status: 'returning',
  },
];

export const SHOW_BY_ID: Record<string, Show> = SHOWS.reduce(
  (acc, show) => ({ ...acc, [show.id]: show }),
  {} as Record<string, Show>
);

/** Tonight, ordered by slot. */
export const TONIGHT: Show[] = SHOWS.filter((show) => show.status === 'tonight').sort((a, b) =>
  (a.slot ?? '').localeCompare(b.slot ?? '')
);

/** The three countdown wells, soonest first. */
export interface Countdown {
  show: Show;
  days: number;
  date: string;
}

export const RETURNING: Countdown[] = SHOWS.filter((show) => show.status === 'returning')
  .map((show) => {
    const from = new Date(ISSUE.dateISO).getTime();
    const to = new Date(show.premiere as string).getTime();
    return {
      show,
      days: Math.max(0, Math.round((to - from) / 86_400_000)),
      date: show.premiereLabel ?? '',
    };
  })
  .sort((a, b) => a.days - b.days);

export interface JournalPiece {
  id: string;
  kind: 'Lead criticism' | 'Essay' | 'Notebook';
  title: string;
  dek: string;
  body: string[];
  author: string;
  readTime: string;
  pull?: string;
  about: string;
}

export const JOURNAL: JournalPiece[] = [
  {
    id: 'tide-county-patience',
    kind: 'Lead criticism',
    title: 'Tide County knows exactly what it is doing',
    dek: 'Everyone calls it slow. That is a description of the viewer, not the show.',
    body: [
      'There is a moment in “The Long Water” where a woman is asked a question and the camera stays on the man who did not ask it. Eleven seconds. Nothing is revealed and everything moves. It is the kind of direction that gets described as patience by the people who like it and as self-indulgence by the people who left, and both groups are describing their own attention span.',
      'What the show has, and what almost nothing else on the dial has, is a theory of a community. The tide in Tide County is not atmosphere; it is a schedule. People act when the water allows it, which is why the plotting feels inevitable rather than unhurried — the episodes are tide tables with feelings.',
      'By season three the disappearance plot is a courtesy. The real series is about a council, a family and a harbour that has already decided. Watch it on the channel if you can; the mixing alone is worth the slot.',
    ],
    author: 'Ines Barlowe',
    readTime: '8 min',
    pull: 'The long take is not a tic here. It is a moral position.',
    about: 'tide-county',
  },
  {
    id: 'cancelled-seasons',
    kind: 'Essay',
    title: 'In praise of the cancelled season',
    dek: 'The best argument for watching now is that nobody promised us an ending.',
    body: [
      'We have made a habit of waiting — for the box set, for the complete run, for the safety of a finished thing. Vespertine’s twenty-month gap is a good week by comparison with the disappears, and it returns with its arithmetic checked and its grief intact.',
      'The case for the weekly episode is not nostalgia, it is attention: a show you watch once a month has to earn you again every time, and the ones that survive that test tend to be structured rather than merely long.',
    ],
    author: 'Theo Dunlap',
    readTime: '6 min',
    about: 'vespertine',
  },
  {
    id: 'last-brave-slot',
    kind: 'Notebook',
    title: '22:30, the last brave slot',
    dek: 'Half an hour after the prime audience leaves, and the channels take more risks.',
    body: [
      'Ninth Ward has no score, no archive and a pause it refuses to cut. It airs at 22:30 on a Monday, which is the hour the networks use for things they do not expect to be watched twice and are therefore willing to let be difficult.',
      'The slots after 22:00 are where the format arguments are still being had. If you only ever watch what is recommended to you, this is the part of the dial you have never seen.',
    ],
    author: 'Nadia Kaur',
    readTime: '4 min',
    about: 'ninth-ward',
  },
];

/** The cover story is the night’s flagship, not a hero image with a button. */
export const COVER_ID = 'tide-county';

export const COVER = {
  show: SHOW_BY_ID[COVER_ID],
  eyebrow: 'Cover story · Tonight, 21:00',
  kicker: 'Season three, episode seven',
  critics: [
    { name: 'Barlowe', signal: 4, note: 'The year’s best hour, and it isn’t close.' },
    { name: 'Dunlap', signal: 4, note: 'Patient, exact, faintly merciless.' },
    { name: 'Kaur', signal: 3, note: 'Worth the wait it asks of you.' },
  ] as Critic[],
};

/** Ticker (§7.7). One accent tag, mono, decorative — the real list is the schedule. */
export const TICKER: string[] = [
  'Tide County — S3 E7 tonight CH 04 · 21:00',
  'Vespertine returns Sat 21 Mar CH 02',
  'Index updated Monday 06:00',
  'A Slow Weather — season four CH 11 · 20:00',
  'The Quiet Room S2 E3 “Usher” CH 07 · 20:15',
  'Marlow & Finch — S6 from 20 Apr CH 08',
  'Test transmission ends 05:58',
];

/** Section frequency marks (§7.6) — pure flavour, low contrast. */
export const FREQUENCIES = {
  cover: 'CH 04 · 21:00 · 50.000 MHz',
  tonight: '625 LINE · PAL I · MON 09 MAR',
  journal: 'PRESS 02 · RUN 47 · INK 100%',
  index: 'CH 02–13 · 50.000–214.000 MHz',
} as const;
