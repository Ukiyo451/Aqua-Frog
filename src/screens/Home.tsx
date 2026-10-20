import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddSipOverlay } from '../components/AddSipOverlay';
import { BottomSheet } from '../components/BottomSheet';
import Svg, { Path } from 'react-native-svg';
import { DrinkButton } from '../components/DrinkButton';
import { Confetti, useCountUp } from '../components/effects';
import { Frog, FrogAvatar } from '../components/Frogs';
import { WavesIcon } from '../components/Icons';
import { Bounce, PillButton } from '../components/Pressable';
import { CHARACTER_BY_ID } from '../lib/characters';
import { formatAmount, toDisplay } from '../lib/hydration';
import { useStore } from '../lib/store';
import { useNav } from '../navigation/nav';
import { colors, fonts } from '../theme';
import { ActiveChallengePill, ChallengeSection, useChallengeWatcher } from './challenges';
import { CelebrateButton, goalDayTitle, LayeredFrog } from './history';
import { SupporterCard } from './info';
import { playSound, setSoundsEnabled } from './settings';

const { width: SW, height: SH } = Dimensions.get('window');

const TIPS = [
  'Keep a glass by your bed and drink it as soon as you wake up — Lily does!',
  'Feeling hungry between meals? Try a glass of water first; thirst often hides as hunger.',
  'Add lemon, mint or cucumber to your water for a pond-fresh twist.',
  'Eat your water: watermelon, cucumber and oranges are over 85% water.',
  'Drink a glass before every meal to hit your goal without thinking about it.',
];

/** What Lily says about how she feels, from parched to fully hydrated. */
function moodLine(progress: number, name = 'Lily'): string {
  if (progress >= 1) return `${name} is fully hydrated and glowing!`;
  if (progress >= 0.75) return `Almost there, ${name} feels great`;
  if (progress >= 0.4) return `${name} is perking up`;
  if (progress > 0) return `${name} is still thirsty`;
  return `${name} is parched… give them a sip`;
}

/** The day-streak badge: a circle that unrolls into "1 day" and tucks back in. */
function StreakBadge({ streak, done, onPress }: { streak: number; done: boolean; onPress: () => void }) {
  const open = useSharedValue(0);
  useEffect(() => {
    open.value = withSequence(withDelay(500, withSpring(1, { damping: 14 })), withDelay(2200, withSpring(0, { damping: 16 })));
  }, [open]);
  const style = useAnimatedStyle(() => ({ width: 34 + open.value * 40 }));
  const label = useAnimatedStyle(() => ({ opacity: open.value }));
  return (
    <Bounce onPress={onPress} testID="streak">
      <Animated.View style={[styles.streak, done && { backgroundColor: colors.frogDark }, style]}>
        <Text style={styles.streakNum}>{streak}</Text>
        <Animated.Text style={[styles.streakDay, label]} numberOfLines={1}>
          day{streak === 1 ? '' : 's'}
        </Animated.Text>
      </Animated.View>
    </Bounce>
  );
}

function TipsPill() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(() => new Date().getDate() % TIPS.length);
  return (
    <Bounce onPress={() => (open ? setI((n) => (n + 1) % TIPS.length) : setOpen(true))} scaleTo={0.97} testID="tips">
      <View style={styles.tips}>
        <View style={styles.tipsHead}>
          <Text style={styles.tipsCount}>{open ? `${i + 1}/${TIPS.length}` : `0/${TIPS.length}`}</Text>
          <Text style={styles.tipsTitle}>Today's tips</Text>
          <View style={styles.tipsDots}>
            {[colors.water, colors.purpleSoft, colors.sun].map((c, k) => (
              <View key={k} style={[styles.tipsDot, { backgroundColor: c, marginLeft: k ? -6 : 0 }]} />
            ))}
          </View>
        </View>
        {open && (
          <Animated.Text key={i} entering={FadeIn} style={styles.tipText}>
            {TIPS[i]}
          </Animated.Text>
        )}
      </View>
    </Bounce>
  );
}

/** Small dismissible hint cards under the challenges, like WaterLlama's "Shake to undo". */
const HINTS = [
  { id: 'hint-undo', title: 'Undo a drink', text: 'Tap the streak badge (top left) to open your calendar, then delete or add missed drinks.', color: '#FFF4E0', ink: '#F0A020', icon: 'undo' },
  { id: 'hint-shuffle', title: 'Shuffle frogs', text: 'Tap the frog next to your drinks and turn on "Shuffle" to meet a different friend every day.', color: '#E6F8EE', ink: '#3FB46B', icon: 'shuffle' },
] as const;

