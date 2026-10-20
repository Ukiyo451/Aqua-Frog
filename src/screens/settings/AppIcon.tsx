import { ReactNode, useId, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';
import { FrogAvatar } from '../../components/Frogs';
import { CheckIcon } from '../../components/Icons';
import { Bounce } from '../../components/Pressable';
import { Dialog, Screen, Title } from '../../components/ui';
import { useStore } from '../../lib/store';
import { colors } from '../../theme';
import { FaceColors, FrogFaceShape, GREEN_FACE } from './common';
import { playSound } from './sounds';

const { width: SW } = Dimensions.get('window');

type IconDef =
  | { kind: 'face'; bg: string; face: FaceColors }
  | { kind: 'bands'; shape: 'frog' | 'cup' | 'drop'; bands: string[] }
  | { kind: 'glass' }
  | { kind: 'avatar'; frog: string; bg: string };

const RAINBOW = ['#FF5FA2', '#FFB23F', '#FFD45C', '#14C6D6', '#3E64E6', '#5B3FC4'];
const PRIDE = ['#E5484D', '#FF8A3D', '#FFD45C', '#46B04A', '#3E64E6', '#8E3BE8'];

export const APP_ICONS: { id: string; name: string; def: IconDef }[] = [
  { id: 'classic', name: 'Classic', def: { kind: 'face', bg: colors.water, face: GREEN_FACE } },
  { id: 'dark', name: 'Midnight', def: { kind: 'face', bg: '#1E2430', face: GREEN_FACE } },
  { id: 'pink', name: 'Blossom', def: { kind: 'face', bg: '#FFE1EE', face: { body: '#FF8DBE', dark: '#D94A88', cheek: '#FFD45C' } } },
  { id: 'rainbow', name: 'Rainbow', def: { kind: 'bands', shape: 'frog', bands: RAINBOW } },
  { id: 'cup', name: 'Cup', def: { kind: 'bands', shape: 'cup', bands: ['#FF5FA2', '#FFD45C', '#14C6D6', '#5B3FC4'] } },
  { id: 'drop', name: 'Drop', def: { kind: 'bands', shape: 'drop', bands: ['#FF8DBE', '#FFB23F', '#14C6D6', '#3E64E6'] } },
  { id: 'glass', name: 'Glass', def: { kind: 'glass' } },
  { id: 'pride', name: 'Pride', def: { kind: 'bands', shape: 'frog', bands: PRIDE } },
  { id: 'lily', name: 'Lily', def: { kind: 'avatar', frog: 'lily', bg: '#B9E8F0' } },
  { id: 'hank', name: 'Hank', def: { kind: 'avatar', frog: 'hank', bg: colors.water } },
  { id: 'ziggy', name: 'Ziggy', def: { kind: 'avatar', frog: 'ziggy', bg: '#FFD45C' } },
  { id: 'sunny', name: 'Sunny', def: { kind: 'avatar', frog: 'sunny', bg: '#FF8DBE' } },
];

const BY_ID = Object.fromEntries(APP_ICONS.map((i) => [i.id, i]));

function silhouette(shape: 'frog' | 'cup' | 'drop'): ReactNode {
  if (shape === 'cup') return <Path d="M27 20 H73 L66 84 Q65 90 59 90 H41 Q35 90 34 84 Z" />;
  if (shape === 'drop') return <Path d="M50 12 C46 20 24 44 24 62 C24 77 36 89 50 89 C64 89 76 77 76 62 C76 44 54 20 50 12 Z" />;
  return (
    <>
      <Circle cx={33} cy={30} r={13} />
      <Circle cx={67} cy={30} r={13} />
      <Ellipse cx={50} cy={46} rx={36} ry={20} />
      <Ellipse cx={50} cy={68} rx={30} ry={22} />
      <Ellipse cx={27} cy={86} rx={17} ry={7} />
      <Ellipse cx={73} cy={86} rx={17} ry={7} />
    </>
  );
}

/** One app icon drawn in code, as a rounded square of `size` points. */
export function AppIconTile({ id, size }: { id: string; size: number }) {
  const clip = `ic${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const icon = BY_ID[id] ?? BY_ID.classic;
  const def = icon.def;
  const radius = size * 0.23;
  const white = def.kind === 'bands' || def.kind === 'glass';
  const bg = def.kind === 'face' || def.kind === 'avatar' ? def.bg : '#fff';
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: radius, backgroundColor: bg }, white && styles.tileWhite]}>
      {def.kind === 'avatar' ? (
        <View style={styles.avatar}>
          <FrogAvatar id={def.frog} size={size * 0.92} />
        </View>
      ) : (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {def.kind === 'face' && <FrogFaceShape c={def.face} x={8} y={14} s={0.84} />}
          {def.kind === 'bands' && (
            <>
              <Defs>
                <ClipPath id={clip}>{silhouette(def.shape)}</ClipPath>
              </Defs>
              <G clipPath={`url(#${clip})`}>
                {def.bands.map((c, i) => {
                  const top = 12 + (i * 80) / def.bands.length;
                  return <Rect key={c + i} x={0} y={top} width={100} height={80 / def.bands.length + 1} fill={c} />;
                })}
              </G>
              {def.shape === 'frog' && (
                <>
                  <Circle cx={33} cy={29} r={5} fill="#fff" />
                  <Circle cx={67} cy={29} r={5} fill="#fff" />
                  <Circle cx={34} cy={30} r={2.6} fill="#1E2430" />
                  <Circle cx={66} cy={30} r={2.6} fill="#1E2430" />
                </>
              )}
            </>
          )}
          {def.kind === 'glass' && (
            <>
              <Path d="M28 18 H72 L67 86 Q66 90 62 90 H38 Q34 90 33 86 Z" fill="#E4F7FA" />
              <Path d="M30.6 42 Q40 38 50 42 T69.4 42 L67 86 Q66 90 62 90 H38 Q34 90 33 86 Z" fill={colors.water} />
              <Path d="M36 50 L38 80" stroke="rgba(255,255,255,0.6)" strokeWidth={4} strokeLinecap="round" />
            </>
          )}
        </Svg>
      )}
    </View>
  );
}

