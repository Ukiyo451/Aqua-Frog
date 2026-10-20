import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/lib/store';
import { Home } from './src/screens/Home';
import { OnboardingFlow, OnboardingStep } from './src/screens/onboarding/OnboardingFlow';

// `?step=goal` jumps straight to an onboarding page when previewing on web.
const previewStep =
  Platform.OS === 'web' && typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('step') as OnboardingStep | 'home' | null)
    : null;

function Root() {
  const { state, ready } = useStore();
  if (!ready) return <View style={styles.root} />;
  if (previewStep === 'home' || (state.onboarded && !previewStep)) {
    return (
      <Animated.View entering={FadeIn.duration(500)} style={styles.root}>
        <Home />
      </Animated.View>
    );
  }
  return <OnboardingFlow initialStep={previewStep ?? undefined} />;
}

export default function App() {
  const [loaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black });
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        {loaded ? <Root /> : <View style={styles.root} />}
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
});
