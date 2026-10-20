import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CATALOG, CATALOG_BY_ID, DEFAULT_ENABLED, Drink } from './drinks';
import { DEFAULT_GOAL_ML, Profile, todayKey, Units } from './hydration';

/** One logged drink. */
export interface Entry {
  id: string;
  drinkId: string;
  /** Volume poured. */
  ml: number;
  /** What it counted toward hydration (volume x the drink's hydration ratio). */
  hydrationMl: number;
  caffeineMg: number;
  at: number;
}

export interface ReminderSettings {
  mode: 'daily' | 'smart';
  /** Minutes after midnight for the once-a-day reminder. */
  dailyAt: number;
  /** Smart reminders: remind when nothing was logged for this many minutes. */
  intervalMin: number;
  fromMin: number;
  untilMin: number;
  sound: string;
}

export interface AppState {
  onboarded: boolean;
  units: Units;
  goalMl: number;
  /** True once the goal was typed in instead of calculated. */
  customGoal: boolean;
  profile: Profile;
  remindersOn: boolean;
  reminders: ReminderSettings;
  cupMl: number;
  weekStart?: 'sunday' | 'monday';
  /** Today's date key; history[day] is today's log. */
  day: string;
  history: Record<string, Entry[]>;
  /** The goal that applied on each day, so changing it later keeps old days honest. */
  goals: Record<string, number>;
  drinks: {
    /** Order of the Add/Edit Drinks list (catalog + custom ids). */
    order: string[];
    /** Drinks shown in the home row, in list order. */
    enabled: string[];
    /** Per-drink cup sizes the person changed. */
    sizes: Record<string, number>;
    custom: Drink[];
  };
  character: {
    current: string;
    collected: string[];
    shuffleOn: boolean;
    /** Characters picked for shuffling. */
    shuffle: string[];
    /** Unspent "collect" tokens, one per finished goal day. */
    tokens: number;
    /** Day a token was last earned, so a day only earns one. */
    tokenDay?: string;
  };
  challenge: {
    activeId?: string;
    startDay?: string;
    completed: string[];
    /** Hides the limited-time banner from the home screen. */
    hideLimited: boolean;
  };
  settings: {
    sounds: boolean;
    language: string;
    appIcon: string;
    healthSync: boolean;
    watchDesign: 'frog' | 'list';
    syncDevices: boolean;
    lastSyncAt?: number;
    lastBackupAt?: number;
  };
  premium?: { plan: 'monthly' | 'lifetime'; since: number };
  supporter?: { amount: number; monthly: boolean; since: number };
  /** Home-screen cards the person hid (tips, supporter card...). */
  hiddenCards: string[];
}

const initialState: AppState = {
  onboarded: false,
  units: 'ml',
  goalMl: DEFAULT_GOAL_ML,
  customGoal: false,
  profile: { weightUnit: 'kg' },
  remindersOn: false,
  reminders: { mode: 'smart', dailyAt: 13 * 60, intervalMin: 120, fromMin: 8 * 60, untilMin: 22 * 60, sound: 'Bamboo' },
  cupMl: 250,
  day: todayKey(),
  history: {},
  goals: {},
  drinks: { order: CATALOG.map((x) => x.id), enabled: DEFAULT_ENABLED, sizes: {}, custom: [] },
  character: { current: 'lily', collected: ['lily'], shuffleOn: false, shuffle: [], tokens: 0 },
  challenge: { completed: [], hideLimited: false },
  settings: { sounds: true, language: 'en', appIcon: 'classic', healthSync: false, watchDesign: 'frog', syncDevices: false },
  hiddenCards: [],
};

const STORAGE_KEY = 'lily.state.v1';

export interface AddOptions {
  /** Log into a past day ("add missed drink"). */
  day?: string;
  at?: number;
}

