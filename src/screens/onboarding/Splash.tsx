import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LogoMark } from '../../components/Logo';
import { colors, fonts } from '../../theme';

export function Splash({ onNext }: { onNext: () => void }) {
  useEffect(() => {
    const t = setTimeout(onNext, 2300);
    return () => clearTimeout(t);
  }, [onNext]);
  return (
    <View style={styles.root}>
      <LogoMark />
      <Animated.View entering={FadeIn.delay(900).duration(600)} style={styles.footer}>
        <Text style={[styles.love, { color: colors.blue }]}>Made with love</Text>
        <Text style={[styles.love, { color: colors.frogDark }]}>on a lily pad 🪷</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  footer: { position: 'absolute', bottom: 90, alignItems: 'center' },
  love: { fontFamily: fonts.semibold, fontSize: 15 },
});
