import { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FlipInEasyX,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useCountUp } from '../../components/effects';
import { Bounce } from '../../components/Pressable';
import { ChevronIcon, CheckMark, Dialog, Divider, formatTime, HeaderPill, ListRow, PickerSheet, Screen, TimeWheels, Toggle } from '../../components/ui';
import { useNav } from '../../navigation/nav';
import { toDisplay, Units } from '../../lib/hydration';
import { useStore } from '../../lib/store';
import { colors, fonts } from '../../theme';
import { AppIconTile } from './AppIcon';
import { FrogFaceShape, GREEN_FACE, smartSummary, useReminderControl, Wave } from './common';
import { goalCalculated, goalLabel } from './GoalCalculator';
import { RowIcon, RowIconName } from './RowIcons';
import { languageFlag } from './Simple';
import { scheduleReminders } from './scheduling';
import { playSound, setSoundsEnabled } from './sounds';

const { width: SW } = Dimensions.get('window');
const CARD_W = Math.min(SW, 520) - 32;

/** Staggered entrance for each block of the page. */
function Enter({ i, children }: { i: number; children: ReactNode }) {
  return <Animated.View entering={FadeInDown.delay(Math.min(i, 14) * 38 + 40).springify().damping(17).stiffness(170)}>{children}</Animated.View>;
}

/** An ID badge on a lanyard with Lily's face and a teal check. */
function BadgeArt() {
  return (
    <Svg width={54} height={64} viewBox="0 0 54 64">
      <Path d="M20 2 L27 12 L34 2" stroke="#B9C1CC" strokeWidth={3} fill="none" strokeLinecap="round" />
      <Rect x={22} y={9} width={10} height={6} rx={2} fill="#9AA4B2" />
      <Rect x={4} y={14} width={44} height={46} rx={8} fill="#F2FAFC" stroke="#CFEFF4" strokeWidth={2} />
      <Rect x={10} y={20} width={18} height={18} rx={4} fill={colors.water} />
      <FrogFaceShape c={GREEN_FACE} x={10.5} y={22} s={0.17} />
      <Rect x={10} y={43} width={28} height={3.5} rx={1.75} fill="#C9D3DC" />
      <Rect x={10} y={50} width={18} height={3.5} rx={1.75} fill="#DDE4EA" />
      <Circle cx={44} cy={54} r={9} fill={colors.water} stroke="#fff" strokeWidth={2.5} />
      <Path d="M39.8 54.3 L42.8 57 L48 51.5" stroke="#fff" strokeWidth={2.3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Three frog faces huddled together, bobbing. */
function FrogTrio() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [t]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: -3 * t.value }] }));
  const b = useAnimatedStyle(() => ({ transform: [{ translateY: -3 * (1 - t.value) }] }));
  const faces = [
    { c: { body: '#FF8DBE', dark: '#D94A88', cheek: '#FFD45C' }, x: 0, y: 14, s: a },
    { c: { body: '#FFD45C', dark: '#C9952A', cheek: '#FF8DBE' }, x: 44, y: 14, s: b },
    { c: GREEN_FACE, x: 20, y: 0, s: b },
  ];
  return (
    <View style={{ width: 92, height: 62 }}>
      {faces.map((f, i) => (
        <Animated.View key={i} style={[{ position: 'absolute', left: f.x, top: f.y }, f.s]}>
          <Svg width={50} height={50} viewBox="0 0 100 100">
            <FrogFaceShape c={f.c} />
          </Svg>
        </Animated.View>
      ))}
    </View>
  );
}

function MembershipCard() {
  const { state } = useStore();
  const nav = useNav();
  const p = state.premium;
  if (p) {
    const since = new Date(p.since).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
    return (
      <Bounce onPress={() => nav.push('subscription')} scaleTo={0.97} testID="membership" style={styles.member}>
        <BadgeArt />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.memberDate}>{since}</Text>
          <Text style={styles.memberPlan}>{p.plan === 'monthly' ? 'Monthly subscription' : 'Lifetime access'}</Text>
          <Text style={styles.memberPerk}>All premium features unlocked</Text>
        </View>
      </Bounce>
    );
  }
  return (
    <Bounce onPress={() => nav.push('premium')} scaleTo={0.97} testID="get-premium" style={styles.promo}>
      <View style={{ flex: 1 }}>
        <Text style={styles.promoTitle}>Get Lily Premium</Text>
        <Text style={styles.promoSub}>All frogs, challenges & more</Text>
      </View>
      <FrogTrio />
    </Bounce>
  );
}

