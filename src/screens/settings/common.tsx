import { useEffect, useState } from 'react';
import Animated, { Easing, useAnimatedProps, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { Dialog } from '../../components/ui';
import { ReminderSettings, useStore } from '../../lib/store';
import { scheduleReminders } from './scheduling';

export const INTERVALS = [
  { min: 30, label: '30 MIN', short: '30 min' },
  { min: 60, label: '1 HOUR', short: '1h' },
  { min: 90, label: '1 HOUR 30 MIN', short: '1h 30m' },
  { min: 120, label: '2 HOURS', short: '2h' },
];

/** "8 AM", or "8:30 AM" when the minutes matter. */
export function hourLabel(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h24 < 12 ? 'AM' : 'PM'}`;
}

export function smartSummary(r: ReminderSettings): string {
  const short = INTERVALS.find((i) => i.min === r.intervalMin)?.short ?? `${r.intervalMin} min`;
  return `If you forget for ${short}, ${hourLabel(r.fromMin)} - ${hourLabel(r.untilMin)}`;
}

/**
 * Turns reminders on/off and changes their settings, keeping the scheduled notifications
 * in step. Render `dialog` somewhere at the page root.
 */
export function useReminderControl() {
  const { state, update } = useStore();
  const [denied, setDenied] = useState(false);

  const setOn = async (on: boolean) => {
    if (!on) {
      update({ remindersOn: false });
      scheduleReminders(state.reminders, false);
      return;
    }
    const ok = await scheduleReminders(state.reminders, true);
    if (ok) update({ remindersOn: true });
    else setDenied(true);
  };

  const setReminders = (patch: Partial<ReminderSettings>) => {
    const next = { ...state.reminders, ...patch };
    update({ reminders: next });
    if (state.remindersOn) scheduleReminders(next, true);
  };

  const dialog = (
    <Dialog
      visible={denied}
      title="Notifications are off"
      message="Lily can't nudge you without permission. Allow notifications for Lily in your phone's Settings, then try again."
      actions={[{ label: 'OK' }]}
      onClose={() => setDenied(false)}
    />
  );

  return { setOn, setReminders, dialog };
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** A strip of water whose top edge rolls gently from side to side. */
export function Wave({ width, height, color, amp = 8, period = 5200, phase = 0, crest = 20 }: { width: number; height: number; color: string; amp?: number; period?: number; phase?: number; crest?: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(Math.PI * 2, { duration: period, easing: Easing.linear }), -1);
  }, [t, period]);
  const props = useAnimatedProps(() => {
    const p = t.value + phase;
    let d = `M0 ${height}`;
    for (let x = 0; x <= width + 10; x += 10) {
      d += ` L${x} ${crest + Math.sin(x / (width / 3.2) + p) * amp + Math.sin(x / (width / 7) - p * 2) * amp * 0.25}`;
    }
    return { d: `${d} L${width + 10} ${height} Z` };
  });
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }} pointerEvents="none">
      <AnimatedPath animatedProps={props} fill={color} />
    </Svg>
  );
}

export interface FaceColors {
  body: string;
  dark: string;
  cheek?: string;
}

/** A flat frog face in a 100x100 box, for icons and badges. Place inside an Svg. */
export function FrogFaceShape({ c, x = 0, y = 0, s = 1 }: { c: FaceColors; x?: number; y?: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Circle cx={30} cy={36} r={17} fill={c.body} />
      <Circle cx={70} cy={36} r={17} fill={c.body} />
      <Ellipse cx={50} cy={60} rx={40} ry={27} fill={c.body} />
      <Circle cx={30} cy={35} r={10} fill="#fff" />
      <Circle cx={70} cy={35} r={10} fill="#fff" />
      <Circle cx={32} cy={36} r={5.5} fill="#1E2430" />
      <Circle cx={68} cy={36} r={5.5} fill="#1E2430" />
      <Circle cx={34} cy={33.5} r={1.8} fill="#fff" />
      <Circle cx={70} cy={33.5} r={1.8} fill="#fff" />
      <Path d="M36 63 Q50 74 64 63" stroke={c.dark} strokeWidth={4} fill="none" strokeLinecap="round" />
      {c.cheek ? (
        <>
          <Ellipse cx={24} cy={64} rx={6} ry={3.5} fill={c.cheek} opacity={0.8} />
          <Ellipse cx={76} cy={64} rx={6} ry={3.5} fill={c.cheek} opacity={0.8} />
        </>
      ) : null}
    </G>
  );
}

export const GREEN_FACE: FaceColors = { body: '#7ED957', dark: '#3F9A35', cheek: '#FF8DBE' };
