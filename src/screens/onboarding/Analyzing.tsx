import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { CheckIcon } from '../../components/Icons';
import { Lily } from '../../components/Lily';
import { colors, fonts } from '../../theme';

const RINGS = [
  { r: 62, n: 14, size: 7 },
  { r: 88, n: 20, size: 9 },
  { r: 114, n: 26, size: 12 },
];
const BOX = 270;
const STAGES = [
  { label: 'Analyzing your data', color: colors.water },
  { label: 'Personalizing goals', color: colors.blue },
  { label: 'Playing with frogs', color: colors.pink },
];
const STAGE_MS = 1500;

function Dot({ x, y, size, index, total, ring, spin, hue }: { x: number; y: number; size: number; index: number; total: number; ring: number; spin: SharedValue<number>; hue: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const wave = Math.sin(spin.value * Math.PI * 2 * 2 - (index / total) * Math.PI * 4 + ring);
    // colours sweep teal → blue → purple → pink as the loader progresses
    const local = Math.min(2, Math.max(0, hue.value * 2 + (index / total) * 0.6 - 0.3));
    return {
      backgroundColor: interpolateColor(local, [0, 1, 2], ['#5EE6F0', '#3E64E6', '#E34FB0']),
      opacity: 0.55 + 0.45 * ((wave + 1) / 2),
      transform: [{ scale: 0.6 + 0.4 * ((wave + 1) / 2) }],
    };
  });
  return <Animated.View style={[{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: size / 2 }, style]} />;
}

function Ring({ r, n, size, ringIndex, spin, hue }: { r: number; n: number; size: number; ringIndex: number; spin: SharedValue<number>; hue: SharedValue<number> }) {
  const rotate = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360 * (ringIndex % 2 ? -0.5 : 0.35)}deg` }] }));
  const dots = useMemo(
    () => Array.from({ length: n }, (_, i) => ({ x: BOX / 2 + Math.cos((i / n) * Math.PI * 2) * r, y: BOX / 2 + Math.sin((i / n) * Math.PI * 2) * r })),
    [n, r],
  );
  return (
    <Animated.View style={[StyleSheet.absoluteFill, rotate]}>
      {dots.map((d, i) => (
        <Dot key={i} {...d} size={size} index={i} total={n} ring={ringIndex} spin={spin} hue={hue} />
      ))}
    </Animated.View>
  );
}

function Bar({ label, color, progress }: { label: string; color: string; progress: number }) {
  const done = progress >= 100;
  return (
    <View style={styles.bar}>
      <Text style={[styles.barLabel, { color }]}>{label}</Text>
      <View style={styles.barRow}>
        <View style={[styles.track, { backgroundColor: `${color}22` }]}>
          <View style={[styles.fill, { width: `${progress}%`, backgroundColor: color }]} />
        </View>
        {done ? (
          <Animated.View entering={ZoomIn.springify()} style={[styles.check, { backgroundColor: color }]}>
            <CheckIcon size={11} />
          </Animated.View>
        ) : (
          <Text style={[styles.pct, { color }]}>{Math.round(progress)}%</Text>
        )}
      </View>
    </View>
  );
}

export function Analyzing({ onNext }: { onNext: () => void }) {
  const spin = useSharedValue(0);
  const hue = useSharedValue(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.linear }), -1);
    hue.value = withTiming(1, { duration: STAGE_MS * STAGES.length, easing: Easing.inOut(Easing.quad) });
    const start = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - start), 50);
    const done = setTimeout(onNext, STAGE_MS * STAGES.length + 700);
    return () => {
      clearInterval(id);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.root}>
      <View style={{ width: BOX, height: BOX }}>
        {RINGS.map((r, i) => (
          <Ring key={i} {...r} ringIndex={i} spin={spin} hue={hue} />
        ))}
        <View style={styles.face}>
          <Lily width={84} crop="face" />
        </View>
      </View>
      <View style={styles.bars}>
        {STAGES.map((s, i) => {
          const local = (elapsed - i * STAGE_MS) / STAGE_MS;
          const k = Math.max(0, Math.min(1, local));
          const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          return <Bar key={s.label} label={s.label} color={s.color} progress={Math.min(100, eased * 100)} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  face: { position: 'absolute', left: BOX / 2 - 42, top: BOX / 2 - 30 },
  bars: { width: 270, marginTop: 50, gap: 16 },
  bar: {},
  barLabel: { fontFamily: fonts.bold, fontSize: 14, marginBottom: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  pct: { width: 34, fontFamily: fonts.bold, fontSize: 11, textAlign: 'right' },
  check: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 7, marginRight: 7 },
});