function ReminderTile({ label, sub, selected, onPress, testID }: { label: string; sub: string; selected: boolean; onPress: () => void; testID: string }) {
  const t = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    t.value = withTiming(selected ? 1 : 0, { duration: 260 });
  }, [selected, t]);
  const bg = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(t.value, [0, 1], ['#F7F8FA', '#E3F7FA']) }));
  return (
    <Bounce onPress={onPress} scaleTo={0.98} testID={testID}>
      <Animated.View style={[styles.tile, bg]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.tileLabel}>{label}</Text>
          <Text style={[styles.tileSub, selected && { color: colors.water }]}>{sub}</Text>
        </View>
        {selected && <CheckMark />}
      </Animated.View>
    </Bounce>
  );
}

function Reminders({ onDaily }: { onDaily: () => void }) {
  const { state } = useStore();
  const nav = useNav();
  const { setOn, setReminders, dialog } = useReminderControl();
  const on = state.remindersOn;
  const r = state.reminders;
  const dim = useSharedValue(on ? 1 : 0.45);
  useEffect(() => {
    dim.value = withTiming(on ? 1 : 0.45, { duration: 280 });
  }, [on, dim]);
  const fade = useAnimatedStyle(() => ({ opacity: dim.value }));
  return (
    <>
      <View style={styles.remHead}>
        <Text style={styles.remTitle}>Reminders</Text>
        <Toggle value={on} onChange={setOn} testID="toggle-reminders" />
      </View>
      <Animated.View style={fade}>
        <ReminderTile
          label="Once a day"
          sub={formatTime(r.dailyAt)}
          selected={r.mode === 'daily'}
          onPress={() => {
            if (r.mode !== 'daily') setReminders({ mode: 'daily' });
            onDaily();
          }}
          testID="rem-daily"
        />
        <ReminderTile
          label="Smart Reminders"
          sub={smartSummary(r)}
          selected={r.mode === 'smart'}
          onPress={() => {
            if (r.mode !== 'smart') setReminders({ mode: 'smart' });
            nav.push('smartReminders');
          }}
          testID="rem-smart"
        />
      </Animated.View>
      {dialog}
    </>
  );
}

function GoalCard() {
  const { state } = useStore();
  const nav = useNav();
  const needsCalc = !goalCalculated(state) && !state.customGoal;
  const dot = useSharedValue(1);
  useEffect(() => {
    dot.value = withRepeat(withSequence(withTiming(1.25, { duration: 600 }), withTiming(1, { duration: 600 })), -1);
  }, [dot]);
  const dotStyle = useAnimatedStyle(() => ({ transform: [{ scale: dot.value }] }));
  return (
    <Bounce onPress={() => nav.push('goalCalculator')} scaleTo={0.97} testID="goal-card">
      <View style={styles.goalCard}>
        <View style={styles.goalWave} pointerEvents="none">
          <Wave width={CARD_W} height={70} color="rgba(255,255,255,0.07)" amp={7} period={7000} crest={26} />
          <Wave width={CARD_W} height={70} color="rgba(255,255,255,0.06)" amp={6} period={5200} phase={2} crest={40} />
        </View>
        <View style={{ flex: 1 }}>
          <GoalNumber key={state.units} ml={state.goalMl} units={state.units} />
          <Text style={styles.goalLabel}>{goalLabel(state)}</Text>
          <Text style={styles.goalSub}>Change weight, daily activity, or weather</Text>
        </View>
        <ChevronIcon color="rgba(255,255,255,0.7)" size={13} />
      </View>
      {needsCalc && <Animated.View style={[styles.redDot, dotStyle]} />}
    </Bounce>
  );
}

/** Counts up when the goal changes; remounts (no count) when the units flip. */
function GoalNumber({ ml, units }: { ml: number; units: Units }) {
  const shown = useCountUp(toDisplay(ml, units), 1000);
  return (
    <Text style={styles.goalNum} testID="settings-goal">
      {shown}
      {units}
    </Text>
  );
}

function Row({ i, icon, label, value, right, onPress, testID }: { i: number; icon: RowIconName; label: string; value?: string; right?: ReactNode; onPress: () => void; testID: string }) {
  return (
    <Enter i={i}>
      <ListRow left={<RowIcon name={icon} delay={Math.min(i, 14) * 38 + 160} />} label={label} value={value} right={right} onPress={onPress} testID={testID} chevron />
    </Enter>
  );
}

function UnitsValue({ units }: { units: string }) {
  return (
    <Animated.Text key={units} entering={FlipInEasyX.springify().damping(14)} style={styles.unitsValue}>
      {units}
    </Animated.Text>
  );
}

