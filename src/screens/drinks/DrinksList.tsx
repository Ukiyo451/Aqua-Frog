import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { DrinkIcon } from '../../components/CupIcon';
import { Bounce, PillButton } from '../../components/Pressable';
import { PickerSheet, Screen, Title, Toggle, ui } from '../../components/ui';
import { WheelPicker } from '../../components/WheelPicker';
import { Drink } from '../../lib/drinks';
import { fromDisplay, toDisplay, Units } from '../../lib/hydration';
import { useStore } from '../../lib/store';
import { useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { HydrationArticle } from './Article';
import { formatPct, nearest, PencilIcon, sizeValues, SlidersIcon, UpDown } from './shared';

interface RowProps {
  drink: Drink;
  units: Units;
  enabled: boolean;
  index: number;
  onSize: (d: Drink) => void;
  onEdit: (d: Drink) => void;
  onToggle: (id: string, on: boolean) => void;
}

const DrinkRow = memo(function DrinkRow({ drink, units, enabled, index, onSize, onEdit, onToggle }: RowProps) {
  const isWater = drink.id === 'water';
  return (
    <Animated.View
      entering={
        index < 14
          ? FadeInDown.delay(160 + index * 35)
              .springify()
              .damping(18)
          : undefined
      }
    >
      <Pressable
        onPress={() => (drink.custom ? onEdit(drink) : onSize(drink))}
        style={({ pressed }) => [styles.row, pressed && { backgroundColor: '#FAFBFC' }]}
        testID={`row-${drink.id}`}
      >
        <View style={styles.iconCol}>
          <DrinkIcon drink={drink} size={26} />
        </View>
        <View style={styles.nameCol}>
          <Text style={styles.name} numberOfLines={2}>
            {drink.label.toUpperCase()}
          </Text>
          {drink.caffeine > 0 ? <Text style={styles.caffeine}>{drink.caffeine}mg caffeine</Text> : null}
        </View>
        <View style={styles.sizeCol}>
          {drink.custom ? (
            <Bounce onPress={() => onEdit(drink)} style={styles.pencil} testID={`edit-${drink.id}`}>
              <PencilIcon />
            </Bounce>
          ) : (
            <Bounce onPress={() => onSize(drink)} testID={`size-${drink.id}`} scaleTo={0.88}>
              <UpDown>
                <Text style={styles.size}>
                  {toDisplay(drink.size, units)}
                  {units}
                </Text>
              </UpDown>
            </Bounce>
          )}
        </View>
        <Text style={styles.pct}>{formatPct(drink.hydration)}</Text>
        <View style={styles.toggleCol}>
          {isWater ? null : <Toggle value={enabled} onChange={(v) => onToggle(drink.id, v)} testID={`toggle-${drink.id}`} />}
        </View>
      </Pressable>
    </Animated.View>
  );
});

/** Add/Edit Drinks List: every drink with its size, hydration and a home-screen toggle. */
export function DrinksListScreen() {
  const nav = useNav();
  const { state, update, drink } = useStore();
  const units = state.units;
  const [sheet, setSheet] = useState<Drink | null>(null);
  const [draft, setDraft] = useState(0);
  const values = sizeValues(units);
  const enabled = new Set(state.drinks.enabled);

  const sizeOf = (d: Drink) => (d.id === 'water' ? (state.drinks.sizes.water ?? state.cupMl) : d.size);
  const openSize = (d: Drink) => {
    setDraft(nearest(values, toDisplay(sizeOf(d), units)));
    setSheet(d);
  };
  const saveSize = () => {
    if (!sheet) return;
    const ml = Math.round(fromDisplay(draft, units));
    update((s) => ({
      drinks: { ...s.drinks, sizes: { ...s.drinks.sizes, [sheet.id]: ml } },
      // water's size is the cup the home screen pours
      ...(sheet.id === 'water' ? { cupMl: ml } : null),
    }));
    setSheet(null);
  };
  const toggle = (id: string, on: boolean) =>
    update((s) => {
      const set = new Set(s.drinks.enabled);
      if (on) set.add(id);
      else set.delete(id);
      set.add('water');
      return {
        drinks: {
          ...s.drinks,
          enabled: s.drinks.order.filter((x) => set.has(x)),
        },
      };
    });
  const edit = (d: Drink) => nav.push('drinkEdit', { id: d.id });

  return (
    <View style={{ flex: 1 }}>
      <Screen testID="drinks">
        <Animated.View entering={FadeInDown.springify().damping(18)}>
          <Title>Add/Edit Drinks List</Title>
        </Animated.View>
        <Animated.View entering={ZoomIn.delay(60).springify().damping(13)}>
          <PillButton
            label="+ CREATE NEW DRINK"
            variant="water"
            onPress={() => nav.push('drinkEdit')}
            style={styles.create}
            textStyle={styles.createText}
            testID="create-drink"
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(100).springify().damping(18)}>
          <Text style={styles.explain}>Switch on the drinks you want on your home screen. Tap a drink to change the size of its cup or glass.</Text>
          <Bounce onPress={() => nav.push('drinkOrder')} style={styles.order} testID="change-order">
            <Text style={styles.orderText}>CHANGE ORDER</Text>
            <SlidersIcon />
          </Bounce>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).springify().damping(18)} style={[styles.row, styles.headRow]}>
          <Text style={[styles.head, { flex: 1 }]}>DRINK</Text>
          <Text style={[styles.head, styles.sizeCol]}>SIZE</Text>
          <Text style={[styles.head, styles.headPct]}>HYDRATION</Text>
        </Animated.View>
        {state.drinks.order.map((id, i) => {
          const found = drink(id);
          if (found.id !== id) return null;
          const d = id === 'water' ? { ...found, size: sizeOf(found) } : found;
          return (
            <DrinkRow
              key={id}
              drink={d}
              units={units}
              enabled={id === 'water' || enabled.has(id)}
              index={i}
              onSize={openSize}
              onEdit={edit}
              onToggle={toggle}
            />
          );
        })}

        <View style={{ height: 24 }} />
        <HydrationArticle delay={500} />
      </Screen>

      <PickerSheet visible={!!sheet} title="Size" eyebrow={sheet?.label.toUpperCase()} onClose={() => setSheet(null)} onDone={saveSize}>
        {sheet && <WheelPicker values={values} value={draft} onChange={setDraft} format={(v) => `${v}${units}`} width={200} testID="wheel-size" />}
      </PickerSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  create: {
    alignSelf: 'center',
    marginTop: 18,
    paddingVertical: 20,
    paddingHorizontal: 40,
    shadowOpacity: 0,
  },
  createText: { fontFamily: fonts.black, fontSize: 18, letterSpacing: 0.4 },
  explain: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 22,
    marginHorizontal: 10,
  },
  order: {
    ...ui.softButton,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 16,
    marginBottom: 20,
  },
  orderText: {
    fontFamily: fonts.black,
    fontSize: 12,
    letterSpacing: 0.6,
    color: colors.water,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E6EA',
  },
  headRow: { minHeight: 30, paddingVertical: 6 },
  head: {
    fontFamily: fonts.black,
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#B3B9C3',
  },
  headPct: { width: 116, paddingLeft: 6 },
  iconCol: { width: 34, alignItems: 'flex-start' },
  nameCol: { flex: 1, paddingRight: 6 },
  name: {
    fontFamily: fonts.black,
    fontSize: 14,
    letterSpacing: 0.3,
    color: colors.ink,
  },
  caffeine: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.muted,
    marginTop: 1,
  },
  sizeCol: { width: 60, alignItems: 'center', textAlign: 'center' },
  size: { fontFamily: fonts.black, fontSize: 15, color: colors.water },
  pencil: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.waterLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pct: {
    width: 62,
    paddingLeft: 6,
    fontFamily: fonts.black,
    fontSize: 14,
    color: '#9AA1AD',
  },
  toggleCol: { width: 54, alignItems: 'flex-end' },
});
