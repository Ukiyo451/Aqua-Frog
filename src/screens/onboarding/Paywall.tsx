import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseIcon } from '../../components/BottomSheet';
import { MiniCup } from '../../components/Cup';
import { CheckIcon } from '../../components/Icons';
import { Lily } from '../../components/Lily';
import { Bounce, PillButton } from '../../components/Pressable';
import { DRINKS } from '../../lib/drinks';
import { colors, fonts } from '../../theme';

const CAPTIONS = ['Track 150+ beverages', '9 healthy challenges', 'Edit intake & beverages', 'Unlock Lily’s pond friends'];
const FEATURES = [
  { title: '40+ Most Popular Beverages', body: 'Track water from coffee, tea, juice, smoothie, soda and more', color: '#FF8A3D' },
  { title: '50+ Hydration Tips', body: 'Daily bite-size tips on lifehacks, health benefits, yummy sips', color: colors.frogDark },
  { title: '120 Cute Pond Characters', body: 'Fill up & complete each day in a new way', color: colors.water },
  { title: '9 Fun Healthy Challenges', body: 'Stay motivated: Tea-Toad, Sober Salamander, Caffeine-free Newt', color: colors.pink },
  { title: 'Edit Your Intake History', body: 'Delete entries or add what was missed on a previous day', color: colors.purple },
];

function BouncingDrinks() {
  const kinds = ['juice', 'water', 'tea', 'coffee'] as const;
  return (
    <View style={styles.drinks}>
      {kinds.map((k, i) => (
        <Hop key={k} delay={i * 140}>
          <MiniCup size={i === 1 ? 56 : 44} color={DRINKS[k].color} glass={DRINKS[k].glass} fill={0.8} />
        </Hop>
      ))}
    </View>
  );
}

function Hop({ delay, children }: { delay: number; children: React.ReactNode }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) }), withDelay(900, withTiming(0, { duration: 1 }))), -1),
    );
  }, [t, delay]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: -t.value * 18 }, { rotate: `${(t.value - 0.5) * 10}deg` }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

function Caption() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % CAPTIONS.length), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={{ height: 22, overflow: 'hidden', alignItems: 'center' }}>
      <Animated.View key={i} entering={FadeInUp.springify()} exiting={FadeOutUp} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <CheckIcon size={12} color={colors.frogDark} />
        <Text style={styles.caption}>{CAPTIONS[i]}</Text>
      </Animated.View>
    </View>
  );
}

export function Paywall({ onNext }: { onNext: () => void }) {
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState<'lifetime' | 'trial'>('lifetime');
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Bounce onPress={onNext} style={[styles.close, { top: insets.top + 8 }]} testID="paywall-close">
        <CloseIcon />
      </Bounce>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.springify()} style={{ alignItems: 'center', marginTop: 36 }}>
          <BouncingDrinks />
          <Caption />
          <Text style={styles.title}>Become a hydration hero!</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <Bounce onPress={() => setPlan('lifetime')} scaleTo={0.97} testID="plan-lifetime">
            <View style={[styles.plan, styles.planMain, plan === 'lifetime' && styles.planOn]}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>-50% ENDS SOON</Text>
              </View>
              <Text style={styles.planTitle}>Lifetime, pay once</Text>
              <Text style={styles.planSub}>
                <Text style={{ textDecorationLine: 'line-through' }}>$49.99</Text> $24.99, no recurring payments
              </Text>
            </View>
          </Bounce>
          <Bounce onPress={() => setPlan('trial')} scaleTo={0.97} testID="plan-trial">
            <View style={[styles.plan, styles.planAlt, plan === 'trial' && styles.planOn]}>
              <Text style={[styles.planTitle, { color: colors.water }]}>$0.00 due now</Text>
              <Text style={[styles.planSub, { color: colors.inkSoft }]}>3 days free, then $19.99/year</Text>
            </View>
          </Bounce>
          <PillButton label="Continue" onPress={onNext} style={{ marginTop: 18 }} testID="paywall-continue" />
          <Text style={styles.note}>Preview only — purchases aren't connected yet.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).springify()} style={{ marginTop: 26 }}>
          <Text style={styles.section}>What you get</Text>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.feature}>
              <View style={[styles.featureDot, { backgroundColor: `${f.color}22` }]}>
                <CheckIcon size={12} color={f.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: f.color }]}>{f.title}</Text>
                <Text style={styles.featureBody}>{f.body}</Text>
              </View>
            </View>
          ))}
          <View style={styles.review}>
            <Lily width={56} crop="face" />
            <Text style={styles.reviewStars}>★★★★★</Text>
            <Text style={styles.reviewText}>“Lily is the cutest reason I've ever had to drink more water.”</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  close: { position: 'absolute', right: 16, zIndex: 5, width: 34, height: 34, borderRadius: 17, backgroundColor: '#F4F5F7', alignItems: 'center', justifyContent: 'center' },
  drinks: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 90, marginBottom: 8 },
  caption: { fontFamily: fonts.bold, fontSize: 13, color: colors.frogDark },
  title: { fontFamily: fonts.extra, fontSize: 22, color: colors.ink, marginTop: 4, marginBottom: 20 },
  plan: { borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  planMain: { backgroundColor: colors.water },
  planAlt: { backgroundColor: colors.waterLight },
  planOn: { borderColor: colors.ink },
  planTitle: { fontFamily: fonts.extra, fontSize: 18, color: '#fff' },
  planSub: { fontFamily: fonts.semibold, fontSize: 13, color: '#fff', marginTop: 2 },
  badge: { position: 'absolute', right: 0, top: 0, backgroundColor: colors.pink, borderTopRightRadius: 16, borderBottomLeftRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: fonts.black, fontSize: 9, color: '#fff', letterSpacing: 0.5 },
  note: { fontFamily: fonts.semibold, fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 10 },
  section: { fontFamily: fonts.extra, fontSize: 22, color: colors.ink, textAlign: 'center', marginBottom: 14 },
  feature: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  featureDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontFamily: fonts.extra, fontSize: 14 },
  featureBody: { fontFamily: fonts.semibold, fontSize: 13, color: colors.inkSoft, marginTop: 1 },
  review: { backgroundColor: '#2FC56B', borderRadius: 22, padding: 18, marginTop: 10, alignItems: 'center' },
  reviewStars: { color: colors.sun, fontSize: 20, marginTop: 4 },
  reviewText: { fontFamily: fonts.bold, fontSize: 15, color: '#fff', textAlign: 'center', marginTop: 6 },
});
