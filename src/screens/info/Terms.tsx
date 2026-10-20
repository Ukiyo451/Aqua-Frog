import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Paragraph, Screen, Title } from '../../components/ui';
import { colors, fonts } from '../../theme';
import { SUPPORT_EMAIL } from './Help';

const SECTIONS = [
  {
    title: 'Your data stays with you',
    body: 'Everything you log in Lily (drinks, goals, reminders and your frog collection) is saved on this device. We don’t run accounts, we don’t sell data and we don’t show ads. Turning on Apple Health or device sync only moves your own data between your own devices and apps.',
  },
  {
    title: 'Not medical advice',
    body: 'Lily is a friendly habit tracker, not a medical device. Goals and hydration ratios are general estimates. If you have a health condition, are pregnant, or have been told to limit fluids, follow your doctor’s advice over anything the app suggests.',
  },
  {
    title: 'Purchases',
    body: 'Premium and supporter purchases are handled by your phone’s app store and follow its refund rules. A subscription renews until you cancel it in your store settings. Lifetime is paid once and never renews.',
  },
  {
    title: 'Notifications',
    body: 'Reminders are scheduled on your device. You can turn them off in Lily or in your phone’s settings at any time.',
  },
  {
    title: 'Changes',
    body: 'If these terms change, the new version will appear here and in What’s new. Continuing to use Lily means you’re fine with the update.',
  },
  {
    title: 'Contact',
    body: `Questions or worries? Write to ${SUPPORT_EMAIL} and a person from the Lily team will reply.`,
  },
];

export function TermsScreen() {
  return (
    <Screen testID="terms">
      <Animated.View entering={FadeInDown.springify()}>
        <Title>Terms & Privacy</Title>
        <Text style={styles.updated}>Last updated October 2026</Text>
      </Animated.View>
      {SECTIONS.map((s, i) => (
        <Animated.View key={s.title} entering={FadeInDown.delay(60 + i * 50).springify()}>
          <Text style={styles.head}>{s.title}</Text>
          <Paragraph style={styles.body}>{s.body}</Paragraph>
        </Animated.View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  updated: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted, textAlign: 'center', marginBottom: 12 },
  head: { fontFamily: fonts.extra, fontSize: 19, color: colors.ink, marginTop: 14, marginBottom: 6 },
  body: { fontSize: 15, lineHeight: 23 },
});
