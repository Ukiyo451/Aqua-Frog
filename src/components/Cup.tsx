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
import { CupShape } from '../lib/drinks';
import { colors } from '../theme';
import { mix } from './CupIcon';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const CUP_PATH = 'M6 12 L194 12 L173 212 Q171 234 149 234 L51 234 Q29 234 27 212 Z';
const W = 200;
const H = 240;
const TOP = 16;
const BOTTOM = 234;

/** Where the liquid sits inside each big cup (200x240 canvas) and where the drag handle goes. */
export interface CupGeom {
  body: string;
  top: number;
  bottom: number;
  /** Centre of the drag handle, as fractions of the canvas. */
  handleX: number;
  handleY: number;
  bubbles: number[];
}

const GEOMS: Record<CupShape, CupGeom> = {
  glass: { body: CUP_PATH, top: TOP, bottom: BOTTOM, handleX: 0.5, handleY: 0.52, bubbles: [50, 80, 120, 150, 100] },
  takeaway: {
    body: 'M30 52 H170 L155 220 Q154 234 140 234 H60 Q46 234 45 220 Z',
    top: 52,
    bottom: 234,
    handleX: 0.5,
    handleY: 0.56,
    bubbles: [70, 90, 120, 135, 100],
  },
  mug: {
    body: 'M8 70 H160 V176 Q160 232 104 232 H64 Q8 232 8 176 Z',
    top: 70,
    bottom: 232,
    handleX: 0.42,
    handleY: 0.62,
    bubbles: [40, 70, 110, 140, 90],
  },
  cup: {
    body: 'M16 100 H172 Q172 212 94 212 Q16 212 16 100 Z',
    top: 100,
    bottom: 212,
    handleX: 0.47,
    handleY: 0.66,
    bubbles: [50, 80, 110, 140, 95],
  },
  tall: { body: 'M38 8 H162 L150 220 Q149 234 135 234 H65 Q51 234 50 220 Z', top: 8, bottom: 234, handleX: 0.5, handleY: 0.5, bubbles: [70, 90, 120, 135, 100] },
  wine: {
    body: 'M34 8 H166 Q174 92 134 126 Q118 138 100 138 Q82 138 66 126 Q26 92 34 8 Z',
    top: 8,
    bottom: 138,
    handleX: 0.5,
    handleY: 0.3,
    bubbles: [70, 90, 110, 130, 100],
  },
  martini: { body: 'M8 14 H192 L100 126 Z', top: 14, bottom: 126, handleX: 0.5, handleY: 0.24, bubbles: [80, 95, 110, 120, 100] },
  shot: { body: 'M44 92 H156 L146 222 Q145 234 133 234 H67 Q55 234 54 222 Z', top: 92, bottom: 234, handleX: 0.5, handleY: 0.68, bubbles: [75, 90, 115, 125, 100] },
  bottle: {
    body: 'M78 22 H122 V44 Q122 56 134 64 Q158 80 158 108 V214 Q158 234 138 234 H62 Q42 234 42 214 V108 Q42 80 66 64 Q78 56 78 44 Z',
    top: 22,
    bottom: 234,
    handleX: 0.5,
    handleY: 0.62,
    bubbles: [65, 85, 115, 135, 100],
  },
  can: { body: 'M44 26 Q44 16 56 16 H144 Q156 16 156 26 V222 Q156 234 144 234 H56 Q44 234 44 222 Z', top: 16, bottom: 234, handleX: 0.5, handleY: 0.52, bubbles: [65, 85, 115, 135, 100] },
  bowl: { body: 'M4 104 H196 Q196 212 100 212 Q4 212 4 104 Z', top: 104, bottom: 212, handleX: 0.5, handleY: 0.64, bubbles: [40, 80, 120, 160, 100] },
  jar: { body: 'M38 56 H162 V210 Q162 234 138 234 H62 Q38 234 38 210 Z', top: 56, bottom: 234, handleX: 0.5, handleY: 0.6, bubbles: [60, 85, 115, 140, 100] },
};

export function cupGeom(shape: CupShape = 'glass'): CupGeom {
  return GEOMS[shape] ?? GEOMS.glass;
}

