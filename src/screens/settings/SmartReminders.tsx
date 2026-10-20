import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Bounce } from '../../components/Pressable';
import { formatTime, ListRow, Paragraph, PickerSheet, Screen, SectionLabel, Subtitle, TimeWheels, Title } from '../../components/ui';
import { useStore } from '../../lib/store';
import { colors, fonts } from '../../theme';
import { INTERVALS, useReminderControl } from './common';
import { NOTIFICATION_SOUNDS, previewSound } from './sounds';

type Which = 'from' | 'until' | null;

function BigTime({ label, value, onPress, testID }: { label: string; value: number; onPress: () => void; testID: string }) {
  return (
    <View style={styles.timeBlock}>
      <Text style={styles.timeLabel}>{label}</Text>
      <Bounce onPress={onPress} testID={testID} scaleTo={0.94}>
        <Animated.Text key={value} entering={ZoomIn.springify().damping(13)} style={styles.time}>
          {formatTime(value)}
        </Animated.Text>
      </Bounce>
    </View>
  );
}

export function SmartRemindersScreen() {
  const { state } = useStore();
  const { setReminders, dialog } = useReminderControl();
  const r = state.reminders;
  const [which, setWhich] = useState<Which>(null);
  const [draft, setDraft] = useState(0);

  const open = (w: Exclude<Which, null>) => {
    setDraft(w === 'from' ? r.fromMin : r.untilMin);
    setWhich(w);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen testID="screen-smartReminders">
        <Title>Smart Reminders</Title>
        <Subtitle>Remind me if I forget to drink for:</Subtitle>
        {INTERVALS.map((it, i) => (
          <Animated.View key={it.min} entering={FadeInDown.delay(60 + i * 40).springify().damping(16)}>
            <ListRow
              label={it.label}
              labelStyle={styles.upper}
              selected={r.intervalMin === it.min}
              chevron={false}
              onPress={() => setReminders({ intervalMin: it.min, mode: 'smart' })}
              testID={`interval-${it.min}`}
            />
          </Animated.View>
        ))}

        <Animated.View entering={FadeIn.delay(260)}>
          <BigTime label="From:" value={r.fromMin} onPress={() => open('from')} testID="time-from" />
          <BigTime label="Until:" value={r.untilMin} onPress={() => open('until')} testID="time-until" />
        </Animated.View>

        <SectionLabel style={styles.center}>Notification sound</SectionLabel>
        {NOTIFICATION_SOUNDS.map((name, i) => (
          <Animated.View key={name} entering={FadeInDown.delay(320 + i * 35).springify().damping(16)}>
            <ListRow
              label={name}
              selected={r.sound === name}
              chevron={false}
              onPress={() => {
                previewSound(name);
                setReminders({ sound: name });
              }}
              testID={`sound-${name.toLowerCase().replace(/\s+/g, '-')}`}
            />
          </Animated.View>
        ))}

        <Paragraph style={styles.note}>
          Smart Reminders keep a steady rhythm through your day. Pick how long you can go without a sip, and Lily taps you on the shoulder at that
          interval, starting at your From time. With 2 hours and 8:00 AM, you'll hear from her at 8, 10, 12 and so on. After your Until time she goes
          quiet, so your evenings and nights stay peaceful.
        </Paragraph>
      </Screen>

      <PickerSheet
        visible={which !== null}
        title={which === 'from' ? 'From:' : 'Until:'}
        onClose={() => setWhich(null)}
        onDone={() => {
          setReminders(which === 'from' ? { fromMin: draft } : { untilMin: draft });
          setWhich(null);
        }}
      >
        {which !== null && <TimeWheels key={which} value={draft} onChange={setDraft} minuteStep={5} />}
      </PickerSheet>
      {dialog}
    </View>
  );
}

const styles = StyleSheet.create({
  upper: { fontFamily: fonts.extra, fontSize: 15, letterSpacing: 0.3 },
  timeBlock: { alignItems: 'center', marginTop: 18 },
  timeLabel: { fontFamily: fonts.extra, fontSize: 14, color: colors.muted, marginBottom: 2 },
  time: { fontFamily: fonts.extra, fontSize: 38, color: colors.water, paddingHorizontal: 12 },
  center: { textAlign: 'center', marginTop: 30, marginBottom: 12, letterSpacing: 0, fontSize: 14, fontFamily: fonts.extra },
  note: { fontFamily: fonts.semibold, fontSize: 14, color: colors.muted, lineHeight: 21, marginTop: 18, paddingHorizontal: 6 },
});
