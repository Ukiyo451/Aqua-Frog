import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { FrogAvatar } from '../../components/Frogs';
import { HeaderPill, Screen } from '../../components/ui';
import { colors, fonts } from '../../theme';

const RELEASES = [
  { date: 'Oct 2026', version: '2.0', emoji: '🐸', title: 'Meet Lily’s frog friends' },
  { date: 'Aug 2026', version: '1.8', emoji: '⌚️', title: 'Apple Watch designs and faster sync' },
  { date: 'Jun 2026', version: '1.6', emoji: '🧪', title: 'Custom drinks with your own caffeine and hydration' },
  { date: 'Apr 2026', version: '1.4', emoji: '📅', title: 'Edit past days and add missed drinks' },
  { date: 'Feb 2026', version: '1.2', emoji: '🔔', title: 'Smart reminders that only nudge when you forget' },
  { date: 'Jan 2026', version: '1.0', emoji: '💧', title: 'Hello, Lily! The first release' },
];

const CARDS = [
  { color: '#2FAE7E', rot: -14, x: -78, y: 16, label: '5-DAY', frog: 'fresh' },
  { color: '#FF8A3D', rot: 12, x: 78, y: 16, label: '7-DAY', frog: 'puffin' },
  { color: '#8E3BE8', rot: 0, x: 0, y: 0, label: '10-DAY', frog: 'tearex' },
];

function FanCard({ i, color, rot, x, y, label, frog }: { i: number; color: string; rot: number; x: number; y: number; label: string; frog: string }) {
  const t = useSharedValue(0);
  const peek = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(200 + i * 220, withSpring(1, { damping: 11, stiffness: 140 }));
    peek.value = withDelay(900 + i * 220, withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })), -1));
  }, [t, peek, i]);
  const card = useAnimatedStyle(() => ({
    opacity: Math.min(1, t.value * 1.5),
    transform: [{ translateX: x * t.value }, { translateY: y + (1 - t.value) * 120 }, { rotate: `${rot * t.value}deg` }],
  }));
  const face = useAnimatedStyle(() => ({ transform: [{ translateY: -peek.value * 6 }] }));
  return (
    <Animated.View style={[styles.card, card]}>
      <Animated.View style={[styles.peek, face]}>
        <FrogAvatar id={frog} size={96} />
      </Animated.View>
      <View style={[styles.front, { backgroundColor: color }]}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardTitle}>CHALLENGE</Text>
        <View style={styles.cardBar} />
        <View style={[styles.cardBar, { width: '50%' }]} />
      </View>
    </Animated.View>
  );
}

export function WhatsNewScreen() {
  const [all, setAll] = useState(false);
  const latest = RELEASES[0];
  return (
    <Screen testID="whatsNew">
      <Animated.View entering={FadeInDown.springify()}>
        <Text style={styles.title}>What’s new</Text>
        <View style={styles.chips}>
          <View style={styles.lang}>
            <Text style={styles.langText}>EN</Text>
          </View>
          <HeaderPill label={all ? 'LATEST' : 'ALL UPDATES'} color={colors.water} bg={colors.waterLight} onPress={() => setAll(!all)} testID="whatsnew-all" />
        </View>
      </Animated.View>
      {all && (
        <Animated.View entering={FadeInDown.springify()} exiting={FadeOutUp.duration(160)} style={styles.list}>
          {RELEASES.map((r, i) => (
            <Animated.View key={r.version} entering={FadeInDown.delay(i * 45).springify()} style={[styles.release, i > 0 && styles.releaseLine]}>
              <Text style={styles.releaseEmoji}>{r.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.releaseMeta}>
                  {r.date} • v{r.version}
                </Text>
                <Text style={styles.releaseTitle}>{r.title}</Text>
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      )}
      <Animated.View layout={LinearTransition.springify().damping(18)} entering={FadeInDown.delay(100).springify()} style={styles.releaseCard}>
        <Text style={styles.meta}>
          {latest.date} • Version {latest.version}
        </Text>
        <Text style={styles.headline}>Meet Lily’s frog friends</Text>
        <Text style={styles.body}>
          Lily isn’t alone in the pond any more. Finish your goal to collect a new daily frog, take on healthy challenges to win the rare ones, and let Shuffle pick a different friend for you each morning.
        </Text>
        <View style={styles.fan}>
          {CARDS.map((c, i) => (
            <FanCard key={c.color} i={i} {...c} />
          ))}
        </View>
        <Text style={styles.body}>Also new: a fresh look for the calendar, gentler reminder sounds and lots of small fixes.</Text>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.black, fontSize: 34, color: colors.ink, marginTop: 4 },
  chips: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 16 },
  lang: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F2F3F5' },
  langText: { fontFamily: fonts.black, fontSize: 11, color: colors.inkSoft, letterSpacing: 0.8 },
  list: { backgroundColor: '#F7F8FA', borderRadius: 20, paddingHorizontal: 16, marginBottom: 16 },
  release: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  releaseLine: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E1E4E9' },
  releaseEmoji: { fontSize: 22 },
  releaseMeta: { fontFamily: fonts.black, fontSize: 11, color: colors.muted, letterSpacing: 0.6 },
  releaseTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink, marginTop: 1 },
  releaseCard: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E1E4E9', paddingTop: 16 },
  meta: { fontFamily: fonts.black, fontSize: 12, color: colors.muted, letterSpacing: 0.6 },
  headline: { fontFamily: fonts.black, fontSize: 30, color: colors.water, lineHeight: 35, marginTop: 6, marginBottom: 10 },
  body: { fontFamily: fonts.semibold, fontSize: 16, color: colors.inkSoft, lineHeight: 24 },
  fan: { height: 250, alignItems: 'center', justifyContent: 'flex-end', marginVertical: 18, paddingBottom: 6 },
  card: { position: 'absolute', bottom: 10, width: 140, height: 210, alignItems: 'center' },
  peek: { position: 'absolute', top: 0 },
  front: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 50, borderRadius: 22, padding: 14, justifyContent: 'flex-end', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  cardLabel: { fontFamily: fonts.black, fontSize: 11, color: 'rgba(255,255,255,0.75)', letterSpacing: 1 },
  cardTitle: { fontFamily: fonts.black, fontSize: 18, color: '#fff' },
  cardBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)', marginTop: 8, width: '80%' },
});
