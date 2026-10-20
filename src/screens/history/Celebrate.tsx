import { useEffect } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Confetti } from '../../components/effects';
import { FrogAvatar } from '../../components/Frogs';
import { Bounce } from '../../components/Pressable';
import { Screen, useShare } from '../../components/ui';
import { formatAmount, toDisplay } from '../../lib/hydration';
import { dayTotal, goalFor, useStore } from '../../lib/store';
import { ScreenProps } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { DrinkGlyph } from './DrinkGlyph';
import { LayeredFrog } from './LayeredFrog';
import { dayAdjective, drinksUsed, goalDayTitle, topDrinkColor, weekdayOf } from './titles';

const SHARE = [
  { id: 'instagram', label: 'Instagram', color: '#B4479A' },
  { id: 'facebook', label: 'Facebook', color: '#3F5A9C' },
  { id: 'messages', label: 'Messages', color: '#4FCB62' },
  { id: 'more', label: 'More', color: '#A2AAB2' },
] as const;

function ShareGlyph({ id }: { id: (typeof SHARE)[number]['id'] }) {
  switch (id) {
    case 'instagram':
      return (
        <Svg width={22} height={22} viewBox="0 0 22 22">
          <Rect x={1} y={1} width={20} height={20} rx={6} fill="#fff" />
          <Circle cx={11} cy={11} r={5} fill="none" stroke="#B4479A" strokeWidth={2.2} />
          <Circle cx={16.4} cy={5.6} r={1.4} fill="#B4479A" />
        </Svg>
      );
    case 'facebook':
      return (
        <Svg width={22} height={22} viewBox="0 0 22 22">
          <Path d="M12.4 21 V12.6 H15.2 L15.7 9.3 H12.4 V7.3 C12.4 6.3 12.8 5.6 14.2 5.6 H15.8 V2.7 C15.4 2.6 14.4 2.5 13.3 2.5 C10.9 2.5 9.2 4 9.2 6.7 V9.3 H6.5 V12.6 H9.2 V21 Z" fill="#fff" />
        </Svg>
      );
    case 'messages':
      return (
        <Svg width={24} height={22} viewBox="0 0 24 22">
          <Path d="M12 2 C6.2 2 1.8 5.8 1.8 10.4 C1.8 13 3.2 15.3 5.4 16.8 L4.4 20.4 L8.6 18.3 C9.7 18.6 10.8 18.8 12 18.8 C17.8 18.8 22.2 15 22.2 10.4 C22.2 5.8 17.8 2 12 2 Z" fill="#fff" />
        </Svg>
      );
    default:
      return (
        <Svg width={22} height={22} viewBox="0 0 22 22">
          <Path d="M20 2 L2 9.5 L9.2 12.6 L12.4 20 Z" fill="#fff" />
          <Path d="M20 2 L9.2 12.6" stroke="#A2AAB2" strokeWidth={1.6} />
        </Svg>
      );
  }
}

