import { useEffect, useId } from 'react';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const CUP_PATH = 'M6 12 L194 12 L173 212 Q171 234 149 234 L51 234 Q29 234 27 212 Z';
const W = 200;
const H = 240;
const TOP = 16;
const BOTTOM = 234;

function Bubble({ x, delay, level, r }: { x: number; delay: number; level: SharedValue<number>; r: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2600, easing: Easing.in(Easing.quad) }), -1));
  }, [t, delay]);
  const props = useAnimatedProps(() => {
    const surface = BOTTOM - level.value * (BOTTOM - TOP);
    return {
      cy: BOTTOM - 6 - t.value * (BOTTOM - 6 - surface),
      cx: x + Math.sin(t.value * 9) * 3,
      opacity: level.value < 0.05 ? 0 : 0.35 * (1 - t.value),
    };
  });
  return <AnimatedCircle r={r} fill="#fff" animatedProps={props} />;
}

interface Props {
  width: number;
  color?: string;
  /** 0..1, can be a shared value driven by a drag gesture. */
  level: SharedValue<number>;
  slosh?: SharedValue<number>;
}

/** The big glass from the "add a sip" screen: wavy water, rising bubbles. */
export function Cup({ width, level, slosh, color = colors.water }: Props) {
  const clipId = `cup${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const phase = useSharedValue(0);
  const localSlosh = useSharedValue(0);
  const amp = slosh ?? localSlosh;

  useEffect(() => {
    phase.value = withRepeat(withTiming(Math.PI * 2, { duration: 2200, easing: Easing.linear }), -1);
  }, [phase]);

  const wave = useAnimatedProps(() => {
    const y = BOTTOM - level.value * (BOTTOM - TOP);
    const a = 2.5 + amp.value * 7;
    let d = `M0 ${H}`;
    for (let x = 0; x <= W; x += 10) d += ` L${x} ${y + Math.sin((x / W) * Math.PI * 2 + phase.value) * a}`;
    return { d: `${d} L${W} ${H} Z` };
  });

  return (
    <Svg width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <ClipPath id={clipId}>
          <Path d={CUP_PATH} />
        </ClipPath>
      </Defs>
      <Path d={CUP_PATH} fill={colors.silhouette} />
      <G clipPath={`url(#${clipId})`}>
        <AnimatedPath animatedProps={wave} fill={color} />
        {[50, 80, 120, 150, 100].map((x, i) => (
          <Bubble key={i} x={x} r={3 + (i % 3)} delay={i * 480} level={level} />
        ))}
      </G>
      <Rect x={6} y={10} width={188} height={6} rx={3} fill="#E3E6EA" />
    </Svg>
  );
}

/** Small cup used for the "WATER" drink button. */
export function MiniCup({ size, fill = 0.72, color = colors.water, glass = '#BFF1F6' }: { size: number; fill?: number; color?: string; glass?: string }) {
  const clipId = `mini${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const y = BOTTOM - fill * (BOTTOM - TOP);
  return (
    <Svg width={size} height={(size * H) / W} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <ClipPath id={clipId}>
          <Path d={CUP_PATH} />
        </ClipPath>
      </Defs>
      <Path d={CUP_PATH} fill={glass} />
      <G clipPath={`url(#${clipId})`}>
        <Rect x={0} y={y} width={W} height={H} fill={color} />
      </G>
    </Svg>
  );
}

export function useSlosh() {
  const s = useSharedValue(0);
  const kick = () => {
    s.value = withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 1200 }));
  };
  return [s, kick] as const;
}
