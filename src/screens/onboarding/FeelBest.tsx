import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowIcon, CheckIcon, CrossIcon } from '../../components/Icons';
import { Lily } from '../../components/Lily';
import { PillButton } from '../../components/Pressable';
import { colors, fonts } from '../../theme';

const { width: SW } = Dimensions.get('window');
const CARD_W = Math.min((SW - 40) / 2 + 14, 200);

const BAD = ['Constant fatigue during the day', 'More sensitive to stress', 'Deal with brain fog, headaches'];
const GOOD = ['Wake up feeling refreshed', 'Feel calmer and in control', 'Focus better and get more done'];

/** Little stars orbiting the dehydrated frog's head. */
function Dizzy() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.linear }), -1);
  }, [t]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${t.value * 360}deg` }, { scaleY: 0.4 }] }));
  return (
    <Animated.View style={[styles.dizzy, style]} pointerEvents="none">
      {['✦', '✧', '✦'].map((s, i) => (
        <Text
          key={i}
          style={{
            position: 'absolute',
            left: 40 + Math.cos((i / 3) * Math.PI * 2) * 40,
            top: 40 + Math.sin((i / 3) * Math.PI * 2) * 40,
            color: i === 1 ? '#FFD45C' : '#fff',
            fontSize: 16,
          }}
        >
          {s}
        </Text>
      ))}
    </Animated.View>
  );
}

function Card({ good, delay }: { good: boolean; delay: number }) {
  const t = useSharedValue(0);
  const float = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withSpring(1, { damping: 13, stiffness: 110 }));
    float.value = withDelay(delay + 600, withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [t, float, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [
      { translateX: (1 - t.value) * (good ? 120 : -120) },
      { rotate: `${(1 - t.value) * (good ? 8 : -8)}deg` },
    ],
  }));
  const frog = useAnimatedStyle(() => ({ transform: [{ translateY: float.value * (good ? -8 : 4) }, { rotate: `${good ? -4 + float.value * 8 : 0}deg` }] }));
  const items = good ? GOOD : BAD;
  return (
    <Animated.View style={[styles.card, good ? styles.good : styles.bad, style]}>
      <Text style={[styles.cardTitle, { color: good ? '#fff' : '#4B3A8C' }]}>{good ? 'When drinking more water' : 'When dehydrated'}</Text>
      {items.map((txt, i) => (
        <View key={txt} style={styles.item}>
          <Animated.View entering={ZoomIn.delay(delay + 400 + i * 160).springify()} style={[styles.mark, { backgroundColor: good ? '#0FB4C4' : 'transparent' }]}>
            {good ? <CheckIcon size={11} /> : <CrossIcon size={10} color="#4B3A8C" />}
          </Animated.View>
          <Text style={[styles.itemText, { color: good ? '#fff' : '#4B3A8C' }]}>{txt}</Text>
        </View>
      ))}
      <Animated.View style={[styles.frog, frog]}>
        {!good && <Dizzy />}
        <Lily width={CARD_W * 0.72} mood={good ? 'cool' : 'sad'} />
      </Animated.View>
    </Animated.View>
  );
}

export function FeelBest({ onNext }: { onNext: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 30 }]}>
      <Animated.Text entering={FadeInDown.springify()} style={styles.title}>
        Feel your best{'\n'}every day
      </Animated.Text>
      <View style={styles.cards}>
        <View style={{ marginTop: 34 }}>
          <Card good={false} delay={150} />
        </View>
        <View style={{ marginLeft: -24, zIndex: 2 }}>
          <Card good delay={350} />
        </View>
        <Animated.View entering={ZoomIn.delay(900).springify()} style={styles.arrow}>
          <ArrowIcon />
        </Animated.View>
      </View>
      <View style={{ flex: 1 }} />
      <Animated.View entering={FadeInDown.delay(500).springify()}>
        <PillButton label="Feel my best!" onPress={onNext} testID="feel-best" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center' },
  title: { fontFamily: fonts.extra, fontSize: 30, color: colors.ink, textAlign: 'center', lineHeight: 36 },
  cards: { flexDirection: 'row', marginTop: 26, alignItems: 'flex-start' },
  card: { width: CARD_W, borderRadius: 24, padding: 14, paddingBottom: CARD_W * 0.9, overflow: 'hidden' },
  bad: { backgroundColor: colors.purpleSoft, paddingRight: 34 },
  good: { backgroundColor: '#5EE6F0', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  cardTitle: { fontFamily: fonts.black, fontSize: 18, lineHeight: 21, marginBottom: 10 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 8 },
  mark: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  itemText: { flex: 1, fontFamily: fonts.semibold, fontSize: 12.5, lineHeight: 16 },
  frog: { position: 'absolute', bottom: -18, alignSelf: 'center' },
  dizzy: { position: 'absolute', top: -14, left: CARD_W * 0.36 - 50, width: 100, height: 100, zIndex: 3 },
  arrow: {
    position: 'absolute',
    left: CARD_W - 32,
    top: 190,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
});
