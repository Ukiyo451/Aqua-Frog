import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { FrogAvatar } from '../../components/Frogs';
import { Bounce } from '../../components/Pressable';
import { Screen, Subtitle, Title } from '../../components/ui';
import { useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { Bob, Pulse } from './common';

function BreatheArt() {
  return (
    <View style={styles.art}>
      <Svg width="100%" height="100%" viewBox="0 0 320 170" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
        <Rect width={320} height={170} fill="#7FC8F0" />
        {[90, 70, 50, 30].map((r, i) => (
          <Circle key={r} cx={235} cy={95} r={r} fill="#fff" opacity={0.12 + i * 0.06} />
        ))}
      </Svg>
      <View style={styles.artText}>
        <Text style={styles.artTitle}>Breathe{'\n'}widget</Text>
        <Text style={styles.artTag}>IN • HOLD • OUT</Text>
      </View>
      <View style={{ position: 'absolute', right: 52, top: 40 }}>
        <Pulse ms={4000} scale={0.12}>
          <FrogAvatar id="frosty" size={86} />
        </Pulse>
      </View>
    </View>
  );
}

function CycleArt() {
  return (
    <View style={styles.art}>
      <Svg width="100%" height="100%" viewBox="0 0 320 170" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
        <Rect width={320} height={170} fill="#F7A9C8" />
        <Circle cx={240} cy={88} r={62} stroke="#fff" strokeWidth={10} fill="none" opacity={0.35} />
        <Path d="M240 26 A62 62 0 0 1 300 100" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <Circle key={i} cx={240 + Math.cos(a) * 62} cy={88 + Math.sin(a) * 62} r={3} fill="#fff" opacity={0.8} />;
        })}
      </Svg>
      <View style={styles.artText}>
        <Text style={styles.artTitle}>Cycle{'\n'}tracker</Text>
        <Text style={styles.artTag}>GENTLE • PRIVATE</Text>
      </View>
      <View style={{ position: 'absolute', right: 40, top: 44 }}>
        <Bob amp={4} ms={1500}>
          <FrogAvatar id="tilly" size={80} />
        </Bob>
      </View>
    </View>
  );
}

const APPS = [
  { id: 'breathe', name: 'Lily Breathe', blurb: 'A calm breathing widget for your Home Screen. Breathe along with a sleepy frog.', art: <BreatheArt />, color: '#3E9FE0' },
  { id: 'cycle', name: 'Lily Cycle', blurb: 'A friendly cycle tracker that keeps everything on your phone.', art: <CycleArt />, color: '#E5527A' },
];

export function OtherAppsScreen() {
  const nav = useNav();
  return (
    <Screen testID="otherApps">
      <Animated.View entering={FadeInDown.springify()}>
        <Title>Apps by Lily creators</Title>
        <Subtitle>More cosy little apps from the same pond</Subtitle>
      </Animated.View>
      {APPS.map((a, i) => (
        <Animated.View key={a.id} entering={FadeInDown.delay(100 + i * 100).springify().damping(15)}>
          <Bounce onPress={() => nav.toast('Coming soon')} scaleTo={0.97} style={styles.card} testID={`app-${a.id}`}>
            {a.art}
            <View style={styles.info}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{a.name}</Text>
                <Text style={styles.blurb}>{a.blurb}</Text>
              </View>
              <View style={[styles.get, { backgroundColor: `${a.color}1F` }]}>
                <Text style={[styles.getText, { color: a.color }]}>SOON</Text>
              </View>
            </View>
          </Bounce>
        </Animated.View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, backgroundColor: '#F7F8FA', overflow: 'hidden', marginBottom: 16 },
  art: { height: 170, overflow: 'hidden' },
  artText: { position: 'absolute', left: 20, top: 26 },
  artTitle: { fontFamily: fonts.black, fontSize: 30, color: '#fff', lineHeight: 32 },
  artTag: { fontFamily: fonts.black, fontSize: 11, color: '#fff', letterSpacing: 1, marginTop: 10, opacity: 0.85 },
  info: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  name: { fontFamily: fonts.extra, fontSize: 18, color: colors.ink },
  blurb: { fontFamily: fonts.semibold, fontSize: 14, color: colors.inkSoft, lineHeight: 19, marginTop: 2 },
  get: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 },
  getText: { fontFamily: fonts.black, fontSize: 12, letterSpacing: 0.8 },
});
