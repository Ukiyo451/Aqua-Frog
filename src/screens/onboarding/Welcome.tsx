import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import Svg, { Path } from 'react-native-svg';
import { Confetti } from '../../components/effects';
import { Lily } from '../../components/Lily';
import { PillButton } from '../../components/Pressable';
import { colors, fonts } from '../../theme';

/** Two water drops that pop in and wiggle above the title, like the waving hands in the reference. */
function Drops() {
  const t = useSharedValue(0);
  const wiggle = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(300, withSpring(1, { damping: 7 }));
    wiggle.value = withDelay(900, withRepeat(withSequence(withTiming(1, { duration: 260 }), withTiming(-1, { duration: 260 }), withTiming(0, { duration: 260 }), withDelay(1400, withTiming(0, { duration: 1 }))), -1));
  }, [t, wiggle]);
  const left = useAnimatedStyle(() => ({ transform: [{ scale: t.value }, { rotate: `${-14 + wiggle.value * 10}deg` }] }));
  const right = useAnimatedStyle(() => ({ transform: [{ scale: t.value }, { rotate: `${14 - wiggle.value * 10}deg` }] }));
  const drop = (
    <Svg width={30} height={40} viewBox="0 0 30 40">
      <Path d="M15 2 Q28 20 28 27 Q28 38 15 38 Q2 38 2 27 Q2 20 15 2 Z" fill={colors.water} />
      <Path d="M9 26 Q9 32 14 33" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
    </Svg>
  );
  return (
    <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
      <Animated.View style={left}>{drop}</Animated.View>
      <Animated.View style={right}>{drop}</Animated.View>
    </View>
  );
}

export function Welcome({ onNext }: { onNext: () => void }) {
  const insets = useSafeAreaInsets();
  const pop = useSharedValue(0);
  const hop = useSharedValue(0);
  useEffect(() => {
    pop.value = withDelay(150, withSpring(1, { damping: 9, stiffness: 120 }));
    hop.value = withDelay(
      1600,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) }),
          withTiming(0.4, { duration: 160, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 160, easing: Easing.in(Easing.quad) }),
          withDelay(2200, withTiming(0, { duration: 1 })),
        ),
        -1,
      ),
    );
  }, [pop, hop]);
  const frog = useAnimatedStyle(() => ({
    opacity: pop.value > 0.02 ? 1 : 0,
    transform: [{ translateY: -hop.value * 34 }, { scale: 0.4 + pop.value * 0.6 }, { scaleY: 1 + hop.value * 0.06 }],
  }));
  const shadow = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - hop.value * 0.35 }], opacity: 0.18 - hop.value * 0.08 }));

  return (
    <View style={[styles.root, { paddingTop: insets.top + 50, paddingBottom: insets.bottom + 30 }]}>
      <Confetti count={46} />
      <Drops />
      <Animated.Text entering={FadeInDown.delay(150).springify()} style={styles.title}>
        Track your intake
      </Animated.Text>
      <View style={styles.stage}>
        <Animated.View style={frog}>
          <Lily width={250} />
        </Animated.View>
        <Animated.View style={[styles.shadow, shadow]} />
      </View>
      <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.footer}>
        <Text style={styles.lang}>🇬🇧 EN</Text>
        <PillButton label="GET STARTED" onPress={onNext} style={{ flex: 1 }} testID="get-started" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', backgroundColor: colors.bg },
  title: { fontFamily: fonts.extra, fontSize: 32, color: colors.ink },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  shadow: { width: 200, height: 18, borderRadius: 100, backgroundColor: '#000', marginTop: -6 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 28, width: '100%' },
  lang: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted },
});
