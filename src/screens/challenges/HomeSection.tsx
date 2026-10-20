import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Bounce } from '../../components/Pressable';
import { Challenge, CHALLENGES } from '../../lib/challenges';
import { useStore } from '../../lib/store';
import { useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { ChallengeCard, CheckGlyph, tint, TrophyGlyph } from './common';
import { activeProgress, ALL_YEAR, ChallengeProgress, limitedWindow, LIMITED } from './progress';

function LimitedCard({ c, active }: { c: Challenge; active?: ChallengeProgress }) {
  const nav = useNav();
  const open = () => nav.modal('challenge', { id: c.id });
  return (
    <Animated.View entering={FadeInDown.springify().damping(16)} style={styles.frame}>
      <Text style={styles.frameTitle}>Limited-Time Challenge</Text>
      <Bounce onPress={open} scaleTo={0.97} testID="limited-card">
        <ChallengeCard
          c={c}
          height={360}
          titleSize={34}
          frogWidth={210}
          textRight={128}
          frogStyle={{ right: -62, top: 118 }}
          style={styles.limited}
          footer={
            <View style={styles.limitedFoot}>
              {active ? (
                <Animated.View key="left" entering={ZoomIn.springify().damping(14)} style={[styles.leftPill, { backgroundColor: c.deep }]}>
                  <CheckGlyph color={tint(c.color, 0.6)} check={c.deep} size={18} />
                  <Text style={[styles.leftText, { color: tint(c.color, 0.7) }]}>
                    {active.daysLeft} {active.daysLeft === 1 ? 'DAY' : 'DAYS'} LEFT
                  </Text>
                </Animated.View>
              ) : (
                <Bounce onPress={open} style={styles.startPill} testID="limited-start">
                  <Text style={styles.startText}>START NOW</Text>
                </Bounce>
              )}
              <Text style={[styles.rules, { color: tint(c.deep, 0.45) }]}>SEE CHALLENGE RULES</Text>
            </View>
          }
        >
          <Text style={styles.limitedSub}>
            {limitedWindow().label}. {c.tagline}
          </Text>
        </ChallengeCard>
      </Bounce>
    </Animated.View>
  );
}

/** Home screen challenges: the limited-time banner, the n/10 trophy line and the all-year cards. */
export function ChallengeSection() {
  const { state } = useStore();
  const nav = useNav();
  const progress = activeProgress(state);
  const done = state.challenge.completed;
  const showLimited = !!LIMITED && !state.challenge.hideLimited && !done.includes(LIMITED.id);
  const doneCount = CHALLENGES.filter((x) => done.includes(x.id)).length;

  return (
    <View style={styles.section} testID="challenge-section">
      {showLimited && LIMITED && <LimitedCard c={LIMITED} active={progress?.challenge.id === LIMITED.id ? progress : undefined} />}
      <Animated.View entering={FadeInDown.delay(80)} style={styles.trophy}>
        <TrophyGlyph />
        <Text style={styles.trophyText}>
          Complete all challenges {doneCount}/{CHALLENGES.length}
        </Text>
      </Animated.View>
      {ALL_YEAR.map((c, i) => {
        const active = progress?.challenge.id === c.id ? progress : undefined;
        const finished = done.includes(c.id);
        return (
          <Animated.View key={c.id} entering={FadeInDown.delay(120 + i * 60).springify().damping(16)}>
            <Bounce onPress={() => nav.modal('challenge', { id: c.id })} scaleTo={0.96} testID={`challenge-card-${c.id}`}>
              <ChallengeCard
                c={c}
                height={active ? 176 : 150}
                top={
                  active ? (
                    <View style={[styles.strip, { backgroundColor: tint(c.color, 0.8) }]}>
                      <CheckGlyph color={c.deep} size={15} />
                      <Text style={[styles.stripText, { color: c.deep }]} numberOfLines={1}>
                        {c.title}
                      </Text>
                      <Text style={[styles.stripDays, { color: c.deep }]}>{active.daysLeft}d</Text>
                    </View>
                  ) : finished ? (
                    <View style={[styles.badge, { backgroundColor: c.deep }]}>
                      <CheckGlyph color="#fff" check={c.deep} size={13} />
                      <Text style={styles.badgeText}>COMPLETED</Text>
                    </View>
                  ) : undefined
                }
              />
            </Bounce>
          </Animated.View>
        );
      })}
    </View>
  );
}

/** Slim pill for the bottom of Home showing the running challenge and days left. */
export function ActiveChallengePill() {
  const { state } = useStore();
  const nav = useNav();
  const p = activeProgress(state);
  if (!p || p.status !== 'active') return null;
  const c = p.challenge;
  return (
    <Animated.View entering={FadeInDown.springify().damping(15)}>
      <Bounce onPress={() => nav.modal('challenge', { id: c.id })} style={[styles.pill, { backgroundColor: tint(c.color, 0.78) }]} scaleTo={0.96} testID="active-challenge-pill">
        <CheckGlyph color={c.deep} size={17} />
        <Text style={[styles.pillTitle, { color: c.deep }]} numberOfLines={1}>
          {c.title}
        </Text>
        <Text style={[styles.pillDays, { color: c.deep }]}>{p.daysLeft}d</Text>
      </Bounce>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 16, gap: 10 },
  frame: { backgroundColor: '#273142', borderRadius: 34, padding: 8, paddingTop: 0, marginBottom: 14 },
  frameTitle: { fontFamily: fonts.extra, fontSize: 15, color: '#fff', textAlign: 'center', paddingVertical: 13 },
  limited: { borderRadius: 28 },
  limitedSub: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 21, color: 'rgba(255,255,255,0.85)', marginTop: 10 },
  limitedFoot: { alignItems: 'center', paddingBottom: 18, marginTop: 'auto' },
  startPill: { backgroundColor: colors.ink, borderRadius: 999, paddingVertical: 17, paddingHorizontal: 34 },
  startText: { fontFamily: fonts.extra, fontSize: 17, color: '#fff', letterSpacing: 0.3 },
  leftPill: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 999, paddingVertical: 16, paddingHorizontal: 30 },
  leftText: { fontFamily: fonts.black, fontSize: 16, letterSpacing: 0.4 },
  rules: { fontFamily: fonts.black, fontSize: 11, letterSpacing: 0.8, marginTop: 14 },
  trophy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  trophyText: { fontFamily: fonts.bold, fontSize: 15, color: colors.muted },
  strip: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginLeft: 16, marginTop: 14, marginBottom: -8, borderRadius: 999, paddingVertical: 5, paddingLeft: 6, paddingRight: 12, maxWidth: '62%' },
  stripText: { fontFamily: fonts.extra, fontSize: 13, flexShrink: 1 },
  stripDays: { fontFamily: fonts.black, fontSize: 13 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginLeft: 16, marginTop: 14, marginBottom: -8, borderRadius: 999, paddingVertical: 4, paddingLeft: 4, paddingRight: 10 },
  badgeText: { fontFamily: fonts.black, fontSize: 10, color: '#fff', letterSpacing: 0.8 },
  pill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 22, marginHorizontal: 16 },
  pillTitle: { fontFamily: fonts.extra, fontSize: 16, flexShrink: 1 },
  pillDays: { fontFamily: fonts.black, fontSize: 15, marginLeft: 10 },
});
