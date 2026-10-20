import { useEffect, useRef, useState } from 'react';
import { ScrollView, ScrollViewInstance, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown, FadeOut, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FrogAvatar } from '../../components/Frogs';
import { Bounce } from '../../components/Pressable';
import { CloseButton } from '../../components/ui';
import { PulseRing } from '../../components/effects';
import { challengeById } from '../../lib/challenges';
import { CHARACTER_BY_ID, CHARACTERS } from '../../lib/characters';
import { useStore } from '../../lib/store';
import { useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { CheckBadge, Cell, Grid, HeroRibbon, isCollected, SECTIONS, SectionHead, SmallCheck, SparkleBurst, Token, useGrid } from './common';

/** The frog collection: hero, the collect button, and the daily / challenge / supporter grids. */
export function Characters() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state, update } = useStore();
  const ch = state.character;
  const g = useGrid();
  const scroll = useRef<ScrollViewInstance>(null);
  const dailyY = useRef(0);
  const [burst, setBurst] = useState<{ id: string; n: number } | null>(null);
  const busy = useRef(false);
  const current = CHARACTER_BY_ID[ch.current] ?? CHARACTER_BY_ID.lily;
  const total = CHARACTERS.length;
  const collectedCount = CHARACTERS.filter((c) => isCollected(state, c.id)).length;
  const has = (id: string) => isCollected(state, id);

  const choose = (id: string) => {
    if (id === ch.current) return;
    update((s) => ({ character: { ...s.character, current: id } }));
    nav.toast(`${CHARACTER_BY_ID[id].name} is your frog now`);
  };

  const collect = () => {
    if (ch.tokens <= 0 || busy.current) return;
    const locked = SECTIONS.daily.filter((c) => !has(c.id));
    if (!locked.length) {
      nav.toast('You have every daily frog!');
      return;
    }
    busy.current = true;
    const pick = locked[Math.floor(Math.random() * locked.length)];
    const idx = SECTIONS.daily.indexOf(pick);
    const row = Math.floor(idx / 5);
    scroll.current?.scrollTo({ y: Math.max(0, dailyY.current + 70 + row * (g.h + g.gap) - 260), animated: true });
    setTimeout(() => {
      update((s) => ({
        character: {
          ...s.character,
          tokens: Math.max(0, s.character.tokens - 1),
          collected: s.character.collected.includes(pick.id) ? s.character.collected : [...s.character.collected, pick.id],
          current: pick.id,
        },
      }));
      setBurst({ id: pick.id, n: Date.now() });
    }, 450);
    setTimeout(() => {
      busy.current = false;
      setBurst(null);
      nav.push('characterReveal', { id: pick.id });
    }, 1700);
  };

  const tapLocked = (id: string) => {
    const c = CHARACTER_BY_ID[id];
    if (c.section === 'supporter') nav.push('donate');
    else if (c.section === 'challenge') {
      if (c.challengeId && challengeById(c.challengeId)) nav.push('challenge', { id: c.challengeId });
      else nav.toast('Finish its challenge to collect this frog');
    } else nav.toast(ch.tokens > 0 ? 'Tap Collect Character to meet a new frog' : 'Finish your goal to collect a new frog tomorrow');
  };

  const grid = (list: typeof SECTIONS.daily) => (
    <Grid>
      {list.map((c, i) => {
        const on = has(c.id);
        return (
          <View key={c.id} style={burst?.id === c.id ? styles.lifted : undefined}>
            <Cell
              c={c}
              index={i}
              collected={on}
              highlight={burst?.id === c.id}
              onPress={() => (on ? choose(c.id) : tapLocked(c.id))}
              overlay={c.id === ch.current && burst?.id !== c.id ? <CheckBadge /> : null}
              testID={`frog-${c.id}`}
            />
            {burst?.id === c.id && <SparkleBurst key={burst.n} />}
          </View>
        );
      })}
    </Grid>
  );

  const count = (list: typeof SECTIONS.daily) => list.filter((c) => has(c.id)).length;

  return (
    <View style={styles.page}>
      <ScrollView ref={scroll} contentContainerStyle={{ paddingTop: insets.top + 64, paddingBottom: insets.bottom + 48, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(380)} style={styles.hero}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: current.palette.belly }]}>
              <Animated.View key={current.id} entering={ZoomIn.springify().damping(10)} style={styles.avatarFrog}>
                <FrogAvatar id={current.id} size={128} />
              </Animated.View>
            </View>
            <View style={styles.ribbonPos}>
              <HeroRibbon />
            </View>
          </View>
          <View style={styles.heroText}>
            <Animated.Text key={current.id} entering={FadeIn.duration(300)} exiting={FadeOut.duration(150)} style={styles.name} numberOfLines={1}>
              {current.name}
            </Animated.Text>
            <Text style={styles.heroSub}>Finish your hydration goal. Collect a new frog the following day!</Text>
            <Text style={styles.collected}>
              {collectedCount} of {total} collected
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(380)}>
          <CollectButton tokens={ch.tokens} onPress={collect} />
        </Animated.View>

        <View onLayout={(e) => (dailyY.current = e.nativeEvent.layout.y)}>
          <SectionHead title="Daily" count={count(SECTIONS.daily)} total={SECTIONS.daily.length} />
          {grid(SECTIONS.daily)}
        </View>

        <SectionHead
          title="Challenges"
          dark
          count={count(SECTIONS.challenge)}
          total={SECTIONS.challenge.length}
          sub="Collect a challenge frog when you start & finish the whole challenge!"
        />
        {grid(SECTIONS.challenge)}

        <SectionHead title="Supporter" count={count(SECTIONS.supporter)} total={SECTIONS.supporter.length} sub="Become a Supporter! Unlock unique frogs as a thank-you." />
        {grid(SECTIONS.supporter)}
      </ScrollView>

      <View style={[styles.bar, { top: insets.top + 8 }]} pointerEvents="box-none">
        <Bounce onPress={() => nav.modal('shuffle')} testID="shuffle" style={[styles.shuffle, ch.shuffleOn && styles.shuffleOn]}>
          {ch.shuffleOn && (
            <Animated.View entering={ZoomIn.springify()} style={{ marginRight: 4 }}>
              <SmallCheck color={colors.water} />
            </Animated.View>
          )}
          <Text style={[styles.shuffleText, ch.shuffleOn && { color: colors.water }]}>SHUFFLE</Text>
        </Bounce>
        <CloseButton />
      </View>
    </View>
  );
}

