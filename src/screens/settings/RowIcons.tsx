import { StyleSheet } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type RowIconName =
  | 'drinks'
  | 'units'
  | 'sounds'
  | 'calendar'
  | 'widgets'
  | 'health'
  | 'watch'
  | 'sync'
  | 'backup'
  | 'icon'
  | 'language'
  | 'help'
  | 'donate'
  | 'apps';

const TILE: Record<RowIconName, string> = {
  drinks: '#14C6D6',
  units: '#7C6CF2',
  sounds: '#FF8A3D',
  calendar: '#FF5A6E',
  widgets: '#3D8BFF',
  health: '#FF4D8D',
  watch: '#2E3440',
  sync: '#22B573',
  backup: '#4AA8FF',
  icon: '#FFB627',
  language: '#2FBF9F',
  help: '#8A94A6',
  donate: '#F2577F',
  apps: '#5BC44D',
};

const W = { stroke: '#fff', strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function Glyph({ name }: { name: RowIconName }) {
  switch (name) {
    case 'drinks':
      return (
        <>
          <Path d="M6 4 H18 L16.4 20 H7.6 Z" {...W} />
          <Path d="M7 10 H17" {...W} />
        </>
      );
    case 'units':
      return (
        <>
          <Rect x={3} y={8} width={18} height={8} rx={2} {...W} />
          <Path d="M7 8 V11 M11 8 V12 M15 8 V11 M19 8 V12" {...W} strokeWidth={1.6} />
        </>
      );
    case 'sounds':
      return (
        <>
          <Path d="M4 9.5 H7.5 L12 5.5 V18.5 L7.5 14.5 H4 Z" {...W} fill="#fff" />
          <Path d="M15.5 9 Q17.5 12 15.5 15 M18 6.5 Q22 12 18 17.5" {...W} />
        </>
      );
    case 'calendar':
      return (
        <>
          <Rect x={4} y={5.5} width={16} height={14.5} rx={2.5} {...W} />
          <Path d="M4 10 H20 M8.5 3.5 V7 M15.5 3.5 V7" {...W} />
          <Circle cx={12} cy={15} r={1.6} fill="#fff" />
        </>
      );
    case 'widgets':
      return (
        <>
          <Rect x={4} y={4} width={7} height={7} rx={2} {...W} />
          <Rect x={13} y={4} width={7} height={7} rx={2} {...W} fill="#fff" />
          <Rect x={4} y={13} width={16} height={7} rx={2} {...W} />
        </>
      );
    case 'health':
      return <Path d="M12 19.5 C5 15 3.5 11.5 3.5 9 A4.2 4.2 0 0 1 12 7.2 A4.2 4.2 0 0 1 20.5 9 C20.5 11.5 19 15 12 19.5 Z" fill="#fff" />;
    case 'watch':
      return (
        <>
          <Rect x={6.5} y={6} width={11} height={12} rx={3} {...W} />
          <Path d="M9 6 L9.7 3 H14.3 L15 6 M9 18 L9.7 21 H14.3 L15 18" {...W} />
          <Path d="M12 9.5 V12 L13.6 13.2" {...W} strokeWidth={1.6} />
        </>
      );
    case 'sync':
      return (
        <>
          <Path d="M5 11 A7 7 0 0 1 17.5 7.5 M19 13 A7 7 0 0 1 6.5 16.5" {...W} />
          <Path d="M17.8 3.8 V7.8 H13.8 M6.2 20.2 V16.2 H10.2" {...W} />
        </>
      );
    case 'backup':
      return (
        <>
          <Path d="M7 18.5 H17 A4 4 0 0 0 17 10.5 A5.5 5.5 0 0 0 6.6 9.6 A4.5 4.5 0 0 0 7 18.5 Z" {...W} />
          <Path d="M12 16 V11.5 M10 13.3 L12 11.3 L14 13.3" {...W} strokeWidth={1.8} />
        </>
      );
    case 'icon':
      return <Path d="M12 3.5 L14.2 9.3 L20.5 9.6 L15.6 13.4 L17.3 19.5 L12 16 L6.7 19.5 L8.4 13.4 L3.5 9.6 L9.8 9.3 Z" fill="#fff" />;
    case 'language':
      return (
        <>
          <Circle cx={12} cy={12} r={8} {...W} />
          <Path d="M4 12 H20 M12 4 Q7.5 12 12 20 Q16.5 12 12 4" {...W} strokeWidth={1.7} />
        </>
      );
    case 'help':
      return (
        <>
          <Circle cx={12} cy={12} r={8} {...W} />
          <Path d="M9.6 9.6 A2.5 2.5 0 1 1 12.8 12 Q12 12.4 12 13.6" {...W} />
          <Circle cx={12} cy={16.6} r={1.2} fill="#fff" />
        </>
      );
    case 'donate':
      return (
        <>
          <Rect x={4} y={9} width={16} height={11} rx={2} {...W} />
          <Path d="M3 9 H21 M12 9 V20 M12 9 Q8 3.5 6.8 6.5 Q6.2 9 12 9 Q16 3.5 17.2 6.5 Q17.8 9 12 9" {...W} strokeWidth={1.8} />
        </>
      );
    case 'apps':
      return (
        <>
          <Circle cx={8} cy={8} r={3} fill="#fff" />
          <Circle cx={16} cy={8} r={3} {...W} />
          <Circle cx={8} cy={16} r={3} {...W} />
          <Circle cx={16} cy={16} r={3} fill="#fff" />
        </>
      );
  }
}

/** A coloured rounded tile with a white glyph, popping in after its row. */
export function RowIcon({ name, delay = 0 }: { name: RowIconName; delay?: number }) {
  return (
    <Animated.View entering={ZoomIn.delay(delay).springify().damping(12).stiffness(200)} style={[styles.tile, { backgroundColor: TILE[name] }]}>
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Glyph name={name} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
