import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import App from '../App';

/* --------------------------------------------------------------------------
   A stand-in archive. The point of these fixtures is to exercise the real
   request path in services/tmdbService.ts — buffering, filtering and all —
   without a network. Shapes match the TMDb v3 responses the app consumes.
   -------------------------------------------------------------------------- */

const RECENT = new Date(Date.now() - 45 * 86400 * 1000).toISOString().slice(0, 10);

const NIGHT_FERRY = {
  id: 99,
  name: 'Night Ferry',
  overview: 'A boat that only runs at night, and a crew that prefers it that way.',
  poster_path: '/p99.jpg',
  backdrop_path: '/b99.jpg',
  vote_average: 7.9,
  vote_count: 40,
  first_air_date: '2019-01-01',
  genre_ids: [18],
  popularity: 3,
  original_language: 'sv',
};

const SHOWS = [
  {
    id: 11,
    name: 'The Translator',
    overview:
      'A quiet procedural about a translator who cannot stop listening. Four perfect episodes, and a fifth that knows it. She hears everything, including what nobody said.',
    poster_path: '/p11.jpg',
    backdrop_path: '/b11.jpg',
    vote_average: 8.4,
    vote_count: 812,
    first_air_date: '2026-02-14',
    genre_ids: [80, 18],
    popularity: 42.1,
    original_language: 'de',
  },
  {
    id: 12,
    name: 'Salt Harbour',
    overview:
      'A fishing town keeps a secret the size of a church. What it lacks in plot, it returns in patience. Best watched alone, with the lights off.',
    poster_path: '/p12.jpg',
    backdrop_path: '/b12.jpg',
    vote_average: 7.6,
    vote_count: 120,
    first_air_date: '2021-05-02',
    genre_ids: [9648],
    popularity: 11.4,
    original_language: 'en',
  },
];

const CATALOG = [...SHOWS, NIGHT_FERRY];

const detailFor = (id: number) => {
  const base = CATALOG.find(s => s.id === id) ?? SHOWS[0];
  return {
    ...base,
    status: id === 11 ? 'Returning Series' : 'Ended',
    episode_run_time: [52],
    number_of_episodes: 24,
    number_of_seasons: 2,
    last_air_date: RECENT,
    external_ids: { imdb_id: `tt0000${id}` },
    created_by: [{ name: 'M. Roth' }, { name: 'A. Bell' }],
    networks: [{ name: 'ARD' }],
    aggregate_credits: {
      cast: [
        {
          id: 500 + id,
          name: 'Ilse Werner',
          order: 0,
          profile_path: null,
          roles: [{ character: 'The Translator' }],
        },
      ],
    },
    videos: { results: [{ site: 'YouTube', type: 'Trailer', key: 'abc123' }] },
    recommendations: { results: id === 99 ? [] : [NIGHT_FERRY] },
    similar: { results: [] },
  };
};

const DISCOVER = { page: 1, total_pages: 12, total_results: 240, results: SHOWS };

const urls: string[] = [];

const mockFetch = vi.fn(async (input: any) => {
  const url = typeof input === 'string' ? input : String(input?.url ?? '');
  urls.push(url);

  let payload: any = {};
  if (url.includes('/discover/tv')) payload = DISCOVER;
  else if (url.includes('/search/tv')) payload = { ...DISCOVER, results: [SHOWS[1]] };
  else if (url.includes('/configuration')) payload = { images: {} };
  else {
    const match = url.match(/\/tv\/(\d+)/);
    payload = detailFor(match ? Number(match[1]) : 11);
  }

  return { ok: true, status: 200, statusText: 'OK', json: async () => payload } as any;
});

vi.stubGlobal('fetch', mockFetch);

const enterWithKey = () => {
  localStorage.setItem('tmdb_api_key', 'test-key-0123456789');
  return render(<App />);
};

/**
 * The lead review in the hero and the first leaflet carry the same title, so
 * headings are never unique. Wait for the pair, then assert on the pair.
 */
