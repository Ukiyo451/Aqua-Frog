import { useId } from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { CupShape, Drink } from '../lib/drinks';

/** Mixes a hex colour with another (t = 0 keeps `a`, 1 gives `b`). */
export function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

interface IconGeom {
  /** The container's inside; the liquid is clipped to it. */
  body: string;
  top: number;
  bottom: number;
  fill: number;
}

/** Flat icon shapes on a 100x100 canvas. */
const ICONS: Record<CupShape, IconGeom> = {
  glass: { body: 'M22 12 H78 L71 89 Q70 94 65 94 H35 Q30 94 29 89 Z', top: 12, bottom: 94, fill: 0.78 },
  bottle: { body: 'M42 14 H58 V20 Q58 24 62 27 Q68 32 68 40 V88 Q68 94 62 94 H38 Q32 94 32 88 V40 Q32 32 38 27 Q42 24 42 20 Z', top: 14, bottom: 94, fill: 0.84 },
  mug: { body: 'M12 32 H70 V76 Q70 92 54 92 H28 Q12 92 12 76 Z', top: 32, bottom: 92, fill: 0.8 },
  cup: { body: 'M12 42 H78 Q78 84 45 84 Q12 84 12 42 Z', top: 42, bottom: 84, fill: 0.8 },
  takeaway: { body: 'M25 28 H75 L69 90 Q68 94 64 94 H36 Q32 94 31 90 Z', top: 28, bottom: 94, fill: 0.86 },
  tall: { body: 'M28 14 H72 L68 89 Q67 94 62 94 H38 Q33 94 32 89 Z', top: 14, bottom: 94, fill: 0.76 },
  wine: { body: 'M26 8 H74 Q77 38 62 50 Q56 55 50 55 Q44 55 38 50 Q23 38 26 8 Z', top: 8, bottom: 55, fill: 0.62 },
  martini: { body: 'M12 10 H88 L50 52 Z', top: 10, bottom: 52, fill: 0.72 },
  shot: { body: 'M27 42 H73 L68 90 Q67 94 63 94 H37 Q33 94 32 90 Z', top: 42, bottom: 94, fill: 0.74 },
  can: { body: 'M30 16 Q30 12 34 12 H66 Q70 12 70 16 V88 Q70 94 64 94 H36 Q30 94 30 88 Z', top: 12, bottom: 94, fill: 1 },
  bowl: { body: 'M6 44 H94 Q94 86 50 86 Q6 86 6 44 Z', top: 44, bottom: 86, fill: 0.72 },
  jar: { body: 'M26 24 H74 V86 Q74 94 66 94 H34 Q26 94 26 86 Z', top: 24, bottom: 94, fill: 0.82 },
};

export const CUP_SHAPES = Object.keys(ICONS) as CupShape[];

/** Parts drawn on top of the cup body: handles, lids, stems, caps. */
function Extras({ shape, color, glass }: { shape: CupShape; color: string; glass: string }) {
  const dark = mix(color, '#000000', 0.18);
  const pale = mix(glass, color, 0.25);
  switch (shape) {
    case 'mug':
      return <Path d="M70 42 H76 Q88 42 88 56 Q88 70 74 71 H70" stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" />;
    case 'cup':
      return (
        <>
          <Path d="M77 50 Q90 50 89 60 Q88 70 72 70" stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" />
          <Rect x={4} y={86} width={82} height={7} rx={3.5} fill={pale} />
        </>
      );
    case 'takeaway':
      return (
        <>
          <Path d="M28 8 H72 L76 18 H24 Z" fill={pale} />
          <Rect x={18} y={17} width={64} height={11} rx={4} fill={pale} />
        </>
      );
    case 'tall':
      return <Path d="M57 30 L66 2" stroke={pale} strokeWidth={5} strokeLinecap="round" />;
    case 'wine':
    case 'martini':
      return (
        <>
          <Rect x={47} y={shape === 'wine' ? 53 : 50} width={6} height={36} fill={pale} />
          <Rect x={30} y={88} width={40} height={6} rx={3} fill={pale} />
        </>
      );
    case 'bottle':
      return <Rect x={39} y={4} width={22} height={12} rx={3} fill={dark} />;
    case 'can':
      return (
        <>
          <Rect x={33} y={6} width={34} height={6} rx={2} fill={pale} />
          <Rect x={30} y={36} width={40} height={26} fill={mix(color, '#ffffff', 0.25)} />
        </>
      );
    case 'bowl':
      return <Rect x={34} y={86} width={32} height={8} rx={3} fill={pale} />;
    case 'jar':
      return <Rect x={23} y={11} width={54} height={14} rx={4} fill={dark} />;
    default:
      return null;
  }
}

interface Props {
  shape: CupShape;
  color: string;
  /** Pale colour of the empty part of the cup. */
  glass: string;
  size: number;
  /** How full the cup looks, 0..1 (a per-shape default otherwise). */
  fill?: number;
}

/** Small flat drink icon: a pale cup with the drink's colour poured in. */
export function CupIcon({ shape, color, glass, size, fill }: Props) {
  const clipId = `ci${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const g = ICONS[shape] ?? ICONS.glass;
  const level = fill ?? g.fill;
  const y = g.bottom - level * (g.bottom - g.top);
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id={clipId}>
          <Path d={g.body} />
        </ClipPath>
      </Defs>
      <Path d={g.body} fill={glass} />
      <G clipPath={`url(#${clipId})`}>
        <Rect x={0} y={y} width={100} height={100} fill={color} />
      </G>
      <Extras shape={shape} color={color} glass={glass} />
    </Svg>
  );
}

export function DrinkIcon({ drink, size, fill }: { drink: Drink; size: number; fill?: number }) {
  return <CupIcon shape={drink.shape} color={drink.color} glass={drink.glass} size={size} fill={fill} />;
}
