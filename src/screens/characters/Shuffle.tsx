import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { Bounce } from '../../components/Pressable';
import { HeaderPill, Screen } from '../../components/ui';
import { Character, CHARACTERS } from '../../lib/characters';
import { useStore } from '../../lib/store';
import { useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { Cell, CheckBadge, Grid, isCollected, SECTIONS } from './common';

/** Pick which collected frogs take turns as the hero, one at random each day. */
export function Shuffle() {
  const nav = useNav();
  const { state, update } = useStore();
  const owned = CHARACTERS.filter((c) => isCollected(state, c.id)).map((c) => c.id);
  const [sel, setSel] = useState<string[]>(() => {
    const saved = state.character.shuffle.filter((id) => owned.includes(id));
    return state.character.shuffleOn && saved.length ? saved : owned;
  });
  const all = sel.length === owned.length;

  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const done = () => {
    update((s) => ({ character: { ...s.character, shuffle: sel, shuffleOn: sel.length > 0 } }));
    nav.toast(sel.length ? `Shuffling ${sel.length} frog${sel.length === 1 ? '' : 's'}, a new one each day` : 'Shuffle is off');
    nav.back();
  };

  const section = (title: string, list: Character[], color: string) => (
    <View>
      <Text style={[styles.section, { color }]}>{title}</Text>
      <Grid>
        {list.map((c, i) => {
          const on = owned.includes(c.id);
          return (
            <Cell
              key={c.id}
              c={c}
              index={i}
              collected={on}
              dim={on && !sel.includes(c.id)}
              onPress={on ? () => toggle(c.id) : undefined}
              overlay={on && sel.includes(c.id) ? <CheckBadge color={colors.ink} /> : null}
              testID={`pick-${c.id}`}
            />
          );
        })}
      </Grid>
    </View>
  );

  return (
    <Screen chrome="none" right={<HeaderPill label="DONE" color="#fff" bg={colors.ink} onPress={done} testID="shuffle-done" />} contentStyle={{ paddingTop: 92 }}>
      <Animated.View entering={FadeInDown.duration(380)}>
        <Text style={styles.title}>Select frogs that you want to shuffle</Text>
        <Animated.Text key={sel.length} entering={FadeIn.duration(200)} style={styles.count}>
          {sel.length} selected
        </Animated.Text>
        <Animated.View layout={LinearTransition}>
          <Bounce onPress={() => setSel(all ? [] : owned)} testID="select-all" style={styles.allBtn}>
            <Text style={styles.allText}>{all ? 'UNSELECT ALL' : 'SELECT ALL'}</Text>
          </Bounce>
        </Animated.View>
      </Animated.View>
      {section('Daily', SECTIONS.daily, colors.water)}
      {section('Challenges', SECTIONS.challenge, colors.ink)}
      {section('Supporter', SECTIONS.supporter, colors.water)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.extra, fontSize: 28, lineHeight: 34, color: colors.ink, textAlign: 'center', paddingHorizontal: 12 },
  count: { fontFamily: fonts.bold, fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 10 },
  allBtn: { alignSelf: 'center', marginTop: 18, backgroundColor: '#F2F3F5', borderRadius: 999, paddingVertical: 20, paddingHorizontal: 40, minWidth: 230, alignItems: 'center' },
  allText: { fontFamily: fonts.black, fontSize: 17, color: colors.ink, letterSpacing: 0.4 },
  section: { fontFamily: fonts.black, fontSize: 30, marginTop: 28, marginBottom: 12 },
});