const awaitLead = async () => {
  const headings = await screen.findAllByRole('heading', { name: 'The Translator' });
  expect(headings.length).toBeGreaterThan(0);
  return headings;
};

describe('Cabinet', () => {
  beforeEach(() => {
    urls.length = 0;
    mockFetch.mockClear();
  });

  it('greets a reader without a key as a reader\u2019s pass', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Cabinet' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Enter the reading room/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Read a sample issue/i })).toBeTruthy();
  });

  it('files the issue: a lead review and leaflet entries with honest runtimes', async () => {
    const { container } = enterWithKey();

    // The hero is set from the first result on the page.
    await awaitLead();
    expect(await screen.findByText('Television,')).toBeTruthy();

    await waitFor(() => {
      expect(container.querySelectorAll('[data-variant="leaflet"]').length).toBe(2);
    });

    // 24 episodes × 52 minutes = 20 h 48 m, printed rather than promised.
    expect(await screen.findAllByText(/20 h 48 m to finish/)).toBeTruthy();

    // Derived seals: still on the air and aired within fourteen months, and a
    // run that wrapped within the last twelve.
    expect(await screen.findAllByText('NEW SEASON')).toBeTruthy();
    expect(await screen.findAllByText('SEASON FINALE')).toBeTruthy();

    // No rating bars, no match scores, no stars anywhere in the page.
    expect(container.querySelector('[role="progressbar"]')).toBeNull();
    expect(container.textContent).not.toMatch(/% match/i);
  });

  it('raises the clock once a title is shelved, and moves it as episodes are logged', async () => {
    enterWithKey();
    await awaitLead();

    // Nothing shelved yet, so the corner stays empty — no clock, no empty state.
    expect(screen.queryByRole('complementary', { name: 'Now in rotation' })).toBeNull();

    const shelveButtons = await screen.findAllByRole('button', { name: /^Shelve$/ });
    fireEvent.click(shelveButtons[0]);

    const clock = await screen.findByRole('complementary', { name: 'Now in rotation' });
    expect(clock.textContent).toContain('The Translator');
    expect(clock.textContent).toContain('20 h 48 m');
    expect(clock.textContent).toContain('0 / 24 seen');
    // Season II, and the episode you are on is the first.
    expect(clock.textContent).toMatch(/S\. II/);
    expect(clock.textContent).toMatch(/E\. I/);

    fireEvent.click(screen.getByRole('button', { name: /Log one more episode of The Translator/ }));

    // 23 episodes left × 52 minutes = 19 h 56 m.
    await waitFor(() => {
      expect(clock.textContent).toContain('1 / 24 seen');
      expect(clock.textContent).toContain('19 h 56 m');
      expect(clock.textContent).toMatch(/E\. II/);
    });
  });

  it('cycles a genre through include, exclude and off', async () => {
    enterWithKey();
    await awaitLead();

    const crime = await screen.findByRole('button', { name: /^Crime$/ });
    expect(crime.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(crime);
    expect(await screen.findByRole('button', { name: /^\+ Crime$/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^\+ Crime$/ }).getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: /^\+ Crime$/ }));
    const excluded = await screen.findByRole('button', { name: /^− Crime$/ });
    expect(excluded.getAttribute('aria-pressed')).toBe('mixed');

    fireEvent.click(excluded);
    expect(await screen.findByRole('button', { name: /^Crime$/ })).toBeTruthy();
  });

  it('re-sets the index as notebook entries, numbered in roman', async () => {
    const { container } = enterWithKey();
    await awaitLead();

    await waitFor(() => {
      expect(container.querySelectorAll('[data-variant="leaflet"]').length).toBe(2);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Notebook' }));

    await waitFor(() => {
      expect(container.querySelectorAll('[data-variant="notebook"]').length).toBe(2);
    });

    const numerals = Array.from(container.querySelectorAll('[data-numeral]')).map(
      el => el.getAttribute('data-numeral'),
    );
    expect(numerals).toEqual(['I', 'II']);
  });

  it('applies a mood collection to the real filters', async () => {
    enterWithKey();
    await awaitLead();

    const buttons = await screen.findAllByRole('button', { name: /Set the index to this/i });
    fireEvent.click(buttons[0]);

    // "Late Night, Loud Volume" files Comedy and Talk, match any.
    expect(await screen.findByText(/Comedy \/ Talk \(any\)/)).toBeTruthy();
    expect(await screen.findByText(/from collection i/)).toBeTruthy();
    expect(await screen.findByText('Now filed')).toBeTruthy();

    // The rating figure the collection asks for is written into the field.
    const rating = screen.getByLabelText(/Rated at least/) as HTMLInputElement;
    await waitFor(() => expect(rating.value).toBe('7'));
  });

  it('sends a typed query to the search endpoint rather than discover', async () => {
    enterWithKey();
    await awaitLead();

    fireEvent.click(screen.getByRole('button', { name: 'Toggle search' }));
    const input = screen.getByLabelText('Search the archive');
    fireEvent.change(input, { target: { value: 'salt' } });

    await waitFor(
      () => {
        expect(urls.some(u => u.includes('/search/tv'))).toBe(true);
      },
      { timeout: 2000 },
    );

    expect(await screen.findByText(/Searching the archive for/)).toBeTruthy();
  });

  it('keeps the shelve state with the title on screen after a drill-down', async () => {
    enterWithKey();
    await awaitLead();

    const related = await screen.findAllByRole('button', { name: /Read the entry for Night Ferry/ });
    fireEvent.click(related[0]);

    // The entry swaps in place, so the shelved state must follow the new title
    // rather than the one the page was fetched with.
    const drilled = await waitFor(() => {
      const card = screen
        .getAllByRole('article')
        .find(el => el.querySelector('h3')?.textContent === 'Night Ferry');
      if (!card) throw new Error('drill-down did not render');
      return card;
    });

    expect(within(drilled).getByRole('button', { name: /^Shelve$/ })).toBeTruthy();
    fireEvent.click(within(drilled).getByRole('button', { name: /^Shelve$/ }));

    expect(within(drilled).getByRole('button', { name: /^Shelved$/ })).toBeTruthy();

    const rotation = screen.getByRole('region', { name: /In Rotation/ });
    expect(rotation.textContent).toContain('Night Ferry');
  });

  it('names every landmark section, and pages exactly once', async () => {
    const { container } = enterWithKey();
    await awaitLead();

    // A dangling aria-labelledby silently strips a section of its accessible
    // name, so check every reference resolves.
    const refs = Array.from(container.querySelectorAll('[aria-labelledby]'));
    expect(refs.length).toBeGreaterThan(0);
    for (const el of refs) {
      const id = el.getAttribute('aria-labelledby') as string;
      expect(container.querySelector(`#${id}`), `dangling aria-labelledby="${id}"`).toBeTruthy();
    }

    const named = refs.filter(el => el.getAttribute('aria-labelledby'));
    expect(named.length).toBeGreaterThanOrEqual(4);

    // One nameplate per page, and the lead review sits below it.
    expect(container.querySelectorAll('h1').length).toBe(1);
    expect(container.querySelector('h1')?.textContent).toBe('Cabinet');
  });

  it('prints the colophon, including how each seal is derived', async () => {
    const { container } = enterWithKey();
    await awaitLead();

    expect(await screen.findByRole('heading', { name: 'Colophon' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Editor’s Desk/ })).toBeTruthy();

    const essay = container.querySelector('.drop-cap');
    expect(essay).toBeTruthy();
    expect(container.querySelectorAll('.stamp').length).toBeGreaterThan(0);
    expect(screen.getByText(/No star ratings. No match percentages. No bars./)).toBeTruthy();
  });
});
