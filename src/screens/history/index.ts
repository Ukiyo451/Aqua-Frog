import type { ScreenComponent } from '../../navigation/nav';
import { CalendarScreen } from './Calendar';
import { CelebrateScreen } from './Celebrate';

export { CelebrateButton } from './CelebrateButton';
export { LayeredFrog } from './LayeredFrog';
export { goalDayTitle } from './titles';

export const screens: Record<string, ScreenComponent> = {
  calendar: CalendarScreen,
  celebrate: CelebrateScreen,
};
