import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { CupShape } from '../lib/drinks';
import { fromDisplay, toDisplay, Units } from '../lib/hydration';
import { colors, fonts } from '../theme';
import { CloseIcon } from './BottomSheet';
import { Cup, cupGeom, useSlosh } from './Cup';
import { mix } from './CupIcon';
import { Bounce, PillButton } from './Pressable';

interface Props {
  visible: boolean;
  units: Units;
  cupMl: number;
  color?: string;
  label?: string;
  /** Cup family to pour into; the classic glass when left out. */
  shape?: CupShape;
  /** Pale tint of the drink, used for lids and caps. */
  glass?: string;
  onClose: () => void;
  /** Called once the cup has flown down into the drink button. */
  onAdd: (ml: number) => void;
}

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');

/**
 * Full-screen glass that zooms up out of the WATER button. Drag on the glass to pour
 * some out or top it up; "+ WATER" shrinks it back down into the button.
 */
export function AddSipOverlay({ visible, units, cupMl, color = colors.water, label = 'WATER', shape = 'glass', glass, onClose, onAdd }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const max = toDisplay(cupMl, units);
  const step = units === 'ml' ? 10 : 1;
  const [amount, setAmount] = useState(max);
  const level = useSharedValue(1);
  const [slosh, kick] = useSlosh();
  const enter = useSharedValue(0);
  const leave = useSharedValue(0);
  const busy = useRef(false);
  const cupWidth = Math.min(SCREEN_W * 0.74, 300);
  const cupHeight = (cupWidth * 240) / 200;
  const geom = cupGeom(shape);
  const classic = shape === 'glass';
  const handleTop = classic ? cupHeight * 0.42 : cupHeight * geom.handleY - 24;
  const handleLeft = cupWidth * geom.handleX - 24;
  // level at which the liquid surface passes the handle's centre
  const handleLevel = classic ? 0.52 : (geom.bottom - geom.handleY * 240) / (geom.bottom - geom.top);
  // very pale drinks (milk, coconut water) get dark text on their button
  const rgb = parseInt(color.slice(1), 16);
  const pale = 0.299 * ((rgb >> 16) & 255) + 0.587 * ((rgb >> 8) & 255) + 0.114 * (rgb & 255) > 215;
  const handleLit = classic || color === colors.water ? '#5EE6F0' : mix(color, '#ffffff', 0.35);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      busy.current = false;
      setAmount(max);
      level.value = 1;
      leave.value = 0;
      enter.value = 0;
      enter.value = withSpring(1, { damping: 20, stiffness: 170 });
      kick();
    } else if (mounted) {
      enter.value = withTiming(0, { duration: 220 });
      const t = setTimeout(() => setMounted(false), 240);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const startLevel = useRef(1);
  const amountRef = useRef(max);
  amountRef.current = amount;
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startLevel.current = level.value;
        },
        onPanResponderMove: (_, g) => {
          const next = Math.min(1, Math.max(0.04, startLevel.current - g.dy / (cupHeight * 0.9)));
          const snapped = Math.max(step, Math.round((next * max) / step) * step);
          level.value = next;
          setAmount(snapped);
        },
        onPanResponderRelease: () => {
          level.value = withSpring(Math.max(0.04, amountRef.current / max), { damping: 14 });
          kick();
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [max, step, cupHeight],
  );

  const add = () => {
    if (busy.current) return;
    busy.current = true;
    leave.value = withTiming(1, { duration: 520, easing: Easing.in(Easing.back(1.4)) });
    setTimeout(() => {
      onAdd(fromDisplay(amount, units));
    }, 480);
  };

  const backdrop = useAnimatedStyle(() => ({ opacity: enter.value * (1 - leave.value) }));
  const cupStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, enter.value * 1.5) * (1 - leave.value * 0.4),
    transform: [
      { translateY: (1 - enter.value) * SCREEN_H * 0.45 + leave.value * SCREEN_H * 0.5 },
      { scale: (0.25 + enter.value * 0.75) * (1 - leave.value * 0.85) },
    ],
  }));
  const controls = useAnimatedStyle(() => ({
    opacity: enter.value * (1 - leave.value * 2),
    transform: [{ translateY: (1 - enter.value) * 40 }],
  }));
  const handle = useAnimatedStyle(() => ({
    backgroundColor: level.value > handleLevel ? handleLit : '#F7F8FA',
  }));

  if (!mounted) return null;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff' }, backdrop]} />
      <Animated.View style={[styles.close, { top: insets.top + 8 }, controls]}>
        <Bounce onPress={onClose} style={styles.closeBtn} testID="cup-close">
          <CloseIcon />
        </Bounce>
      </Animated.View>
      <View style={styles.center} pointerEvents="box-none">
        <Animated.View style={cupStyle} {...pan.panHandlers} testID="cup">
          <Cup width={cupWidth} level={level} slosh={slosh} color={color} shape={shape} glass={glass} />
          <Animated.View style={[styles.handle, { top: handleTop }, classic ? null : { alignSelf: 'auto', left: handleLeft }, handle]} pointerEvents="none">
            <Chevrons />
          </Animated.View>
        </Animated.View>
        <Animated.View style={[styles.controls, controls]}>
          <View style={styles.amountRow}>
            <Text style={styles.amount}>
              {amount}
              {units}
            </Text>
            <Text style={styles.size}>
              {max}
              {units}
            </Text>
          </View>
          <PillButton label={`+ ${label}`} variant="water" onPress={add} style={[styles.addBtn, { backgroundColor: color }]} textStyle={pale ? { color: mix(color, '#000000', 0.6) } : undefined} testID="add-water" />
        </Animated.View>
      </View>
    </View>
  );
}

function Chevrons() {
  return (
    <Svg width={18} height={22} viewBox="0 0 18 22">
      <Path d="M3 8 L9 3 L15 8 M3 14 L9 19 L15 14" stroke={colors.ink} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  close: { position: 'absolute', right: 18, zIndex: 3 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  handle: {
    position: 'absolute',
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: { alignItems: 'center', marginTop: 22 },
  amountRow: { width: SCREEN_W, alignItems: 'center', justifyContent: 'center' },
  amount: { fontFamily: fonts.extra, fontSize: 34, color: colors.ink },
  size: { position: 'absolute', right: 22, fontFamily: fonts.bold, fontSize: 17, color: '#C9CED6' },
  addBtn: { marginTop: 18, paddingVertical: 14, paddingHorizontal: 30 },
});