/** The shareable "MY fresh TUESDAY" card with the layered frog. */
function Poster({ day, width }: { day: string; width: number }) {
  const { state, drink } = useStore();
  const entries = state.history[day] ?? [];
  const goal = goalFor(state, day);
  const total = dayTotal(entries);
  const color = topDrinkColor(entries, (id) => drink(id).color);
  const used = drinksUsed(entries).slice(0, 4);
  const big = width * 0.17;
  const pad = width * 0.07;
  return (
    <View style={[styles.poster, { width, padding: pad }]} testID="poster">
      <View style={styles.titleRow}>
        <Text style={[styles.titleMy, { fontSize: big, lineHeight: big * 1.02 }]}>MY</Text>
        <Text style={[styles.titleAdj, { fontSize: big * 0.72, lineHeight: big * 0.9, color }]}>{dayAdjective(day)}</Text>
      </View>
      <Text style={[styles.titleDay, { fontSize: big, lineHeight: big * 1.02 }]} numberOfLines={1} adjustsFontSizeToFit>
        {weekdayOf(day).toUpperCase()}
      </Text>
      <View style={styles.posterFrog}>
        <LayeredFrog width={width * 0.74} entries={entries} goalMl={goal} animate delay={500} />
      </View>
      <View style={styles.footer}>
        <FrogAvatar id={state.character.current} size={width * 0.2} />
        <View style={{ flex: 1, marginLeft: width * 0.03 }}>
          <View style={styles.footRow}>
            {used.map((id) => (
              <View key={id} style={{ marginRight: width * 0.004 }}>
                <DrinkGlyph id={id} size={width * 0.09} />
              </View>
            ))}
            <View style={{ marginLeft: 'auto', alignItems: 'flex-start' }}>
              <Text style={[styles.unit, { fontSize: width * 0.045 }]}>{state.units}</Text>
              <Text style={[styles.total, { fontSize: width * 0.085, lineHeight: width * 0.09 }]} testID="poster-total">
                {toDisplay(total, state.units)}
              </Text>
            </View>
          </View>
          <Text style={[styles.brand, { fontSize: width * 0.036 }]} numberOfLines={1}>
            Lily <Text style={{ color: colors.water }}>· Stay hydrated & happy!</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

export function CelebrateScreen({ params }: ScreenProps<{ day?: string }>) {
  const { state } = useStore();
  const share = useShare();
  const { width, height } = useWindowDimensions();
  const day = params.day ?? state.day;
  const entries = state.history[day] ?? [];
  const total = dayTotal(entries);
  const posterW = Math.min(width - 96, 300, (height - 420) * 0.62);

  const drop = useSharedValue(0);
  useEffect(() => {
    drop.value = withDelay(120, withSpring(1, { damping: 9, stiffness: 90, mass: 0.9 }));
  }, [drop]);
  const posterStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, drop.value * 2),
    transform: [{ translateY: (1 - drop.value) * -420 }, { rotate: `${(1 - drop.value) * -14}deg` }],
  }));

  const text = `${goalDayTitle(day)} I drank ${formatAmount(total, state.units)} with Lily the frog and hit ${Math.round(
    (total / goalFor(state, day)) * 100,
  )}% of my goal!`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen chrome="close" testID="celebrate">
        <Animated.View style={[styles.frame, posterStyle]}>
          <Poster day={day} width={posterW} />
        </Animated.View>
        <View style={styles.buttons}>
          {SHARE.map((s, i) => (
            <Animated.View key={s.id} entering={FadeInDown.delay(500 + i * 70).springify().damping(15)}>
              <Bounce onPress={() => share(text)} style={[styles.shareBtn, { backgroundColor: s.color }]} testID={`share-${s.id}`} scaleTo={0.95}>
                <ShareGlyph id={s.id} />
                <Text style={styles.shareText}>{s.label}</Text>
              </Bounce>
            </Animated.View>
          ))}
        </View>
      </Screen>
      <Confetti count={30} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignSelf: 'center', borderWidth: 6, borderColor: '#DADDE2', backgroundColor: '#fff', marginTop: 4 },
  poster: { backgroundColor: '#fff' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end' },
  titleMy: { fontFamily: fonts.black, color: colors.water },
  titleAdj: { fontFamily: fonts.black, marginLeft: 4, marginBottom: 2 },
  titleDay: { fontFamily: fonts.black, color: colors.water, marginTop: -4 },
  posterFrog: { alignItems: 'center', marginVertical: 8 },
  footer: { flexDirection: 'row', alignItems: 'center' },
  footRow: { flexDirection: 'row', alignItems: 'flex-end' },
  unit: { fontFamily: fonts.black, color: colors.water, marginBottom: -4 },
  total: { fontFamily: fonts.black, color: colors.water },
  brand: { fontFamily: fonts.black, color: colors.ink, marginTop: 4 },
  buttons: { gap: 12, marginTop: 28, paddingHorizontal: 26 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: 27 },
  shareText: { fontFamily: fonts.extra, fontSize: 18, color: '#fff' },
});
