import { useEffect, useId } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedG = Animated.createAnimatedComponent(G);

// Dehydrated look: Lily's skin dries out to this olive tone and her lids take on the blend.
const DRY_TINT = '#C9A968';
const DRY_SKIN = '#ABBC61';
const CRACK = '#8C7340';

export type Mood = 'happy' | 'sad' | 'cool' | 'wow';

const VB_W = 220;
const VB_H = 260;
const FACE_H = 156;
// Highest point of the silhouette (top of the eyes) — fill = 1 reaches it.
const TOP_Y = 28;
const TOES = [8, 24, 40, 180, 196, 212];

/**
 * Every shape that makes up Lily's outline. Drawn flat for the silhouette and reused
 * as the clip path for the water that fills her up.
 */
function outline(fill: string) {
  return [
    <Ellipse key="lf" cx={40} cy={245} rx={38} ry={12} fill={fill} />,
    <Ellipse key="rf" cx={180} cy={245} rx={38} ry={12} fill={fill} />,
    <Ellipse key="lt" cx={50} cy={210} rx={40} ry={34} fill={fill} />,
    <Ellipse key="rt" cx={170} cy={210} rx={40} ry={34} fill={fill} />,
    <Ellipse key="body" cx={110} cy={180} rx={70} ry={66} fill={fill} />,
    <Ellipse key="la" cx={70} cy={198} rx={14} ry={46} rotation={-16} origin="70, 198" fill={fill} />,
    <Ellipse key="ra" cx={150} cy={198} rx={14} ry={46} rotation={16} origin="150, 198" fill={fill} />,
    <Ellipse key="lh" cx={88} cy={244} rx={20} ry={11} fill={fill} />,
    <Ellipse key="rh" cx={132} cy={244} rx={20} ry={11} fill={fill} />,
    ...TOES.map((x) => <Circle key={`t${x}`} cx={x} cy={249} r={8} fill={fill} />),
    <Ellipse key="head" cx={110} cy={102} rx={94} ry={50} fill={fill} />,
    <Circle key="le" cx={56} cy={60} r={31} fill={fill} />,
    <Circle key="re" cx={164} cy={60} r={31} fill={fill} />,
  ];
}

function LilyFlower({ hydration }: { hydration?: SharedValue<number> }) {
  const petals = [-60, -30, 0, 30, 60];
  const wilt = useAnimatedProps(() => ({ opacity: hydration ? (1 - hydration.value) * 0.75 : 0 }));
  return (
    <G rotation={22} origin="180, 34">
      <Ellipse cx={180} cy={38} rx={18} ry={5} fill={colors.frogDeep} opacity={0.45} />
      {petals.map((deg, i) => (
        <Ellipse
          key={deg}
          cx={180}
          cy={22}
          rx={6.5}
          ry={13}
          fill={i % 2 ? colors.lily : colors.lilyDeep}
          origin="180, 34"
          rotation={deg}
        />
      ))}
      <Circle cx={180} cy={31} r={5} fill={colors.sun} />
      {/* a thirsty lily fades to a dry, papery brown */}
      <AnimatedG animatedProps={wilt}>
        {petals.map((deg) => (
          <Ellipse key={deg} cx={180} cy={22} rx={6.5} ry={13} fill="#C9A27A" origin="180, 34" rotation={deg} />
        ))}
      </AnimatedG>
    </G>
  );
}

const lerp = (a: number, b: number, t: number) => {
  'worklet';
  return a + (b - a) * t;
};