function CollectButton({ tokens, onPress }: { tokens: number; onPress: () => void }) {
  const on = tokens > 0;
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (!on) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(withSequence(withTiming(1.12, { duration: 520, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 620, easing: Easing.inOut(Easing.quad) })), -1);
  }, [on, pulse]);
  const badge = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  return (
    <View style={[styles.collectRing, on && styles.collectRingOn]}>
      <Bounce onPress={onPress} disabled={!on} testID="collect" style={[styles.collect, on ? styles.collectOn : styles.collectOff]}>
        <View style={styles.tokenSlot}>
          {on && <PulseRing size={30} color="rgba(255,255,255,0.8)" />}
          <Animated.View style={badge}>
            <Token count={tokens} active={on} />
          </Animated.View>
        </View>
        <Text style={[styles.collectText, { color: on ? '#fff' : '#D2D6DC' }]}>COLLECT CHARACTER</Text>
      </Bounce>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  lifted: { zIndex: 5 },
  bar: { position: 'absolute', left: 14, right: 14, height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shuffle: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F3F5', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  shuffleOn: { backgroundColor: colors.waterLight },
  shuffleText: { fontFamily: fonts.black, fontSize: 11, letterSpacing: 0.8, color: colors.muted },
  hero: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 136, height: 146, alignItems: 'center' },
  avatar: { width: 132, height: 132, borderRadius: 66, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  avatarFrog: { marginBottom: 6 },
  ribbonPos: { position: 'absolute', bottom: 2, left: 4 },
  heroText: { flex: 1, marginLeft: 14 },
  name: { fontFamily: fonts.extra, fontSize: 23, color: colors.ink, marginBottom: 4 },
  heroSub: { fontFamily: fonts.semibold, fontSize: 15, color: colors.inkSoft, lineHeight: 21 },
  collected: { fontFamily: fonts.extra, fontSize: 14, color: colors.water, marginTop: 8 },
  collectRing: { marginTop: 18, borderRadius: 999, padding: 5, backgroundColor: '#F4F5F7' },
  collectRingOn: { backgroundColor: colors.waterLight },
  collect: { borderRadius: 999, height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  collectOn: { backgroundColor: colors.water, shadowColor: colors.water, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  collectOff: { backgroundColor: '#F7F8FA', borderWidth: 2, borderColor: '#ECEEF1' },
  tokenSlot: { width: 34, height: 30, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  collectText: { fontFamily: fonts.black, fontSize: 19, letterSpacing: 0.4 },
});
