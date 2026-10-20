import { ComponentRef, ReactNode, useMemo, useRef, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '../../components/BottomSheet';
import { Splash, useCountUp } from '../../components/effects';
import { InfoIcon, ScaleIcon, SexIcon } from '../../components/Icons';
import { Bounce, PillButton } from '../../components/Pressable';
import { CheckMark, Dialog, ListRow, Screen } from '../../components/ui';
import { useNav } from '../../navigation/nav';
import { WheelPicker } from '../../components/WheelPicker';
import { Activity, calculateGoal, Climate, fromDisplay, ML_PER_OZ, Profile, Sex, toDisplay, Units } from '../../lib/hydration';
import { AppState, useStore } from '../../lib/store';
import { colors, fonts } from '../../theme';
import { Wave } from './common';
import { playSound } from './sounds';

const { width: SW, height: SH } = Dimensions.get('window');
const LBS_PER_KG = 2.20462;
const WEIGHT_UNITS: ('kg' | 'lbs')[] = ['kg', 'lbs'];

const SEX: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'pregnant', label: 'Pregnant' },
  { value: 'breastfeeding', label: 'Breastfeeding' },
  { value: 'none', label: 'Other' },
];
const ACTIVITY: { value: Activity; label: string; ml: number }[] = [
  { value: 'low', label: 'Low', ml: 0 },
  { value: 'medium', label: 'Medium', ml: 230 },
  { value: 'high', label: 'Active', ml: 480 },
];
const WEATHER: { value: Climate; label: string; ml: number }[] = [
  { value: 'hot', label: 'Hot', ml: 500 },
  { value: 'warm', label: 'Warm', ml: 250 },
  { value: 'temperate', label: 'Temperate', ml: 0 },
  { value: 'cold', label: 'Cold', ml: -200 },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WEB_NO_OUTLINE = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

type Sheet = 'sex' | 'weight' | 'activity' | 'weather' | 'custom' | null;

/** True once the goal came from the calculator (not the untouched default or typed in). */
export function goalCalculated(s: AppState): boolean {
  return !s.customGoal && (s.profile.sex !== undefined || s.profile.weightKg !== undefined);
}

export function goalLabel(s: AppState): string {
  if (s.customGoal) return 'Custom daily goal';
  return goalCalculated(s) ? 'Your suggested daily goal' : 'Common daily goal';
}

function signed(ml: number, units: Units) {
  const v = toDisplay(Math.abs(ml), units);
  return `${ml < 0 ? '-' : '+'}${v}${units}`;
}

function weightText(p: Profile) {
  if (!p.weightKg) return undefined;
  return p.weightUnit === 'kg' ? `${p.weightKg} kg` : `${Math.round(p.weightKg * LBS_PER_KG)} lbs`;
}

export function GoalCalculatorScreen() {
  const { state, update } = useStore();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const units = state.units;
  const [profile, setProfile] = useState<Profile>(state.profile);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [splash, setSplash] = useState(0);
  const [info, setInfo] = useState(false);
  const [weightDraft, setWeightDraft] = useState(profile.weightKg ?? 70);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(profile.weightUnit);
  const [customText, setCustomText] = useState('');
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const pop = useSharedValue(1);

  const numberStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const weights = useMemo(
    () => (weightUnit === 'kg' ? Array.from({ length: 171 }, (_, i) => 30 + i) : Array.from({ length: 371 }, (_, i) => 66 + i)),
    [weightUnit],
  );

  const celebrate = () => {
    setSplash((n) => n + 1);
    pop.value = withSequence(withTiming(1.14, { duration: 160 }), withSpring(1, { damping: 7 }));
  };

  const saveGoal = (goalMl: number, custom: boolean, p: Profile = state.profile) => {
    update((s) => ({ goalMl, customGoal: custom, profile: p, goals: { ...s.goals, [s.day]: goalMl } }));
    celebrate();
  };

  const calculate = () => {
    const g = calculateGoal(profile);
    saveGoal(g, false, profile);
    playSound('goal');
    nav.toast(`Daily goal set to ${toDisplay(g, units)}${units}`);
  };

  const pick = (patch: Partial<Profile>) => {
    playSound('tap');
    setProfile((p) => ({ ...p, ...patch }));
    setSheet(null);
  };

  const toggleUnits = () => update({ units: units === 'ml' ? 'oz' : 'ml' });

  const openCustom = () => {
    setCustomText(String(toDisplay(state.goalMl, units)));
    setSheet('custom');
    setTimeout(() => input.current?.focus(), 350);
  };

  const saveCustom = () => {
    const v = parseInt(customText, 10);
    if (!v || v <= 0) {
      setSheet(null);
      return;
    }
    const ml = Math.round(Math.min(10000, Math.max(250, fromDisplay(v, units))));
    saveGoal(ml, true);
    setSheet(null);
    nav.toast(`Custom goal set to ${toDisplay(ml, units)}${units}`);
  };

  const label = state.customGoal ? 'Custom daily goal' : goalCalculated(state) ? 'Your suggested daily goal' : 'Common daily goal';
  const seaH = SH * 0.44;
  const rows: { key: Exclude<Sheet, 'custom' | null>; label: string; value?: string; icon?: ReactNode }[] = [
    { key: 'sex', label: 'SEX', value: SEX.find((o) => o.value === profile.sex)?.label, icon: <SexIcon color={colors.water} size={20} /> },
    { key: 'weight', label: 'WEIGHT', value: weightText(profile), icon: <ScaleIcon color={colors.water} size={20} /> },
    { key: 'activity', label: 'DAILY ACTIVITY', value: ACTIVITY.find((o) => o.value === (profile.activity ?? 'medium'))!.label },
    { key: 'weather', label: 'WEATHER', value: WEATHER.find((o) => o.value === (profile.climate ?? 'temperate'))!.label },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen
        scroll={false}
        testID="screen-goalCalculator"
        right={
          <Bounce onPress={openCustom} style={styles.setCustom} testID="set-custom">
            <Text style={styles.setCustomText}>SET CUSTOM</Text>
          </Bounce>
        }
      >
        <Animated.Text entering={FadeInDown.springify().damping(15)} style={styles.title}>
          See how much you need
        </Animated.Text>
        <View style={styles.table}>
          {rows.map((r, i) => (
            <Animated.View key={r.key} entering={FadeInDown.delay(80 + i * 50).springify().damping(16)}>
              <ListRow
                look="line"
                label={r.label}
                value={r.value}
                valueColor={colors.water}
                right={r.value || !r.icon ? undefined : <Animated.View entering={FadeIn}>{r.icon}</Animated.View>}
                onPress={() => {
                  if (r.key === 'weight') {
                    setWeightDraft(profile.weightKg ?? 70);
                    setWeightUnit(profile.weightUnit);
                  }
                  setSheet(r.key);
                }}
                testID={`row-${r.key}`}
              />
            </Animated.View>
          ))}
        </View>
      </Screen>

      <View style={[styles.sea, { height: seaH + 24 }]} pointerEvents="box-none">
        <Wave width={SW} height={seaH + 24} color="#7FE0EA" amp={7} period={6400} phase={1.4} crest={14} />
        <Wave width={SW} height={seaH + 24} color={colors.water} amp={9} period={5200} crest={24} />
        <View style={[styles.seaBody, { paddingBottom: insets.bottom + 28 }]}>
          <View style={styles.numberWrap}>
            <Splash trigger={splash} />
            <Animated.View style={numberStyle}>
              <SeaNumber key={units} ml={state.goalMl} units={units} />
            </Animated.View>
          </View>
          <Bounce onPress={() => setInfo(true)} style={styles.labelRow} testID="goal-info">
            <Text style={styles.label}>{label}</Text>
            <InfoIcon size={13} />
          </Bounce>
          <Bounce onPress={toggleUnits} style={{ padding: 6 }} testID="change-units">
            <Text style={styles.changeUnits}>Change units</Text>
          </Bounce>
          <PillButton label="CALCULATE" onPress={calculate} style={styles.calc} testID="calculate" />
        </View>
      </View>

      <BottomSheet visible={sheet === 'sex'} onClose={() => setSheet(null)} showClose>
        <OptionTable
          options={SEX.map((o) => ({ value: o.value, label: o.label }))}
          value={profile.sex}
          onPick={(sex) => pick({ sex })}
        />
      </BottomSheet>

      <BottomSheet visible={sheet === 'weight'} onClose={() => setSheet(null)} showClose>
        <View style={styles.wheels}>
          <WheelPicker
            key={weightUnit}
            testID="weight-wheel"
            values={weights}
            value={weightUnit === 'kg' ? Math.round(weightDraft) : Math.round(weightDraft * LBS_PER_KG)}
            onChange={(v) => setWeightDraft(weightUnit === 'kg' ? v : v / LBS_PER_KG)}
            width={90}
          />
          <WheelPicker values={WEIGHT_UNITS} value={weightUnit} onChange={setWeightUnit} width={70} testID="weight-unit" />
        </View>
        <Text style={styles.privacy}>Your details stay on this device.</Text>
        <PillButton label="DONE" onPress={() => pick({ weightKg: Math.round(weightDraft), weightUnit })} style={styles.done} testID="weight-done" />
      </BottomSheet>

      <BottomSheet visible={sheet === 'activity'} onClose={() => setSheet(null)} showClose>
        <OptionTable
          options={ACTIVITY.map((o) => ({ value: o.value, label: o.label, value2: signed(o.ml, units) }))}
          value={profile.activity ?? 'medium'}
          onPick={(activity) => pick({ activity })}
        />
      </BottomSheet>

      <BottomSheet visible={sheet === 'weather'} onClose={() => setSheet(null)} showClose>
        <OptionTable
          options={WEATHER.map((o) => ({ value: o.value, label: o.label, value2: signed(o.ml, units) }))}
          value={profile.climate ?? 'temperate'}
          onPick={(climate) => pick({ climate })}
        />
      </BottomSheet>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <BottomSheet visible={sheet === 'custom'} onClose={() => setSheet(null)} showClose>
          <View style={styles.customRow}>
            <TextInput
              ref={input}
              value={customText}
              onChangeText={(t) => setCustomText(t.replace(/[^0-9]/g, '').slice(0, 5))}
              keyboardType="number-pad"
              style={[styles.customInput, WEB_NO_OUTLINE, { width: Math.max(1, customText.length) * 30 + 8 }]}
              selectionColor={colors.water}
              onSubmitEditing={saveCustom}
              testID="custom-input"
            />
            <Text style={styles.customUnit}>{units}</Text>
          </View>
          <Text style={styles.customLabel}>Custom daily goal</Text>
          <Bounce
            onPress={() => {
              const v = parseInt(customText, 10) || 0;
              const next = units === 'ml' ? Math.round(v / ML_PER_OZ) : Math.round(v * ML_PER_OZ);
              setCustomText(v ? String(next) : '');
              toggleUnits();
            }}
            style={{ alignSelf: 'center', padding: 6 }}
            testID="custom-units"
          >
            <Text style={styles.customChange}>Change units</Text>
          </Bounce>
          <PillButton label="DONE" onPress={saveCustom} style={styles.done} testID="custom-done" />
        </BottomSheet>
      </KeyboardAvoidingView>

      <Dialog
        visible={info}
        title="How Lily works it out"
        message="Your goal starts from your body weight, then adds water for an active day or hot weather, and adjusts for pregnancy or breastfeeding. It's a friendly estimate, not medical advice."
        actions={[{ label: 'Got it' }]}
        onClose={() => setInfo(false)}
      />
    </View>
  );
}

function SeaNumber({ ml, units }: { ml: number; units: Units }) {
  const shown = useCountUp(toDisplay(ml, units), 1100);
  return (
    <Text style={styles.number} testID="calc-goal">
      {shown}
      {units}
    </Text>
  );
}

function OptionTable<T extends string>({
  options,
  value,
  onPick,
  right,
}: {
  options: { value: T; label: string; value2?: string }[];
  value?: T;
  onPick: (v: T) => void;
  right?: (v: T) => ReactNode;
}) {
  return (
    <View style={styles.optTable}>
      {options.map((o, i) => (
        <Animated.View key={o.value} entering={FadeInDown.delay(60 + i * 40).springify().damping(16)}>
          <ListRow
            look="line"
            label={o.label.toUpperCase()}
            value={o.value2}
            valueColor={colors.water}
            right={value === o.value ? <View style={{ marginLeft: 10 }}><CheckMark /></View> : right?.(o.value)}
            selected={value === o.value}
            chevron={false}
            onPress={() => onPick(o.value)}
            testID={`opt-${o.value}`}
          />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  setCustom: { paddingVertical: 8, paddingHorizontal: 4 },
  setCustomText: { fontFamily: fonts.black, fontSize: 12, color: colors.ink, letterSpacing: 0.8 },
  title: { fontFamily: fonts.extra, fontSize: 29, color: colors.water, textAlign: 'center', marginTop: 4, marginBottom: 18 },
  table: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E4E6EA' },
  sea: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  seaBody: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingTop: 40 },
  numberWrap: { alignItems: 'center', justifyContent: 'center' },
  number: { fontFamily: fonts.extra, fontSize: 56, color: '#fff', letterSpacing: -0.5 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  label: { fontFamily: fonts.extra, fontSize: 15, color: '#fff' },
  changeUnits: { fontFamily: fonts.bold, fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  calc: { marginTop: 22, minWidth: 200, paddingVertical: 18 },
  wheels: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 20 },
  privacy: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 12 },
  done: { alignSelf: 'center', width: 160, marginTop: 18, paddingVertical: 15 },
  optTable: { marginTop: 30, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E4E6EA' },
  customRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginTop: 18 },
  customInput: { fontFamily: fonts.extra, fontSize: 50, color: colors.ink, textAlign: 'right', padding: 0, minWidth: 30 },
  customUnit: { fontFamily: fonts.extra, fontSize: 50, color: colors.ink, marginLeft: 4 },
  customLabel: { fontFamily: fonts.extra, fontSize: 15, color: colors.ink, textAlign: 'center', marginTop: 4 },
  customChange: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted },
});
