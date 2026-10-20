import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const MESSAGES = [
  'Water reduces stress 💧',
  'Lily is thirsty! Time for a sip 🐸',
  'A glass now keeps the headache away',
  'Hop to it, hydration hero!',
  'Your lily pad is drying out… drink up!',
];

/** Asks for permission and schedules a gentle reminder every two hours from 9:00 to 21:00. */
export async function enableReminders(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const { granted } = await Notifications.requestPermissionsAsync();
    if (!granted) return false;
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (let hour = 9, i = 0; hour <= 21; hour += 2, i++) {
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Lily', body: MESSAGES[i % MESSAGES.length] },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute: 0 },
      });
    }
    return true;
  } catch {
    return false;
  }
}
