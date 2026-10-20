import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bounce } from '../../components/Pressable';
import { Dialog } from '../../components/ui';
import { AppState, useStore } from '../../lib/store';
import { useNav } from '../../navigation/nav';
import { colors, fonts } from '../../theme';
import { BigPill, formatStamp, useSimulatedTask } from './common';

export const BACKUP_KEY = 'lily.backup.v1';

interface Snapshot {
  version: 1;
  at: number;
  state: AppState;
}

function countRecords(s: AppState): number {
  return Object.values(s.history).reduce((n, list) => n + list.length, 0);
}

function download(snap: Snapshot) {
  if (typeof document === 'undefined') return;
  const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lily-backup-${new Date(snap.at).toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Bottom card over the dimmed page: back up the whole store and restore it later. */
export function BackupScreen() {
  const { state, update } = useStore();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState<Snapshot | null>(null);
  const [dialog, setDialog] = useState<'success' | 'restore' | 'restored' | 'error' | null>(null);
  const task = useSimulatedTask(2200);
  const lift = useSharedValue(500);
  const dim = useSharedValue(0);

  useEffect(() => {
    lift.value = withSpring(0, { damping: 19, stiffness: 160 });
    dim.value = withTiming(1, { duration: 300 });
    AsyncStorage.getItem(BACKUP_KEY)
      .then((raw) => raw && setSaved(JSON.parse(raw)))
      .catch(() => {});
  }, [lift, dim]);

  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: lift.value }] }));
  const backdrop = useAnimatedStyle(() => ({ opacity: dim.value }));

  const backUp = () =>
    task.start(async () => {
      const at = Date.now();
      const snap: Snapshot = { version: 1, at, state: { ...state, settings: { ...state.settings, lastBackupAt: at } } };
      try {
        await AsyncStorage.setItem(BACKUP_KEY, JSON.stringify(snap));
        setSaved(snap);
        update((s) => ({ settings: { ...s.settings, lastBackupAt: at } }));
        setDialog('success');
      } catch {
        setDialog('error');
      }
    });

  const restore = () => {
    if (!saved) return;
    task.start(() => {
      update({ ...saved.state, day: state.day, settings: { ...saved.state.settings, lastBackupAt: saved.at } });
      setDialog('restored');
    });
  };

  const lastAt = saved?.at ?? state.settings.lastBackupAt;
  const title = Platform.OS === 'ios' ? 'iCloud Backup' : 'Backup';

  return (
    <View style={styles.root} testID="backup">
      <Animated.View style={[StyleSheet.absoluteFill, styles.dim, backdrop]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={nav.back} testID="backup-backdrop" />
      </Animated.View>
      <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 26 }, sheet]}>
        <Bounce onPress={nav.back} style={styles.done} testID="backup-done">
          <Text style={styles.doneText}>DONE</Text>
        </Bounce>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>
          Lily keeps a copy of your whole log, goals, drinks and frogs on this device. Back up before big changes, and restore it any time if something goes missing. Keep the app open until it finishes.
        </Text>
        <View style={styles.row}>
          <Animated.Text key={lastAt ?? 0} entering={FadeIn.duration(400)} style={styles.date}>
            {lastAt ? formatStamp(lastAt) : 'NO BACKUP YET'}
          </Animated.Text>
          <Text style={styles.records}>{countRecords(saved?.state ?? state)} records</Text>
        </View>
        <BigPill label="BACK UP NOW" color={colors.ink} onPress={backUp} testID="backup-now" style={{ marginTop: 22 }} />
        <View style={styles.links}>
          {saved && (
            <Animated.View entering={FadeIn}>
              <Bounce onPress={() => setDialog('restore')} testID="backup-restore">
                <Text style={styles.link}>RESTORE</Text>
              </Bounce>
            </Animated.View>
          )}
          {saved && Platform.OS === 'web' && (
            <Bounce onPress={() => download(saved)} testID="backup-download">
              <Text style={[styles.link, { color: colors.muted }]}>Download a copy</Text>
            </Bounce>
          )}
        </View>
      </Animated.View>
      {task.hud}
      <Dialog visible={dialog === 'success'} title="Success!" message={`${countRecords(state)} records are safe.`} actions={[{ label: 'OK' }]} onClose={() => setDialog(null)} />
      <Dialog visible={dialog === 'error'} title="Backup failed" message="There was no room to save the copy. Please try again." actions={[{ label: 'OK' }]} onClose={() => setDialog(null)} />
      <Dialog visible={dialog === 'restored'} title="Restored" message="Your data is back the way it was." actions={[{ label: 'OK' }]} onClose={() => setDialog(null)} />
      <Dialog
        visible={dialog === 'restore'}
        title="Restore backup?"
        message={saved ? `Everything will go back to ${formatStamp(saved.at)}. Drinks logged since then will be replaced.` : undefined}
        actions={[
          { label: 'Cancel', style: 'cancel' },
          { label: 'Restore', style: 'destructive', onPress: () => setTimeout(restore, 200) },
        ]}
        onClose={() => setDialog(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  dim: { backgroundColor: 'rgba(30,36,48,0.45)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 30, paddingHorizontal: 22 },
  done: { position: 'absolute', right: 18, top: 14, padding: 6, zIndex: 2 },
  doneText: { fontFamily: fonts.black, fontSize: 12, color: colors.muted, letterSpacing: 0.8 },
  title: { fontFamily: fonts.extra, fontSize: 28, color: colors.ink, textAlign: 'center', marginTop: 6 },
  body: { fontFamily: fonts.semibold, fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingVertical: 16, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#E4E6EA' },
  date: { fontFamily: fonts.black, fontSize: 14, color: colors.ink, letterSpacing: 0.4 },
  records: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 26, marginTop: 14, minHeight: 24 },
  link: { fontFamily: fonts.black, fontSize: 13, color: colors.water, letterSpacing: 0.8, padding: 4 },
});
