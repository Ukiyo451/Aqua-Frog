import { useEffect, useRef, useState } from 'react';
import { Linking, ScrollView, ScrollViewInstance, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Bounce } from '../../components/Pressable';
import { ChevronIcon, HeaderPill, Screen } from '../../components/ui';
import { ScreenProps, useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { LayeredFrog } from './common';
import { FAQ, FAQ_BY_ID, TopicIcon } from './faqData';

const PALE = '#EAFAFC';
export const SUPPORT_EMAIL = 'hello@lily-app.example';

export function TopicGlyph({ icon, size = 22, color = colors.water }: { icon: TopicIcon; size?: number; color?: string }) {
  const s = { stroke: color, strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {icon === 'lock' && (
        <>
          <Rect x={5} y={10.5} width={14} height={10} rx={2.5} {...s} />
          <Path d="M8 10.5 V7.5 Q8 3.5 12 3.5 Q16 3.5 16 7.5 V10.5 M12 14.5 V16.5" {...s} />
        </>
      )}
      {icon === 'calendar' && (
        <>
          <Rect x={3.5} y={5} width={17} height={15} rx={3} {...s} />
          <Path d="M3.5 10 H20.5 M8 3 V6.5 M16 3 V6.5" {...s} />
          <Circle cx={8.5} cy={14.5} r={0.6} {...s} />
          <Circle cx={12} cy={14.5} r={0.6} {...s} />
          <Circle cx={15.5} cy={14.5} r={0.6} {...s} />
        </>
      )}
      {icon === 'drop' && <Path d="M12 3 C12 3 5.5 10.5 5.5 14.5 Q5.5 20.5 12 20.5 Q18.5 20.5 18.5 14.5 C18.5 10.5 12 3 12 3 Z" {...s} />}
      {icon === 'cup' && <Path d="M5 4 H19 L17.2 19 Q17 20.5 15.5 20.5 H8.5 Q7 20.5 6.8 19 Z M5.6 9 H18.4" {...s} />}
      {icon === 'watch' && (
        <>
          <Rect x={6} y={6} width={12} height={12} rx={3.5} {...s} />
          <Path d="M9 6 L9.6 3 H14.4 L15 6 M9 18 L9.6 21 H14.4 L15 18 M12 9.5 V12 L13.5 13" {...s} />
        </>
      )}
      {icon === 'bell' && <Path d="M6 16.5 V11 Q6 5.5 12 5.5 Q18 5.5 18 11 V16.5 L19.5 18 H4.5 Z M10 20.5 Q12 22 14 20.5 M12 3 V5.5" {...s} />}
      {icon === 'frog' && (
        <>
          <Path d="M4 15 Q4 9 9 8.5 M20 15 Q20 9 15 8.5 M4 15 Q4 20 12 20 Q20 20 20 15" {...s} />
          <Circle cx={8} cy={7} r={3} {...s} />
          <Circle cx={16} cy={7} r={3} {...s} />
          <Path d="M9 15 Q12 17 15 15" {...s} />
        </>
      )}
    </Svg>
  );
}

function openMail(toast: (t: string) => void) {
  Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Lily support')}`).catch(() => toast(`Write to us at ${SUPPORT_EMAIL}`));
}

export function HelpScreen() {
  const nav = useNav();
  const contact = () => {
    try {
      openMail(nav.toast);
    } catch {
      nav.toast(`Write to us at ${SUPPORT_EMAIL}`);
    }
  };
  return (
    <Screen right={<HeaderPill label="CONTACT US" color={colors.water} bg={colors.waterLight} onPress={contact} testID="help-contact" />} testID="help">
      <Text style={styles.pageTitle}>Help & Support</Text>
      <Animated.View entering={FadeInDown.springify()} style={styles.brand}>
        <View style={styles.logo}>
          <LayeredFrog width={62} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandName}>Lily</Text>
          <Text style={styles.brandTitle}>Frequently Asked Questions</Text>
        </View>
      </Animated.View>
      {FAQ.map((t, i) => (
        <Animated.View key={t.id} entering={FadeInDown.delay(80 + i * 45).springify()}>
          <Bounce onPress={() => nav.push('faq', { topic: t.id })} scaleTo={0.97} style={styles.topic} testID={`faq-${t.id}`}>
            <TopicGlyph icon={t.icon} />
            <Text style={styles.topicText}>{t.title}</Text>
            <ChevronIcon color={colors.water} />
          </Bounce>
        </Animated.View>
      ))}
      <Text style={styles.foot}>Didn’t find your answer? Tap Contact Us and a real person will write back.</Text>
    </Screen>
  );
}

