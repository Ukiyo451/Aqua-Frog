import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Bounce } from '../../components/Pressable';
import { colors, fonts } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING = '#0E9FB4';
const TRACK = '#C9F1F5';

/** Counts from 0 up to `target` whenever it mounts. */
function CountUp({ target, style, suffix = '' }: { target: number; style: object; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const k = Math.min(1, (Date.now() - start) / 900);
      setV(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return (
    <Text style={style}>
      {v}
      {suffix}
    </Text>
  );
}

export function streakRing(streak: number): number {
  return Math.min(1, 0.25 + (streak - 1) * 0.125);
}

/**
 * The big circle at the top of the calendar: flips between the day streak and the selected
 * day's hydration. Taps flip it; it also flips by itself until the person taps.
 */
export function HeroCircle({ size, streak, percent, isToday }: { size: number; streak: number; percent: number; isToday: boolean }) {
  const [mode, setMode] = useState<'streak' | 'hydration'>('streak');
  const auto = useRef(true);
  const ring = useSharedValue(0);
  const stroke = size * 0.075;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const disc = size - stroke * 2 - size * 0.02;

  useEffect(() => {
    const id = setInterval(() => {
      if (auto.current) setMode((m) => (m === 'streak' ? 'hydration' : 'streak'));
    }, 3600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const to = mode === 'streak' ? streakRing(streak) : Math.min(1, percent / 100);
    ring.value = withSpring(to, { damping: 16, stiffness: 70 });
  }, [mode, streak, percent, ring]);

  const flip = useSharedValue(0);
  const [keys, setKeys] = useState({ s: 0, h: 0 });
  useEffect(() => {
    flip.value = withSpring(mode === 'streak' ? 0 : 1, { damping: 14, stiffness: 140 });
    setKeys((k) => (mode === 'streak' ? { ...k, s: k.s + 1 } : { ...k, h: k.h + 1 }));
  }, [mode, flip]);
  const streakStyle = useAnimatedStyle(() => ({ opacity: 1 - flip.value, transform: [{ scale: 0.6 + (1 - flip.value) * 0.4 }] }));
  const hydStyle = useAnimatedStyle(() => ({ opacity: flip.value, transform: [{ scale: 0.6 + flip.value * 0.4 }] }));
  const track = useAnimatedProps(() => ({ opacity: flip.value }));

  const arc = useAnimatedProps(() => ({ strokeDashoffset: circ * (1 - ring.value) }));

  return (
    <Bounce
      onPress={() => {
        auto.current = false;
        setMode((m) => (m === 'streak' ? 'hydration' : 'streak'));
      }}
      scaleTo={0.96}
      style={[styles.wrap, { width: size, height: size }]}
      testID="hero"
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <AnimatedCircle cx={size / 2} cy={size / 2} r={r} stroke={TRACK} strokeWidth={stroke} fill="none" animatedProps={track} />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={RING}
          strokeWidth={stroke}
          strokeLinecap={mode === 'hydration' && percent >= 100 ? 'butt' : 'round'}
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          animatedProps={arc}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[styles.disc, { width: disc, height: disc, borderRadius: disc / 2 }]}>
        <Animated.View style={[styles.center, streakStyle]} pointerEvents="none">
          <CountUp key={`s${keys.s}`} target={streak} style={[styles.big, { fontSize: size * 0.4, lineHeight: size * 0.46 }]} />
          <Text style={styles.label}>{streak === 1 ? 'DAY STREAK' : 'DAYS STREAK'}</Text>
        </Animated.View>
        <Animated.View style={[styles.center, hydStyle]} pointerEvents="none">
          <CountUp key={`h${keys.h}`} target={percent} suffix="%" style={[styles.big, { fontSize: size * 0.27, lineHeight: size * 0.34 }]} />
          <Text style={styles.label}>{isToday ? "TODAY'S HYDRATION" : 'HYDRATION'}</Text>
        </Animated.View>
      </View>
    </Bounce>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  disc: { backgroundColor: colors.water, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  center: { position: 'absolute', alignItems: 'center' },
  big: { fontFamily: fonts.black, color: '#fff' },
  label: { fontFamily: fonts.black, fontSize: 15, color: '#fff', letterSpacing: 0.5, marginTop: -2 },
});
