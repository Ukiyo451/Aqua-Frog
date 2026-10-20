import * as Haptics from 'expo-haptics';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, type HostInstance, PanResponder, Platform, ScrollView, type ScrollViewInstance, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrinkIcon } from '../../components/CupIcon';
import { Subtitle, Title } from '../../components/ui';
import { Drink } from '../../lib/drinks';
import { useStore } from '../../lib/store';
import { useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { CancelDoneBar, DragHandleIcon } from './shared';

const ROW_H = 56;
const EDGE = 80;
const SPRING = { damping: 20, stiffness: 240, mass: 0.7 };
const { width: SCREEN_W } = Dimensions.get('window');

interface DragApi {
  count: number;
  scrollY: () => number;
  slotOf: (id: string) => number;
  lift: (id: string, apply: () => void) => void;
  move: (pageY: number) => void;
  moveTo: (id: string, slot: number) => void;
  drop: () => void;
}

interface RowProps {
  drink: Drink;
  slot: number;
  active: boolean;
  api: React.MutableRefObject<DragApi>;
}

const SortRow = memo(function SortRow({ drink, slot, active, api }: RowProps) {
  const y = useSharedValue(slot * ROW_H);
  const lift = useSharedValue(0);
  const activeRef = useRef(false);

  useEffect(() => {
    if (!active) y.value = withSpring(slot * ROW_H, SPRING);
  }, [slot, active, y]);

  const pan = useMemo(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let startSlot = 0;
    let startScroll = 0;
    let lastDy = 0;
    const apply = () => {
      const a = api.current;
      const max = (a.count - 1) * ROW_H;
      const offset = Math.min(max, Math.max(0, startSlot * ROW_H + lastDy + (a.scrollY() - startScroll)));
      y.value = offset;
      const next = Math.round(offset / ROW_H);
      if (next !== a.slotOf(drink.id)) a.moveTo(drink.id, next);
    };
    const start = () => {
      if (activeRef.current) return;
      activeRef.current = true;
      lift.value = withSpring(1, { damping: 14, stiffness: 260 });
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      api.current.lift(drink.id, apply);
    };
    const end = () => {
      if (timer) clearTimeout(timer);
      timer = null;
      if (!activeRef.current) return;
      activeRef.current = false;
      lift.value = withSpring(0, { damping: 16, stiffness: 220 });
      api.current.drop();
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => activeRef.current,
      onPanResponderTerminationRequest: () => !activeRef.current,
      onPanResponderGrant: (e) => {
        startSlot = api.current.slotOf(drink.id);
        startScroll = api.current.scrollY();
        lastDy = 0;
        // the ☰ handle lifts at once, anywhere else on the row needs a long press
        if (e.nativeEvent.pageX > SCREEN_W - 76) start();
        else timer = setTimeout(start, 280);
      },
      onPanResponderMove: (e, g) => {
        if (!activeRef.current) {
          if (Math.abs(g.dy) > 6 && timer) {
            clearTimeout(timer);
            timer = null;
          }
          return;
        }
        lastDy = g.dy;
        api.current.move(e.nativeEvent.pageY);
        apply();
      },
      onPanResponderRelease: end,
      onPanResponderTerminate: end,
    });
  }, [api, drink.id, lift, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { scale: 1 + lift.value * 0.045 }],
  }));

  return (
    <Animated.View style={[styles.rowWrap, active && styles.lifted, style]} {...pan.panHandlers} testID={`order-${drink.id}`}>
      <View style={[styles.row, active && styles.rowLifted]}>
        <View style={styles.icon}>
          <DrinkIcon drink={drink} size={26} />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {drink.label.toUpperCase()}
        </Text>
        <View style={styles.handle} testID={`order-handle-${drink.id}`}>
          <DragHandleIcon color={active ? colors.inkSoft : '#C5CAD2'} />
        </View>
      </View>
    </Animated.View>
  );
});

