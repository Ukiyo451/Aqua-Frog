import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutLeft, SlideInRight, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { Screen, Segmented } from '../../components/ui';
import { goalFor, useStore } from '../../lib/store';
import { formatAmount } from '../../lib/hydration';
import { colors, fonts } from '../../theme';
import { BigPill, Bob, LayeredFrog } from './common';

const BLUE = colors.blue;
const PURPLE = '#8B7BEA';

function useToday() {
  const { state, intakeMl } = useStore();
  const goal = goalFor(state, state.day);
  const pct = Math.round((intakeMl / goal) * 100);
  return { amount: formatAmount(intakeMl, state.units), pct, fill: Math.min(1, intakeMl / goal), left: formatAmount(Math.max(0, goal - intakeMl), state.units) };
}

/** The blue phone with a home-screen grid of made-up app icons. */
function PromoPhone() {
  const icons = ['#6E8CF0', '#8FA6F4', '#5D7AE8', '#7B95F2'];
  return (
    <Svg width={200} height={330} viewBox="0 0 200 330">
      <Rect x={2} y={2} width={196} height={326} rx={34} fill="#2D4FC9" />
      <Rect x={10} y={10} width={180} height={310} rx={27} fill="#4466DE" />
      <Rect x={72} y={14} width={56} height={14} rx={7} fill="#2D4FC9" />
      {Array.from({ length: 5 }).map((_, r) =>
        Array.from({ length: 4 }).map((__, c) => (
          <Rect key={`${r}${c}`} x={24 + c * 40} y={44 + r * 52} width={30} height={30} rx={8} fill={icons[(r + c) % icons.length]} opacity={0.85} />
        )),
      )}
      <Rect x={22} y={302} width={156} height={6} rx={3} fill="#2D4FC9" opacity={0.5} />
    </Svg>
  );
}

function WidgetCard() {
  const t = useToday();
  return (
    <View style={styles.widget}>
      <Text style={styles.widgetAmount}>{t.amount}</Text>
      <Text style={styles.widgetPct}>{t.pct}%</Text>
      <View style={styles.widgetFrog}>
        <LayeredFrog width={86} fill={Math.max(0.55, t.fill)} base="#fff" />
      </View>
      <View style={styles.widgetPlus}>
        <Text style={styles.widgetPlusText}>+</Text>
      </View>
    </View>
  );
}

function Promo({ onWant }: { onWant: () => void }) {
  return (
    <Animated.View exiting={FadeOutLeft.duration(220)} style={{ flex: 1, alignItems: 'center' }}>
      <Animated.View entering={FadeInDown.springify().damping(16)} style={styles.promoArt}>
        <View style={{ marginLeft: -60 }}>
          <PromoPhone />
        </View>
        <Animated.View entering={ZoomIn.delay(250).springify().damping(11)} style={styles.widgetPos}>
          <Bob amp={7} ms={1700} rotate={1.5}>
            <WidgetCard />
          </Bob>
        </Animated.View>
      </Animated.View>
      <Animated.Text entering={FadeInDown.delay(120).springify()} style={styles.title}>
        Add a cool Widget
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(180).springify()} style={styles.sub}>
        See how much Lily has had to drink without even opening the app
      </Animated.Text>
      <View style={{ flex: 1 }} />
      <Animated.View entering={FadeInUp.delay(260).springify()}>
        <BigPill label="I WANT THAT!" color={BLUE} onPress={onWant} icon={<Hands />} testID="widgets-want" />
      </Animated.View>
    </Animated.View>
  );
}

function Hands() {
  return (
    <Svg width={26} height={22} viewBox="0 0 26 22">
      <G stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 20 L3 12 Q3 9 5 9 L5 4 Q5 2.5 6.5 2.5 Q8 2.5 8 4 L8 11 L10 8 Q11 6.5 12 7.5 Q12.6 8.3 11.8 9.5 L9 15 Q8 18 6 20" />
        <Path d="M23 20 L23 12 Q23 9 21 9 L21 4 Q21 2.5 19.5 2.5 Q18 2.5 18 4 L18 11 L16 8 Q15 6.5 14 7.5 Q13.4 8.3 14.2 9.5 L17 15 Q18 18 20 20" />
      </G>
    </Svg>
  );
}

/* ───────── how-to ───────── */

const GALLERY = [
  { name: 'Calendar', color: '#FF6B6B' },
  { name: 'Clock', color: '#2B2F3A' },
  { name: 'Lily', color: 'lily' },
  { name: 'Notes', color: '#FFC83D' },
  { name: 'Photos', color: '#9C7CF0' },
  { name: 'Weather', color: '#4AA8F0' },
];

