import Animated, { SharedValue, useAnimatedProps } from 'react-native-reanimated';
import { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';
import type { Accessory } from '../lib/characters';

/**
 * The hats, glasses and scarves Lily's friends wear, drawn in Lily's 220×260 viewBox.
 * `flat` paints every shape in one colour (used for locked outlines).
 */
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function mixHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}
export const shade = (c: string, t = 0.2) => mixHex(c, '#000000', t);
export const tint = (c: string, t = 0.4) => mixHex(c, '#ffffff', t);
export function light(c: string) {
  const v = parseInt(c.slice(1), 16);
  return ((v >> 16) & 255) * 0.3 + ((v >> 8) & 255) * 0.59 + (v & 255) * 0.11 > 170;
}

type Seg = (string | number)[];

/** Rotates a path (absolute M/L/Q/C/Z segments) by `deg` around (ox, oy). */
function rotD(segs: Seg[], deg: number, ox: number, oy: number) {
  'worklet';
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  let d = '';
  for (let k = 0; k < segs.length; k++) {
    const seg = segs[k];
    d += seg[0] as string;
    for (let i = 1; i < seg.length; i += 2) {
      const x = (seg[i] as number) - ox;
      const y = (seg[i + 1] as number) - oy;
      d += ` ${(ox + x * c - y * s).toFixed(1)} ${(oy + x * s + y * c).toFixed(1)}`;
    }
    d += ' ';
  }
  return d;
}

