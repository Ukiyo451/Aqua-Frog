import { StyleProp, ViewStyle } from 'react-native';
import { CHARACTER_BY_ID } from '../lib/characters';
import { Lily, LilyProps } from './Lily';

/** Any frog from the collection at full size; same props as Lily plus the character id. */
export function Frog({ id, ...props }: LilyProps & { id: string }) {
  void CHARACTER_BY_ID[id];
  return <Lily {...props} />;
}

/** A frog's face for thumbnails, avatars and the home drink row. */
export function FrogAvatar({ id, size, style }: { id: string; size: number; style?: StyleProp<ViewStyle> }) {
  void CHARACTER_BY_ID[id];
  return <Lily width={size} crop="face" idle={false} style={style} />;
}
