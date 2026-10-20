import { Dimensions, Platform } from 'react-native';

/**
 * On a desktop browser the app renders inside a phone-sized column, so every screen that
 * lays itself out from the window width sees a phone width rather than the whole monitor.
 * Imported first in index.ts, before any screen reads Dimensions.
 */
export const WEB_MAX_WIDTH = 430;

if (Platform.OS === 'web') {
  const get = Dimensions.get.bind(Dimensions);
  Dimensions.get = ((dim: 'window' | 'screen') => {
    const v = get(dim);
    return { ...v, width: Math.min(v.width, WEB_MAX_WIDTH) };
  }) as typeof Dimensions.get;
}
