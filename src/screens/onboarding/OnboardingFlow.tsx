import { ReactElement, useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { WaveWipe } from '../../components/effects';
import { useStore } from '../../lib/store';
import { Analyzing } from './Analyzing';
import { FeelBest } from './FeelBest';
import { FirstSip } from './FirstSip';
import { Goal } from './Goal';
import { Paywall } from './Paywall';
import { Reminders } from './Reminders';
import { Splash } from './Splash';
import { Welcome } from './Welcome';

const STEPS = ['splash', 'welcome', 'firstSip', 'reminders', 'goal', 'feelBest', 'analyzing', 'paywall'] as const;
type Step = (typeof STEPS)[number];

export function OnboardingFlow({ initialStep = 'splash' }: { initialStep?: Step }) {
  const { update } = useStore();
  const [step, setStep] = useState<Step>(initialStep);
  const [wiping, setWiping] = useState(false);

  const current = useRef(step);
  current.current = step;

  const next = useCallback(() => {
    const s = current.current;
    if (s === 'reminders') {
      // water floods the screen first; the goal page appears under it
      setWiping(true);
      return;
    }
    const i = STEPS.indexOf(s);
    if (i === STEPS.length - 1) update({ onboarded: true });
    else setStep(STEPS[i + 1]);
  }, [update]);

  const screens: Record<Step, ReactElement> = {
    splash: <Splash onNext={next} />,
    welcome: <Welcome onNext={next} />,
    firstSip: <FirstSip onNext={next} />,
    reminders: <Reminders onNext={next} />,
    goal: <Goal onNext={next} />,
    feelBest: <FeelBest onNext={next} />,
    analyzing: <Analyzing onNext={next} />,
    paywall: <Paywall onNext={next} />,
  };
  const slide = step === 'feelBest' || step === 'paywall';

  return (
    <View style={styles.root}>
      <Animated.View
        key={step}
        style={StyleSheet.absoluteFill}
        entering={slide ? SlideInRight.springify().damping(18) : FadeIn.duration(350)}
        exiting={slide ? SlideOutLeft.duration(300) : FadeOut.duration(250)}
      >
        {screens[step]}
      </Animated.View>
      {wiping && <WaveWipe onCovered={() => setStep('goal')} onDone={() => setWiping(false)} />}
    </View>
  );
}

export type { Step as OnboardingStep };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
});
