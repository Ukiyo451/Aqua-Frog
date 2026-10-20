/**
 * Healthy challenges. Each lasts a fixed number of days; the person finishes their goal
 * every day while following the rules, and earns the matching challenge frog.
 */
export interface Challenge {
  id: string;
  title: string;
  /** e.g. "10-DAY CHALLENGE" */
  days: number;
  /** Card colour. */
  color: string;
  /** Darker shade for buttons on the card. */
  deep: string;
  tagline: string;
  intro: string;
  benefits: { emoji: string; text: string }[];
  tips: string[];
  /** Character unlocked by finishing it. */
  characterId: string;
  /** Drinks that break the challenge's rules (ids from the drinks catalog). */
  avoid?: string[];
  /** Limited-time challenges show in their own banner on the home screen. */
  limited?: boolean;
}

// Content is filled in by the challenges feature (src/screens/challenges).
export const CHALLENGES: Challenge[] = [];

export function challengeById(id: string | undefined): Challenge | undefined {
  return CHALLENGES.find((x) => x.id === id);
}
