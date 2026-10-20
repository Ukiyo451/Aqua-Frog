import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Bounce } from '../../components/Pressable';
import { CloseButton, useShare } from '../../components/ui';
import { ScreenProps } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { ChallengeCard, inviteText, useChallengeParam } from './common';

function MessagesGlyph() {
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26">
      <Rect width={26} height={26} rx={7} fill="#34C759" />
      <Path d="M13 6.5c-4.4 0-8 2.8-8 6.3 0 2 1.2 3.8 3 4.9l-.7 2.8 3.2-1.8c.8.2 1.6.3 2.5.3 4.4 0 8-2.8 8-6.2S17.4 6.5 13 6.5Z" fill="#fff" />
    </Svg>
  );
}

function MessengerGlyph() {
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26">
      <Circle cx={13} cy={13} r={12} fill="#7A5CFA" />
      <Path d="M7 15.5 L11 10.5 L13.6 13 L19 10.5 L15 15.5 L12.4 13 Z" fill="#fff" />
    </Svg>
  );
}

function InstagramGlyph() {
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26">
      <Rect width={26} height={26} rx={7} fill="#E1306C" />
      <Rect x={6} y={6} width={14} height={14} rx={4.5} stroke="#fff" strokeWidth={1.8} fill="none" />
      <Circle cx={13} cy={13} r={3.3} stroke="#fff" strokeWidth={1.8} fill="none" />
      <Circle cx={17.3} cy={8.8} r={1} fill="#fff" />
    </Svg>
  );
}

function FacebookGlyph() {
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26">
      <Circle cx={13} cy={13} r={12} fill="#1877F2" />
      <Path d="M14.2 21v-6.6h2.2l.4-2.6h-2.6v-1.6c0-.8.3-1.3 1.4-1.3h1.3V6.6c-.3 0-1-.1-1.9-.1-2 0-3.3 1.2-3.3 3.4v1.9H9.5v2.6h2.2V21" fill="#fff" />
    </Svg>
  );
}

function MoreGlyph() {
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26">
      <Path d="M3.5 12.2 L22 4.5 L15.8 22 L12.6 14.3 Z" fill="#3FB4C7" />
      <Path d="M12.6 14.3 L22 4.5" stroke="#fff" strokeWidth={1.4} />
    </Svg>
  );
}

const TARGETS: { id: string; label: string; bg: string; color: string; icon: ReactNode }[] = [
  { id: 'messages', label: 'Messages', bg: '#DDF7E5', color: '#2DB352', icon: <MessagesGlyph /> },
  { id: 'messenger', label: 'Messenger', bg: '#E9E6FD', color: '#6247E8', icon: <MessengerGlyph /> },
  { id: 'instagram', label: 'Instagram', bg: '#FDE3EC', color: '#D82C68', icon: <InstagramGlyph /> },
  { id: 'facebook', label: 'Facebook', bg: '#E1EDFC', color: '#1769D9', icon: <FacebookGlyph /> },
  { id: 'more', label: 'More', bg: '#DDF5F9', color: '#2A9FB3', icon: <MoreGlyph /> },
];

/** Invite friends to a challenge: the card plus a pastel button per app. */
export function ChallengeShare({ params }: ScreenProps<{ id?: string }>) {
  const c = useChallengeParam(params.id);
  const share = useShare();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 60 }]} testID="challenge-share">
      <View style={[styles.close, { top: insets.top + 10 }]}>
        <CloseButton />
      </View>
      <Animated.View entering={ZoomIn.springify().damping(14)}>
        <ChallengeCard c={c} height={170} titleSize={30} frogWidth={190} />
      </Animated.View>
      <View style={styles.list}>
        {TARGETS.map((t, i) => (
          <Animated.View key={t.id} entering={FadeInDown.delay(140 + i * 50).springify().damping(16)}>
            <Bounce onPress={() => share(inviteText(c))} style={[styles.btn, { backgroundColor: t.bg }]} testID={`share-${t.id}`} scaleTo={0.95}>
              {t.icon}
              <Text style={[styles.btnText, { color: t.color }]}>{t.label}</Text>
            </Bounce>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 },
  close: { position: 'absolute', right: 14, zIndex: 2 },
  list: { marginTop: 30, paddingHorizontal: 28, gap: 12 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 999, height: 56 },
  btnText: { fontFamily: fonts.extra, fontSize: 18 },
});
