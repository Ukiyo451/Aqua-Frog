import { useEffect, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { colors, fonts } from '../theme';

const ROW = 40;
const VISIBLE = 5;

interface Props<T extends string | number> {
  values: T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
  width?: number;
  testID?: string;
}

function Row({ index, label, scrollY }: { index: number; label: string; scrollY: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const d = Math.abs(scrollY.value / ROW - index);
    return {
      opacity: interpolate(d, [0, 1, 2.5], [1, 0.45, 0.12], 'clamp'),
      transform: [
        { perspective: 400 },
        { rotateX: `${interpolate(scrollY.value / ROW - index, [-2.5, 0, 2.5], [55, 0, -55], 'clamp')}deg` },
        { scale: interpolate(d, [0, 2], [1, 0.86], 'clamp') },
      ],
    };
  });
  return (
    <Animated.View style={[styles.row, style]}>
      <Text style={styles.text}>{label}</Text>
    </Animated.View>
  );
}

/** An iOS-style rolling wheel: rows tilt away and fade as they leave the centre. */
export function WheelPicker<T extends string | number>({ values, value, onChange, format, width = 110, testID }: Props<T>) {
  const ref = useRef<Animated.ScrollView>(null);
  const startIndex = Math.max(0, values.indexOf(value));
  const scrollY = useSharedValue(startIndex * ROW);
  const last = useRef(startIndex);

  useEffect(() => {
    const t = setTimeout(() => ref.current?.scrollTo({ y: startIndex * ROW, animated: false }), 0);
    return () => clearTimeout(t);
    // only on mount / when the list itself changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const handler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const pick = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.min(values.length - 1, Math.max(0, Math.round(e.nativeEvent.contentOffset.y / ROW)));
    if (i !== last.current) {
      last.current = i;
      onChange(values[i]);
    }
  };

  return (
    <View style={{ height: ROW * VISIBLE, width }} testID={testID}>
      <View style={styles.highlight} pointerEvents="none" />
      <Animated.ScrollView
        ref={ref}
        onScroll={handler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW}
        decelerationRate="fast"
        onMomentumScrollEnd={pick}
        onScrollEndDrag={pick}
        contentContainerStyle={{ paddingVertical: ROW * 2 }}
      >
        {values.map((v, i) => (
          <Row key={String(v)} index={i} label={format ? format(v) : String(v)} scrollY={scrollY} />
        ))}
      </Animated.ScrollView>
      <ScrollSync scrollY={scrollY} values={values} last={last} onChange={onChange} />
    </View>
  );
}

/** Mirrors the scroll position into a selection on platforms without momentum events (web). */
function ScrollSync<T>({
  scrollY,
  values,
  last,
  onChange,
}: {
  scrollY: SharedValue<number>;
  values: T[];
  last: React.MutableRefObject<number>;
  onChange: (v: T) => void;
}) {
  useEffect(() => {
    const id = setInterval(() => {
      const i = Math.min(values.length - 1, Math.max(0, Math.round(scrollY.value / ROW)));
      if (i !== last.current) {
        last.current = i;
        onChange(values[i]);
      }
    }, 120);
    return () => clearInterval(id);
  }, [scrollY, values, last, onChange]);
  return null;
}

const styles = StyleSheet.create({
  row: { height: ROW, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.bold, fontSize: 22, color: colors.water },
  highlight: {
    position: 'absolute',
    top: ROW * 2,
    left: 0,
    right: 0,
    height: ROW,
    borderRadius: 12,
    backgroundColor: '#F2F4F6',
  },
});
