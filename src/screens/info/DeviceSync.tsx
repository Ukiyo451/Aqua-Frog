import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ListRow, Screen, Title, ToggleRow } from '../../components/ui';
import { useStore } from '../../lib/store';
import { useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { BigPill, formatStamp, useSimulatedTask } from './common';

const WHILE = [
  ['📵', 'Leave the sync switch alone on your other devices until this one is done'],
  ['📶', 'Stay connected to the internet the whole time'],
  ['📱', 'Keep Lily open and on screen'],
];
const LATER = [
  ['🔁', 'Keep the switch on. Tap “Sync All Data” on one device, wait for it to finish, then do the same on the other'],
  ['👤', 'Check that every device is signed in to the same account'],
  ['💌', 'Still stuck? Write to us at hello@lily-app.example and we’ll help'],
];

export function DeviceSyncScreen() {
  const { state, update } = useStore();
  const nav = useNav();
  const on = state.settings.syncDevices;
  const last = state.settings.lastSyncAt;
  const sync = useSimulatedTask(3000);
  const run = () =>
    sync.start(() => {
      update((s) => ({ settings: { ...s.settings, lastSyncAt: Date.now() } }));
      nav.toast('All your devices are up to date');
    });

  return (
    <View style={{ flex: 1 }}>
      <Screen testID="deviceSync">
        <Animated.View entering={FadeInDown.springify()}>
          <Title>Sync between devices</Title>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(70).springify()}>
          <ToggleRow label="SYNC YOUR DATA" value={on} onChange={(syncDevices) => update((s) => ({ settings: { ...s.settings, syncDevices } }))} testID="sync-toggle" />
          <ListRow look="line" label="LAST SYNC TIME" right={<Animated.Text key={last ?? 0} entering={FadeIn.duration(400)} style={[styles.value, !!last && { color: colors.inkSoft }]}>{last ? formatStamp(last) : '-----'}</Animated.Text>} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(140).springify()} style={{ marginVertical: 26 }}>
          <BigPill label="SYNC ALL DATA" color={colors.ink} disabled={!on} onPress={run} testID="sync-run" />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(210).springify()}>
          <Text style={styles.head}>While a sync is running:</Text>
          {WHILE.map(([e, t]) => (
            <Text key={t} style={styles.tip}>
              {e} {t}
            </Text>
          ))}
          <Text style={[styles.head, { marginTop: 18 }]}>If syncing stops working later on:</Text>
          {LATER.map(([e, t]) => (
            <Text key={t} style={styles.tip}>
              {e} {t}
            </Text>
          ))}
        </Animated.View>
      </Screen>
      {sync.hud}
    </View>
  );
}

const styles = StyleSheet.create({
  value: { fontFamily: fonts.black, fontSize: 13, color: colors.muted, letterSpacing: 0.5 },
  head: { fontFamily: fonts.semibold, fontSize: 16, color: colors.inkSoft, marginBottom: 4 },
  tip: { fontFamily: fonts.semibold, fontSize: 16, color: colors.inkSoft, lineHeight: 23, marginBottom: 2 },
});
