import { ReactNode, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';
import { Bounce } from './Pressable';

interface Props {
  visible: boolean;
  onClose?: () => void;
  children: ReactNode;
  /** Dims the page behind with a tint instead of grey (the goal screen uses teal). */
  dimColor?: string;
  showClose?: boolean;
  dismissable?: boolean;
}

/** Springs up from the bottom over a dimmed backdrop; slides back down on close. */
export function BottomSheet({ visible, onClose, children, dimColor = 'rgba(30,36,48,0.45)', showClose, dismissable = true }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withSpring(1, { damping: 18, stiffness: 160, mass: 0.9 });
    } else {
      progress.value = withTiming(0, { duration: 260, easing: Easing.in(Easing.cubic) });
      const t = setTimeout(() => setMounted(false), 280);
      return () => clearTimeout(t);
    }
  }, [visible, progress]);

  const backdrop = useAnimatedStyle(() => ({ opacity: Math.min(progress.value, 1) }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * 600 }] }));

  if (!mounted) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: dimColor }, backdrop]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismissable ? onClose : undefined} />
      </Animated.View>
      <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 64 }, sheet]}>
        {showClose && (
          <Bounce onPress={onClose} style={styles.close} testID="sheet-close">
            <CloseIcon />
          </Bounce>
        )}
        {children}
      </Animated.View>
    </View>
  );
}

export function CloseIcon({ color = colors.ink, size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12">
      <Path d="M1 1 L11 11 M11 1 L1 11" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -40,
    paddingBottom: 40,
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 28,
    paddingHorizontal: 22,
  },
  close: {
    position: 'absolute',
    right: 16,
    top: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
