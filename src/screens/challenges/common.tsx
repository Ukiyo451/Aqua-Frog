import { ReactNode, useEffect, useMemo } from 'react';
import { Dimensions, Platform, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { Frog } from '../../components/Frogs';
import { Challenge, challengeById, CHALLENGES } from '../../lib/challenges';
import { colors, fonts } from '../../theme';

/** Mixes a colour toward white; `amount` 0 keeps it, 1 is white. */
export function tint(color: string, amount: number): string {
  const n = parseInt(color.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** The challenge for a screen's params; web previews can pass `&id=` in the URL. */
export function useChallengeParam(id: string | undefined): Challenge {
  return useMemo(() => {
    let key = id;
    if (!key && Platform.OS === 'web' && typeof window !== 'undefined') key = new URLSearchParams(window.location.search).get('id') ?? undefined;
    return challengeById(key) ?? CHALLENGES[1];
  }, [id]);
}

export function eyebrowFor(c: Challenge): string {
  return `${c.days}-DAY CHALLENGE`;
}

export function inviteText(c: Challenge): string {
  return `I'm taking the ${c.title} challenge on Lily 🐸 ${c.days} days: ${c.tagline} Join me and let's stay hydrated together! 💧`;
}

export function ShareGlyph({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Path d="M10 2.5 V12.5 M6.3 6 L10 2.5 L13.7 6" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.5 9 H5 a1.5 1.5 0 0 0 -1.5 1.5 V16 a1.5 1.5 0 0 0 1.5 1.5 H15 a1.5 1.5 0 0 0 1.5 -1.5 V10.5 a1.5 1.5 0 0 0 -1.5 -1.5 H13.5" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function CheckGlyph({ size = 18, color, check = '#fff' }: { size?: number; color: string; check?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Circle cx={10} cy={10} r={10} fill={color} />
      <Path d="M5.8 10.3 L8.7 13 L14.2 7.3" stroke={check} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function TrophyGlyph({ size = 16, color = colors.muted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Path d="M6 3 H14 V8 a4 4 0 0 1 -8 0 Z" stroke={color} strokeWidth={1.8} fill="none" strokeLinejoin="round" />
      <Path d="M6 4.5 H3.5 V6 a3 3 0 0 0 3 3 M14 4.5 H16.5 V6 a3 3 0 0 1 -3 3 M10 12 V15 M6.5 17 H13.5" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** Faint water rings and dots scattered over a card, like WaterLlama's card texture. */
export function CardDecor({ seed = 0 }: { seed?: number }) {
  const dots = useMemo(() => {
    let x = seed * 9301 + 49297;
    const r = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: 9 }, () => ({ cx: r() * 100, cy: r() * 100, r: 1.5 + r() * 3.5, ring: r() > 0.5 }));
  }, [seed]);
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none" pointerEvents="none">
      {dots.map((d, i) =>
        d.ring ? (
          <Circle key={i} cx={d.cx} cy={d.cy} r={d.r} stroke="rgba(255,255,255,0.10)" strokeWidth={0.8} fill="none" />
        ) : (
          <Circle key={i} cx={d.cx} cy={d.cy} r={d.r * 0.4} fill="rgba(255,255,255,0.10)" />
        ),
      )}
    </Svg>
  );
}

/** A frog that breathes a little on its own, for the cards and the detail header. */
export function PeekingFrog({ c, width, style }: { c: Challenge; width: number; style?: StyleProp<ViewStyle> }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [t]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: -t.value * 3 }, { rotate: `${-4 + t.value * 2}deg` }] }));
  return (
    <Animated.View style={[{ position: 'absolute' }, style, anim]} pointerEvents="none">
      <Frog id={c.characterId} width={width} />
    </Animated.View>
  );
}

/** Rounded challenge card: colour, eyebrow, white title and the frog peeking in from the right. */
export function ChallengeCard({
  c,
  height = 150,
  titleSize = 26,
  frogWidth,
  children,
  style,
  top,
  footer,
  textRight,
  frogStyle,
}: {
  c: Challenge;
  height?: number;
  titleSize?: number;
  frogWidth?: number;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Small strip above the eyebrow (the active challenge's "✓ 9d"). */
  top?: ReactNode;
  /** Full-width content under the text (the limited card's button). */
  footer?: ReactNode;
  /** Room kept free for the frog on the right of the text. */
  textRight?: number;
  frogStyle?: StyleProp<ViewStyle>;
}) {
  const fw = frogWidth ?? height * 1.05;
  return (
    <View style={[styles.card, { backgroundColor: c.color, minHeight: height }, style]}>
      <CardDecor seed={c.id.length * 7 + c.days} />
      <PeekingFrog c={c} width={fw} style={frogStyle ?? { right: -fw * 0.03, bottom: -fw * 0.42 }} />
      {top}
      <View style={[styles.cardText, { paddingRight: textRight ?? fw * 0.85 }]}>
        <Text style={[styles.eyebrow, { color: c.deep }]}>{eyebrowFor(c)}</Text>
        <Text style={[styles.cardTitle, { fontSize: titleSize, lineHeight: titleSize * 1.12 }]}>{c.title}</Text>
        {children}
      </View>
      {footer}
    </View>
  );
}

const { width: SW, height: SH } = Dimensions.get('window');
const DROP_COLORS = ['#14C6D6', '#0AAFC0', '#7FE3EC', '#BFF1F6', '#3FB4C7'];

function Drop({ seed }: { seed: number }) {
  const p = useMemo(
    () => ({
      x: Math.random() * SW,
      size: 8 + Math.random() * 12,
      delay: Math.random() * 900,
      dur: 2400 + Math.random() * 1800,
      sway: (Math.random() - 0.5) * 50,
      color: DROP_COLORS[seed % DROP_COLORS.length],
    }),
    [seed],
  );
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(p.delay, withTiming(1, { duration: p.dur, easing: Easing.in(Easing.quad) }));
  }, [t, p]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 || t.value === 1 ? 0 : 1,
    transform: [{ translateX: p.x + Math.sin(t.value * 5) * 12 + p.sway * t.value }, { translateY: -30 + t.value * (SH + 60) }, { rotate: `${Math.sin(t.value * 8) * 18}deg` }],
  }));
  return (
    <Animated.View style={[styles.drop, style]}>
      <Svg width={p.size} height={p.size * 1.3} viewBox="0 0 20 26">
        <Path d="M10 1 C10 1 2 11 2 17 a8 8 0 0 0 16 0 C18 11 10 1 10 1 Z" fill={p.color} />
      </Svg>
    </Animated.View>
  );
}

/** A one-off shower of teal water drops. */
export function DropConfetti({ count = 46 }: { count?: number }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }, (_, i) => (
        <Drop key={i} seed={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 30, overflow: 'hidden' },
  cardText: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 22 },
  eyebrow: { fontFamily: fonts.black, fontSize: 11, letterSpacing: 1, marginBottom: 6 },
  cardTitle: { fontFamily: fonts.extra, color: '#fff' },
  drop: { position: 'absolute', left: 0, top: 0 },
});
