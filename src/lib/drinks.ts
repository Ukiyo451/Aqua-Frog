import { colors } from '../theme';

export type DrinkKind = 'water' | 'tea' | 'coffee' | 'juice';

export interface Drink {
  kind: DrinkKind;
  label: string;
  color: string;
  glass: string;
  /** Share of the volume that counts toward hydration. */
  hydration: number;
}

export const DRINKS: Record<DrinkKind, Drink> = {
  water: { kind: 'water', label: 'WATER', color: colors.water, glass: '#BFF1F6', hydration: 1 },
  tea: { kind: 'tea', label: 'GREEN TEA', color: '#8CC63F', glass: '#E1F2C8', hydration: 0.95 },
  coffee: { kind: 'coffee', label: 'COFFEE', color: '#8B5A3C', glass: '#EADBD0', hydration: 0.8 },
  juice: { kind: 'juice', label: 'JUICE', color: '#FFAA2B', glass: '#FFE9C4', hydration: 0.85 },
};
