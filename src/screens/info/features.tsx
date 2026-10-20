import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { FrogAvatar } from '../../components/Frogs';
import { CheckIcon } from '../../components/Icons';
import { CHALLENGES } from '../../lib/challenges';
import { CHARACTERS } from '../../lib/characters';
import { CATALOG } from '../../lib/drinks';
import { colors, fonts } from '../../theme';
import { LayeredFrog } from './common';

const s = (c: string) => ({ stroke: c, strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

const icon = {
  drinks: (
    <Svg width={38} height={38} viewBox="0 0 38 38">
      <Path d="M6 12 H18 L16.5 32 H7.5 Z" fill="#E5527A" />
      <Path d="M17 9 H31 L29 33 H19 Z" fill="#FFB23F" />
      <Rect x={20} y={4} width={3} height={9} rx={1.5} fill="#4FCB7B" />
      <Path d="M18.4 18 H29.6 L29 26 H19 Z" fill="#FF8A3D" />
    </Svg>
  ),
  watch: (
    <Svg width={38} height={38} viewBox="0 0 38 38">
      <Rect x={12} y={2} width={14} height={34} rx={5} fill="#BDEBF2" />
      <Rect x={8} y={9} width={22} height={20} rx={6} fill="#4BC9DA" />
      <Rect x={11} y={12} width={16} height={14} rx={4} fill="#fff" />
      <Path d="M15 21 L18 17 L23 22" {...s('#4BC9DA')} strokeWidth={1.8} />
    </Svg>
  ),
  challenges: (
    <Svg width={38} height={38} viewBox="0 0 38 38">
      <Path d="M11 5 H27 V13 Q27 22 19 22 Q11 22 11 13 Z" fill="#F0606E" />
      <Path d="M11 8 H6 Q6 15 11 15 M27 8 H32 Q32 15 27 15" {...s('#F0606E')} />
      <Rect x={17} y={22} width={4} height={6} fill="#F0606E" />
      <Rect x={12} y={28} width={14} height={5} rx={2} fill="#C9414E" />
      <Circle cx={28} cy={29} r={6} fill="#FFD45C" />
      <Path d="M25.5 29 L27.4 31 L30.6 27.4" {...s('#fff')} strokeWidth={1.6} />
    </Svg>
  ),
  custom: (
    <Svg width={38} height={38} viewBox="0 0 38 38">
      <Circle cx={19} cy={19} r={16} stroke="#4FCB7B" strokeWidth={2} strokeDasharray="4 4" fill="none" />
      <Path d="M12 11 H26 L24.5 29 H13.5 Z" fill="#4FCB7B" />
      <Path d="M19 16 V24 M15 20 H23" {...s('#fff')} />
    </Svg>
  ),
  history: (
    <Svg width={38} height={38} viewBox="0 0 38 38">
      <Rect x={4} y={7} width={30} height={26} rx={5} fill="#FFE2A3" />
      <Rect x={4} y={7} width={30} height={8} rx={4} fill="#F5B82E" />
      <Rect x={10} y={3} width={3} height={8} rx={1.5} fill="#C68C12" />
      <Rect x={25} y={3} width={3} height={8} rx={1.5} fill="#C68C12" />
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <Circle key={`${r}${c}`} cx={10 + c * 6} cy={19.5 + r * 5} r={1.6} fill="#fff" />))}
    </Svg>
  ),
  personalize: (
    <Svg width={38} height={38} viewBox="0 0 38 38">
      <Path d="M9 8 H23 L21 32 H11 Z" fill="#F4A3C7" />
      <Path d="M23 13 Q30 13 30 19 Q30 25 22 25" {...s('#C4628D')} />
      <Path d="M27 4 L31 8 M29 4 L29 10" {...s('#C4628D')} strokeWidth={1.8} />
    </Svg>
  ),
  celebrate: (
    <View style={{ width: 38, height: 38, borderRadius: 6, borderWidth: 2, borderColor: '#E1E4E9', alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden', backgroundColor: '#fff' }}>
      <LayeredFrog width={30} eyes={false} />
    </View>
  ),
  rocket: (
    <Svg width={38} height={38} viewBox="0 0 38 38">
      <Path d="M30 6 Q20 6 14 16 L22 24 Q32 18 32 8 Z" fill="#3FB98A" />
      <Circle cx={23} cy={14} r={3} fill="#fff" />
      <Path d="M14 16 L8 16 L12 11 L18 11 M22 24 L22 30 L27 26 L27 20" fill="#2A9368" />
      <Path d="M12 22 Q7 25 6 32 Q13 31 16 26" fill="#FFB23F" />
    </Svg>
  ),
};

export interface Feature {
  title: string;
  body: string;
  color: string;
  icon: ReactNode;
}

const frogs = CHARACTERS.filter((c) => c.section !== 'supporter').length;
const challenges = CHALLENGES.length || CHARACTERS.filter((c) => c.section === 'challenge').length;
const drinks = Math.floor(CATALOG.length / 10) * 10;

export const FEATURES: Feature[] = [
  { title: `${drinks}+ Popular Drinks`, body: 'Log water from coffee, tea, juice, smoothies, soda and more', color: '#FF8A3D', icon: icon.drinks },
  { title: 'Apple Watch App', body: 'Add any drink right from your wrist', color: colors.water, icon: icon.watch },
  { title: `${frogs} Frog Friends`, body: 'Finish your goal and a new frog hops into your pond', color: colors.frogDeep, icon: <FrogAvatar id="hank" size={38} /> },
  { title: `${challenges} Healthy Challenges`, body: 'Go caffeine-free, swap soda for water, or try a sober week', color: '#F0606E', icon: icon.challenges },
  { title: 'Create Custom Drinks', body: 'Pick a name, colour, cup size, hydration and caffeine', color: '#3FB86A', icon: icon.custom },
  { title: 'Edit Your History', body: 'Delete mistakes or add drinks you forgot on earlier days', color: '#E0A21A', icon: icon.history },
  { title: 'Personalize', body: 'Arrange your drinks row and set each cup size', color: '#C4628D', icon: icon.personalize },
  { title: 'Celebrate Your Day', body: 'A shareable poster of your day in colourful layers', color: '#6A4FD9', icon: icon.celebrate },
  { title: 'Every New Feature', body: 'Get new frogs, drinks and tools the moment they land', color: '#2A9368', icon: icon.rocket },
];

export function FeatureList({ delay = 0 }: { delay?: number }) {
  return (
    <View>
      {FEATURES.map((f, i) => (
        <Animated.View key={f.title} entering={FadeInDown.delay(delay + i * 50).springify()} style={styles.row}>
          <View style={[styles.check, { backgroundColor: `${f.color}22` }]}>
            <CheckIcon size={11} color={f.color} />
          </View>
          <View style={styles.icon}>{f.icon}</View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: f.color }]}>{f.title}</Text>
            <Text style={styles.body}>{f.body}</Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  check: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 42, alignItems: 'center' },
  title: { fontFamily: fonts.extra, fontSize: 16 },
  body: { fontFamily: fonts.semibold, fontSize: 14, color: colors.inkSoft, lineHeight: 19, marginTop: 1 },
});
