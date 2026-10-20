import { ReactNode, useEffect, useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming, ZoomIn, ZoomOut } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { shade, tint } from '../../components/Accessories';
import { Frog, FrogOutline } from '../../components/Frogs';
import { Bounce } from '../../components/Pressable';
import { AppState } from '../../lib/store';
import { CHALLENGES } from '../../lib/challenges';
import { Character, CHARACTERS } from '../../lib/characters';
import { colors, fonts } from '../../theme';

export const SECTIONS = {
  daily: CHARACTERS.filter((c) => c.section === 'daily'),
  challenge: CHARACTERS.filter((c) => c.section === 'challenge'),
  supporter: CHARACTERS.filter((c) => c.section === 'supporter'),
};

const PASTELS = ['#F3ECE6', '#F1F7DF', '#FBEAEC', '#E4F4EE', '#FCEEF3', '#ECEBF8', '#F7EAF0', '#FBF6DE', '#E6F2FB', '#EAF7E4'];
export const CELL_BG = '#E8F8FA';

/** The background of a challenge frog's cell: its challenge's colour, very pale. */
export function cellColor(c: Character, index: number) {
  if (c.section !== 'challenge') return CELL_BG;
  const ch = CHALLENGES.find((x) => x.characterId === c.id || x.id === c.challengeId);
  return ch ? tint(ch.color, 0.86) : PASTELS[index % PASTELS.length];
}

export function isCollected(s: AppState, id: string) {
  const c = SECTIONS.supporter.find((x) => x.id === id);
  if (c && s.supporter) return true;
  return s.character.collected.includes(id);
}

/** Grid metrics: five cells per row across the page with 16px gutters. */
export function useGrid() {
  const { width } = useWindowDimensions();
  return useMemo(() => {
    const w = Math.min(width, 480) - 32;
    const gap = 6;
    const cell = Math.floor((w - gap * 4) / 5);
    return { cell, h: Math.round(cell * 1.14), gap, frog: Math.round(cell * 0.8) };
  }, [width]);
}

export function SectionHead({ title, count, total, dark, sub }: { title: string; count: number; total: number; dark?: boolean; sub?: string }) {
  return (
    <View style={styles.headWrap}>
      <View style={styles.head}>
        <Text style={[styles.headTitle, { color: dark ? colors.ink : colors.water }]}>{title}</Text>
        <View style={[styles.countPill, { backgroundColor: dark ? colors.ink : colors.water }]}>
          <Text style={styles.countText}>
            <Text style={{ color: '#fff' }}>{count}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)' }}>/{total}</Text>
          </Text>
        </View>
      </View>
      {sub && <Text style={styles.headSub}>{sub}</Text>}
    </View>
  );
}

interface CellProps {
  c: Character;
  index: number;
  collected: boolean;
  onPress?: () => void;
  /** Drawn centred on top (check badges). */
  overlay?: ReactNode;
  /** Fades the frog, e.g. unselected in shuffle. */
  dim?: boolean;
  highlight?: boolean;
  testID?: string;
}

/** One rounded tile of the collection grid: the frog, or a pale outline while locked. */
export function Cell({ c, index, collected, onPress, overlay, dim, highlight, testID }: CellProps) {
  const g = useGrid();
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 20) * 22).duration(320)}>
      <Bounce onPress={onPress} testID={testID} scaleTo={0.9} style={[styles.cell, { width: g.cell, height: g.h, backgroundColor: cellColor(c, index) }, highlight && styles.cellHi]}>
        {collected ? (
          <Animated.View key="on" entering={ZoomIn.springify().damping(9)} style={{ opacity: dim ? 0.55 : 1 }}>
            <Frog id={c.id} width={g.frog} idle={false} />
          </Animated.View>
        ) : (
          <FrogOutline id={c.id} size={g.frog} color={c.section === 'challenge' ? shade(cellColor(c, index), 0.13) : '#BFE6EC'} />
        )}
        <View style={styles.overlay} pointerEvents="none">
          {overlay}
        </View>
      </Bounce>
    </Animated.View>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  const g = useGrid();
  return <View style={[styles.grid, { gap: g.gap }]}>{children}</View>;
}