/** "Change order": drag the drinks list into a new order. */
export function DrinkOrderScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state, update, drink } = useStore();
  // rows render in a fixed order and move by transform, so a drag never re-mounts its row
  const ids = useMemo(() => state.drinks.order.filter((id) => drink(id).id === id), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [order, setOrder] = useState(ids);
  const [active, setActive] = useState<string | null>(null);
  const orderRef = useRef(order);
  orderRef.current = order;

  const scrollRef = useRef<ScrollViewInstance>(null);
  const frameRef = useRef<HostInstance>(null);
  const scrollY = useRef(0);
  const frame = useRef({ top: 0, height: 0 });
  const content = useRef(0);
  const pointer = useRef<number | null>(null);
  const applyRef = useRef<(() => void) | null>(null);
  const loop = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopLoop = () => {
    if (loop.current) clearInterval(loop.current);
    loop.current = null;
  };
  useEffect(() => stopLoop, []);

  const api = useRef<DragApi>(null as unknown as DragApi);
  api.current = {
    count: ids.length,
    scrollY: () => scrollY.current,
    slotOf: (id) => orderRef.current.indexOf(id),
    lift: (id, apply) => {
      applyRef.current = apply;
      pointer.current = null;
      setActive(id);
      frameRef.current?.measureInWindow((_x, top, _w, height) => {
        frame.current = { top, height };
      });
      stopLoop();
      // nudges the list when the row is held near the top or bottom edge
      loop.current = setInterval(() => {
        const p = pointer.current;
        const { top, height } = frame.current;
        if (p === null || height === 0) return;
        const dir = p < top + EDGE ? -1 : p > top + height - EDGE ? 1 : 0;
        if (!dir) return;
        const maxScroll = Math.max(0, content.current - height);
        const next = Math.min(maxScroll, Math.max(0, scrollY.current + dir * 9));
        if (next === scrollY.current) return;
        scrollY.current = next;
        scrollRef.current?.scrollTo({ y: next, animated: false });
        applyRef.current?.();
      }, 16);
    },
    move: (pageY) => {
      pointer.current = pageY;
    },
    moveTo: (id, slot) => {
      const cur = orderRef.current;
      const from = cur.indexOf(id);
      if (from < 0 || from === slot) return;
      const next = [...cur];
      next.splice(from, 1);
      next.splice(slot, 0, id);
      orderRef.current = next;
      setOrder(next);
      if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
    },
    drop: () => {
      stopLoop();
      applyRef.current = null;
      setActive(null);
    },
  };

  const save = useCallback(() => {
    const next = orderRef.current;
    update((s) => {
      // keep any drink this page didn't show (e.g. added meanwhile) at the end
      const rest = s.drinks.order.filter((id) => !next.includes(id));
      const full = [...next, ...rest];
      const on = new Set(s.drinks.enabled);
      return { drinks: { ...s.drinks, order: full, enabled: full.filter((id) => on.has(id)) } };
    });
    nav.back();
  }, [nav, update]);

  return (
    <View style={styles.root} testID="drink-order">
      <CancelDoneBar prefix="order" onCancel={nav.back} onDone={save} />
      <View ref={frameRef} style={{ flex: 1 }} collapsable={false}>
        <ScrollView
          ref={scrollRef}
          scrollEnabled={active === null}
          onScroll={(e) => {
            scrollY.current = e.nativeEvent.contentOffset.y;
          }}
          onContentSizeChange={(_w, h) => {
            content.current = h;
          }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.head}>
            <Title>Change order</Title>
            <Subtitle style={{ marginBottom: 14 }}>Drag & drop drinks in the list</Subtitle>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(90).springify().damping(18)} style={[styles.list, { height: ids.length * ROW_H }]}>
            {ids.map((id) => (
              <SortRow key={id} drink={drink(id)} slot={order.indexOf(id)} active={active === id} api={api} />
            ))}
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  head: { paddingTop: 26, paddingHorizontal: 16 },
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E4E6EA', marginHorizontal: 0 },
  rowWrap: { position: 'absolute', left: 0, right: 0, top: 0, height: ROW_H, zIndex: 1 },
  lifted: { zIndex: 20 },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E6EA',
    userSelect: 'none',
  },
  rowLifted: {
    borderBottomColor: 'transparent',
    shadowColor: '#1E2430',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  icon: { width: 38 },
  name: { flex: 1, fontFamily: fonts.black, fontSize: 14, letterSpacing: 0.3, color: colors.ink },
  handle: { width: 44, height: ROW_H, alignItems: 'flex-end', justifyContent: 'center' },
});
