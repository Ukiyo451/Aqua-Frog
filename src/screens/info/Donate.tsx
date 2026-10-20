import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, Modal, PanResponder, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { BottomSheet } from '../../components/BottomSheet';
import { Frog, FrogAvatar } from '../../components/Frogs';
import { Bounce, PillButton } from '../../components/Pressable';
import { Screen } from '../../components/ui';
import { useStore } from '../../lib/store';
import { useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';

type Treat = 'candy' | 'chocolate' | 'coffee' | 'cake' | 'pizza';

export const STOPS: { treat: Treat; label: string; price: number }[] = [
  { treat: 'candy', label: 'Candy', price: 1.99 },
  { treat: 'chocolate', label: 'Chocolate', price: 4.99 },
  { treat: 'coffee', label: 'Coffee', price: 6.98 },
  { treat: 'cake', label: 'Cake', price: 9.99 },
  { treat: 'pizza', label: 'Pizza', price: 19.99 },
];

const KNOB = 54;
const PALE = '#E9FAFC';
const BORDER = '#BDEFF4';

export function TreatGlyph({ treat, size = 30 }: { treat: Treat; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {treat === 'candy' && (
        <G>
          <Path d="M3 10 L9 13 L9 19 L3 22 Z" fill="#B48CF0" />
          <Path d="M29 10 L23 13 L23 19 L29 22 Z" fill="#B48CF0" />
          <Ellipse cx={16} cy={16} rx={8} ry={6.5} fill="#FF7EB8" />
          <Path d="M11 12 Q14 16 11 20 M16 10 Q19 16 16 22 M21 12 Q24 16 21 20" stroke="#fff" strokeWidth={1.6} fill="none" opacity={0.85} />
        </G>
      )}
      {treat === 'chocolate' && (
        <G rotation={-18} origin="16, 16">
          <Rect x={8} y={4} width={16} height={24} rx={2} fill="#7A4A2A" />
          {[0, 1].map((c) => [0, 1, 2].map((r) => <Rect key={`${c}${r}`} x={9.5 + c * 7} y={5.5 + r * 7} width={6} height={6} rx={1} fill="#93603A" />))}
          <Path d="M7 17 H25 V28 Q25 29 24 29 H8 Q7 29 7 28 Z" fill="#E5484D" />
          <Rect x={7} y={17} width={18} height={2.4} fill="#FFD45C" />
        </G>
      )}
      {treat === 'coffee' && (
        <G>
          <Path d="M8 9 H24 L22.5 27 Q22.3 29 20 29 H12 Q9.7 29 9.5 27 Z" fill="#fff" stroke="#C9CED6" strokeWidth={1} />
          <Rect x={7} y={6} width={18} height={4} rx={1.5} fill="#8B5A3C" />
          <Path d="M9.2 14 H22.8 L22 21 H10 Z" fill="#14C6D6" />
          <Path d="M13 3.5 Q14.5 2 13 0.5 M18 3.5 Q19.5 2 18 0.5" stroke="#C9CED6" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        </G>
      )}
      {treat === 'cake' && (
        <G>
          <Path d="M4 18 L28 12 L28 26 L4 28 Z" fill="#FFE1B8" />
          <Path d="M4 18 L28 12 L28 15.5 L4 21.5 Z" fill="#FF8DBE" />
          <Path d="M4 23 L28 19.5 L28 21.5 L4 25 Z" fill="#FF8DBE" />
          <Circle cx={22} cy={10} r={3} fill="#E5484D" />
          <Path d="M22 7 Q23 5 25 5" stroke="#3F9A35" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        </G>
      )}
      {treat === 'pizza' && (
        <G>
          <Path d="M16 29 L4 7 Q16 1 28 7 Z" fill="#FFC85C" />
          <Path d="M4 7 Q16 1 28 7 L27 9.5 Q16 4 5 9.5 Z" fill="#D9963A" />
          <Circle cx={13} cy={12} r={2.4} fill="#E5484D" />
          <Circle cx={19.5} cy={13} r={2.4} fill="#E5484D" />
          <Circle cx={16} cy={20} r={2.2} fill="#E5484D" />
          <Circle cx={11} cy={17} r={0.9} fill="#3F9A35" />
          <Circle cx={21} cy={18} r={0.9} fill="#3F9A35" />
        </G>
      )}
    </Svg>
  );
}

function Radio({ on, label, onPress, testID }: { on: boolean; label: string; onPress: () => void; testID: string }) {
  return (
    <Bounce onPress={onPress} style={styles.radio} testID={testID}>
      <View style={[styles.radioDot, on && styles.radioOn]}>
        {on && (
          <Animated.View entering={ZoomIn.springify().damping(10)}>
            <Svg width={12} height={12} viewBox="0 0 14 14">
              <Path d="M3 7.5 L6 10 L11 4" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Animated.View>
        )}
      </View>
      <Text style={[styles.radioText, on && { color: colors.water }]}>{label}</Text>
    </Bounce>
  );
}

/** Five-stop price slider; the knob shows the treat and snaps to the nearest stop. */
function PriceSlider({ index, onChange }: { index: number; onChange: (i: number) => void }) {
  const [w, setW] = useState(0);
  const x = useSharedValue(0);
  const bump = useSharedValue(1);
  const step = (w - KNOB) / (STOPS.length - 1);
  const start = useRef(0);
  const live = useRef(index);
  const ref = useRef({ step, onChange });
  ref.current = { step, onChange };

  useEffect(() => {
    if (w > 0) x.value = withSpring(index * step, { damping: 16, stiffness: 200 });
    live.current = index;
  }, [index, w, step, x]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        start.current = live.current * ref.current.step;
        bump.value = withSpring(1.12, { damping: 10, stiffness: 300 });
      },
      onPanResponderMove: (_, g) => {
        const { step: s, onChange: set } = ref.current;
        const nx = Math.max(0, Math.min(s * (STOPS.length - 1), start.current + g.dx));
        x.value = nx;
        const i = Math.round(nx / s);
        if (i !== live.current) {
          live.current = i;
          set(i);
        }
      },
      onPanResponderRelease: () => {
        bump.value = withSpring(1, { damping: 8, stiffness: 260 });
        x.value = withSpring(live.current * ref.current.step, { damping: 14, stiffness: 220 });
      },
      onPanResponderTerminate: () => {
        bump.value = withSpring(1);
        x.value = withSpring(live.current * ref.current.step);
      },
    }),
  ).current;

  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { scale: bump.value }] }));
  const bubble = useAnimatedStyle(() => ({ transform: [{ translateX: x.value + KNOB / 2 - 38 }] }));
  const fillW = useAnimatedStyle(() => ({ width: x.value + KNOB / 2 }));
  const stop = STOPS[index];

  return (
    <View style={styles.slider} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <>
          <Animated.View style={[styles.bubble, bubble]}>
            <Animated.Text key={stop.price} entering={FadeIn.duration(180)} style={styles.bubbleText}>
              ${stop.price.toFixed(2)}
            </Animated.Text>
          </Animated.View>
          <View style={styles.track}>
            <Animated.View style={[styles.trackFill, fillW]} />
          </View>
          {STOPS.map((s, i) => (
            <Bounce key={s.treat} onPress={() => onChange(i)} style={[styles.stopDot, { left: i * step + KNOB / 2 - 9 }]} testID={`donate-stop-${s.treat}`}>
              <View style={styles.stopInner} />
            </Bounce>
          ))}
          <Animated.View style={[styles.knob, knob]} {...pan.panHandlers} testID="donate-knob">
            <Animated.View key={stop.treat} entering={ZoomIn.springify().damping(10)}>
              <TreatGlyph treat={stop.treat} />
            </Animated.View>
          </Animated.View>
        </>
      )}
    </View>
  );
}

