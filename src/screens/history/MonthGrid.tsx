import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming, ZoomIn } from 'react-native-reanimated';
import { ChevronIcon } from '../../components/ui';
import { todayKey } from '../../lib/hydration';
import { AppState, dayTotal, goalMet } from '../../lib/store';
import { colors, fonts } from '../../theme';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CELL_H = 46;
const DOT = 38;

interface Props {
  state: AppState;
  /** First day of the shown month. */
  year: number;
  month: number;
  selected: string;
  width: number;
  onSelect: (day: string) => void;
  onMonth: (by: number) => void;
}

/** Month header with arrows, weekday initials and the day cells with streak capsules. */
export function MonthGrid({ state, year, month, selected, width, onSelect, onMonth }: Props) {
  const today = state.day;
  const monday = (state.weekStart ?? 'monday') === 'monday';
  const initials = monday ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const cellW = width / 7;

  const first = new Date(year, month, 1);
  const lead = (first.getDay() - (monday ? 1 : 0) + 7) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => todayKey(new Date(year, month, i + 1)))];
  while (cells.length % 7) cells.push(null);
  const rows: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const isCurrent = today.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`);
  const met = (d: string | null) => !!d && d <= today && goalMet(state, d);

  // month change slides the grid in from the side it came from
  const slide = useSharedValue(0);
  const fade = useSharedValue(1);
  const prev = useRef(year * 12 + month);
  useEffect(() => {
    const now = year * 12 + month;
    const dir = Math.sign(now - prev.current);
    prev.current = now;
    if (!dir) return;
    slide.value = dir * 60;
    fade.value = 0;
    slide.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) });
    fade.value = withTiming(1, { duration: 260 });
  }, [year, month, slide, fade]);
  const gridStyle = useAnimatedStyle(() => ({ opacity: fade.value, transform: [{ translateX: slide.value }] }));

  return (
    <View>
      <View style={styles.header}>
        <Pressable onPress={() => onMonth(-1)} hitSlop={14} style={styles.arrow} testID="month-prev">
          <ChevronIcon dir="left" size={14} color="#B5BBC4" />
        </Pressable>
        <Animated.Text key={`${year}-${month}`} entering={ZoomIn.springify().damping(15)} style={styles.month}>
          {MONTHS[month]}
          {year !== Number(today.slice(0, 4)) ? ` ${year}` : ''}
        </Animated.Text>
        <Pressable onPress={() => !isCurrent && onMonth(1)} hitSlop={14} style={[styles.arrow, isCurrent && { opacity: 0.25 }]} testID="month-next">
          <ChevronIcon dir="right" size={14} color="#B5BBC4" />
        </Pressable>
      </View>
      <View style={styles.weekRow}>
        {initials.map((w, i) => (
          <Text key={i} style={[styles.weekday, { width: cellW }]}>
            {w}
          </Text>
        ))}
      </View>
      <Animated.View style={gridStyle}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((d, ci) => {
              if (!d) return <View key={ci} style={{ width: cellW, height: CELL_H }} />;
              const future = d > today;
              const goal = met(d);
              const joinL = goal && ci > 0 && met(row[ci - 1]);
              const joinR = goal && ci < 6 && met(row[ci + 1]);
              const some = !future && dayTotal(state.history[d]) > 0;
              const isSel = d === selected;
              const isToday = d === today;
              const num = Number(d.slice(8));
              const inset = (cellW - DOT) / 2;
              const showNum = future || goal || isSel || isToday;
              return (
                <Pressable key={d} disabled={future} onPress={() => onSelect(d)} style={[styles.cell, { width: cellW }]} testID={`day-${d}`}>
                  {goal && (
                    <View
                      style={[
                        styles.capsule,
                        {
                          left: joinL ? 0 : inset,
                          right: joinR ? 0 : inset,
                          borderTopLeftRadius: joinL ? 0 : DOT / 2,
                          borderBottomLeftRadius: joinL ? 0 : DOT / 2,
                          borderTopRightRadius: joinR ? 0 : DOT / 2,
                          borderBottomRightRadius: joinR ? 0 : DOT / 2,
                        },
                      ]}
                    />
                  )}
                  {isToday && !goal && !isSel && <View style={styles.todayRing} />}
                  {isSel && <Animated.View key={selected} entering={ZoomIn.springify().damping(11).stiffness(220)} style={[styles.selected, isToday && styles.selectedToday]} />}
                  {showNum ? (
                    <Text style={[styles.num, future && styles.future, isToday && !goal && styles.todayNum, (goal || isSel) && styles.white]}>{num}</Text>
                  ) : (
                    <View style={[styles.dot, some && styles.dotSome]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 },
  arrow: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  month: { fontFamily: fonts.extra, fontSize: 28, color: colors.ink },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekday: { fontFamily: fonts.black, fontSize: 13, color: colors.water, textAlign: 'center' },
  row: { flexDirection: 'row' },
  cell: { height: CELL_H, alignItems: 'center', justifyContent: 'center' },
  capsule: { position: 'absolute', top: (CELL_H - DOT) / 2, height: DOT, backgroundColor: colors.water },
  todayRing: { position: 'absolute', width: DOT, height: DOT, borderRadius: DOT / 2, borderWidth: 2.5, borderColor: colors.water },
  selected: { position: 'absolute', width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: colors.ink },
  selectedToday: { borderWidth: 2.5, borderColor: colors.water },
  num: { fontFamily: fonts.extra, fontSize: 15, color: colors.ink },
  future: { color: '#C3C8D0', fontFamily: fonts.bold },
  todayNum: { color: colors.water },
  white: { color: '#fff' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D5D9DF' },
  dotSome: { backgroundColor: colors.water },
});
