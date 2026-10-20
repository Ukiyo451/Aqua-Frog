import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Extrapolation, FadeInDown, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { Bounce, PillButton } from '../../components/Pressable';
import { ActionSheet, Dialog, DialogAction } from '../../components/ui';
import { challengeById } from '../../lib/challenges';
import { useStore } from '../../lib/store';
import { ScreenProps, useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { CardDecor, CheckGlyph, eyebrowFor, PeekingFrog, ShareGlyph, tint, useChallengeParam } from './common';
import { activeProgress, limitedWindow } from './progress';

const HEADER = 300;

function MoreIcon() {
  return (
    <Svg width={16} height={4} viewBox="0 0 16 4">
      <Circle cx={2} cy={2} r={1.8} fill="#fff" />
      <Circle cx={8} cy={2} r={1.8} fill="#fff" />
      <Circle cx={14} cy={2} r={1.8} fill="#fff" />
    </Svg>
  );
}

function CloseX() {
  return (
    <Svg width={11} height={11} viewBox="0 0 12 12">
      <Path d="M1.5 1.5 L10.5 10.5 M10.5 1.5 L1.5 10.5" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

/** Light card colours need their deeper shade for headings on white. */
function headingColor(color: string, deep: string): string {
  const n = parseInt(color.slice(1), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.62 ? deep : color;
}

type Ask = 'switch' | 'giveUp' | 'hideActive' | null;

/** The challenge page: coloured header with the frog, rules, benefits and tips, and START NOW. */
export function ChallengeDetail({ params }: ScreenProps<{ id?: string }>) {
  const c = useChallengeParam(params.id);
  const { state, update } = useStore();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const [sheet, setSheet] = useState(false);
  const [ask, setAsk] = useState<Ask>(null);

  const progress = activeProgress(state);
  const active = progress?.challenge.id === c.id ? progress : undefined;
  const other = state.challenge.activeId && state.challenge.activeId !== c.id ? challengeById(state.challenge.activeId) : undefined;
  const heading = headingColor(c.color, c.deep);
  const headerH = HEADER + insets.top;

  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });
  const headerAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value < 0 ? y.value : y.value * 0.45 }],
  }));
  const headerContent = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, headerH * 0.55], [1, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(y.value, [-120, 0, headerH], [1.06, 1, 0.92], Extrapolation.CLAMP) }],
  }));
  const strip = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [headerH - 150, headerH - 70], [0, 1], Extrapolation.CLAMP) }));

  const start = () => {
    update((s) => ({ challenge: { ...s.challenge, activeId: c.id, startDay: s.day } }));
    nav.replace('challengeStarted', { id: c.id });
  };
  const onStart = () => (other ? setAsk('switch') : start());

  const actions: DialogAction[] = [];
  if (active) actions.push({ label: 'Give up', style: 'destructive', onPress: () => setAsk('giveUp') });
  actions.push({ label: 'Tell Friends', onPress: () => nav.push('challengeShare', { id: c.id }) });
  if (c.limited)
    actions.push({
      label: 'Hide from Home screen',
      onPress: () => {
        if (active) setAsk('hideActive');
        else {
          update((s) => ({ challenge: { ...s.challenge, hideLimited: true } }));
          nav.toast('Hidden from the Home screen');
          nav.back();
        }
      },
    });

  const tagline = c.limited ? `${limitedWindow().label}. ${c.tagline}` : c.tagline;

  return (
    <View style={styles.root} testID="challenge-detail">
      <View style={[styles.overscroll, { backgroundColor: c.color }]} />
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}>
        <Animated.View style={[styles.header, { height: headerH, backgroundColor: c.color }, headerAnim]}>
          <CardDecor seed={c.id.length * 3} />
          <PeekingFrog c={c} width={200} style={{ right: -34, top: insets.top + 78 }} />
          <Animated.View style={[styles.headerText, { paddingTop: insets.top + 62 }, headerContent]}>
            <Animated.Text entering={FadeInDown.delay(60).springify().damping(16)} style={[styles.eyebrow, { color: c.deep }]}>
              {eyebrowFor(c)}
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(110).springify().damping(16)} style={styles.title}>
              {c.title}
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(160).springify().damping(16)} style={styles.tagline}>
              {tagline}
            </Animated.Text>
            <Animated.View entering={FadeInDown.delay(220).springify().damping(16)}>
              <Bounce onPress={() => nav.push('challengeShare', { id: c.id })} style={[styles.tell, { backgroundColor: c.deep }]} testID="challenge-tell">
                <ShareGlyph size={17} />
                <Text style={styles.tellText}>TELL FRIENDS</Text>
              </Bounce>
            </Animated.View>
          </Animated.View>
        </Animated.View>

        <View style={styles.body}>
          <Animated.Text entering={FadeInDown.delay(200)} style={styles.paragraph}>
            {c.intro}
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(260)} style={[styles.rule, { backgroundColor: tint(c.color, 0.86) }]}>
            <Text style={[styles.ruleLabel, { color: heading }]}>THE RULES</Text>
            <Text style={styles.ruleText}>
              Finish your hydration goal every day for {c.days} days.{c.rule ? ` ${c.rule}` : ''}
            </Text>
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(300)} style={[styles.h2, { color: heading }]}>
            Benefits
          </Animated.Text>
          {c.benefits.map((b, i) => (
            <Animated.Text key={i} entering={FadeInDown.delay(320 + i * 40)} style={styles.paragraph}>
              {b.emoji} {b.text}
            </Animated.Text>
          ))}

          <Text style={[styles.h2, { color: heading }]}>{c.tips.length} tips to succeed</Text>
          {c.tips.map((t, i) => (
            <View key={i} style={styles.tip}>
              <View style={[styles.num, { backgroundColor: c.color }]}>
                <Text style={styles.numText}>{i + 1}</Text>
              </View>
              <Text style={[styles.paragraph, styles.tipText]}>{t}</Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>

      <Animated.View style={[styles.strip, { height: insets.top + 52, backgroundColor: c.color }, strip]} pointerEvents="none" />
      <View style={[styles.bar, { top: insets.top + 10 }]} pointerEvents="box-none">
        <Bounce onPress={() => setSheet(true)} style={styles.roundBtn} testID="challenge-more">
          <MoreIcon />
        </Bounce>
        <Bounce onPress={nav.back} style={styles.roundBtn} testID="close">
          <CloseX />
        </Bounce>
      </View>

      <View style={[styles.footer, { bottom: insets.bottom + 24 }]} pointerEvents="box-none">
        {active ? (
          <Animated.View key="left" entering={ZoomIn.springify().damping(14)}>
            <Bounce
              onPress={() => nav.toast(`Day ${active.dayNumber} of ${c.days}. Keep it up!`)}
              style={[styles.leftPill, { backgroundColor: tint(c.color, 0.78) }]}
              testID="challenge-days-left"
            >
              <CheckGlyph color={c.deep} size={20} />
              <Text style={[styles.leftText, { color: c.deep }]}>
                {active.daysLeft} {active.daysLeft === 1 ? 'DAY' : 'DAYS'} LEFT
              </Text>
            </Bounce>
          </Animated.View>
        ) : (
          <Animated.View key="start" entering={ZoomIn.springify().damping(14)}>
            <PillButton label="START NOW" onPress={onStart} style={styles.startBtn} testID="challenge-start" />
          </Animated.View>
        )}
      </View>

      <ActionSheet visible={sheet} actions={actions} onClose={() => setSheet(false)} />
      <Dialog
        visible={ask === 'switch'}
        title="Switch challenge?"
        message={`You're in the middle of ${other?.title}. Starting ${c.title} will end it.`}
        actions={[{ label: 'Cancel', style: 'cancel' }, { label: 'Switch', onPress: start }]}
        onClose={() => setAsk(null)}
      />
      <Dialog
        visible={ask === 'giveUp'}
        title="Give up?"
        message="Your progress in this challenge will be lost. You can start it again anytime."
        actions={[
          { label: 'Cancel', style: 'cancel' },
          {
            label: 'Give up',
            style: 'destructive',
            onPress: () => {
              update((s) => ({ challenge: { ...s.challenge, activeId: undefined, startDay: undefined } }));
              nav.toast('Challenge ended');
            },
          },
        ]}
        onClose={() => setAsk(null)}
      />
      <Dialog
        visible={ask === 'hideActive'}
        title="Challenge in progress"
        message="This challenge is currently active. You need to end it before you can hide it."
        actions={[{ label: 'OK' }]}
        onClose={() => setAsk(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  overscroll: { position: 'absolute', left: 0, right: 0, top: 0, height: 300 },
  header: { overflow: 'hidden' },
  headerText: { paddingHorizontal: 24, paddingRight: 140 },
  eyebrow: { fontFamily: fonts.black, fontSize: 12, letterSpacing: 1, marginBottom: 4 },
  title: { fontFamily: fonts.extra, fontSize: 38, lineHeight: 42, color: '#fff' },
  tagline: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 21, color: 'rgba(255,255,255,0.82)', marginTop: 8 },
  tell: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 20, paddingVertical: 12, marginTop: 18 },
  tellText: { fontFamily: fonts.black, fontSize: 14, color: '#fff', letterSpacing: 0.6 },
  body: { backgroundColor: colors.bg, paddingHorizontal: 24, paddingTop: 28 },
  paragraph: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 26, color: colors.inkSoft, marginBottom: 16 },
  rule: { borderRadius: 20, padding: 16, marginBottom: 8, marginTop: 4 },
  ruleLabel: { fontFamily: fonts.black, fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  ruleText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 21, color: colors.ink },
  h2: { fontFamily: fonts.extra, fontSize: 30, marginTop: 22, marginBottom: 14 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  num: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 14, marginTop: 1 },
  numText: { fontFamily: fonts.black, fontSize: 15, color: '#fff' },
  tipText: { flex: 1 },
  strip: { position: 'absolute', left: 0, right: 0, top: 0 },
  bar: { position: 'absolute', left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between' },
  roundBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.28)', alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  startBtn: { minWidth: 220 },
  leftPill: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 999, paddingVertical: 17, paddingHorizontal: 36 },
  leftText: { fontFamily: fonts.black, fontSize: 17, letterSpacing: 0.4 },
});
