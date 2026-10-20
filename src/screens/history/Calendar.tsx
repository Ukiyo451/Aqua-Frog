import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOutLeft, LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { AddSipOverlay } from '../../components/AddSipOverlay';
import { BottomSheet } from '../../components/BottomSheet';
import { Bounce, PillButton } from '../../components/Pressable';
import { Dialog, formatClock, formatDate, Screen, TimeWheels, ui } from '../../components/ui';
import { formatAmount } from '../../lib/hydration';
import { dayTotal, Entry, goalFor, useStore } from '../../lib/store';
import { ScreenProps, useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { CelebrateButton } from './CelebrateButton';
import { DrinkGlyph } from './DrinkGlyph';
import { HeroCircle } from './HeroCircle';
import { LayeredFrog } from './LayeredFrog';
import { MonthGrid } from './MonthGrid';

function DropIcon() {
  return (
    <View style={styles.dropBadge}>
      <Svg width={9} height={11} viewBox="0 0 10 12">
        <Path d="M5 0.5 C5 0.5 1 5.2 1 7.6 A4 4 0 0 0 9 7.6 C9 5.2 5 0.5 5 0.5 Z" fill={colors.water} />
      </Svg>
    </View>
  );
}

function EntryRow({ entry, units, deleting, onDelete }: { entry: Entry; units: 'ml' | 'oz'; deleting: boolean; onDelete: () => void }) {
  const { drink } = useStore();
  const d = drink(entry.drinkId);
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <DrinkGlyph id={entry.drinkId} size={24} />
      </View>
      <Text style={styles.rowLabel} numberOfLines={2}>
        {d.label}
      </Text>
      <View style={styles.rowRight}>
        <Text style={styles.rowValue}>
          {formatClock(entry.at)} • {formatAmount(entry.ml, units)}
        </Text>
        {entry.caffeineMg > 0 ? <Text style={styles.rowSub}>{entry.caffeineMg}mg caffeine</Text> : null}
      </View>
      {deleting && (
        <Animated.View entering={ZoomIn.springify().damping(13)} exiting={ZoomOut.duration(150)}>
          <Bounce onPress={onDelete} style={styles.minus} testID={`delete-${entry.id}`}>
            <View style={styles.minusBar} />
          </Bounce>
        </Animated.View>
      )}
    </View>
  );
}

function dayAt(day: string, minutes: number): number {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d, Math.floor(minutes / 60), minutes % 60).getTime();
}