export function SettingsScreen() {
  const { state, update, reset } = useStore();
  const nav = useNav();
  const [dailyOpen, setDailyOpen] = useState(false);
  const [dailyDraft, setDailyDraft] = useState(state.reminders.dailyAt);
  const [restoring, setRestoring] = useState(false);
  const [restored, setRestored] = useState<null | boolean>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const { setReminders } = useReminderControl();
  const s = state.settings;

  useEffect(() => setSoundsEnabled(s.sounds), [s.sounds]);

  const restore = () => {
    if (restoring) return;
    setRestoring(true);
    setTimeout(() => {
      setRestoring(false);
      setRestored(!!state.premium);
    }, 1500);
  };

  const rows: { id: RowIconName; label: string; value?: string; right?: ReactNode; onPress: () => void }[] = [
    { id: 'drinks', label: 'Add/Edit drinks list', onPress: () => nav.push('drinks') },
    {
      id: 'units',
      label: 'Units',
      right: <UnitsValue units={state.units} />,
      onPress: () => {
        playSound('tap');
        update({ units: state.units === 'ml' ? 'oz' : 'ml' });
      },
    },
    { id: 'sounds', label: 'App Sounds', value: s.sounds ? 'On' : 'Off', onPress: () => nav.push('sounds') },
    { id: 'calendar', label: 'Calendar', onPress: () => nav.push('weekStart') },
    { id: 'widgets', label: 'Widgets', onPress: () => nav.push('widgets') },
    { id: 'health', label: 'Apple Health Sync', value: s.healthSync ? 'On' : 'Connect', onPress: () => nav.push('health') },
    { id: 'watch', label: 'Apple Watch', onPress: () => nav.push('watch') },
    { id: 'sync', label: 'Sync between devices', value: s.syncDevices ? 'On' : 'Off', onPress: () => nav.push('deviceSync') },
    { id: 'backup', label: Platform.OS === 'ios' ? 'iCloud Backup' : 'Backup', onPress: () => nav.modal('backup') },
    { id: 'icon', label: 'App icon', right: <AppIconTile id={s.appIcon} size={26} />, onPress: () => nav.push('appIcon') },
    { id: 'language', label: 'Language', right: <Text style={styles.flag}>{languageFlag(s.language)}</Text>, onPress: () => nav.push('language') },
    { id: 'help', label: 'Help & Support', onPress: () => nav.push('help') },
  ];

  return (
    <View style={{ flex: 1 }}>
      <Screen testID="screen-settings" right={<HeaderPill label="WHAT'S NEW" onPress={() => nav.push('whatsNew')} testID="whats-new" />}>
        <Enter i={0}>
          <MembershipCard />
        </Enter>
        <Enter i={1}>
          <Reminders
            onDaily={() => {
              setDailyDraft(state.reminders.dailyAt);
              setDailyOpen(true);
            }}
          />
        </Enter>
        <Enter i={2}>
          <GoalCard />
        </Enter>
        <View style={{ height: 16 }} />
        {rows.map((r, i) => (
          <Row key={r.id} i={3 + i} icon={r.id} label={r.label} value={r.value} right={r.right} onPress={r.onPress} testID={`row-${r.id}`} />
        ))}
        <Divider />
        <Row i={15} icon="donate" label="Donate to creators" right={<Text style={styles.emoji}>💝</Text>} onPress={() => nav.push('donate')} testID="row-donate" />
        <Row
          i={16}
          icon="apps"
          label="Apps by Lily creators"
          right={
            <Svg width={26} height={26} viewBox="0 0 100 100">
              <FrogFaceShape c={GREEN_FACE} />
            </Svg>
          }
          onPress={() => nav.push('otherApps')}
          testID="row-apps"
        />
        <Divider />
        <Enter i={17}>
          <Bounce onPress={() => nav.push('hydrateFriends')} style={styles.friends} testID="hydrate-friends">
            <Svg width={30} height={26} viewBox="0 0 30 26">
              <Path d="M2 4 H12 L10.5 23 Q10.4 24.5 9 24.5 H5 Q3.6 24.5 3.5 23 Z" fill="#fff" />
              <Path d="M17 7 H28 L26.4 23 Q26.3 24.5 25 24.5 H20 Q18.7 24.5 18.6 23 Z" fill="#fff" opacity={0.85} />
              <Path d="M3 11 H11.2 M17.8 13 H27.3" stroke={colors.water} strokeWidth={2} />
            </Svg>
            <Text style={styles.friendsText}>Hydrate your friends</Text>
          </Bounce>
        </Enter>
        <Enter i={18}>
          <Text style={styles.love1}>Made with love</Text>
          <Text style={styles.love2}>for frogs everywhere 🐸</Text>
        </Enter>
        <Bounce onPress={restore} style={styles.footBtn} testID="restore">
          {restoring ? <ActivityIndicator color={colors.muted} /> : <Text style={styles.restore}>Restore Purchases</Text>}
        </Bounce>
        <Bounce onPress={() => nav.push('terms')} style={styles.footBtn} testID="terms">
          <Text style={styles.terms}>Terms & Privacy</Text>
        </Bounce>
        <Text style={styles.version}>1.0.0</Text>
        <Bounce onPress={() => setConfirmReset(true)} style={[styles.footBtn, { marginTop: 18 }]} testID="reset">
          <Text style={styles.reset}>Reset all data</Text>
        </Bounce>
      </Screen>

      <PickerSheet
        visible={dailyOpen}
        eyebrow="ONCE A DAY"
        title="Remind me at"
        onClose={() => setDailyOpen(false)}
        onDone={() => {
          setReminders({ mode: 'daily', dailyAt: dailyDraft });
          setDailyOpen(false);
        }}
      >
        {dailyOpen && <TimeWheels value={dailyDraft} onChange={setDailyDraft} />}
      </PickerSheet>

      <Dialog
        visible={restored !== null}
        title={restored ? 'Purchases restored' : 'Nothing to restore'}
        message={restored ? 'Your Lily Premium is active on this device.' : "We couldn't find any earlier purchases for this account."}
        actions={[{ label: 'OK' }]}
        onClose={() => setRestored(null)}
      />
      <Dialog
        visible={confirmReset}
        title="Reset all data?"
        message="This erases your drinks, history, frogs and settings on this device. It can't be undone."
        actions={[
          { label: 'Cancel', style: 'cancel' },
          {
            label: 'Reset',
            style: 'destructive',
            onPress: () => {
              scheduleReminders(state.reminders, false);
              reset();
              nav.home();
            },
          },
        ]}
        onClose={() => setConfirmReset(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  member: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingBottom: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E4E6EA' },
  memberDate: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted },
  memberPlan: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink, marginTop: 1 },
  memberPerk: { fontFamily: fonts.extra, fontSize: 15, color: colors.water, marginTop: 2 },
  promo: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.waterLight, borderRadius: 22, paddingVertical: 14, paddingLeft: 18, paddingRight: 12 },
  promoTitle: { fontFamily: fonts.extra, fontSize: 19, color: colors.waterDeep },
  promoSub: { fontFamily: fonts.bold, fontSize: 13, color: '#4FA9B3', marginTop: 2 },
  remHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 12, paddingHorizontal: 6 },
  remTitle: { fontFamily: fonts.extra, fontSize: 27, color: colors.ink },
  tile: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10 },
  tileLabel: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  tileSub: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted, marginTop: 2 },
  goalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.water, borderRadius: 26, paddingHorizontal: 20, paddingTop: 26, paddingBottom: 22, marginTop: 8, overflow: 'hidden' },
  goalWave: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 70 },
  goalNum: { fontFamily: fonts.extra, fontSize: 44, color: '#fff', letterSpacing: -0.5 },
  goalLabel: { fontFamily: fonts.extra, fontSize: 15, color: '#fff', marginTop: 2 },
  goalSub: { fontFamily: fonts.bold, fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  redDot: { position: 'absolute', top: 2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#FF4D6A', borderWidth: 2, borderColor: '#fff' },
  unitsValue: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted, marginLeft: 8, minWidth: 20, textAlign: 'right' },
  flag: { fontSize: 20, marginLeft: 8 },
  emoji: { fontSize: 20, marginLeft: 8 },
  friends: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, alignSelf: 'center', backgroundColor: colors.water, borderRadius: 999, paddingVertical: 18, paddingHorizontal: 34, marginTop: 6 },
  friendsText: { fontFamily: fonts.extra, fontSize: 18, color: '#fff' },
  love1: { fontFamily: fonts.extra, fontSize: 14, color: colors.blue, textAlign: 'center', marginTop: 26 },
  love2: { fontFamily: fonts.extra, fontSize: 14, color: colors.frogDark, textAlign: 'center' },
  footBtn: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16, marginTop: 14, minHeight: 36, justifyContent: 'center' },
  restore: { fontFamily: fonts.bold, fontSize: 14, color: colors.muted },
  terms: { fontFamily: fonts.bold, fontSize: 12, color: '#C3C8D0' },
  version: { fontFamily: fonts.bold, fontSize: 11, color: '#C3C8D0', textAlign: 'center' },
  reset: { fontFamily: fonts.bold, fontSize: 14, color: '#E5484D' },
});