interface Store {
  state: AppState;
  ready: boolean;
  update: (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void;
  /** Logs a drink and returns the entry. */
  addDrink: (drinkId: string, ml: number, opts?: AddOptions) => Entry;
  /** Logs plain water (the onboarding first sip). */
  addSip: (ml: number) => void;
  deleteEntry: (day: string, id: string) => void;
  /** Today's hydration in ml. */
  intakeMl: number;
  /** Today's log. */
  today: Entry[];
  streak: number;
  drink: (id: string) => Drink;
  reset: () => void;
}

const StoreContext = createContext<Store | null>(null);

let seq = 0;
const newId = () => `${Date.now().toString(36)}${(seq++).toString(36)}`;

export function dayTotal(entries: Entry[] | undefined): number {
  return Math.max(0, (entries ?? []).reduce((a, b) => a + b.hydrationMl, 0));
}

export function goalFor(s: AppState, day: string): number {
  return s.goals[day] ?? s.goalMl;
}

export function goalMet(s: AppState, day: string): boolean {
  return dayTotal(s.history[day]) >= goalFor(s, day);
}

export function shiftDay(day: string, by: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return todayKey(new Date(y, m - 1, d + by));
}

/** Today counts as day one; every finished day straight before it adds one. */
export function computeStreak(s: AppState): number {
  let n = 1;
  let d = shiftDay(s.day, -1);
  while (goalMet(s, d)) {
    n++;
    d = shiftDay(d, -1);
  }
  return n;
}

export function findDrink(s: AppState, id: string): Drink {
  const custom = s.drinks.custom.find((x) => x.id === id);
  const base = custom ?? CATALOG_BY_ID[id] ?? CATALOG_BY_ID.water;
  const size = s.drinks.sizes[id];
  return size ? { ...base, size } : base;
}

/** Moves the log to a new day when the app opens on a later date, and picks a shuffled frog. */
function rollDay(s: AppState): AppState {
  const today = todayKey();
  if (s.day === today) return s;
  let current = s.character.current;
  if (s.character.shuffleOn && s.character.shuffle.length > 0) {
    current = s.character.shuffle[Math.floor(Math.random() * s.character.shuffle.length)];
  }
  return { ...s, day: today, goals: { ...s.goals, [today]: s.goalMl }, character: { ...s.character, current } };
}

/** Brings state saved by an older build up to date. */
function migrate(saved: Partial<AppState> & { sips?: { ml: number; at: number }[] }): AppState {
  const s: AppState = {
    ...initialState,
    ...saved,
    reminders: { ...initialState.reminders, ...saved.reminders },
    drinks: { ...initialState.drinks, ...saved.drinks },
    character: { ...initialState.character, ...saved.character },
    challenge: { ...initialState.challenge, ...saved.challenge },
    settings: { ...initialState.settings, ...saved.settings },
    history: saved.history ?? {},
    goals: saved.goals ?? {},
  };
  // new catalog drinks join the end of the list
  const known = new Set(s.drinks.order);
  s.drinks.order = [...s.drinks.order, ...CATALOG.filter((x) => !known.has(x.id)).map((x) => x.id)];
  if (saved.sips?.length && saved.day && !s.history[saved.day]) {
    s.history = {
      ...s.history,
      [saved.day]: saved.sips.map((x) => ({ id: newId(), drinkId: 'water', ml: x.ml, hydrationMl: x.ml, caffeineMg: 0, at: x.at })),
    };
  }
  delete (s as { sips?: unknown }).sips;
  return s;
}

/** Applies goal-day rewards: a collect token for a frog the first time a day hits its goal. */
function settle(s: AppState, day: string): AppState {
  if (day !== s.day || !goalMet(s, day) || s.character.tokenDay === day) return s;
  return { ...s, character: { ...s.character, tokens: s.character.tokens + 1, tokenDay: day } };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState(rollDay(migrate(JSON.parse(raw))));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  // a new day can start while the app stays open
  useEffect(() => {
    const id = setInterval(() => setState((s) => rollDay(s)), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const update = useCallback<Store['update']>((patch) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  }, []);

  const latest = useRef(state);
  latest.current = state;

  const addDrink = useCallback<Store['addDrink']>((drinkId, ml, opts) => {
    const drink = findDrink(latest.current, drinkId);
    const entry: Entry = {
      id: newId(),
      drinkId,
      ml: Math.round(ml),
      hydrationMl: Math.round(ml * drink.hydration),
      caffeineMg: Math.round((ml / 250) * drink.caffeine),
      at: opts?.at ?? Date.now(),
    };
    setState((prev) => {
      const s = rollDay(prev);
      const day = opts?.day ?? s.day;
      const list = [...(s.history[day] ?? []), entry].sort((a, b) => a.at - b.at);
      return settle(
        { ...s, history: { ...s.history, [day]: list }, goals: s.goals[day] ? s.goals : { ...s.goals, [day]: s.goalMl } },
        day,
      );
    });
    return entry;
  }, []);

  const addSip = useCallback((ml: number) => {
    addDrink('water', ml);
  }, [addDrink]);

  const deleteEntry = useCallback((day: string, id: string) => {
    setState((s) => ({ ...s, history: { ...s.history, [day]: (s.history[day] ?? []).filter((e) => e.id !== id) } }));
  }, []);

  const reset = useCallback(() => setState({ ...initialState, day: todayKey() }), []);

  const today = useMemo(() => state.history[state.day] ?? [], [state.history, state.day]);
  const intakeMl = useMemo(() => dayTotal(today), [today]);
  const streak = useMemo(() => computeStreak(state), [state]);
  const drink = useCallback((id: string) => findDrink(state, id), [state]);

  const value = useMemo(
    () => ({ state, ready, update, addDrink, addSip, deleteEntry, intakeMl, today, streak, drink, reset }),
    [state, ready, update, addDrink, addSip, deleteEntry, intakeMl, today, streak, drink, reset],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
