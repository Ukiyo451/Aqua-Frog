import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeInUp, SlideInDown, SlideOutDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Paragraph, Screen, Title, Toggle, ToggleRow } from '../../components/ui';
import { useStore } from '../../lib/store';
import { useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { BigPill, HeartGlyph, LayeredFrog, Pulse, useSimulatedTask } from './common';

const ASKED = 'perm:health';
const IOS_BLUE = '#2E7CF6';
const IOS_GREEN = '#34C759';

function SwapArrows() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withSequence(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 700, easing: Easing.inOut(Easing.quad) })), -1);
  }, [t]);
  const top = useAnimatedStyle(() => ({ transform: [{ translateX: (t.value - 0.5) * 10 }] }));
  const bottom = useAnimatedStyle(() => ({ transform: [{ translateX: (0.5 - t.value) * 10 }] }));
  const arrow = (d: string) => (
    <Svg width={34} height={14} viewBox="0 0 34 14">
      <Path d={d} stroke={colors.water} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
  return (
    <View style={{ gap: 6 }}>
      <Animated.View style={top}>{arrow('M3 7 H30 M24 2 L30 7 L24 12')}</Animated.View>
      <Animated.View style={bottom}>{arrow('M31 7 H4 M10 2 L4 7 L10 12')}</Animated.View>
    </View>
  );
}

function LeafIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Path d="M11 6 C6 4 3 8 4 13 C5 18 9 20 11 18 C13 20 17 18 18 13 C19 8 16 4 11 6 Z" stroke={IOS_GREEN} strokeWidth={1.8} fill="none" />
      <Path d="M11 6 Q11 3 13.5 2" stroke={IOS_GREEN} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <Path d="M8.5 11 V13 M13.5 11 V13" stroke={IOS_GREEN} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

type Perms = { wCaf: boolean; wWater: boolean; rCaf: boolean; rWater: boolean };

/** A look-alike of the system Health permission sheet, drawn inside the page. */
function PermissionSheet({ onAllow, onDeny }: { onAllow: () => void; onDeny: () => void }) {
  const insets = useSafeAreaInsets();
  const [p, setP] = useState<Perms>({ wCaf: false, wWater: false, rCaf: false, rWater: false });
  const any = Object.values(p).some(Boolean);
  const row = (key: keyof Perms, label: string, first: boolean) => (
    <View style={[styles.permRow, !first && styles.permRowLine]}>
      <LeafIcon />
      <Text style={styles.permLabel}>{label}</Text>
      <Toggle value={p[key]} onChange={(v) => setP({ ...p, [key]: v })} color={IOS_GREEN} testID={`perm-${key}`} />
    </View>
  );
  return (
    <Animated.View entering={SlideInDown.springify().damping(22).stiffness(170)} exiting={SlideOutDown.duration(260)} style={[StyleSheet.absoluteFill, styles.perm]}>
      <View style={[styles.permBar, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={onDeny} testID="perm-deny" hitSlop={8}>
          <Text style={styles.permBtn}>Don’t Allow</Text>
        </Pressable>
        <Text style={styles.permTitle}>Health Access</Text>
        <Pressable onPress={any ? onAllow : undefined} testID="perm-allow" hitSlop={8}>
          <Text style={[styles.permBtn, { fontFamily: fonts.bold }, !any && { color: '#C2C6CC' }]}>Allow</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 30 }}>
        <View style={styles.permHeart}>
          <HeartGlyph size={46} />
        </View>
        <Text style={styles.permBig}>Health</Text>
        <Text style={styles.permText}>“Lily” would like to access and update your Health data.</Text>
        <Pressable style={styles.permGroup} onPress={() => setP({ wCaf: true, wWater: true, rCaf: true, rWater: true })} testID="perm-all">
          <Text style={[styles.permLabel, { color: IOS_BLUE, paddingVertical: 14, marginLeft: 0 }]}>Turn On All</Text>
        </Pressable>
        <Text style={styles.permSection}>ALLOW “LILY” TO WRITE</Text>
        <View style={styles.permGroup}>
          {row('wCaf', 'Caffeine', true)}
          {row('wWater', 'Water', false)}
        </View>
        <Text style={styles.permNote}>Lily adds the water and caffeine from each drink you log.</Text>
        <Text style={styles.permSection}>ALLOW “LILY” TO READ</Text>
        <View style={styles.permGroup}>
          {row('rCaf', 'Caffeine', true)}
          {row('rWater', 'Water', false)}
        </View>
        <Text style={styles.permNote}>Drinks logged in other apps show up in Lily. Nothing is shared with anyone else.</Text>
      </ScrollView>
    </Animated.View>
  );
}

