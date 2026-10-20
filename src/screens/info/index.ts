import type { ScreenComponent } from '../../navigation/nav';
import { BackupScreen } from './Backup';
import { DeviceSyncScreen } from './DeviceSync';
import { DonateScreen } from './Donate';
import { FaqScreen, HelpScreen } from './Help';
import { HealthScreen } from './Health';
import { HydrateFriendsScreen } from './HydrateFriends';
import { OtherAppsScreen } from './OtherApps';
import { PremiumScreen } from './Premium';
import { SubscriptionScreen } from './Subscription';
import { TermsScreen } from './Terms';
import { WatchScreen } from './Watch';
import { WhatsNewScreen } from './WhatsNew';
import { WidgetsScreen } from './Widgets';

export { SupporterCard } from './Donate';

export const screens: Record<string, ScreenComponent> = {
  widgets: WidgetsScreen,
  watch: WatchScreen,
  health: HealthScreen,
  deviceSync: DeviceSyncScreen,
  backup: BackupScreen,
  help: HelpScreen,
  faq: FaqScreen,
  whatsNew: WhatsNewScreen,
  terms: TermsScreen,
  donate: DonateScreen,
  otherApps: OtherAppsScreen,
  subscription: SubscriptionScreen,
  premium: PremiumScreen,
  hydrateFriends: HydrateFriendsScreen,
};