/** Fake store sheet: product, price, Purchase → spinner → done. */
function PurchaseSheet({ visible, title, price, monthly, onClose, onBought }: { visible: boolean; title: string; price: number; monthly: boolean; onClose: () => void; onBought: () => void }) {
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!visible) setBusy(false);
  }, [visible]);
  const buy = () => {
    setBusy(true);
    setTimeout(onBought, 1500);
  };
  return (
    <BottomSheet visible={visible} onClose={busy ? undefined : onClose} dismissable={!busy}>
      <View style={styles.storeHead}>
        <Text style={styles.storeTitle}>Confirm purchase</Text>
        <Bounce onPress={busy ? undefined : onClose} testID="purchase-cancel">
          <Text style={styles.storeCancel}>Cancel</Text>
        </Bounce>
      </View>
      <View style={styles.storeProduct}>
        <View style={styles.storeIcon}>
          <FrogAvatar id="okapi" size={44} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.storeName}>{title}</Text>
          <Text style={styles.storeSub}>Lily • {monthly ? 'Monthly support' : 'One-time support'}</Text>
        </View>
      </View>
      <View style={styles.storeRow}>
        <Text style={styles.storeLabel}>PRICE</Text>
        <Text style={styles.storePrice}>
          ${price.toFixed(2)}
          {monthly ? <Text style={styles.storeSub}> / month</Text> : null}
        </Text>
      </View>
      <View style={{ height: 64, alignItems: 'center', justifyContent: 'center', marginTop: 18 }}>
        {busy ? (
          <ActivityIndicator color={colors.blue} size="large" />
        ) : (
          <PillButton label="Purchase" onPress={buy} style={styles.storeBuy} textStyle={{ fontSize: 16 }} testID="purchase-confirm" />
        )}
      </View>
      <Text style={styles.storeNote}>Simulated purchase, no money is charged.</Text>
    </BottomSheet>
  );
}

