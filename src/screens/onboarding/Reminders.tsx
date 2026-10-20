import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Lily } from '../../components/Lily';
import { PillButton } from '../../components/Pressable';
import { enableReminders } from '../../lib/reminders';
import { useStore } from '../../lib/store';
import { colors, fonts } from '../../theme';
import { SkipButton } from './common';

const { width: SW } = Dimensions.get('window');
const CARD_W = Math.min(SW - 48, 360);
const CARD_H = CARD_W * 1.12;

function Sky() {
  const towers = [
    [10, 70],
    [34, 110],
    [60, 84],
    [84, 140],
    [112, 96],
    [140, 160],
    [170, 104],
    [196, 128],
    [222, 90],
    [250, 150],
    [280, 100],
    [306, 124],
    [332, 86],
  ];
  return (
    <Svg width={CARD_W} height={CARD_H} viewBox={`0 0 360 ${360 * 1.12}`} preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#C9F5FF" />
          <Stop offset="1" stopColor="#7DDCF2" />
        </LinearGradient>
      </Defs>
      <Rect width={360} height={404} fill="url(#sky)" />
      <Path d="M210 0 L250 0 L120 404 L80 404 Z" fill="#fff" opacity={0.18} />
      <Path d="M280 0 L300 0 L170 404 L150 404 Z" fill="#fff" opacity={0.14} />
      {towers.map(([x, h], i) => (
        <Rect key={i} x={x} y={300 - h} width={26} height={h + 40} fill="#A8E7F5" opacity={0.9} />
      ))}
      <Rect x={146} y={88} width={6} height={60} fill="#A8E7F5" />
      <Ellipse cx={149} cy={92} rx={12} ry={6} fill="#A8E7F5" />
      <Path d="M0 320 Q40 270 90 300 Q130 260 180 296 Q230 262 280 298 Q320 270 360 300 L360 404 L0 404 Z" fill="#5FD06A" />
    </Svg>
  );
}

function FrontBushes() {
  return (
    <Svg width={CARD_W} height={CARD_H * 0.36} viewBox="0 0 360 146" preserveAspectRatio="none">
      <Path d="M0 50 Q30 10 70 40 Q100 0 140 34 Q170 8 200 36 Q240 4 270 38 Q310 12 360 44 L360 146 L0 146 Z" fill="#3FBF57" />
      <Path d="M0 90 Q50 60 100 86 Q150 56 200 84 Q260 58 300 86 Q330 70 360 82 L360 146 L0 146 Z" fill="#2FA94A" />
      {[40, 120, 210, 300].map((x) => (
        <Path key={x} d={`M${x} 30 q8 -14 18 -6 q-6 10 -18 6 Z`} fill="#8BE36B" />
      ))}
    </Svg>
  );
}

function Leaf({ delay, dx }: { delay: number; dx: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withSequence(withDelay(700, withTiming(1, { duration: 1300, easing: Easing.out(Easing.quad) })), withTiming(0, { duration: 0 }), withDelay(700, withTiming(0, { duration: 1 }))), -1));
  }, [t, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value > 0 && t.value < 1 ? 1 - t.value : 0,
    transform: [{ translateX: dx * t.value }, { translateY: -90 * t.value + 120 * t.value * t.value }, { rotate: `${t.value * 300}deg` }],
  }));
  return <Animated.View style={[styles.leaf, style]} />;
}

/** Lily springs out of the bushes in a loop, flinging leaves as she goes. */
function JumpingLily() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 520, easing: Easing.out(Easing.quad) }),
          withDelay(450, withTiming(0, { duration: 480, easing: Easing.in(Easing.quad) })),
          withDelay(900, withTiming(0, { duration: 1 })),
        ),
        -1,
      ),
    );
  }, [t]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - t.value) * CARD_H * 0.42 },
      { rotate: `${(1 - t.value) * -10}deg` },
      { scaleY: 0.9 + t.value * 0.12 },
    ],
  }));
  return (
    <Animated.View style={[styles.lily, style]}>
      <Lily width={CARD_W * 0.48} idle={false} />
    </Animated.View>
  );
}

function Banner() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(700, withSpring(1, { damping: 12, stiffness: 120 }));
  }, [t]);
  const style = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ translateY: (1 - t.value) * -70 }, { scale: 0.9 + t.value * 0.1 }] }));
  return (
    <Animated.View style={[styles.banner, style]}>
      <View style={styles.badge}>
        <Lily width={30} crop="face" idle={false} />
      </View>
      <Text style={styles.bannerText}>Water reduces stress</Text>
      <Text style={styles.bannerTime}>now</Text>
    </Animated.View>
  );
}

export function Reminders({ onNext }: { onNext: () => void }) {
  const insets = useSafeAreaInsets();
  const { update } = useStore();
  const remind = async () => {
    const ok = await enableReminders();
    update({ remindersOn: ok });
    onNext();
  };
  return (
    <View style={[styles.root, { paddingTop: insets.top + 44, paddingBottom: insets.bottom + 30 }]}>
      <SkipButton onPress={onNext} />
      <Animated.Text entering={FadeInDown.springify()} style={styles.title}>
        Smart Reminders
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(80).springify()} style={styles.sub}>
        Healthy notifications when you forget to drink water
      </Animated.Text>
      <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.cardWrap}>
        <View style={styles.card}>
          <Sky />
          <JumpingLily />
          {[0, 1, 2, 3].map((i) => (
            <Leaf key={i} delay={500 + i * 40} dx={(i - 1.5) * 50} />
          ))}
          <View style={styles.front}>
            <FrontBushes />
          </View>
          <Banner />
        </View>
        <View style={styles.tail} />
      </Animated.View>
      <View style={{ flex: 1 }} />
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <PillButton label="Remind me to drink water" onPress={remind} testID="remind" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center' },
  title: { fontFamily: fonts.extra, fontSize: 30, color: colors.ink },
  sub: { fontFamily: fonts.semibold, fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 6, maxWidth: 280 },
  cardWrap: { marginTop: 26, alignItems: 'center' },
  card: { width: CARD_W, height: CARD_H, borderRadius: 30, overflow: 'hidden', backgroundColor: '#7DDCF2' },
  front: { position: 'absolute', bottom: 0, left: 0 },
  lily: { position: 'absolute', alignSelf: 'center', bottom: CARD_H * 0.1 },
  leaf: { position: 'absolute', left: CARD_W / 2 - 6, top: CARD_H * 0.62, width: 12, height: 7, borderRadius: 6, backgroundColor: '#5FD06A' },
  tail: { width: 26, height: 26, backgroundColor: '#2FA94A', transform: [{ rotate: '45deg' }], marginTop: -15 },
  banner: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  badge: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.waterLight, alignItems: 'center', justifyContent: 'center' },
  bannerText: { flex: 1, fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  bannerTime: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted },
});