export function AppIconScreen() {
  const { state, update } = useStore();
  const [chosen, setChosen] = useState<string | null>(null);
  const gap = 14;
  const size = Math.floor((Math.min(SW, 520) - 32 - gap * 2) / 3);
  const current = state.settings.appIcon;
  return (
    <View style={{ flex: 1 }}>
      <Screen testID="screen-appIcon">
        <Title>App icon</Title>
        <View style={[styles.grid, { gap }]}>
          {APP_ICONS.map((icon, i) => (
            <Animated.View key={icon.id} entering={FadeInDown.delay(60 + i * 35).springify().damping(16)}>
              <Bounce
                testID={`icon-${icon.id}`}
                onPress={() => {
                  playSound('tap');
                  update((s) => ({ settings: { ...s.settings, appIcon: icon.id } }));
                  setChosen(icon.id);
                }}
              >
                <AppIconTile id={icon.id} size={size} />
                {current === icon.id && (
                  <Animated.View entering={ZoomIn.springify().damping(9).stiffness(260)} style={styles.badge}>
                    <CheckIcon size={13} />
                  </Animated.View>
                )}
              </Bounce>
            </Animated.View>
          ))}
        </View>
      </Screen>
      <Dialog
        visible={chosen !== null}
        icon={chosen ? <View style={{ marginBottom: 12 }}><AppIconTile id={chosen} size={64} /></View> : undefined}
        title="You have changed the icon for “Lily”."
        actions={[{ label: 'OK' }]}
        onClose={() => setChosen(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  tileWhite: { borderWidth: 1, borderColor: '#ECEEF2' },
  avatar: { position: 'absolute', bottom: -2, left: 0, right: 0, alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.purple,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
