import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { View } from 'react-native';

const LAYERS = [
  // bottom to top: the stacked rainbow frog head
  { key: 'base', color: '#4A3FB4', el: <Ellipse cx={60} cy={100} rx={44} ry={11} fill="#4A3FB4" /> },
  { key: 'blue', color: '#14C6D6', el: <Ellipse cx={60} cy={86} rx={48} ry={12} fill="#14C6D6" /> },
  { key: 'orange', color: '#FFB23F', el: <Path d="M14 72 Q14 46 60 46 Q106 46 106 72 Q106 80 60 80 Q14 80 14 72 Z" fill="#FFB23F" /> },
  {
    key: 'eyes',
    color: '#FF4F8B',
    el: (
      <>
        <Circle cx={36} cy={42} r={15} fill="#FF4F8B" />
        <Circle cx={84} cy={42} r={15} fill="#FF4F8B" />
      </>
    ),
  },
];

function Layer({ index, children }: { index: number; children: React.ReactNode }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(120 + index * 140, withSpring(1, { damping: 9, stiffness: 180 }));
  }, [t, index]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, t.value * 2),
    transform: [{ translateY: (1 - t.value) * -60 }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, style]}>
      <Svg width={120} height={120} viewBox="0 0 120 120">
        {children}
      </Svg>
    </Animated.View>
  );
}

/** Lily's logo mark — colourful layers that drop in and stack into a frog head. */
export function LogoMark() {
  const squash = useSharedValue(1);
  useEffect(() => {
    squash.value = withDelay(
      120 + LAYERS.length * 140 + 200,
      withSequence(withTiming(0.86, { duration: 120 }), withSpring(1, { damping: 5, stiffness: 220 })),
    );
  }, [squash]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scaleY: squash.value }, { scaleX: 2 - squash.value }],
    transformOrigin: 'bottom',
  }));
  return (
    <Animated.View style={[{ width: 120, height: 120 }, style]}>
      <View>
        {LAYERS.map((l, i) => (
          <Layer key={l.key} index={i}>
            {l.el}
          </Layer>
        ))}
        <Layer index={LAYERS.length}>
          <Circle cx={36} cy={42} r={5} fill="#fff" />
          <Circle cx={84} cy={42} r={5} fill="#fff" />
        </Layer>
      </View>
    </Animated.View>
  );
}
