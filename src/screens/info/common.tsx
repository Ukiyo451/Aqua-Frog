import { ReactNode, useEffect, useId, useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { outline, TOP_Y, VB_H, VB_W } from '../../components/Lily';
import { Bounce } from '../../components/Pressable';
import { ProgressHud, useProgress } from '../../components/ui';
import { colors, fonts } from '../../theme';

/** Lily's rainbow layers, bottom to top. */
export const LAYERS = ['#4A3FB4', '#14C6D6', '#7ED957', '#FFB23F', '#FF4F8B'];

/**
 * Lily's outline filled with stacked colour bands from the feet up, like a day of drinks
 * poured into her; the empty part keeps the base colour.
 */
export function LayeredFrog({ width, fill = 1, base = '#EDEFF2', layers = LAYERS, eyes = true, style }: { width: number; fill?: number; base?: string; layers?: string[]; eyes?: boolean; style?: StyleProp<ViewStyle> }) {
  const id = `lf${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const height = (width * VB_H) / VB_W;
  const bottom = 258;
  const top = bottom - Math.max(0, Math.min(1, fill)) * (bottom - TOP_Y);
  const band = (bottom - top) / layers.length;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`} style={style}>
      <Defs>
        <ClipPath id={id}>{outline('#000')}</ClipPath>
      </Defs>
      {outline(base)}
      <G clipPath={`url(#${id})`}>
        {layers.map((c, i) => (
          <Rect key={c + i} x={0} y={bottom - band * (i + 1) - 1} width={VB_W} height={band + 2} fill={c} />
        ))}
      </G>
      {eyes && (
        <G>
          <Circle cx={56} cy={60} r={12} fill="#fff" opacity={0.9} />
          <Circle cx={164} cy={60} r={12} fill="#fff" opacity={0.9} />
          <Circle cx={58} cy={62} r={5.5} fill="#262F3D" />
          <Circle cx={162} cy={62} r={5.5} fill="#262F3D" />
          <Path d="M84 112 Q110 130 136 112" stroke="#262F3D" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.7} />
        </G>
      )}
    </Svg>
  );
}

/** Gentle forever up-and-down float. */
export function Bob({ children, amp = 6, ms = 1600, delay = 0, rotate = 0, style }: { children: ReactNode; amp?: number; ms?: number; delay?: number; rotate?: number; style?: StyleProp<ViewStyle> }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: ms, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [t, ms, delay]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: (t.value - 0.5) * 2 * amp }, { rotate: `${(t.value - 0.5) * 2 * rotate}deg` }] }));
  return <Animated.View style={[a, style]}>{children}</Animated.View>;
}

/** Big round coloured action pill ("SYNC ALL DATA"). */
export function BigPill({ label, onPress, color = colors.water, disabled, icon, testID, style }: { label: string; onPress?: () => void; color?: string; disabled?: boolean; icon?: ReactNode; testID?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Bounce onPress={disabled ? undefined : onPress} testID={testID} style={[styles.pill, { backgroundColor: color, opacity: disabled ? 0.35 : 1 }, style]}>
      {icon}
      <Text style={styles.pillText}>{label}</Text>
    </Bounce>
  );
}

/** Runs a fake long task behind a "Please don't leave this screen" HUD. */
export function useSimulatedTask(ms: number, text = "Please don't leave this screen") {
  const [job, setJob] = useState<(() => void) | null>(null);
  const percent = useProgress(!!job, ms, () => {
    const done = job;
    setJob(null);
    done?.();
  });
  const start = (onDone: () => void) => setJob(() => onDone);
  const hud = <ProgressHud visible={!!job} text={text} percent={percent} />;
  return { start, running: !!job, hud };
}

/** "JAN 10 2023 • 6:49 PM" */
export function formatStamp(at: number): string {
  const d = new Date(at);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '').toUpperCase();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} • ${time}`;
}

/** A soft looping wiggle-pulse, for small glyphs that need life. */
export function Pulse({ children, ms = 1400, scale = 0.08 }: { children: ReactNode; ms?: number; scale?: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withSequence(withTiming(1, { duration: ms / 2, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: ms / 2, easing: Easing.in(Easing.quad) })), -1);
  }, [t, ms]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: 1 + t.value * scale }] }));
  return <Animated.View style={a}>{children}</Animated.View>;
}

export function HeartGlyph({ size = 60 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Path d="M30 52 C8 38 4 26 8 18 C12 9 24 8 30 18 C36 8 48 9 52 18 C56 26 52 38 30 52 Z" fill="#FF4F6E" />
      <Path d="M14 20 Q16 14 22 14" stroke="#fff" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.55} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 999,
    minWidth: 230,
    justifyContent: 'center',
    paddingVertical: 19,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  pillText: { fontFamily: fonts.black, fontSize: 18, color: '#fff', letterSpacing: 0.6 },
});
