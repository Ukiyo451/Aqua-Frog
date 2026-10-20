import { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, type ScrollViewInstance, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CUP_SHAPES, CupIcon } from '../../components/CupIcon';
import { Bounce, PillButton } from '../../components/Pressable';
import { Dialog, ListRow, PickerSheet } from '../../components/ui';
import { WheelPicker } from '../../components/WheelPicker';
import { CupShape, Drink, DRINK_COLORS, glassFor } from '../../lib/drinks';
import { formatAmount, fromDisplay, toDisplay } from '../../lib/hydration';
import { useStore } from '../../lib/store';
import { ScreenProps, useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { CAFFEINE_VALUES, CancelDoneBar, CheckBadge, formatCaffeine, HYDRATION_VALUES, nearest, PINK, sizeValues } from './shared';

const SHAPE_ORDER: CupShape[] = ['glass', 'mug', 'takeaway', 'tall', 'jar', 'bottle', 'can', 'cup', 'wine', 'martini', 'shot', 'bowl'];
const GREY = '#D9DCE1';
const SCREEN_W = Dimensions.get('window').width;
const SHAPE_W = 82;
const COLOR_W = 70;

/** Scroll offset that centres item `i` of a row whose items are `w` wide (plus the row's left padding). */
const centred = (i: number, w: number, pad: number) => Math.max(0, pad + i * w + w / 2 - SCREEN_W / 2);
const GREY_GLASS = '#ECEEF1';

function ShapeChoice({ shape, color, selected, onPress }: { shape: CupShape; color: string; selected: boolean; onPress: () => void }) {
  const t = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    t.value = withSpring(selected ? 1 : 0, { damping: 11, stiffness: 200 });
  }, [selected, t]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: -t.value * 8 }, { scale: 1 + t.value * 0.08 }] }));
  return (
    <Bounce onPress={onPress} style={styles.shape} testID={`shape-${shape}`}>
      <Animated.View style={style}>
        <CupIcon shape={shape} color={selected ? color : GREY} glass={selected ? glassFor(color) : GREY_GLASS} size={62} />
      </Animated.View>
      <View style={styles.shapeCheck}>{selected && <Animated.View entering={ZoomIn.springify().damping(11)}><CheckBadge /></Animated.View>}</View>
    </Bounce>
  );
}

function ColorChoice({ color, selected, index, onPress }: { color: string; selected: boolean; index: number; onPress: () => void }) {
  const t = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    t.value = withSpring(selected ? 1 : 0, { damping: 12, stiffness: 220 });
  }, [selected, t]);
  const halo = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ scale: 0.6 + t.value * 0.4 }] }));
  return (
    <Bounce onPress={onPress} style={styles.colorWrap} testID={`color-${index}`}>
      <Animated.View style={[styles.halo, { backgroundColor: `${color}33` }, halo]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.colorCheck}>{selected && <Animated.View entering={ZoomIn.springify().damping(11)}><CheckBadge size={18} /></Animated.View>}</View>
    </Bounce>
  );
}

type Sheet = 'size' | 'hydration' | 'caffeine' | null;

