import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { ReminderSettings } from '../../lib/store';

const MESSAGES = [
  'Lily is thirsty! Time for a sip 🐸',
  'A glass of water now keeps the slump away 💧',
  'Hop to it, hydration hero!',
  'Your lily pad is drying out… drink up!',
  'Small sips, big difference. Grab some water.',
  'Water break! Lily is cheering you on.',
];

/** iOS keeps at most 64 pending notifications. */
const MAX_PENDING = 60;
const CHANNEL = 'reminders';

/** Minutes after midnight for each smart reminder, wrapping past midnight when until < from. */
export function smartTimes(s: ReminderSettings): number[] {
  const step = Math.max(15, s.intervalMin);
  const span = (s.untilMin - s.fromMin + 1440) % 1440 || 1440;
  const out: number[] = [];
  for (let m = 0; m <= span && out.length < MAX_PENDING; m += step) out.push((s.fromMin + m) % 1440);
  return out;
}

let queue: Promise<unknown> = Promise.resolve();

async function run(s: ReminderSettings, on: boolean): Promise<boolean> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!on) return true;
    let perm = await Notifications.getPermissionsAsync();
    if (!perm.granted && perm.canAskAgain !== false) perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) return false;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, { name: 'Water reminders', importance: Notifications.AndroidImportance.DEFAULT });
    }
    const times = s.mode === 'daily' ? [s.dailyAt] : smartTimes(s);
    for (let i = 0; i < times.length; i++) {
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Lily', body: MESSAGES[i % MESSAGES.length], sound: true },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: Math.floor(times[i] / 60),
          minute: times[i] % 60,
          channelId: Platform.OS === 'android' ? CHANNEL : undefined,
        },
      });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Replaces every scheduled reminder. With `on`, asks for permission first and resolves
 * false if it was refused. Calls run one after another so quick changes never interleave.
 */
export function scheduleReminders(settings: ReminderSettings, on: boolean): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(true);
  const next = queue.then(() => run(settings, on));
  queue = next.catch(() => {});
  return next;
}
