import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { Nunito_900Black } from '@expo-google-fonts/nunito/900Black';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/lib/store';
import { WEB_MAX_WIDTH } from './src/lib/webFrame';
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
        <View style={styles.page}>
          <View style={styles.frame}>{loaded ? <Root /> : <View style={styles.root} />}</View>
        </View>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  // on desktop web: a phone-width column centred on a soft pond-green page
  page: { flex: 1, alignItems: 'center', backgroundColor: Platform.OS === 'web' ? '#DFF5EC' : '#fff' },
  frame: { flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? WEB_MAX_WIDTH : undefined, overflow: 'hidden', backgroundColor: '#fff' },
});
