export type Units = 'ml' | 'oz';
export type Sex = 'male' | 'female' | 'pregnant' | 'breastfeeding' | 'none';
export type Activity = 'low' | 'medium' | 'high';
export type Climate = 'cold' | 'temperate' | 'warm' | 'hot';

export interface Profile {
  sex?: Sex;
  weightKg?: number;
  weightUnit: 'kg' | 'lbs';
  activity?: Activity;
  climate?: Climate;
}

export const ML_PER_OZ = 29.5735;
export const DEFAULT_GOAL_ML = 2000;

export function toDisplay(ml: number, units: Units): number {
  return units === 'ml' ? Math.round(ml) : Math.round(ml / ML_PER_OZ);
}

export function fromDisplay(value: number, units: Units): number {
  return units === 'ml' ? value : value * ML_PER_OZ;
}

export function formatAmount(ml: number, units: Units): string {
  return `${toDisplay(ml, units)}${units}`;
}

/**
 * A simple daily-goal estimate: ~26ml per kg of body weight, adjusted for activity,
 * climate and sex. The defaults land on the familiar 2000ml "common goal".
 */
export function calculateGoal(p: Profile): number {
  const weight = p.weightKg ?? 68;
  let ml = weight * 26;
  ml += { low: 0, medium: 230, high: 480 }[p.activity ?? 'medium'];
  ml += { cold: -200, temperate: 0, warm: 250, hot: 500 }[p.climate ?? 'temperate'];
  const sex = p.sex ?? 'male';
  if (sex === 'female') ml *= 0.9;
  if (sex === 'pregnant') ml = ml * 0.9 + 300;
  if (sex === 'breastfeeding') ml = ml * 0.9 + 700;
  return Math.round(ml / 10) * 10;
}

export function todayKey(d = new Date()): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
