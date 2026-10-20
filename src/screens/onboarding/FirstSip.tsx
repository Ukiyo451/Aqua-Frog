import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddSipOverlay } from '../../components/AddSipOverlay';
import { BottomSheet } from '../../components/BottomSheet';
import { DrinkButton } from '../../components/DrinkButton';
import { Lily } from '../../components/Lily';
import { PillButton } from '../../components/Pressable';
import { formatAmount, Units } from '../../lib/hydration';
import { useStore } from '../../lib/store';
import { colors, fonts } from '../../theme';
import { SkipButton } from './common';

const { width: SW } = Dimensions.get('window');

export function FirstSip({ onNext }: { onNext: () => void }) {
  const insets = useSafeAreaInsets();
  const { state, update, addSip } = useStore();
  const [askUnits, setAskUnits] = useState(false);
  const [cupOpen, setCupOpen] = useState(false);
  const [added, setAdded] = useState<number | null>(null);
  const bump = useSharedValue(1);

  useEffect(() => {
    const t = setTimeout(() => setAskUnits(true), 450);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (added === null) return;
    const t = setTimeout(onNext, 2600);
    return () => clearTimeout(t);
  }, [added, onNext]);

  const pickUnits = (units: Units) => {
    update({ units });
    setAskUnits(false);
  };

  const onAdd = (ml: number) => {
    setCupOpen(false);
    addSip(ml);
    setAdded(ml);
    bump.value = withSequence(withTiming(1.25, { duration: 160 }), withSpring(1, { damping: 6 }));
  };

  const amountStyle = useAnimatedStyle(() => ({ transform: [{ scale: bump.value }] }));
  // the first sip is shown against the default 2000ml goal; a sliver of water sits at her toes
  const fill = added === null ? 0.012 : Math.min(1, added / state.goalMl + 0.02);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 44 }]}>
      <SkipButton onPress={onNext} />
      <View style={styles.header}>
        {added === null ? (
          <Animated.Text key="title" entering={FadeIn} exiting={FadeOut} style={styles.title}>
            Add your first sip
          </Animated.Text>
        ) : (
          <Animated.View key="amount" entering={ZoomIn.springify()}>
            <Animated.View style={amountStyle}>
              <Text style={styles.amount}>{formatAmount(added, state.units)}</Text>
            </Animated.View>
          </Animated.View>
        )}
      </View>
      <View style={styles.stage}>
        <Lily width={SW * 0.78} variant="silhouette" fill={fill} />
      </View>
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 26 }]}>
        <DrinkButton kind="water" pulse={added === null && !askUnits} onPress={() => added === null && setCupOpen(true)} />
      </View>

      <BottomSheet visible={askUnits} dismissable={false}>
        <Text style={styles.sheetTitle}>What's your{'\n'}units</Text>
        <PillButton label="oz (ounces)" variant="water" onPress={() => pickUnits('oz')} style={styles.unitBtn} testID="units-oz" />
        <PillButton label="ml (milliliters)" variant="water" onPress={() => pickUnits('ml')} style={styles.unitBtn} testID="units-ml" />
      </BottomSheet>

      <AddSipOverlay visible={cupOpen} units={state.units} cupMl={state.cupMl} onClose={() => setCupOpen(false)} onAdd={onAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center' },
  header: { height: 50, justifyContent: 'center' },
  title: { fontFamily: fonts.extra, fontSize: 28, color: colors.ink },
  amount: { fontFamily: fonts.extra, fontSize: 38, color: colors.water },
  stage: { flex: 1, justifyContent: 'center' },
  bottom: { alignItems: 'center' },
  sheetTitle: { fontFamily: fonts.extra, fontSize: 28, color: colors.ink, textAlign: 'center', marginBottom: 20 },
  unitBtn: { alignSelf: 'center', width: 240, marginBottom: 14, paddingVertical: 16 },
});
