import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_GOAL_ML, Profile, todayKey, Units } from './hydration';

export interface Sip {
  ml: number;
  at: number;
}

export interface AppState {
  onboarded: boolean;
  units: Units;
  goalMl: number;
  profile: Profile;
  remindersOn: boolean;
  cupMl: number;
  weekStart?: 'sunday' | 'monday';
  day: string;
  sips: Sip[];
  streak: number;
  lastGoalDay?: string;
}

const initialState: AppState = {
  onboarded: false,
  units: 'ml',
  goalMl: DEFAULT_GOAL_ML,
  profile: { weightUnit: 'kg' },
  remindersOn: false,
  cupMl: 250,
  day: todayKey(),
  sips: [],
  streak: 1,
};

const STORAGE_KEY = 'lily.state.v1';

interface Store {
  state: AppState;
  ready: boolean;
  update: (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void;
  addSip: (ml: number) => void;
  intakeMl: number;
  reset: () => void;
}

const StoreContext = createContext<Store | null>(null);

/** Starts a fresh day's log when the stored one is from an earlier date. */
function rollDay(s: AppState): AppState {
  const today = todayKey();
  if (s.day === today) return s;
  const yesterday = todayKey(new Date(Date.now() - 86400000));
  return { ...s, day: today, sips: [], streak: s.lastGoalDay === yesterday ? s.streak + 1 : 1 };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState(rollDay({ ...initialState, ...JSON.parse(raw) }));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const update = useCallback<Store['update']>((patch) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  }, []);

  const addSip = useCallback((ml: number) => {
    setState((prev) => {
      const s = rollDay(prev);
      const sips = [...s.sips, { ml, at: Date.now() }];
      const total = sips.reduce((a, b) => a + b.ml, 0);
      return { ...s, sips, lastGoalDay: total >= s.goalMl ? s.day : s.lastGoalDay };
    });
  }, []);

  const reset = useCallback(() => setState({ ...initialState, day: todayKey() }), []);

  const intakeMl = useMemo(() => state.sips.reduce((a, b) => a + b.ml, 0), [state.sips]);

  const value = useMemo(
    () => ({ state, ready, update, addSip, intakeMl, reset }),
    [state, ready, update, addSip, intakeMl, reset],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
