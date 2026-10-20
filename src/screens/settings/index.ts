import type { ScreenComponent } from '../../navigation/nav';
import { AppIconScreen } from './AppIcon';
import { GoalCalculatorScreen } from './GoalCalculator';
import { SettingsScreen } from './Settings';
import { LanguageScreen, SoundsScreen, WeekStartScreen } from './Simple';
import { SmartRemindersScreen } from './SmartReminders';

export { AppIconTile } from './AppIcon';
export { scheduleReminders } from './scheduling';
export { playSound, previewSound, setSoundsEnabled } from './sounds';
export type { SoundKind } from './sounds';

export const screens: Record<string, ScreenComponent> = {
  settings: SettingsScreen,
  smartReminders: SmartRemindersScreen,
  goalCalculator: GoalCalculatorScreen,
  weekStart: WeekStartScreen,
  sounds: SoundsScreen,
  language: LanguageScreen,
  appIcon: AppIconScreen,
};
