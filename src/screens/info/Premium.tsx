import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { Frog } from '../../components/Frogs';
import { CheckIcon } from '../../components/Icons';
import { Bounce } from '../../components/Pressable';
import { CheckMark, Dialog, Screen } from '../../components/ui';
import { useStore } from '../../lib/store';
import { useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { FEATURES, FeatureList } from './features';

const LINES = [FEATURES[3].title, 'Edit intake & beverages', FEATURES[2].title, 'Create your own drinks', 'Celebrate your day'];

function HopFrog({ id, width, delay }: { id: string; width: number; delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay + 700,
      withRepeat(
        withSequence(withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) }), withDelay(1600, withTiming(0, { duration: 1 }))),
        -1,
      ),
    );
  }, [t, delay]);
  const hop = useAnimatedStyle(() => ({ transform: [{ translateY: -t.value * 14 }] }));
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(9).stiffness(150)}>
      <Animated.View style={hop}>
        <Frog id={id} width={width} idle={false} />
      </Animated.View>
    </Animated.View>
  );
}

function RotatingLine() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % LINES.length), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={styles.lineBox}>
      <Animated.View key={i} entering={FadeInUp.springify().damping(14)} exiting={FadeOutUp.duration(200)} style={styles.lineRow}>
        <CheckIcon size={12} color={colors.purple} />
        <Text style={styles.line}>{LINES[i]}</Text>
      </Animated.View>
    </View>
  );
}

function PlanCard({ on, title, sub, best, onPress, testID }: { on: boolean; title: string; sub: string; best?: boolean; onPress: () => void; testID: string }) {
  const sc = useSharedValue(1);
  useEffect(() => {
    if (on) sc.value = withSequence(withTiming(1.035, { duration: 110 }), withSpring(1, { damping: 8, stiffness: 260 }));
  }, [on, sc]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  return (
    <Bounce onPress={onPress} scaleTo={0.97} testID={testID}>
      <Animated.View style={[styles.plan, on ? styles.planOn : styles.planOff, a]}>
        {best && (
          <View style={styles.best}>
            <Text style={styles.bestText}>BEST VALUE</Text>
          </View>
        )}
        <Text style={[styles.planTitle, !on && { color: '#7FD9E3' }]}>{title}</Text>
        <Text style={[styles.planSub, !on && { color: colors.muted }]}>{sub}</Text>
        {on && (
          <View style={styles.planCheck}>
            <CheckMark size={26} />
          </View>
        )}
      </Animated.View>
    </Bounce>
  );
}

/** Paywall reachable from settings; purchases are simulated. */
export function PremiumScreen() {
  const { update } = useStore();
  const nav = useNav();
  const [plan, setPlan] = useState<'monthly' | 'lifetime'>('lifetime');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const buy = () => {
    if (busy) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setDone(true);
    }, 1600);
  };
  const finish = () => {
    update({ premium: { plan, since: Date.now() } });
    nav.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen chrome="close" testID="premium">
        <View style={styles.hero}>
          <HopFrog id="tearex" width={92} delay={0} />
          <View style={{ marginHorizontal: -10, zIndex: 2 }}>
            <HopFrog id="bear" width={112} delay={140} />
          </View>
          <HopFrog id="sloth" width={92} delay={280} />
        </View>
        <RotatingLine />
        <Animated.Text entering={FadeInDown.delay(200).springify()} style={styles.title}>
          Become a hydration hero!
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(280).springify()}>
          <PlanCard on={plan === 'monthly'} title="Monthly" sub="$3.99 per month, cancel any time" onPress={() => setPlan('monthly')} testID="plan-monthly" />
          <PlanCard on={plan === 'lifetime'} title="Lifetime, pay once" sub="$8.99 • no recurring payments" best onPress={() => setPlan('lifetime')} testID="plan-lifetime" />
          <Bounce onPress={buy} style={styles.buy} testID="premium-buy">
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buyText}>Get All Features</Text>}
          </Bounce>
          <Text style={styles.note}>Simulated purchase, no money is charged.</Text>
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(360).springify()} style={styles.section}>
          What you get
        </Animated.Text>
        <FeatureList delay={400} />
      </Screen>
      <Dialog
        visible={done}
        title="You’re all set"
        message="Your purchase was successful."
        icon={
          <Animated.View entering={ZoomIn.springify()} style={{ marginBottom: 8 }}>
            <CheckMark size={34} />
          </Animated.View>
        }
        actions={[{ label: 'OK', onPress: finish }]}
        onClose={() => setDone(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', height: 150, marginTop: 4 },
  lineBox: { height: 24, overflow: 'hidden', alignItems: 'center', marginTop: 8 },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  line: { fontFamily: fonts.bold, fontSize: 14, color: colors.purple },
  title: { fontFamily: fonts.extra, fontSize: 24, color: colors.ink, textAlign: 'center', marginTop: 2, marginBottom: 22 },
  plan: { borderRadius: 20, paddingVertical: 18, paddingLeft: 22, paddingRight: 18, marginBottom: 12, borderWidth: 2.5, overflow: 'visible' },
  planOn: { borderColor: colors.water, backgroundColor: '#fff' },
  planOff: { borderColor: '#E3F7FA', backgroundColor: '#E3F7FA' },
  planTitle: { fontFamily: fonts.extra, fontSize: 20, color: colors.water },
  planSub: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink, marginTop: 2 },
  planCheck: { position: 'absolute', left: -14, top: '50%', marginTop: -13 },
  best: { position: 'absolute', right: -2.5, top: -2.5, backgroundColor: colors.water, borderTopRightRadius: 20, borderBottomLeftRadius: 14, paddingHorizontal: 12, paddingVertical: 5 },
  bestText: { fontFamily: fonts.black, fontSize: 11, color: '#fff', letterSpacing: 0.6 },
  buy: { backgroundColor: colors.water, borderRadius: 999, height: 64, alignItems: 'center', justifyContent: 'center', marginTop: 6, shadowColor: colors.water, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  buyText: { fontFamily: fonts.extra, fontSize: 21, color: '#fff' },
  note: { fontFamily: fonts.semibold, fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 10 },
  section: { fontFamily: fonts.extra, fontSize: 24, color: colors.ink, textAlign: 'center', marginTop: 30, marginBottom: 18 },
});
