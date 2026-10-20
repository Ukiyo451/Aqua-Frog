import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bounce } from '../../components/Pressable';
import { ScreenProps, useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { ChallengeCard, DropConfetti, ShareGlyph, useChallengeParam } from './common';

/** "Today's your 1st day!" right after starting a challenge. */
export function ChallengeStarted({ params }: ScreenProps<{ id?: string }>) {
  const c = useChallengeParam(params.id);
  const nav = useNav();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 70, paddingBottom: insets.bottom + 28 }]} testID="challenge-started">
      <Animated.Text entering={FadeInDown.delay(80).springify().damping(15)} style={styles.title}>
        Today&apos;s your 1st day!
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(160).springify().damping(15)} style={styles.sub}>
        Finish your hydration goal daily & follow the challenge rules to keep going!
      </Animated.Text>

      <View style={{ flex: 1 }} />
      <Animated.View entering={ZoomIn.delay(260).springify().damping(11).stiffness(140)} style={styles.cardWrap}>
        <ChallengeCard c={c} height={210} titleSize={32} frogWidth={210}>
          {c.rule ? <Text style={styles.rule}>{c.rule}</Text> : null}
        </ChallengeCard>
      </Animated.View>

      <View style={{ flex: 1.3 }} />
      <Animated.View entering={FadeInDown.delay(520).springify().damping(15)} style={styles.actions}>
        <Bounce onPress={() => nav.push('challengeShare', { id: c.id })} style={styles.tell} testID="started-tell">
          <ShareGlyph size={18} />
          <Text style={styles.tellText}>TELL FRIENDS</Text>
        </Bounce>
        <Bounce onPress={nav.back} style={styles.done} testID="started-done">
          <Text style={styles.doneText}>DONE</Text>
        </Bounce>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(300)} style={StyleSheet.absoluteFill} pointerEvents="none">
        <DropConfetti />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },
  title: { fontFamily: fonts.extra, fontSize: 32, color: colors.ink, textAlign: 'center' },
  sub: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, color: colors.muted, textAlign: 'center', marginTop: 10, paddingHorizontal: 12 },
  cardWrap: { marginVertical: 20 },
  rule: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 19, color: 'rgba(255,255,255,0.85)', marginTop: 8 },
  actions: { alignItems: 'center' },
  tell: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.ink, borderRadius: 999, paddingVertical: 18, paddingHorizontal: 38 },
  tellText: { fontFamily: fonts.extra, fontSize: 17, color: '#fff', letterSpacing: 0.3 },
  done: { paddingVertical: 16, paddingHorizontal: 30, marginTop: 6 },
  doneText: { fontFamily: fonts.black, fontSize: 15, color: colors.muted, letterSpacing: 0.8 },
});
