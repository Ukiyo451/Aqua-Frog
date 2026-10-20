import { Platform } from 'react-native';

/**
 * Little synthesized app sounds. On web they're built with the Web Audio API; on native
 * this is a no-op until an audio library is added.
 */
export type SoundKind = 'sip' | 'goal' | 'tap' | 'chime';

export const NOTIFICATION_SOUNDS = ['Bamboo', 'Bike', 'Glass', 'Wood', 'Tune 1', 'Tune 2', 'Tune 3'];

let enabled = true;
let ctx: AudioContext | null = null;

/** Mirrors `settings.sounds`; call it whenever the setting changes. */
export function setSoundsEnabled(on: boolean) {
  enabled = on;
}

function audio(): AudioContext | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try {
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

interface Note {
  freq: number;
  /** Seconds from now. */
  at?: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
  /** Glide to this frequency over the note. */
  to?: number;
  attack?: number;
}

function tone(ac: AudioContext, out: AudioNode, { freq, at = 0, dur = 0.25, type = 'sine', gain = 0.18, to, attack = 0.006 }: Note) {
  const t = ac.currentTime + at;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur * 0.8);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** A bell-ish strike: a fundamental plus quieter inharmonic partials. */
function bell(ac: AudioContext, out: AudioNode, freq: number, at: number, dur = 1.2, gain = 0.12) {
  tone(ac, out, { freq, at, dur, gain });
  tone(ac, out, { freq: freq * 2.76, at, dur: dur * 0.5, gain: gain * 0.35 });
  tone(ac, out, { freq: freq * 5.4, at, dur: dur * 0.25, gain: gain * 0.15 });
}

const C5 = 523.25;
const semis = (n: number) => C5 * Math.pow(2, n / 12);

const CHIMES: Record<string, (ac: AudioContext, out: AudioNode) => void> = {
  Bamboo: (ac, out) => {
    tone(ac, out, { freq: 620, dur: 0.18, gain: 0.2, type: 'triangle', to: 560 });
    tone(ac, out, { freq: 930, at: 0.12, dur: 0.22, gain: 0.16, type: 'triangle', to: 840 });
  },
  Bike: (ac, out) => {
    bell(ac, out, 1760, 0, 0.5, 0.1);
    bell(ac, out, 1760, 0.16, 0.9, 0.1);
  },
  Glass: (ac, out) => {
    tone(ac, out, { freq: 1568, dur: 1.4, gain: 0.1 });
    tone(ac, out, { freq: 2352, dur: 0.9, gain: 0.05 });
    tone(ac, out, { freq: 3136, at: 0.02, dur: 0.5, gain: 0.03 });
  },
  Wood: (ac, out) => {
    tone(ac, out, { freq: 340, dur: 0.09, gain: 0.25, type: 'square', to: 300, attack: 0.002 });
    tone(ac, out, { freq: 460, at: 0.13, dur: 0.09, gain: 0.2, type: 'square', to: 410, attack: 0.002 });
  },
  'Tune 1': (ac, out) => [0, 4, 7].forEach((n, i) => bell(ac, out, semis(n), i * 0.14, 0.7, 0.09)),
  'Tune 2': (ac, out) => [7, 4, 9, 12].forEach((n, i) => tone(ac, out, { freq: semis(n), at: i * 0.12, dur: 0.35, gain: 0.12, type: 'triangle' })),
  'Tune 3': (ac, out) => [12, 7, 4, 7].forEach((n, i) => bell(ac, out, semis(n - 5), i * 0.18, 0.6, 0.08)),
};

function render(kind: SoundKind, name?: string) {
  const ac = audio();
  if (!ac) return;
  const out = ac.createGain();
  out.gain.value = 0.9;
  out.connect(ac.destination);
  switch (kind) {
    case 'sip':
      // a water "plop": a quick downward bubble followed by a tiny rebound
      tone(ac, out, { freq: 900, to: 220, dur: 0.14, gain: 0.22 });
      tone(ac, out, { freq: 520, to: 760, at: 0.09, dur: 0.1, gain: 0.08 });
      break;
    case 'goal':
      [0, 4, 7, 12, 16].forEach((n, i) => tone(ac, out, { freq: semis(n), at: i * 0.09, dur: 0.42, gain: 0.12, type: 'triangle' }));
      bell(ac, out, semis(24), 0.48, 1.1, 0.05);
      break;
    case 'tap':
      tone(ac, out, { freq: 1800, dur: 0.035, gain: 0.06, attack: 0.002 });
      break;
    case 'chime':
      (CHIMES[name ?? 'Bamboo'] ?? CHIMES.Bamboo)(ac, out);
      break;
  }
}

/** Plays an app sound if sounds are switched on. */
export function playSound(kind: SoundKind, name?: string) {
  if (!enabled) return;
  try {
    render(kind, name);
  } catch {
    // audio is best-effort
  }
}

/** Plays a notification sound preview regardless of the app-sounds switch. */
export function previewSound(name: string) {
  try {
    render('chime', name);
  } catch {
    // audio is best-effort
  }
}
