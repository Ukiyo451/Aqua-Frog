import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ListRow, Paragraph, Screen, Subtitle, Title, ToggleRow } from '../../components/ui';
import { useNav } from '../../navigation/nav';
import { useStore } from '../../lib/store';
import { colors, fonts } from '../../theme';
import { playSound, setSoundsEnabled } from './sounds';

export const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'pt', flag: '🇵🇹', name: 'Português' },
  { code: 'uk', flag: '🇺🇦', name: 'Українська' },
  { code: 'pl', flag: '🇵🇱', name: 'Polski' },
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'ja', flag: '🇯🇵', name: '日本語' },
  { code: 'ko', flag: '🇰🇷', name: '한국어' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'nl', flag: '🇳🇱', name: 'Nederlands' },
  { code: 'sv', flag: '🇸🇪', name: 'Svenska' },
];

export function languageFlag(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.flag ?? '🇬🇧';
}

export function WeekStartScreen() {
  const { state, update } = useStore();
  const value = state.weekStart ?? 'sunday';
  return (
    <Screen testID="screen-weekStart">
      <Title>Calendar</Title>
      <Subtitle>What's the first day of your week?</Subtitle>
      {(['sunday', 'monday'] as const).map((d, i) => (
        <Animated.View key={d} entering={FadeInDown.delay(80 + i * 60).springify().damping(16)}>
          <ListRow
            look="line"
            label={d.toUpperCase()}
            selected={value === d}
            chevron={false}
            onPress={() => {
              playSound('tap');
              update({ weekStart: d });
            }}
            testID={`week-${d}`}
          />
        </Animated.View>
      ))}
    </Screen>
  );
}

export function SoundsScreen() {
  const { state, update } = useStore();
  const on = state.settings.sounds;
  useEffect(() => setSoundsEnabled(on), [on]);
  return (
    <Screen testID="screen-sounds">
      <Title>App Sounds</Title>
      <Animated.View entering={FadeInDown.delay(80).springify().damping(16)} style={styles.topLine}>
        <ToggleRow
          label="ENABLE SOUNDS"
          value={on}
          onChange={(v) => {
            setSoundsEnabled(v);
            update((s) => ({ settings: { ...s.settings, sounds: v } }));
            if (v) playSound('sip');
          }}
          testID="toggle-sounds"
        />
      </Animated.View>
      <Animated.View entering={FadeIn.delay(200)}>
        <Paragraph style={styles.note}>
          Soft little sounds around the app: a plop when you log a drink, a happy jingle when you reach your goal, and gentle ticks as you tap around.
        </Paragraph>
      </Animated.View>
    </Screen>
  );
}

export function LanguageScreen() {
  const { state, update } = useStore();
  const nav = useNav();
  const current = state.settings.language;
  return (
    <Screen testID="screen-language">
      <Title>Language</Title>
      <View style={styles.topLine}>
        {LANGUAGES.map((l, i) => (
          <Animated.View key={l.code} entering={FadeInDown.delay(50 + i * 28).springify().damping(17)}>
            <ListRow
              look="line"
              label={l.name.toLocaleUpperCase(l.code)}
              left={<Text style={styles.flag}>{l.flag}</Text>}
              selected={current === l.code}
              chevron={false}
              onPress={() => {
                if (current === l.code) return;
                playSound('tap');
                update((s) => ({ settings: { ...s.settings, language: l.code } }));
                nav.toast(`Language set to ${l.name}`);
              }}
              testID={`lang-${l.code}`}
            />
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topLine: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E4E6EA', marginTop: 10 },
  note: { fontFamily: fonts.semibold, fontSize: 14, color: colors.muted, lineHeight: 20, marginTop: 14 },
  flag: { fontSize: 22 },
});
