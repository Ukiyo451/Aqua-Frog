import * as Haptics from 'expo-haptics';
import { ReactNode } from 'react';
import { Platform, Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, fonts } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BounceProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  haptic?: boolean;
  testID?: string;
  scaleTo?: number;
}

/** Squashes on press-in and springs back, like every tappable thing in the app. */
export function Bounce({ onPress, children, style, disabled, haptic = true, testID, scaleTo = 0.92 }: BounceProps) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      testID={testID}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(scaleTo, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 8, stiffness: 300 });
      }}
      onPress={() => {
        if (haptic && Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.();
      }}
      style={[animated, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'dark' | 'water' | 'ghost';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export function PillButton({ label, onPress, variant = 'dark', style, textStyle, testID }: ButtonProps) {
  return (
    <Bounce
      testID={testID}
      onPress={onPress}
      style={[styles.pill, variant === 'water' && styles.water, variant === 'ghost' && styles.ghost, style]}
    >
      <Text style={[styles.label, variant === 'ghost' && { color: colors.muted }, textStyle]}>{label}</Text>
    </Bounce>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: colors.ink,
    borderRadius: 999,
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  water: { backgroundColor: colors.water },
  ghost: { backgroundColor: 'transparent', shadowOpacity: 0 },
  label: { color: '#fff', fontFamily: fonts.extra, fontSize: 17, letterSpacing: 0.3 },
});