function Answer({ q, a, open, onToggle, onLayout, testID }: { q: string; a: string; open: boolean; onToggle: () => void; onLayout: (y: number) => void; testID: string }) {
  const rot = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    rot.value = withSpring(open ? 1 : 0, { damping: 14, stiffness: 200 });
  }, [open, rot]);
  const chev = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value * 90}deg` }] }));
  return (
    <Animated.View layout={LinearTransition.springify().damping(18)} onLayout={(e) => onLayout(e.nativeEvent.layout.y)} style={[styles.qa, open && styles.qaOpen]}>
      <Bounce onPress={onToggle} scaleTo={0.98} style={styles.qaHead} testID={testID}>
        <Text style={styles.qaQ}>{q}</Text>
        <Animated.View style={chev}>
          <ChevronIcon color={colors.water} size={13} />
        </Animated.View>
      </Bounce>
      {open && (
        <Animated.Text entering={FadeIn.duration(260).delay(60)} style={styles.qaA}>
          {a}
        </Animated.Text>
      )}
    </Animated.View>
  );
}

/** One FAQ topic: question links on top that jump to and open their answers below. */
export function FaqScreen({ params }: ScreenProps<{ topic?: string }>) {
  const topic = FAQ_BY_ID[params.topic ?? ''] ?? FAQ[0];
  const [open, setOpen] = useState<number[]>([]);
  const scroll = useRef<ScrollViewInstance>(null);
  const ys = useRef<number[]>([]);
  const listY = useRef(0);

  const jump = (i: number) => {
    setOpen((o) => (o.includes(i) ? o : [...o, i]));
    setTimeout(() => scroll.current?.scrollTo({ y: listY.current + (ys.current[i] ?? 0) - 12, animated: true }), 60);
  };

  return (
    <Screen scroll={false} contentStyle={{ paddingHorizontal: 0, paddingBottom: 0 }} testID="faq">
      <ScrollView ref={scroll} contentContainerStyle={styles.faqBody} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.springify()}>
          <TopicGlyph icon={topic.icon} size={46} />
          <Text style={styles.faqTitle}>{topic.title}</Text>
        </Animated.View>
        {topic.qas.map((x, i) => (
          <Animated.View key={x.q} entering={FadeInDown.delay(60 + i * 40).springify()}>
            <Bounce onPress={() => jump(i)} scaleTo={0.97} style={styles.link} testID={`faq-link-${i}`}>
              <ChevronIcon color={colors.water} size={10} />
              <Text style={styles.linkText}>{x.q}</Text>
            </Bounce>
          </Animated.View>
        ))}
        <View style={styles.sep} />
        <View onLayout={(e) => (listY.current = e.nativeEvent.layout.y)}>
          {topic.qas.map((x, i) => (
            <Answer
              key={x.q}
              q={x.q}
              a={x.a}
              open={open.includes(i)}
              onToggle={() => setOpen((o) => (o.includes(i) ? o.filter((n) => n !== i) : [...o, i]))}
              onLayout={(y) => (ys.current[i] = y)}
              testID={`faq-q-${i}`}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontFamily: fonts.extra, fontSize: 30, color: colors.ink, textAlign: 'center', marginBottom: 18 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 18 },
  logo: {
    width: 86,
    height: 86,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  brandName: { fontFamily: fonts.extra, fontSize: 15, color: colors.blue },
  brandTitle: { fontFamily: fonts.extra, fontSize: 26, color: colors.water, lineHeight: 30 },
  topic: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: PALE, borderRadius: 16, paddingHorizontal: 14, minHeight: 56, paddingVertical: 12, marginBottom: 10 },
  topicText: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  foot: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 12, paddingHorizontal: 20 },
  faqBody: { paddingHorizontal: 22, paddingTop: 4, paddingBottom: 80 },
  faqTitle: { fontFamily: fonts.extra, fontSize: 28, color: colors.ink, marginTop: 10, marginBottom: 14, lineHeight: 34 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  linkText: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.water },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#DDE2E8', marginVertical: 22 },
  qa: { borderRadius: 16, backgroundColor: '#F7F8FA', marginBottom: 10, overflow: 'hidden' },
  qaOpen: { backgroundColor: PALE },
  qaHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 16 },
  qaQ: { flex: 1, fontFamily: fonts.extra, fontSize: 17, color: colors.ink },
  qaA: { fontFamily: fonts.semibold, fontSize: 15, color: colors.inkSoft, lineHeight: 22, paddingHorizontal: 16, paddingBottom: 16, marginTop: -4 },
});