function ThankYou({ onSee, onHide, compact }: { onSee: () => void; onHide: () => void; compact?: boolean }) {
  return (
    <Animated.View entering={ZoomIn.springify().damping(14)} style={[styles.card, styles.thanks, compact && styles.compact]} testID="supporter-thanks">
      <Text style={styles.eyebrow}>BECOME A SUPPORTER</Text>
      <View style={styles.faces}>
        {['surf', 'okapi', 'rainbow'].map((id, i) => (
          <Animated.View key={id} entering={FadeInDown.delay(150 + i * 120).springify().damping(9)} style={{ marginHorizontal: -12, zIndex: i === 1 ? 2 : 1 }}>
            <View style={{ marginBottom: i === 1 ? 6 : 0 }}>
              <FrogAvatar id={id} size={i === 1 ? 100 : 84} />
            </View>
          </Animated.View>
        ))}
      </View>
      <Text style={styles.thanksText}>We, a small team behind Lily, thank you from the bottom of our hearts!</Text>
      <PillButton label="See your new frog" variant="water" onPress={onSee} style={{ marginTop: 20, alignSelf: 'stretch' }} testID="supporter-see" />
      <Bounce onPress={onHide} style={styles.hideSoft} testID="supporter-hide">
        <Text style={styles.hideSoftText}>HIDE</Text>
      </Bounce>
    </Animated.View>
  );
}

/** The "Become a Supporter" card (donate page and home screen). */
export function SupporterCard({ compact, always, onHide }: { compact?: boolean; always?: boolean; onHide?: () => void }) {
  const { state, update } = useStore();
  const nav = useNav();
  const [monthly, setMonthly] = useState(true);
  const [index, setIndex] = useState(1);
  const [sheet, setSheet] = useState(false);
  const [modal, setModal] = useState(false);
  const stop = STOPS[index];

  useEffect(() => {
    if (sheet) setModal(true);
    else {
      const t = setTimeout(() => setModal(false), 320);
      return () => clearTimeout(t);
    }
  }, [sheet]);

  if (!always && state.hiddenCards.includes('supporter')) return null;

  const hide = () => {
    update((s) => ({ hiddenCards: s.hiddenCards.includes('supporter') ? s.hiddenCards : [...s.hiddenCards, 'supporter'] }));
    onHide?.();
  };
  const bought = () => {
    setSheet(false);
    update((s) => ({
      supporter: { amount: stop.price, monthly, since: Date.now() },
      character: { ...s.character, collected: s.character.collected.includes('okapi') ? s.character.collected : [...s.character.collected, 'okapi'] },
    }));
  };

  if (state.supporter) return <ThankYou compact={compact} onHide={hide} onSee={() => nav.push('characterReveal', { id: 'okapi' })} />;

  return (
    <View style={[styles.card, compact && styles.compact]} testID="supporter-card">
      <View style={styles.frog} pointerEvents="none">
        <Frog id="okapi" width={compact ? 150 : 170} />
      </View>
      <View style={{ width: '62%' }}>
        <Text style={styles.cardTitle}>Become a Supporter</Text>
        <Text style={styles.cardText}>Keep our tiny team happy and hopping! Give whatever feels right, and a rare golden frog joins your pond as our thank-you.</Text>
      </View>
      <View style={{ marginTop: 14, gap: 4 }}>
        <Radio on={monthly} label="MONTHLY" onPress={() => setMonthly(true)} testID="donate-monthly" />
        <Radio on={!monthly} label="ONE-TIME" onPress={() => setMonthly(false)} testID="donate-onetime" />
      </View>
      <PriceSlider index={index} onChange={setIndex} />
      <PillButton label={`${stop.label} for creators!`} variant="water" onPress={() => setSheet(true)} style={styles.cta} textStyle={{ fontSize: 19 }} testID="donate-buy" />
      <Text style={styles.love}>Made with love</Text>
      <Text style={styles.loveSub}>for thirsty frogs everywhere 💚</Text>
      <Bounce onPress={hide} style={{ alignSelf: 'center', marginTop: 14, padding: 6 }} testID="donate-hide">
        <Text style={styles.hide}>HIDE</Text>
      </Bounce>
      <Modal transparent visible={modal} animationType="none" onRequestClose={() => setSheet(false)}>
        <PurchaseSheet visible={sheet} title={`${stop.label} for creators`} price={stop.price} monthly={monthly} onClose={() => setSheet(false)} onBought={bought} />
      </Modal>
    </View>
  );
}