function HintCard({ hint, onHide }: { hint: (typeof HINTS)[number]; onHide: () => void }) {
  return (
    <Animated.View entering={FadeInDown.springify().damping(16)} exiting={ZoomOut.duration(200)} style={[styles.hint, { backgroundColor: hint.color }]}>
      <View style={[styles.hintIcon, { backgroundColor: hint.ink }]}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
          {hint.icon === 'undo' ? (
            <Path d="M8 7 L4 11 L8 15 M4 11 H14 Q19 11 19 16 Q19 20 15 20" stroke="#fff" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <Path d="M4 7 H8 Q11 7 13 12 Q15 17 18 17 H20 M17 14 L20 17 L17 20 M4 17 H8 Q9.5 17 10.5 15.5 M13.5 8.5 Q14.5 7 16 7 H20 M17 4 L20 7 L17 10" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </Svg>
      </View>
      <Text style={[styles.hintTitle, { color: hint.ink }]}>{hint.title}</Text>
      <Text style={styles.hintText}>{hint.text}</Text>
      <Bounce onPress={onHide} testID={`${hint.id}-hide`}>
        <Text style={styles.hintHide}>HIDE TIP</Text>
      </Bounce>
    </Animated.View>
  );
}

export function Home() {
  const insets = useSafeAreaInsets();
  const nav = useNav();
  const { state, update, addDrink, intakeMl, streak, drink: drinkById } = useStore();
  const [showRemaining, setShowRemaining] = useState(false);
  const [pouring, setPouring] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(0);
  const [askWeek, setAskWeek] = useState(false);
  const flip = useSharedValue(1);
  useChallengeWatcher();

  useEffect(() => {
    setSoundsEnabled(state.settings.sounds);
  }, [state.settings.sounds]);

  useEffect(() => {
    if (state.weekStart) return;
    const t = setTimeout(() => setAskWeek(true), 1200);
    return () => clearTimeout(t);
  }, [state.weekStart]);

  const goal = state.goals[state.day] ?? state.goalMl;
  const progress = Math.min(1, intakeMl / goal);
  const remaining = Math.max(0, goal - intakeMl);
  const pct = Math.floor((intakeMl / goal) * 100);
  const done = intakeMl >= goal;
  const shownIntake = useCountUp(toDisplay(intakeMl, state.units));
  const shownRemaining = useCountUp(toDisplay(remaining, state.units));
  const pour = pouring ? drinkById(pouring) : null;

  const toggle = () => {
    flip.value = withSequence(withTiming(0.85, { duration: 110 }), withSpring(1, { damping: 7 }));
    setShowRemaining((v) => !v);
  };

  const onAdd = (ml: number) => {
    if (!pour) return;
    const before = intakeMl;
    const entry = addDrink(pour.id, ml);
    setPouring(null);
    setShowRemaining(false);
    playSound('sip');
    // Lily gives a little happy squish as the drink lands
    flip.value = withDelay(250, withSequence(withTiming(1.06, { duration: 160 }), withSpring(1, { damping: 6 })));
    if (before < goal && before + entry.hydrationMl >= goal) {
      setCelebrate((n) => n + 1);
      setTimeout(() => playSound('goal'), 500);
    }
  };

  const frogStyle = useAnimatedStyle(() => ({ transform: [{ scale: flip.value }] }));
  const frogWidth = Math.min(SW * 0.8, SH * 0.34);
  const hints = HINTS.filter((h) => !state.hiddenCards.includes(h.id));

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 90 }} testID="home-scroll">
        <View style={[styles.fold, { minHeight: SH - insets.bottom - 64, paddingTop: insets.top + 6 }]}>
          <View style={styles.top}>
            <StreakBadge streak={streak} done={done} onPress={() => nav.modal('calendar')} />
            <Bounce onPress={() => nav.push('settings')} style={styles.menu} testID="menu">
              <WavesIcon color={colors.pink} />
            </Bounce>
          </View>

          <Bounce onPress={toggle} scaleTo={0.96} haptic style={styles.header} testID="header">
            {showRemaining ? (
              <Animated.View key="remaining" entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)} style={{ alignItems: 'center' }}>
                <Text style={[styles.amount, { color: colors.ink }]}>
                  {shownRemaining}
                  {state.units}
                </Text>
                <Text style={styles.caption}>Remaining · {Math.max(0, 100 - pct)}% of your goal</Text>
              </Animated.View>
            ) : done ? (
              <Animated.View key="done" entering={ZoomIn.springify().damping(12)} exiting={FadeOut.duration(120)} style={{ alignItems: 'center' }}>
                <Text style={styles.doneTitle} numberOfLines={1} adjustsFontSizeToFit testID="intake">
                  {goalDayTitle(state.day)}
                </Text>
                <Text style={styles.caption}>
                  {formatAmount(intakeMl, state.units)} hydration · {pct}% of your goal
                </Text>
              </Animated.View>
            ) : (
              <Animated.View key="intake" entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)} style={{ alignItems: 'center' }}>
                <Text style={styles.amount} testID="intake">
                  {shownIntake}
                  {state.units}
                </Text>
                <Text style={styles.caption}>Hydration · {pct}% of your goal</Text>
              </Animated.View>
            )}
          </Bounce>

          <Bounce onPress={toggle} scaleTo={0.97} style={styles.stage} haptic={false}>
            <Animated.View style={frogStyle}>
              {showRemaining ? (
                <Animated.View key="gauge" entering={FadeIn.duration(250)}>
                  <LayeredFrog width={frogWidth} entries={state.history[state.day] ?? []} goalMl={goal} animate />
                </Animated.View>
              ) : (
                <Animated.View key={`frog-${state.character.current}`} entering={ZoomIn.springify().damping(12)}>
                  <Frog id={state.character.current} width={frogWidth} hydration={progress} fill={Math.max(0.0015, progress)} />
                </Animated.View>
              )}
            </Animated.View>
          </Bounce>
          <Animated.Text key={moodLine(progress)} entering={FadeIn.duration(400)} style={styles.mood} testID="mood">
            {moodLine(progress, CHARACTER_BY_ID[state.character.current]?.name ?? 'Lily')}
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.drinks}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drinkRow}>
              {done && <CelebrateButton onPress={() => nav.push('celebrate')} style={{ marginRight: 4 }} />}
              <Bounce onPress={() => nav.modal('characters')} style={styles.charBtn} testID="character">
                <View style={styles.charCircle}>
                  <FrogAvatar id={state.character.current} size={44} />
                  {state.character.tokens > 0 && (
                    <Animated.View entering={ZoomIn.springify()} style={styles.token}>
                      <Text style={styles.tokenText}>{state.character.tokens}</Text>
                    </Animated.View>
                  )}
                </View>
                <Text style={styles.charLabel} numberOfLines={1}>
                  {(CHARACTER_BY_ID[state.character.current]?.name ?? 'Lily').toUpperCase()}
                </Text>
              </Bounce>
              {state.drinks.enabled.map((id) => (
                <DrinkButton key={id} drink={drinkById(id)} pulse={id === 'water' && intakeMl === 0} onPress={() => setPouring(id)} />
              ))}
              <Bounce onPress={() => nav.push('drinks')} style={styles.charBtn} testID="add-or-edit">
                <View style={styles.addCircle}>
                  <View style={styles.addInner}>
                    <Svg width={18} height={18} viewBox="0 0 18 18">
                      <Path d="M9 2 V16 M2 9 H16" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />
                    </Svg>
                  </View>
                </View>
                <Text style={[styles.charLabel, { textAlign: 'center' }]}>ADD{'\n'}OR EDIT</Text>
              </Bounce>
            </ScrollView>
          </Animated.View>

          <View style={styles.tipsWrap}>
            <ActiveChallengePill />
            <TipsPill />
          </View>
        </View>

        <View style={styles.below}>
          <ChallengeSection />
          {hints.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hints}>
              {hints.map((h) => (
                <HintCard key={h.id} hint={h} onHide={() => update((s) => ({ hiddenCards: [...s.hiddenCards, h.id] }))} />
              ))}
            </ScrollView>
          )}
          <SupporterCard />
          <Text style={styles.footer}>
            Made with love <Text style={{ color: colors.frogDark }}>for frogs everywhere</Text>
          </Text>
        </View>
      </ScrollView>

      {celebrate > 0 && <Confetti key={celebrate} count={60} />}
      {celebrate > 0 && (
        <Animated.View key={`toast${celebrate}`} entering={ZoomIn.springify()} exiting={FadeOut} style={[styles.toast, { top: insets.top + 110 }]} pointerEvents="none">
          <Text style={styles.toastText}>Goal reached! {CHARACTER_BY_ID[state.character.current]?.name ?? 'Lily'} is fully hydrated 🐸💧</Text>
        </Animated.View>
      )}

      <AddSipOverlay
        visible={pour !== null}
        units={state.units}
        cupMl={pour ? (pour.id === 'water' ? state.drinks.sizes.water ?? state.cupMl : pour.size) : state.cupMl}
        color={pour?.color}
        label={pour?.label}
        shape={pour?.shape}
        glass={pour?.glass}
        onClose={() => setPouring(null)}
        onAdd={onAdd}
      />

      <BottomSheet visible={askWeek} dismissable={false}>
        <Text style={styles.sheetTitle}>What's the first day of{'\n'}your week?</Text>
        {(['sunday', 'monday'] as const).map((d) => (
          <PillButton
            key={d}
            label={d.toUpperCase()}
            variant="water"
            style={styles.weekBtn}
            onPress={() => {
              update({ weekStart: d });
              setAskWeek(false);
            }}
            testID={`week-${d}`}
          />
        ))}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  fold: {},
  below: { paddingTop: 8 },
  doneTitle: { fontFamily: fonts.black, fontSize: 36, color: colors.water, letterSpacing: -0.5, paddingHorizontal: 16 },
  token: { position: 'absolute', top: -2, right: -2, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  tokenText: { fontFamily: fonts.black, fontSize: 10, color: '#fff' },
  addCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.waterLight, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  addInner: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.water, alignItems: 'center', justifyContent: 'center' },
  hints: { paddingHorizontal: 16, gap: 12, paddingVertical: 8 },
  hint: { width: SW * 0.78, maxWidth: 330, borderRadius: 26, padding: 20, alignItems: 'center' },
  hintIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  hintTitle: { fontFamily: fonts.extra, fontSize: 22, marginBottom: 6 },
  hintText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.inkSoft, textAlign: 'center', lineHeight: 20 },
  hintHide: { fontFamily: fonts.black, fontSize: 11, color: '#C4C9D1', letterSpacing: 0.8, marginTop: 12 },
  footer: { fontFamily: fonts.bold, fontSize: 14, color: colors.water, textAlign: 'center', marginTop: 24 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, height: 44 },
  streak: { height: 34, borderRadius: 17, backgroundColor: colors.water, flexDirection: 'row', alignItems: 'center', paddingLeft: 12, overflow: 'hidden' },
  streakNum: { fontFamily: fonts.black, fontSize: 15, color: '#fff', width: 12, textAlign: 'center' },
  streakDay: { fontFamily: fonts.black, fontSize: 13, color: '#fff', marginLeft: 12 },
  menu: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', height: 70, justifyContent: 'center' },
  amount: { fontFamily: fonts.extra, fontSize: 40, color: colors.water, letterSpacing: -0.5 },
  caption: { fontFamily: fonts.semibold, fontSize: 14, color: colors.muted, marginTop: -4 },
  stage: { flex: 1, minHeight: SH * 0.36, alignItems: 'center', justifyContent: 'center' },
  mood: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkSoft, textAlign: 'center', marginBottom: 6 },
  drinks: { minHeight: 104 },
  drinkRow: { paddingHorizontal: 12, gap: 6, alignItems: 'center' },
  charBtn: { alignItems: 'center', width: 70 },
  charCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#EEF9E6', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  charLabel: { fontFamily: fonts.black, fontSize: 10, color: '#B6BCC6', letterSpacing: 0.6 },
  tipsWrap: { paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  tips: { backgroundColor: colors.pinkSoft, borderRadius: 26, paddingHorizontal: 16, paddingVertical: 12 },
  tipsHead: { flexDirection: 'row', alignItems: 'center' },
  tipsCount: { fontFamily: fonts.black, fontSize: 11, color: colors.pink, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  tipsTitle: { flex: 1, textAlign: 'center', fontFamily: fonts.extra, fontSize: 15, color: colors.pink },
  tipsDots: { flexDirection: 'row' },
  tipsDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#fff' },
  tipText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink, marginTop: 8, lineHeight: 19 },
  toast: { position: 'absolute', alignSelf: 'center', backgroundColor: colors.ink, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  toastText: { fontFamily: fonts.bold, color: '#fff', fontSize: 14 },
  sheetTitle: { fontFamily: fonts.extra, fontSize: 26, color: colors.ink, textAlign: 'center', marginBottom: 16 },
  weekBtn: { alignSelf: 'center', width: 230, marginTop: 12, paddingVertical: 15 },
});