export function HealthScreen() {
  const { state, update } = useStore();
  const nav = useNav();
  const on = state.settings.healthSync;
  const [asking, setAsking] = useState(false);
  const sync = useSimulatedTask(2400, 'Syncing with Apple Health');
  const setOn = (healthSync: boolean) => update((s) => ({ settings: { ...s.settings, healthSync } }));

  const toggle = (v: boolean) => {
    if (v && !state.hiddenCards.includes(ASKED)) setAsking(true);
    else setOn(v);
  };
  const allow = () => {
    setAsking(false);
    update((s) => ({ settings: { ...s.settings, healthSync: true }, hiddenCards: [...s.hiddenCards, ASKED] }));
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen
        footer={
          <Animated.View entering={FadeInUp.delay(300).springify()}>
            <BigPill label="SYNC ALL DATA" disabled={!on} onPress={() => sync.start(() => nav.toast('Synced with Apple Health'))} testID="health-sync" />
          </Animated.View>
        }
        testID="health"
      >
        <Animated.View entering={FadeInDown.springify()}>
          <Title>Apple Health Sync</Title>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(80).springify()} style={{ marginBottom: 14 }}>
          <ToggleRow label="SYNC YOUR DATA" value={on} onChange={toggle} testID="health-toggle" />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(140).springify()}>
          <Paragraph style={styles.p}>Every glass you log in Lily is copied to the Health app as Water, and any caffeine as Caffeine. Water you log somewhere else flows back into Lily too.</Paragraph>
          <Paragraph style={styles.p}>👆 If the numbers in Health ever look different from Lily, tap “Sync All Data” below. A big history can take a minute.</Paragraph>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(220).springify()} style={styles.tiles}>
          <View style={styles.tile}>
            <View style={{ marginBottom: -14 }}>
              <LayeredFrog width={104} fill={1} eyes />
            </View>
          </View>
          <SwapArrows />
          <View style={styles.tile}>
            <Pulse>
              <HeartGlyph size={64} />
            </Pulse>
          </View>
        </Animated.View>
      </Screen>
      {asking && <PermissionSheet onAllow={allow} onDeny={() => setAsking(false)} />}
      {sync.hud}
    </View>
  );
}

const styles = StyleSheet.create({
  p: { fontSize: 15, color: colors.muted, lineHeight: 22 },
  tiles: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 4 },
  tile: { width: 128, height: 128, borderRadius: 30, borderWidth: 1, borderColor: '#E7E9ED', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  perm: { backgroundColor: '#F2F2F7' },
  permBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#F7F7F9', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#D1D1D6' },
  permBtn: { fontFamily: fonts.semibold, fontSize: 16, color: IOS_BLUE },
  permTitle: { fontFamily: fonts.extra, fontSize: 16, color: '#111' },
  permHeart: { alignSelf: 'center', width: 76, height: 76, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 22, borderWidth: StyleSheet.hairlineWidth, borderColor: '#D1D1D6' },
  permBig: { fontFamily: fonts.black, fontSize: 32, color: '#111', textAlign: 'center', marginTop: 12 },
  permText: { fontFamily: fonts.semibold, fontSize: 16, color: '#111', textAlign: 'center', marginTop: 6, marginBottom: 18, paddingHorizontal: 20 },
  permGroup: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14 },
  permSection: { fontFamily: fonts.semibold, fontSize: 12, color: '#6D6D72', marginTop: 22, marginBottom: 6, marginLeft: 14 },
  permRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  permRowLine: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#D1D1D6' },
  permLabel: { flex: 1, fontFamily: fonts.semibold, fontSize: 16, color: '#111', marginLeft: 12 },
  permNote: { fontFamily: fonts.regular, fontSize: 12, color: '#6D6D72', marginTop: 6, marginHorizontal: 14, lineHeight: 16 },
});