interface SwayProps {
  segs: Seg[];
  sway: SharedValue<number>;
  /** Degrees at full swing. */
  amp: number;
  ox: number;
  oy: number;
  /** Phase offset in swing units (-1..1), for a lagging second piece. */
  lag?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

function SwayPath({ segs, sway, amp, ox, oy, lag = 0, fill = 'none', stroke, strokeWidth }: SwayProps) {
  const props = useAnimatedProps(() => ({ d: rotD(segs, (sway.value + lag) * amp, ox, oy) }));
  return <AnimatedPath animatedProps={props} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />;
}

function SwayDot({ x, y, r, sway, amp, ox, oy, fill }: { x: number; y: number; r: number; sway: SharedValue<number>; amp: number; ox: number; oy: number; fill: string }) {
  const props = useAnimatedProps(() => {
    const a = (sway.value * amp * Math.PI) / 180;
    const dx = x - ox;
    const dy = y - oy;
    return { cx: ox + dx * Math.cos(a) - dy * Math.sin(a), cy: oy + dx * Math.sin(a) + dy * Math.cos(a) };
  });
  return <AnimatedCircle animatedProps={props} r={r} fill={fill} />;
}

export interface AccessoryProps {
  kind: Accessory;
  accent: string;
  /** Lily-pad green under the flower. */
  deep: string;
  sway: SharedValue<number>;
  uid: string;
  /** Draw everything in this one colour. */
  flat?: string;
}

/** Pieces that sit behind the eyes (the headband). */
export function AccessoryBack({ kind, accent, sway, flat }: AccessoryProps) {
  if (kind !== 'bandana') return null;
  const f = (c: string) => flat ?? c;
  const dk = f(shade(accent, 0.18));
  return (
    <G>
      <SwayPath segs={[['M', 198, 80], ['Q', 212, 86, 216, 104], ['L', 206, 106], ['Q', 204, 92, 194, 86], ['Z']]} sway={sway} amp={9} ox={198} oy={82} fill={dk} />
      <SwayPath segs={[['M', 198, 82], ['Q', 216, 96, 214, 120], ['L', 204, 118], ['Q', 204, 100, 192, 88], ['Z']]} sway={sway} amp={12} ox={198} oy={82} lag={0.3} fill={f(accent)} />
      <Path d="M17 78 Q110 62 203 78 L203 92 Q110 76 17 92 Z" fill={f(accent)} />
      <Path d="M20 85 Q110 70 200 85" stroke={f(tint(accent, 0.35))} strokeWidth={2} fill="none" strokeDasharray="5 6" />
      <Circle cx={200} cy={84} r={8} fill={dk} />
    </G>
  );
}

/** Everything else, drawn on top of the face. */
/**
 * How each hat is fitted onto the head: [scaleX, scaleY, originX, originY, lift].
 * Below the eye tops (y 36) a hat stays inside x 77..143 so it never covers the eye
 * whites; wide brims (bucket hat, cowboy) are lifted to rest on the two eye bumps.
 * Hats may rise above the viewBox top, by up to HAT_ROOM.
 */
const HAT_FIT: Partial<Record<Accessory, [number, number, number, number, number]>> = {
  bucketHat: [1.25, 1.1, 110, 54, -24],
  cowboy: [1, 1, 110, 50, -22],
  beanie: [0.8, 1.0, 110, 58, 0],
  crown: [1.06, 1.15, 110, 52, 0],
  tiara: [0.95, 1.1, 110, 54, 0],
  bow: [0.9, 0.95, 110, 40, 0],
  chefHat: [1, 1.25, 110, 55, 0],
};

/** Extra room (viewBox units) a hat needs above y = 0. */
export const HAT_ROOM = 28;
const TALL: Accessory[] = ['cap', 'bucketHat', 'cowboy', 'beanie', 'crown', 'tiara', 'chefHat', 'partyHat', 'leaf'];
export const needsRoom = (kind?: Accessory) => !!kind && TALL.includes(kind);

export function AccessoryFront(props: AccessoryProps) {
  const s = HAT_FIT[props.kind];
  if (!s) return <AccessoryShape {...props} />;
  return (
    <G translateY={s[4]}>
      <G scaleX={s[0]} scaleY={s[1]} originX={s[2]} originY={s[3]}>
        <AccessoryShape {...props} />
      </G>
    </G>
  );
}

function AccessoryShape({ kind, accent, deep, sway, uid, flat }: AccessoryProps) {
  const f = (c: string) => flat ?? c;
  const dk = f(shade(accent, 0.2));
  const lt = f(tint(accent, 0.45));
  const ac = f(accent);
  switch (kind) {
    case 'flower': {
      // Lily draws her own (wilting) flower; this flat version is for outlines
      const angles = [-60, -30, 0, 30, 60];
      return (
        <G rotation={22} origin="180, 34">
          <Ellipse cx={180} cy={38} rx={18} ry={5} fill={f(deep)} />
          {angles.map((deg) => (
            <Ellipse key={deg} cx={180} cy={22} rx={6.5} ry={13} fill={ac} origin="180, 34" rotation={deg} />
          ))}
        </G>
      );
    }
    case 'cap':
      // a little cap perched between the eye bumps, bill forward
      return (
        <G>
          <Path d="M80 50 C78 -8 142 -8 140 50 Z" fill={ac} />
          <Path d="M110 6 L110 50 M95 10 Q88 30 90 50 M125 10 Q132 30 130 50" stroke={dk} strokeWidth={2} fill="none" />
          <Circle cx={110} cy={5} r={4.5} fill={dk} />
          {!flat && <Path d="M110 22 Q104 30 104 33 A6 6 0 0 0 116 33 Q116 30 110 22 Z" fill="#fff" />}
          <Ellipse cx={110} cy={50} rx={33} ry={8} fill={dk} />
          <Ellipse cx={110} cy={48} rx={28} ry={4.5} fill={ac} />
        </G>
      );
    case 'bucketHat': {
      const id = `${uid}bh`;
      const crown = 'M82 46 L87 18 Q110 9 133 18 L138 46 Z';
      const brim = 'M58 52 Q110 30 162 52 Q110 68 58 52 Z';
      return (
        <G>
          {!flat && (
            <Defs>
              <ClipPath id={id}>
                <Path d={crown} />
                <Path d={brim} />
              </ClipPath>
            </Defs>
          )}
          <Path d={crown} fill={f('#FFFFFF')} />
          <Path d={brim} fill={f('#FFFFFF')} />
          {!flat && (
            <G clipPath={`url(#${id})`}>
              {[12, 22, 31, 40, 49, 58].map((y, i) => (
                <Path
                  key={y}
                  d={`M52 ${y + (i % 2 ? 3 : -2)} Q74 ${y - 7} 96 ${y + 1} Q116 ${y + 8} 136 ${y - 2} Q152 ${y - 8} 170 ${y + 3}`}
                  stroke={accent}
                  strokeWidth={i % 2 ? 4 : 5.5}
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
              <Path d="M58 52 Q110 66 162 52" stroke="rgba(0,0,0,0.18)" strokeWidth={3} fill="none" />
            </G>
          )}
        </G>
      );
    }
    case 'glasses':
      return (
        <G>
          <Circle cx={56} cy={56} r={22} fill={flat ? 'none' : 'rgba(255,255,255,0.18)'} stroke={ac} strokeWidth={5} />
          <Circle cx={164} cy={56} r={22} fill={flat ? 'none' : 'rgba(255,255,255,0.18)'} stroke={ac} strokeWidth={5} />
          <Path d="M78 54 Q110 42 142 54 M34 52 L22 48 M186 52 L198 48" stroke={ac} strokeWidth={5} strokeLinecap="round" fill="none" />
          {!flat && <Path d="M44 46 L52 40 M152 46 L160 40" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.8} />}
        </G>
      );
    case 'sunglasses':
      return (
        <G>
          <Path d="M28 44 L86 44 Q86 76 58 76 Q28 76 28 44 Z" fill={ac} />
          <Path d="M134 44 L192 44 Q192 76 164 76 Q134 76 134 44 Z" fill={ac} />
          <Rect x={22} y={40} width={176} height={8} rx={4} fill={f(shade(accent, 0.35))} />
          {!flat && <Path d="M38 52 L52 52 M144 52 L158 52" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.55} />}
        </G>
      );
    case 'scarf':
      return (
        <G>
          <SwayPath
            segs={[['M', 140, 160], ['L', 162, 158], ['Q', 168, 186, 170, 212], ['L', 146, 214], ['Q', 146, 188, 140, 160], ['Z']]}
            sway={sway}
            amp={6}
            ox={150}
            oy={160}
            fill={dk}
          />
          <SwayPath segs={[['M', 148, 196], ['L', 168, 194], ['M', 147, 204], ['L', 169, 202]]} sway={sway} amp={6} ox={150} oy={160} stroke={lt} strokeWidth={3} />
          <SwayPath
            segs={[['M', 148, 214], ['L', 148, 222], ['M', 154, 214], ['L', 155, 222], ['M', 160, 213], ['L', 161, 221], ['M', 166, 212], ['L', 168, 220]]}
            sway={sway}
            amp={6}
            ox={150}
            oy={160}
            stroke={dk}
            strokeWidth={3}
          />
          <Path d="M44 138 Q110 166 176 138 L180 156 Q110 192 40 156 Z" fill={ac} />
          <Path d="M66 152 L64 170 M88 158 L87 178 M132 158 L133 178 M154 152 L156 170" stroke={lt} strokeWidth={4} strokeLinecap="round" />
        </G>
      );
    case 'crown': {
      const gem = f(light(accent) ? '#FF5FA2' : '#FFD45C');
      return (
        <G>
          <Path d="M80 52 L74 16 L94 32 L110 8 L126 32 L146 16 L140 52 Z" fill={ac} stroke={dk} strokeWidth={2} strokeLinejoin="round" />
          <Rect x={79} y={42} width={62} height={10} rx={3} fill={dk} />
          <Circle cx={74} cy={16} r={4.5} fill={gem} />
          <Circle cx={110} cy={8} r={5} fill={gem} />
          <Circle cx={146} cy={16} r={4.5} fill={gem} />
          <Circle cx={110} cy={47} r={3.5} fill={f('#14C6D6')} />
          <Circle cx={92} cy={47} r={2.5} fill={gem} />
          <Circle cx={128} cy={47} r={2.5} fill={gem} />
        </G>
      );
    }
    case 'tiara': {
      const gem = f(light(accent) ? '#FF5FA2' : '#FFD45C');
      return (
        <G>
          <Path d="M76 54 Q110 38 144 54 L140 46 L126 42 L118 34 L110 18 L102 34 L94 42 L80 46 Z" fill={ac} stroke={dk} strokeWidth={1.5} strokeLinejoin="round" />
          <Circle cx={110} cy={36} r={5.5} fill={gem} />
          <Circle cx={92} cy={46} r={2.5} fill={f('#fff')} />
          <Circle cx={128} cy={46} r={2.5} fill={f('#fff')} />
          <Circle cx={110} cy={16} r={3} fill={f('#fff')} />
        </G>
      );
    }
    case 'bow':
      return (
        <G>
          <Path d="M110 40 C92 18 72 26 76 42 C72 58 92 62 110 40 Z" fill={ac} />
          <Path d="M110 40 C128 18 148 26 144 42 C148 58 128 62 110 40 Z" fill={ac} />
          <Path d="M104 40 C94 32 84 34 84 40 M116 40 C126 32 136 34 136 40" stroke={dk} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          {!flat && <Path d="M84 32 Q88 28 94 30 M126 30 Q132 28 136 32" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" opacity={0.6} fill="none" />}
          <Ellipse cx={110} cy={40} rx={8} ry={9} fill={dk} />
        </G>
      );
    case 'headphones':
      return (
        <G>
          <Path d="M20 84 C14 -4 206 -4 200 84" stroke={ac} strokeWidth={9} fill="none" strokeLinecap="round" />
          <Path d="M24 70 C22 4 198 4 196 70" stroke={lt} strokeWidth={2.5} fill="none" opacity={flat ? 1 : 0.6} />
          <Rect x={4} y={72} width={26} height={44} rx={13} fill={ac} />
          <Rect x={190} y={72} width={26} height={44} rx={13} fill={ac} />
          <Rect x={22} y={78} width={10} height={32} rx={5} fill={dk} />
          <Rect x={188} y={78} width={10} height={32} rx={5} fill={dk} />
        </G>
      );
    case 'earmuffs': {
      const fluff = (cx: number) => (
        <G>
          <Circle cx={cx} cy={92} r={19} fill={ac} />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <Circle key={a} cx={cx + Math.cos((a * Math.PI) / 180) * 15} cy={92 + Math.sin((a * Math.PI) / 180) * 15} r={7} fill={ac} />
          ))}
          <Circle cx={cx - 5} cy={86} r={7} fill={lt} />
        </G>
      );
      return (
        <G>
          <Path d="M20 84 C14 -4 206 -4 200 84" stroke={f('#E9ECF0')} strokeWidth={6} fill="none" strokeLinecap="round" />
          {fluff(18)}
          {fluff(202)}
        </G>
      );
    }
    case 'beanie':
      return (
        <G>
          <Path d="M72 54 C70 8 150 8 148 54 Z" fill={ac} />
          <Path d="M92 22 Q88 38 90 50 M110 16 L110 50 M128 22 Q132 38 130 50" stroke={dk} strokeWidth={2} fill="none" opacity={flat ? 1 : 0.5} />
          <Rect x={68} y={44} width={84} height={14} rx={7} fill={dk} />
          {!flat && [78, 88, 98, 108, 118, 128, 138].map((x) => <Path key={x} d={`M${x + 2} 47 L${x + 2} 55`} stroke={accent} strokeWidth={2.5} strokeLinecap="round" />)}
          <SwayDot x={110} y={12} r={10} sway={sway} amp={8} ox={110} oy={30} fill={lt} />
        </G>
      );
    case 'partyHat':
      return (
        <G rotation={-8} origin="110, 52">
          <Path d="M84 52 L110 8 L136 52 Q110 60 84 52 Z" fill={ac} />
          {!flat && (
            <>
              <Path d="M92 40 L110 30 L128 40 M98 28 L110 22 L120 28" stroke="#FFD45C" strokeWidth={4} fill="none" strokeLinejoin="round" strokeLinecap="round" />
              <Circle cx={100} cy={47} r={2.5} fill="#fff" />
              <Circle cx={120} cy={47} r={2.5} fill="#fff" />
            </>
          )}
          <Path d="M84 52 Q110 60 136 52" stroke={lt} strokeWidth={4} fill="none" strokeLinecap="round" />
          <SwayPath segs={[['M', 110, 8], ['Q', 118, 0, 126, 4]]} sway={sway} amp={22} ox={110} oy={8} stroke={f('#FF5FA2')} strokeWidth={3} />
          <SwayPath segs={[['M', 110, 8], ['Q', 102, 0, 94, 4]]} sway={sway} amp={22} ox={110} oy={8} lag={-0.4} stroke={f('#14C6D6')} strokeWidth={3} />
          <SwayDot x={110} y={4} r={6} sway={sway} amp={14} ox={110} oy={10} fill={f('#FFD45C')} />
        </G>
      );
    case 'monocle':
      return (
        <G>
          <Path d="M182 70 Q200 96 196 132" stroke={ac} strokeWidth={2.5} fill="none" strokeDasharray="3 3" strokeLinecap="round" />
          <Circle cx={164} cy={56} r={23} fill={flat ? 'none' : 'rgba(255,255,255,0.22)'} stroke={ac} strokeWidth={4.5} />
          {!flat && <Path d="M150 44 Q156 38 164 37" stroke="#fff" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.75} />}
          <Circle cx={196} cy={133} r={3.5} fill={ac} />
        </G>
      );
    case 'chefHat': {
      const edge = flat ? undefined : '#DDE2E8';
      return (
        <G>
          <Circle cx={90} cy={28} r={15} fill={f('#FFFFFF')} stroke={edge} strokeWidth={2} />
          <Circle cx={130} cy={28} r={15} fill={f('#FFFFFF')} stroke={edge} strokeWidth={2} />
          <Circle cx={110} cy={18} r={17} fill={f('#FFFFFF')} stroke={edge} strokeWidth={2} />
          <Rect x={82} y={24} width={56} height={22} fill={f('#FFFFFF')} />
          <Rect x={80} y={40} width={60} height={15} rx={4} fill={f('#FFFFFF')} stroke={edge} strokeWidth={2} />
          {!flat && <Path d="M96 30 L96 40 M110 28 L110 40 M124 30 L124 40" stroke="#DDE2E8" strokeWidth={2} strokeLinecap="round" />}
        </G>
      );
    }
    case 'snorkel':
      return (
        <G>
          <Path d="M150 114 Q204 122 202 72 L202 16" stroke={ac} strokeWidth={9} fill="none" strokeLinecap="round" />
          <Rect x={194} y={4} width={16} height={14} rx={4} fill={dk} />
          <Rect x={144} y={106} width={14} height={14} rx={5} fill={dk} />
          <Rect x={24} y={30} width={172} height={52} rx={26} fill={flat ? 'none' : 'rgba(170,236,255,0.3)'} stroke={f('#33475B')} strokeWidth={6} />
          <Path d="M104 34 Q110 52 116 34" stroke={f('#33475B')} strokeWidth={5} fill="none" strokeLinecap="round" />
          {!flat && <Path d="M40 44 L54 38 M150 44 L164 38" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.7} />}
        </G>
      );
    case 'leaf':
      return (
        <G>
          <SwayPath segs={[['M', 112, 54], ['Q', 108, 36, 112, 18]]} sway={sway} amp={7} ox={112} oy={54} stroke={dk} strokeWidth={4} />
          <SwayPath segs={[['M', 62, 28], ['Q', 112, -12, 162, 28], ['Q', 112, 22, 62, 28], ['Z']]} sway={sway} amp={7} ox={112} oy={54} fill={ac} />
          {!flat && (
            <SwayPath
              segs={[['M', 70, 25], ['Q', 112, 8, 154, 25], ['M', 90, 21], ['L', 84, 12], ['M', 112, 17], ['L', 112, 6], ['M', 134, 21], ['L', 140, 12]]}
              sway={sway}
              amp={7}
              ox={112}
              oy={54}
              stroke={tint(accent, 0.4)}
              strokeWidth={2.5}
            />
          )}
        </G>
      );
    case 'cowboy':
      return (
        <G>
          <Path d="M84 46 C80 14 92 8 110 18 C128 8 140 14 136 46 Z" fill={ac} />
          <Path d="M110 18 Q106 30 110 40" stroke={dk} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <Rect x={83} y={36} width={54} height={9} fill={dk} />
          <Path d="M40 36 Q50 54 110 52 Q170 54 180 36 Q184 48 172 54 Q140 64 110 62 Q80 64 48 54 Q36 48 40 36 Z" fill={ac} />
          <Path d="M48 50 Q110 62 172 50" stroke={dk} strokeWidth={2} fill="none" opacity={flat ? 1 : 0.5} />
        </G>
      );
    default:
      return null;
  }
}
