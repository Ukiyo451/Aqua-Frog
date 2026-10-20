import type { ScreenComponent } from '../../navigation/nav';
import { Characters } from './Characters';
import { CharacterReveal } from './Reveal';
import { Shuffle } from './Shuffle';

export const screens: Record<string, ScreenComponent> = {
  characters: Characters,
  shuffle: Shuffle,
  characterReveal: CharacterReveal,
};
