import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import { MiniCup } from '../../components/Cup';
import { Bounce } from '../../components/Pressable';
import { CheckMark, Screen, Subtitle, Title } from '../../components/ui';
import { CATALOG_BY_ID } from '../../lib/drinks';
import { formatAmount } from '../../lib/hydration';
import { goalFor, useStore } from '../../lib/store';
import { useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { BigPill, LayeredFrog, useSimulatedTask } from './common';

const STRAP = '#BDEBF2';
const W = 160;
const H = 300;

/** Light-teal watch with straps; children are drawn on its black screen. */
function WatchBody({ children }: { children: ReactNode }) {
  return (
    <View style={{ width: W, height: H }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={StyleSheet.absoluteFill}>
        <Rect x={24} y={0} width={112} height={80} rx={22} fill={STRAP} />
        <Rect x={24} y={220} width={112} height={80} rx={22} fill={STRAP} />
        <Rect x={4} y={58} width={152} height={184} rx={40} fill="#A9E2EB" />
        <Rect x={150} y={110} width={9} height={30} rx={4} fill="#93D5E0" />
        <Rect x={12} y={66} width={136} height={168} rx={33} fill="#0E1015" />
      </Svg>
      <View style={styles.screen}>{children}</View>
    </View>
  );
}

function Clock() {
  const d = new Date();
  return <Text style={styles.clock}>{`${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`}</Text>;
}

function FrogDesign({ amount, pct, fill }: { amount: string; pct: number; fill: number }) {
  return (
    <>
      <Clock />
      <Text style={styles.big}>{amount}</Text>
      <Text style={styles.small}>{pct}%</Text>
      <View style={styles.sideBtns}>
        {(['water', 'coffee'] as const).map((id) => (
          <View key={id} style={styles.sideBtn}>
            <MiniCup size={13} color={CATALOG_BY_ID[id].color} glass={CATALOG_BY_ID[id].glass} />
          </View>
        ))}
      </View>
      <View style={styles.frog}>
        <LayeredFrog width={84} fill={Math.max(0.4, fill)} base="#2E333D" />
      </View>
    </>
  );
}

function ListDesign({ amount, pct, left }: { amount: string; pct: number; left: string }) {
  const drinks = ['water', 'juice', 'tea'];
  return (
    <>
      <Clock />
      <Text style={[styles.big, { fontSize: 15, marginTop: 14 }]}>
        {amount} • {pct}%
      </Text>
      <Text style={styles.remaining}>{left} remaining</Text>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${Math.max(5, Math.min(100, pct))}%` }]} />
      </View>
      <View style={styles.drinkRow}>
        {drinks.map((id) => {
          const d = CATALOG_BY_ID[id];
          return (
            <View key={id} style={{ alignItems: 'center' }}>
              <MiniCup size={22} color={d?.color ?? colors.water} glass={d?.glass} fill={0.85} />
              <Text style={styles.drinkLabel}>{(d?.label ?? id).split(' ').pop()}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.other}>+ Other</Text>
    </>
  );
}

/** Pick the watch home screen design and "sync" today's log to the watch. */
export function WatchScreen() {
  const { state, update, intakeMl } = useStore();
  const nav = useNav();
  const goal = goalFor(state, state.day);
  const pct = Math.round((intakeMl / goal) * 100);
  const amount = formatAmount(intakeMl, state.units);
  const left = formatAmount(Math.max(0, goal - intakeMl), state.units);
  const design = state.settings.watchDesign;
  const sync = useSimulatedTask(2600, 'Syncing with your watch');
  const choose = (watchDesign: 'frog' | 'list') => update((s) => ({ settings: { ...s.settings, watchDesign } }));

  const options = [
    { id: 'frog' as const, el: <FrogDesign amount={amount} pct={pct} fill={intakeMl / goal} /> },
    { id: 'list' as const, el: <ListDesign amount={amount} pct={pct} left={left} /> },
  ];

  return (
    <View style={{ flex: 1 }}>
      <Screen
        footer={
          <Animated.View entering={FadeInUp.delay(300).springify()}>
            <BigPill label="SYNC ALL DATA" onPress={() => sync.start(() => nav.toast('Synced to Apple Watch'))} testID="watch-sync" />
          </Animated.View>
        }
        testID="watch"
      >
        <Animated.View entering={FadeInDown.springify()}>
          <Title>Apple Watch</Title>
          <Subtitle>Choose your home screen design</Subtitle>
        </Animated.View>
        <View style={styles.row}>
          {options.map((o, i) => (
            <Animated.View key={o.id} entering={FadeInDown.delay(100 + i * 90).springify().damping(15)} style={{ alignItems: 'center' }}>
              <Bounce onPress={() => choose(o.id)} scaleTo={0.95} testID={`watch-${o.id}`}>
                <WatchBody>{o.el}</WatchBody>
              </Bounce>
              <View style={styles.checkSlot}>
                {design === o.id && (
                  <Animated.View key={o.id} entering={ZoomIn.springify().damping(9)}>
                    <CheckMark color="#4A3FB4" size={30} />
                  </Animated.View>
                )}
              </View>
            </Animated.View>
          ))}
        </View>
      </Screen>
      {sync.hud}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 6, marginHorizontal: -8 },
  screen: { position: 'absolute', left: 12, top: 66, width: 136, height: 168, borderRadius: 33, overflow: 'hidden', paddingHorizontal: 14, paddingTop: 12 },
  clock: { position: 'absolute', right: 18, top: 12, fontFamily: fonts.bold, color: '#fff', fontSize: 11 },
  big: { fontFamily: fonts.black, color: colors.water, fontSize: 19, marginTop: 18 },
  small: { fontFamily: fonts.bold, color: '#8C93A0', fontSize: 11 },
  sideBtns: { position: 'absolute', right: 12, top: 38, gap: 6 },
  sideBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#2E333D', alignItems: 'center', justifyContent: 'center' },
  frog: { position: 'absolute', left: 14, bottom: -14 },
  remaining: { fontFamily: fonts.bold, color: '#fff', fontSize: 10, marginTop: 1 },
  bar: { height: 6, borderRadius: 3, backgroundColor: '#2E333D', marginTop: 6, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3, backgroundColor: colors.water },
  drinkRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  drinkLabel: { fontFamily: fonts.bold, color: '#fff', fontSize: 8, marginTop: 2 },
  other: { fontFamily: fonts.extra, color: '#fff', fontSize: 10, textAlign: 'center', marginTop: 6 },
  checkSlot: { height: 44, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
});
