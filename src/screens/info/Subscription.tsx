import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { FrogAvatar } from '../../components/Frogs';
import { PillButton } from '../../components/Pressable';
import { Screen } from '../../components/ui';
import { useStore } from '../../lib/store';
import { useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { FeatureList, FEATURES } from './features';

/** Lanyard ID badge with a frog photo and a teal check; swings from its loop. */
export function IdBadge({ size = 1, frog = 'lily', checked = true }: { size?: number; frog?: string; checked?: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [t]);
  const swing = useAnimatedStyle(() => ({ transform: [{ rotate: `${(t.value - 0.5) * 8}deg` }], transformOrigin: 'top' }));
  const W = 120 * size;
  const H = 170 * size;
  return (
    <Animated.View style={[{ width: W, height: H }, swing]}>
      <Svg width={W} height={H} viewBox="0 0 120 170" style={StyleSheet.absoluteFill}>
        <Path d="M60 4 Q46 6 46 20 L46 34 M60 4 Q74 6 74 20 L74 34" stroke="#9FDCE5" strokeWidth={4} fill="none" strokeLinecap="round" />
        <Rect x={48} y={30} width={24} height={14} rx={4} fill="#7CCFDB" />
        <Rect x={10} y={40} width={100} height={124} rx={16} fill="#D9F5F9" stroke="#8ED8E3" strokeWidth={3} />
        <Rect x={50} y={48} width={20} height={5} rx={2.5} fill="#8ED8E3" />
        <Rect x={30} y={62} width={60} height={52} rx={10} fill="#fff" />
        <Rect x={26} y={124} width={50} height={6} rx={3} fill="#A6E1EA" />
        <Rect x={26} y={136} width={34} height={6} rx={3} fill="#A6E1EA" />
        {checked && <Circle cx={94} cy={146} r={17} fill={colors.water} stroke="#fff" strokeWidth={3} />}
        {checked && <Path d="M86 146 L92 152 L102 140" stroke="#fff" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      </Svg>
      <View style={{ position: 'absolute', left: 33 * size, top: 64 * size }}>
        <FrogAvatar id={frog} size={54 * size} />
      </View>
    </Animated.View>
  );
}

function fmt(at: number) {
  const d = new Date(at);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}.${d.getFullYear()}`;
}

export function SubscriptionScreen() {
  const { state } = useStore();
  const nav = useNav();
  const p = state.premium;

  if (!p) {
    return (
      <Screen chrome="close" testID="subscription">
        <Animated.View entering={FadeInDown.springify()} style={{ alignItems: 'center' }}>
          <View style={{ opacity: 0.55 }}>
            <IdBadge checked={false} />
          </View>
          <Text style={styles.plan}>You’re on the free plan</Text>
          <Text style={styles.sub}>Premium unlocks everything below</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <PillButton label="See Premium plans" variant="water" onPress={() => nav.replace('premium', undefined, 'modal')} style={{ marginVertical: 22 }} testID="subscription-upgrade" />
        </Animated.View>
        <FeatureList delay={160} />
      </Screen>
    );
  }

  return (
    <Screen chrome="close" testID="subscription">
      <Animated.View entering={FadeInDown.springify()} style={{ alignItems: 'center' }}>
        <IdBadge frog={state.character.current} />
        <Text style={styles.date}>{fmt(p.since)}</Text>
        <Text style={styles.plan}>{p.plan === 'monthly' ? 'Monthly subscription' : 'Lifetime access'}</Text>
        <Text style={styles.planSmall}>{p.plan === 'monthly' ? '$3.99 per month' : 'Paid once, yours forever'}</Text>
        <Text style={styles.sub}>Main features include</Text>
      </Animated.View>
      <FeatureList delay={120} />
      <Text style={styles.foot}>{FEATURES.length} premium features unlocked</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  date: { fontFamily: fonts.extra, fontSize: 16, color: colors.water, marginTop: 14 },
  plan: { fontFamily: fonts.extra, fontSize: 26, color: colors.ink, textAlign: 'center', marginTop: 4 },
  planSmall: { fontFamily: fonts.bold, fontSize: 15, color: colors.inkSoft, marginTop: 2 },
  sub: { fontFamily: fonts.bold, fontSize: 14, color: colors.muted, marginTop: 10, marginBottom: 20, textAlign: 'center' },
  foot: { fontFamily: fonts.bold, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 6 },
});
