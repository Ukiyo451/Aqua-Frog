import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { BottomSheet } from '../../components/BottomSheet';
import { IceCube, Splash, useCountUp } from '../../components/effects';
import { InfoIcon, ScaleIcon, SexIcon, ShoeIcon, SunCloudIcon } from '../../components/Icons';
import { Lily } from '../../components/Lily';
import { Bounce, PillButton } from '../../components/Pressable';
import { WheelPicker } from '../../components/WheelPicker';
import { Activity, calculateGoal, Climate, fromDisplay, Profile, Sex, toDisplay } from '../../lib/hydration';
import { useStore } from '../../lib/store';
import { colors, fonts } from '../../theme';

const { width: SW, height: SH } = Dimensions.get('window');
const LBS_PER_KG = 2.20462;
const WEIGHT_UNITS: ('kg' | 'lbs')[] = ['kg', 'lbs'];

type SheetKind = 'sex' | 'weight' | 'activity' | 'climate' | 'custom' | null;

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'pregnant', label: 'Pregnant' },
  { value: 'breastfeeding', label: 'Breastfeeding' },
  { value: 'none', label: 'Prefer not to say' },
];
const ACTIVITY_OPTIONS: { value: Activity; label: string }[] = [
  { value: 'low', label: 'Low activity' },
  { value: 'medium', label: 'Medium activity' },
  { value: 'high', label: 'High activity' },
];
const CLIMATE_OPTIONS: { value: Climate; label: string }[] = [
  { value: 'cold', label: 'Cold' },
  { value: 'temperate', label: 'Temperate' },
  { value: 'hot', label: 'Hot' },
];

/** Lily drifts across the top of the screen on her lily pad. */
function FloatingLily() {
  const t = useSharedValue(0);
  const bob = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 11000, easing: Easing.linear }), -1);
    bob.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [t, bob]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: -140 + t.value * (SW + 280) }, { translateY: bob.value * 10 }, { rotate: `${-6 + bob.value * 12}deg` }],
  }));
  return (
    <Animated.View style={[styles.floater, style]} pointerEvents="none">
      <Lily width={62} idle={false} />
      <Svg width={110} height={30} viewBox="0 0 110 30" style={{ marginTop: -10 }}>
        <Ellipse cx={55} cy={15} rx={52} ry={13} fill="#3FBF57" />
        <Path d="M55 15 L100 6 L104 14 Z" fill={colors.water} />
        <Path d="M55 15 L20 10 M55 15 L30 24 M55 15 L80 24" stroke="#2FA94A" strokeWidth={2} />
      </Svg>
    </Animated.View>
  );
}

function Row({ label, icon, active, onPress, testID }: { label: string; icon: ReactNode; active: boolean; onPress: () => void; testID: string }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = active ? withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true) : withTiming(0);
  }, [active, pulse]);
  const style = useAnimatedStyle(() => ({ backgroundColor: `rgba(0, 90, 110, ${0.08 + pulse.value * 0.12})` }));
  return (
    <Bounce onPress={onPress} testID={testID}>
      <Animated.View style={[styles.row, style]}>
        <Text style={styles.rowText}>{label}</Text>
        {icon}
      </Animated.View>
    </Bounce>
  );
}

function OptionList<T extends string>({ options, value, onPick }: { options: { value: T; label: string }[]; value?: T; onPick: (v: T) => void }) {
  return (
    <View style={{ gap: 10, marginTop: 26 }}>
      {options.map((o, i) => (
        <Animated.View key={o.value} entering={FadeIn.delay(80 + i * 50)}>
          <Bounce onPress={() => onPick(o.value)} scaleTo={0.97} testID={`opt-${o.value}`}>
            <View style={[styles.option, value === o.value && styles.optionOn]}>
              <Text style={[styles.optionText, value === o.value && { color: '#fff' }]}>{o.label}</Text>
            </View>
          </Bounce>
        </Animated.View>
      ))}
    </View>
  );
}

