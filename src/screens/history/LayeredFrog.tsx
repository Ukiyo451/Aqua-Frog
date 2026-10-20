import { useEffect, useId, useMemo } from 'react';
import Animated, { Easing, SharedValue, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, Path } from 'react-native-svg';
import { outline, TOP_Y, VB_H, VB_W } from '../../components/Lily';
import { Entry, useStore } from '../../lib/store';
import { colors } from '../../theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const FILL_H = VB_H - TOP_Y;
const BOTTOM_CROP_Y = 150;
const RISE_MS = 420;

interface Props {
  width: number;
  entries: Entry[];
  goalMl: number;
  /** Bands rise in one after another. */
  animate?: boolean;
  /** 'bottom' shows only the legs and the lower body. */
  crop?: 'full' | 'bottom';
  delay?: number;
}

interface Band {
  key: string;
  color: string;
  from: number;
  to: number;
}

function Layer({ band, index, t }: { band: Band; index: number; t: SharedValue<number> }) {
  const props = useAnimatedProps(() => {
    const p = Math.min(1, Math.max(0, t.value - index));
    if (p <= 0) return { d: `M0 ${VB_H + 20} L${VB_W} ${VB_H + 20} Z` };
    const e = 1 - Math.pow(1 - p, 3);
    const top = VB_H - (band.from + (band.to - band.from) * e);
    let d = `M-6 ${VB_H + 20}`;
    for (let x = -6; x <= VB_W + 6; x += 11) {
      d += ` L${x} ${top + Math.sin((x / VB_W) * Math.PI * 3 + index * 1.7) * 2.4}`;
    }
    return { d: `${d} L${VB_W + 6} ${VB_H + 20} Z` };
  });
  return <AnimatedPath animatedProps={props} fill={band.color} />;
}

/**
 * Lily's silhouette filled from the feet up with one band per drink, in the order they
 * were logged. Each band's height is that drink's share of the day's goal.
 */
export function LayeredFrog({ width, entries, goalMl, animate = false, crop = 'full', delay = 0 }: Props) {
  const { drink } = useStore();
  const clipId = `layered${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const bands = useMemo<Band[]>(() => {
    const out: Band[] = [];
    let level = 0;
    const sorted = [...entries].sort((a, b) => a.at - b.at);
    for (const e of sorted) {
      if (e.hydrationMl <= 0 || level >= FILL_H + 6) continue;
      const h = (e.hydrationMl / Math.max(1, goalMl)) * FILL_H;
      const to = Math.min(FILL_H + 6, level + h);
      out.push({ key: e.id, color: drink(e.drinkId).color, from: level, to });
      level = to;
    }
    return out;
  }, [entries, goalMl, drink]);

  const t = useSharedValue(animate ? 0 : bands.length);
  useEffect(() => {
    if (!animate) {
      t.value = bands.length;
      return;
    }
    t.value = 0;
    t.value = withDelay(delay, withTiming(bands.length, { duration: RISE_MS * bands.length, easing: Easing.linear }));
  }, [animate, bands, t, delay]);

  const vbY = crop === 'bottom' ? BOTTOM_CROP_Y : 0;
  const vbH = VB_H - vbY;
  return (
    <Svg width={width} height={(width * vbH) / VB_W} viewBox={`0 ${vbY} ${VB_W} ${vbH}`}>
      <Defs>
        <ClipPath id={clipId}>{outline('#000')}</ClipPath>
      </Defs>
      {outline(colors.silhouette)}
      <G clipPath={`url(#${clipId})`}>
        {/* drawn top band first so each earlier drink sits in front, lower down */}
        {bands
          .map((b, i) => <Layer key={b.key} band={b} index={i} t={t} />)
          .reverse()}
      </G>
      {crop === 'full' && (
        <G opacity={0.09}>
          <Circle cx={56} cy={58} r={14} fill="#000" />
          <Circle cx={164} cy={58} r={14} fill="#000" />
          <Path d="M74 110 Q110 138 146 110" stroke="#000" strokeWidth={5} strokeLinecap="round" fill="none" />
        </G>
      )}
    </Svg>
  );
}
