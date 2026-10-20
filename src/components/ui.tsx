import { ReactNode, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Share, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolateColor,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useNav } from '../navigation/nav';
import { colors, fonts } from '../theme';
import { BottomSheet, CloseIcon } from './BottomSheet';
import { Bounce, PillButton } from './Pressable';
import { WheelPicker } from './WheelPicker';

/* ───────────── icons ───────────── */

export function ChevronIcon({ size = 12, color = '#C3C8D0', dir = 'right' }: { size?: number; color?: string; dir?: 'right' | 'left' | 'down' | 'up' }) {
  const rot = { right: 0, down: 90, left: 180, up: 270 }[dir];
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" style={{ transform: [{ rotate: `${rot}deg` }] }}>
      <Path d="M4 1.5 L8.5 6 L4 10.5" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/* ───────────── screen chrome ───────────── */

/** Grey round back button in the top-left corner, as on every settings page. */
export function BackButton({ onPress, style }: { onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const nav = useNav();
  return (
    <Bounce onPress={onPress ?? nav.back} style={[styles.round, style]} testID="back">
      <ChevronIcon dir="left" color="#fff" size={13} />
    </Bounce>
  );
}

/** Light round close button in the top-right corner of modal pages. */
export function CloseButton({ onPress, style }: { onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const nav = useNav();
  return (
    <Bounce onPress={onPress ?? nav.back} style={[styles.close, style]} testID="close">
      <CloseIcon color="#fff" size={11} />
    </Bounce>
  );
}

interface ScreenProps {
  children: ReactNode;
  /** 'back' for pushed pages (top-left), 'close' for modal pages (top-right). */
  chrome?: 'back' | 'close' | 'none';
  /** Small pill on the right of the back button, e.g. "WHAT'S NEW". */
  right?: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  bg?: string;
  /** Content pinned to the bottom (a big action button). */
  footer?: ReactNode;
  onBack?: () => void;
  testID?: string;
}

/** Page frame: safe-area padding, back/close button, optional scrolling and footer. */
export function Screen({ children, chrome = 'back', right, scroll = true, style, contentStyle, bg = colors.bg, footer, onBack, testID }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const top = insets.top + 8;
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[{ paddingTop: top + 48, paddingBottom: insets.bottom + (footer ? 120 : 40), paddingHorizontal: 16 }, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, paddingTop: top + 48, paddingBottom: insets.bottom, paddingHorizontal: 16 }, contentStyle]}>{children}</View>
  );
  return (
    <View style={[{ flex: 1, backgroundColor: bg }, style]} testID={testID}>
      {body}
      {/* keeps scrolled content from showing through behind the back/close buttons */}
      {scroll && chrome !== 'none' && <View pointerEvents="none" style={[styles.barBg, { height: top + 44, backgroundColor: bg }]} />}
      <View style={[styles.bar, { top }]} pointerEvents="box-none">
        {chrome === 'back' ? <BackButton onPress={onBack} /> : <View />}
        <View style={styles.barRight}>
          {right}
          {chrome === 'close' && <CloseButton onPress={onBack} />}
        </View>
      </View>
      {footer && <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>{footer}</View>}
    </View>
  );
}

export function HeaderPill({ label, onPress, color = colors.muted, bg = '#F2F3F5', testID }: { label: string; onPress?: () => void; color?: string; bg?: string; testID?: string }) {
  return (
    <Bounce onPress={onPress} style={[styles.headerPill, { backgroundColor: bg }]} testID={testID}>
      <Text style={[styles.headerPillText, { color }]}>{label}</Text>
    </Bounce>
  );
}

export function Title({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Subtitle({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.subtitle, style]}>{children}</Text>;
}

export function Paragraph({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.paragraph, style]}>{children}</Text>;
}

export function SectionLabel({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.sectionLabel, style]}>{children}</Text>;
}

/* ───────────── rows ───────────── */

