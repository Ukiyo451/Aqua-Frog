import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { Units } from '../../lib/hydration';
import { colors, fonts } from '../../theme';

export const PINK = '#C9619A';

/** Wheel values for a cup size: 10ml steps from 50 to 1000ml, or whole ounces. */
export function sizeValues(units: Units): number[] {
  if (units === 'oz') return Array.from({ length: 33 }, (_, i) => i + 2);
  return Array.from({ length: 96 }, (_, i) => 50 + i * 10);
}

export const HYDRATION_VALUES = Array.from({ length: 91 }, (_, i) => -300 + i * 5);
/** 0 stands for "No" caffeine. */
export const CAFFEINE_VALUES = [0, ...Array.from({ length: 80 }, (_, i) => 5 + i * 5)];

export const formatPct = (ratio: number) => `${Math.round(ratio * 100)}%`;
export const formatCaffeine = (mg: number) => (mg > 0 ? `${mg}mg` : 'No');

/** Snaps a value to the nearest entry of a wheel. */
export function nearest(values: number[], v: number): number {
  return values.reduce((best, x) => (Math.abs(x - v) < Math.abs(best - v) ? x : best), values[0]);
}

/** Top bar of the edit pages: pink CANCEL on the left, DONE on the right. */
export function CancelDoneBar({ onCancel, onDone, children, prefix = 'edit' }: { onCancel: () => void; onDone: () => void; children?: ReactNode; prefix?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + 10 }]}>
      <Pressable onPress={onCancel} hitSlop={10} testID={`${prefix}-cancel`} style={({ pressed }) => pressed && { opacity: 0.5 }}>
        <Text style={styles.barText}>CANCEL</Text>
      </Pressable>
      {children}
      <Pressable onPress={onDone} hitSlop={10} testID={`${prefix}-done`} style={({ pressed }) => pressed && { opacity: 0.5 }}>
        <Text style={styles.barText}>DONE</Text>
      </Pressable>
    </View>
  );
}

/* ───────────── glyphs ───────────── */

export function SlidersIcon({ color = colors.water, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path d="M3.5 1.5 V12.5 M10.5 1.5 V12.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M1.8 8.5 H5.2 M8.8 4.5 H12.2" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}

export function PencilIcon({ color = colors.water, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path d="M2 12 L2.6 9.4 L9.6 2.4 Q10.4 1.6 11.2 2.4 L11.6 2.8 Q12.4 3.6 11.6 4.4 L4.6 11.4 Z" fill={color} />
      <Path d="M1.6 12.8 H6" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  );
}

export function DragHandleIcon({ color = '#C5CAD2' }: { color?: string }) {
  return (
    <Svg width={20} height={14} viewBox="0 0 20 14">
      <Path d="M2 2 H18 M2 7 H18 M2 12 H18" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

/** Tiny up/down chevrons drawn above and below a size value. */
export function UpDown({ children }: { children: ReactNode }) {
  return (
    <View style={styles.upDown}>
      <Svg width={10} height={5} viewBox="0 0 10 5">
        <Path d="M1.5 4 L5 1 L8.5 4" stroke="#BCEFF4" strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      {children}
      <Svg width={10} height={5} viewBox="0 0 10 5">
        <Path d="M1.5 1 L5 4 L8.5 1" stroke="#BCEFF4" strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

export function CheckBadge({ size = 20 }: { size?: number }) {
  return (
    <View style={[styles.check, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 14 14">
        <Path d="M3 7.5 L6 10 L11 4" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

export function DropTileIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M12 3 Q18 10.5 18 14.5 A6 6 0 0 1 6 14.5 Q6 10.5 12 3 Z" fill={colors.water} />
      <Circle cx={9.6} cy={15} r={1.4} fill="#fff" opacity={0.7} />
    </Svg>
  );
}

export function WineTileIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M7 3 H17 Q17.6 9 15 11 Q13.6 12 12 12 Q10.4 12 9 11 Q6.4 9 7 3 Z" fill="#B23A57" />
      <Path d="M12 12 V19 M8.5 20 H15.5" stroke="#B23A57" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function BeanTileIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M12 3.5 C17.5 3.5 19.5 9 18.6 13.4 C17.6 18.4 13.6 20.8 10.2 20.3 C5.8 19.6 4.4 14.8 5.4 10.6 C6.4 6.4 8.8 3.5 12 3.5 Z" fill="#7A4A34" />
      <Path d="M13.6 4.4 C10 8 14.4 13 10.4 19.6" stroke="#F1E6DF" strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 6 },
  barText: { fontFamily: fonts.black, fontSize: 14, letterSpacing: 0.8, color: PINK },
  upDown: { alignItems: 'center', gap: 1 },
  check: { backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
});
