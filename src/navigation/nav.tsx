import { ComponentType, createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideInRight, SlideOutDown, SlideOutRight, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';

/**
 * A tiny stack navigator. Home is always mounted underneath; other screens slide in from
 * the right (push), rise from the bottom (modal) or cross-fade (fade) on top of it.
 */
export type NavMode = 'push' | 'modal' | 'fade';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ScreenProps<P = any> {
  params: P;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ScreenComponent = ComponentType<ScreenProps<any>>;

interface Route {
  key: string;
  name: string;
  params?: unknown;
  mode: NavMode;
}

export interface Nav {
  push: (name: string, params?: unknown) => void;
  modal: (name: string, params?: unknown) => void;
  fade: (name: string, params?: unknown) => void;
  /** Swaps the top screen for another without the back step. */
  replace: (name: string, params?: unknown, mode?: NavMode) => void;
  back: () => void;
  /** Closes every screen and returns to Home. */
  home: () => void;
  /** Short message that pops up at the top of the screen. */
  toast: (text: string) => void;
  depth: number;
}

const NavContext = createContext<Nav | null>(null);

let keySeq = 0;

// Screens that draw their own dimmed backdrop over Home instead of a white page.
const TRANSPARENT = new Set(['backup']);

export function NavProvider({
  screens,
  children,
  initial,
}: {
  screens: Record<string, ScreenComponent>;
  children: ReactNode;
  /** Screens to open on launch (web previews: `?step=settings`). */
  initial?: { name: string; params?: unknown; mode?: NavMode }[];
}) {
  const [routes, setRoutes] = useState<Route[]>(() =>
    (initial ?? []).filter((r) => screens[r.name]).map((r) => ({ key: `r${keySeq++}`, name: r.name, params: r.params, mode: r.mode ?? 'push' })),
  );
  const [toastMsg, setToastMsg] = useState<{ text: string; id: number } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const open = useCallback(
    (mode: NavMode) => (name: string, params?: unknown) => {
      if (!screens[name]) {
        console.warn(`[nav] unknown screen ${name}`);
        return;
      }
      setRoutes((r) => [...r, { key: `r${keySeq++}`, name, params, mode }]);
    },
    [screens],
  );

  const back = useCallback(() => setRoutes((r) => r.slice(0, -1)), []);
  const home = useCallback(() => setRoutes([]), []);
  const replace = useCallback<Nav['replace']>(
    (name, params, mode) =>
      setRoutes((r) => [...r.slice(0, -1), { key: `r${keySeq++}`, name, params, mode: mode ?? r[r.length - 1]?.mode ?? 'push' }]),
    [],
  );
  const toast = useCallback((text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg({ text, id: Date.now() });
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (routes.length === 0) return false;
      back();
      return true;
    });
    return () => sub.remove();
  }, [routes.length, back]);

  const nav = useMemo<Nav>(
    () => ({ push: open('push'), modal: open('modal'), fade: open('fade'), replace, back, home, toast, depth: routes.length }),
    [open, replace, back, home, toast, routes.length],
  );

  return (
    <NavContext.Provider value={nav}>
      <View style={styles.root}>
        {children}
        {routes.map((r) => {
          const Screen = screens[r.name];
          const entering = TRANSPARENT.has(r.name)
            ? FadeIn.duration(200)
            : r.mode === 'push' ? SlideInRight.springify().damping(22).stiffness(190) : r.mode === 'modal' ? SlideInDown.springify().damping(22).stiffness(170) : FadeIn.duration(260);
          const exiting = TRANSPARENT.has(r.name) ? FadeOut.duration(200) : r.mode === 'push' ? SlideOutRight.duration(240) : r.mode === 'modal' ? SlideOutDown.duration(260) : FadeOut.duration(200);
          return (
            <Animated.View key={r.key} entering={entering} exiting={exiting} style={[StyleSheet.absoluteFill, !TRANSPARENT.has(r.name) && styles.screen]}>
              <Screen params={r.params ?? {}} />
            </Animated.View>
          );
        })}
        {toastMsg && (
          <Animated.View
            key={toastMsg.id}
            entering={ZoomIn.springify().damping(14)}
            exiting={FadeOut.duration(200)}
            pointerEvents="none"
            style={[styles.toast, { top: insets.top + 54 }]}
          >
            <Text style={styles.toastText}>{toastMsg.text}</Text>
          </Animated.View>
        )}
      </View>
    </NavContext.Provider>
  );
}

export function useNav(): Nav {
  const n = useContext(NavContext);
  if (!n) throw new Error('useNav must be used inside NavProvider');
  return n;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { backgroundColor: colors.bg },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: '86%',
    backgroundColor: colors.ink,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 11,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  toastText: { fontFamily: fonts.bold, color: '#fff', fontSize: 14, textAlign: 'center' },
});
