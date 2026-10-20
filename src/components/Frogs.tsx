import { useId } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Svg, { Defs, G, Mask, Rect } from 'react-native-svg';
import { Character, CHARACTER_BY_ID } from '../lib/characters';
import { AccessoryBack, AccessoryFront, HAT_ROOM, needsRoom } from './Accessories';
import { Lily, LilyProps, outline, VB_H, VB_W } from './Lily';

/** The Lily props that dress her up as character `c` (nothing for Lily herself). */
function looks(c: Character | undefined): Partial<LilyProps> {
  if (!c || c.id === 'lily') return {};
  return { palette: c.palette, accessory: c.accessory, accent: c.accent };
}

/** Any frog from the collection at full size; same props as Lily plus the character id. */
export function Frog({ id, ...props }: LilyProps & { id: string }) {
  return <Lily {...looks(CHARACTER_BY_ID[id])} {...props} />;
}

/** A frog's face for thumbnails, avatars and the home drink row. */
export function FrogAvatar({ id, size, style }: { id: string; size: number; style?: StyleProp<ViewStyle> }) {
  return <Lily {...looks(CHARACTER_BY_ID[id])} width={size} crop="face" idle={false} style={style} />;
}

/** A locked frog: just a thin pale outline of its shape, accessory included. */
export function FrogOutline({ id, size, color = '#BFE3E8' }: { id: string; size: number; color?: string }) {
  const c = CHARACTER_BY_ID[id];
  const maskId = `fo${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const still = useSharedValue(0);
  const room = needsRoom(c?.accessory) ? HAT_ROOM : 0;
  const height = (size * (VB_H + 12 + room)) / (VB_W + 12);
  // the stroke is centred on each edge, so half of it shows outside the shape
  const sw = (2 * 1.4 * VB_W) / size;
  const shape = (paint: string, stroke: number) => {
    const acc = c && c.accessory !== 'none' ? { kind: c.accessory, accent: paint, deep: paint, sway: still, uid: maskId, flat: paint } : undefined;
    return (
      <G stroke={stroke ? paint : undefined} strokeWidth={stroke || undefined} strokeLinejoin="round">
        {outline(paint)}
        {acc && <AccessoryBack {...acc} />}
        {acc && <AccessoryFront {...acc} />}
      </G>
    );
  };
  return (
    <View style={{ width: size, height }}>
      <Svg width={size} height={height} viewBox={`-6 ${-6 - room} ${VB_W + 12} ${VB_H + 12 + room}`}>
        <Defs>
          <Mask id={maskId} x={-10} y={-10 - room} width={VB_W + 20} height={VB_H + 20 + room} maskUnits="userSpaceOnUse">
            {shape('#fff', sw)}
            {shape('#000', 0)}
          </Mask>
        </Defs>
        <Rect x={-10} y={-10 - room} width={VB_W + 20} height={VB_H + 20 + room} fill={color} mask={`url(#${maskId})`} />
      </Svg>
    </View>
  );
}