interface RowProps {
  label: string;
  sub?: string;
  value?: string;
  valueColor?: string;
  left?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  /** 'card' = grey rounded tile (settings), 'line' = hairline-separated table row. */
  look?: 'card' | 'line';
  selected?: boolean;
  labelStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export function ListRow({ label, sub, value, valueColor, left, right, onPress, chevron = !!onPress, look = 'card', selected, labelStyle, testID }: RowProps) {
  const content = (
    <View style={[look === 'card' ? styles.cardRow : styles.lineRow, selected && look === 'card' && styles.cardRowSelected]}>
      {left && <View style={styles.rowLeft}>{left}</View>}
      <View style={{ flex: 1 }}>
        <Text style={[look === 'card' ? styles.cardLabel : styles.lineLabel, selected && { color: colors.water }, labelStyle]}>{label}</Text>
        {sub ? <Text style={[styles.rowSub, selected && { color: colors.water }]}>{sub}</Text> : null}
      </View>
      {value ? <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text> : null}
      {right}
      {selected && !right ? <CheckMark /> : null}
      {chevron && !selected ? <View style={{ marginLeft: 8 }}><ChevronIcon /></View> : null}
    </View>
  );
  if (!onPress) return <View testID={testID}>{content}</View>;
  return (
    <Bounce onPress={onPress} scaleTo={0.98} testID={testID}>
      {content}
    </Bounce>
  );
}

export function CheckMark({ color = colors.water, filled = true, size = 22 }: { color?: string; filled?: boolean; size?: number }) {
  return (
    <Animated.View entering={ZoomIn.springify().damping(12)} style={[{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }, filled && { backgroundColor: color }]}>
      <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 14 14">
        <Path d="M3 7.5 L6 10 L11 4" stroke={filled ? '#fff' : color} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Animated.View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

/* ───────────── toggle ───────────── */

/** iOS-style switch; the knob springs across and the track floods teal. */
export function Toggle({ value, onChange, testID, color = colors.water }: { value: boolean; onChange: (v: boolean) => void; testID?: string; color?: string }) {
  const t = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    t.value = withSpring(value ? 1 : 0, { damping: 16, stiffness: 220 });
  }, [value, t]);
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(t.value, [0, 1], ['#E6E8EC', color]) }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: t.value * 20 }] }));
  return (
    <Pressable onPress={() => onChange(!value)} testID={testID} hitSlop={8}>
      <Animated.View style={[styles.track, track]}>
        <Animated.View style={[styles.knob, knob]} />
      </Animated.View>
    </Pressable>
  );
}

export function ToggleRow({ label, sub, value, onChange, look = 'line', testID }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void; look?: 'card' | 'line'; testID?: string }) {
  return <ListRow label={label} sub={sub} look={look} chevron={false} right={<Toggle value={value} onChange={onChange} testID={testID} />} />;
}

/* ───────────── dialogs ───────────── */