/** Streak / hydration hero, month calendar and the selected day's drinks log. */
export function CalendarScreen({ params }: ScreenProps<{ day?: string }>) {
  const { state, streak, addDrink, deleteEntry, drink } = useStore();
  const nav = useNav();
  const { width } = useWindowDimensions();
  const pageW = Math.min(width, 520) - 32;
  const [selected, setSelected] = useState(params.day && params.day <= state.day ? params.day : state.day);
  const [ym, setYm] = useState(() => {
    const [y, m] = selected.split('-').map(Number);
    return { y, m: m - 1 };
  });
  const [deleting, setDeleting] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [missed, setMissed] = useState(false);
  const [minutes, setMinutes] = useState(720);
  const [pour, setPour] = useState<string | null>(null);

  const entries = useMemo(() => state.history[selected] ?? [], [state.history, selected]);
  const sorted = useMemo(() => [...entries].sort((a, b) => b.at - a.at), [entries]);
  const goal = goalFor(state, selected);
  const total = dayTotal(entries);
  const intake = entries.reduce((a, b) => a + b.ml, 0);
  const caffeine = entries.reduce((a, b) => a + b.caffeineMg, 0);
  const percent = Math.round((total / goal) * 100);
  const met = total >= goal;
  const isToday = selected === state.day;
  const units = state.units;

  const shiftMonth = (by: number) => setYm(({ y, m }) => ({ y: m + by < 0 ? y - 1 : m + by > 11 ? y + 1 : y, m: (m + by + 12) % 12 }));

  const select = (d: string) => {
    setSelected(d);
    setDeleting(false);
  };

  const openMissed = () => {
    const now = new Date();
    setMinutes(isToday ? now.getHours() * 60 + now.getMinutes() : 12 * 60);
    setDeleting(false);
    setMissed(true);
  };

  const pourDrink = pour ? drink(pour) : null;

  return (
    <View style={styles.root}>
      <Screen chrome="close" testID="calendar">
        <Animated.View entering={ZoomIn.springify().damping(14).delay(80)}>
          <HeroCircle size={Math.min(pageW - 70, 280)} streak={streak} percent={percent} isToday={isToday} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).springify().damping(18)} style={{ marginTop: 26 }}>
          <MonthGrid state={state} year={ym.y} month={ym.m} selected={selected} width={pageW} onSelect={select} onMonth={shiftMonth} />
        </Animated.View>

        <Animated.Text key={`t${selected}`} entering={FadeInDown.springify().damping(16)} style={styles.dateTitle} testID="day-title">
          {formatDate(selected)}
        </Animated.Text>

        {entries.length > 0 && (
          <Animated.View key={`f${selected}`} entering={FadeIn.duration(300)} style={styles.frog}>
            <LayeredFrog width={Math.min(pageW * 0.62, 240)} entries={entries} goalMl={goal} animate />
          </Animated.View>
        )}

        {met && !deleting && (
          <Animated.View entering={ZoomIn.springify().damping(13).delay(200)} style={{ marginBottom: 22 }}>
            <CelebrateButton day={selected} onPress={() => nav.push('celebrate', { day: selected })} />
          </Animated.View>
        )}

        <View style={styles.stats}>
          <View style={styles.statLine}>
            <Text style={styles.statMain} testID="day-hydration">
              {formatAmount(total, units)} hydration • {percent}% of your goal
            </Text>
            <DropIcon />
          </View>
          <Text style={styles.statSub}>
            {formatAmount(intake, units)} total intake ({caffeine}mg caffeine)
          </Text>
        </View>

        <View style={styles.list}>
          {sorted.map((e, i) => (
            <Animated.View
              key={`${selected}-${e.id}`}
              entering={FadeInDown.delay(80 + i * 45).springify().damping(18)}
              exiting={FadeOutLeft.duration(260)}
              layout={LinearTransition.springify().damping(18)}
            >
              <EntryRow entry={e} units={units} deleting={deleting} onDelete={() => setPending(e.id)} />
            </Animated.View>
          ))}
          {sorted.length === 0 && (
            <Animated.Text entering={FadeIn} style={styles.empty}>
              {isToday ? 'No drinks yet today. Lily is waiting!' : 'Nothing was logged on this day.'}
            </Animated.Text>
          )}
        </View>

        <Animated.View layout={LinearTransition.springify().damping(18)} style={styles.buttons}>
          {sorted.length > 0 && (
            <PillButton
              label={deleting ? 'DONE' : 'DELETE DRINK'}
              onPress={() => setDeleting((v) => !v)}
              style={[ui.softButton, styles.soft]}
              textStyle={ui.softButtonText}
              testID="delete-mode"
            />
          )}
          <PillButton label="ADD MISSED DRINK" onPress={openMissed} style={[ui.softButton, styles.soft]} textStyle={ui.softButtonText} testID="add-missed" />
        </Animated.View>
      </Screen>

      <Dialog
        visible={pending !== null}
        title="Are you sure?"
        message="It will delete the chosen record."
        onClose={() => setPending(null)}
        actions={[
          { label: 'Cancel', style: 'cancel' },
          {
            label: 'Delete',
            style: 'destructive',
            onPress: () => {
              if (!pending) return;
              deleteEntry(selected, pending);
              if (entries.length <= 1) setDeleting(false);
            },
          },
        ]}
      />

      <BottomSheet visible={missed} onClose={() => setMissed(false)} showClose>
        <Text style={styles.sheetTitle}>{formatDate(selected)}</Text>
        <TimeWheels value={minutes} onChange={setMinutes} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drinkRow} style={{ marginHorizontal: -22 }}>
          {state.drinks.enabled.map((id, i) => {
            const d = drink(id);
            return (
              <Animated.View key={id} entering={FadeInDown.delay(120 + i * 50).springify().damping(15)}>
                <Bounce
                  onPress={() => {
                    setMissed(false);
                    setPour(id);
                  }}
                  style={styles.drinkBtn}
                  testID={`missed-${id}`}
                >
                  <View>
                    <DrinkGlyph id={id} size={58} />
                    <View style={[styles.plus, { backgroundColor: d.color }]}>
                      <Text style={styles.plusText}>+</Text>
                    </View>
                  </View>
                  <Text style={styles.drinkLabel} numberOfLines={1}>
                    {d.label}
                  </Text>
                </Bounce>
              </Animated.View>
            );
          })}
        </ScrollView>
      </BottomSheet>

      <AddSipOverlay
        visible={pourDrink !== null}
        units={units}
        cupMl={pourDrink?.size ?? state.cupMl}
        color={pourDrink?.color}
        label={pourDrink?.label}
        shape={pourDrink?.shape}
        glass={pourDrink?.glass}
        onClose={() => setPour(null)}
        onAdd={(ml) => {
          if (!pour) return;
          const at = isToday ? Math.min(Date.now(), dayAt(selected, minutes)) : dayAt(selected, minutes);
          addDrink(pour, ml, { day: selected, at });
          setPour(null);
          nav.toast(`${pourDrink?.label ?? 'Drink'} added to ${formatDate(selected, { month: 'short', day: 'numeric' })}`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  dateTitle: { fontFamily: fonts.extra, fontSize: 30, color: colors.ink, textAlign: 'center', marginTop: 22, marginBottom: 14 },
  frog: { alignItems: 'center', marginBottom: 22 },
  stats: { alignItems: 'center', marginBottom: 14 },
  statLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statMain: { fontFamily: fonts.extra, fontSize: 15, color: colors.water },
  statSub: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted, marginTop: 3 },
  dropBadge: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.waterLight, alignItems: 'center', justifyContent: 'center' },
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E4E6EA' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 58, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E4E6EA', backgroundColor: colors.bg },
  rowIcon: { width: 32, alignItems: 'flex-start' },
  rowLabel: { flex: 1, fontFamily: fonts.black, fontSize: 14, color: colors.ink, letterSpacing: 0.3 },
  rowRight: { alignItems: 'flex-end', marginLeft: 8 },
  rowValue: { fontFamily: fonts.extra, fontSize: 14, color: '#9AA1AD' },
  rowSub: { fontFamily: fonts.bold, fontSize: 12, color: '#A9AFB9', marginTop: 1 },
  minus: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.pinkSoft, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  minusBar: { width: 11, height: 2.5, borderRadius: 2, backgroundColor: '#E5487F' },
  empty: { fontFamily: fonts.bold, fontSize: 14, color: colors.muted, textAlign: 'center', paddingVertical: 22 },
  buttons: { alignItems: 'center', gap: 14, marginTop: 30 },
  soft: { minWidth: 200 },
  sheetTitle: { fontFamily: fonts.extra, fontSize: 28, color: colors.ink, textAlign: 'center', marginBottom: 10, marginTop: 8 },
  drinkRow: { paddingHorizontal: 18, paddingTop: 22, gap: 6 },
  drinkBtn: { width: 84, alignItems: 'center' },
  plus: { position: 'absolute', bottom: -6, alignSelf: 'center', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  plusText: { fontFamily: fonts.black, fontSize: 13, color: '#fff', marginTop: -2 },
  drinkLabel: { fontFamily: fonts.black, fontSize: 11, color: colors.muted, marginTop: 10, letterSpacing: 0.4 },
});