function PhoneTop({ children, screen }: { children: React.ReactNode; screen: string }) {
  return (
    <View style={styles.mockPhone}>
      <View style={[styles.mockScreen, { backgroundColor: screen }]}>
        <View style={styles.notch} />
        {children}
      </View>
    </View>
  );
}

function HomeMock() {
  return (
    <PhoneTop screen="#9FC6E8">
      <View style={styles.gallery}>
        <View style={styles.grabber} />
        <View style={styles.search}>
          <Svg width={11} height={11} viewBox="0 0 12 12">
            <Circle cx={5} cy={5} r={3.6} stroke="#8D95A3" strokeWidth={1.6} fill="none" />
            <Path d="M8 8 L11 11" stroke="#8D95A3" strokeWidth={1.6} strokeLinecap="round" />
          </Svg>
          <Text style={styles.searchText}>Search Widgets</Text>
        </View>
        {GALLERY.map((g, i) => (
          <Animated.View key={g.name} entering={FadeInDown.delay(120 + i * 50)} style={[styles.galleryRow, g.color === 'lily' && styles.galleryLily]}>
            {g.color === 'lily' ? (
              <View style={[styles.galleryIcon, { backgroundColor: '#fff' }]}>
                <LayeredFrog width={18} eyes={false} />
              </View>
            ) : (
              <View style={[styles.galleryIcon, { backgroundColor: g.color }]} />
            )}
            <Text style={[styles.galleryName, g.color === 'lily' && { color: BLUE }]}>{g.name}</Text>
          </Animated.View>
        ))}
      </View>
    </PhoneTop>
  );
}

function LockMock() {
  const t = useToday();
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <PhoneTop screen="#4B57B8">
      <Text style={styles.lockDate}>{day}</Text>
      <Text style={styles.lockClock}>12:37</Text>
      <View style={styles.lockRow}>
        <Animated.View entering={ZoomIn.delay(150).springify()} style={styles.lockRect}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <LayeredFrog width={14} eyes={false} base="rgba(255,255,255,0.5)" layers={['#fff']} fill={t.fill} />
            <Text style={styles.lockRectText}>
              {t.amount} • {t.pct}%
            </Text>
          </View>
          <View style={styles.lockBar}>
            <View style={[styles.lockBarFill, { width: `${Math.max(6, Math.min(100, t.pct))}%` }]} />
          </View>
          <Text style={styles.lockLeft}>{t.left} to go</Text>
        </Animated.View>
        <Animated.View entering={ZoomIn.delay(240).springify()} style={styles.lockRound}>
          <Svg width={48} height={48} viewBox="0 0 48 48" style={StyleSheet.absoluteFill}>
            <Circle cx={24} cy={24} r={21} stroke="rgba(255,255,255,0.25)" strokeWidth={4} fill="none" />
            <Circle
              cx={24}
              cy={24}
              r={21}
              stroke="#fff"
              strokeWidth={4}
              fill="none"
              strokeDasharray={`${Math.min(1, t.fill) * 132} 132`}
              strokeLinecap="round"
              rotation={-90}
              origin="24, 24"
            />
          </Svg>
          <LayeredFrog width={24} eyes={false} base="rgba(255,255,255,0.5)" layers={['#fff']} fill={t.fill} />
        </Animated.View>
      </View>
    </PhoneTop>
  );
}

const STEPS = {
  home: ['Press and hold an empty spot on your Home Screen until the apps wiggle', 'Tap the "+" button in the top corner', 'Find Lily in the list, pick a size and tap "Add Widget"'],
  lock: ['Press and hold your Lock Screen until "Customize" appears', 'Choose the Lock Screen, then tap the box under the clock', 'Pick Lily and tap the round or wide widget you like'],
};

