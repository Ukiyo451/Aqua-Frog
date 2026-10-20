import { useEffect } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Bounce } from '../../components/Pressable';
import { goalFor, useStore } from '../../lib/store';
import { colors, fonts } from '../../theme';
import { LayeredFrog } from './LayeredFrog';

/** Dark pill with a tilted mini poster of today's frog; wiggles now and then. */
export function CelebrateButton({ onPress, day, style, testID = 'celebrate-day' }: { onPress: () => void; day?: string; style?: StyleProp<ViewStyle>; testID?: string }) {
  const { state } = useStore();
  const key = day ?? state.day;
  const entries = state.history[key] ?? [];
  const wiggle = useSharedValue(0);

  useEffect(() => {
    const swing = (to: number) => withTiming(to, { duration: 110, easing: Easing.inOut(Easing.quad) });
    wiggle.value = withRepeat(withDelay(1800, withSequence(swing(1), swing(-1), swing(0.7), swing(-0.5), swing(0))), -1);
  }, [wiggle]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ rotate: `${-10 + wiggle.value * 7}deg` }, { scale: 1 + Math.abs(wiggle.value) * 0.05 }] }));

  return (
    <Bounce onPress={onPress} style={[styles.pill, style]} testID={testID} scaleTo={0.95}>
      <Animated.View style={[styles.poster, thumb]}>
        <LayeredFrog width={30} entries={entries} goalMl={goalFor(state, key)} />
      </Animated.View>
      <View>
        <Text style={styles.text}>CELEBRATE</Text>
        <Text style={styles.text}>YOUR DAY</Text>
      </View>
    </Bounce>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.ink,
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 26,
    height: 64,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  poster: {
    width: 42,
    height: 52,
    marginTop: -14,
    borderRadius: 3,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E3E6EA',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 5,
  },
  text: { fontFamily: fonts.black, fontSize: 15, color: '#fff', letterSpacing: 0.4, lineHeight: 18 },
});