/** A frown that curls up into a grin as Lily drinks; her tongue only shows once she's happy. */
function HydrationMouth({ hydration }: { hydration: SharedValue<number> }) {
  const line = useAnimatedProps(() => {
    const t = hydration.value;
    const y1 = lerp(126, 108, t);
    const qy = lerp(112, 142, t);
    return { d: `M${lerp(84, 70, t)} ${y1} Q110 ${qy} ${lerp(136, 150, t)} ${y1}` };
  });
  const tongue = useAnimatedProps(() => ({ opacity: Math.min(1, Math.max(0, (hydration.value - 0.55) * 4)) }));
  return (
    <G>
      <AnimatedPath animatedProps={line} stroke="#2E3A2A" strokeWidth={4.5} strokeLinecap="round" fill="none" />
      <AnimatedPath animatedProps={tongue} d="M99 122 Q110 136 121 122 Z" fill="#FF7E9D" />
    </G>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  const stroke = '#2E3A2A';
  if (mood === 'sad') {
    return <Path d="M84 126 Q110 108 136 126" stroke={stroke} strokeWidth={4.5} strokeLinecap="round" fill="none" />;
  }
  if (mood === 'wow') {
    return (
      <G>
        <Ellipse cx={110} cy={120} rx={18} ry={14} fill="#7A2B3A" />
        <Ellipse cx={110} cy={127} rx={11} ry={6} fill="#FF7E9D" />
      </G>
    );
  }
  return (
    <G>
      <Path d="M70 108 Q110 142 150 108" stroke={stroke} strokeWidth={4.5} strokeLinecap="round" fill="none" />
      <Path d="M99 122 Q110 136 121 122 Z" fill="#FF7E9D" />
    </G>
  );
}

interface EyeProps {
  cx: number;
  lid: SharedValue<number>;
  mood: Mood;
  hydration?: SharedValue<number>;
}

function Eye({ cx, lid, mood, hydration }: EyeProps) {
  // the lid comes down from the top: a blink closes it fully, thirst leaves it half shut
  const lidProps = useAnimatedProps(() => {
    const h = hydration ? hydration.value : 1;
    const r = Math.max(lid.value * 22, (1 - h) * 12);
    return {
      cy: 34 + r,
      ry: r,
      fill: hydration ? interpolateColor(h, [0, 1], [DRY_SKIN, colors.frog]) : colors.frog,
    };
  });
  const bags = useAnimatedProps(() => ({ opacity: hydration ? (1 - hydration.value) * 0.8 : 0 }));
  const pupilY = mood === 'sad' ? 64 : 59;
  return (
    <G>
      <Circle cx={cx} cy={56} r={20} fill="#fff" />
      <Circle cx={cx + (cx < 110 ? 3 : -3)} cy={pupilY} r={mood === 'wow' ? 8 : 11} fill="#1F2A37" />
      <Circle cx={cx - 2} cy={pupilY - 5} r={4} fill="#fff" />
      <AnimatedEllipse cx={cx} rx={23} animatedProps={lidProps} />
      <AnimatedPath animatedProps={bags} d={`M${cx - 14} 80 Q${cx} 88 ${cx + 14} 80`} stroke={CRACK} strokeWidth={3} strokeLinecap="round" fill="none" />
      {mood === 'sad' && (
        <Path
          d={cx < 110 ? `M${cx - 18} 40 L${cx + 14} 48` : `M${cx + 18} 40 L${cx - 14} 48`}
          stroke={colors.frogDeep}
          strokeWidth={5}
          strokeLinecap="round"
        />
      )}
    </G>
  );
}

interface ColorBodyProps {
  mood: Mood;
  lid: SharedValue<number>;
  hydration?: SharedValue<number>;
  /** Drawn over the skin but under the face, e.g. the water inside her. */
  inside?: React.ReactNode;
}

/** Dry, cracked skin that fades away as Lily rehydrates, plus heat shimmer above her head. */
function Thirst({ hydration }: { hydration: SharedValue<number> }) {
  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [shimmer]);
  const tint = useAnimatedProps(() => ({ opacity: (1 - hydration.value) * 0.6 }));
  const cracks = useAnimatedProps(() => ({ opacity: Math.max(0, 1 - hydration.value * 1.6) }));
  const heat = useAnimatedProps(() => ({
    opacity: Math.max(0, 1 - hydration.value * 3) * (0.35 + shimmer.value * 0.65),
  }));
  const crack = { stroke: CRACK, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <G>
      <AnimatedG animatedProps={tint}>{outline(DRY_TINT)}</AnimatedG>
      <AnimatedG animatedProps={cracks}>
        <Path d="M74 70 L82 78 L78 86 M82 78 L90 76" {...crack} />
        <Path d="M140 136 L148 128 L156 132 M148 128 L146 120" {...crack} />
        <Path d="M96 196 L104 204 L100 214 M104 204 L112 202" {...crack} />
        <Path d="M40 206 L48 214 L44 222" {...crack} />
        <Path d="M172 200 L178 210 L186 212" {...crack} />
      </AnimatedG>
      <AnimatedG animatedProps={heat}>
        {[80, 110, 140].map((x) => (
          <Path key={x} d={`M${x} 22 q-5 -6 0 -12 q5 -6 0 -12`} stroke="#E8B04A" strokeWidth={3} strokeLinecap="round" fill="none" />
        ))}
      </AnimatedG>
    </G>
  );
}