/** Create a custom drink, or edit / delete one made earlier. */
export function DrinkEditScreen({ params }: ScreenProps<{ id?: string }>) {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state, update } = useStore();
  const units = state.units;
  const existing = params?.id ? state.drinks.custom.find((d) => d.id === params.id) : undefined;

  const [name, setName] = useState(existing?.label ?? 'My Drink');
  const [size, setSize] = useState(existing?.size ?? 250);
  const [hydration, setHydration] = useState(Math.round((existing?.hydration ?? 1) * 100));
  const [caffeine, setCaffeine] = useState(existing?.caffeine ?? 0);
  const [shape, setShape] = useState<CupShape>(existing?.shape ?? 'glass');
  const [color, setColor] = useState(existing?.color ?? DRINK_COLORS[0]);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [draft, setDraft] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const sizes = sizeValues(units);
  const shapeRow = useRef<ScrollViewInstance>(null);
  const colorRow = useRef<ScrollViewInstance>(null);

  // an edited drink opens with its cup and colour scrolled into view
  useEffect(() => {
    const t = setTimeout(() => {
      shapeRow.current?.scrollTo({ x: centred(SHAPE_ORDER.indexOf(shape), SHAPE_W, 12), animated: true });
      colorRow.current?.scrollTo({ x: centred(Math.max(0, DRINK_COLORS.indexOf(color)), COLOR_W, 14), animated: true });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = (s: Exclude<Sheet, null>) => {
    if (s === 'size') setDraft(nearest(sizes, toDisplay(size, units)));
    if (s === 'hydration') setDraft(nearest(HYDRATION_VALUES, hydration));
    if (s === 'caffeine') setDraft(nearest(CAFFEINE_VALUES, caffeine));
    setSheet(s);
  };
  const commit = () => {
    if (sheet === 'size') setSize(Math.round(fromDisplay(draft, units)));
    if (sheet === 'hydration') setHydration(draft);
    if (sheet === 'caffeine') setCaffeine(draft);
    setSheet(null);
  };

  const save = () => {
    const label = name.trim() || 'My Drink';
    const base = { label, color, glass: glassFor(color), shape, hydration: hydration / 100, caffeine, size, custom: true };
    if (existing) {
      const next: Drink = { ...existing, ...base };
      update((s) => {
        const { [existing.id]: _drop, ...sizesLeft } = s.drinks.sizes;
        return { drinks: { ...s.drinks, sizes: sizesLeft, custom: s.drinks.custom.map((d) => (d.id === existing.id ? next : d)) } };
      });
    } else {
      const drink: Drink = { id: `custom-${Date.now()}`, ...base };
      update((s) => {
        const order = [...s.drinks.order];
        order.splice(order.indexOf('water') + 1, 0, drink.id);
        const on = new Set([...s.drinks.enabled, drink.id]);
        return { drinks: { ...s.drinks, custom: [...s.drinks.custom, drink], order, enabled: order.filter((id) => on.has(id)) } };
      });
    }
    nav.back();
  };

  const remove = () => {
    if (!existing) return;
    const id = existing.id;
    update((s) => {
      const { [id]: _drop, ...sizesLeft } = s.drinks.sizes;
      return {
        drinks: {
          ...s.drinks,
          custom: s.drinks.custom.filter((d) => d.id !== id),
          order: s.drinks.order.filter((x) => x !== id),
          enabled: s.drinks.enabled.filter((x) => x !== id),
          sizes: sizesLeft,
        },
      };
    });
    nav.back();
  };

  const rows = [
    { key: 'size' as const, label: 'SIZE', value: formatAmount(size, units) },
    { key: 'hydration' as const, label: 'HYDRATION', value: `${hydration}%` },
    { key: 'caffeine' as const, label: 'CAFFEINE', value: formatCaffeine(caffeine) },
  ];

  return (
    <View style={styles.root} testID="drink-edit">
      <CancelDoneBar onCancel={nav.back} onDone={save} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.springify().damping(18)}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name your drink"
            placeholderTextColor="#C5CAD2"
            style={styles.name}
            maxLength={28}
            selectTextOnFocus
            returnKeyType="done"
            testID="edit-name"
          />
        </Animated.View>
        <View style={styles.rows}>
          {rows.map((r, i) => (
            <Animated.View key={r.key} entering={FadeInDown.delay(60 + i * 50).springify().damping(18)}>
              <ListRow look="line" label={r.label} value={r.value} onPress={() => open(r.key)} testID={`edit-${r.key}`} />
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(220).springify().damping(18)}>
          <ScrollView ref={shapeRow} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {SHAPE_ORDER.map((s) => (
              <ShapeChoice key={s} shape={s} color={color} selected={s === shape} onPress={() => setShape(s)} />
            ))}
          </ScrollView>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(280).springify().damping(18)}>
          <ScrollView ref={colorRow} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colors}>
            {DRINK_COLORS.map((c, i) => (
              <ColorChoice key={c} color={c} index={i} selected={c === color} onPress={() => setColor(c)} />
            ))}
          </ScrollView>
        </Animated.View>

        {existing && (
          <Animated.View entering={FadeInDown.delay(340).springify().damping(18)}>
            <PillButton label="DELETE DRINK" onPress={() => setConfirm(true)} style={styles.delete} textStyle={styles.deleteText} testID="delete-drink" />
          </Animated.View>
        )}
      </ScrollView>

      <PickerSheet
        visible={sheet !== null}
        title={sheet === 'size' ? 'Size' : sheet === 'hydration' ? 'Hydration' : 'Caffeine'}
        onClose={() => setSheet(null)}
        onDone={commit}
      >
        {sheet === 'size' && <WheelPicker values={sizes} value={draft} onChange={setDraft} format={(v) => `${v}${units}`} width={200} testID="wheel-size" />}
        {sheet === 'hydration' && <WheelPicker values={HYDRATION_VALUES} value={draft} onChange={setDraft} format={(v) => `${v}%`} width={200} testID="wheel-hydration" />}
        {sheet === 'caffeine' && <WheelPicker values={CAFFEINE_VALUES} value={draft} onChange={setDraft} format={formatCaffeine} width={200} testID="wheel-caffeine" />}
      </PickerSheet>

      <Dialog
        visible={confirm}
        title="Are you sure?"
        message="Delete your custom drink? This action can't be reversed."
        onClose={() => setConfirm(false)}
        actions={[
          { label: 'Cancel', style: 'cancel' },
          { label: 'Delete', style: 'destructive', onPress: remove },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  name: {
    fontFamily: fonts.extra,
    fontSize: 30,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 22,
    marginBottom: 18,
    marginHorizontal: 20,
    paddingVertical: 6,
    outlineStyle: 'none',
  } as object,
  rows: { marginHorizontal: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E4E6EA' },
  carousel: { paddingHorizontal: 12, paddingTop: 34, paddingBottom: 8 },
  shape: { width: SHAPE_W, alignItems: 'center' },
  shapeCheck: { height: 22, marginTop: -12, alignItems: 'center', justifyContent: 'center' },
  colors: { paddingHorizontal: 14, paddingTop: 18 },
  colorWrap: { width: COLOR_W, height: 74, alignItems: 'center', paddingTop: 4 },
  halo: { position: 'absolute', top: 0, width: 56, height: 56, borderRadius: 28 },
  dot: { width: 36, height: 36, borderRadius: 18, marginTop: 6 },
  colorCheck: { height: 20, marginTop: -2, alignItems: 'center', justifyContent: 'center' },
  delete: { alignSelf: 'center', marginTop: 40, backgroundColor: '#FBE4EF', shadowOpacity: 0, paddingVertical: 15, paddingHorizontal: 34 },
  deleteText: { color: PINK, fontFamily: fonts.black, fontSize: 15, letterSpacing: 0.6 },
});
