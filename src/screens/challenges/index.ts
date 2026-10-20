import type { ScreenComponent } from '../../navigation/nav';
import { ChallengeDetail } from './ChallengeDetail';
import { ChallengeShare } from './ChallengeShare';
import { ChallengeStarted } from './ChallengeStarted';

export { ActiveChallengePill, ChallengeSection } from './HomeSection';
export { activeProgress, breaksRules, challengeWarning, limitedWindow, useChallengeWatcher, useWarnIfBreaksChallenge } from './progress';
export type { ChallengeProgress, ChallengeStatus } from './progress';

export const screens: Record<string, ScreenComponent> = {
  challenge: ChallengeDetail,
  challengeStarted: ChallengeStarted,
  challengeShare: ChallengeShare,
};