function ColorBody({ mood, lid, hydration, inside }: ColorBodyProps) {
  const cheeks = useAnimatedProps(() => ({ opacity: hydration ? 0.15 + hydration.value * 0.5 : 0.65 }));
  return (
    <G>
      {/* back legs + feet */}
      <Ellipse cx={40} cy={245} rx={38} ry={12} fill={colors.frogDark} />
      <Ellipse cx={180} cy={245} rx={38} ry={12} fill={colors.frogDark} />
      {TOES.map((x) => (
        <Circle key={x} cx={x} cy={249} r={8} fill={colors.frogDark} />
      ))}
      <Ellipse cx={50} cy={210} rx={40} ry={34} fill="#6CCF4F" />
      <Ellipse cx={170} cy={210} rx={40} ry={34} fill="#6CCF4F" />
      {/* body */}
      <Ellipse cx={110} cy={180} rx={70} ry={66} fill={colors.frog} />
      <Ellipse cx={110} cy={188} rx={46} ry={52} fill={colors.belly} />
      <Path d="M86 172 Q110 181 134 172" stroke="#CDEFA4" strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M80 196 Q110 206 140 196" stroke="#CDEFA4" strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M84 220 Q110 228 136 220" stroke="#CDEFA4" strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* arms */}
      <Ellipse cx={70} cy={198} rx={14} ry={46} rotation={-16} origin="70, 198" fill="#6CCF4F" />
      <Ellipse cx={150} cy={198} rx={14} ry={46} rotation={16} origin="150, 198" fill="#6CCF4F" />
      <Ellipse cx={88} cy={244} rx={20} ry={11} fill={colors.frogDark} />
      <Ellipse cx={132} cy={244} rx={20} ry={11} fill={colors.frogDark} />
      {[76, 88, 100, 120, 132, 144].map((x) => (
        <Circle key={`f${x}`} cx={x} cy={250} r={6} fill={colors.frogDark} />
      ))}
      {/* head */}
      <Circle cx={56} cy={60} r={31} fill={colors.frog} />
      <Circle cx={164} cy={60} r={31} fill={colors.frog} />
      <Ellipse cx={110} cy={102} rx={94} ry={50} fill={colors.frog} />
      <Circle cx={96} cy={70} r={5} fill="#6CCB50" />
      <Circle cx={124} cy={66} r={4} fill="#6CCB50" />
      <Circle cx={146} cy={144} r={4} fill="#6CCB50" />
      <Circle cx={70} cy={160} r={5} fill="#6CCB50" />
      {hydration && <Thirst hydration={hydration} />}
      {inside}
      <Eye cx={56} lid={lid} mood={mood} hydration={hydration} />
      <Eye cx={164} lid={lid} mood={mood} hydration={hydration} />
      <Circle cx={102} cy={92} r={2.5} fill={colors.frogDeep} />
      <Circle cx={118} cy={92} r={2.5} fill={colors.frogDeep} />
      <AnimatedG animatedProps={cheeks}>
        <Ellipse cx={36} cy={112} rx={13} ry={7} fill={colors.lily} />
        <Ellipse cx={184} cy={112} rx={13} ry={7} fill={colors.lily} />
      </AnimatedG>
      {hydration && mood === 'happy' ? <HydrationMouth hydration={hydration} /> : <Mouth mood={mood} />}
      {mood === 'cool' && (
        <G>
          <Rect x={28} y={42} width={58} height={32} rx={14} fill="#1E2430" />
          <Rect x={134} y={42} width={58} height={32} rx={14} fill="#1E2430" />
          <Rect x={84} y={50} width={52} height={7} rx={3} fill="#1E2430" />
          <Path d="M38 50 L52 50" stroke="#5B7CFF" strokeWidth={5} strokeLinecap="round" />
          <Path d="M144 50 L158 50" stroke="#5B7CFF" strokeWidth={5} strokeLinecap="round" />
        </G>
      )}
      {mood === 'sad' && <Path d="M196 72 Q206 88 196 96 Q186 88 196 72 Z" fill="#8ADDF5" />}
      <LilyFlower hydration={hydration} />
    </G>
  );
}

interface WaterProps {
  fill: number;
  clipId: string;
}

/** Two layered sine waves that rise to `fill` and slosh whenever the level changes. */
function Water({ fill, clipId }: WaterProps) {
  const level = useSharedValue(fill);
  const phase = useSharedValue(0);
  const amp = useSharedValue(3);

  useEffect(() => {
    phase.value = withRepeat(withTiming(Math.PI * 2, { duration: 2400, easing: Easing.linear }), -1);
  }, [phase]);

  useEffect(() => {
    level.value = withTiming(fill, { duration: 1400, easing: Easing.out(Easing.cubic) });
    amp.value = withSequence(withTiming(9, { duration: 250 }), withTiming(3, { duration: 1800 }));
  }, [fill, level, amp]);

  return (
    <G clipPath={`url(#${clipId})`}>
      <WaveLayer level={level} phase={phase} amp={amp} offset={Math.PI} lift={3} color={colors.waterDeep} />
      <WaveLayer level={level} phase={phase} amp={amp} offset={0} lift={0} color={colors.water} />
    </G>
  );
}

