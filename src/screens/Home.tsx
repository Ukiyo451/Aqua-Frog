import { useEffect, useMemo, useState } from 'react';
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
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddSipOverlay } from '../components/AddSipOverlay';
import { BottomSheet } from '../components/BottomSheet';
import { DrinkButton } from '../components/DrinkButton';
import { Confetti, useCountUp } from '../components/effects';
import { WavesIcon } from '../components/Icons';
import { Lily } from '../components/Lily';
import { Bounce, PillButton } from '../components/Pressable';
import { WheelPicker } from '../components/WheelPicker';
import { DrinkKind, DRINKS } from '../lib/drinks';
import { formatAmount, fromDisplay, toDisplay } from '../lib/hydration';
import { useStore } from '../lib/store';
import { colors, fonts } from '../theme';

const { width: SW, height: SH } = Dimensions.get('window');

const TIPS = [
  'Keep a glass by your bed and drink it as soon as you wake up — Lily does!',
  'Feeling hungry between meals? Try a glass of water first; thirst often hides as hunger.',
  'Add lemon, mint or cucumber to your water for a pond-fresh twist.',
  'Eat your water: watermelon, cucumber and oranges are over 85% water.',
  'Drink a glass before every meal to hit your goal without thinking about it.',
];

/** What Lily says about how she feels, from parched to fully hydrated. */
function moodLine(progress: number): string {
  if (progress >= 1) return 'Lily is fully hydrated and glowing!';
  if (progress >= 0.75) return 'Almost there, Lily feels great';
  if (progress >= 0.4) return 'Lily is perking up';
  if (progress > 0) return 'Lily is still thirsty';
  return 'Lily is parched… give her a sip';
}

