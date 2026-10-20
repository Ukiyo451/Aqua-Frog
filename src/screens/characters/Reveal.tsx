import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Confetti } from '../../components/effects';
import { Frog } from '../../components/Frogs';
import { LogoMark } from '../../components/Logo';
import { PillButton } from '../../components/Pressable';
import { Screen, ui, useShare } from '../../components/ui';
import { CHARACTER_BY_ID } from '../../lib/characters';
import { useStore } from '../../lib/store';
import { ScreenProps, useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';

/** "WaterHank" for "Hoppy Hank"; single-name frogs become "WaterFrog". */
function waterName(name: string) {
  const words = name.split(' ');
  return words.length > 1 ? words[words.length - 1] : 'Frog';
}

/** The new-frog poster: two-tone name, the frog bouncing in under confetti, its bio. */
export function CharacterReveal({ params }: ScreenProps<{ id: string }>) {
  const nav = useNav();
  const share = useShare();
  const { state, update } = useStore();
  const c = CHARACTER_BY_ID[params?.id] ?? CHARACTER_BY_ID.lily;
  const isCurrent = state.character.current === c.id;

  const drop = useSharedValue(0);
  const squash = useSharedValue(1);
  useEffect(() => {
    drop.value = withDelay(150, withTiming(1, { duration: 520, easing: Easing.in(Easing.quad) }));
    squash.value = withDelay(
      670,
      withSequence(withTiming(0.78, { duration: 110 }), withSpring(1, { damping: 5, stiffness: 240 })),
    );
  }, [drop, squash]);
  const frogStyle = useAnimatedStyle(() => ({
    opacity: drop.value > 0 ? 1 : 0,
    transform: [{ translateY: (drop.value - 1) * 420 }, { scaleY: squash.value }, { scaleX: 2 - squash.value }],
    transformOrigin: 'bottom',
  }));

  return (
    <Screen chrome="none" contentStyle={styles.content}>
      <Animated.View entering={FadeInDown.springify().damping(14)}>
        <Text style={styles.title}>
          <Text style={{ color: colors.water }}>Water</Text>
          <Text style={{ color: colors.purple }}>{waterName(c.name)}</Text>
        </Text>
        <Text style={[styles.title, styles.name]}>{c.name}</Text>
      </Animated.View>

      <Animated.View style={[styles.frog, frogStyle]}>
        <Frog id={c.id} width={230} />
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(800)} style={styles.bio}>
        {c.bio}
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(950)} style={styles.card}>
        <View style={styles.logo}>
          <View style={styles.logoScale}>
            <LogoMark />
          </View>
        </View>
        <View>
          <Text style={styles.cardTitle}>Lily</Text>
          <Text style={styles.cardSub}>Stay hydrated & happy!</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(1100)} style={styles.buttons}>
        {!isCurrent && (
          <PillButton
            label="SET AS MY FROG"
            testID="reveal-set"
            style={styles.btn}
            onPress={() => {
              update((s) => ({ character: { ...s.character, current: c.id } }));
              nav.toast(`${c.name} is your frog now`);
            }}
          />
        )}
        <PillButton
          label="SHARE"
          variant="water"
          testID="reveal-share"
          style={styles.btn}
          onPress={() => share(`I just collected ${c.name}, a new frog friend in Lily! ${c.bio}`)}
        />
        <PillButton label="DONE" testID="reveal-done" style={[styles.btn, ui.softButton]} textStyle={ui.softButtonText} onPress={nav.back} />
      </Animated.View>
      <Confetti count={50} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingTop: 70 },
  title: { fontFamily: fonts.black, fontSize: 44, lineHeight: 50, textAlign: 'center' },
  name: { color: colors.purple, marginTop: -2 },
  frog: { marginTop: 18, height: 272, justifyContent: 'flex-end' },
  bio: { fontFamily: fonts.bold, fontSize: 16, color: colors.inkSoft, textAlign: 'center', lineHeight: 23, marginTop: 14, paddingHorizontal: 20 },
  card: { flexDirection: 'row', alignItems: 'center', marginTop: 22, alignSelf: 'center' },
  logo: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F7F8FA', marginRight: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  logoScale: { width: 120, height: 120, transform: [{ scale: 0.38 }], marginTop: 6 },
  cardTitle: { fontFamily: fonts.black, fontSize: 17, color: colors.ink },
  cardSub: { fontFamily: fonts.extra, fontSize: 16, color: colors.water },
  buttons: { alignSelf: 'stretch', alignItems: 'center', gap: 12, marginTop: 26 },
  btn: { width: 260 },
});