export function Goal({ onNext }: { onNext: () => void }) {
  const insets = useSafeAreaInsets();
  const { state, update } = useStore();
  const [profile, setProfile] = useState<Profile>(state.profile);
  const [customGoal, setCustomGoal] = useState<number | null>(null);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [splash, setSplash] = useState(0);
  const [weightDraft, setWeightDraft] = useState(profile.weightKg ?? 70);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(profile.weightUnit);
  const [goalDraft, setGoalDraft] = useState(state.goalMl);
  const pop = useSharedValue(1);

  const goal = customGoal ?? calculateGoal(profile);
  const shown = useCountUp(toDisplay(goal, state.units), 1100);
  const personalised = customGoal !== null || (profile.sex !== undefined && profile.weightKg !== undefined);

  useEffect(() => {
    if (goal === state.goalMl) return;
    update({ goalMl: goal, profile });
    setSplash((n) => n + 1);
    pop.value = withSequence(withTiming(1.12, { duration: 140 }), withSpring(1, { damping: 7 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal]);

  const set = (patch: Partial<Profile>, next: SheetKind = null) => {
    setCustomGoal(null);
    setProfile((p) => ({ ...p, ...patch }));
    setSheet(null);
    if (next) setTimeout(() => setSheet(next), 420);
  };

  const weights = useMemo(
    () => (weightUnit === 'kg' ? Array.from({ length: 171 }, (_, i) => 30 + i) : Array.from({ length: 371 }, (_, i) => 66 + i)),
    [weightUnit],
  );
  const goals = useMemo(() => {
    const step = state.units === 'ml' ? 50 : 2;
    const from = state.units === 'ml' ? 500 : 16;
    const count = state.units === 'ml' ? 111 : 96;
    return Array.from({ length: count }, (_, i) => from + i * step);
  }, [state.units]);

  const cubes = useMemo(
    () => [
      { x: -20, y: SH * 0.08, s: 80 },
      { x: SW - 70, y: SH * 0.2, s: 90 },
      { x: -30, y: SH * 0.47, s: 70 },
      { x: SW - 60, y: SH * 0.58, s: 76 },
      { x: SW * 0.2, y: SH * 0.86, s: 60 },
      { x: SW * 0.7, y: SH * 0.82, s: 84 },
    ],
    [],
  );

  const numberStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const active: SheetKind = profile.sex === undefined ? 'sex' : profile.weightKg === undefined ? 'weight' : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {cubes.map((c, i) => (
        <IceCube key={i} x={c.x} y={c.y} size={c.s} delay={i * 400} />
      ))}
      <FloatingLily />
      <View style={[styles.topRight, { top: insets.top + 6 }]}>
        {personalised ? (
          <Animated.View entering={ZoomIn.springify()}>
            <PillButton label="DONE" onPress={onNext} style={styles.done} textStyle={{ fontSize: 12 }} testID="goal-done" />
          </Animated.View>
        ) : (
          <Bounce onPress={onNext} style={{ padding: 10 }} testID="skip">
            <Text style={styles.skip}>SKIP</Text>
          </Bounce>
        )}
      </View>

      <View style={styles.hero}>
        <View style={styles.labelRow}>
          <Text style={styles.small}>{personalised ? 'Recommended goal' : 'Common goal'}</Text>
          <InfoIcon />
        </View>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Splash trigger={splash} />
          <Animated.Text style={[styles.goal, numberStyle]} testID="goal-value">
            {shown}
            {state.units}
          </Animated.Text>
        </View>
        <Text style={styles.subtitle}>{personalised ? 'Your hydration goal' : 'Calculate your goal'}</Text>
      </View>

      <View style={styles.rows}>
        <Row
          testID="row-sex"
          label={SEX_OPTIONS.find((o) => o.value === profile.sex)?.label ?? 'Sex'}
          icon={<SexIcon />}
          active={active === 'sex'}
          onPress={() => setSheet('sex')}
        />
        <Row
          testID="row-weight"
          label={profile.weightKg ? (profile.weightUnit === 'kg' ? `${profile.weightKg} kg` : `${Math.round(profile.weightKg * LBS_PER_KG)} lbs`) : 'Weight'}
          icon={<ScaleIcon />}
          active={active === 'weight'}
          onPress={() => setSheet('weight')}
        />
        <Row
          testID="row-activity"
          label={ACTIVITY_OPTIONS.find((o) => o.value === (profile.activity ?? 'medium'))!.label}
          icon={<ShoeIcon />}
          active={false}
          onPress={() => setSheet('activity')}
        />
        <Row
          testID="row-climate"
          label={CLIMATE_OPTIONS.find((o) => o.value === (profile.climate ?? 'temperate'))!.label}
          icon={<SunCloudIcon />}
          active={false}
          onPress={() => setSheet('climate')}
        />
        <Bounce
          onPress={() => {
            setGoalDraft(goal);
            setSheet('custom');
          }}
          style={{ alignSelf: 'center', padding: 12 }}
          testID="custom-goal"
        >
          <Text style={styles.custom}>CUSTOM GOAL</Text>
        </Bounce>
      </View>

      <BottomSheet visible={sheet === 'sex'} onClose={() => setSheet(null)} dimColor="rgba(0,55,66,0.55)" showClose>
        <OptionList options={SEX_OPTIONS} value={profile.sex} onPick={(sex) => set({ sex }, profile.weightKg ? null : 'weight')} />
        <Text style={styles.privacy}>Your personal information won't be collected or shared</Text>
      </BottomSheet>

      <BottomSheet visible={sheet === 'weight'} onClose={() => setSheet(null)} dimColor="rgba(0,55,66,0.55)" showClose>
        <Text style={styles.sheetTitle}>Weight</Text>
        <View style={styles.wheels}>
          <WheelPicker
            key={weightUnit}
            testID="weight-wheel"
            values={weights}
            value={weightUnit === 'kg' ? Math.round(weightDraft) : Math.round(weightDraft * LBS_PER_KG)}
            onChange={(v) => setWeightDraft(weightUnit === 'kg' ? v : v / LBS_PER_KG)}
          />
          <WheelPicker values={WEIGHT_UNITS} value={weightUnit} onChange={setWeightUnit} width={70} />
        </View>
        <Text style={styles.privacy}>Your personal information won't be collected or shared</Text>
        <PillButton
          label="DONE"
          onPress={() => set({ weightKg: Math.round(weightDraft), weightUnit })}
          style={styles.sheetDone}
          testID="weight-done"
        />
      </BottomSheet>

      <BottomSheet visible={sheet === 'activity'} onClose={() => setSheet(null)} dimColor="rgba(0,55,66,0.55)" showClose>
        <OptionList options={ACTIVITY_OPTIONS} value={profile.activity ?? 'medium'} onPick={(activity) => set({ activity })} />
      </BottomSheet>

      <BottomSheet visible={sheet === 'climate'} onClose={() => setSheet(null)} dimColor="rgba(0,55,66,0.55)" showClose>
        <OptionList options={CLIMATE_OPTIONS} value={profile.climate ?? 'temperate'} onPick={(climate) => set({ climate })} />
      </BottomSheet>

      <BottomSheet visible={sheet === 'custom'} onClose={() => setSheet(null)} dimColor="rgba(0,55,66,0.55)" showClose>
        <Text style={styles.sheetTitle}>Daily goal</Text>
        <View style={styles.wheels}>
          <WheelPicker
            values={goals}
            value={goals.reduce((best, g) => (Math.abs(g - toDisplay(goalDraft, state.units)) < Math.abs(best - toDisplay(goalDraft, state.units)) ? g : best), goals[0])}
            onChange={(v) => setGoalDraft(fromDisplay(v, state.units))}
            format={(v) => `${v} ${state.units}`}
            width={160}
          />
        </View>
        <PillButton
          label="DONE"
          onPress={() => {
            setCustomGoal(Math.round(goalDraft));
            setSheet(null);
          }}
          style={styles.sheetDone}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.water, overflow: 'hidden' },
  floater: { position: 'absolute', top: 70, left: 0, alignItems: 'center' },
  topRight: { position: 'absolute', right: 12, zIndex: 5 },
  skip: { fontFamily: fonts.black, fontSize: 12, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.8 },
  done: { paddingVertical: 8, paddingHorizontal: 14 },
  hero: { marginTop: SH * 0.2, alignItems: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  small: { fontFamily: fonts.bold, fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  goal: { fontFamily: fonts.bold, fontSize: 64, color: '#fff', letterSpacing: -1 },
  subtitle: { fontFamily: fonts.extra, fontSize: 19, color: '#fff', marginTop: -4 },
  rows: { marginTop: 34, paddingHorizontal: SW * 0.12, gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    height: 52,
    borderRadius: 26,
  },
  rowText: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
  custom: { fontFamily: fonts.black, fontSize: 12, letterSpacing: 0.8, color: 'rgba(255,255,255,0.8)' },
  option: { height: 54, borderRadius: 16, backgroundColor: '#F4F5F7', justifyContent: 'center', paddingHorizontal: 18 },
  optionOn: { backgroundColor: colors.water },
  optionText: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  privacy: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 16 },
  sheetTitle: { fontFamily: fonts.extra, fontSize: 24, color: colors.ink, textAlign: 'center' },
  wheels: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14 },
  sheetDone: { alignSelf: 'center', marginTop: 18, paddingVertical: 14, paddingHorizontal: 34 },
});
