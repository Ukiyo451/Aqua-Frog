import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Frog } from '../../components/Frogs';
import { Bounce } from '../../components/Pressable';
import { Screen, useShare } from '../../components/ui';
import { colors, fonts } from '../../theme';
import { Bob } from './common';

const INVITE = 'I’m drinking more water with Lily the frog 🐸💧 Every glass fills her up, and finishing your goal unlocks new frog friends. Come hydrate with me!';

const g = (c: string) => ({ stroke: c, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

const BUTTONS: { id: string; label: string; color: string; bg: string; glyph: ReactNode }[] = [
  {
    id: 'messages',
    label: 'Messages',
    color: '#2FAE5B',
    bg: '#DDF8E5',
    glyph: (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path d="M12 4 C6.5 4 3 7.3 3 11.2 C3 13.4 4.2 15.3 6 16.6 L5 20 L9 18 Q10.4 18.4 12 18.4 C17.5 18.4 21 15.1 21 11.2 C21 7.3 17.5 4 12 4 Z" fill="#2FAE5B" />
      </Svg>
    ),
  },
  {
    id: 'messenger',
    label: 'Messenger',
    color: '#6A5AE0',
    bg: '#E9E7FC',
    glyph: (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={9} {...g('#6A5AE0')} />
        <Path d="M7 14 L10.5 10 L13 12 L17 9.5 L13.5 14 L11 12 Z" fill="#6A5AE0" />
      </Svg>
    ),
  },
  {
    id: 'instagram',
    label: 'Instagram',
    color: '#D9467C',
    bg: '#FCE3EC',
    glyph: (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Rect x={4} y={4} width={16} height={16} rx={5} {...g('#D9467C')} />
        <Circle cx={12} cy={12} r={3.6} {...g('#D9467C')} />
        <Circle cx={16.6} cy={7.4} r={1.1} fill="#D9467C" />
      </Svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: '#3E6FD8',
    bg: '#E2ECFC',
    glyph: (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={9} {...g('#3E6FD8')} />
        <Path d="M13.2 20.5 V12 H15.5 M13.2 12 V9.6 Q13.2 8 15 8 H16 M10.5 12 H13.2" {...g('#3E6FD8')} />
      </Svg>
    ),
  },
  {
    id: 'more',
    label: 'More',
    color: '#1BA9B8',
    bg: '#DDF6F9',
    glyph: (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path d="M3.5 11 L20.5 4 L14 20.5 L11.5 13 Z" fill="#1BA9B8" />
        <Path d="M11.5 13 L20.5 4" stroke="#fff" strokeWidth={1.4} />
      </Svg>
    ),
  },
];

export function HydrateFriendsScreen() {
  const share = useShare();
  return (
    <Screen chrome="close" testID="hydrateFriends">
      <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.card}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.eyebrow}>BETTER TOGETHER</Text>
          <Text style={styles.cardTitle}>Hydrate{'\n'}your friends</Text>
          <Text style={styles.cardText}>Invite a friend and keep each other sipping.</Text>
        </View>
        <View style={styles.frog}>
          <Bob amp={4} ms={1800}>
            <Frog id="lily" width={130} />
          </Bob>
        </View>
      </Animated.View>
      <View style={{ marginTop: 24, alignItems: 'center' }}>
        {BUTTONS.map((b, i) => (
          <Animated.View key={b.id} entering={FadeInDown.delay(120 + i * 60).springify().damping(14)} style={{ width: '82%' }}>
            <Bounce onPress={() => share(INVITE)} style={[styles.btn, { backgroundColor: b.bg }]} testID={`share-${b.id}`}>
              {b.glyph}
              <Text style={[styles.btnText, { color: b.color }]}>{b.label}</Text>
            </Bounce>
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#3FB98A', borderRadius: 28, padding: 22, minHeight: 170, overflow: 'hidden' },
  eyebrow: { fontFamily: fonts.black, fontSize: 11, color: 'rgba(0,0,0,0.35)', letterSpacing: 1 },
  cardTitle: { fontFamily: fonts.black, fontSize: 30, color: '#fff', lineHeight: 34, marginTop: 6 },
  cardText: { fontFamily: fonts.semibold, fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 8, maxWidth: 170 },
  frog: { position: 'absolute', right: -14, bottom: -18 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 56, borderRadius: 28, marginBottom: 12 },
  btnText: { fontFamily: fonts.extra, fontSize: 18 },
});
