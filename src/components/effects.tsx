import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Polygon } from 'react-native-svg';
import { colors } from '../theme';

const { width: SW, height: SH } = Dimensions.get('window');
const CONFETTI_COLORS = ['#FF5FA2', '#FFD45C', '#14C6D6', '#8E3BE8', '#7ED957', '#3E64E6', '#FF8A3D'];

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function ConfettiPiece({ seed, loop }: { seed: number; loop: boolean }) {
  const p = useMemo(
    () => ({
      x: rand(0, SW),
      drift: rand(-60, 60),
      spin: rand(-720, 720),
      w: rand(6, 10),
      h: rand(10, 18),
      color: CONFETTI_COLORS[seed % CONFETTI_COLORS.length],
      delay: rand(0, loop ? 3000 : 500),
      dur: rand(2600, 4200),
    }),
    [seed, loop],
  );
  const t = useSharedValue(0);
  useEffect(() => {
    const fall = withTiming(1, { duration: p.dur, easing: Easing.in(Easing.quad) });
    t.value = withDelay(p.delay, loop ? withRepeat(fall, -1) : fall);
  }, [t, p, loop]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 || t.value === 1 ? 0 : 1,
    transform: [
      { translateX: p.x + Math.sin(t.value * 6) * 18 + p.drift * t.value },
      { translateY: -30 + t.value * (SH + 60) },
      { rotate: `${t.value * p.spin}deg` },
      { scaleX: Math.cos(t.value * 12) },
    ],
  }));
  return <Animated.View style={[{ position: 'absolute', width: p.w, height: p.h, borderRadius: 2, backgroundColor: p.color }, style]} />;
}

/** Falling paper confetti. `loop` keeps it raining, otherwise one burst. */
export function Confetti({ count = 40, loop = false }: { count?: number; loop?: boolean }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }, (_, i) => (
        <ConfettiPiece key={i} seed={i} loop={loop} />
      ))}
    </View>
  );
}

/** A translucent ice cube that bobs and slowly turns, for the teal goal screen. */
export function IceCube({ x, y, size, delay = 0 }: { x: number; y: number; size: number; delay?: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [t, delay]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -10 * t.value }, { rotate: `${-8 + 16 * t.value}deg` }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: x, top: y }, style]} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Polygon points="20,18 72,8 92,42 80,86 30,92 8,56" fill="rgba(255,255,255,0.28)" />
        <Polygon points="20,18 72,8 60,40 28,46" fill="rgba(255,255,255,0.42)" />
        <Polygon points="60,40 92,42 80,86 54,70" fill="rgba(255,255,255,0.16)" />
        <Path d="M30 30 L46 26" stroke="rgba(255,255,255,0.8)" strokeWidth={5} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * A wall of water that surges up from the bottom with a rolling crest, then lets the next
 * page show through. Used between the reminder and goal pages.
 */
export function WaveWipe({ onCovered, onDone, color = colors.water }: { onCovered?: () => void; onDone?: () => void; color?: string }) {
  const rise = useSharedValue(0);
  const phase = useSharedValue(0);
  const fade = useSharedValue(1);
  useEffect(() => {
    phase.value = withRepeat(withTiming(Math.PI * 2, { duration: 900, easing: Easing.linear }), -1);
    rise.value = withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) });
    const a = setTimeout(() => onCovered?.(), 920);
    const b = setTimeout(() => {
      fade.value = withTiming(0, { duration: 350 });
    }, 1000);
    const c = setTimeout(() => onDone?.(), 1380);
    return () => [a, b, c].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const props = useAnimatedProps(() => {
    const top = SH + 40 - rise.value * (SH + 120);
    let d = `M0 ${SH + 40}`;
    for (let x = 0; x <= SW + 20; x += 20) d += ` L${x} ${top + Math.sin(x / 55 + phase.value) * 18 * (1 - rise.value * 0.6)}`;
    return { d: `${d} L${SW + 20} ${SH + 40} Z` };
  });
  const style = useAnimatedStyle(() => ({ opacity: fade.value }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width={SW} height={SH}>
        <AnimatedPath animatedProps={props} fill={color} />
      </Svg>
    </Animated.View>
  );
}

/** Counts a number from its previous value to the new one with an ease-out. */
export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = Date.now();
    const a = from.current;
    let raf = 0;
    const tick = () => {
      const k = Math.min(1, (Date.now() - start) / duration);
      const e = 1 - Math.pow(1 - k, 3);
      const v = Math.round(a + (target - a) * e);
      setValue(v);
      from.current = v;
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/** A soft ring that keeps pulsing outwards — "tap me" hint. */
export function PulseRing({ size, color = colors.pink }: { size: number; color?: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withSequence(withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 0 })), -1);
  }, [t]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - t.value),
    transform: [{ scale: 0.7 + t.value * 0.7 }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  );
}

/** Droplets that burst outward from a point, e.g. when the goal number changes. */
export function Splash({ trigger, color = 'rgba(255,255,255,0.55)', size = 220 }: { trigger: number; color?: string; size?: number }) {
  const t = useSharedValue(1);
  useEffect(() => {
    if (trigger === 0) return;
    t.value = 0;
    t.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [trigger, t]);
  const drops = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ a: (i / 12) * Math.PI * 2 + rand(-0.2, 0.2), d: rand(0.6, 1) })), []);
  return (
    <View style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
      {drops.map((p, i) => (
        <Drop key={i} t={t} angle={p.a} dist={p.d * size * 0.5} color={color} />
      ))}
    </View>
  );
}

function Drop({ t, angle, dist, color }: { t: SharedValue<number>; angle: number; dist: number; color: string }) {
  const style = useAnimatedStyle(() => ({
    opacity: t.value >= 1 ? 0 : 1 - t.value,
    transform: [
      { translateX: Math.cos(angle) * dist * t.value },
      { translateY: Math.sin(angle) * dist * t.value },
      { rotate: `${(angle * 180) / Math.PI + 90}deg` },
      { scaleY: 1 + (1 - t.value) * 1.5 },
    ],
  }));
  return <Animated.View style={[{ position: 'absolute', width: 10, height: 18, borderRadius: 6, backgroundColor: color }, style]} />;
}
