import type { ScreenComponent } from '../../navigation/nav';
import { HydrationInfoScreen } from './Article';
import { DrinkEditScreen } from './DrinkEdit';
import { DrinkOrderScreen } from './DrinkOrder';
import { DrinkPreviewScreen } from './DrinkPreview';
import { DrinksListScreen } from './DrinksList';

export const screens: Record<string, ScreenComponent> = {
  drinks: DrinksListScreen,
  drinkOrder: DrinkOrderScreen,
  drinkEdit: DrinkEditScreen,
  hydrationInfo: HydrationInfoScreen,
  drinkPreview: DrinkPreviewScreen,
};
