import { CATALOG_BY_ID } from '../../lib/drinks';
import { Entry } from '../../lib/store';
import { colors } from '../../theme';

const ADJECTIVES = ['fresh', 'fancy', 'chill', 'cool', 'splashy', 'juicy', 'zesty', 'bubbly', 'breezy', 'sunny', 'dewy', 'sparkly'];

function hash(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** The adjective of a day, the same every time for the same date. */
export function dayAdjective(day: string): string {
  return ADJECTIVES[hash(day) % ADJECTIVES.length];
}

export function weekdayOf(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long' });
}

/** "Fresh Thursday!" — the headline of a day that met its goal. */
export function goalDayTitle(day: string): string {
  const adj = dayAdjective(day);
  return `${adj[0].toUpperCase()}${adj.slice(1)} ${weekdayOf(day)}!`;
}

/** Colour of the drink poured most that day (by volume), skipping plain-water teal so the title stays two-tone. */
export function topDrinkColor(entries: Entry[], color: (id: string) => string = (id) => CATALOG_BY_ID[id]?.color ?? colors.water): string {
  const pick = drinksUsed(entries)
    .map(color)
    .find((c) => c.toLowerCase() !== colors.water.toLowerCase());
  return pick ?? colors.lilyDeep;
}

/** Ids of the drinks logged that day, most poured first. */
export function drinksUsed(entries: Entry[]): string[] {
  const by: Record<string, number> = {};
  for (const e of entries) by[e.drinkId] = (by[e.drinkId] ?? 0) + e.ml;
  return Object.entries(by)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}