/** Round check that pops in and out over a cell. */
export function CheckBadge({ color = colors.water, size = 30 }: { color?: string; size?: number }) {
  return (
    <Animated.View entering={ZoomIn.springify().damping(11)} exiting={ZoomOut.duration(160)} style={[styles.badge, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 14 14">
        <Path d="M3 7.5 L6 10 L11 4" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Animated.View>
  );
}

export function SmallCheck({ color, size = 10 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path d="M2.5 7.5 L6 10.5 L11.5 3.5" stroke={color} strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** The slanted purple-to-teal "HERO" label under the avatar. */
export function HeroRibbon() {
  return (
    <View style={styles.ribbon}>
      <Svg width={78} height={30} viewBox="0 0 78 30" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#8E3BE8" />
            <Stop offset="0.55" stopColor="#5B6FF0" />
            <Stop offset="1" stopColor="#14C6D6" />
          </LinearGradient>
        </Defs>
        <Path d="M8 2 L76 0 L70 28 L2 30 Z" fill="url(#heroGrad)" />
        <Path d="M10 6 L72 4" stroke="rgba(255,255,255,0.35)" strokeWidth={2} strokeLinecap="round" />
      </Svg>
      <Text style={styles.ribbonText}>HERO</Text>
    </View>
  );
}

/** The frog-face token used to collect a character. */
export function Token({ count, active, size = 26 }: { count: number; active: boolean; size?: number }) {
  const bg = active ? colors.pink : '#D9DCE1';
  return (
    <View style={{ width: size + 4, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size + 4} height={size} viewBox="0 0 30 26" style={StyleSheet.absoluteFill}>
        <Path d="M3 14 A6 6 0 0 1 9 4 A6 6 0 0 1 15 6 A6 6 0 0 1 21 4 A6 6 0 0 1 27 14 Q27 25 15 25 Q3 25 3 14 Z" fill={bg} />
      </Svg>
      <Text style={styles.tokenText}>{count}</Text>
    </View>
  );
}

const SPARKS = Array.from({ length: 16 }, (_, i) => i);

function Spark({ i, color }: { i: number; color: string }) {
  const t = useSharedValue(0);
  const a = (i / SPARKS.length) * Math.PI * 2 + (i % 2 ? 0.2 : -0.1);
  const dist = 52 + (i % 3) * 22;
  useEffect(() => {
    t.value = withDelay((i % 4) * 40, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [t, i]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.7 ? 1 : (1 - t.value) / 0.3,
    transform: [{ translateX: Math.cos(a) * dist * t.value }, { translateY: Math.sin(a) * dist * t.value }, { scale: 0.4 + t.value * 0.8 }, { rotate: `${t.value * 180}deg` }],
  }));
  const star = i % 3 !== 2;
  return (
    <Animated.View style={[styles.spark, style]}>
      <Svg width={i % 3 === 1 ? 26 : 18} height={i % 3 === 1 ? 26 : 18} viewBox="0 0 16 16">
        {star ? (
          <Path d="M8 0 L9.8 6.2 L16 8 L9.8 9.8 L8 16 L6.2 9.8 L0 8 L6.2 6.2 Z" fill={color} />
        ) : (
          <Path d="M8 1 Q13 8 13 10.5 A5 5 0 0 1 3 10.5 Q3 8 8 1 Z" fill={colors.water} />
        )}
      </Svg>
    </Animated.View>
  );
}

/** Little stars and drops that fly out of a cell when a new frog is collected. */
export function SparkleBurst() {
  const colorsList = ['#FFD45C', colors.pink, colors.water, colors.purple];
  return (
    <View pointerEvents="none" style={styles.burst}>
      {SPARKS.map((i) => (
        <Spark key={i} i={i} color={colorsList[i % colorsList.length]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  headWrap: { marginTop: 28, marginBottom: 12 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headTitle: { fontFamily: fonts.black, fontSize: 30 },
  headSub: { fontFamily: fonts.semibold, fontSize: 15, color: colors.inkSoft, lineHeight: 21, marginTop: 6 },
  countPill: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5 },
  countText: { fontFamily: fonts.black, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { borderRadius: 14, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6, overflow: 'visible' },
  cellHi: { borderWidth: 2.5, borderColor: colors.water },
  overlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  badge: { alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: '#fff' },
  ribbon: { width: 78, height: 30, alignItems: 'center', justifyContent: 'center' },
  ribbonText: { fontFamily: fonts.black, fontStyle: 'italic', fontSize: 17, color: '#fff', letterSpacing: 0.5 },
  tokenText: { fontFamily: fonts.black, fontSize: 13, marginTop: 4, color: '#fff' },
  spark: { position: 'absolute', left: -10, top: -10 },
  burst: { position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, overflow: 'visible' },
});