/** Lids, handles, stems and caps around the big cup. */
function BigExtras({ shape, color, glass }: { shape: CupShape; color: string; glass?: string }) {
  const grey = '#E3E6EA';
  const lid = glass ? mix(glass, color, 0.35) : mix(color, '#ffffff', 0.45);
  switch (shape) {
    case 'takeaway':
      return (
        <>
          <Path d="M44 10 H156 L166 30 H34 Z" fill={lid} />
          <Rect x={18} y={28} width={164} height={26} rx={10} fill={mix(lid, color, 0.25)} />
        </>
      );
    case 'mug':
      return <Path d="M160 100 H170 Q192 100 192 132 Q192 166 164 168 H160" stroke={color} strokeWidth={18} fill="none" strokeLinecap="round" />;
    case 'cup':
      return (
        <>
          <Path d="M170 120 Q196 120 194 146 Q192 172 160 176" stroke={color} strokeWidth={14} fill="none" strokeLinecap="round" />
          <Rect x={6} y={216} width={176} height={18} rx={9} fill={grey} />
        </>
      );
    case 'wine':
    case 'martini':
      return (
        <>
          <Rect x={93} y={shape === 'wine' ? 134 : 120} width={14} height={shape === 'wine' ? 90 : 104} fill={grey} />
          <Rect x={50} y={220} width={100} height={14} rx={7} fill={grey} />
        </>
      );
    case 'bottle':
      return <Rect x={72} y={0} width={56} height={26} rx={8} fill={mix(color, '#000000', 0.15)} />;
    case 'can':
      return <Rect x={56} y={4} width={88} height={14} rx={5} fill={grey} />;
    case 'bowl':
      return <Rect x={66} y={212} width={68} height={22} rx={8} fill={grey} />;
    case 'jar':
      return <Rect x={30} y={18} width={140} height={40} rx={10} fill={mix(color, '#000000', 0.15)} />;
    default:
      return null;
  }
}

function Bubble({ x, delay, level, r, top, bottom }: { x: number; delay: number; level: SharedValue<number>; r: number; top: number; bottom: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2600, easing: Easing.in(Easing.quad) }), -1));
  }, [t, delay]);
  const props = useAnimatedProps(() => {
    const surface = bottom - level.value * (bottom - top);
    return {
      cy: bottom - 6 - t.value * (bottom - 6 - surface),
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
  /** Cup family to draw; the classic glass when left out. */
  shape?: CupShape;
  /** Pale tint for lids and caps. */
  glass?: string;
}

/** The big cup from the "add a sip" screen: wavy liquid, rising bubbles. */
export function Cup({ width, level, slosh, color = colors.water, shape = 'glass', glass }: Props) {
  const g = cupGeom(shape);
  const { top, bottom } = g;
  const clipId = `cup${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const phase = useSharedValue(0);
  const localSlosh = useSharedValue(0);
  const amp = slosh ?? localSlosh;

  useEffect(() => {
    phase.value = withRepeat(withTiming(Math.PI * 2, { duration: 2200, easing: Easing.linear }), -1);
  }, [phase]);

  const wave = useAnimatedProps(() => {
    const y = bottom - level.value * (bottom - top);
    const a = 2.5 + amp.value * 7;
    let d = `M0 ${H}`;
    for (let x = 0; x <= W; x += 10) d += ` L${x} ${y + Math.sin((x / W) * Math.PI * 2 + phase.value) * a}`;
    return { d: `${d} L${W} ${H} Z` };
  });

  return (
    <Svg width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <ClipPath id={clipId}>
          <Path d={g.body} />
        </ClipPath>
      </Defs>
      <Path d={g.body} fill={colors.silhouette} />
      <G clipPath={`url(#${clipId})`}>
        <AnimatedPath animatedProps={wave} fill={color} />
        {g.bubbles.map((x, i) => (
          <Bubble key={i} x={x} r={3 + (i % 3)} delay={i * 480} level={level} top={top} bottom={bottom} />
        ))}
      </G>
      {shape === 'glass' ? <Rect x={6} y={10} width={188} height={6} rx={3} fill="#E3E6EA" /> : <BigExtras shape={shape} color={color} glass={glass} />}
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
