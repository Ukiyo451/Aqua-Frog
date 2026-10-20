import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const stroke = (color: string) => ({ stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

export function SexIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8.5} {...stroke(color)} />
      <Circle cx={9} cy={11} r={1} fill={color} />
      <Circle cx={15} cy={11} r={1} fill={color} />
      <Path d="M9 15 Q12 17.5 15 15" {...stroke(color)} />
    </Svg>
  );
}

export function ScaleIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3.5} y={4} width={17} height={16} rx={4} {...stroke(color)} />
      <Path d="M8 9 Q12 6 16 9 L13 11 L12 9.5" {...stroke(color)} />
    </Svg>
  );
}

export function ShoeIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 15 L5 7 Q8 9 10 8 L13 12 Q19 12 21 15 L21 17 L3 17 Z" {...stroke(color)} />
      <Path d="M8 10.5 L9.5 10 M10 12.5 L11.5 12" {...stroke(color)} />
    </Svg>
  );
}

export function SunCloudIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={9} cy={9} r={3.5} {...stroke(color)} />
      <Path d="M9 2.5 V3.5 M2.5 9 H3.5 M4.4 4.4 L5.1 5.1 M13.6 4.4 L12.9 5.1" {...stroke(color)} />
      <Path d="M8 19 H18 Q21 19 21 16 Q21 13 18 13 Q17 10 14 10.5 Q11.5 11 11.5 13.5 Q8 13.5 8 16.2 Q8 19 8 19 Z" {...stroke(color)} />
    </Svg>
  );
}

export function CheckIcon({ size = 14, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path d="M3 7.5 L6 10 L11 4" stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CrossIcon({ size = 12, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12">
      <Path d="M2.5 2.5 L9.5 9.5 M9.5 2.5 L2.5 9.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function ArrowIcon({ size = 18, color = '#5B6474' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path d="M3 9 H14 M9.5 4.5 L14 9 L9.5 13.5" stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function WavesIcon({ size = 18, color = '#5B6474' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      {[5, 9, 13].map((y) => (
        <Path key={y} d={`M2 ${y} Q4.5 ${y - 2} 7 ${y} T12 ${y} T16 ${y}`} stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      ))}
    </Svg>
  );
}

export function InfoIcon({ size = 12, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12">
      <Circle cx={6} cy={6} r={5.5} fill={color} opacity={0.6} />
      <Path d="M6 5.2 V9" stroke="#14C6D6" strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={6} cy={3.4} r={0.9} fill="#14C6D6" />
    </Svg>
  );
}