/** The day-streak badge: a circle that unrolls into "1 day" and tucks back in. */
function StreakBadge({ streak }: { streak: number }) {
  const open = useSharedValue(0);
  useEffect(() => {
    open.value = withSequence(withDelay(500, withSpring(1, { damping: 14 })), withDelay(2200, withSpring(0, { damping: 16 })));
  }, [open]);
  const style = useAnimatedStyle(() => ({ width: 34 + open.value * 40 }));
  const label = useAnimatedStyle(() => ({ opacity: open.value }));
  return (
    <Bounce
      onPress={() => {
        open.value = withSequence(withSpring(1, { damping: 14 }), withDelay(1800, withSpring(0, { damping: 16 })));
      }}
    >
      <Animated.View style={[styles.streak, style]}>
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

export function Home() {
  const insets = useSafeAreaInsets();
  const { state, update, addSip, intakeMl, reset } = useStore();
  const [showRemaining, setShowRemaining] = useState(false);
  const [drink, setDrink] = useState<DrinkKind | null>(null);
  const [menu, setMenu] = useState(false);
  const [goalDraft, setGoalDraft] = useState(state.goalMl);
  const [celebrate, setCelebrate] = useState(0);
  const [askWeek, setAskWeek] = useState(false);
  const flip = useSharedValue(1);

  useEffect(() => {
    if (state.weekStart) return;
    const t = setTimeout(() => setAskWeek(true), 1200);
    return () => clearTimeout(t);
  }, [state.weekStart]);

  const progress = Math.min(1, intakeMl / state.goalMl);
  const remaining = Math.max(0, state.goalMl - intakeMl);
  const pct = Math.round((intakeMl / state.goalMl) * 100);
  const shownIntake = useCountUp(toDisplay(intakeMl, state.units));
  const shownRemaining = useCountUp(toDisplay(remaining, state.units));

  const toggle = () => {
    flip.value = withSequence(withTiming(0.85, { duration: 110 }), withSpring(1, { damping: 7 }));
    setShowRemaining((v) => !v);
  };

  const onAdd = (ml: number) => {
    const d = DRINKS[drink ?? 'water'];
    const hydrated = Math.round(ml * d.hydration);
    const before = intakeMl;
    setDrink(null);
    setShowRemaining(false);
    addSip(hydrated);
    // Lily gives a little happy squish as the water lands
    flip.value = withDelay(250, withSequence(withTiming(1.06, { duration: 160 }), withSpring(1, { damping: 6 })));
    if (before < state.goalMl && before + hydrated >= state.goalMl) setCelebrate((n) => n + 1);
  };

  const frogStyle = useAnimatedStyle(() => ({ transform: [{ scale: flip.value }] }));
  const goals = useMemo(() => {
    const step = state.units === 'ml' ? 50 : 2;
    const from = state.units === 'ml' ? 500 : 16;
    const count = state.units === 'ml' ? 111 : 96;
    return Array.from({ length: count }, (_, i) => from + i * step);
  }, [state.units]);
  const frogWidth = Math.min(SW * 0.8, SH * 0.36);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6 }]}>
      <View style={styles.top}>
        <StreakBadge streak={state.streak} />
        <Bounce
          onPress={() => {
            setGoalDraft(state.goalMl);
            setMenu(true);
          }}
          style={styles.menu}
          testID="menu"
        >
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
              <Lily width={frogWidth} variant="silhouette" fill={Math.max(0.012, progress)} />
            </Animated.View>
          ) : (
            <Animated.View key="lily" entering={ZoomIn.springify().damping(12)}>
              <Lily width={frogWidth} hydration={progress} fill={Math.max(0.0015, progress)} />
            </Animated.View>
          )}
        </Animated.View>
      </Bounce>
      <Animated.Text key={moodLine(progress)} entering={FadeIn.duration(400)} style={styles.mood} testID="mood">
        {moodLine(progress)}
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.drinks}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drinkRow}>
          <View style={styles.charBtn}>
            <View style={styles.charCircle}>
              <Lily width={40} crop="face" idle={false} />
            </View>
            <Text style={styles.charLabel}>LILY</Text>
          </View>
          {(Object.keys(DRINKS) as DrinkKind[]).map((k) => (
            <DrinkButton key={k} kind={k} pulse={k === 'water' && intakeMl === 0} onPress={() => setDrink(k)} />
          ))}
        </ScrollView>
      </Animated.View>

      <View style={[styles.tipsWrap, { paddingBottom: insets.bottom + 10 }]}>
        <TipsPill />
      </View>

      {celebrate > 0 && <Confetti key={celebrate} count={60} />}
      {celebrate > 0 && (
        <Animated.View key={`toast${celebrate}`} entering={ZoomIn.springify()} exiting={FadeOut} style={[styles.toast, { top: insets.top + 110 }]} pointerEvents="none">
          <Text style={styles.toastText}>Goal reached! Lily is fully hydrated 🐸💧</Text>
        </Animated.View>
      )}

      <AddSipOverlay
        visible={drink !== null}
        units={state.units}
        cupMl={state.cupMl}
        color={DRINKS[drink ?? 'water'].color}
        label={DRINKS[drink ?? 'water'].label}
        onClose={() => setDrink(null)}
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

      <BottomSheet visible={menu} onClose={() => setMenu(false)} showClose>
        <Text style={styles.sheetTitle}>Daily goal</Text>
        <View style={{ alignItems: 'center' }}>
          <WheelPicker
            values={goals}
            value={goals.reduce((b, g) => (Math.abs(g - toDisplay(goalDraft, state.units)) < Math.abs(b - toDisplay(goalDraft, state.units)) ? g : b), goals[0])}
            onChange={(v) => setGoalDraft(fromDisplay(v, state.units))}
            format={(v) => `${v} ${state.units}`}
            width={170}
          />
        </View>
        <PillButton
          label="SAVE GOAL"
          style={styles.weekBtn}
          onPress={() => {
            update({ goalMl: Math.round(goalDraft) });
            setMenu(false);
          }}
        />
        <View style={styles.menuRow}>
          <PillButton
            label={`Units: ${state.units}`}
            variant="ghost"
            textStyle={{ fontSize: 14 }}
            onPress={() => update({ units: state.units === 'ml' ? 'oz' : 'ml' })}
          />
          <PillButton
            label="Undo last sip"
            variant="ghost"
            textStyle={{ fontSize: 14 }}
            onPress={() => update((s) => ({ sips: s.sips.slice(0, -1) }))}
          />
          <PillButton
            label="Restart onboarding"
            variant="ghost"
            textStyle={{ fontSize: 14 }}
            onPress={() => {
              setMenu(false);
              reset();
            }}
          />
        </View>
        <Text style={styles.small}>
          Today: {formatAmount(intakeMl, state.units)} of {formatAmount(state.goalMl, state.units)}
        </Text>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, height: 44 },
  streak: { height: 34, borderRadius: 17, backgroundColor: colors.water, flexDirection: 'row', alignItems: 'center', paddingLeft: 12, overflow: 'hidden' },
  streakNum: { fontFamily: fonts.black, fontSize: 15, color: '#fff', width: 12, textAlign: 'center' },
  streakDay: { fontFamily: fonts.black, fontSize: 13, color: '#fff', marginLeft: 12 },
  menu: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', height: 70, justifyContent: 'center' },
  amount: { fontFamily: fonts.extra, fontSize: 40, color: colors.water, letterSpacing: -0.5 },
  caption: { fontFamily: fonts.semibold, fontSize: 14, color: colors.muted, marginTop: -4 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mood: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkSoft, textAlign: 'center', marginBottom: 6 },
  drinks: { height: 96 },
  drinkRow: { paddingHorizontal: 12, gap: 6, alignItems: 'center' },
  charBtn: { alignItems: 'center', width: 70 },
  charCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#EEF9E6', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  charLabel: { fontFamily: fonts.black, fontSize: 10, color: '#B6BCC6', letterSpacing: 0.6 },
  tipsWrap: { paddingHorizontal: 16, paddingTop: 8 },
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
  menuRow: { marginTop: 8 },
  small: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 6 },
});