export function DonateScreen() {
  const nav = useNav();
  return (
    <Screen testID="donate">
      <Animated.View entering={FadeInDown.springify().damping(16)}>
        <SupporterCard always onHide={nav.back} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: PALE, borderRadius: 28, borderWidth: 1.5, borderColor: BORDER, padding: 20, overflow: 'hidden' },
  compact: { marginHorizontal: 0 },
  frog: { position: 'absolute', right: -62, top: 18 },
  cardTitle: { fontFamily: fonts.black, fontSize: 25, color: colors.water, lineHeight: 29 },
  cardText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.inkSoft, lineHeight: 21, marginTop: 8 },
  radio: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  radioDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#D4EEF2', alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: colors.water },
  radioText: { fontFamily: fonts.black, fontSize: 13, color: '#B3C3C8', letterSpacing: 0.6 },
  slider: { height: 112, justifyContent: 'flex-end', marginTop: 4 },
  bubble: { position: 'absolute', top: 8, left: 0, width: 76, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#0A8E9A', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  bubbleText: { fontFamily: fonts.black, fontSize: 16, color: colors.water },
  track: { position: 'absolute', left: KNOB / 2, right: KNOB / 2, bottom: KNOB / 2 + 5, height: 6, borderRadius: 3, backgroundColor: '#C5EEF3', overflow: 'hidden' },
  trackFill: { position: 'absolute', left: -KNOB / 2, top: 0, bottom: 0, backgroundColor: colors.water, opacity: 0.45 },
  stopDot: { position: 'absolute', bottom: KNOB / 2 - 1, width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', borderWidth: 3, borderColor: '#C5EEF3', alignItems: 'center', justifyContent: 'center' },
  stopInner: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#C5EEF3' },
  knob: {
    position: 'absolute',
    left: 0,
    bottom: 4,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A5E66',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cta: { backgroundColor: colors.water, marginTop: 18, paddingVertical: 20 },
  love: { fontFamily: fonts.bold, fontSize: 15, color: '#4A8FE0', textAlign: 'center', marginTop: 18 },
  loveSub: { fontFamily: fonts.bold, fontSize: 15, color: colors.frogDark, textAlign: 'center' },
  hide: { fontFamily: fonts.black, fontSize: 11, color: '#B3C3C8', letterSpacing: 1 },
  eyebrow: { fontFamily: fonts.black, fontSize: 11, color: colors.water, letterSpacing: 1, textAlign: 'center', opacity: 0.8 },
  thanks: { alignItems: 'center', paddingVertical: 24 },
  faces: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginTop: 22 },
  thanksText: { fontFamily: fonts.black, fontSize: 21, color: colors.water, textAlign: 'center', lineHeight: 28, marginTop: 18, paddingHorizontal: 6 },
  hideSoft: { alignSelf: 'stretch', marginTop: 10, borderRadius: 999, backgroundColor: '#CDF1F6', paddingVertical: 16, alignItems: 'center' },
  hideSoftText: { fontFamily: fonts.black, fontSize: 15, color: colors.water, letterSpacing: 1 },
  storeHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: -6, marginBottom: 14 },
  storeTitle: { fontFamily: fonts.extra, fontSize: 19, color: colors.ink },
  storeCancel: { fontFamily: fonts.semibold, fontSize: 16, color: '#2E7CF6' },
  storeProduct: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#E1E4E9' },
  storeIcon: { width: 56, height: 56, borderRadius: 14, backgroundColor: PALE, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  storeName: { fontFamily: fonts.extra, fontSize: 16, color: colors.ink },
  storeSub: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
  storeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#E1E4E9' },
  storeLabel: { fontFamily: fonts.black, fontSize: 12, color: colors.muted, letterSpacing: 1 },
  storePrice: { fontFamily: fonts.black, fontSize: 22, color: colors.ink },
  storeBuy: { backgroundColor: '#2E7CF6', paddingVertical: 14, minWidth: 180 },
  storeNote: { fontFamily: fonts.semibold, fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 4 },
});
