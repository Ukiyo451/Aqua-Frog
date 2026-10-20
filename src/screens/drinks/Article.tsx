import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Paragraph, Screen } from '../../components/ui';
import { CATALOG_BY_ID } from '../../lib/drinks';
import { formatAmount, Units } from '../../lib/hydration';
import { useStore } from '../../lib/store';
import { colors, fonts } from '../../theme';
import { BeanTileIcon, DropTileIcon, formatPct, WineTileIcon } from './shared';

function Heading({ icon, tint, children }: { icon: ReactNode; tint: string; children: string }) {
  return (
    <View style={styles.heading}>
      <View style={[styles.tile, { backgroundColor: tint }]}>{icon}</View>
      <Text style={styles.headingText}>{children}</Text>
    </View>
  );
}

/** "300ml of tea counts as 270ml", computed from the catalog. */
function example(id: string, ml: number, units: Units) {
  const d = CATALOG_BY_ID[id];
  const counted = Math.round(ml * Math.abs(d.hydration));
  return { name: d.label.toLowerCase(), pct: formatPct(d.hydration), poured: formatAmount(ml, units), counted: formatAmount(counted, units), caffeine: d.caffeine };
}

/** The "Hydration in different drinks" explainer under the drinks list. */
export function HydrationArticle({ delay = 0 }: { delay?: number }) {
  const { state } = useStore();
  const u = state.units;
  const tea = example('tea', 300, u);
  const milk = example('milk', 300, u);
  const coffee = example('coffee', 250, u);
  const wine = example('wine', 300, u);
  const liquor = example('liquor', 50, u);
  const blackTea = CATALOG_BY_ID.blackTea;
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(18)} testID="hydration-article">
      <Heading icon={<DropTileIcon />} tint={colors.waterLight}>
        Hydration in different drinks
      </Heading>
      <Paragraph>
        Not every drink hydrates you the same way. Lily counts each drink by its hydration ratio: the share of what you pour that your body actually
        keeps, based on published research on fluids.
      </Paragraph>
      <Paragraph>A few examples:</Paragraph>
      <Paragraph>
        Green tea has a {tea.pct} ratio, so a {tea.poured} cup adds {tea.counted} to your day. Coffee sits at {coffee.pct}: {coffee.poured} counts as{' '}
        {coffee.counted}.
      </Paragraph>
      <Paragraph>
        Milk goes past water at {milk.pct}. Its bit of fat, natural sugar, protein and sodium slows how fast it leaves your body, and the sodium helps you hold
        on to the fluid, so {milk.poured} of milk counts as {milk.counted}.
      </Paragraph>

      <Heading icon={<WineTileIcon />} tint="#FBE3E9">
        How alcohol affects your hydration
      </Heading>
      <Paragraph>The short version: alcohol makes your body let go of water faster than you take it in.</Paragraph>
      <Paragraph>
        Alcohol is a diuretic. It turns down vasopressin, the hormone that tells your kidneys to save water, so more of it heads straight out. That is why
        alcoholic drinks have negative ratios in Lily and lower your total instead of raising it.
      </Paragraph>
      <Paragraph>
        Red wine is {wine.pct}: a {wine.poured} glass takes {wine.counted} off your day. Strong liquor is {liquor.pct}, so even a {liquor.poured} shot costs{' '}
        {liquor.counted}. A glass of water alongside each drink keeps Lily happy.
      </Paragraph>

      <Heading icon={<BeanTileIcon />} tint="#F3E9E3">
        Caffeine
      </Heading>
      <Paragraph>
        Caffeine is shown in milligrams per {formatAmount(250, u)} serving, and Lily adds it up for every drink you log.
      </Paragraph>
      <Paragraph>
        For example, black tea has {blackTea.caffeine}mg of caffeine in every {formatAmount(250, u)}, and coffee has {coffee.caffeine}mg. Most adults are advised
        to stay under about 400mg a day.
      </Paragraph>
    </Animated.View>
  );
}

/** The article on its own page. */
export function HydrationInfoScreen() {
  return (
    <Screen testID="hydration-info">
      <HydrationArticle />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', marginTop: 26, marginBottom: 14, gap: 14 },
  tile: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headingText: { flex: 1, fontFamily: fonts.extra, fontSize: 28, lineHeight: 32, color: colors.ink },
});
