import { useEffect, useRef } from 'react';
import { CATALOG_BY_ID } from '../../lib/drinks';
import { CHARACTER_BY_ID } from '../../lib/characters';
import { Challenge, challengeById, CHALLENGES } from '../../lib/challenges';
import { AppState, Entry, findDrink, goalMet, shiftDay, useStore } from '../../lib/store';
import { useNav } from '../../navigation/nav';

export type ChallengeStatus = 'active' | 'failed' | 'done';

export interface ChallengeProgress {
  challenge: Challenge;
  startDay: string;
  /** 1-based day of the challenge today is (capped at `days`). */
  dayNumber: number;
  /** Days that counted so far. */
  counted: number;
  daysLeft: number;
  status: ChallengeStatus;
  /** True when a drink logged today already broke the rules. */
  brokenToday: boolean;
}

/** Whether logging this drink goes against the challenge's rules. */
export function breaksRules(c: Challenge, drinkId: string): boolean {
  if (c.avoid?.includes(drinkId)) return true;
  if (c.only && !c.only.includes(drinkId)) return true;
  return false;
}

function dayBroken(c: Challenge, entries: Entry[] | undefined): boolean {
  return (entries ?? []).some((e) => breaksRules(c, e.drinkId));
}

/** A day counts when the goal was met, nothing broke the rules and any required drink was logged. */
export function dayCounts(s: AppState, c: Challenge, day: string): boolean {
  const entries = s.history[day];
  if (!goalMet(s, day) || dayBroken(c, entries)) return false;
  if (c.requires && !(entries ?? []).some((e) => c.requires!.includes(e.drinkId))) return false;
  return true;
}

function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

/** Progress of the active challenge, or undefined when none is running. */
export function activeProgress(s: AppState): ChallengeProgress | undefined {
  const c = challengeById(s.challenge.activeId);
  const start = s.challenge.startDay;
  if (!c || !start) return undefined;
  const elapsed = daysBetween(start, s.day);
  const dayNumber = Math.min(c.days, Math.max(1, elapsed + 1));
  let counted = 0;
  let failed = false;
  for (let i = 0; i < c.days; i++) {
    const day = shiftDay(start, i);
    const past = i < elapsed;
    const isToday = i === elapsed;
    if (!past && !isToday) break;
    if (dayCounts(s, c, day)) counted++;
    else if (past) failed = true;
  }
  const status: ChallengeStatus = failed ? 'failed' : counted >= c.days ? 'done' : 'active';
  return {
    challenge: c,
    startDay: start,
    dayNumber,
    counted,
    daysLeft: Math.max(0, c.days - counted),
    status,
    brokenToday: elapsed >= 0 && elapsed < c.days && dayBroken(c, s.history[s.day]),
  };
}

/** The limited-time challenge's rolling window: the 15th of this month till the end of next month. */
export function limitedWindow(today = new Date()): { from: Date; until: Date; label: string } {
  const from = new Date(today.getFullYear(), today.getMonth(), 15);
  const until = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const f = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { from, until, label: `Available only from ${f(from)} till ${f(until)}` };
}

export const LIMITED = CHALLENGES.find((x) => x.limited);
export const ALL_YEAR = CHALLENGES.filter((x) => !x.limited);

/** The drink's display name, for the warning toast. */
function drinkName(s: AppState, id: string): string {
  const d = CATALOG_BY_ID[id] ?? findDrink(s, id);
  const label = d.label.toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Message to show when this drink would break the active challenge, or undefined. */
export function challengeWarning(s: AppState, drinkId: string): string | undefined {
  const c = challengeById(s.challenge.activeId);
  if (!c || !breaksRules(c, drinkId)) return undefined;
  return `${drinkName(s, drinkId)} breaks the ${c.title} rules today`;
}

/** Shows a toast if logging this drink breaks the active challenge. */
export function useWarnIfBreaksChallenge() {
  const { state } = useStore();
  const nav = useNav();
  return (drinkId: string) => {
    const msg = challengeWarning(state, drinkId);
    if (msg) nav.toast(msg);
    return !!msg;
  };
}

/**
 * Mount once on Home. Finishes the active challenge when its last day counts (frog unlocked,
 * reveal opened), ends it when a day was missed, and warns when a rule-breaking drink is logged.
 */
export function useChallengeWatcher() {
  const { state, update, today } = useStore();
  const nav = useNav();
  const progress = activeProgress(state);
  const status = progress?.status;
  const id = progress?.challenge.id;

  useEffect(() => {
    if (!progress || status === 'active') return;
    const c = progress.challenge;
    if (status === 'done') {
      update((s) => ({
        challenge: {
          ...s.challenge,
          activeId: undefined,
          startDay: undefined,
          completed: s.challenge.completed.includes(c.id) ? s.challenge.completed : [...s.challenge.completed, c.id],
        },
        character: {
          ...s.character,
          collected: s.character.collected.includes(c.characterId) ? s.character.collected : [...s.character.collected, c.characterId],
        },
      }));
      if (CHARACTER_BY_ID[c.characterId]) nav.push('characterReveal', { id: c.characterId });
    } else {
      update((s) => ({ challenge: { ...s.challenge, activeId: undefined, startDay: undefined } }));
      nav.toast('Challenge missed a day — try again anytime');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, id]);

  // warn about rule-breaking drinks as they are logged
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    const ids = new Set(today.map((e) => e.id));
    if (seen.current && id) {
      const fresh = today.filter((e) => !seen.current!.has(e.id));
      const bad = fresh.find((e) => challengeWarning(state, e.drinkId));
      if (bad) nav.toast(challengeWarning(state, bad.drinkId)!);
    }
    seen.current = ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);
}