interface WaveLayerProps {
  level: SharedValue<number>;
  phase: SharedValue<number>;
  amp: SharedValue<number>;
  offset: number;
  lift: number;
  color: string;
}

function WaveLayer({ level, phase, amp, offset, lift, color }: WaveLayerProps) {
  const props = useAnimatedProps(() => {
    const y = VB_H - level.value * (VB_H - TOP_Y) - lift;
    let d = `M0 ${VB_H + 10}`;
    for (let x = 0; x <= VB_W; x += 10) {
      const wy = y + Math.sin((x / VB_W) * Math.PI * 3 + phase.value + offset) * amp.value;
      d += ` L${x} ${level.value <= 0.001 ? VB_H + 10 : wy}`;
    }
    return { d: `${d} L${VB_W} ${VB_H + 10} Z` };
  });
  return <AnimatedPath animatedProps={props} fill={color} />;
}

export interface LilyProps {
  width: number;
  mood?: Mood;
  variant?: 'color' | 'silhouette';
  /** 0..1 water level. Silhouette: fills her solid; colour: a see-through water line inside her. */
  fill?: number;
  /**
   * 0..1 how hydrated Lily looks (colour only). 0 is parched: olive cracked skin, droopy
   * lids, a frown, a wilted flower and a slump; 1 is her normal happy self.
   */
  hydration?: number;
  crop?: 'full' | 'face';
  /** Breathing + blinking. */
  idle?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Lily({ width, mood = 'happy', variant = 'color', fill = 0, hydration, crop = 'full', idle = true, style }: LilyProps) {
  const clipId = `lily${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const lid = useSharedValue(0);
  const thirst = useSharedValue(hydration ?? 1);
  useEffect(() => {
    thirst.value = withTiming(hydration ?? 1, { duration: 1600, easing: Easing.out(Easing.cubic) });
  }, [hydration, thirst]);
  const breath = useSharedValue(0);
  const vbH = crop === 'face' ? FACE_H : VB_H;
  const height = (width * vbH) / VB_W;

  useEffect(() => {
    if (!idle) return;
    lid.value = withRepeat(
      withSequence(
        withDelay(2600, withTiming(1, { duration: 90 })),
        withTiming(0, { duration: 110 }),
        withDelay(180, withTiming(1, { duration: 80 })),
        withTiming(0, { duration: 110 }),
      ),
      -1,
    );
    breath.value = withRepeat(withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [idle, lid, breath]);

  const breathe = useAnimatedStyle(() => {
    // a thirsty frog slumps a little lower and wider
    const slump = hydration === undefined ? 0 : (1 - thirst.value) * 0.07;
    return {
      transform: [{ scaleY: (1 - slump) * (1 + breath.value * 0.018) }, { scaleX: (1 + slump * 0.4) * (1 - breath.value * 0.008) }],
    };
  });

  return (
    <Animated.View style={[{ width, height, transformOrigin: 'bottom' }, breathe, style]}>
      <Svg width={width} height={height} viewBox={`0 0 ${VB_W} ${vbH}`}>
        {variant === 'color' ? (
          <>
            {fill > 0 && (
              <Defs>
                <ClipPath id={clipId}>{outline('#000')}</ClipPath>
              </Defs>
            )}
            <ColorBody
              mood={mood}
              lid={lid}
              hydration={hydration === undefined ? undefined : thirst}
              inside={
                fill > 0 ? (
                  <G opacity={0.35}>
                    <Water fill={fill} clipId={clipId} />
                  </G>
                ) : null
              }
            />
          </>
        ) : (
          <>
            <Defs>
              <ClipPath id={clipId}>{outline('#000')}</ClipPath>
            </Defs>
            {outline(colors.silhouette)}
            <Water fill={fill} clipId={clipId} />
            {/* faint face so the outline still reads as a frog */}
            <G opacity={0.55}>
              <Circle cx={56} cy={58} r={14} fill="#DCE0E6" />
              <Circle cx={164} cy={58} r={14} fill="#DCE0E6" />
              <Path d="M74 110 Q110 138 146 110" stroke="#DCE0E6" strokeWidth={5} strokeLinecap="round" fill="none" />
            </G>
          </>
        )}
      </Svg>
    </Animated.View>
  );
}

/** A tiny frog-head avatar for notification banners and loaders. */
export function LilyBadge({ size }: { size: number }) {
  return <Lily width={size} crop="face" />;
}
