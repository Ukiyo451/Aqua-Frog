import { screens as challenges } from '../screens/challenges';
import { screens as characters } from '../screens/characters';
import { screens as drinks } from '../screens/drinks';
import { screens as history } from '../screens/history';
import { screens as info } from '../screens/info';
import { screens as settings } from '../screens/settings';
import type { ScreenComponent } from './nav';

/** Every screen that can be opened on top of Home, by name. */
export const SCREENS: Record<string, ScreenComponent> = {
  ...history,
  ...settings,
  ...info,
  ...drinks,
  ...characters,
  ...challenges,
};
