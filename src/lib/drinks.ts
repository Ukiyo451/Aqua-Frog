import { colors } from '../theme';

/** How a drink's cup is drawn in the drinks row, the lists and the pour overlay. */
export type CupShape = 'glass' | 'bottle' | 'mug' | 'cup' | 'takeaway' | 'tall' | 'wine' | 'martini' | 'shot' | 'can' | 'bowl' | 'jar';

export interface Drink {
  id: string;
  label: string;
  /** Liquid colour. */
  color: string;
  /** Pale glass/cup colour behind the liquid. */
  glass: string;
  shape: CupShape;
  /** Share of the volume that counts toward hydration (can be negative for alcohol). */
  hydration: number;
  /** Caffeine in mg per 250ml. */
  caffeine: number;
  /** Default cup size in ml. */
  size: number;
  custom?: boolean;
}

const d = (id: string, label: string, color: string, glass: string, shape: CupShape, hydration: number, size: number, caffeine = 0): Drink => ({
  id,
  label,
  color,
  glass,
  shape,
  hydration,
  caffeine,
  size,
});

/** Every built-in drink, in the default order of the Add/Edit Drinks list. */
export const CATALOG: Drink[] = [
  d('water', 'WATER', colors.water, '#BFF1F6', 'glass', 1, 250),
  d('sparkling', 'SPARKLING WATER', '#39B6E8', '#CDEEFB', 'bottle', 1, 500),
  d('coconut', 'COCONUT WATER', '#E7E3D8', '#F6F4EE', 'bowl', 0.9, 330),
  d('blackTea', 'BLACK TEA', '#6B4A2B', '#E9DED2', 'mug', 0.9, 300, 47),
  d('tea', 'GREEN TEA', '#8CC63F', '#E1F2C8', 'mug', 0.9, 300, 25),
  d('herbal', 'HERBAL TEA', '#C9D45A', '#F1F4D2', 'mug', 0.9, 300),
  d('matcha', 'MATCHA', '#6FBF4A', '#DDF0D2', 'cup', 0.9, 250, 25),
  d('coffee', 'COFFEE', '#8B5A3C', '#EADBD0', 'takeaway', 0.6, 250, 100),
  d('decaf', 'DECAF COFFEE', '#9C6B4E', '#EFE2D8', 'takeaway', 0.9, 250, 3),
  d('latte', 'LATTE', '#B98563', '#F3E6DC', 'cup', 0.6, 250, 77),
  d('cappuccino', 'CAPPUCCINO', '#A8724F', '#F1E3D9', 'cup', 0.6, 150, 110),
  d('cocoa', 'HOT CHOCOLATE', '#6E3B2A', '#EADAD3', 'mug', 0.8, 250, 5),
  d('juice', 'JUICE', '#FFAA2B', '#FFE9C4', 'tall', 0.95, 250),
  d('lemonade', 'LEMONADE', '#F5D33F', '#FCF3C6', 'tall', 0.9, 250),
  d('smoothie', 'SMOOTHIE', '#E5527A', '#FADCE5', 'jar', 0.7, 250),
  d('milkshake', 'MILKSHAKE', '#F29BC1', '#FCE3EE', 'tall', 0.8, 250),
  d('milk', 'MILK', '#DCE3F0', '#F3F6FB', 'bottle', 1.3, 200),
  d('skimMilk', 'SKIM MILK', '#C9CFE6', '#EEF0F8', 'bottle', 0.91, 500),
  d('almondMilk', 'ALMOND MILK', '#D8C3A8', '#F4EDE4', 'bottle', 0.9, 500),
  d('oatMilk', 'OAT MILK', '#DCD3BF', '#F5F2EA', 'bottle', 0.89, 500),
  d('soyMilk', 'SOY MILK', '#C8C2E8', '#EEECF9', 'bottle', 0.9, 500),
  d('yogurt', 'YOGURT', '#F1B7D4', '#FBE9F2', 'jar', 0.7, 500),
  d('soup', 'SOUP', '#C98A4B', '#F2E2D1', 'bowl', 0.6, 300),
  d('soda', 'SODA', '#C2373D', '#F6D5D6', 'can', 0.85, 330, 34),
  d('energy', 'ENERGY DRINK', '#3554C9', '#D6DDF6', 'can', 0.85, 250, 80),
  d('sports', 'SPORTS DRINK', '#36C4A8', '#D1F3EC', 'bottle', 1.1, 500),
  d('beer', 'BEER', '#F2BE32', '#FCEFC6', 'tall', -0.6, 330),
  d('wine', 'RED WINE', '#9C2530', '#F1D3D6', 'wine', -0.95, 150),
  d('whiteWine', 'WHITE WINE', '#E8D77A', '#F8F2D4', 'wine', -0.95, 150),
  d('cocktail', 'COCKTAIL', '#F07A9B', '#FCE0E8', 'martini', -1.5, 150),
  d('liquor', 'STRONG LIQUOR', '#D3954A', '#F5E5D0', 'shot', -3.18, 50),
];

export const CATALOG_BY_ID: Record<string, Drink> = Object.fromEntries(CATALOG.map((x) => [x.id, x]));

/** Drinks shown on the home screen before the person edits the list. */
export const DEFAULT_ENABLED = ['water', 'tea', 'coffee', 'juice'];

/** Colours offered when creating a drink. */
export const DRINK_COLORS = ['#6A4FD9', '#4E8FEA', '#3FC1C9', '#4FCB7B', '#A5C93A', '#D9C33B', '#E79A2E', '#E5527A', '#C2373D', '#8B5A3C'];

/** A pale tint of a colour for its glass. */
export function glassFor(color: string): string {
  const n = parseInt(color.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.78);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Kept for the onboarding first sip and older call sites.
export type DrinkKind = 'water' | 'tea' | 'coffee' | 'juice';
export const DRINKS: Record<DrinkKind, Drink> = {
  water: CATALOG_BY_ID.water,
  tea: CATALOG_BY_ID.tea,
  coffee: CATALOG_BY_ID.coffee,
  juice: CATALOG_BY_ID.juice,
};
