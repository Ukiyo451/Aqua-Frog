export type TopicIcon = 'lock' | 'calendar' | 'drop' | 'cup' | 'watch' | 'bell' | 'frog';

export interface FaqTopic {
  id: string;
  title: string;
  icon: TopicIcon;
  qas: { q: string; a: string }[];
}

export const FAQ: FaqTopic[] = [
  {
    id: 'purchases',
    title: 'In-app Purchases',
    icon: 'lock',
    qas: [
      {
        q: 'What does Premium unlock?',
        a: 'Premium opens every drink in the catalog, all healthy challenges, the full frog collection, custom drinks, editing past days and the Celebrate Your Day poster. You can see the whole list under Settings → Subscription.',
      },
      {
        q: 'Monthly or Lifetime?',
        a: 'Monthly is $3.99 a month and can be cancelled whenever you like. Lifetime is a single $8.99 payment and never renews. Both unlock exactly the same features.',
      },
      {
        q: 'My purchase didn’t unlock anything',
        a: 'Close Lily completely and open it again while you’re online. If Premium still looks locked, tap Restore Purchases at the bottom of Settings.',
      },
      {
        q: 'How do I cancel a subscription?',
        a: 'Subscriptions are managed by your phone’s app store, not by Lily. On iPhone open Settings → your name → Subscriptions; on Android open the Play Store → Payments & subscriptions. Premium stays on until the end of the period you paid for.',
      },
    ],
  },
  {
    id: 'history',
    title: 'Remove entries • Add missed drinks',
    icon: 'calendar',
    qas: [
      {
        q: 'How do I delete a drink I logged by mistake?',
        a: 'Open the Calendar, pick the day and tap the drink in the day’s log, then choose Delete. Lily’s fill level and your streak update straight away.',
      },
      {
        q: 'I forgot to log yesterday. Can I add it?',
        a: 'Yes. In the Calendar pick the missed day and tap Add drink. The drink is logged at the time you choose, and if it finishes that day’s goal your streak is repaired.',
      },
      {
        q: 'Why did my old days keep their old goal?',
        a: 'Lily remembers the goal that was set on each day, so changing your goal today doesn’t turn finished days into unfinished ones (or the other way round).',
      },
    ],
  },
  {
    id: 'hydration',
    title: 'Hydration • Goal • Oz/Ml units',
    icon: 'drop',
    qas: [
      {
        q: 'Why does coffee count for less than water?',
        a: 'Each drink has a hydration ratio. Water counts 100%, milk and juice a little less, coffee and tea less again, and alcohol can even take some away. The number on the home screen is the water your body actually gets.',
      },
      {
        q: 'How is my daily goal worked out?',
        a: 'The goal calculator starts from your weight and adds a bit for an active day or hot weather, with adjustments for pregnancy and breastfeeding. You can recalculate it or type your own number in Settings.',
      },
      {
        q: 'How do I switch between ml and oz?',
        a: 'Open Settings and change Units. Everything you logged before is converted, nothing is lost.',
      },
    ],
  },
  {
    id: 'drinks',
    title: 'Create drinks • Cup sizes',
    icon: 'cup',
    qas: [
      {
        q: 'Can I add my own drink?',
        a: 'Go to Settings → Add/Edit drinks list and tap Create drink. Give it a name, a colour, a cup size, how hydrating it is and how much caffeine it has.',
      },
      {
        q: 'How do I change a cup size?',
        a: 'In the drinks list tap any drink and change its size. The new size becomes the default every time you pour that drink.',
      },
      {
        q: 'How do I choose which drinks are on the home screen?',
        a: 'Switch drinks on or off in the drinks list and drag them into the order you like. The home row follows the same order.',
      },
    ],
  },
  {
    id: 'devices',
    title: 'Apple Watch • Sync other devices',
    icon: 'watch',
    qas: [
      {
        q: 'How do I use Lily on my watch?',
        a: 'Open Settings → Apple Watch, choose the frog or the list design for the watch home screen and tap Sync All Data.',
      },
      {
        q: 'My devices show different numbers',
        a: 'Make sure Sync between devices is switched on on each of them. Tap Sync All Data on one device, wait for it to finish, then do the same on the other.',
      },
      {
        q: 'How do I keep a copy of my data?',
        a: 'Settings → Backup saves your whole log, goals, drinks and frogs. You can restore that copy at any time from the same place.',
      },
    ],
  },
  {
    id: 'reminders',
    title: 'Reminders',
    icon: 'bell',
    qas: [
      {
        q: 'What’s the difference between the two kinds of reminder?',
        a: 'Once a day sends a single nudge at the time you pick. Smart reminders only ping you when you haven’t logged anything for a while, and only between the hours you choose.',
      },
      {
        q: 'I’m not getting any reminders',
        a: 'Check that Reminders are switched on in Settings and that notifications are allowed for Lily in your phone’s settings. Focus or Do Not Disturb modes can also hold them back.',
      },
      {
        q: 'Can I change the reminder sound?',
        a: 'Yes, pick a different sound under Settings → Reminders → Sound.',
      },
    ],
  },
  {
    id: 'characters',
    title: 'Characters • Challenges',
    icon: 'frog',
    qas: [
      {
        q: 'How do I collect new frogs?',
        a: 'Every day you reach your goal you earn one token. Spend it in the frog collection to welcome a new daily frog to the pond.',
      },
      {
        q: 'What are challenges?',
        a: 'Challenges are short healthy streaks, like going caffeine-free or swapping soda for water. Reach your goal every day while following the rules to win that challenge’s special frog.',
      },
      {
        q: 'What if I break a challenge rule?',
        a: 'Logging a drink the challenge asks you to skip ends the challenge. You can start it again whenever you’re ready.',
      },
      {
        q: 'Can Lily wear a different frog every day?',
        a: 'Turn on Shuffle in the collection and pick the frogs you like. A new one from your picks hops in each morning.',
      },
    ],
  },
];

export const FAQ_BY_ID: Record<string, FaqTopic> = Object.fromEntries(FAQ.map((t) => [t.id, t]));