function HowTo() {
  const [tab, setTab] = useState<'home' | 'lock'>('home');
  const accent = tab === 'home' ? BLUE : PURPLE;
  return (
    <Animated.View entering={SlideInRight.springify().damping(20)} style={{ flex: 1 }}>
      <View style={[styles.panel, { backgroundColor: tab === 'home' ? '#DDF1F8' : '#E8E5FB' }]}>
        <Animated.View key={tab} entering={FadeIn.duration(320)} exiting={FadeOut.duration(220)} style={StyleSheet.absoluteFill}>
          {tab === 'home' ? <HomeMock /> : <LockMock />}
        </Animated.View>
      </View>
      <View style={{ marginTop: 18 }}>
        <Segmented
          options={[
            { value: 'home', label: 'Home Screen' },
            { value: 'lock', label: 'Lock Screen' },
          ]}
          value={tab}
          onChange={setTab}
          color={accent}
        />
      </View>
      <View style={{ marginTop: 22 }} key={`s-${tab}`}>
        {STEPS[tab].map((s, i) => (
          <Animated.View key={s} entering={FadeInDown.delay(i * 70).springify()} style={styles.step}>
            <View style={[styles.stepNum, { backgroundColor: accent }]}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{s}</Text>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}

/** Widgets promo that turns into a home/lock-screen how-to. */
export function WidgetsScreen() {
  const [howTo, setHowTo] = useState(false);
  return (
    <Screen chrome="close" scroll={howTo} contentStyle={!howTo ? { paddingBottom: 40 } : undefined} testID="widgets">
      {howTo ? <HowTo /> : <Promo onWant={() => setHowTo(true)} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  promoArt: { width: 300, height: 360, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  widgetPos: { position: 'absolute', right: 6, top: 64 },
  widget: {
    width: 138,
    height: 138,
    borderRadius: 26,
    backgroundColor: '#DDF4FA',
    padding: 14,
    overflow: 'hidden',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  widgetAmount: { fontFamily: fonts.black, fontSize: 22, color: colors.water },
  widgetPct: { fontFamily: fonts.extra, fontSize: 13, color: colors.water, marginTop: -2 },
  widgetFrog: { position: 'absolute', right: -6, bottom: -6 },
  widgetPlus: { position: 'absolute', left: 12, bottom: 12, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.water, alignItems: 'center', justifyContent: 'center' },
  widgetPlusText: { fontFamily: fonts.black, color: '#fff', fontSize: 18, marginTop: -2 },
  title: { fontFamily: fonts.extra, fontSize: 30, color: colors.ink, textAlign: 'center', marginTop: 18 },
  sub: { fontFamily: fonts.semibold, fontSize: 16, color: colors.inkSoft, textAlign: 'center', marginTop: 8, lineHeight: 23, paddingHorizontal: 18 },
  panel: { height: 270, borderRadius: 28, overflow: 'hidden' },
  mockPhone: { position: 'absolute', left: 50, right: 50, top: 26, bottom: -40, borderRadius: 34, backgroundColor: '#2D4FC9', padding: 7 },
  mockScreen: { flex: 1, borderRadius: 28, overflow: 'hidden', alignItems: 'center' },
  notch: { width: 70, height: 18, borderRadius: 9, backgroundColor: '#2D4FC9', marginTop: 6 },
  gallery: { position: 'absolute', left: 8, right: 8, top: 30, bottom: 0, backgroundColor: 'rgba(255,255,255,0.94)', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingHorizontal: 10 },
  grabber: { alignSelf: 'center', width: 30, height: 4, borderRadius: 2, backgroundColor: '#C9CED6', marginTop: 6 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECEEF2', borderRadius: 9, paddingHorizontal: 8, height: 24, marginTop: 8, marginBottom: 4 },
  searchText: { fontFamily: fonts.semibold, fontSize: 11, color: '#8D95A3' },
  galleryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 30, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E5EA', paddingHorizontal: 4 },
  galleryLily: { backgroundColor: '#E6ECFF', borderRadius: 8, borderBottomWidth: 0 },
  galleryIcon: { width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  galleryName: { fontFamily: fonts.bold, fontSize: 12, color: colors.ink },
  lockDate: { fontFamily: fonts.bold, color: '#fff', fontSize: 12, marginTop: 8, opacity: 0.9 },
  lockClock: { fontFamily: fonts.black, color: '#fff', fontSize: 50, lineHeight: 58 },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  lockRect: { width: 108, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.22)', padding: 7, justifyContent: 'space-between' },
  lockRectText: { fontFamily: fonts.black, color: '#fff', fontSize: 11 },
  lockBar: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' },
  lockBarFill: { height: 5, borderRadius: 3, backgroundColor: '#fff' },
  lockLeft: { fontFamily: fonts.bold, color: '#fff', fontSize: 8, opacity: 0.85 },
  lockRound: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18, paddingRight: 10 },
  stepNum: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontFamily: fonts.black, color: '#fff', fontSize: 16 },
  stepText: { flex: 1, fontFamily: fonts.semibold, fontSize: 16, color: colors.inkSoft, lineHeight: 22 },
});