export interface DialogAction {
  label: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

/** iOS-style alert: zooms in over a dimmed page. */
export function Dialog({ visible, title, message, actions, onClose, icon }: { visible: boolean; title: string; message?: string; actions: DialogAction[]; onClose: () => void; icon?: ReactNode }) {
  if (!visible) return null;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(160)} style={[StyleSheet.absoluteFill, styles.dim]} />
      <View style={styles.dialogWrap} pointerEvents="box-none">
        <Animated.View entering={ZoomIn.springify().damping(16).stiffness(260)} exiting={FadeOut.duration(140)} style={styles.dialog}>
          <View style={styles.dialogBody}>
            {icon}
            <Text style={styles.dialogTitle}>{title}</Text>
            {message ? <Text style={styles.dialogMsg}>{message}</Text> : null}
          </View>
          <View style={[styles.dialogActions, actions.length > 2 && { flexDirection: 'column' }]}>
            {actions.map((a, i) => (
              <Pressable
                key={a.label}
                testID={`dialog-${a.label.toLowerCase().replace(/\s+/g, '-')}`}
                onPress={() => {
                  onClose();
                  a.onPress?.();
                }}
                style={({ pressed }) => [styles.dialogBtn, i > 0 && (actions.length > 2 ? styles.dialogBtnTop : styles.dialogBtnLeft), pressed && { backgroundColor: '#E9EAEE' }]}
              >
                <Text style={[styles.dialogBtnText, a.style === 'destructive' && { color: '#E5484D' }, a.style === 'cancel' && { fontFamily: fonts.regular }]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

/** iOS-style action sheet with a separate Cancel button. */
export function ActionSheet({ visible, actions, onClose }: { visible: boolean; actions: DialogAction[]; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(180)} style={[StyleSheet.absoluteFill, styles.dim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View entering={SlideUp} exiting={FadeOut.duration(150)} style={[styles.sheetWrap, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.sheetGroup}>
          {actions.map((a, i) => (
            <Pressable
              key={a.label}
              testID={`action-${a.label.toLowerCase().replace(/\s+/g, '-')}`}
              onPress={() => {
                onClose();
                a.onPress?.();
              }}
              style={({ pressed }) => [styles.sheetBtn, i > 0 && styles.dialogBtnTop, pressed && { backgroundColor: '#E9EAEE' }]}
            >
              <Text style={[styles.sheetBtnText, a.style === 'destructive' && { color: '#E5484D' }]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={onClose} style={({ pressed }) => [styles.sheetGroup, styles.sheetBtn, { marginTop: 8 }, pressed && { backgroundColor: '#E9EAEE' }]} testID="action-cancel">
          <Text style={[styles.sheetBtnText, { fontFamily: fonts.extra }]}>Cancel</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const SlideUp = SlideInDown.springify().damping(20).stiffness(180);

/** Full-screen spinner card ("34% Please don't leave this screen"). */
export function ProgressHud({ visible, text, percent }: { visible: boolean; text: string; percent?: number }) {
  if (!visible) return null;
  return (
    <View style={[StyleSheet.absoluteFill, styles.hudWrap]}>
      <Animated.View entering={ZoomIn.springify().damping(15)} exiting={FadeOut} style={styles.hud}>
        <ActivityIndicator color="#fff" size="large" />
        {percent !== undefined && <Text style={styles.hudPct}>{Math.round(percent)}%</Text>}
        <Text style={styles.hudText}>{text}</Text>
      </Animated.View>
    </View>
  );
}

/* ───────────── segmented control ───────────── */

export function Segmented<T extends string>({ options, value, onChange, color = colors.blue }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; color?: string }) {
  const [w, setW] = useState(0);
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const x = useSharedValue(idx);
  useEffect(() => {
    x.value = withSpring(idx, { damping: 18, stiffness: 220 });
  }, [idx, x]);
  const seg = w / options.length;
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * seg }], width: seg }));
  return (
    <View style={[styles.seg, { backgroundColor: `${color}22` }]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && <Animated.View style={[styles.segThumb, { backgroundColor: color }, thumb]} />}
      {options.map((o) => (
        <Pressable key={o.value} style={styles.segBtn} onPress={() => onChange(o.value)} testID={`seg-${o.value}`}>
          <Text style={[styles.segText, { color: o.value === value ? '#fff' : color }]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/* ───────────── pickers ───────────── */

export function formatTime(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

/** Hour / minute / AM-PM wheels; value is minutes after midnight. */
export function TimeWheels({ value, onChange, minuteStep = 1 }: { value: number; onChange: (min: number) => void; minuteStep?: number }) {
  const h24 = Math.floor(value / 60) % 24;
  const minute = value % 60;
  const hour = h24 % 12 === 0 ? 12 : h24 % 12;
  const pm = h24 >= 12;
  const minutes = useMemo(() => MINUTES.filter((m) => m % minuteStep === 0), [minuteStep]);
  const set = (h: number, m: number, isPm: boolean) => onChange(((h % 12) + (isPm ? 12 : 0)) * 60 + m);
  return (
    <View style={styles.wheels}>
      <WheelPicker values={HOURS} value={hour} onChange={(h) => set(h, minute, pm)} width={70} testID="wheel-hour" />
      <WheelPicker values={minutes} value={minutes.includes(minute) ? minute : minutes[0]} onChange={(m) => set(hour, m, pm)} format={(m) => String(m).padStart(2, '0')} width={70} testID="wheel-minute" />
      <WheelPicker values={['AM', 'PM']} value={pm ? 'PM' : 'AM'} onChange={(v) => set(hour, minute, v === 'PM')} width={70} testID="wheel-ampm" />
    </View>
  );
}

/** Bottom sheet with a title, any wheel(s) and a dark DONE button. */
export function PickerSheet({ visible, title, eyebrow, onClose, onDone, children }: { visible: boolean; title: string; eyebrow?: string; onClose: () => void; onDone: () => void; children: ReactNode }) {
  return (
    <BottomSheet visible={visible} onClose={onClose} showClose>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.sheetTitle}>{title}</Text>
      <View style={{ alignItems: 'center' }}>{children}</View>
      <PillButton label="DONE" onPress={onDone} style={styles.doneBtn} testID="picker-done" />
    </BottomSheet>
  );
}

/* ───────────── misc ───────────── */

/** Opens the system share sheet (Web Share API in the browser), falling back to a toast. */
export function useShare() {
  const nav = useNav();
  return async (message: string) => {
    try {
      if (Platform.OS === 'web') {
        const n = typeof navigator !== 'undefined' ? (navigator as Navigator & { share?: (d: { text: string }) => Promise<void> }) : undefined;
        if (n?.share) await n.share({ text: message });
        else if (n?.clipboard) {
          await n.clipboard.writeText(message);
          nav.toast('Copied to clipboard');
        }
        return;
      }
      await Share.share({ message });
    } catch {
      // the person closed the share sheet
    }
  };
}

/** Animates a number from 0 to `to` over `ms`; used by progress HUDs and counters. */
export function useProgress(running: boolean, ms: number, onDone?: () => void) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!running) {
      setP(0);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / ms);
      setP(Easing.inOut(Easing.cubic)(t) * 100);
      if (t >= 1) {
        clearInterval(id);
        onDone?.();
      }
    }, 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, ms]);
  return p;
}

/** Shared value that springs 0→1 on mount, for simple staggered entrances. */
export function useEnter(delay = 0) {
  const v = useSharedValue(0);
  useEffect(() => {
    const t = setTimeout(() => {
      v.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.back(1.4)) });
    }, delay);
    return () => clearTimeout(t);
  }, [v, delay]);
  return v;
}

export function formatDate(day: string, opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', opts);
}

export function formatClock(at: number): string {
  const d = new Date(at);
  return formatTime(d.getHours() * 60 + d.getMinutes());
}

export const ui = StyleSheet.create({
  bigButton: { alignSelf: 'center', minWidth: 220, paddingVertical: 18 },
  softButton: { alignSelf: 'center', backgroundColor: colors.waterLight, shadowOpacity: 0, paddingVertical: 14, paddingHorizontal: 28 },
  softButtonText: { color: colors.water, fontSize: 14, letterSpacing: 0.6 },
  card: { backgroundColor: '#F7F8FA', borderRadius: 20, padding: 16 },
});

const styles = StyleSheet.create({
  round: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#D3D6DC', alignItems: 'center', justifyContent: 'center' },
  close: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#D9DCE1', alignItems: 'center', justifyContent: 'center' },
  bar: { position: 'absolute', left: 14, right: 14, height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barBg: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0.94 },
  barRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', paddingTop: 12 },
  headerPill: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  headerPillText: { fontFamily: fonts.black, fontSize: 11, letterSpacing: 0.8 },
  title: { fontFamily: fonts.extra, fontSize: 30, color: colors.ink, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 18 },
  paragraph: { fontFamily: fonts.semibold, fontSize: 16, color: colors.inkSoft, lineHeight: 24, marginBottom: 14 },
  sectionLabel: { fontFamily: fonts.black, fontSize: 12, color: colors.muted, letterSpacing: 1, marginTop: 18, marginBottom: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8FA', borderRadius: 18, paddingHorizontal: 16, minHeight: 54, paddingVertical: 12, marginBottom: 10 },
  cardRowSelected: { backgroundColor: '#E3F7FA' },
  lineRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E4E6EA' },
  rowLeft: { marginRight: 12 },
  cardLabel: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  lineLabel: { fontFamily: fonts.black, fontSize: 14, color: colors.ink, letterSpacing: 0.4 },
  rowSub: { fontFamily: fonts.bold, fontSize: 12, color: colors.muted, marginTop: 2 },
  rowValue: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted, marginLeft: 8 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E4E6EA', marginVertical: 18 },
  track: { width: 50, height: 30, borderRadius: 15, padding: 3 },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  dim: { backgroundColor: 'rgba(30,36,48,0.42)' },
  dialogWrap: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  dialog: { width: 270, borderRadius: 16, backgroundColor: '#F4F4F6', overflow: 'hidden' },
  dialogBody: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 16, alignItems: 'center' },
  dialogTitle: { fontFamily: fonts.extra, fontSize: 17, color: '#111', textAlign: 'center' },
  dialogMsg: { fontFamily: fonts.semibold, fontSize: 13, color: '#333', textAlign: 'center', marginTop: 4, lineHeight: 18 },
  dialogActions: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#C8C8CC' },
  dialogBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  dialogBtnLeft: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: '#C8C8CC' },
  dialogBtnTop: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#C8C8CC' },
  dialogBtnText: { fontFamily: fonts.bold, fontSize: 17, color: '#2E7CF6' },
  sheetWrap: { position: 'absolute', left: 10, right: 10, bottom: 0 },
  sheetGroup: { backgroundColor: '#F4F4F6', borderRadius: 14, overflow: 'hidden' },
  sheetBtn: { paddingVertical: 17, alignItems: 'center' },
  sheetBtnText: { fontFamily: fonts.semibold, fontSize: 19, color: '#2E7CF6' },
  hudWrap: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.4)' },
  hud: { width: 180, borderRadius: 18, backgroundColor: 'rgba(40,44,52,0.86)', alignItems: 'center', paddingVertical: 22, paddingHorizontal: 14 },
  hudPct: { fontFamily: fonts.extra, color: '#fff', fontSize: 16, marginTop: 10 },
  hudText: { fontFamily: fonts.bold, color: '#fff', fontSize: 14, textAlign: 'center', marginTop: 4 },
  seg: { flexDirection: 'row', borderRadius: 14, height: 46, overflow: 'hidden' },
  segThumb: { position: 'absolute', top: 0, bottom: 0, left: 0, borderRadius: 14 },
  segBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  segText: { fontFamily: fonts.extra, fontSize: 15 },
  wheels: { flexDirection: 'row', justifyContent: 'center' },
  eyebrow: { fontFamily: fonts.black, fontSize: 12, color: colors.muted, letterSpacing: 1, textAlign: 'center', marginBottom: 6 },
  sheetTitle: { fontFamily: fonts.extra, fontSize: 26, color: colors.ink, textAlign: 'center', marginBottom: 14 },
  doneBtn: { alignSelf: 'center', width: 160, marginTop: 18, paddingVertical: 15 },
});
